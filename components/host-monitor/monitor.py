#!/usr/bin/env python3
# Host-monitor VOS: probe risorse macchina (MacBook + iMac via SSH).
# Append JSON-line a state/host-monitor.jsonl. Errori in state/errors.jsonl, mai stack trace su stdout.
"""Probe leggero: CPU, RAM, disk %, uptime, load, temp (best-effort)."""

import json
import os
import platform
import socket
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# Path shared module
_SHARED = Path(__file__).resolve().parent.parent / "_shared"
sys.path.insert(0, str(_SHARED))
from mount_check import require_t7_or_exit  # noqa: E402

require_t7_or_exit("host-monitor")

import psutil  # noqa: E402

COMPONENT = "host-monitor"

# Path output: in modalità SKIP_MOUNT_CHECK (iMac) usa path remoto, altrimenti T7
if os.environ.get("VOS_SKIP_MOUNT_CHECK") == "1":
    STATE_DIR = Path.home() / "venture-os-remote" / "state"
else:
    STATE_DIR = Path("/Volumes/MontereyT7/venture-os/state")

STATE_DIR.mkdir(parents=True, exist_ok=True)
PROBE_LOG = STATE_DIR / "host-monitor.jsonl"
ERROR_LOG = STATE_DIR / "errors.jsonl"


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


def _safe(fn, default=None):
    """Esegue fn() best-effort, logga errore non fatale, ritorna default."""
    try:
        return fn()
    except Exception as e:  # noqa: BLE001
        _log_error(f"probe field failed: {fn.__name__ if hasattr(fn, '__name__') else 'lambda'}", e)
        return default


def _disk_pct(path: str):
    try:
        if not os.path.exists(path):
            return None
        u = psutil.disk_usage(path)
        return round(u.percent, 2)
    except Exception as e:  # noqa: BLE001
        _log_error(f"disk_usage failed for {path}", e)
        return None


def _temp_cpu_c():
    """Best-effort temperatura CPU. Su macOS Big Sur quasi sempre None."""
    try:
        if not hasattr(psutil, "sensors_temperatures"):
            return None
        temps = psutil.sensors_temperatures()
        if not temps:
            return None
        for entries in temps.values():
            for e in entries:
                if e.current and e.current > 0:
                    return round(e.current, 1)
        return None
    except Exception:
        return None


def probe() -> dict:
    now_iso = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    cpu_pct = _safe(lambda: psutil.cpu_percent(interval=1.0))
    vm = _safe(psutil.virtual_memory)
    boot = _safe(psutil.boot_time, default=0)
    uptime_h = round((time.time() - boot) / 3600.0, 2) if boot else None
    load = _safe(lambda: os.getloadavg()[1])  # 5min
    return {
        "hostname": socket.gethostname(),
        "ts": now_iso,
        "os_name": platform.system(),
        "os_version": platform.mac_ver()[0] or platform.release(),
        "cpu_percent": cpu_pct,
        "mem_total_gb": round(vm.total / (1024**3), 2) if vm else None,
        "mem_used_pct": round(vm.percent, 2) if vm else None,
        "disk_root_used_pct": _disk_pct("/"),
        "disk_data_used_pct": _disk_pct("/System/Volumes/Data"),
        "disk_t7_used_pct": _disk_pct("/Volumes/MontereyT7"),
        "uptime_hours": uptime_h,
        "load_avg_5min": round(load, 2) if load is not None else None,
        "temp_cpu_c": _temp_cpu_c(),
        "skip_mount_check": os.environ.get("VOS_SKIP_MOUNT_CHECK") == "1",
    }


def main() -> int:
    try:
        data = probe()
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
    print(line)
    return 0


if __name__ == "__main__":
    sys.exit(main())
