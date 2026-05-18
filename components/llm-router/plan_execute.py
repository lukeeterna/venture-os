#!/usr/bin/env python3
"""
plan_execute.py — VOS Plan-and-Execute Engine (WAVE 3 P6, S181)
Esegue un piano JSON multi-subtask con parallelismo topologico.
Python 3.9 stdlib only. Big Sur compatible.

Usage:
  python3 plan_execute.py <plan.json>
  python3 plan_execute.py --stdin  (legge JSON da stdin)
  python3 plan_execute.py --mock   (test con piano sintetico, NO API calls)

Piano JSON atteso:
{
  "plan_id": "plan_20260518_143022",
  "task_description": "descrizione task",
  "subtasks": [
    {
      "id": "s1",
      "description": "prompt del subtask",
      "model_target": "deepseek|gemini-flash|cerebras",
      "expected_output_format": "markdown|json|plain",
      "dependencies": []
    }
  ],
  "aggregator_model": "gemini-flash"
}

Output stdout: JSON con {plan_id, total_cost_usd, total_latency_ms, subtask_results, aggregated_summary_md_path}
"""

import json
import os
import sys
import time
import hashlib
import datetime
import subprocess
import concurrent.futures
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Costanti
# ---------------------------------------------------------------------------

T7_MOUNT = "/Volumes/MontereyT7"
VOS_ROOT = Path(T7_MOUNT) / "venture-os"
STATE_DIR = VOS_ROOT / "state"
PLAN_EXEC_DIR = STATE_DIR / "plan-executions"
COSTS_LOG = STATE_DIR / "costs.jsonl"
EVAL_PY = VOS_ROOT / "components" / "eval-tracker" / "eval.py"
ROUTER_PY = VOS_ROOT / "components" / "llm-router" / "router.py"

# Mappa model_target → router role
MODEL_TARGET_TO_ROLE = {
    "gemini-flash": "long_context",
    "deepseek": "code_review",
    "cerebras": "cheap",
    "cheap": "cheap",
    "code_review": "code_review",
    "long_context": "long_context",
    "reasoning": "reasoning",
}

# Costo stimato per role (USD/1k token, approssimativo per pre-flight check)
ROLE_COST_PER_1K_TOKEN = {
    "long_context": 0.0,      # Gemini Flash free
    "cheap": 0.0,             # Gemini Flash free
    "code_review": 0.00032,   # DeepSeek $0.32/M
    "code_gen": 0.00040,      # Kimi K2.5
    "reasoning": 0.00125,     # Gemini 2.5 Pro
}

MAX_CONCURRENT = 3  # Rate limit safety
COST_WARN_THRESHOLD = 0.10  # USD
COST_BLOCK_THRESHOLD = 1.00  # USD

AGGREGATOR_PROMPT_TEMPLATE = """Sei un aggregatore di output. Ricevi i risultati di {n} sub-task paralleli e produci un markdown conciso (<2000 token) con:
1. **Risultati chiave** per sub-task (bullet list)
2. **Issues o warning** rilevati
3. **Prossimi passi** suggeriti

Sub-task descriptions e outputs:
{task_outputs}

Produci markdown pulito, senza ripetere i prompt originali."""


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

def _t7_mounted() -> bool:
    return os.path.ismount(T7_MOUNT)


def _now_iso() -> str:
    return datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


def _plan_id_from_dict(plan: dict) -> str:
    """Genera plan_id deterministica se non fornita."""
    if plan.get("plan_id"):
        return plan["plan_id"]
    content = json.dumps(plan.get("subtasks", []), sort_keys=True)
    h = hashlib.md5(content.encode()).hexdigest()[:8]
    ts = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    return f"plan_{ts}_{h}"


