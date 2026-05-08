#!/usr/local/bin/bash
# install-launchagents.sh — installa LaunchAgent VOS versionati verso ~/Library/LaunchAgents/.
# Idempotente: unload → cp → load -w per ogni .plist. Sicuro su agent già caricato.
#
# WHY: i .plist in ~/Library/LaunchAgents/ non sono versionabili nativamente nel repo
# (vivono fuori dal working tree). Script colma il gap garantendo restore deterministico
# dopo clone fresco o reinstallazione macOS.
#
# WHY launchctl load -w (e non bootstrap gui/$UID): coerente con S2-MVP che usa load.
# bootstrap richiede bootout-prima, ha gestione errori più rigida (rc!=0 se label attiva)
# e su Big Sur 11.7 il pattern legacy load/unload è ancora supportato e battle-tested.
#
# USAGE: bash scripts/install-launchagents.sh   (da repo root o sottodirectory)

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
SRC_DIR="$REPO_ROOT/scripts/launchagents"
DST_DIR="$HOME/Library/LaunchAgents"

if [ ! -d "$SRC_DIR" ]; then
  echo "ERR: $SRC_DIR not found" >&2
  exit 1
fi
mkdir -p "$DST_DIR"

count=0
for src in "$SRC_DIR"/*.plist; do
  [ -f "$src" ] || continue
  name="$(basename "$src")"
  label="${name%.plist}"
  dst="$DST_DIR/$name"

  # Unload se già caricato (rc!=0 ignorato — agent potrebbe non essere mai stato caricato).
  launchctl unload -w "$dst" 2>/dev/null || true

  cp "$src" "$dst"
  chmod 644 "$dst"

  # Load con -w per persistere in override database (sopravvive a reboot, no manual relaunch).
  if launchctl load -w "$dst"; then
    echo "loaded: $label"
  else
    echo "WARN: load failed for $label (rc=$?). Verifica: launchctl print gui/\$UID/$label" >&2
  fi
  count=$((count + 1))
done

echo "done — $count LaunchAgent(s) installed"
echo
echo "Verifica con: launchctl list | grep com.luke.vos"
