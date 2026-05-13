# VOS Pattern — Data-driven research protocol (multi-tool free-tier)

> **Origine**: S166 ARGOS metodo primo contatto dealer auto Italia (2026-05-13)
> **Status**: prototipo validato (3 fonti triangolate → sintesi convergente → decision request strutturata)
> **Use case**: ogni volta che ARGOS/FLUXION/Guardian richiede decisione strategica NON inventabile da training-data Claude single-shot
> **Vincolo #5 rigoroso**: ZERO costi, solo free-tier tool
> **Costo totale prototipo S166**: €0

---

## Quando usare questo pattern

**SÌ** se decisione:
- Strategica (segmento target, frame messaggio, sequenza outreach, posizionamento)
- Data-dependent (richiede dati esterni / benchmark / pattern documentati)
- Contraddizioni interne tra documenti progetto (research/ ARGOS S73 vs S94 vs S102)
- Bias founder sospetto (es. geografico, di prossimità, di familiarità)

**NO** se decisione:
- Implementativa tecnica (sintassi API, scelta libreria, debug bug) → vincolo #1 verifica fattuale diretta
- Cosmetica (UI color, naming variable) → out of scope
- Ricerca già fatta in research/ → leggi prima, applica
- Tempi ≤30 min disponibili → research protocol richiede 60-90 min minimo

---

## Step protocollo

### Step 1 — Audit bias preliminare (5 min)

PRIMA di scrivere qualsiasi prompt:
- Quali assunzioni founder sono presenti nel framing iniziale?
- Geografia, segmento target, canale, lessico → derivati da DATI o da prossimità/familiarità founder?
- Q0 nei prompt deve essere ESPLICITO audit bias

**Anti-pattern S159 rebrand 3**: skip Q0 audit bias → bias replicato in tutta ricerca esterna.

### Step 2 — Selezione tool free-tier (5 min)

**Tool free-tier validati 2026-05-13**:

| Tool | URL | Strength | Cost |
|------|-----|----------|------|
| Google AI Studio (Gemini 2.5 Pro) | aistudio.google.com | Search grounding + 1M context | €0 |
| NotebookLM | notebooklm.google.com | Source-grounded Q&A su upload | €0 |
| Claude.ai (Sonnet free) | claude.ai | Ragionamento strutturale, audit critica | €0 (5-10 msg/giorno) |
| ChatGPT (GPT-5 free / GPT-4o-mini) | chatgpt.com | Cross-validation prospettiva | €0 |
| Google/DuckDuckGo manuale | browser | Ground truth Reddit/forum | €0 |

**Triangolazione minima**: N≥3 tool divergent strength (search + synthesis + source-grounded).

**Skip giustificato**: se 3 fonti convergono, Tool 5+6 facoltativi (efficienza cost zero ma tempo founder è asset).

### Step 3 — Prompt construction (15-20 min)

