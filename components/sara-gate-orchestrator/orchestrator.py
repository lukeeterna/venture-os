#!/usr/bin/env python3
# Sara Gate Orchestrator (S207): esegue release gate FLUXION completo via VOS.
# Chiamato da self-hosted GitHub Actions runner (MacBook) OR manualmente OR cron VOS.
#
# Wrappa /Volumes/MontereyT7/FLUXION/scripts/sara-release-gate.sh:
#   - SSH iMac, sync repo, pipeline 3002 health check
#   - test_sara_stress_per_verticale.py su tutti i verticali (tier 1+2)
#   - DB integrity check (tier 3)
#   - Output JSON report + audit per-vertical
#
# Output VOS: state/sara-gate-runs.jsonl (consumato da briefer mattutino).
# Exit code propagato: 0=PASS, 1=FAIL, 2=infra.
#
# Pattern Luke: stdlib only (no pip), Big Sur compatible, ssh stateless on-demand.

import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

_SHARED = Path(__file__).resolve().parent.parent / "_shared"
sys.path.insert(0, str(_SHARED))
from mount_check import require_t7_or_exit  # noqa: E402

require_t7_or_exit("sara-gate-orchestrator")

VOS_ROOT = Path("/Volumes/MontereyT7/venture-os")
FLUXION_ROOT = Path("/Volumes/MontereyT7/FLUXION")
GATE_SCRIPT = FLUXION_ROOT / "scripts" / "sara-release-gate.sh"
REPORTS_DIR = FLUXION_ROOT / "docs" / "launch" / "sara-release-gate-reports"
RUNS_LOG = VOS_ROOT / "state" / "sara-gate-runs.jsonl"
ERROR_LOG = VOS_ROOT / "state" / "errors.jsonl"

# Verticali noti — coerente con voice-agent/src/vertical_corrections.py
KNOWN_VERTICALS = [
    "salone", "barbiere", "beauty", "toelettatura",
    "auto", "gommista",
    "medical", "fisioterapia", "odontoiatra",
    "palestra", "wellness",
    "professionale",
]


def _log_error(msg: str, exc: Optional[Exception] = None) -> None:
    entry = {
        "ts": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "component": "sara-gate-orchestrator",
        "msg": msg,
        "error": repr(exc) if exc else None,
    }
    try:
        with open(ERROR_LOG, "a") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception:
        pass


def _parse_trigger() -> dict:
    """Estrae metadata trigger da env (GitHub Actions) o args CLI."""
    gh_event = os.environ.get("GITHUB_EVENT_NAME")
    if gh_event:
        return {
            "trigger": f"github-{gh_event}",
            "ref": os.environ.get("GITHUB_REF", ""),
            "sha": os.environ.get("GITHUB_SHA", "")[:7],
            "pr": os.environ.get("GITHUB_PR_NUMBER") or _gh_pr_from_ref(),
            "actor": os.environ.get("GITHUB_ACTOR", ""),
            "run_id": os.environ.get("GITHUB_RUN_ID", ""),
        }
    if os.environ.get("CRON_RUN") == "1":
        return {"trigger": "vos-cron"}
    return {"trigger": "manual", "actor": os.environ.get("USER", "")}


def _gh_pr_from_ref() -> str:
    ref = os.environ.get("GITHUB_REF", "")
    # refs/pull/123/merge → 123
    if "/pull/" in ref:
        try:
            return ref.split("/pull/")[1].split("/")[0]
        except Exception:
            return ""
    return ""


def _run_gate(extra_args: list) -> tuple:
    """Esegue lo shell wrapper, restituisce (exit_code, stdout, stderr, latest_report_path)."""
    if not GATE_SCRIPT.exists():
        return (2, "", f"gate script non trovato: {GATE_SCRIPT}", None)

    cmd = [str(GATE_SCRIPT)] + extra_args
    print(f"[sara-gate] exec: {' '.join(cmd)}", flush=True)

    # Run sincrono — gate completo richiede 5-12 min, no timeout (gate è blocking by design)
    proc = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=str(FLUXION_ROOT),
    )

    # Trova ultimo report JSON generato (release-gate-YYYYMMDD-HHMMSS.json)
    latest_report = None
    if REPORTS_DIR.exists():
        reports = sorted(REPORTS_DIR.glob("release-gate-*.json"), key=lambda p: p.stat().st_mtime)
        if reports:
            latest_report = reports[-1]

    return (proc.returncode, proc.stdout, proc.stderr, latest_report)


