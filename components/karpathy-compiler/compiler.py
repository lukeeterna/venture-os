#!/usr/bin/env python3
# karpathy-compiler v0 — pattern compilation handoff > soglia (CLAUDE.md sez. "Pattern compilation Karpathy").
# Legge routing.yaml + handoff-debt-config.yaml + projects-inventory.yaml.
# Concat handoff per progetto, manda a long_context model, scrive COMPILED-STATE.md ≤500 righe,
# archivia originali in wiki/raw/archived-handoffs/<project>/<YYYY-MM-DD>/ via MV (mai rm).
#
# Vincoli:
#   #1  verifica fattuale: endpoint + headers Gemini da doc upstream
#   #5  zero-cost: free tier flash, soglia hard €30/mese tracciata in costs.jsonl
#   #8  no libs blacklist: solo requests + pyyaml + stdlib
#   #10 output verificato: spot-check manuale obbligatorio prima archiviazione (--archive=false default)

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests
import yaml

# Path relativi alla root VOS.
VOS_ROOT = Path(__file__).resolve().parents[2]
ROUTING_FILE = VOS_ROOT / "config" / "routing.yaml"
DEBT_CONFIG_FILE = VOS_ROOT / "config" / "handoff-debt-config.yaml"
INVENTORY_FILE = VOS_ROOT / "state" / "projects-inventory.yaml"
COSTS_FILE = VOS_ROOT / "state" / "costs.jsonl"
ERRORS_FILE = VOS_ROOT / "state" / "errors.jsonl"
WIKI_PROJECTS = VOS_ROOT / "wiki" / "projects"
ARCHIVED_HANDOFFS = VOS_ROOT / "wiki" / "raw" / "archived-handoffs"
ENV_FILE = Path.home() / ".claude" / ".env.free-gpu"

# Mount check shared util.
sys.path.insert(0, str(VOS_ROOT / "components" / "_shared"))
from mount_check import require_t7_or_exit  # noqa: E402

COMPONENT = "karpathy-compiler"


# ---------- utils ----------

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def today_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def log_error(record: dict) -> None:
    ERRORS_FILE.parent.mkdir(parents=True, exist_ok=True)
    record.setdefault("ts", now_iso())
    record.setdefault("component", COMPONENT)
    with ERRORS_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def log_cost(record: dict) -> None:
    COSTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    record.setdefault("ts", now_iso())
    record.setdefault("component", COMPONENT)
    with COSTS_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def load_env_file(path: Path) -> dict[str, str]:
    """Parser minimale formato KEY=VALUE, ignora # e righe vuote."""
    out: dict[str, str] = {}
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip()
    return out


def load_yaml(path: Path) -> dict:
    if not path.exists():
        sys.stderr.write(f"[{COMPONENT}] file mancante: {path}\n")
        sys.exit(2)
    with path.open(encoding="utf-8") as f:
        return yaml.safe_load(f)


# ---------- routing ----------

def resolve_long_context_model(routing: dict) -> dict:
    """Estrae model entry per role=long_context da routing.yaml."""
    default_id = routing.get("defaults", {}).get("long_context")
    if not default_id:
        sys.stderr.write(f"[{COMPONENT}] routing.yaml: defaults.long_context mancante\n")
        sys.exit(2)
    for m in routing.get("models", []):
        if m.get("role") == "long_context" and m.get("model_id") == default_id:
            return m
    sys.stderr.write(f"[{COMPONENT}] routing.yaml: nessun model long_context con id={default_id}\n")
    sys.exit(2)


# ---------- handoff scan ----------

def collect_handoff_files(project: str, debt_config: dict) -> tuple[Path, list[Path]]:
    """Risolve root + glob pattern per progetto, ritorna (root, lista file ordinata)."""
    proj_cfg = debt_config.get("projects", {}).get(project)
    if not proj_cfg:
        sys.stderr.write(f"[{COMPONENT}] progetto {project} non trovato in handoff-debt-config.yaml\n")
        sys.exit(2)
    root = Path(os.path.expanduser(proj_cfg["root"])).resolve()
    if not root.exists():
        sys.stderr.write(f"[{COMPONENT}] root progetto inesistente: {root}\n")
        sys.exit(2)
    patterns: list[str] = proj_cfg.get("patterns", [])
    files: set[Path] = set()
    for pat in patterns:
        for match in root.glob(pat):
            if match.is_file() and match.suffix.lower() == ".md":
                files.add(match.resolve())
    return root, sorted(files)


def estimate_tokens(text: str) -> int:
    """Stima grezza: ~4 char per token (worst case latino + markdown)."""
    return len(text) // 4


# ---------- prompt build ----------

