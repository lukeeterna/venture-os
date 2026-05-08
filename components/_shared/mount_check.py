# Verifica T7 montato. Ogni componente VOS chiama require_t7_or_exit() all'avvio.
# Se T7 non montato: log evento JSONL fallback in ~/.venture-os-disconnected.log + exit 1.
"""Verifica T7 montato. Ogni componente VOS chiama require_t7_or_exit() all'avvio."""
import os
import sys
import json
from datetime import datetime

T7_MOUNTPOINT = "/Volumes/MontereyT7"
FALLBACK_LOG = os.path.expanduser("~/.venture-os-disconnected.log")


def is_t7_mounted() -> bool:
    return os.path.ismount(T7_MOUNTPOINT)


def require_t7_or_exit(component_name: str):
    # Bypass per host remoti (iMac) dove T7 non è collegato.
    # Audit: blueprint-deviations.jsonl S2-MVP Task 3.
    if os.environ.get("VOS_SKIP_MOUNT_CHECK") == "1":
        return
    if is_t7_mounted():
        return
    msg = {
        "ts": datetime.utcnow().isoformat() + "Z",
        "component": component_name,
        "event": "t7_disconnected",
        "action": "exit",
    }
    with open(FALLBACK_LOG, "a") as f:
        f.write(json.dumps(msg) + "\n")
    print(
        f"[{component_name}] T7 non montato su {T7_MOUNTPOINT}. Esco.",
        file=sys.stderr,
    )
    sys.exit(1)


if __name__ == "__main__":
    print("T7 montato:", is_t7_mounted())
