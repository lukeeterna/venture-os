#!/usr/bin/env bash
# MT-2D.4 — verify personalizzazione (font sportivi 5 stack di sistema).
# Screenshotta il configuratore per ognuno dei 5 font con numero 10 e nome ROSSI.
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

echo "=== MT-2D.4 personalizzazione font (headless) ==="
# 5 font sportivi — maglia blu, numero 10, nome ROSSI
shoot "font_block.png"     "font=block&number=10&name=ROSSI&maglia1=1e5bd6&maglia2=ffffff&pantaloncini1=ffffff&pantaloncini2=1e5bd6&calze1=1e5bd6&calze2=ffffff"
shoot "font_condensed.png" "font=condensed&number=10&name=ROSSI&maglia1=1e5bd6&maglia2=ffffff&pantaloncini1=ffffff&pantaloncini2=1e5bd6&calze1=1e5bd6&calze2=ffffff"
shoot "font_geometric.png" "font=geometric&number=10&name=ROSSI&maglia1=1e5bd6&maglia2=ffffff&pantaloncini1=ffffff&pantaloncini2=1e5bd6&calze1=1e5bd6&calze2=ffffff"
shoot "font_technical.png" "font=technical&number=10&name=ROSSI&maglia1=1e5bd6&maglia2=ffffff&pantaloncini1=ffffff&pantaloncini2=1e5bd6&calze1=1e5bd6&calze2=ffffff"
shoot "font_college.png"   "font=college&number=10&name=ROSSI&maglia1=1e5bd6&maglia2=ffffff&pantaloncini1=ffffff&pantaloncini2=1e5bd6&calze1=1e5bd6&calze2=ffffff"

echo "SCREENSHOT MT-2D.4: PASS (5 font generati)"