SYSTEM_PROMPT = """Sei un compilatore di stato progetto Karpathy-style.

INPUT: concat di handoff/memory/stato di un progetto software in italiano (può contenere termini tecnici inglesi).

OUTPUT RICHIESTO: un singolo documento markdown di MASSIMO 500 righe con ESATTAMENTE 4 sezioni in quest'ordine:

## Stato attuale verificato
Cosa esiste e funziona OGGI nel progetto. Solo affermazioni che trovi esplicite nel testo. Niente inferenza, niente "probabilmente".

## Decisioni chiuse
Decisioni architetturali/di scope che il testo segnala come prese e non più in discussione. Una bullet per decisione, max una riga.

## Blocker aperti
Problemi noti, dipendenze esterne attese, errori non risolti. Una bullet per blocker, max una riga.

## Prossimi passi
Solo step esplicitamente menzionati nel testo come "next" o "TODO" o equivalenti. Niente raccomandazioni tue.

VINCOLI ASSOLUTI:
1. SOLO contenuto presente nell'INPUT. Mai aggiungere informazione non scritta.
2. Mai usare frasi come "potrebbe", "probabilmente", "si suggerisce" — segnalano inferenza.
3. Se una sezione non ha contenuto nell'INPUT, scrivi una sola riga: "_(nessuna evidenza nel materiale)_"
4. Nessun preambolo, nessuna chiusura. Inizia direttamente con `## Stato attuale verificato`.
5. Output puro markdown, NON dentro fence ```markdown.
6. Se l'INPUT è contraddittorio (es. handoff vecchi vs nuovi), prevale il più recente per data filename.

Ricorda: 500 righe è il MASSIMO, non il target. Stringato verificato è meglio di prolisso verosimile.
"""


def build_user_prompt(project: str, files: list[Path]) -> str:
    chunks = [f"# Compilazione progetto: {project}\n"]
    chunks.append(f"# File totali: {len(files)}\n\n")
    for f in files:
        rel = f.name
        try:
            content = f.read_text(encoding="utf-8", errors="replace")
        except Exception as e:
            log_error({"event": "read_failed", "file": str(f), "error": str(e)})
            continue
        chunks.append(f"\n\n========== FILE: {rel} ==========\n\n{content}\n")
    return "".join(chunks)


# ---------- gemini call ----------

def call_gemini(model: dict, system_prompt: str, user_prompt: str, api_key: str) -> dict:
    """POST a generativelanguage. Ritorna dict completo (per estrarre text + usage)."""
    url = f"{model['api_endpoint']}/models/{model['model_id']}:generateContent"
    headers = {
        "x-goog-api-key": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": model.get("output_tokens_max", 65536),
            # Disabilita thinking: 2.5-flash ha CoT abilitato di default che consuma
            # maxOutputTokens budget riducendo output visibile (S5b: 32K thinking
            # vs 1.3K output reali). Karpathy = consolidamento, non reasoning.
            "thinkingConfig": {"thinkingBudget": 0},
        },
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=300)
    if resp.status_code == 429:
        log_error({"event": "rate_limit", "status": 429, "body": resp.text[:500]})
        sys.stderr.write(f"[{COMPONENT}] HTTP 429 rate limit. Riprova domani o attiva billing.\n")
        sys.exit(3)
    if resp.status_code != 200:
        log_error({"event": "http_error", "status": resp.status_code, "body": resp.text[:1000]})
        sys.stderr.write(f"[{COMPONENT}] HTTP {resp.status_code}: {resp.text[:300]}\n")
        sys.exit(4)
    return resp.json()