def _audit_per_vertical(report: dict) -> dict:
    """Estrae OK/WARN/FAIL grouped per vertical da report JSON.
    Il release_gate.py emette 'results' come lista di dict con 'vertical' field
    o linee testuali tipo "OK [salone] booking: ...".
    """
    per_vert = {v: {"ok": 0, "warn": 0, "fail": 0, "failures": []} for v in KNOWN_VERTICALS}
    per_vert["_unknown"] = {"ok": 0, "warn": 0, "fail": 0, "failures": []}

    # Failures list (release_gate.py salva linee testuali)
    failures = report.get("failures") or []
    for line in failures:
        # Format atteso: "FAIL [vertical] scenario: ..."
        vert = _extract_vertical(line)
        per_vert[vert]["fail"] += 1
        per_vert[vert]["failures"].append(line)

    # Per ok/warn dobbiamo guardare results dettagliati se presenti
    results = report.get("results") or []
    for r in results:
        if isinstance(r, dict):
            v = r.get("vertical", "_unknown")
            if v not in per_vert:
                per_vert["_unknown"]["ok" if r.get("status") == "OK"
                                     else "warn" if r.get("status") == "WARN"
                                     else "fail"] += 1
                continue
            status = r.get("status", "").upper()
            if status == "OK":
                per_vert[v]["ok"] += 1
            elif status == "WARN":
                per_vert[v]["warn"] += 1
            elif status == "FAIL":
                per_vert[v]["fail"] += 1

    # Compatta — rimuovi verticali con tutti zero
    return {k: v for k, v in per_vert.items()
            if v["ok"] or v["warn"] or v["fail"]}


def _extract_vertical(line: str) -> str:
    """Estrae nome vertical da linea formato 'STATUS [vertical] ...'."""
    if "[" in line and "]" in line:
        try:
            v = line.split("[", 1)[1].split("]", 1)[0].lower().strip()
            return v if v in KNOWN_VERTICALS else "_unknown"
        except Exception:
            return "_unknown"
    return "_unknown"


def _append_run(entry: dict) -> None:
    RUNS_LOG.parent.mkdir(parents=True, exist_ok=True)
    with open(RUNS_LOG, "a") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def main() -> int:
    trigger_meta = _parse_trigger()
    started_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    # Default: full gate (tier 1+2+3). Override via env SARA_GATE_ARGS
    extra_args = os.environ.get("SARA_GATE_ARGS", "").split() if os.environ.get("SARA_GATE_ARGS") else []

    exit_code, stdout, stderr, report_path = _run_gate(extra_args)

    # Stdout/stderr live-forwarded a console CI
    if stdout:
        sys.stdout.write(stdout)
    if stderr:
        sys.stderr.write(stderr)

    finished_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    # Build entry
    entry = {
        "ts": started_at,
        "finished_at": finished_at,
        "exit_code": exit_code,
        "verdict": "PASS" if exit_code == 0 else ("FAIL" if exit_code == 1 else "INFRA_ERROR"),
        "trigger": trigger_meta,
        "report_path": str(report_path.relative_to(FLUXION_ROOT)) if report_path else None,
    }

    if report_path and report_path.exists():
        try:
            with open(report_path) as f:
                report = json.load(f)
            entry["totals"] = report.get("totals", {})
            entry["latency"] = report.get("latency", {})
            entry["duration_sec"] = report.get("duration_sec")
            entry["pipeline_version"] = report.get("pipeline_version")
            entry["per_vertical"] = _audit_per_vertical(report)
            # Failures complete in entry per audit cross-session
            entry["failures"] = report.get("failures", [])
        except Exception as e:  # noqa: BLE001
            _log_error(f"report parse fail: {report_path}", e)
            entry["report_parse_error"] = repr(e)
    else:
        entry["report_missing"] = True

    _append_run(entry)

    # Summary console (per CI log + brief consumer)
    print("\n" + "=" * 64, flush=True)
    print(f"  SARA GATE VERDICT: {entry['verdict']} (exit={exit_code})")
    print(f"  Trigger: {trigger_meta.get('trigger')}")
    if entry.get("totals"):
        t = entry["totals"]
        print(f"  Totals:  OK={t.get('ok', 0)} WARN={t.get('warn', 0)} FAIL={t.get('fail', 0)}")
    if entry.get("per_vertical"):
        fail_verts = [v for v, c in entry["per_vertical"].items() if c["fail"] > 0]
        if fail_verts:
            print(f"  Verticali con FAIL: {', '.join(fail_verts)}")
    print(f"  Log VOS: {RUNS_LOG}")
    print("=" * 64, flush=True)

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