Per ogni tool prompt include:
1. **Contesto progetto self-contained** (3-5 righe — l'altro AI non ha session memory)
2. **Q0 audit bias** prima domanda obbligatoria
3. **Q1-N domande specifiche** strutturate per output sintesi
4. **Output format obbligatorio** (citation, evidence, pattern data-driven)
5. **Vincolo no-extrapolation**: se mancano dati Italia/EU 2024-2026, dichiari lacuna esplicita
6. **Anti-disclosure vincolo**: NESSUNA info sensibile founder/business (no "frontman fittizio", "cash-only no documento", "P.IVA inesistente" in prompt esterni)

**Template prompt**: usa `~/venture-os/handoffs/RESEARCH-PROMPTS-S166-approach-method.md` come baseline.

### Step 4 — Esecuzione human-in-the-loop (60-90 min)

Founder:
- Copia ogni prompt nel tool corrispondente
- Salva output in `~/venture-os/handoffs/responses/SXXX-tool-N-NAME.md`
- Note ai tool: NotebookLM richiede upload manuale (drag&drop), Gemini AI Studio incolla bundle consolidato

**File system structure**:
```
~/venture-os/handoffs/
├── RESEARCH-PROMPTS-SXXX-<topic>.md      # prompt template per i tool
├── SXXX-research-bundle.md               # consolidato 5+ file ARGOS/research per Gemini long-context
├── responses/
│   ├── SXXX-tool-1-gemini-search.md     # output Gemini Search
│   ├── SXXX-tool-2-claude-web.md         # output Claude.ai
│   ├── SXXX-tool-3-gemini-context.md     # output Gemini long-context (se serve)
│   ├── SXXX-tool-4-notebooklm.md         # output NotebookLM Q1-QN
│   └── SXXX-tool-5-reddit-forum.md       # output ground truth manuale (se serve)
└── SXXX-SYNTHESIS-<topic>.md             # sintesi finale data-driven
```

### Step 5 — Sintesi data-driven (30-45 min)

CTO (Claude Code) legge tutte risposte e produce SYNTHESIS con:

1. **Convergenze** (cosa N≥2 fonti dicono unanimemente → forza)
2. **Contraddizioni** (cosa fonti dicono in modo divergente → risoluzione criteri):
   - Volume evidenza
   - Freshness data (>2024 preferito su <2020)
   - Qualità fonte (paper accademico > blog SEO > forum random)
   - Specificity domain (B2B Italia auto > B2B US SaaS senza disclaimer)
3. **Decisioni richieste founder** esplicite con trade-off motivati
4. **Pattern recognition rebrand** S159 storico (vincolo #11)
5. **Allegati responses/** + metadata frontmatter

### Step 6 — Decision request founder (10 min)

CTO presenta decisione single (vincolo #3) o decisione di scope se non tecnica:
- Una raccomandazione singola motivata data-driven
- Trade-off espliciti
- Path A vs Path B se mutuamente esclusivi
- NO inventare scelte: founder mandato esplicito richiesto su scope decisions

### Step 7 — Apply revisions (variabile)

Post-decisione founder:
- Update DECISIONS.md con cascade (nuove D-NN + SUPERSEDED)
- Update STRATEGY.md sezioni coinvolte
- Update ROADMAP.md se phase mapping cambia
- Loggia deviation in `~/venture-os/state/blueprint-deviations.jsonl`
- Commit + push (vincolo #6 verde, no PARTIAL)

---

## Anti-pattern protocollo (vincolo #11)

| # | Anti-pattern | Causa | Fix |
|---|--------------|-------|-----|
| 1 | Inventare metodo da training-data Claude | Vincolo #1 verificare fattuale violato | Multi-tool research obbligatoria |
| 2 | Skip Q0 audit bias | Founder bias replicato in ricerca esterna | Q0 sempre prima domanda |
| 3 | Disclosure info sensibile in prompt esterni | Privacy founder + business secret leak | Lista vincoli pre-prompt |
| 4 | Single-tool research | Bias del singolo modello amplificato | N≥3 tool divergent strength |
| 5 | Citation mancante / no source | Output non verificabile | Output format obbligatorio con source |
| 6 | Estrapolazione US/UK senza disclaimer | Mismatch contesto Italia/EU | Vincolo no-extrapolation in prompt |
| 7 | Procedere senza founder decision su scope | Pattern S159 rebrand | Decision request esplicita prima di apply |
| 8 | Sintesi che inventa risoluzioni contraddizioni | Stessa ipotesi non-validate moltiplicata | Criterio volume+freshness+qualità+specificity |

---

## VOS components futuri (Q9 founder closure)

Questo workflow human-in-the-loop diventerà automatizzato:

| Step manuale ora | VOS component futuro | Sostituisce |
|-------------------|----------------------|--------------|
| Step 2 search Gemini AI Studio | `competitor-watcher` (WebFetch settimanale + diff log) | Manual Gemini Search refresh |
| Step 4 NotebookLM upload | `research-synth` (Gemini Pro 1M context API Google AI Studio gratuita) | Manual upload + Q&A |
| Step 4 Reddit/forum manuale | `ground-truth-harvester` (PRAW Reddit free API + scrape forum auto/business IT) | Manual Google search |
| Step 5 sintesi CTO | (mantenuto human-in-the-loop, ma con pre-processing automatico) | — |

**Trigger development**: post 3 deal "eccellenza" closed ARGOS (D-15) → priorità VOS phase next. Components costruiti in ordine:
1. `competitor-watcher` (highest ROI, weekly diff automatizzato)
2. `research-synth` (frequenza media, decision support)
3. `ground-truth-harvester` (frequenza bassa, ricerca strategica)

---

## Estensione cross-progetto

Pattern applicabile a:

- **ARGOS**: decisioni metodo outreach (S166+), pricing fee (S168+), pivot segmento, expansion geografica
- **FLUXION**: pricing model (€497 one-time vs subscription?), segmento target (1-3 operatori vs 10+), feature prioritization
- **Guardian**: stack tecnico, target user, monetization model
- **VOS**: scelte architetturali, tool selection, component design

**Costo per applicazione**: €0 (vincolo #5 rispettato in perpetuo).

---

## Riferimenti

- Validato: S166 ARGOS approach method (2026-05-13)
- Output: `~/venture-os/handoffs/S166-SYNTHESIS-approach-method.md` (12 KB)
- Patterns recognized: 5 S159 rebrand documented
- Founder feedback: "questo è il protocollo VOS per reperire i dati, mai andare alla cazzum" (vincolo #11 pattern recognition strutturale validato)
