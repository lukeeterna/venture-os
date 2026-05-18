#!/usr/bin/env python3
"""
eval.py — VOS Eval Tracker (WAVE 3 P8, S181)
Log delegation performance entries to state/eval.jsonl.
Python 3.9 stdlib only. Big Sur compatible.

Mount check: se T7 non montato → fallback ~/Library/Application Support/VOS/eval.jsonl
Atomic append via lock file .eval.jsonl.lock (evita race con cron concurrent).
"""

import json
import os
import sys
import time
import fcntl
import datetime
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Costanti path
# ---------------------------------------------------------------------------

T7_MOUNT = "/Volumes/MontereyT7"
VOS_ROOT = Path(T7_MOUNT) / "venture-os"
PRIMARY_EVAL_PATH = VOS_ROOT / "state" / "eval.jsonl"
FALLBACK_EVAL_DIR = Path.home() / "Library" / "Application Support" / "VOS"
FALLBACK_EVAL_PATH = FALLBACK_EVAL_DIR / "eval.jsonl"

LOCK_FILENAME = ".eval.jsonl.lock"


def _t7_mounted() -> bool:
    """Ritorna True se T7 è montato (vincolo S181 WAVE 3)."""
    return os.path.ismount(T7_MOUNT)


def _resolve_paths() -> tuple[Path, Path]:
    """
    Ritorna (eval_path, lock_path) in base allo stato mount T7.
    Se T7 non montato → warning su stderr + fallback path.
    """
    if _t7_mounted():
        eval_path = PRIMARY_EVAL_PATH
    else:
        sys.stderr.write(
            f"[eval-tracker] WARN {_now_iso()} T7 non montato "
            f"({T7_MOUNT}). Fallback a {FALLBACK_EVAL_PATH}\n"
        )
        FALLBACK_EVAL_DIR.mkdir(parents=True, exist_ok=True)
        eval_path = FALLBACK_EVAL_PATH

    lock_path = eval_path.parent / LOCK_FILENAME
    return eval_path, lock_path


def _now_iso() -> str:
    """Timestamp UTC ISO8601."""
    return datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


def log_delegation(
    agent: str,
    model: str,
    task_type: str,
    input_tokens: int,
    output_tokens: int,
    cost_usd: float,
    latency_ms: int,
    success: bool,
    error_type: Optional[str] = None,
    user_feedback: Optional[int] = None,
) -> bool:
    """
    Appende una entry a state/eval.jsonl.

    Parametri
    ---------
    agent         : nome agente (es. 'code-reviewer')
    model         : model ID (es. 'google/gemini-flash-1.5')
    task_type     : tipo task (es. 'code_review', 'research', 'synthesis')
    input_tokens  : token in ingresso
    output_tokens : token in uscita
    cost_usd      : costo USD (float, es. 0.000132)
    latency_ms    : latenza ms intera
    success       : True se task completato con successo
    error_type    : opzionale, stringa tipo errore (es. 'timeout', 'malformed_output')
    user_feedback : opzionale, int 1-5 (valutazione utente)

    Ritorna True se append avvenuto, False su errore (fail-soft).
    """
    entry: dict = {
        "ts": _now_iso(),
        "agent": str(agent),
        "model": str(model),
        "task_type": str(task_type),
        "input_tokens": int(input_tokens),
        "output_tokens": int(output_tokens),
        "cost_usd": float(cost_usd),
        "latency_ms": int(latency_ms),
        "success": bool(success),
        "error_type": error_type,
        "user_feedback": user_feedback,
    }

    try:
        eval_path, lock_path = _resolve_paths()

        # Assicura directory parent
        eval_path.parent.mkdir(parents=True, exist_ok=True)

        # Acquisisce lock esclusivo (bloccante con timeout implicito OS)
        with open(lock_path, "w") as lock_fh:
            try:
                fcntl.flock(lock_fh, fcntl.LOCK_EX)
                # Append atomico: apri in modalità append, scrivi riga JSON
                with open(eval_path, "a", encoding="utf-8") as fh:
                    fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
            finally:
                fcntl.flock(lock_fh, fcntl.LOCK_UN)

        return True

    except Exception as exc:  # noqa: BLE001 — fail-soft, never crash caller
        sys.stderr.write(
            f"[eval-tracker] ERROR {_now_iso()} log_delegation failed: {exc}\n"
        )
        return False


# ---------------------------------------------------------------------------
# CLI minimal — usato nei test E2E
# ---------------------------------------------------------------------------

def _cli_test() -> None:
    """Lancia 3 log sintetici e verifica l'output. Usato per test E2E."""
    import tempfile

    print("[eval-tracker] test E2E — 3 log sintetici")
    results = []

    results.append(log_delegation(
        agent="code-reviewer",
        model="google/gemini-flash-1.5",
        task_type="code_review",
        input_tokens=1200,
        output_tokens=450,
        cost_usd=0.000182,
        latency_ms=1340,
        success=True,
    ))
    results.append(log_delegation(
        agent="research-fact-checker",
        model="deepseek/deepseek-chat",
        task_type="fact_check",
        input_tokens=800,
        output_tokens=320,
        cost_usd=0.000118,
        latency_ms=980,
        success=True,
        user_feedback=4,
    ))
    results.append(log_delegation(
        agent="decision-validator",
        model="google/gemini-flash-1.5",
        task_type="decision_validation",
        input_tokens=600,
        output_tokens=280,
        cost_usd=0.000091,
        latency_ms=720,
        success=False,
        error_type="malformed_output",
    ))

    # Verifica
    eval_path, _ = _resolve_paths()
    if not eval_path.exists():
        print("FAIL — eval.jsonl non creato")
        sys.exit(1)

    with open(eval_path, encoding="utf-8") as fh:
        lines = [l for l in fh if l.strip()]

    # conta solo le 3 scritte in questo test (potrebbero esistere righe precedenti)
    written = sum(1 for r in results if r)
    print(f"PASS — {written}/3 entry scritte. Righe totali in eval.jsonl: {len(lines)}")

    # Leggi ultime 3
    for line in lines[-3:]:
        entry = json.loads(line)
        print(f"  ts={entry['ts']} agent={entry['agent']} success={entry['success']}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        _cli_test()
    else:
        # Uso da CLI: log_delegation via JSON stdin
        # echo '{"agent":"x","model":"y","task_type":"z",...}' | python3 eval.py
        try:
            data = json.load(sys.stdin)
            ok = log_delegation(**data)
            sys.exit(0 if ok else 1)
        except Exception as exc:
            sys.stderr.write(f"[eval-tracker] CLI error: {exc}\n")
            sys.exit(1)