def _estimate_cost_usd(subtasks: list[dict]) -> float:
    """
    Stima costo totale piano in USD.
    Assume ~2000 token per subtask (input+output).
    """
    total = 0.0
    for st in subtasks:
        role = MODEL_TARGET_TO_ROLE.get(st.get("model_target", "cheap"), "cheap")
        cost_per_1k = ROLE_COST_PER_1K_TOKEN.get(role, 0.0)
        total += cost_per_1k * 2  # 2k token stimato
    return total


def _topological_sort(subtasks: list[dict]) -> list[list[str]]:
    """
    Ritorna lista di wave (batch da eseguire in parallelo).
    Ogni wave = lista di subtask.id eseguibili in parallelo.
    Rispetta `dependencies`.

    Algoritmo: Kahn's algorithm per livelli.
    Eccezione ValueError su dipendenze circolari.
    """
    # Costruisci grafo
    id_to_task = {st["id"]: st for st in subtasks}
    in_degree = {st["id"]: 0 for st in subtasks}
    dependents: dict[str, list[str]] = {st["id"]: [] for st in subtasks}

    for st in subtasks:
        deps = st.get("dependencies", [])
        in_degree[st["id"]] = len(deps)
        for dep in deps:
            if dep not in dependents:
                raise ValueError(f"Dipendenza '{dep}' non trovata nel piano.")
            dependents[dep].append(st["id"])

    waves = []
    remaining = set(id_to_task.keys())
    max_iter = len(subtasks) + 1  # Anti-loop guard

    while remaining and max_iter > 0:
        max_iter -= 1
        wave = [sid for sid in remaining if in_degree[sid] == 0]
        if not wave:
            raise ValueError(
                f"Dipendenza circolare rilevata nei subtask: {remaining}"
            )
        waves.append(wave)
        for sid in wave:
            remaining.remove(sid)
            for dep in dependents[sid]:
                in_degree[dep] -= 1

    return waves


def _log_cost_entry(
    model: str, role: str, in_tok: int, out_tok: int,
    cost_usd: float, latency_ms: int, plan_id: str, subtask_id: str
) -> None:
    """Appende entry a costs.jsonl. Fail-soft."""
    try:
        COSTS_LOG.parent.mkdir(parents=True, exist_ok=True)
        entry = {
            "ts": _now_iso(),
            "model": model,
            "role": role,
            "in_tok": in_tok,
            "out_tok": out_tok,
            "cost_usd": round(cost_usd, 6),
            "latency_ms": latency_ms,
            "plan_id": plan_id,
            "subtask_id": subtask_id,
        }
        with open(COSTS_LOG, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(entry) + "\n")
    except Exception as exc:
        sys.stderr.write(f"[plan-execute] WARN cost log failed: {exc}\n")


def _log_eval_delegation(
    subtask_id: str, model: str, role: str,
    in_tok: int, out_tok: int, cost_usd: float, latency_ms: int, success: bool
) -> None:
    """Chiama eval.py log_delegation per integrazione P8. Fail-soft."""
    if not EVAL_PY.exists():
        sys.stderr.write(f"[plan-execute] WARN: eval.py non trovato a {EVAL_PY}\n")
        return

    # Import diretto (stesso processo, più efficiente di subprocess)
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("eval", EVAL_PY)
        eval_mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(eval_mod)
        eval_mod.log_delegation(
            agent=f"plan-execute/{subtask_id}",
            model=model,
            task_type=f"plan_subtask_{role}",
            input_tokens=in_tok,
            output_tokens=out_tok,
            cost_usd=cost_usd,
            latency_ms=latency_ms,
            success=success,
        )
    except Exception as exc:
        sys.stderr.write(f"[plan-execute] WARN eval.log_delegation failed: {exc}\n")


# ---------------------------------------------------------------------------
# Mock router (per test senza API calls)
# ---------------------------------------------------------------------------

