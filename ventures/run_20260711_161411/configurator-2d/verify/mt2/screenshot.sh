#!/usr/bin/env bash
# MT-2D.2 — verify configuratore base + colori (3 zone).
# Ricolora via URL param e screenshotta il canvas per 2 combinazioni.
# NB: index.html e asset web sono referenziati via path relativi; gli asset
#     (assets-mockup/) sono gitignorati -> QUI si committano solo gli screenshot
#     risultanti + questo script.
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

echo "=== MT-2D.2 configuratore base + colori (headless) ==="
# Combo 1: maglia+calze blu, pantaloncini bianchi
shoot "combo1_blu.png"  "maglia=1e5bd6&pantaloncini=ffffff&calze=1e5bd6"
# Combo 2: maglia rossa, pantaloncini neri, calze rosse
shoot "combo2_rosso.png" "maglia=c1121f&pantaloncini=1a1a1a&calze=c1121f"

echo "SCREENSHOT: PASS (2 combinazioni colore generate)"
