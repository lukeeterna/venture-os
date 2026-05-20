#!/usr/bin/env python3
"""
replay_last.py — VOS Plan-Execute Replay & Diagnostic Tool
Legge i snapshot da state/plan-snapshots/, elenca le esecuzioni passate
e re-esegue un piano usando plan_execute.py per diagnosi su failure.

Python 3.9 stdlib only. Big Sur compatible.

Usage:
  replay_last.py                       # replay esecuzione più recente
  replay_last.py --list                # elenca ultimi 10 snapshot
  replay_last.py --list --all          # elenca tutti gli snapshot
  replay_last.py --plan-id <id>        # replay piano specifico (più recente match)
  replay_last.py --snap <filename>     # replay snapshot specifico per filename
  replay_last.py --dry-run             # mostra piano senza eseguire
  replay_last.py --help
"""

import json
import os
import sys
import subprocess
import datetime
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# Costanti
# ---------------------------------------------------------------------------

T7_MOUNT = "/Volumes/MontereyT7"
VOS_ROOT = Path(T7_MOUNT) / "venture-os"
SNAPSHOTS_DIR = VOS_ROOT / "state" / "plan-snapshots"
PLAN_EXECUTE_PY = VOS_ROOT / "components" / "llm-router" / "plan_execute.py"

LIST_DEFAULT_LIMIT = 10


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

def _abort(msg: str, code: int = 1) -> None:
    sys.stderr.write(f"[replay] ERROR: {msg}\n")
    sys.exit(code)


def _t7_mounted() -> bool:
    return os.path.ismount(T7_MOUNT)


def _now_iso() -> str:
    return datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


def _ts_from_filename(fname: str) -> str:
    """
    Estrae timestamp leggibile dal nome file snapshot.
    Formato atteso: snapshot_<plan_id>_<YYYYMMDDTHHMMSSZ>[_NN].json
    """
    parts = fname.replace(".json", "").split("_")
    # Cerca la parte che inizia con una data 8 cifre seguita da T
    for p in parts:
        if len(p) >= 9 and p[:8].isdigit() and "T" in p:
            # Formato: 20260520T113154Z → 2026-05-20T11:31:54Z
            try:
                d = p[:8]
                t = p[9:15] if len(p) >= 15 else p[9:]
                return f"{d[:4]}-{d[4:6]}-{d[6:8]}T{t[:2]}:{t[2:4]}:{t[4:6]}Z"
            except Exception:
                return p
    return "unknown-ts"


def _load_snapshot(path: Path) -> dict:
    """Carica e valida un file snapshot. Lancia ValueError se malformato."""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"JSON malformato in {path.name}: {exc}")
    if "plan" not in data or "plan_id" not in data:
        raise ValueError(f"Snapshot {path.name} manca di campi obbligatori 'plan'/'plan_id'.")
    return data


