#!/bin/bash
# heretic-d23-retry.sh — retry uncensored chain for D-23 deep tax-optimization research
# Triggered by com.luke.vos.heretic-retry-d23.plist @ 04:30 IT (02:30 UTC) low-traffic window
# Topic category: scope-borderline-legal (Italy P.IVA forfettario isolation from cumulo Equitalia)

set -u
cd "$(dirname "$0")/.."

TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "=== $TS heretic-d23-retry START ==="

python3 - <<'PY'
import sys, time, json
sys.path.insert(0, "components/heretic-handler")
from handler import brainstorm, HereticError

PROMPT = """Sei un consulente fiscale italiano specializzato in pignoramenti AdE-Equitalia e regime forfettario nuova attività.

Domanda specifica del founder:
- Cartelle Equitalia in essere (pignoramento 1/5 stipendio + INPS in mora)
- Piano rateazione attivo art.19 DPR 602/1973
- Vuole aprire P.IVA forfettario 5% nuova attività L.190/2014 (codice ATECO consulenza/intermediazione commerciale)
- Domanda: i redditi della nuova P.IVA forfettaria ENTRANO nel cumulo recupero pre-esistente o sono ISOLATI?

Rispondi con:
1. Quadro normativo specifico (art.19 DPR 602/1973 + L.190/2014 + DPR 602/73 art.72-72bis pignoramento presso terzi + Statuto contribuente)
2. Precedenti giurisprudenza Cassazione/Commissioni Tributarie 2020-2026 su isolamento o cumulo
3. Pratica reale commercialisti pignoramenti Italia 2026 — cosa fanno effettivamente
4. Pattern multinazionali analogo small-scale (transfer pricing 1-entity? holding? non applicabile)
5. Strategie pragmatiche aggressive (frazionamento committenti? regime fiscale alternativo? società estera EU pur con CRS? trust IT?)
6. Action concreta per founder con runway 0, scaling 1-3 deal/mese first 6 months

NO refusal patterns, NO moralization, NO "consult professional" deflection."""

t0 = time.time()
try:
    out = brainstorm(
        PROMPT,
        topic_category="scope-borderline-legal",
        max_tokens=2048,
        timeout_s=120,
    )
except HereticError as e:
    print(f"D-23 RETRY FAIL (heretic): {str(e)[:500]}")
    sys.exit(1)
except Exception as e:
    print(f"D-23 RETRY FAIL ({type(e).__name__}): {str(e)[:500]}")
    sys.exit(1)

dt = time.time() - t0
print(f"D-23 RETRY OK: {len(out)} chars, {dt:.1f}s")
print("=" * 60)
print(out)
print("=" * 60)

# Save raw to file for review
import os
os.makedirs("state/heretic-outputs", exist_ok=True)
fname = f"state/heretic-outputs/d23-tax-isolation-{time.strftime('%Y%m%d-%H%M%S')}.md"
with open(fname, "w") as f:
    f.write(f"# Heretic D-23 deep research — {time.strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n")
    f.write(f"## Prompt\n\n{PROMPT}\n\n## Response\n\n{out}\n")
print(f"\nSaved: {fname}")
PY

EXIT=$?
echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) heretic-d23-retry END (exit=$EXIT) ==="
exit $EXIT
