#!/usr/bin/env python3
# Session-health VOS S174: monitor sessione Claude attiva (NON macchina, già coperto da host-monitor).
# Probe: context_pct, turn_count, drift_signals, session_age_minutes.
# Append JSON-line a state/session-health.jsonl. Errori in state/errors.jsonl.
"""Stdlib only. Vincolo #5 zero-cost. Vincolo #11 infra anti-drift S159."""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# Path shared module (mount_check)
_SHARED = Path(__file__).resolve().parent.parent / "_shared"
sys.path.insert(0, str(_SHARED))
from mount_check import require_t7_or_exit  # noqa: E402

require_t7_or_exit("session-health")

COMPONENT = "session-health"
VOS_ROOT = Path("/Volumes/MontereyT7/venture-os")
STATE_DIR = VOS_ROOT / "state"
STATE_DIR.mkdir(parents=True, exist_ok=True)
PROBE_LOG = STATE_DIR / "session-health.jsonl"
ERROR_LOG = STATE_DIR / "errors.jsonl"
DEVIATIONS_LOG = STATE_DIR / "blueprint-deviations.jsonl"

# Sessione Claude attiva: cwd encoded /Volumes/MontereyT7/venture-os → -Volumes-MontereyT7-venture-os
CLAUDE_PROJECTS = Path.home() / ".claude" / "projects"
DEFAULT_PROJECT_DIR = CLAUDE_PROJECTS / "-Volumes-MontereyT7-venture-os"

# Soglie (vincolo #7 context budget). Tunable via env.
CTX_WARN = float(os.environ.get("VOS_SH_CTX_WARN", "50"))
CTX_CRITICAL = float(os.environ.get("VOS_SH_CTX_CRITICAL", "70"))
TURN_WARN = int(os.environ.get("VOS_SH_TURN_WARN", "80"))
TURN_CRITICAL = int(os.environ.get("VOS_SH_TURN_CRITICAL", "120"))
DRIFT_WARN = int(os.environ.get("VOS_SH_DRIFT_WARN", "3"))

# Token budget proxy: Opus 4 default 200k, 1M context variant via env.
CTX_WINDOW_TOKENS = int(os.environ.get("VOS_CTX_WINDOW_TOKENS", "200000"))
# Char→token ratio empirico (JSON+text misto): ~3.5 char/tok per inglese, ~3.0 per italiano misto.
CHARS_PER_TOKEN = float(os.environ.get("VOS_SH_CHARS_PER_TOKEN", "3.3"))


def _log_error(msg: str, exc: Optional[Exception] = None) -> None:
    entry = {
        "ts": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "component": COMPONENT,
        "msg": msg,
        "error": repr(exc) if exc else None,
    }
    try:
        with open(ERROR_LOG, "a") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception:
        pass


def _resolve_session_file(project_dir: Path, explicit: Optional[str]) -> Optional[Path]:
    """Risolve path session jsonl: explicit > most-recent in project_dir."""
    if explicit:
        p = Path(explicit)
        if p.exists():
            return p
        # explicit potrebbe essere solo session-id
        candidate = project_dir / f"{explicit}.jsonl"
        if candidate.exists():
            return candidate
        _log_error(f"session file not found: {explicit}")
        return None
    if not project_dir.exists():
        _log_error(f"project dir missing: {project_dir}")
        return None
    sessions = [p for p in project_dir.glob("*.jsonl") if p.is_file()]
    if not sessions:
        return None
    sessions.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return sessions[0]


def _extract_text_chars(record: dict) -> int:
    """Estrae chars testuali da record user/assistant (best-effort)."""
    msg = record.get("message") or {}
    content = msg.get("content")
    if content is None:
        # fallback: vecchi formati con 'text' top-level
        content = record.get("text") or ""
    if isinstance(content, str):
        return len(content)
    if isinstance(content, list):
        total = 0
        for block in content:
            if isinstance(block, dict):
                txt = block.get("text") or block.get("content") or ""
                if isinstance(txt, str):
                    total += len(txt)
                elif isinstance(txt, list):
                    # tool_result nested
                    for sub in txt:
                        if isinstance(sub, dict):
                            total += len(sub.get("text") or "")
        return total
    return 0


