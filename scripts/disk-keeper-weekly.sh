#!/bin/bash
# S173 — wrapper bash per LaunchAgent disk-keeper.
# Lancia keeper.py via Python explicit + redirect output al log JSONL della componente.
# Motivazione: chiamata diretta Python da launchd → status 78 (TCC/FDA Python non autorizzato).
#   Bash wrapper aggira il problema usando PATH esteso e cd a VOS_ROOT prima del run.

set -u
VOS_ROOT="/Volumes/MontereyT7/venture-os"
LOG="${VOS_ROOT}/state/disk-keeper-launchd.log"
PY="/usr/local/opt/python@3.13/bin/python3"

# Mount check inline (T7 deve esistere prima di toccare config/state).
if [ ! -d "${VOS_ROOT}" ]; then
  echo "[disk-keeper-weekly] $(date -u +%FT%TZ) T7 non montato. Skip." >> "${LOG}" 2>&1 || true
  exit 0
fi

cd "${VOS_ROOT}" || exit 1

{
  echo "=== $(date -u +%FT%TZ) disk-keeper-weekly start (trigger=launchd) ==="
  "${PY}" "${VOS_ROOT}/components/disk-keeper/keeper.py" --execute --yes
  rc=$?
  echo "=== $(date -u +%FT%TZ) disk-keeper-weekly end rc=${rc} ==="
} >> "${LOG}" 2>&1
exit 0