def _mock_router_call(role: str, prompt: str, subtask_id: str) -> dict:
    """
    Simula una chiamata router per test E2E senza spendere token.
    Introduce latenza artificiale 100-300ms per testare parallelismo.
    """
    import random
    latency_ms = random.randint(100, 300)
    time.sleep(latency_ms / 1000)

    MOCK_RESPONSES = {
        "long_context": f"[MOCK long_context] Analisi completata per subtask {subtask_id}. "
                        "Trovati 3 pattern chiave: A, B, C.",
        "code_review": f"[MOCK code_review] Review subtask {subtask_id}: nessun issue critico. "
                       "1 suggestion: aggiungere docstring.",
        "cheap": f"[MOCK cheap] Sintesi subtask {subtask_id}: completato con successo.",
        "reasoning": f"[MOCK reasoning] Analisi ragionamento subtask {subtask_id}: logica coerente.",
        "code_gen": f"[MOCK code_gen] Codice generato per subtask {subtask_id}.",
    }

    result_text = MOCK_RESPONSES.get(role, f"[MOCK] Output per {subtask_id}")

    return {
        "result": result_text,
        "model": f"mock/{role}",
        "provider": "mock",
        "in_tok": len(prompt.split()),
        "out_tok": len(result_text.split()),
        "cost_usd": 0.0,
        "latency_ms": latency_ms,
    }


# ---------------------------------------------------------------------------
# Subtask executor
# ---------------------------------------------------------------------------

def _execute_subtask(
    subtask: dict, plan_id: str, use_mock: bool = False
) -> dict:
    """
    Esegue un singolo subtask via router.py (o mock).
    Ritorna dict con risultato + metadata.
    Thread-safe (non condivide stato mutabile).
    """
    st_id = subtask["id"]
    description = subtask["description"]
    model_target = subtask.get("model_target", "cheap")
    role = MODEL_TARGET_TO_ROLE.get(model_target, "cheap")

    t_start = time.time()

    try:
        if use_mock:
            router_result = _mock_router_call(role, description, st_id)
        else:
            # Chiama router.py via subprocess (NON modificare router.py — WAVE 1 frozen)
            if not ROUTER_PY.exists():
                raise FileNotFoundError(f"router.py non trovato: {ROUTER_PY}")

            proc = subprocess.run(
                [sys.executable, str(ROUTER_PY), "--role", role, "--prompt", description],
                capture_output=True,
                text=True,
                timeout=120,
            )
            if proc.returncode != 0:
                raise RuntimeError(
                    f"router.py exit {proc.returncode}: {proc.stderr[:200]}"
                )
            router_result = json.loads(proc.stdout)
            if "error" in router_result:
                raise RuntimeError(f"router error: {router_result['error']}")

        latency_ms = int((time.time() - t_start) * 1000)
        in_tok = router_result.get("in_tok", 0)
        out_tok = router_result.get("out_tok", 0)
        cost_usd = router_result.get("cost_usd", 0.0)
        model = router_result.get("model", "unknown")

        # Cost tracking
        _log_cost_entry(model, role, in_tok, out_tok, cost_usd, latency_ms, plan_id, st_id)
        _log_eval_delegation(st_id, model, role, in_tok, out_tok, cost_usd, latency_ms, True)

        return {
            "id": st_id,
            "status": "success",
            "result": router_result.get("result", ""),
            "model": model,
            "cost_usd": cost_usd,
            "latency_ms": latency_ms,
            "in_tok": in_tok,
            "out_tok": out_tok,
        }

    except Exception as exc:
        latency_ms = int((time.time() - t_start) * 1000)
        sys.stderr.write(f"[plan-execute] FAIL subtask {st_id}: {exc}\n")
        _log_eval_delegation(
            st_id, "unknown", role, 0, 0, 0.0, latency_ms, False
        )
        return {
            "id": st_id,
            "status": "error",
            "error": str(exc),
            "result": "",
            "cost_usd": 0.0,
            "latency_ms": latency_ms,
        }


# ---------------------------------------------------------------------------
# Aggregator
# ---------------------------------------------------------------------------

