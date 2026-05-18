#!/usr/bin/env python3
"""
eval_dashboard_core.py — motore Python di eval-dashboard.sh (VOS WAVE 3 P8, S181)
Chiamato da eval-dashboard.sh con env var EVAL_DRY_RUN=0|1.
Python 3.9 stdlib only. Big Sur compatible.
"""

import gzip
import json
import os
import shutil
import sys
import datetime
from collections import defaultdict
from pathlib import Path

# ---------------------------------------------------------------------------
# Costanti
# ---------------------------------------------------------------------------
T7_MOUNT = "/Volumes/MontereyT7"
VOS_ROOT = Path(T7_MOUNT) / "venture-os"
STATE_DIR = VOS_ROOT / "state"
EVAL_JSONL = STATE_DIR / "eval.jsonl"
DELEG_JSONL = STATE_DIR / "delegation-enforcement.jsonl"
WEEKLY_MD = STATE_DIR / "eval-weekly.md"
ALERTS_JSONL = STATE_DIR / "eval-alerts.jsonl"

EUR_RATE = 1.10          # TODO: move to config/routing.yaml
GEMINI_FLASH_QUOTA = 250
GEMINI_FLASH_ALERT_THRESH = 225   # 90% soglia
SUCCESS_RATE_MIN = 80.0
ROTATE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

DRY_RUN = os.environ.get("EVAL_DRY_RUN", "0") == "1"
SCRIPT_TS = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


def _log(msg: str) -> None:
    print(f"{SCRIPT_TS} [eval-dashboard/py] {msg}", flush=True)


def _now_iso() -> str:
    return datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


# ---------------------------------------------------------------------------
# T7 mount check (difesa in profondità — bash già controlla, ma per safety)
# ---------------------------------------------------------------------------
def _check_t7() -> bool:
    if not os.path.ismount(T7_MOUNT):
        _log(f"WARN T7 non montato ({T7_MOUNT}). Skip.")
        sys.exit(0)
    return True


