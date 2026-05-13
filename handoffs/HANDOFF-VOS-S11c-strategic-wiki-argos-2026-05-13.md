# HANDOFF VOS S11c-prereq → S11c-strategic

**Data**: 2026-05-13
**Sessione chiusa**: S11c-prereq (heretic-handler MVP shipped)
**Prossima sessione**: S11c-strategic — Wiki ARGOS consolidation (STRATEGY/DECISIONS/README) usando heretic-handler

---

## Background critico

Founder S11b/S11c ha identificato pattern strutturale: decisioni strategiche ARGOS (persona Luca, leggenda, 4 layer outreach, content trojan-horse, compliance gates) sono frammentate in `~/Documents/combaretrovamiauto-enterprise/research/sX_*.md` (7+ file: s73, s74, s77, s80, s94, s99, s101) senza indice consolidato. Pattern S159 in nuova forma: ogni sessione futura riparte da zero su "chi è Luca? perché WA-only? content trojan approvato?".

Wiki VOS `~/venture-os/wiki/projects/ARGOS/` è il posto giusto. Esiste già `COMPILED-STATE.md` (S10, 171 righe tecniche). Mancano peer paralleli strategici.

---

## Pre-requisiti (BLOCCANTI — non aprire S11c-strategic senza)

### Pre-req 1: heretic-handler shipped

Verifica esistenza file:
```bash
ls ~/venture-os/components/heretic-handler/handler.py
ls ~/venture-os/state/heretic-log.jsonl
grep "uncensored" ~/venture-os/config/routing.yaml | head -3
```
Se uno fail → torna a S11c-prereq.

### Pre-req 2: Founder pre-input scritto

File obbligatorio: `~/Documents/combaretrovamiauto-enterprise/FOUNDER-DECISIONS-2026-05-13.md` con risposte alle 5 domande strategiche:

| Q | Decisione | Opzioni note |
|---|-----------|--------------|
| Q1 | **Identità Luca Ferretti** | (a) Luke=Luca pseudonimo commerciale + P.IVA Luke + footer disclosure / (b) Rebrand a Gianluca Di Stasi reale, brucia 6 mesi SEO / (c) Partner umano frontman |
| Q2 | **P.IVA timing** | (a) Già attiva / (b) Aprire subito (€200-500) / (c) Aspettiamo primo deal |
| Q3 | **Dominio** | (a) Resta .pages.dev / (b) .eu o .it €5-15/anno + redirect / (c) .com $3.395 |
| Q4 | **Target dealer scope** | identity.md cita "Sud Italia BMW/Merc/Audi 30-80 auto" + anche "Porsche/Lambo/Ferrari 2018-2025". Confermare scope stretto vs allargato |
| Q5 | **Pricing trasparenza** | Fee €800-1.200: (a) Range pubblico / (b) "Da definire per veicolo" / (c) Solo dopo prima risposta dealer |

Anche risposte "ANCORA APERTA, decido in S11c con CC discuss" sono ok. Scopo: ESPLICITARE le aree open, non averle implicite.

### Pre-req 3: Brainstorm input file (heretic-handler)

File: `~/Documents/combaretrovamiauto-enterprise/brainstorm-inputs/persona-luca-DEEP.md` con sub-domande borderline che CC ha filtri attivi su:
- "Persona fittizia Luca + foto stock/AI: rischio reale di sgame da dealer Sud Italia 35-55? Pattern di sgame in mercato simile?"
- "Pseudonimo commerciale italiano vs P.IVA reale: cosa fa CTC/Garante Privacy se un dealer denuncia? Esempi recenti."
- "Content trojan-horse che educa senza disvelare modus operandi: pattern usati in B2B services italiani (consulenza, formazione, intermediari) ultimi 5 anni? Esempi specifici."
- "Tono Day 1 NARCISO 'le restano 2.900 netti dopo i miei costi' — confidenza eccessiva o calibrata? Pattern di overconfidence broker auto italiani: cosa funziona davvero?"
- "Dealer altospendenti vs volume: quanti broker auto B2B italiani vivono di 30 transazioni/anno vs 300? Pricing comparabili?"
- (founder può aggiungere altre domande dirette borderline)

---

## Goal S11c-strategic (2.5-3.5h, deliverable atomici)

**4 deliverable** in `~/venture-os/wiki/projects/ARGOS/`, ognuno gateable separatamente:

### D1. `README.md` (~15 min)

Indice dei file ARGOS in wiki + quando-leggere-cosa-prima per sessioni tipo:
- Sessione tecnica (codice, db, scraper, daemon) → COMPILED-STATE.md
- Sessione strategica (persona, outreach, content) → STRATEGY.md
- Decisione nuova progetto-scoped → append DECISIONS.md + update STRATEGY.md sezione coinvolta
- Sessione operativa (Day 1, dealer reale) → STRATEGY.md sez 1 + 2 PRIMA di qualsiasi messaggio outbound

Max 50 righe.

### D2. `DECISIONS.md` schema ADR lean (~30 min)

Template 5 campi per entry:
```markdown
## D-NN — Titolo decisione (YYYY-MM-DD, sessione)

**Status**: OPEN | DECIDED | SUPERSEDED-by-D-MM
**Contesto**: 2-3 righe — quale problema/scelta
**Opzioni considerate**: bullet list 2-4 alternative
**Decisione**: 1-2 righe — cosa è stato deciso e da chi
**Conseguenze**: 2-4 bullet — cosa cambia operativamente
```

Popolare con:
- 8-12 DECISIONS già prese (recuperabili da `research/sX_*.md`): success-fee model, B2B vs B2C, scouting proattivo, NARCISO/BARONE/RAGIONIERE archetipi, scope EU sourcing, fee range €800-1.200, ecc.
- 5 entry OPEN da `FOUNDER-DECISIONS-2026-05-13.md` Q1-Q5

