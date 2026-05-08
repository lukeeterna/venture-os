#!/usr/local/bin/bash
# install-hooks.sh — installa git hook versionati nel repo VOS verso .git/hooks/.
# Idempotente: sovrascrive sempre il target, garantendo allineamento con la sorgente versionata.
# Da eseguire dopo ogni clone fresco di venture-os o dopo modifiche a scripts/hooks/.
#
# WHY: i file in .git/hooks/ non sono versionabili nativamente da git. Lo script colma il gap
# rendendo riproducibile la configurazione del backup automatico iMac (vincolo VOS zero-cost).
#
# USAGE: bash scripts/install-hooks.sh   (da repo root o da qualsiasi sottodirectory)

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
SRC_DIR="$REPO_ROOT/scripts/hooks"
DST_DIR="$REPO_ROOT/.git/hooks"

if [ ! -d "$SRC_DIR" ]; then
  echo "ERR: $SRC_DIR not found" >&2
  exit 1
fi
if [ ! -d "$DST_DIR" ]; then
  echo "ERR: $DST_DIR not found (è $REPO_ROOT un repo git valido?)" >&2
  exit 1
fi

count=0
for src in "$SRC_DIR"/*; do
  [ -f "$src" ] || continue
  name="$(basename "$src")"
  dst="$DST_DIR/$name"
  cp "$src" "$dst"
  chmod +x "$dst"
  echo "installed: $dst"
  count=$((count + 1))
done

echo "done — $count hook(s) installed"
