# HANDOFF VOS S11c-strategic → S11d

**Data**: 2026-05-13
**Sessione chiusa**: S11c-strategic (D2 only — D1/D3/D4 deferred per blocker pre-req)
**Prossima sessione**: S11d — completa wiki ARGOS (README.md + STRATEGY.md + ROADMAP update)

---

## Stato verificato

| Deliverable handoff S11c-strategic | Status |
|------------------------------------|--------|
| D1 `README.md` indice wiki ARGOS | ⏸️ DEFERRED — dipende da D2+D3 esistere (D2 ✅, D3 ❌) |
| D2 `DECISIONS.md` ADR lean ≥13 entry | ✅ SHIPPED (369 righe, 17 entries: 12 DECIDED + 5 OPEN) |
| D3 `STRATEGY.md` 6 sezioni | 🔴 BLOCKED — pre-req 2+3 mancanti + heretic D5 unverified |
| D4 ARGOS ROADMAP FASE 0/5 update | ⏸️ DEFERRED — dipende da D3 (cita STRATEGY.md sezioni) |

---

## Blocker D3 (pattern strutturale, vincolo #11)

3 blocker indipendenti, tutti reali (verificati 2026-05-13 14:30 IT):

### B1. `FOUNDER-DECISIONS-2026-05-13.md` MISSING

Pre-req 2 handoff S11c-strategic: file con risposte Q1-Q5 founder (identità, P.IVA, dominio, scope target, pricing). Decisioni di SCOPE non-tecniche = input founder reale obbligatorio. Le 5 OPEN entries in `DECISIONS.md` (D-OPEN-Q1...Q5) esplicitano esattamente questo debito.

**Sblocco**: Luke risponde in 5-10 min, anche con "OPEN-decido-in-S168" per ognuna. Default fallback inclusi in `DECISIONS.md` se preferenza founder = "applica default tuoi".

### B2. `brainstorm-inputs/persona-luca-DEEP.md` MISSING

Pre-req 3 handoff: file con sub-domande borderline per heretic-handler (rischio sgame persona fittizia, pseudonimo vs P.IVA, content trojan-horse pattern, tono NARCISO Day 1, volume vs alto-spendenti). Handoff S11c-strategic ha bozza sub-domande righe 45-51.

**Sblocco**: scrivere il file direttamente in S11d usando bozza handoff + eventuali domande Luke aggiuntive.

### B3. heretic-handler D5 unverified (Venice 429 sustained)

D5 di S11c-prereq mai chiuso verde. Ultimo retry 2026-05-13 14:23 IT = 429 su entrambi dolphin-mistral-venice + hermes-3-405b. Step 3.1 di D3 (`heretic-handler --topic persona-fittizia --input-file persona-luca-DEEP.md`) cadrà in chain exhausted finché Venice pool non libero.

**Sblocco**: eseguire `bash ~/venture-os/scripts/retry-heretic-d5.sh` in finestra notturna IT 02:00-06:00 UTC. Pattern già documentato in `state/blueprint-deviations.jsonl` (d5_blocked_upstream) + memory `project_vos_openrouter_uncensored_free.md`.

---

## Goal S11d (2-3h se B1+B2+B3 risolti)

### D1. `wiki/projects/ARGOS/README.md` (~15 min)

Indice + when-to-read:
- Sessione tecnica → `COMPILED-STATE.md` (171 righe, S10)
- Sessione strategica → `STRATEGY.md` (TBD D3 S11d)
- Decisione nuova → append `DECISIONS.md` + update `STRATEGY.md` sezione coinvolta
- Sessione operativa Day 1 → `STRATEGY.md` sez 1+2 PRIMA outbound

Max 50 righe. Header + link interni.

### D3. `wiki/projects/ARGOS/STRATEGY.md` (~90-120 min)

Workflow handoff S11c-strategic righe 88-133:
- **Step 3.1**: invoca heretic-handler su `persona-luca-DEEP.md` → `brainstorm-raw/persona-luca-uncensored-2026-05-XX.md` (gitignored)
- **Step 3.2**: fact-check insight uncensored. Claim non verificabili → `[unverified-insight]`
- **Step 3.3**: 6 sezioni:
  1. Persona Luca Ferretti (profilo, leggenda, lessico, deflection table)
  2. 4 Layer outreach protocol (Layer 0 credibility, Layer 1 dealer-intel, Layer 2 skill outreach-day1, Layer 3 HITL)
  3. 6-7 contenuti trojan-horse (SPEC only, no writing)
  4. Compliance gates (P.IVA disclosure, frontman framing, face/no-face, GDPR scrape)
  5. Pipeline test 5-step TEST_FOUNDER vs production
  6. Refs annotate `research/sX_*.md`