def extract_text(response: dict) -> str:
    try:
        return response["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as e:
        log_error({"event": "extract_failed", "error": str(e), "response_head": str(response)[:500]})
        sys.stderr.write(f"[{COMPONENT}] response shape inattesa: {str(response)[:300]}\n")
        sys.exit(5)


def extract_usage(response: dict) -> dict:
    u = response.get("usageMetadata", {}) or {}
    return {
        "tokens_in": u.get("promptTokenCount", 0),
        "tokens_out": u.get("candidatesTokenCount", 0),
        "tokens_total": u.get("totalTokenCount", 0),
    }


# ---------- write + archive ----------

def has_today_frontmatter(path: Path) -> bool:
    if not path.exists():
        return False
    head = path.read_text(encoding="utf-8", errors="replace")[:300]
    return f"date: {today_str()}" in head


def write_compiled(project: str, body: str, model_id: str, files_count: int) -> Path:
    out_dir = WIKI_PROJECTS / project
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "COMPILED-STATE.md"
    frontmatter = (
        "---\n"
        f"project: {project}\n"
        f"date: {today_str()}\n"
        f"compiled_at: {now_iso()}\n"
        f"model: {model_id}\n"
        f"source_files: {files_count}\n"
        "compiler: karpathy-compiler v0\n"
        "---\n\n"
    )
    out_path.write_text(frontmatter + body.strip() + "\n", encoding="utf-8")
    return out_path


def archive_originals(project: str, files: list[Path]) -> Path:
    """MV file in wiki/raw/archived-handoffs/<project>/<date>/. Mantiene basename, no rm."""
    dest_dir = ARCHIVED_HANDOFFS / project / today_str()
    dest_dir.mkdir(parents=True, exist_ok=True)
    for f in files:
        dest = dest_dir / f.name
        # Se collisione (stesso nome da subfolder diversi): suffix con parent
        if dest.exists():
            dest = dest_dir / f"{f.parent.name}__{f.name}"
        shutil.move(str(f), str(dest))
    return dest_dir


# ---------- main ----------

def main() -> int:
    parser = argparse.ArgumentParser(description="Karpathy compiler — handoff debt → COMPILED-STATE.md")
    parser.add_argument("--project", required=True, help="ARGOS | FLUXION | Guardian")
    parser.add_argument("--dry-run", action="store_true", help="Mostra prompt + token estimate, no LLM call")
    parser.add_argument("--archive", action="store_true", help="MV originali in archived-handoffs (default: NO)")
    parser.add_argument("--force", action="store_true", help="Bypass idempotenza (frontmatter date odierno)")
    args = parser.parse_args()

    require_t7_or_exit(COMPONENT)

    routing = load_yaml(ROUTING_FILE)
    debt_config = load_yaml(DEBT_CONFIG_FILE)
    model = resolve_long_context_model(routing)

    out_path = WIKI_PROJECTS / args.project / "COMPILED-STATE.md"
    if not args.force and has_today_frontmatter(out_path):
        print(f"[{COMPONENT}] {out_path} già aggiornato oggi. Usa --force per rifare.")
        return 0

    root, files = collect_handoff_files(args.project, debt_config)
    if not files:
        sys.stderr.write(f"[{COMPONENT}] nessun handoff matchato in {root}\n")
        return 1

    user_prompt = build_user_prompt(args.project, files)
    tokens_in_est = estimate_tokens(SYSTEM_PROMPT) + estimate_tokens(user_prompt)
    print(f"[{COMPONENT}] progetto={args.project} files={len(files)} chars={len(user_prompt)} tokens_in_est={tokens_in_est} model={model['model_id']}")

    if args.dry_run:
        print(f"\n--- system prompt ({len(SYSTEM_PROMPT)} chars) ---")
        print(SYSTEM_PROMPT[:400] + "..." if len(SYSTEM_PROMPT) > 400 else SYSTEM_PROMPT)
        print(f"\n--- user prompt head ({len(user_prompt)} chars total) ---")
        print(user_prompt[:800] + "...")
        print(f"\n--- files ({len(files)}) ---")
        for f in files:
            try:
                size = f.stat().st_size
            except OSError:
                size = -1
            print(f"  {size:>8}  {f.relative_to(root)}")
        return 0

    # Vincolo #1: chiave da env file (precedenza) o env var.
    env_kv = load_env_file(ENV_FILE)
    api_key = env_kv.get(model["auth_env"]) or os.environ.get(model["auth_env"], "")
    if not api_key:
        sys.stderr.write(f"[{COMPONENT}] {model['auth_env']} non trovata in {ENV_FILE} o env\n")
        return 6

    print(f"[{COMPONENT}] chiamata Gemini in corso...")
    response = call_gemini(model, SYSTEM_PROMPT, user_prompt, api_key)
    body = extract_text(response)
    usage = extract_usage(response)

    # Sanity check output ≤500 righe
    lines = body.splitlines()
    if len(lines) > 500:
        print(f"[{COMPONENT}] WARN: output {len(lines)} righe > 500. Trunco a 500 + nota.")
        body = "\n".join(lines[:499]) + "\n\n_(troncato a 500 righe — output originale eccedeva soglia)_"

    out_path = write_compiled(args.project, body, model["model_id"], len(files))
    print(f"[{COMPONENT}] scritto: {out_path} ({len(body.splitlines())} righe)")

    log_cost({
        "event": "compiled",
        "project": args.project,
        "model": model["model_id"],
        "tokens_in": usage["tokens_in"],
        "tokens_out": usage["tokens_out"],
        "tokens_total": usage["tokens_total"],
        "cost_usd": 0.0,  # free tier flash
        "files_count": len(files),
        "output_lines": len(body.splitlines()),
    })

    if args.archive:
        dest = archive_originals(args.project, files)
        print(f"[{COMPONENT}] archiviati {len(files)} file in {dest}")
    else:
        print(f"[{COMPONENT}] originali NON archiviati (default safety). Spot-check {out_path}, poi ri-esegui con --archive.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
