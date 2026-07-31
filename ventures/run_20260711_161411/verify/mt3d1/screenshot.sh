#!/bin/bash
# MT-3D.1 screenshot script — 4 angoli via headless Chrome
OUTDIR="$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
URL="http://localhost:8081/"
ANGLES=(0 -55 90 55)
NAMES=(fronte tre_quarti_sx profilo_dx tre_quarti_dx)
for i in 0 1 2 3; do
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --screenshot="${OUTDIR}/${NAMES[$i]}.png" \
    --window-size=1280,900 \
    --virtual-time-budget=4000 \
    "${URL}?angle=${ANGLES[$i]}" 2>/dev/null
  echo "captured ${NAMES[$i]}.png"
done
echo "done"
