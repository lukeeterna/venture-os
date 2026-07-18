#!/usr/bin/env bash
# MT-2D.1d — verify prova ricolorazione mockup fotorealistico
# Applica 2 ricolorazioni (URL param) alla pagina lab e screenshotta il fronte.
# NB: la pagina lab e gli asset (shading/maschere/PSD) sono gitignorati;
#     QUI si committano solo gli screenshot risultanti + questo script.
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LAB="$SCRIPT_DIR/../../lab/index.html"

shoot() { # $1=nome $2=querystring
  "$CHROME" \
    --headless=new --disable-gpu --hide-scrollbars \
    --virtual-time-budget=6000 \
    --window-size=1000,1180 \
    --screenshot="${SCRIPT_DIR}/$1" \
    "file://${LAB}?$2" 2>/dev/null
  local sz; sz=$(wc -c < "${SCRIPT_DIR}/$1" | tr -d ' ')
  echo "$1: ${sz} byte"
  [ "$sz" -gt 0 ] || { echo "FAIL file vuoto: $1"; exit 1; }
}

echo "=== MT-2D.1d ricolorazione headless ==="
# Ricolorazione 1: maglia+calze rosse, pantaloncini bianchi (kit classico)
shoot "recolor1_rosso.png" "maglia=c1121f&pantaloncini=ffffff&calze=c1121f"
# Ricolorazione 2: kit blu, calze bianche
shoot "recolor2_blu.png"   "maglia=1d4ed8&pantaloncini=1d4ed8&calze=ffffff"

echo "SCREENSHOT: PASS (2 ricolorazioni fronte generate)"