# ---------------------------------------------------------------------------
# Load entries ultimi 7gg
# ---------------------------------------------------------------------------
def _load_entries(cutoff: datetime.datetime) -> list:
    entries = []
    if not EVAL_JSONL.exists():
        return entries
    with open(EVAL_JSONL, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                e = json.loads(line)
                ts_str = e.get("ts", "")
                try:
                    ts = datetime.datetime.strptime(ts_str, "%Y-%m-%dT%H:%M:%SZ")
                    if ts >= cutoff:
                        entries.append(e)
                except ValueError:
                    pass
            except json.JSONDecodeError:
                pass
    return entries


# ---------------------------------------------------------------------------
# Aggregazione
# ---------------------------------------------------------------------------
def _agg_group(entries: list, key_fn) -> list:
    groups: dict = defaultdict(list)
    for e in entries:
        groups[key_fn(e)].append(e)
    rows = []
    for k, es in sorted(groups.items()):
        n = len(es)
        succ = sum(1 for x in es if x.get("success", False))
        sr = succ / n * 100 if n > 0 else 0.0
        avg_c = sum(x.get("cost_usd", 0.0) for x in es) / n if n > 0 else 0.0
        lats = [x.get("latency_ms", 0) for x in es if x.get("latency_ms") is not None]
        avg_l = sum(lats) / len(lats) if lats else 0.0
        rows.append((k, n, sr, avg_c, avg_l))
    return rows


# ---------------------------------------------------------------------------
# Gemini Flash quota ultimi 24h
# ---------------------------------------------------------------------------
def _gemini_flash_24h() -> int:
    if not EVAL_JSONL.exists():
        return 0
    cutoff_24h = datetime.datetime.utcnow() - datetime.timedelta(hours=24)
    count = 0
    with open(EVAL_JSONL, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                e = json.loads(line)
                model = e.get("model", "").lower()
                if "gemini" in model and "flash" in model:
                    ts_str = e.get("ts", "")
                    try:
                        ts = datetime.datetime.strptime(ts_str, "%Y-%m-%dT%H:%M:%SZ")
                        if ts >= cutoff_24h:
                            count += 1
                    except ValueError:
                        pass
            except json.JSONDecodeError:
                pass
    return count


# ---------------------------------------------------------------------------
# Logrotate
# ---------------------------------------------------------------------------
def _rotate_jsonl(path: Path, label: str) -> None:
    if not path.exists():
        return
    size = path.stat().st_size
    if size <= ROTATE_SIZE_BYTES:
        _log(f"{label}: {size / 1024 / 1024:.2f} MB < 10 MB — no rotation")
        return
    now = datetime.datetime.utcnow()
    week_tag = now.strftime("%Y-W%W")
    archive_path = path.parent / f"{path.stem}-{week_tag}.jsonl.gz"
    if DRY_RUN:
        _log(f"DRY_RUN — rotazione {label}: {path} → {archive_path}")
        return
    with open(path, "rb") as f_in, gzip.open(archive_path, "wb") as f_out:
        shutil.copyfileobj(f_in, f_out)
    path.write_text("", encoding="utf-8")
    _log(f"{label} ruotato: {archive_path} ({size / 1024 / 1024:.2f} MB → gz)")


# ---------------------------------------------------------------------------
# Build markdown
# ---------------------------------------------------------------------------
def _table_row(cols: list) -> str:
    return "| " + " | ".join(str(c) for c in cols) + " |"


def _build_markdown(
    entries: list,
    cutoff: datetime.datetime,
    global_success_rate: float,
    total_cost_usd: float,
    avg_latency: float,
    agent_rows: list,
    task_rows: list,
    antipatterns: list,
    gemini_count: int,
    alert_header: str,
) -> str:
    total = len(entries)
    total_cost_eur = total_cost_usd * EUR_RATE
    global_success = sum(1 for e in entries if e.get("success", False))

    def build_table(rows: list, col1: str) -> str:
        t = f"| {col1} | invocations | success_rate | avg_cost_usd | avg_latency_ms |\n"
        t += f"|{'---'*3}|-------------|--------------|--------------|----------------|\n"
        for r in rows:
            t += _table_row([r[0], r[1], f"{r[2]:.1f}%", f"${r[3]:.6f}", f"{r[4]:.0f}"]) + "\n"
        if not rows:
            t += "| — | — | — | — | — |\n"
        return t

    agent_table = build_table(agent_rows, "agent")
    task_table = build_table(task_rows, "task_type")

    if antipatterns:
        ap_section = "### Anti-pattern detected\n\n"
        for day, tt, cnt in sorted(antipatterns):
            ap_section += f"- `{tt}` fallito **{cnt}x** il {day}\n"
        ap_section += "\n"
    else:
        ap_section = "### Anti-pattern detected\n\nNessun anti-pattern (nessun task_type fallito ≥3x nello stesso giorno).\n\n"

    quota_status = "⚠️ ALERT" if gemini_count >= GEMINI_FLASH_ALERT_THRESH else "OK"
    quota_pct = gemini_count / GEMINI_FLASH_QUOTA * 100

    return f"""{alert_header}# VOS Eval Dashboard — ultimi 7gg

_Generato: {_now_iso()} | EUR/USD rate: {EUR_RATE} (hardcoded, TODO: move to config)_

---

## Summary

| metrica | valore |
|---------|--------|
| Total delegations | {total} |
| Total cost | ${total_cost_usd:.6f} USD / €{total_cost_eur:.6f} EUR |
| Avg latency | {avg_latency:.0f} ms |
| Global success rate | {global_success_rate:.1f}% ({global_success}/{total}) |

---

## Per agent

{agent_table}
---

## Per task type

{task_table}
---

{ap_section}### Quota check

Gemini Flash ultimi 24h: **{gemini_count}/{GEMINI_FLASH_QUOTA}** RPD ({quota_pct:.0f}%) — {quota_status}

---

_Fonte: `state/eval.jsonl` | Cutoff 7gg: {cutoff.strftime('%Y-%m-%dT%H:%M:%SZ')}_
"""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    _check_t7()

    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    entries = _load_entries(cutoff)
    _log(f"Entries ultimi 7gg: {len(entries)}")

    # Metriche globali
    total = len(entries)
    total_cost_usd = sum(e.get("cost_usd", 0.0) for e in entries)
    latencies = [e.get("latency_ms", 0) for e in entries if e.get("latency_ms") is not None]
    avg_latency = sum(latencies) / len(latencies) if latencies else 0.0
    global_success = sum(1 for e in entries if e.get("success", False))
    global_success_rate = (global_success / total * 100) if total > 0 else 0.0

    # Aggregazioni
    agent_rows = _agg_group(entries, lambda e: e.get("agent", "unknown"))
    task_rows = _agg_group(entries, lambda e: e.get("task_type", "unknown"))

    # Anti-pattern
    fail_by_day_task: dict = defaultdict(int)
    for e in entries:
        if not e.get("success", True):
            day = e.get("ts", "")[:10] or "unknown"
            fail_by_day_task[(day, e.get("task_type", "unknown"))] += 1
    antipatterns = [(d, tt, cnt) for (d, tt), cnt in fail_by_day_task.items() if cnt >= 3]

    # Gemini Flash quota
    gemini_count = _gemini_flash_24h()

    # Alert header e JSONL
    alert_header = ""
    alerts = []

    if global_success_rate < SUCCESS_RATE_MIN and total > 0:
        alert_header += f"⚠️ ALERT — success rate globale {global_success_rate:.1f}% < {SUCCESS_RATE_MIN:.0f}%\n\n"
        alerts.append({
            "ts": _now_iso(),
            "type": "low_success_rate",
            "value": global_success_rate,
            "threshold": SUCCESS_RATE_MIN,
            "message": f"Global success rate {global_success_rate:.1f}% sotto soglia {SUCCESS_RATE_MIN:.0f}%",
        })

    if gemini_count >= GEMINI_FLASH_ALERT_THRESH:
        pct = gemini_count / GEMINI_FLASH_QUOTA * 100
        alert_header += f"⚠️ ALERT — Gemini Flash {gemini_count}/{GEMINI_FLASH_QUOTA} RPD ({pct:.0f}%)\n\n"
        alerts.append({
            "ts": _now_iso(),
            "type": "gemini_flash_quota",
            "value": gemini_count,
            "threshold": GEMINI_FLASH_ALERT_THRESH,
            "message": f"Gemini Flash {gemini_count} req/24h >= {GEMINI_FLASH_ALERT_THRESH} (90% quota {GEMINI_FLASH_QUOTA} RPD)",
        })

    # Build markdown
    md = _build_markdown(
        entries=entries,
        cutoff=cutoff,
        global_success_rate=global_success_rate,
        total_cost_usd=total_cost_usd,
        avg_latency=avg_latency,
        agent_rows=agent_rows,
        task_rows=task_rows,
        antipatterns=antipatterns,
        gemini_count=gemini_count,
        alert_header=alert_header,
    )

    if DRY_RUN:
        _log("DRY_RUN — markdown che verrebbe scritto:")
        print(md)
    else:
        with open(WEEKLY_MD, "w", encoding="utf-8") as fh:
            fh.write(md)
        _log(f"Scritto {WEEKLY_MD}")

    # Scrivi alert JSONL
    if alerts and not DRY_RUN:
        with open(ALERTS_JSONL, "a", encoding="utf-8") as fh:
            for a in alerts:
                fh.write(json.dumps(a, ensure_ascii=False) + "\n")
        _log(f"Scritti {len(alerts)} alert in {ALERTS_JSONL}")

    # Logrotate
    _rotate_jsonl(EVAL_JSONL, "eval.jsonl")
    _rotate_jsonl(DELEG_JSONL, "delegation-enforcement.jsonl")

    _log("main completato OK")


if __name__ == "__main__":
    main()
