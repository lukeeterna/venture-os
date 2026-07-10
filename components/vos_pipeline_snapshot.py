#!/usr/bin/env python3
# venture-os/components/vos_pipeline_snapshot.py
# READ-ONLY snapshot della pipeline-fabbrica VOS.
#
# Legge (SOLA lettura, nessuna mutazione):
#   - ventures/*/venture-dossier.md  (autorita' di STATO: front-block state:/verdict:)
#   - state/factory-runs.jsonl       (ledger ciclo-vita run, append-only)
#   - state/advance-gate.jsonl       (cronologia eventi gate, append-only)
# Emette (UNICO file scritto oltre a se stesso):
#   - state/pipeline.json
#
# Per ogni venture: run_id, state, verdict, per-stazione S0..S6 ->
# provenance_complete (stessa logica di check_provenance_compiled) + classe
# stazione (dict CLASS di vos_dispatch_dryrun), ultimo evento gate, e
# 'discrepancies' = divergenze dossier-vs-jsonl.
#
# check_provenance_compiled e CLASS sono RIUSATI VERBATIM via import dai moduli
# sorgente (zero drift): entrambi side-effect-free su import (main sotto guard).
#
# stdlib-only, Python 3.13, macOS 11 Big Sur-safe. Idempotente: due esecuzioni
# producono pipeline.json identico a meno del campo separato 'generated_ts'.

import sys
import os
import json
import re
from pathlib import Path
from datetime import datetime, timezone

COMPONENTS = Path(__file__).resolve().parent
REPO_ROOT = Path(os.environ.get("VOS_REPO", str(COMPONENTS.parent)))
VENTURES_DIR = REPO_ROOT / "ventures"
STATE_DIR = REPO_ROOT / "state"
OUT_PATH = STATE_DIR / "pipeline.json"

# Riuso verbatim delle logiche autoritative (NON re-inventate).
sys.path.insert(0, str(COMPONENTS))
from vos_advance_gate import check_provenance_compiled  # noqa: E402
from vos_dispatch_dryrun import CLASS                    # noqa: E402

STATIONS = ["S0", "S1", "S2", "S3", "S4", "S5", "S6"]
S_STATES = set(STATIONS)


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_front_block(text: str) -> dict:
    """Estrae run_id/state/verdict dal primo blocco ```yaml (front-block).
    Stessa scelta di ancoraggio di read_current_state in vos_dispatch_dryrun:
    primo blocco yaml del dossier; regex [^\\s#]+ scarta i commenti inline."""
    m = re.search(r"```yaml\s*\n(.*?)```", text, re.DOTALL)
    block = m.group(1) if m else ""

    def field(name: str):
        fm = re.search(r"^" + re.escape(name) + r":\s*([^\s#]+)", block, re.MULTILINE)
        return fm.group(1).strip() if fm else None

    return {
        "run_id": field("run_id"),
        "state": field("state"),
        "verdict": field("verdict"),
    }


def load_jsonl(path: Path) -> list:
    rows = []
    if not path.exists():
        return rows
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return rows


def compute_discrepancies(dstate, jsonl_last_state, gate_events) -> list:
    """Divergenze dossier-vs-jsonl. Il dossier e' l'autorita' di stato; i ledger
    S0..S6 tracciano gli avanzamenti passati dalla CLI. Uno stato terminale
    (CLOSED/KILLED/SHIPPED) o un salto non riflesso nei ledger = divergenza."""
    disc = []
    if dstate is None:
        disc.append("dossier: front-block privo di campo state:")
        return disc

    if dstate in S_STATES:
        if jsonl_last_state is None:
            disc.append(f"dossier state={dstate} ma factory-runs.jsonl: nessun evento per run_id")
        elif jsonl_last_state != dstate:
            disc.append(f"dossier state={dstate} vs factory-runs.jsonl ultimo state={jsonl_last_state}")
    else:
        # stato terminale: non rappresentabile nei ledger S0..S6
        if jsonl_last_state is None:
            disc.append(f"dossier state={dstate} (terminale) ma factory-runs.jsonl: nessun evento per run_id")
        elif jsonl_last_state != dstate:
            disc.append(
                f"dossier state={dstate} (terminale) ma factory-runs.jsonl fermo a "
                f"{jsonl_last_state} — chiusura fuori-CLI, ledger non aggiornato"
            )

    if not gate_events and dstate != "S0":
        disc.append("advance-gate.jsonl: 0 eventi per run_id — nessun avanzamento passato dal gate CLI")

    return disc


def build_snapshot() -> dict:
    factory_runs = load_jsonl(STATE_DIR / "factory-runs.jsonl")
    advance_gate = load_jsonl(STATE_DIR / "advance-gate.jsonl")

    ventures = []
    for dpath in sorted(VENTURES_DIR.glob("*/venture-dossier.md")):
        text = dpath.read_text(encoding="utf-8")
        fb = parse_front_block(text)
        run_id = fb["run_id"] or dpath.parent.name

        stations = {}
        for s in STATIONS:
            would_spawn, reason = CLASS.get(s, (False, "unknown-stage"))
            stations[s] = {
                "provenance_complete": check_provenance_compiled(text, s),
                "station_class": {"would_spawn": would_spawn, "reason": reason},
            }

        fr = sorted((e for e in factory_runs if e.get("run_id") == run_id),
                    key=lambda e: e.get("ts", ""))
        ag = sorted((e for e in advance_gate if e.get("run_id") == run_id),
                    key=lambda e: e.get("ts", ""))
        jsonl_last_state = fr[-1].get("state") if fr else None
        last_gate_event = ag[-1] if ag else None

        ventures.append({
            "run_id": run_id,
            "dossier": str(dpath.relative_to(REPO_ROOT)),
            "state": fb["state"],
            "verdict": fb["verdict"],
            "stations": stations,
            "factory_runs_last_state": jsonl_last_state,
            "last_gate_event": last_gate_event,
            "discrepancies": compute_discrepancies(fb["state"], jsonl_last_state, ag),
        })

    return {"schema": "vos_pipeline_snapshot/1", "ventures": ventures}


def main() -> int:
    snapshot = build_snapshot()
    # generated_ts in campo separato: NON entra nel corpo idempotente.
    payload = dict(snapshot)
    payload["generated_ts"] = now_iso()

    STATE_DIR.mkdir(parents=True, exist_ok=True)
    with OUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")

    print(f"[vos_pipeline_snapshot] {OUT_PATH} — {len(snapshot['ventures'])} venture")
    return 0


if __name__ == "__main__":
    sys.exit(main())
