#!/usr/bin/env python3
# venture-os/components/vos_dispatch_dryrun.py
# PostToolUse hook — DRY-RUN ONLY. NON cablato in settings.json. Rollback: rm -f.
# NON spawna mai agenti (spawned=False costante letterale).
# Calco parse_advance/find_dossier/read_current_state copiato 1:1 da
# components/vos_advance_gate.py — NON re-inventato.
#
# Logica: intercetta `vos-factory-run advance <run_id>` con exit_code==0,
# legge lo stato RAGGIUNTO dal dossier, classifica se lo stadio sarebbe
# autonomo o richiede gate umano/esterno, appende record in
# REPO_ROOT/state/dispatch-dryrun.jsonl.
#
# stdlib-only, Python 3.8+, macOS 11 Big Sur-safe.

import sys
import os
import json
import re
import shlex
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(os.environ.get("VOS_REPO", str(Path.home() / "venture-os")))
VENTURES_DIR = REPO_ROOT / "ventures"
KILLED_DIR = REPO_ROOT / "ventures" / "_killed"
STATE_DIR = REPO_ROOT / "state"

# Classificazione esplicita per stadio — DICT, NON euristica sul nome worker.
# (False, reason) = non autonomo; (True, reason) = candidato autonomo.
CLASS = {
    "S1": (True,  "autonomous-ricerca"),
    "S3": (True,  "autonomous-build"),
    "S4": (True,  "autonomous-build"),
    "S5": (False, "external-action"),
    "S2": (False, "human-gate"),
    "S6": (False, "human-gate"),
}


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# Copiato verbatim da vos_advance_gate.py
def parse_advance(command: str):
    try:
        tokens = shlex.split(command)
    except ValueError:
        return None
    idx = None
    for i, t in enumerate(tokens):
        if t == "vos-factory-run" or t.endswith("/vos-factory-run"):
            idx = i
            break
    if idx is None:
        return None
    if idx + 1 >= len(tokens) or tokens[idx + 1] != "advance":
        return None
    for t in tokens[idx + 2:]:
        if t.startswith("--"):
            break
        return t
    return None


# Copiato verbatim da vos_advance_gate.py
def find_dossier(run_id: str):
    candidate = VENTURES_DIR / run_id / "venture-dossier.md"
    if candidate.exists():
        return candidate
    killed = KILLED_DIR / run_id / "venture-dossier.md"
    if killed.exists():
        return killed
    return None


# Copiato verbatim da vos_advance_gate.py
def read_current_state(dossier_text: str):
    m = re.search(r"```yaml\s*\n(.*?)```", dossier_text, re.DOTALL)
    block = m.group(1) if m else dossier_text
    sm = re.search(r"^state:\s*([^\s#]+)", block, re.MULTILINE)
    return sm.group(1).strip() if sm else None


def resolve_worker(dossier_text: str, to_state: str):
    """Estrae il worker dall'header della sezione corrispondente a to_state.
    Forma attesa: ## <state> — ... worker <name>
    Ritorna None se la sezione non esiste o non ha worker dichiarato.
    """
    header_re = re.compile(
        r"^## " + re.escape(to_state) + r"[ \t].*$", re.MULTILINE
    )
    m = header_re.search(dossier_text)
    if not m:
        return None
    line = m.group(0)
    wm = re.search(r"worker\s+(\S+)", line)
    return wm.group(1) if wm else None


def append_record(record: dict):
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    with (STATE_DIR / "dispatch-dryrun.jsonl").open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    if payload.get("tool_name") != "Bash":
        sys.exit(0)

    command = (payload.get("tool_input") or {}).get("command", "") or ""
    run_id = parse_advance(command)
    if run_id is None:
        sys.exit(0)

    # Procedi SOLO se advance ha avuto successo
    exit_code = (payload.get("tool_response") or {}).get("exit_code")
    if exit_code != 0:
        sys.exit(0)

    dossier_path = find_dossier(run_id)
    if dossier_path is None:
        sys.exit(0)

    try:
        dossier_text = dossier_path.read_text(encoding="utf-8")
    except Exception:
        sys.exit(0)

    to_state = read_current_state(dossier_text)
    if to_state is None:
        sys.exit(0)

    resolved_worker = resolve_worker(dossier_text, to_state)

    would_spawn, reason = CLASS.get(to_state, (False, "unknown-stage"))

    record = {
        "ts": now_iso(),
        "run_id": run_id,
        "to_state": to_state,
        "resolved_worker": resolved_worker,
        "would_spawn": would_spawn,
        "reason": reason,
        "spawned": False,  # costante letterale — questo hook NON spawna mai
    }

    try:
        append_record(record)
    except Exception:
        pass

    sys.exit(0)


if __name__ == "__main__":
    main()