def _run_aggregator(
    plan_id: str,
    subtask_results: list[dict],
    aggregator_model: str,
    use_mock: bool = False,
) -> tuple[str, float, int]:
    """
    Aggrega i risultati in markdown summary.
    Ritorna (summary_text, cost_usd, latency_ms).
    """
    task_outputs_parts = []
    for r in subtask_results:
        status_tag = "OK" if r["status"] == "success" else "FAIL"
        result_snippet = r.get("result", r.get("error", ""))[:500]
        task_outputs_parts.append(
            f"[{status_tag}] subtask {r['id']}: {result_snippet}"
        )

    aggregator_prompt = AGGREGATOR_PROMPT_TEMPLATE.format(
        n=len(subtask_results),
        task_outputs="\n\n".join(task_outputs_parts),
    )

    agg_role = MODEL_TARGET_TO_ROLE.get(aggregator_model, "cheap")
    t_start = time.time()

    try:
        if use_mock:
            agg_result = _mock_router_call(agg_role, aggregator_prompt, "aggregator")
        else:
            if not ROUTER_PY.exists():
                raise FileNotFoundError(f"router.py non trovato: {ROUTER_PY}")

            proc = subprocess.run(
                [
                    sys.executable, str(ROUTER_PY),
                    "--role", agg_role,
                    "--prompt", aggregator_prompt,
                    "--max-tokens", "2000",
                ],
                capture_output=True,
                text=True,
                timeout=120,
            )
            if proc.returncode != 0:
                raise RuntimeError(f"aggregator exit {proc.returncode}: {proc.stderr[:200]}")
            agg_result = json.loads(proc.stdout)
            if "error" in agg_result:
                raise RuntimeError(f"aggregator error: {agg_result['error']}")

        latency_ms = int((time.time() - t_start) * 1000)
        summary_text = agg_result.get("result", "[aggregation failed]")
        cost_usd = agg_result.get("cost_usd", 0.0)

        # Log aggregator cost separato
        _log_cost_entry(
            agg_result.get("model", "unknown"), agg_role,
            agg_result.get("in_tok", 0), agg_result.get("out_tok", 0),
            cost_usd, latency_ms, plan_id, "aggregator"
        )

        return summary_text, cost_usd, latency_ms

    except Exception as exc:
        latency_ms = int((time.time() - t_start) * 1000)
        sys.stderr.write(f"[plan-execute] WARN aggregator failed: {exc}\n")
        fallback = (
            "## Aggregazione fallita\n\n"
            f"Errore aggregator: {exc}\n\n"
            "**Risultati raw dei subtask:**\n"
        )
        for r in subtask_results:
            fallback += f"- {r['id']}: {str(r.get('result', r.get('error', '')))[:200]}\n"
        return fallback, 0.0, latency_ms


# ---------------------------------------------------------------------------
# Core executor
# ---------------------------------------------------------------------------