def _parse_session(jsonl_path: Path) -> dict:
    """Conta turn, chars testuali, ts min/max. Resiliente a JSON malformato."""
    user_count = 0
    asst_count = 0
    total_chars = 0
    ts_min: Optional[str] = None
    ts_max: Optional[str] = None
    bad_lines = 0
    try:
        with open(jsonl_path, "r", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                except Exception:
                    bad_lines += 1
                    continue
                rtype = rec.get("type")
                if rtype == "user":
                    user_count += 1
                    total_chars += _extract_text_chars(rec)
                elif rtype == "assistant":
                    asst_count += 1
                    total_chars += _extract_text_chars(rec)
                ts = rec.get("timestamp")
                if ts:
                    if ts_min is None or ts < ts_min:
                        ts_min = ts
                    if ts_max is None or ts > ts_max:
                        ts_max = ts
    except Exception as e:  # noqa: BLE001
        _log_error(f"parse session failed: {jsonl_path}", e)
    return {
        "user_count": user_count,
        "asst_count": asst_count,
        "turn_count": user_count + asst_count,
        "total_chars": total_chars,
        "ts_min": ts_min,
        "ts_max": ts_max,
        "bad_lines": bad_lines,
    }


def _count_drift_since(ts_min: Optional[str]) -> int:
    """Conta entry blueprint-deviations.jsonl con ts >= session start (proxy drift sessione)."""
    if not ts_min or not DEVIATIONS_LOG.exists():
        return 0
    count = 0
    try:
        with open(DEVIATIONS_LOG, "r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                except Exception:
                    continue
                ts = rec.get("ts") or ""
                # Confronto ISO string-safe se entrambi Z-suffix; normalizza fallback.
                if ts and ts >= ts_min:
                    count += 1
    except Exception as e:  # noqa: BLE001
        _log_error("read deviations fail", e)
    return count


def _age_minutes(ts_min: Optional[str]) -> Optional[float]:
    if not ts_min:
        return None
    try:
        dt = datetime.fromisoformat(ts_min.replace("Z", "+00:00"))
        delta = (datetime.now(timezone.utc) - dt).total_seconds() / 60.0
        return round(delta, 1)
    except Exception as e:  # noqa: BLE001
        _log_error(f"age parse fail: {ts_min}", e)
        return None


def _classify(probe: dict) -> dict:
    """Verdict per metrica + overall (max severity)."""
    ctx = probe.get("context_pct") or 0
    tc = probe.get("turn_count") or 0
    dr = probe.get("drift_signals") or 0
    levels = {"ok": 0, "warn": 1, "critical": 2}
    ctx_v = "critical" if ctx >= CTX_CRITICAL else ("warn" if ctx >= CTX_WARN else "ok")
    tc_v = "critical" if tc >= TURN_CRITICAL else ("warn" if tc >= TURN_WARN else "ok")
    dr_v = "warn" if dr >= DRIFT_WARN else "ok"
    overall = max([ctx_v, tc_v, dr_v], key=lambda v: levels[v])
    return {"context_verdict": ctx_v, "turn_verdict": tc_v, "drift_verdict": dr_v, "overall": overall}


def probe(session_path: Path) -> dict:
    now_iso = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    parsed = _parse_session(session_path)
    est_tokens = int(parsed["total_chars"] / CHARS_PER_TOKEN) if CHARS_PER_TOKEN > 0 else 0
    context_pct = round(100.0 * est_tokens / CTX_WINDOW_TOKENS, 2) if CTX_WINDOW_TOKENS > 0 else None
    drift = _count_drift_since(parsed["ts_min"])
    age = _age_minutes(parsed["ts_min"])
    data = {
        "ts": now_iso,
        "component": COMPONENT,
        "session_file": str(session_path),
        "session_id": session_path.stem,
        "turn_count": parsed["turn_count"],
        "user_turns": parsed["user_count"],
        "assistant_turns": parsed["asst_count"],
        "total_chars": parsed["total_chars"],
        "est_tokens": est_tokens,
        "context_window_tokens": CTX_WINDOW_TOKENS,
        "context_pct": context_pct,
        "drift_signals": drift,
        "session_age_minutes": age,
        "first_ts": parsed["ts_min"],
        "last_ts": parsed["ts_max"],
        "parse_bad_lines": parsed["bad_lines"],
        "thresholds": {
            "ctx_warn": CTX_WARN, "ctx_critical": CTX_CRITICAL,
            "turn_warn": TURN_WARN, "turn_critical": TURN_CRITICAL,
            "drift_warn": DRIFT_WARN,
        },
    }
    data.update(_classify(data))
    return data


def main() -> int:
    ap = argparse.ArgumentParser(description="VOS session-health probe (S174)")
    ap.add_argument("--probe", action="store_true", help="run probe (default action)")
    ap.add_argument("--session", help="path or session-id (default: most recent in project dir)")
    ap.add_argument("--project-dir", default=str(DEFAULT_PROJECT_DIR), help="claude project dir")
    ap.add_argument("--quiet", action="store_true", help="suppress stdout (hook mode)")
    args = ap.parse_args()

    project_dir = Path(args.project_dir)
    session_path = _resolve_session_file(project_dir, args.session)
    if not session_path:
        _log_error(f"no session file resolved (project_dir={project_dir})")
        if not args.quiet:
            print(json.dumps({"component": COMPONENT, "error": "no_session_file"}))
        return 2

    try:
        data = probe(session_path)
    except Exception as e:  # noqa: BLE001
        _log_error("probe fatal", e)
        return 1

    line = json.dumps(data, ensure_ascii=False)
    try:
        with open(PROBE_LOG, "a") as f:
            f.write(line + "\n")
    except Exception as e:  # noqa: BLE001
        _log_error("write probe log failed", e)
        return 1

    if not args.quiet:
        print(line)
    return 0


if __name__ == "__main__":
    sys.exit(main())
