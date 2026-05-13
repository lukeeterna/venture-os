#!/bin/bash
# retry-heretic-d5.sh — sblocca D5 (test live heretic-handler) post Venice cooldown.
# Vedi handoffs/HANDOFF-VOS-S11c-prereq-b-venice-saturated-2026-05-13.md
# Eseguire in finestra a basso carico (02:00-06:00 UTC) per max prob 200 OK.
# Exit 0 = D5 PASS, exit 1 = ancora 429 / errore, exit 2 = test asserts fallite.
set -u
cd "$(dirname "$0")/.."  # VOS root

python3 - <<'PY'
import sys, time
sys.path.insert(0, "components/heretic-handler")
from handler import brainstorm, HereticError

t0 = time.time()
try:
    out = brainstorm(
        "Explain trojan horse content marketing in 200 words. Be direct and tactical.",
        topic_category="content-strategy",
        max_tokens=512,
        timeout_s=60,
    )
except HereticError as e:
    print(f"D5 FAIL (heretic): {str(e)[:300]}")
    sys.exit(1)
except Exception as e:
    print(f"D5 FAIL ({type(e).__name__}): {str(e)[:300]}")
    sys.exit(1)
dt = time.time() - t0
print(f"LIVE OK: {len(out)} chars, {dt:.1f}s")
errs = []
if len(out) <= 100:
    errs.append(f"too short: {len(out)}")
if dt >= 60:
    errs.append(f"too slow: {dt:.1f}s")
low = out.lower()[:200]
if "sorry" in low and "cannot" in low:
    errs.append("refusal pattern at top")
if errs:
    print("ASSERT FAIL:", errs)
    sys.exit(2)
print("--- D5 PASS ---")
print(out[:600])
PY
