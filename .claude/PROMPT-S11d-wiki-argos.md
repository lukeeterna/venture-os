# Prompt next session — S11d wiki ARGOS

> Salvato 2026-05-13 post-S11c-strategic D2 shipped.
> Sostituisce uso del template auto-generato `NEXT_SESSION_PROMPT.md` (volatile).
> Copia-incolla l'intero blocco sotto la riga di separazione nella nuova sessione Claude Code.

---

## Pre-condizione GIÀ COMPLETATA in S11c-strategic-extension (2026-05-13)

Founder Q1-Q11 closed + sub-domande borderline scritte:
- `~/Documents/combaretrovamiauto-enterprise/FOUNDER-DECISIONS-2026-05-13.md` (11 Q chiuse: Q1 frontman fittizio + Q2 cash-no-documento + Q3 .pages.dev + Q4 nazionale wave + Q5 OPEN-pending-research + Q6-Q11 nuovi insight)
- `~/Documents/combaretrovamiauto-enterprise/brainstorm-inputs/persona-luca-DEEP.md` (7 sub-domande borderline)

**Workflow ricerca correzione importante**: heretic-handler ≠ fact-finding. Heretic = uncensored brainstorm (modelli senza filtri commerciali, output creativo borderline). Fact-finding = WebSearch/WebFetch interni Claude Code, OR future VOS components automated:
- `research-synth` (Gemini Pro long_context auto-sintesi research/)
- `ground-truth-harvester` (PRAW Reddit + scrape forum auto IT Quattroruote/ClubAlfa)
- `competitor-watcher` (WebFetch periodic competitor pricing + diff log)

Constraint Luke: tutto automatizzato, nessuna operazione manuale founder. Tool secondari deprecati (NotebookLM, Reddit/FB manuale): sostituiti con VOS components futuri.

**Opzionale ma raccomandato**: `bash ~/venture-os/scripts/retry-heretic-d5.sh` in finestra notturna IT (02:00-06:00 UTC). Se 200 OK → D5 verde sblocca Step 3.1 D3 (invocazione heretic su persona-luca-DEEP.md per Sezione 1 STRATEGY.md).

---

## Sessione VOS S11d — Wiki ARGOS D1+D3+D4 completion

Leggi prima: `~/venture-os/handoffs/HANDOFF-VOS-S11d-wiki-argos-D1-D3-D4-2026-05-13.md`

### Pre-req BLOCCANTE (verifica esistenza, STOP se uno fail)

- `~/venture-os/components/heretic-handler/handler.py` (S11c-prereq ✅)
- `~/venture-os/wiki/projects/ARGOS/DECISIONS.md` (S11c-strategic ✅, 17 entry)
- `~/Documents/combaretrovamiauto-enterprise/FOUNDER-DECISIONS-2026-05-13.md` (NEW)
- `~/Documents/combaretrovamiauto-enterprise/brainstorm-inputs/persona-luca-DEEP.md` (NEW)

Se uno mancante: STOP, handoff S11d-deferred con problem statement.

### Stato heretic D5 (verifica)

`tail -1 ~/venture-os/state/heretic-log.jsonl`
- Se ultimo `"event":"ok"` → D5 verde, esegui Step 3.1 D3 normalmente
- Se solo `retryable_fail` → D5 ancora bloccato, skip Step 3.1, marca tutti insight uncensored come `[unverified-insight]` in STRATEGY.md sezione 1

### Goal: 3 deliverable atomici in `wiki/projects/ARGOS/`

D2 (DECISIONS.md) già shipped + Q1-Q11 founder closure pronto in `FOUNDER-DECISIONS-2026-05-13.md`. Patch DECISIONS.md richiesta:
- Q1-Q5 OPEN entries → DECIDED status
- Nuove entries D-13 (luxury teaser) + D-14 (scope nazionale wave) + D-15 (1-deal eccellenza) + D-16 (dossier ampliato free-tier) + D-17 (AI Visual pilot bloccante) + D-18 (dossier struttura core+appendix) + D-19 (education layer trust-builder) + D-20 (positioning anti-Bolidem)
- Cascading patch D-04 (firma WA: "Luca Ferretti" senza disclosure Gianluca, footer brand only) + D-05 (no claim verificabili) + D-03 (target shift commissione informali, S73 strutturati → parking lot)
- Final state target: 20 entry totali (14 DECIDED + 1 D-08 OPEN-ipotesi)

