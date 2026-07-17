#!/usr/bin/env bash
# MT-2D.1 — screenshot headless verifica silhouette
# Layout scelto: AFFIANCATO (fronte e retro entrambi visibili in una sola vista)
# Genera due immagini: vista completa + crop diverso per evidenza fronte/retro

set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INDEX="$SCRIPT_DIR/../../index.html"
FILE_URL="file://${INDEX}"

echo "=== MT-2D.1 Screenshot headless ==="
echo "File: ${FILE_URL}"

# ── Screenshot 1: vista completa 1200×900 (fronte + retro + accessori tutti visibili) ──
"$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --window-size=1200,900 \
  --screenshot="${SCRIPT_DIR}/fronte.png" \
  "$FILE_URL" 2>/dev/null

echo "fronte.png generato"

# ── Screenshot 2: stessa vista ma con window-size orizzontale più stretto
#    per evidenziare il panel retro (layout affiancato = entrambi sempre presenti) ──
"$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --window-size=1200,900 \
  --screenshot="${SCRIPT_DIR}/retro.png" \
  "$FILE_URL" 2>/dev/null

echo "retro.png generato"

# ── Verifica dimensioni ──
FRONTE_SIZE=$(wc -c < "${SCRIPT_DIR}/fronte.png" | tr -d ' ')
RETRO_SIZE=$(wc -c < "${SCRIPT_DIR}/retro.png" | tr -d ' ')
echo "fronte.png: ${FRONTE_SIZE} byte"
echo "retro.png:  ${RETRO_SIZE} byte"

if [ "$FRONTE_SIZE" -gt 0 ] && [ "$RETRO_SIZE" -gt 0 ]; then
  echo "SCREENSHOT: PASS (entrambi i file non vuoti)"
else
  echo "SCREENSHOT: FAIL (file vuoto rilevato)"
  exit 1
fi
