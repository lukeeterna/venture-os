#!/usr/bin/env bash
# MT-2D.5 — verify sponsor (upload logo sul petto).
# Pilota il configuratore reale via CDP (Chrome headless + Node driver, zero
# dipendenze npm) attraverso 3 stati: senza sponsor -> applicato -> reset.
# Lo sponsor di prova e' generato in pagina con la Canvas API (rettangolo +
# scritta SPONSOR), MAI un logo o marchio reale, MAI scritto su disco.
# Il 3o screenshot deve essere byte-identico al 1o: se differisce e' un difetto.
# NB: asset web gitignorati -> si committano solo gli screenshot + questi script.
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PAGE="$SCRIPT_DIR/../../index.html"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
PORT=9333
PROFILE="$(mktemp -d)"

echo "=== MT-2D.5 sponsor (headless, pilotato via CDP) ==="

# Snapshot git PRIMA: rileva qualsiasi scrittura su disco del repo dallo script.
BEFORE="$(mktemp)"
git -C "$REPO_ROOT" status --porcelain >"$BEFORE"

"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --allow-file-access-from-files \
  --remote-debugging-port="$PORT" \
  --user-data-dir="$PROFILE" \
  "file://${PAGE}" >/dev/null 2>&1 &
CHROME_PID=$!
cleanup() {
  kill "$CHROME_PID" 2>/dev/null || true
  wait "$CHROME_PID" 2>/dev/null || true
  rm -rf "$PROFILE"
}
trap cleanup EXIT

for _ in $(seq 1 60); do
  curl -sf "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1 && break
  sleep 0.2
done

node "$SCRIPT_DIR/drive.mjs" "$PORT" "file://${PAGE}" "$SCRIPT_DIR"

for f in sponsor_off.png sponsor_on.png sponsor_reset.png; do
  [ -s "$SCRIPT_DIR/$f" ] || { echo "FAIL file vuoto/mancante: $f"; exit 1; }
done

echo "=== confronto reset vs iniziale ==="
if cmp -s "$SCRIPT_DIR/sponsor_off.png" "$SCRIPT_DIR/sponsor_reset.png"; then
  echo "RESET IDENTICO A INIZIALE: PASS (byte-identici)"
else
  echo "RESET DIVERSO DA INIZIALE: DIFETTO (reset non ripristina il render)"
fi

echo "=== nessuna scrittura su disco fuori da verify/mt5/ ==="
AFTER="$(mktemp)"
git -C "$REPO_ROOT" status --porcelain >"$AFTER"
DELTA="$(comm -13 <(sort "$BEFORE") <(sort "$AFTER") || true)"
echo "delta git durante lo script:"
echo "${DELTA:-<nessuno>}"
OUTSIDE="$(printf '%s\n' "$DELTA" | grep -vE 'verify/mt5/' | grep -vE '^[[:space:]]*$' || true)"
if [ -z "$OUTSIDE" ]; then
  echo "SPONSOR SINTETICO NON TOCCA IL DISCO: PASS (solo verify/mt5/ scritto)"
else
  echo "SCRITTURE ESTERNE RILEVATE: FAIL"
  printf '%s\n' "$OUTSIDE"
  exit 1
fi

echo "SCREENSHOT MT-2D.5: PASS (3 stati sponsor generati)"
