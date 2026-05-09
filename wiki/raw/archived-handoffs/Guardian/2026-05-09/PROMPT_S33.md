# PROMPT S33 — CTO ENTERPRISE: Guardian fix integrato + research esterna

## Brief
Sei il CTO di ZeroClaw. S32 ha trovato lo smoking gun (zones.json polygon "divano" ingloba pavimento, `guardian.py:2424` forza escalation 600s in safe zone, test 60s troppo breve). PRIMA di applicare il fix proposto S32 (restringere polygon + aggiungere `pavimento_soggiorno` no-safe), Luke ha fornito un documento esterno che propone integrazioni che dovrebbero risolvere le problematiche Guardian attuali.

## Step OBBLIGATORIO Phase 0 — Lettura research esterna
**Read tool**: `/Users/macbook/Downloads/sto sviluppando un app che rileva tramite le telec.md` (13.5KB)

Il documento contiene proposte di integrazione tecnica per Guardian. Devi:
1. Leggerlo integralmente PRIMA di qualsiasi azione
2. Confrontarlo con findings S32 (`project_s32_findings.md`):
   - Bug B (zones.json polygon misconfig)
   - Bug A (POSE drop @0.25 sdraiato divano)
   - Smoking gun `guardian.py:2424` `_safe_lying_escalation_s`
3. Sintetizzare 3 raccomandazioni:
   - Quali proposte del documento risolvono Bug A/B
   - Quali sono ortogonali / complementari
   - Quali sono in conflitto con architettura attuale
4. Proporre a Luke piano S33 integrato (fix S32 + integrazioni esterne validate) con priorità + budget context

## Vincoli S33
- **Phase 0 SOLO research** (no scrittura codice fino approvazione Luke piano)
- Budget Phase 0: max 25% context
- Deliverable Phase 0: report markdown con tabella `proposta esterna → bug Guardian → priorità → costo implementazione`
- Solo dopo Luke OK piano → Phase 1+ implementazione

## Stato post-S32
- Guardian PID 2013 RUNNING (verify alive a inizio sessione)
- Cron watchdog/health-check DISABLED
- Phone Termux SSH frequente kill da MIUI Doze (workaround S32: Luke ack manuale)
- Snapshot S32 ancora su `~/guardian/snapshots/s32/` (utili per replay analysis)
- 18 snapshot evidence + POSE numbers in `project_s32_findings.md`

## Anti-pattern proibiti S33
- ❌ Implementare fix prima di leggere file Downloads (lezione S30/S31: assumi nulla)
- ❌ Re-test live prima di Luke approva piano integrato
- ❌ Scope creep: il file esterno potrebbe proporre 10 cose, scegli 1-2 P0 max
- ❌ Re-enable cron senza ALL PASS test + Luke approval

## Reference files S33
- `/Users/macbook/Downloads/sto sviluppando un app che rileva tramite le telec.md` (research esterna)
- `~/.claude/projects/-Users-macbook-Documents-pulizia-smartphone/memory/project_s32_findings.md` (smoking gun + fix proposto S32)
- `~/guardian/guardian.py` (4277 lines)
- `~/guardian/zones.json`
- `.planning/HANDOFF.md` sezione `[2026-05-02 SESSIONE 32]`

---
**Inizio S33**: Phase 0 = Read tool file Downloads → confronto findings S32 → report tabellare → proposta piano → STOP attendi Luke OK.