- **D1** `README.md` indice ≤50 righe (~15 min)
- **D3** `STRATEGY.md` 6 sezioni con Open questions ogni sez (~90-120 min)
- **D4** ARGOS ROADMAP create in `~/Documents/combaretrovamiauto-enterprise/.planning/ROADMAP.md` con FASE 0 + FASE 5 + link wiki (~15 min)

### Workflow D3 obbligatorio

1. Leggi `FOUNDER-DECISIONS-2026-05-13.md`, chiudi 5 entry D-OPEN-Q1...Q5 in `DECISIONS.md` (STATUS: OPEN → DECIDED)
2. Patch cascading conseguenze D-04 (firma WA) + D-05 (footer landing) se Q1 risolta
3. **Step 3.1** heretic-handler invocato su `persona-luca-DEEP.md` se D5 verde, altrimenti skip + marker
4. **Step 3.2** fact-check insight uncensored via web search; claim non verificabili → `[unverified-insight]`
5. **Step 3.3** scrivi `STRATEGY.md` sezioni:
   1. Persona Luca Ferretti (profilo, leggenda, lessico, deflection table)
   2. 4 Layer outreach protocol (Layer 0 credibility, Layer 1 dealer-intel, Layer 2 skill outreach-day1, Layer 3 HITL)
   3. 6-7 contenuti trojan-horse SPEC only (no writing)
   4. Compliance gates (P.IVA disclosure, frontman framing, face/no-face, GDPR scrape)
   5. Pipeline test 5-step TEST_FOUNDER vs production
   6. Refs annotate `research/sX_*.md` + ultimo audit date
6. D1 README.md (post-D3, indicizza struttura reale)
7. D4 ARGOS ROADMAP (post-D3, cita STRATEGY sezioni)

### Vincoli sessione

- **#1**: claim borderline da heretic = fact-checked OR `[unverified-insight]` esplicito
- **#3**: una raccomandazione per decisione tecnica, no liste A/B/C in STRATEGY (opzioni vanno in DECISIONS)
- **#4**: ogni sezione STRATEGY include sub-sezione "Open questions / Risks" in coda
- **#6**: 3 deliverable atomici. Se chiude con D3 + D1+D4 mancanti → handoff S11e
- **#7**: check `/context` dopo D3 sez 3. Se >50% → handoff S11e per D3 sez 4-6 + D1 + D4
- **#9**: nessun "hai ragione" diplomatico nel STRATEGY. Tone autoritativo, dati-driven
- **#11**: pattern recognition — se heretic segnala pattern strutturale, append a `state/blueprint-deviations.jsonl`

### Done when

- `wiki/projects/ARGOS/README.md` shipped (≤50 righe)
- `wiki/projects/ARGOS/STRATEGY.md` 6 sezioni complete con Open questions ogni sez
- `~/Documents/combaretrovamiauto-enterprise/.planning/ROADMAP.md` con FASE 0 + FASE 5
- `wiki/projects/ARGOS/DECISIONS.md` aggiornato: 5 D-OPEN-Q1...Q5 → DECIDED (oppure default fallback esplicitamente firmato Luke se "ANCORA APERTA")
- `state/heretic-log.jsonl` ≥1 entry `event=ok` se D5 verde (skip se D5 ancora 429)
- Commit verde + push iMac OK
- Deviation `argos-wiki-consolidation-shipped` in `state/blueprint-deviations.jsonl`

### Next post-S11d (ARGOS operativo)

1. **S165 ARGOS** — Landing cleanup A.1-A.5 (rimuovi "10 anni", "P.IVA in corso", footer disclosure D-05/D-OPEN-Q1 risolta)
2. **S166 ARGOS** — Pipeline test 5-step su TEST_FOUNDER (D-11)
3. **S167 ARGOS** — `dealer-intel` componente MVP (Google Maps scrape, D-10 TIER 0/1/2)
4. **S168 ARGOS** — Skill `/outreach-day1` upgrade + primo dealer reale HITL (D-07 + D-08 validazione)