Ogni sezione include "Open questions / Risks" inline (vincolo #4).

### D4. ARGOS ROADMAP update (~15 min)

`~/Documents/combaretrovamiauto-enterprise/.planning/` (struttura attuale: CODE-AUDIT.md, E2E-AUDIT-S149.md, E2E-SIM-PLAN.md, E2E-SIM-RESULTS.md, FLUXION-MERGE-DOSSIER.md — NO ROADMAP.md attuale, da creare).

Sezioni:
- FASE 0 Credibility infrastructure (cleanup landing S165, P.IVA setup, dominio decision, footer disclosure)
- FASE 5 Outreach protocol (Layer 0/1/2/3 mapping a S166-S168 sessioni)
- Link wiki `~/venture-os/wiki/projects/ARGOS/STRATEGY.md` e `DECISIONS.md`
- Sequenza S165 → S166 → S167 → S168

---

## Critica strutturale (vincolo #4)

1. **Default fallback risk**: DECISIONS.md ha 5 default fallback per OPEN entries. Se Luke non risolve entro S168, defaults si attivano implicitamente. Mitigazione: brief mattutino può segnalare `D-OPEN-Qx age >14gg`. Da implementare in S11d o S168.
2. **STRATEGY.md prima di D-OPEN-Q1 = pattern S159**: D3 sez 1 "Persona Luca Ferretti" non scrivibile se Q1 (identità) ancora OPEN. Pattern: blueprint che si auto-debugga al primo dealer reale. Mitigazione: D-OPEN-Q1 deve essere CLOSED (anche con default fallback esplicito firmato Luke) prima di scrivere STRATEGY sez 1.
3. **Cascading update**: chiudere D-OPEN-Q1 trigger update D-04 (firma WA) + D-05 (footer landing). Workflow S11d deve includere: chiudi Q1 → re-read DECISIONS → patch D-04/D-05 conseguenze → poi scrivi STRATEGY sez 1.
4. **Sovradimensionamento heretic**: alcune sub-domande in `persona-luca-DEEP.md` (es. "tono NARCISO confidenza eccessiva") NON necessitano uncensored — sono insight commerciali normali. Risparmiare invocation heretic ai 2-3 prompt veramente borderline. Cost 0 ma quota free Venice limitata, principio efficienza.

---

## Done when (S11d)

- `wiki/projects/ARGOS/README.md` shipped (≤50 righe)
- `wiki/projects/ARGOS/STRATEGY.md` 6 sezioni complete con Open questions ogni sez
- `~/Documents/combaretrovamiauto-enterprise/.planning/ROADMAP.md` o equivalente creato con FASE 0 + FASE 5
- `~/Documents/combaretrovamiauto-enterprise/FOUNDER-DECISIONS-2026-05-13.md` consolidato (anche con default fallback firmati Luke)
- `state/heretic-log.jsonl` ≥1 entry `event=ok` (D5 finalmente verde + invocazione persona-luca)
- DECISIONS.md update: 5 OPEN → 5 DECIDED post-Q1-Q5 chiusura
- Commit verde + push iMac + deviation `argos-wiki-consolidation-shipped` in `blueprint-deviations.jsonl`

---

## Refs

- Handoff originale: `handoffs/HANDOFF-VOS-S11c-strategic-wiki-argos-2026-05-13.md`
- D2 shipped: `wiki/projects/ARGOS/DECISIONS.md`
- Heretic block: `handoffs/HANDOFF-VOS-S11c-prereq-b-venice-saturated-2026-05-13.md`
- Retry script: `scripts/retry-heretic-d5.sh`
- ARGOS research: `~/Documents/combaretrovamiauto-enterprise/research/s73_*.md`, `s94_*.md`, `s99_*.md`, `s101_*.md`
- Pre-S168 ARGOS handoffs (separati): S165 landing cleanup, S166 pipeline test, S167 dealer-intel, S168 outreach reale
