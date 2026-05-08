#!/bin/bash
# claude-memory-backup.sh — rsync di tutte le ~/.claude/projects/*/memory/ verso iMac.
# Triggered da LaunchAgent com.luke.vos.claude-memory-backup RunAtLoad=true.
# Pattern: event-based al login MacBook (vincolo VOS, MacBook spento la notte).
# Recovery loss max: 1 giorno. Files sono YAML/MD piccoli, costo rete trascurabile.

set -u

LOG="$HOME/venture-os/state/claude-memory-rsync.log"
SRC="$HOME/.claude/projects/"
DST="imac:backups/claude-memory/current/"
ROTATE_SCRIPT="$HOME/venture-os/components/claude-memory-backup/rotate-imac.sh"
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Guard 1: SRC esiste e non vuoto (evita --delete che azzera backup remoto)
if [ ! -d "$SRC" ] || [ -z "$(ls -A "$SRC" 2>/dev/null)" ]; then
  echo "$TS SKIP src missing or empty: $SRC" >> "$LOG"
  exit 0
fi

# Guard 2: iMac raggiungibile (timeout breve, non bloccare boot)
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes imac "true" 2>/dev/null; then
  echo "$TS FAIL ssh-unreachable" >> "$LOG"
  exit 0
fi

# rsync filter: include dir intermedie + memory completo, esclude tutto il resto.
# --prune-empty-dirs rimuove progetti senza memory dalla destinazione.
OUT=$(rsync -a --delete --prune-empty-dirs \
  --include='*/' \
  --include='*/memory/***' \
  --exclude='*' \
  "$SRC" "$DST" 2>&1)
RC=$?

if [ $RC -eq 0 ]; then
  N_FILES=$(echo "$OUT" | grep -cv '^$')
  echo "$TS OK lines=$N_FILES" >> "$LOG"

  # Rotation snapshot su iMac (idempotente, una rotation per giorno UTC).
  # Script via stdin pipe → no bootstrap manuale richiesto su iMac.
  if [ -f "$ROTATE_SCRIPT" ]; then
    ROUT=$(ssh -o ConnectTimeout=5 -o BatchMode=yes imac 'bash -s' < "$ROTATE_SCRIPT" 2>&1)
    RRC=$?
    RMSG=$(echo "$ROUT" | tr '\n' ' ' | head -c 200)
    echo "$TS ROTATE rc=$RRC msg=$RMSG" >> "$LOG"
  fi
else
  MSG=$(echo "$OUT" | tr '\n' ' ' | head -c 200)
  echo "$TS FAIL rc=$RC msg=$MSG" >> "$LOG"
fi

exit 0
