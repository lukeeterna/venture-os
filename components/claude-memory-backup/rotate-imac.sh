#!/bin/bash
# rotate-imac.sh — eseguito SU iMac via ssh stdin pipe da backup.sh.
# Crea snapshot daily.0 hard-linked da current/, ruota daily.0..daily.6, drop daily.7.
# Pattern Time Machine semplificato: hard-link cross-snapshot = costo ~0 byte per file invariato.
#
# WHY rsync --link-dest e non cp -al: BSD cp su macOS non supporta -al (GNU only).
# rsync --link-dest è cross-platform e battle-tested per snapshot rotation.
#
# WHY flock + last-snapshot-date guard: due login MacBook nello stesso giorno NON devono
# generare 2 snapshot identici consumando inode/window. Una rotation per giorno UTC max.

set -u

BASE="$HOME/backups/claude-memory"
LOCK="/tmp/claude-mem-rot.lock.d"
LAST="$BASE/.last-snapshot-date"
TODAY="$(date -u +%Y-%m-%d)"
N=7  # daily.0 .. daily.6 = 7 punti recovery

# Lock atomico via mkdir (flock non disponibile su macOS BSD nativo).
# mkdir su path esistente fallisce atomicamente — race-safe senza tool esterni.
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "ROTATE SKIP locked"
  exit 0
fi
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

if [ ! -d "$BASE/current" ]; then
  echo "ROTATE SKIP no current/ (rsync non ancora eseguito)"
  exit 0
fi

# Una sola rotation per giorno UTC.
if [ -f "$LAST" ] && [ "$(cat "$LAST")" = "$TODAY" ]; then
  echo "ROTATE SKIP already done today ($TODAY)"
  exit 0
fi

# Drop oldest se esiste.
[ -d "$BASE/daily.$((N-1))" ] && rm -rf "$BASE/daily.$((N-1))"

# Shift daily.{N-2..0} → daily.{N-1..1}
i=$((N-2))
while [ $i -ge 0 ]; do
  if [ -d "$BASE/daily.$i" ]; then
    mv "$BASE/daily.$i" "$BASE/daily.$((i+1))"
  fi
  i=$((i-1))
done

# Crea daily.0 come hard-link snapshot di current.
# --link-dest fa hard-link a current/ per ogni file invariato → costo disco solo per delta.
mkdir -p "$BASE/daily.0"
rsync -a --link-dest="$BASE/current" "$BASE/current/" "$BASE/daily.0/"

echo "$TODAY" > "$LAST"
echo "ROTATE OK $TODAY -> daily.0"
