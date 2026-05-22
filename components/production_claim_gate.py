#!/usr/bin/env python3
# ~/.claude/hooks/production_claim_gate.py
# VOS enforcement — Stop hook
#
# Blocca l'istanza CC child quando dichiara "ready/done/production/E2E funzionante"
# SENZA che ~/venture-os/state/gate-state-<PROJECT>.json lo confermi.
#
# Implementa Parte 5.2 di VOS-PRODUCTION-PROTOCOL.md.
#
# Schema Stop hook (verificato 2.1.x): riceve last_assistant_message su stdin,
# puo' bloccare con {"decision":"block","reason":"..."}.
# Compatibile 2.1.110 Big Sur. Nessun npm update.

import sys
import json
import re
from pathlib import Path

VOS_STATE = Path.home() / "venture-os" / "state"

# Pattern di "dichiarazione di completamento" (IT + EN)
READY_CLAIM_PATTERNS = [
    r"\bproduction[- ]?ready\b",
    r"\bpronto per (la )?produzione\b",
    r"\bE2E (funzionante|ok|completo|verificato|passa)\b",
    r"\bpipeline (funzionante|completa|pronta)\b",
    r"\b(tutto|sistema) (funziona|pronto|completo|done)\b",
    r"\bgate (verde|passed|ok)\b",
    r"\bgiorni[- ]a[- ]revenue\b",
    r"\bdistance[- ]to[- ]revenue\b",
    r"\b\d+\s*(giorni|gg|days)\s*(a|to|per|al)\s*(€|revenue|primo|sale)\b",
]

PROJECT_PATTERNS = {
    "ARGOS": ["argos", "combaretrovamiauto", "europeanautoscout"],
    "FLUXION": ["fluxion"],
    "GUARDIAN": ["guardian"],
}


def detect_project(cwd):
    if not cwd:
        return None
    cwd_l = cwd.lower()
    for proj, pats in PROJECT_PATTERNS.items():
        if any(p in cwd_l for p in pats):
            return proj
    return None


def load_gate_state(project):
    f = VOS_STATE / f"gate-state-{project}.json"
    if not f.exists():
        return None
    try:
        return json.loads(f.read_text())
    except Exception:
        return None


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    msg = payload.get("last_assistant_message", "") or ""
    cwd = payload.get("cwd", "") or ""
    project = detect_project(cwd)

    if project is None:
        sys.exit(0)

    msg_l = msg.lower()
    claim_hits = [p for p in READY_CLAIM_PATTERNS if re.search(p, msg_l)]
    if not claim_hits:
        sys.exit(0)  # nessuna dichiarazione di completamento, pass

    gate = load_gate_state(project)

    # Caso 1: gate-state assente → blocca, serve mappatura prima
    if gate is None:
        block(
            f"Hai usato linguaggio di completamento/stima per {project}, ma "
            f"~/venture-os/state/gate-state-{project}.json NON esiste. "
            f"Prima esegui Fase A (chain-map) del VOS-PRODUCTION-PROTOCOL. "
            f"Vietato dichiarare ready o stimare giorni senza chain-map verificata."
        )
        return

    # Caso 2: gate-state dice NON ready → blocca con la reason reale
    if not gate.get("production_ready", False):
        reason = gate.get("blocking_reason", "production_ready=false")
        safety = gate.get("safety_suite", {})
        e2e = gate.get("e2e_real_run_observed", False)
        block(
            f"[VOS BLOCK] Dichiarazione di completamento/stima rilevata per {project}, "
            f"ma gate-state dice production_ready=FALSE. "
            f"Blocco: {reason}. "
            f"Safety suite: {safety.get('passed', 0)}/{safety.get('total', '?')} pass. "
            f"E2E real run osservata da Luke: {e2e}. "
            f"Riformula con lo STATO REALE degli anelli (VERIFIED/EXISTS/MISSING), "
            f"non con una dichiarazione di 'ready' o una stima in giorni. "
            f"Il numero vero e' 'anelli VERIFIED su totale', non 'giorni-a-revenue'."
        )
        return

    # Caso 3: gate dice ready → pass (la dichiarazione e' supportata dai dati)
    sys.exit(0)


def block(reason):
    print(json.dumps({"decision": "block", "reason": reason}, ensure_ascii=False))
    sys.exit(0)


if __name__ == "__main__":
    main()
