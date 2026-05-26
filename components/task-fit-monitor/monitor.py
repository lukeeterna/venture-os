#!/usr/bin/env python3
"""
Task-Context Fit Monitor — daily health check VOS.

Scopo: vigilare attivamente sul MVP logger v0.1 (deployato 2026-05-26).
Schedule: LaunchAgent com.luke.vos.task-fit-monitor.plist daily 08:00.

Anomalie monitorate:
  1. Heartbeat task_context_logger silente > 24h → fail-soft mascherato
  2. Heartbeat session_peak_logger silente > 24h → idem
  3. Sessioni saturate (peak >= 80%) ultime 24h → pattern S192/S290 ricorrenza
  4. Score-vs-peak ratio anomalo (stima troppo bassa o troppo alta vs reale)

Output:
  - Append a ~/venture-os/state/task-fit-monitor.jsonl (audit + brief consumer)
  - osascript notification SE anomalia HIGH/CRITICAL (no notify per stato OK)

Calibrazione gate: dopo 14gg (target 2026-06-09) emette raccomandazione
soglia data-driven se N joined >= 50.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from pathlib import Path
from statistics import mean, median, stdev


STATE_DIR = Path.home() / "venture-os" / "state"
SCORES_PATH = STATE_DIR / "task-fit-scores.jsonl"
PEAKS_PATH = STATE_DIR / "session-peaks.jsonl"
MONITOR_LOG = STATE_DIR / "task-fit-monitor.jsonl"

# Soglie
HEARTBEAT_SILENT_HOURS = 24
SATURATION_THRESHOLD_PCT = 80
CALIBRATION_TARGET_DATE = datetime(2026, 6, 9, tzinfo=timezone.utc)
CALIBRATION_MIN_N = 50


def _read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    out = []
    try:
        for line in path.read_text().splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                out.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    except OSError:
        return []
    return out


def _parse_ts(s: str) -> datetime | None:
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None


def _notify(title: str, subtitle: str, msg: str) -> None:
    safe = lambda s: s.replace('"', '\\"')[:200]
    try:
        subprocess.run([
            "/usr/bin/osascript",
            "-e",
            f'display notification "{safe(msg)}" with title "{safe(title)}" subtitle "{safe(subtitle)}"',
        ], timeout=5, check=False, capture_output=True)
    except (OSError, subprocess.SubprocessError):
        pass


def main() -> int:
    now = datetime.now(timezone.utc)
    report: dict = {
        "ts": now.isoformat(),
        "hook": "task_fit_monitor",
        "version": "0.1.0",
        "anomalies": [],
        "stats": {},
    }

    scores = _read_jsonl(SCORES_PATH)
    peaks = _read_jsonl(PEAKS_PATH)

    report["stats"]["scores_total"] = len(scores)
    report["stats"]["peaks_total"] = len(peaks)

    # --- Anomalia 1+2: heartbeat silente ---
    def _last_ts(entries: list[dict]) -> datetime | None:
        ts_list = [_parse_ts(e.get("ts", "")) for e in entries]
        ts_list = [t for t in ts_list if t]
        return max(ts_list) if ts_list else None

    last_score = _last_ts(scores)
    last_peak = _last_ts(peaks)
    silence_threshold = now - timedelta(hours=HEARTBEAT_SILENT_HOURS)

    if last_score is None:
        report["anomalies"].append({"id": "no_scores_ever", "severity": "HIGH"})
    elif last_score < silence_threshold:
        hours = (now - last_score).total_seconds() / 3600
        report["anomalies"].append({
            "id": "task_context_logger_silent",
            "severity": "HIGH",
            "hours_silent": round(hours, 1),
        })
    report["stats"]["last_score_ts"] = last_score.isoformat() if last_score else None

    if last_peak is None:
        report["anomalies"].append({"id": "no_peaks_ever", "severity": "HIGH"})
    elif last_peak < silence_threshold:
        hours = (now - last_peak).total_seconds() / 3600
        report["anomalies"].append({
            "id": "session_peak_logger_silent",
            "severity": "HIGH",
            "hours_silent": round(hours, 1),
        })
    report["stats"]["last_peak_ts"] = last_peak.isoformat() if last_peak else None

    # --- Anomalia 3: saturazioni ultime 24h ---
    cutoff_24h = now - timedelta(hours=24)
    saturated_recent = []
    for p in peaks:
        ts = _parse_ts(p.get("ts", ""))
        pct = p.get("final_context_pct")
        if ts and ts >= cutoff_24h and isinstance(pct, (int, float)) and pct >= SATURATION_THRESHOLD_PCT:
            saturated_recent.append({
                "session_id": p.get("session_id", "?")[:8],
                "cwd": p.get("cwd", "?"),
                "pct": pct,
            })
    report["stats"]["saturated_sessions_24h"] = len(saturated_recent)
    if saturated_recent:
        report["anomalies"].append({
            "id": "saturation_recurrence",
            "severity": "CRITICAL",
            "count": len(saturated_recent),
            "sessions": saturated_recent[:5],
        })

    # --- Anomalia 4: score-vs-peak correlazione ---
    scores_by_sid = {}
    for s in scores:
        sid = s.get("session_id")
        if sid and s.get("file_detected") and isinstance(s.get("score_pct_of_1M"), (int, float)):
            scores_by_sid[sid] = s["score_pct_of_1M"]
    peaks_by_sid = {}
    for p in peaks:
        sid = p.get("session_id")
        if sid and isinstance(p.get("final_context_pct"), (int, float)):
            peaks_by_sid[sid] = p["final_context_pct"]

    joined = [(sid, scores_by_sid[sid], peaks_by_sid[sid])
              for sid in scores_by_sid if sid in peaks_by_sid]
    report["stats"]["joined_n"] = len(joined)

    if joined:
        ratios = [p / max(s, 0.1) for _, s, p in joined]
        report["stats"]["score_peak_ratio"] = {
            "median": round(median(ratios), 2),
            "mean": round(mean(ratios), 2),
            "stdev": round(stdev(ratios), 2) if len(ratios) > 1 else None,
            "min": round(min(ratios), 2),
            "max": round(max(ratios), 2),
        }

    # --- Calibrazione gate dopo target date ---
    if now >= CALIBRATION_TARGET_DATE and len(joined) >= CALIBRATION_MIN_N:
        report["calibration_ready"] = True
        report["calibration_recommendation"] = (
            f"Target date raggiunta + N={len(joined)} >= {CALIBRATION_MIN_N}. "
            f"Pronto per introdurre gate hard SPLIT-forcing data-driven. "
            f"Analizza score-peak correlation, definisci soglia."
        )
    elif now >= CALIBRATION_TARGET_DATE:
        report["calibration_ready"] = False
        report["calibration_recommendation"] = (
            f"Target date raggiunta ma N={len(joined)} < {CALIBRATION_MIN_N}. "
            f"Estendere periodo logging."
        )

    # --- Audit log append ---
    try:
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        with MONITOR_LOG.open("a") as f:
            f.write(json.dumps(report) + "\n")
    except OSError:
        pass

    # --- Notify se anomalia HIGH/CRITICAL ---
    critical = [a for a in report["anomalies"] if a.get("severity") in ("HIGH", "CRITICAL")]
    if critical:
        ids = ", ".join(a["id"] for a in critical[:3])
        _notify(
            "VOS Task-Fit Monitor",
            f"{len(critical)} anomaly",
            f"{ids}. Vedi state/task-fit-monitor.jsonl"
        )

    # Stdout sintetico (per cron/manual run)
    print(json.dumps({
        "anomalies": len(report["anomalies"]),
        "scores": len(scores),
        "peaks": len(peaks),
        "joined": len(joined),
        "saturated_24h": len(saturated_recent),
    }))
    return 0


if __name__ == "__main__":
    sys.exit(main())
