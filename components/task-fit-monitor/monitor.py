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
    # Fix metodologico 2026-05-26 sera: deduplicare per session_id (multiple spike
    # stessa sessione non sono N saturazioni distinte, è UNA sessione misurata N
    # volte mentre saliva). Correlare con bridge mtime per sapere se sessione
    # è ANCORA VIVA o già chiusa autonomamente.
    cutoff_24h = now - timedelta(hours=24)
    cutoff_live = now - timedelta(minutes=10)
    saturated_by_sid = {}
    for p in peaks:
        ts = _parse_ts(p.get("ts", ""))
        pct = p.get("final_context_pct")
        sid = p.get("session_id", "")
        if ts and ts >= cutoff_24h and isinstance(pct, (int, float)) and pct >= SATURATION_THRESHOLD_PCT:
            # Tieni solo max pct per sid (dedup spike progressivi)
            existing = saturated_by_sid.get(sid)
            if not existing or pct > existing["pct"]:
                # Check sessione ancora viva: bridge file mtime < 10min
                bridge_file = Path(f"/tmp/claude-ctx-{sid}.json")
                is_alive = False
                if bridge_file.exists():
                    try:
                        bmtime = datetime.fromtimestamp(bridge_file.stat().st_mtime, tz=timezone.utc)
                        is_alive = bmtime >= cutoff_live
                    except OSError:
                        pass
                saturated_by_sid[sid] = {
                    "session_id": sid[:8],
                    "cwd": p.get("cwd", "?"),
                    "pct": pct,
                    "session_alive_now": is_alive,
                }
    saturated_recent = list(saturated_by_sid.values())
    saturated_alive = [s for s in saturated_recent if s["session_alive_now"]]
    report["stats"]["saturated_unique_sessions_24h"] = len(saturated_recent)
    report["stats"]["saturated_still_alive"] = len(saturated_alive)

    # Severity: CRITICAL solo se sessione ancora viva (azionabile).
    # HIGH se chiuse autonomamente (pattern preoccupante ma non emergency).
    if saturated_alive:
        report["anomalies"].append({
            "id": "saturation_recurrence_live",
            "severity": "CRITICAL",
            "count": len(saturated_alive),
            "sessions": saturated_alive[:5],
        })
    elif saturated_recent:
        report["anomalies"].append({
            "id": "saturation_recurrence_closed",
            "severity": "HIGH",
            "count": len(saturated_recent),
            "note": "sessioni saturate ultime 24h già chiuse autonomamente — pattern da monitorare",
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

    # --- Bridge file cleanup + multi-session detection (S+ aggiunta 2026-05-26) ---
    # Cleanup file orfani (sessione morta + bridge non rimosso) e detection di
    # sessioni concorrenti stesso progetto che potrebbero competere per context.
    bridge_dir = Path("/tmp")
    cleaned = 0
    active_bridges_by_cwd = defaultdict(list)
    cutoff_orphan = now - timedelta(days=7)
    cutoff_active = now - timedelta(minutes=30)
    for bridge_file in bridge_dir.glob("claude-ctx-*.json"):
        try:
            mtime = datetime.fromtimestamp(bridge_file.stat().st_mtime, tz=timezone.utc)
            # Cleanup orfani >7gg
            if mtime < cutoff_orphan:
                bridge_file.unlink()
                cleaned += 1
                continue
            # Multi-session detection: file recenti
            if mtime >= cutoff_active:
                try:
                    b = json.loads(bridge_file.read_text())
                    pct = b.get("used_pct") or 0
                    if pct >= 40:
                        # Recupero cwd dal session_peaks log (cross-ref)
                        sid = b.get("session_id", "?")
                        cwd_found = None
                        for p in reversed(peaks):
                            if p.get("session_id") == sid:
                                cwd_found = p.get("cwd")
                                break
                        cwd_key = cwd_found or "unknown"
                        active_bridges_by_cwd[cwd_key].append({
                            "session_id": sid[:8],
                            "pct": pct,
                            "state": b.get("budget_state", "?"),
                        })
                except (OSError, ValueError):
                    pass
        except OSError:
            continue

    report["stats"]["bridge_cleaned"] = cleaned
    report["stats"]["active_bridges_by_cwd"] = {
        k: v for k, v in active_bridges_by_cwd.items() if len(v) > 1
    }

    # Anomalia 5: multi-sessione concorrente stesso progetto
    for cwd, sessions in active_bridges_by_cwd.items():
        if len(sessions) >= 2:
            report["anomalies"].append({
                "id": "multi_session_same_project",
                "severity": "MED",
                "cwd": cwd,
                "session_count": len(sessions),
                "sessions": sessions,
            })

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