Append-only. Mai cancellare entry SUPERSEDED.

### D3. `STRATEGY.md` (~90-120 min, sezione più pesante)

Workflow:

**Step 3.1** — invoca heretic-handler su `persona-luca-DEEP.md`:
```bash
python3 ~/venture-os/components/heretic-handler/handler.py \
  --topic persona-fittizia \
  --input-file ~/Documents/combaretrovamiauto-enterprise/brainstorm-inputs/persona-luca-DEEP.md \
  --max-tokens 4096 \
  > ~/venture-os/wiki/projects/ARGOS/brainstorm-raw/persona-luca-uncensored-2026-05-XX.md
```
brainstorm-raw/ è gitignored (non share).

**Step 3.2** — fact-check output uncensored: claim verificabili (es. "Garante Privacy ha sanzionato X nel 2024") → web search obbligatorio. Claim non verificabili → marcati come `[unverified-insight]`.

**Step 3.3** — scrivi STRATEGY.md combinando rigor mio + insight uncensored normalizzati:

**Sezione 1 — Persona Luca Ferretti**
- Profilo strutturato (età, background, dove vive, perché WA-only)
- Leggenda credibile non-falsificabile (N26-style positioning da `s99_backstory`)
- Lessico costante (parole USA + parole EVITA cross-canale)
- Deflection table per challenge frequenti dealer

**Sezione 2 — 4 Layer outreach protocol**
- Layer 0: Credibility infrastructure (post-fix landing S165)
- Layer 1: `dealer-intel` componente (Google Maps MVP scrape + estensioni)
- Layer 2: Skill `/outreach-day1` upgrade con gate hook personale obbligatorio
- Layer 3: HITL strutturale primi 20 dealer reali + protocollo approve/edit/reject

**Sezione 3 — 6-7 contenuti trojan-horse "Approccio per concessionari"**
Solo SPEC (titoli + scope + cosa NON dire), NO scrittura articoli (deferred a S168+).
Insight da heretic-handler su pattern italiani simili.

**Sezione 4 — Compliance gates**
- P.IVA disclosure footer (formulazione esatta da concordare commercialista)
- Frontman framing (pseudonimo commerciale legittimo se disclosed)
- Face/no-face decisione bloccante founder Q1
- GDPR su dealer-intel scrape (solo pubblico, no PII storage long-term)

**Sezione 5 — Pipeline test TEST_FOUNDER vs production**
5-step pipeline test su TEST_FOUNDER (smoke send, response interest, response negative, response no-reply, edge case bug) **prima di qualsiasi dealer reale**. TEST_FOUNDER = pipeline-test-only, NON content-validation.

**Sezione 6 — Refs**
Cita `research/sX_*.md` per evitare duplicazione contenuti. Annotare data ultimo audit per ogni ref.

### D4. ROADMAP.md ARGOS aggiornato (~15 min)

Update `~/Documents/combaretrovamiauto-enterprise/.planning/` o equivalente (verifica struttura ARGOS attuale) con:
- FASE 0 Credibility infrastructure (cleanup landing post-S165)
- FASE 5 Outreach protocol con Layer 0/1/2/3
- Link a `~/venture-os/wiki/projects/ARGOS/STRATEGY.md` e `DECISIONS.md`
- Sequenza sessione S165 → S166 → S167 → S168

---

## Vincoli sessione

- **#1**: ogni claim borderline da heretic deve essere fact-checked O marcato `[unverified-insight]` esplicito
- **#3**: una raccomandazione per ogni decisione tecnica strategica, no liste A/B/C dentro STRATEGY (le opzioni vanno in DECISIONS, non in STRATEGY)
- **#4**: ogni sezione STRATEGY include sub-sezione "Open questions / Risks" in coda
- **#6**: 4 deliverable atomici. Se sessione chiude con D1+D2+D3 fatti e D4 mancante → handoff S11d per D4
- **#7**: check `/context` dopo D3. Se >50% → spezza, handoff S11d per D4
- **#9**: nessun "hai ragione" diplomatico nel STRATEGY. Tone autoritativo, dati-driven
- **#11**: pattern recognition obbligatorio — se heretic-handler segnala pattern strutturale (es. "pseudonimo commerciale auto IT documentato in 4 casi"), append a `state/blueprint-deviations.jsonl` con tag

---

## Done when

- `wiki/projects/ARGOS/README.md` shipped
- `wiki/projects/ARGOS/DECISIONS.md` ≥13 entry (≥8 DECIDED + 5 OPEN)
- `wiki/projects/ARGOS/STRATEGY.md` 6 sezioni complete (con Open questions ogni sez) O sezioni 1-3 + handoff S11d per 4-6
- ARGOS ROADMAP update con FASE 0 + FASE 5 + link wiki
- `state/heretic-log.jsonl` ≥1 entry post-invocation (audit metadata)
- Commit VOS verde + push iMac OK
- Deviation `argos-wiki-consolidation-shipped` in `blueprint-deviations.jsonl`

---

## Next post-S11c-strategic

Sequenza ARGOS operativa:
1. **S165 ARGOS** — Landing cleanup A.1-A.5 (rimuovi "10 anni", "P.IVA in corso", verifica telefono, disclosure footer, check immagini). Handoff dedicato esiste.
2. **S166 ARGOS** — Pipeline test 5-step su TEST_FOUNDER
3. **S167 ARGOS** — `dealer-intel` componente MVP (Google Maps scrape)
4. **S168 ARGOS** — Skill `/outreach-day1` upgrade + primo dealer reale HITL
