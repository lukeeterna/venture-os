#!/usr/bin/env python3
# ~/.claude/hooks/vos_advance_gate.py  (source-of-truth: ~/venture-os/components/vos_advance_gate.py)
# VOS enforcement — PreToolUse hook (F3a, lettura B stretta)
#
# Blocca l'istanza CC quando prova ad avanzare la fabbrica con
#   `vos-factory-run advance <run_id> ...`
# MENTRE la provenance della STAZIONE CORRENTE (campo `state:` del front-block
# del dossier) e' ancora un placeholder {{...}}.
#
# NB invariante DISTINTO dal runner: il runner (cmd_advance) controlla la
# provenance della DESTINAZIONE (--to target); questo hook controlla la
# provenance della SORGENTE (stazione corrente). Insieme chiudono i due bordi.
# Il calco 1:1 e' su production_claim_gate.py (guardia su una mutazione
# specifica contro una regola letta da file di stato).
#
# Predicato STRETTO (post falsi-positivi rimossi 2026-05-22): agisce SOLO su
# Bash il cui comando invoca `vos-factory-run advance`. Mai su Edit/Write/Task.
#
# Contratto PreToolUse (verificato Claude Code hooks): exit 0 = permetti,
# exit 2 = blocca la tool-call e mostra stderr a Claude. Nessuna dipendenza da
# schema JSON di output -> Big Sur safe (2.1.110). stdlib only, Python 3.8+.

import sys
import os
import json
import re
import shlex
from datetime import datetime, timezone
from pathlib import Path

# Repo root: override via env VOS_REPO (per test), altrimenti symlink canonico.
REPO_ROOT = Path(os.environ.get("VOS_REPO", str(Path.home() / "venture-os")))
VENTURES_DIR = REPO_ROOT / "ventures"
KILLED_DIR = REPO_ROOT / "ventures" / "_killed"
VOS_STATE = REPO_ROOT / "state"

# Stazioni pipeline valide (front-block state: S0..S6). CLOSED/KILLED/SHIPPED
# NON sono stazioni attive -> nessun gate.
ACTIVE_STATE_RE = re.compile(r"^S[0-6]$")


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# --- MATCHER: il comando invoca `vos-factory-run advance`? -------------------
# Ritorna run_id (str) se e' un `advance`, altrimenti None.
# Tokenizza con shlex per evitare match su 'advance' dentro stringhe evidence.
# Questa funzione E' il bersaglio del REGRESSION-GUARD.
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
    # subcommand deve essere esattamente 'advance'
    if idx + 1 >= len(tokens) or tokens[idx + 1] != "advance":
        return None
    # run_id = primo positional dopo 'advance' (usage: advance <run_id> --to ...)
    for t in tokens[idx + 2:]:
        if t.startswith("--"):
            break
        return t
    return None


def find_dossier(run_id: str):
    candidate = VENTURES_DIR / run_id / "venture-dossier.md"
    if candidate.exists():
        return candidate
    killed_candidate = KILLED_DIR / run_id / "venture-dossier.md"
    if killed_candidate.exists():
        return killed_candidate
    return None


def read_current_state(dossier_text: str):
    """Legge il campo state: dal primo front-block ```yaml ... ```."""
    m = re.search(r"```yaml\s*\n(.*?)```", dossier_text, re.DOTALL)
    block = m.group(1) if m else dossier_text
    sm = re.search(r"^state:\s*([^\s#]+)", block, re.MULTILINE)
    if not sm:
        return None
    return sm.group(1).strip()


# --- FIREWALL: identico al runner (bin/vos-factory-run) -----------------------
def check_provenance_compiled(dossier_text: str, section: str) -> bool:
    header_pattern = re.compile(r"^## " + re.escape(section) + r"[ \t]", re.MULTILINE)
    m = header_pattern.search(dossier_text)
    if not m:
        return False
    section_text = dossier_text[m.start():]
    next_header = re.search(r"\n## ", section_text[3:])
    if next_header:
        section_text = section_text[:next_header.start() + 3]
    yaml_blocks = re.findall(r"```yaml(.*?)```", section_text, re.DOTALL)
    for block in yaml_blocks:
        if "provenance:" in block:
            if "{{" in block:
                return False
            stripped = block.strip()
            if not stripped or stripped == "provenance:":
                return False
            return True
    return False


def audit(entry: dict):
    try:
        VOS_STATE.mkdir(parents=True, exist_ok=True)
        entry["ts"] = now_iso()
        with (VOS_STATE / "advance-gate.jsonl").open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        pass


def block(reason: str, **ctx):
    ctx["decision"] = "block"
    ctx["reason"] = reason
    audit(ctx)
    print(reason, file=sys.stderr)
    sys.exit(2)


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
        sys.exit(0)  # non e' un `vos-factory-run advance` -> pass-through

    session_id = payload.get("session_id", "") or "unknown"

    dossier_path = find_dossier(run_id)
    if dossier_path is None:
        # run_id non su disco: il runner dara' errore d'uso, non blocchiamo qui.
        sys.exit(0)

    try:
        dossier_text = dossier_path.read_text(encoding="utf-8")
    except Exception:
        sys.exit(0)

    state = read_current_state(dossier_text)
    if state is None or not ACTIVE_STATE_RE.match(state):
        # CLOSED/KILLED/SHIPPED o assente -> nessuna stazione attiva da gaterare.
        sys.exit(0)

    if check_provenance_compiled(dossier_text, state):
        sys.exit(0)  # provenance corrente compilata -> permetti advance

    block(
        "[VOS ADVANCE-GATE] Blocco `vos-factory-run advance {rid}`: la provenance "
        "della stazione corrente {st} nel dossier ha ancora placeholder {{...}} "
        "(o e' assente). Firewall VOS: compila il blocco provenance: della sezione "
        "{st} in {dp} PRIMA di avanzare la fabbrica.".format(
            rid=run_id, st=state, dp=dossier_path
        ),
        session_id=session_id, run_id=run_id, state=state,
        dossier=str(dossier_path),
    )


if __name__ == "__main__":
    main()