def execute_plan(plan: dict, use_mock: bool = False) -> dict:
    """
    Esegue il piano completo con parallelismo topologico.
    Ritorna dict risultato finale.
    """
    plan_id = _plan_id_from_dict(plan)
    subtasks = plan.get("subtasks", [])
    aggregator_model = plan.get("aggregator_model", "gemini-flash")

    if not subtasks:
        return {"error": "piano senza subtask", "plan_id": plan_id}

    # Pre-flight: stima costo
    estimated_cost = _estimate_cost_usd(subtasks)
    if estimated_cost > COST_BLOCK_THRESHOLD and not use_mock:
        return {
            "error": "cost_limit_exceeded",
            "plan_id": plan_id,
            "estimated_cost_usd": round(estimated_cost, 4),
            "threshold_usd": COST_BLOCK_THRESHOLD,
            "suggestion": (
                f"Piano stimato ${estimated_cost:.3f} > soglia ${COST_BLOCK_THRESHOLD}. "
                "Downgrade modelli a 'cheap' o 'gemini-flash' per subtask non critici, "
                "oppure spezza il piano in fasi."
            ),
        }

    if estimated_cost > COST_WARN_THRESHOLD and not use_mock:
        sys.stderr.write(
            f"[plan-execute] WARN: costo stimato ${estimated_cost:.3f} > "
            f"soglia warning ${COST_WARN_THRESHOLD}. Procedo comunque.\n"
        )

    # Topological sort
    try:
        waves = _topological_sort(subtasks)
    except ValueError as exc:
        return {"error": str(exc), "plan_id": plan_id}

    sys.stderr.write(
        f"[plan-execute] Piano {plan_id}: {len(subtasks)} subtask in {len(waves)} wave\n"
    )

    all_results: dict[str, dict] = {}
    t_plan_start = time.time()

    # Esegui wave per wave (ogni wave in parallelo)
    for wave_idx, wave_ids in enumerate(waves):
        wave_subtasks = [st for st in subtasks if st["id"] in wave_ids]
        sys.stderr.write(
            f"[plan-execute] Wave {wave_idx + 1}/{len(waves)}: "
            f"{wave_ids} (parallelo, max {MAX_CONCURRENT} concurrent)\n"
        )

        with concurrent.futures.ThreadPoolExecutor(
            max_workers=min(len(wave_subtasks), MAX_CONCURRENT)
        ) as executor:
            futures = {
                executor.submit(_execute_subtask, st, plan_id, use_mock): st["id"]
                for st in wave_subtasks
            }
            for future in concurrent.futures.as_completed(futures):
                st_id = futures[future]
                try:
                    result = future.result(timeout=130)
                    all_results[st_id] = result
                    status = result.get("status", "unknown")
                    cost = result.get("cost_usd", 0.0)
                    lat = result.get("latency_ms", 0)
                    sys.stderr.write(
                        f"[plan-execute] {st_id}: {status} | "
                        f"${cost:.4f} | {lat}ms\n"
                    )
                except Exception as exc:
                    sys.stderr.write(f"[plan-execute] FAIL future {st_id}: {exc}\n")
                    all_results[st_id] = {
                        "id": st_id, "status": "error",
                        "error": str(exc), "result": "",
                        "cost_usd": 0.0, "latency_ms": 0,
                    }

    # Aggregazione
    subtask_results_ordered = [
        all_results.get(st["id"], {"id": st["id"], "status": "missing", "result": ""})
        for st in subtasks
    ]

    sys.stderr.write(f"[plan-execute] Aggregazione con {aggregator_model}...\n")
    summary_text, agg_cost, agg_latency = _run_aggregator(
        plan_id, subtask_results_ordered, aggregator_model, use_mock
    )

    # Scrivi summary su file
    PLAN_EXEC_DIR.mkdir(parents=True, exist_ok=True)
    summary_path = PLAN_EXEC_DIR / f"{plan_id}.md"
    try:
        summary_path.write_text(
            f"# Plan Execution: {plan_id}\n\n"
            f"Generated: {_now_iso()}\n"
            f"Task: {plan.get('task_description', 'N/A')}\n\n"
            f"---\n\n{summary_text}\n",
            encoding="utf-8",
        )
    except Exception as exc:
        sys.stderr.write(f"[plan-execute] WARN: summary write failed: {exc}\n")

    # Totali
    total_cost = sum(r.get("cost_usd", 0.0) for r in subtask_results_ordered) + agg_cost
    total_latency = int((time.time() - t_plan_start) * 1000)

    final_report = {
        "plan_id": plan_id,
        "ts": _now_iso(),
        "total_cost_usd": round(total_cost, 6),
        "total_latency_ms": total_latency,
        "subtask_results": subtask_results_ordered,
        "aggregated_summary_md_path": str(summary_path),
        "aggregated_summary": summary_text[:500] + "..." if len(summary_text) > 500 else summary_text,
    }

    return final_report


# ---------------------------------------------------------------------------
# Mock plan for --mock self-test
# ---------------------------------------------------------------------------