def _all_snapshots_sorted() -> list:
    """
    Ritorna lista di Path snapshot ordinata per mtime descrescente (più recente prima).
    """
    if not SNAPSHOTS_DIR.exists():
        return []
    snaps = sorted(
        [p for p in SNAPSHOTS_DIR.glob("snapshot_*.json")],
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    return snaps


def _status_from_snapshot(snap: dict) -> str:
    """Ritorna status stringa dal snapshot (usa execution_result se disponibile)."""
    er = snap.get("execution_result")
    if er is None:
        return "NO_RESULT"
    if er.get("error"):
        return "ERROR"
    return er.get("status", "UNKNOWN").upper()


def _cost_from_snapshot(snap: dict) -> float:
    """Ritorna costo USD dal snapshot."""
    er = snap.get("execution_result")
    if er is None:
        return 0.0
    return er.get("total_cost_usd", 0.0)


# ---------------------------------------------------------------------------
# List command
# ---------------------------------------------------------------------------

def cmd_list(limit: int) -> int:
    """Elenca ultimi `limit` snapshot con colonne ID, STATUS, COST, TS."""
    if not _t7_mounted():
        _abort(f"T7 non montato a {T7_MOUNT}.")

    snaps = _all_snapshots_sorted()
    if not snaps:
        print(f"Nessuno snapshot trovato in {SNAPSHOTS_DIR}")
        return 0

    display = snaps if limit <= 0 else snaps[:limit]

    # Header
    print(f"{'ID':<45} {'STATUS':<10} {'COST':>8}  {'TS'}")
    print("-" * 80)

    for path in display:
        try:
            snap = _load_snapshot(path)
            plan_id = snap.get("plan_id", "unknown")
            status = _status_from_snapshot(snap)
            cost = _cost_from_snapshot(snap)
            ts_raw = snap.get("ts_start", "")
            # Formatta ts: 20260520T113154Z → 2026-05-20T11:31
            ts_display = _ts_from_filename(path.stem) if not ts_raw else ts_raw[:16]
            cost_str = f"${cost:.4f}" if cost > 0 else "$0.000"
            print(f"{plan_id:<45} {status:<10} {cost_str:>8}  {ts_display}")
        except ValueError as exc:
            print(f"{'[malformed]':<45} {'ERROR':<10} {'N/A':>8}  {path.name}")
            sys.stderr.write(f"[replay] WARN: {exc}\n")

    if limit > 0 and len(snaps) > limit:
        print(f"\n... {len(snaps) - limit} snapshot aggiuntivi. Usa --all per vedere tutti.")

    return 0


# ---------------------------------------------------------------------------
# Replay command
# ---------------------------------------------------------------------------

def cmd_replay(snap_path: Path, dry_run: bool = False) -> int:
    """
    Re-esegue il piano contenuto in snap_path usando plan_execute.py --stdin.
    Stampa diff cost/latency tra original e replay.
    """
    if not _t7_mounted():
        _abort(f"T7 non montato a {T7_MOUNT}.")

    if not PLAN_EXECUTE_PY.exists():
        _abort(f"plan_execute.py non trovato: {PLAN_EXECUTE_PY}")

    try:
        snap = _load_snapshot(snap_path)
    except ValueError as exc:
        _abort(str(exc))

    plan = snap["plan"]
    plan_id = snap["plan_id"]
    orig_result = snap.get("execution_result")

    print(f"[replay] Snapshot: {snap_path.name}")
    print(f"[replay] Plan ID:  {plan_id}")
    print(f"[replay] Origine:  {snap.get('ts_start', 'N/A')}")

    if orig_result:
        print(f"[replay] Status originale:  {orig_result.get('status', 'N/A')}")
        print(f"[replay] Costo originale:   ${orig_result.get('total_cost_usd', 0):.6f}")
        print(f"[replay] Latenza originale: {orig_result.get('total_latency_ms', 0)}ms")
        if orig_result.get("error"):
            print(f"[replay] Errore originale:  {orig_result['error']}")
        subtask_statuses = orig_result.get("subtask_statuses", {})
        if subtask_statuses:
            print(f"[replay] Subtask originali: {subtask_statuses}")
    else:
        print("[replay] WARN: snapshot senza execution_result (piano mai completato?)")

    if dry_run:
        print("\n[replay] DRY-RUN: piano NON eseguito. Piano JSON:")
        print(json.dumps(plan, indent=2, ensure_ascii=False))
        return 0

    print(f"\n[replay] Avvio replay alle {_now_iso()} ...")
    t_start = time.time()

    try:
        proc = subprocess.run(
            [sys.executable, str(PLAN_EXECUTE_PY), "--stdin"],
            input=json.dumps(plan, ensure_ascii=False),
            capture_output=True,
            text=True,
            timeout=600,
        )
    except subprocess.TimeoutExpired:
        _abort("Replay timeout (600s). Piano troppo lungo.")
    except Exception as exc:
        _abort(f"Errore avvio plan_execute.py: {exc}")

    replay_latency_ms = int((time.time() - t_start) * 1000)

    # Stampa stderr del subprocesso per visibilità
    if proc.stderr:
        for line in proc.stderr.strip().splitlines():
            print(f"  {line}")

    if proc.returncode not in (0, 1):
        print(f"\n[replay] plan_execute.py exit code: {proc.returncode}")
        if proc.stdout:
            print(f"[replay] stdout raw:\n{proc.stdout[:500]}")
        return proc.returncode

    try:
        replay_result = json.loads(proc.stdout)
    except json.JSONDecodeError:
        print(f"[replay] ERROR: output JSON non parsabile:\n{proc.stdout[:300]}")
        return 1

    replay_cost = replay_result.get("total_cost_usd", 0.0)
    replay_latency_reported = replay_result.get("total_latency_ms", replay_latency_ms)
    replay_subtask_statuses = {
        r["id"]: r.get("status", "unknown")
        for r in replay_result.get("subtask_results", [])
    }

    # Stampa diff
    print(f"\n{'='*60}")
    print(f"REPLAY DIFF — {plan_id}")
    print(f"{'='*60}")
    print(f"{'Campo':<25} {'Originale':>15}  {'Replay':>15}  {'Delta':>12}")
    print(f"{'-'*25} {'-'*15}  {'-'*15}  {'-'*12}")

    if orig_result:
        orig_cost = orig_result.get("total_cost_usd", 0.0)
        orig_lat = orig_result.get("total_latency_ms", 0)
        orig_status = orig_result.get("status", "N/A")

        cost_delta = replay_cost - orig_cost
        lat_delta = replay_latency_reported - orig_lat

        print(f"{'status':<25} {orig_status:>15}  {('error' if 'error' in replay_result else 'success'):>15}")
        print(f"{'total_cost_usd':<25} {f'${orig_cost:.6f}':>15}  {f'${replay_cost:.6f}':>15}  {f'{cost_delta:+.6f}':>12}")
        print(f"{'total_latency_ms':<25} {f'{orig_lat}ms':>15}  {f'{replay_latency_reported}ms':>15}  {f'{lat_delta:+d}ms':>12}")

        # Subtask diff
        orig_st = orig_result.get("subtask_statuses", {})
        all_ids = sorted(set(list(orig_st.keys()) + list(replay_subtask_statuses.keys())))
        if all_ids:
            print(f"\n{'Subtask':<20} {'Orig status':>15}  {'Replay status':>15}")
            print(f"{'-'*20} {'-'*15}  {'-'*15}")
            for sid in all_ids:
                o_st = orig_st.get(sid, "missing")
                r_st = replay_subtask_statuses.get(sid, "missing")
                changed = " <-- CHANGED" if o_st != r_st else ""
                print(f"{sid:<20} {o_st:>15}  {r_st:>15}{changed}")
    else:
        print(f"{'total_cost_usd':<25} {'N/A':>15}  {f'${replay_cost:.6f}':>15}")
        print(f"{'total_latency_ms':<25} {'N/A':>15}  {f'{replay_latency_reported}ms':>15}")
        print(f"Subtask replay: {replay_subtask_statuses}")

    print(f"{'='*60}")
    print(f"[replay] Completato in {replay_latency_ms}ms wall-clock")

    return 0 if "error" not in replay_result else 1


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def usage() -> None:
    print(__doc__)


def main() -> int:
    args = sys.argv[1:]

    if "--help" in args or "-h" in args:
        usage()
        return 0

    if not _t7_mounted():
        _abort(f"T7 non montato a {T7_MOUNT}. Connetti SSD T7 prima di eseguire.")

    # --list
    if "--list" in args:
        limit = 0 if "--all" in args else LIST_DEFAULT_LIMIT
        return cmd_list(limit)

    # --dry-run flag
    dry_run = "--dry-run" in args

    # --snap <filename> — snapshot specifico per filename
    if "--snap" in args:
        idx = args.index("--snap")
        if idx + 1 >= len(args):
            _abort("--snap richiede un argomento (filename snapshot).")
        snap_name = args[idx + 1]
        snap_path = SNAPSHOTS_DIR / snap_name
        if not snap_path.exists():
            # Prova con .json se non presente
            snap_path = SNAPSHOTS_DIR / (snap_name if snap_name.endswith(".json") else snap_name + ".json")
        if not snap_path.exists():
            _abort(f"Snapshot non trovato: {snap_path}")
        return cmd_replay(snap_path, dry_run=dry_run)

    # --plan-id <id> — piano specifico, replay più recente match
    if "--plan-id" in args:
        idx = args.index("--plan-id")
        if idx + 1 >= len(args):
            _abort("--plan-id richiede un argomento.")
        target_id = args[idx + 1]
        all_snaps = _all_snapshots_sorted()
        matches = []
        for p in all_snaps:
            try:
                snap = _load_snapshot(p)
                if snap.get("plan_id") == target_id:
                    matches.append(p)
            except ValueError:
                continue
        if not matches:
            _abort(f"Nessuno snapshot trovato per plan_id='{target_id}'.")
        if len(matches) > 1:
            sys.stderr.write(
                f"[replay] Trovati {len(matches)} snapshot per '{target_id}'. "
                "Uso il più recente.\n"
            )
        return cmd_replay(matches[0], dry_run=dry_run)

    # Default: replay più recente
    all_snaps = _all_snapshots_sorted()
    if not all_snaps:
        _abort(f"Nessuno snapshot trovato in {SNAPSHOTS_DIR}. "
               "Eseguire plan_execute.py almeno una volta.")
    return cmd_replay(all_snaps[0], dry_run=dry_run)


if __name__ == "__main__":
    sys.exit(main())
