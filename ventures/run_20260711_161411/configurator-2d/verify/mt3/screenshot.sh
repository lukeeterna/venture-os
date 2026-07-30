#!/usr/bin/env bash
# MT-2D.3 — verify galleria 12 archetipi (overlay pattern sotto shading).
# Screenshotta 3 archetipi a contrasto cromatico diverso via ?design=<id>.
# NB: asset web gitignorati -> si committano solo gli screenshot + questo script.
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PAGE="$SCRIPT_DIR/../../index.html"

shoot() { # $1=out.png $2=querystring
  "$CHROME" \
    --headless=new --disable-gpu --hide-scrollbars \
    --allow-file-access-from-files \
    --virtual-time-budget=6000 \
    --window-size=1200,1000 \
    --screenshot="${SCRIPT_DIR}/$1" \
    "file://${PAGE}?$2" 2>/dev/null
  local sz; sz=$(wc -c < "${SCRIPT_DIR}/$1" | tr -d ' ')
  echo "$1: ${sz} byte"
  [ "$sz" -gt 0 ] || { echo "FAIL file vuoto: $1"; exit 1; }
}

echo "=== MT-2D.3 galleria design — 3 archetipi (headless) ==="
# Archetipo 1: righe verticali — maglia arancio/bianco, pantaloncini blu/bianco, calze arancio/bianco
shoot "archetype_vertical-stripes.png" \
  "design=vertical-stripes&maglia1=e85d00&maglia2=ffffff&pantaloncini1=1e5bd6&pantaloncini2=ffffff&calze1=e85d00&calze2=ffffff"

# Archetipo 2: chevron — maglia verde/giallo, pantaloncini nero/giallo, calze verde/giallo
shoot "archetype_chevron.png" \
  "design=chevron&maglia1=1a7c3d&maglia2=f5c518&pantaloncini1=1a1a1a&pantaloncini2=f5c518&calze1=1a7c3d&calze2=f5c518"

# Archetipo 3: quarti alternati — maglia rosso/bianco, pantaloncini bianco/rosso, calze rosso/bianco
shoot "archetype_quarters.png" \
  "design=quarters&maglia1=c1121f&maglia2=ffffff&pantaloncini1=ffffff&pantaloncini2=c1121f&calze1=c1121f&calze2=ffffff"

echo "SCREENSHOT MT-2D.3: PASS (3 archetipi generati)"