MOCK_PLAN = {
    "plan_id": "plan_mock_test_001",
    "task_description": "Test piano sintetico 3 subtask: analisi + code_review + sintesi",
    "subtasks": [
        {
            "id": "s1",
            "description": "Analizza i pattern di utilizzo nei log VOS degli ultimi 7 giorni.",
            "model_target": "gemini-flash",
            "expected_output_format": "bullet list",
            "dependencies": [],
        },
        {
            "id": "s2",
            "description": "Review del codice del componente eval-tracker per conformità vincoli S181.",
            "model_target": "deepseek",
            "expected_output_format": "bullet list issues",
            "dependencies": [],
        },
        {
            "id": "s3",
            "description": "Sintetizza i risultati di s1 e s2 in una raccomandazione operativa per Luke.",
            "model_target": "gemini-flash",
            "expected_output_format": "markdown <500 token",
            "dependencies": ["s1", "s2"],
        },
    ],
    "aggregator_model": "gemini-flash",
}

MOCK_PLAN_DEPS = {
    "plan_id": "plan_mock_deps_001",
    "task_description": "Test dipendenze topologiche: s1 → s2 → s3",
    "subtasks": [
        {
            "id": "s1",
            "description": "Step 1: raccolta dati",
            "model_target": "cheap",
            "expected_output_format": "plain",
            "dependencies": [],
        },
        {
            "id": "s2",
            "description": "Step 2: elaborazione (dipende da s1)",
            "model_target": "cheap",
            "expected_output_format": "plain",
            "dependencies": ["s1"],
        },
        {
            "id": "s3",
            "description": "Step 3: sintesi (dipende da s2)",
            "model_target": "cheap",
            "expected_output_format": "plain",
            "dependencies": ["s2"],
        },
    ],
    "aggregator_model": "gemini-flash",
}

MOCK_PLAN_HIGH_COST = {
    "plan_id": "plan_mock_high_cost",
    "task_description": "Test blocco costo elevato",
    "subtasks": [
        {
            "id": "s1", "description": "task costoso", "model_target": "reasoning",
            "expected_output_format": "plain", "dependencies": [],
        },
    ] * 5,  # 5 reasoning subtask: stima molto alta
    "aggregator_model": "gemini-flash",
}


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    # Mount check T7 (vincolo S181)
    if not _t7_mounted():
        sys.stderr.write(
            f"[plan-execute] ERROR: T7 non montato a {T7_MOUNT}. "
            "Connetti SSD T7 prima di eseguire.\n"
        )
        return 1

    # Parse args
    use_mock = False
    plan_data = None

    if len(sys.argv) < 2:
        sys.stderr.write(
            "Usage: plan_execute.py <plan.json> | --stdin | --mock [--deps | --high-cost]\n"
        )
        return 1

    arg1 = sys.argv[1]

    if arg1 == "--mock":
        use_mock = True
        if len(sys.argv) > 2 and sys.argv[2] == "--deps":
            plan_data = MOCK_PLAN_DEPS
        elif len(sys.argv) > 2 and sys.argv[2] == "--high-cost":
            plan_data = MOCK_PLAN_HIGH_COST
        else:
            plan_data = MOCK_PLAN

    elif arg1 == "--stdin":
        try:
            plan_data = json.load(sys.stdin)
        except json.JSONDecodeError as exc:
            sys.stderr.write(f"[plan-execute] ERROR: JSON stdin malformato: {exc}\n")
            return 1

    else:
        plan_path = Path(arg1)
        if not plan_path.exists():
            sys.stderr.write(f"[plan-execute] ERROR: file non trovato: {plan_path}\n")
            return 1
        try:
            plan_data = json.loads(plan_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            sys.stderr.write(f"[plan-execute] ERROR: JSON malformato in {plan_path}: {exc}\n")
            return 1

    # Esegui piano
    result = execute_plan(plan_data, use_mock=use_mock)
    print(json.dumps(result, indent=2, ensure_ascii=False))

    return 0 if "error" not in result else 1


if __name__ == "__main__":
    sys.exit(main())
