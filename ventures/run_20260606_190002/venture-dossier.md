# venture-dossier — run_20260606_190002

> SCOCCA della fabbrica VOS. Un file per venture-candidato. Percorre S0→S6, ogni stazione compila la sua sezione.
> **Regola firewall (non negoziabile)**: ogni sezione DEVE avere il blocco `provenance:` compilato prima di chiudere il gate. Provenienza mancante = gate FAIL. Vedi `VOS_RUN_SPEC.md §Principio FIREWALL`.
> Compila in ordine. Non saltare stati. Non riempire S3+ se G1 ha dato KILL.

```yaml
run_id: run_20260606_190002
created_ts: 2026-06-06T19:00:02Z
state: S2          # S0..S6 — re-scored 2026-06-08, selezione ribaltata #3→#1
verdict: null      # null | SHIPPED | KILLED
seed_envelope: seeds/seed_20260606.md
```

---

## S0 — seed (intake) — chiuso da: VOS, da seed_envelope

- **Vincoli ricevuti** (niche-free, copiati dall'envelope): {{...}}
- **Tipo-verticale ipotizzato** (B2B-globale / servizi-locali / consumer): {{...}}

```yaml
provenance:
  source: seeds/seed_20260606.md
  ts: 2026-06-06T19:00:02Z
```

> ⚠️ Se l'envelope nominava una nicchia → VIOLAZIONE FIREWALL. Annota qui e ignora la nicchia suggerita.

---

## S1 — segnali (Discovery) — stazione 1, worker market-researcher

Nicchie candidate **partorite da VOS** (Luke NON le ha scelte). Per ognuna, segnale di spesa esistente con URL:

| Nicchia candidata | Tipo | Segnale di spesa esistente | URL/fonte | Forza |
|---|---|---|---|---|
| **Competitor price monitoring per micro-seller ecommerce (<500 SKU)** | B2B-globale | Prisync $99/mo (piano 100 SKU, 129 recensioni Capterra, 92% small business); Pricefy 10.000+ clienti paganti piano min $49/mo; 211 recensioni acquisto su Shopify App Store | [Prisync Capterra](https://www.capterra.com/p/153451/Prisync/) · [Pricefy pricing](https://www.pricefy.io/pricing) · [Shopify App Store](https://apps.shopify.com/prisync-for-shopify) | 3 |
| **Prospect research automation per SDR / founder outbound B2B** | B2B-globale | 22.870 job "Lead Research Specialist" su Indeed (esecuzione manuale a $51/h); Upwork list-building $20-40/h; mercato tool $49 (Apollo) → $700/mo (Clay) con alternativa economica cercata attivamente | [Indeed Lead Research](https://www.indeed.com/q-lead-research-specialist-jobs.html) · [Salary.com $51/h](https://www.salary.com/research/salary/posting/prospect-research-analyst-salary) · [Apollo alternatives](https://skrapp.io/blog/apollo-io-alternatives/) | 4 |
| **Media monitoring per freelancer PR / micro-agenzie (<5 persone) post-exit Mention** | B2B-globale | Mention ha eliminato il piano $49/mo (lug 2025) lasciando solo $599/mo → fascia espulsa; Brand24 unico entry a $199/mo (254 recensioni Capterra); sotto = solo F5Bot free senza analytics | [Mention pricing checkthat.ai](https://checkthat.ai/brands/mention/pricing) · [Brand24 Capterra](https://www.capterra.com/p/149054/Brand24/reviews/) · [Brand24 pricing](https://brand24.com/prices/) | 4 |

```yaml
provenance:
  tool: Task(trend-researcher) + WebSearch/WebFetch
  sources: [https://www.capterra.com/p/153451/Prisync/, https://www.pricefy.io/pricing, https://apps.shopify.com/prisync-for-shopify, https://www.indeed.com/q-lead-research-specialist-jobs.html, https://www.salary.com/research/salary/posting/prospect-research-analyst-salary, https://skrapp.io/blog/apollo-io-alternatives/, https://checkthat.ai/brands/mention/pricing, https://www.capterra.com/p/149054/Brand24/reviews/, https://brand24.com/prices/]
  ts: 2026-06-06T19:00:02Z
```

---

## S2 — scocca (Demand validation) — GATE G1

> ⚠️ **RE-SCORING 2026-06-08 (ordine OPERATE §3)**: la selezione originale (#3 media-monitoring) è stata **superata** dopo re-scoring con 3 criteri mancanti. Sezione "[SUPERATA] selezione originale #3" conservata in coda per tracciabilità. Selezione corrente = **#1 price-monitoring micro-seller**.

### Re-scoring 3 nicchie — formula Si = μ − λσ (λ=0.5), criteri [A,B,C] su 0-10

A = competitor-density al segmento *micro* esatto (alto = sotto-servito = buono) · B = build-feasibility-solo (8h/sett + CC) · C = distribution-fit a channel_reach=0 (**KILL-criterion**: near-0 = la nicchia muore a prescindere dal segnale di spesa).

| Nicchia | A | B | C | μ | σ | **Si** | KILL-criterion C |
|---|---|---|---|---|---|---|---|
| **#1 Price-monitoring micro-seller (<500 SKU)** | 5 | 7 | 6 | 6.00 | 0.82 | **5.59** | PASS — Shopify App Store (canale €0, buyer già in ricerca) + r/shopify 349K, r/ecommerce 248K |
| #3 Media-monitoring post-Mention | 6 | 4 | 4 | 4.67 | 0.94 | **4.20** | FAIL — comunità PR gated (PRSA/PRCA/Slack/LinkedIn), r/publicrelations 32K bassa attività; richiede canale assente |
| #2 Prospect-research / SDR | 2 | 3 | 5 | 3.33 | 1.25 | **2.71** | n/a — già KILL su A (saturo) + B (data-moat non solo) |

**Provenienza re-scoring (ricostruibile, URL competitor reali, no "forza" a mano):**
- #1 A=5: Pricefy $49/100-SKU [pricefy.io/pricing](https://www.pricefy.io/pricing), Prisync $99/100-prod [prisync.com/pricing](https://www.prisync.com/pricing/), PriceMole $99/100-prod [apps.shopify.com/pricemole](https://apps.shopify.com/pricemole), Lurk free/250-SKU $49 [apps.shopify.com/lurk](https://apps.shopify.com/lurk). Tier $49-99 coperto; fascia sub-$30 affidabile 200-500 SKU **vuota**. NON greenfield (Pricefy = head-to-head).
- #1 B=7: job-core = crawl URL competitor + estrai prezzo/stock + match SKU + alert delta. Competenza scraping già del founder (autoscout24 `__NEXT_DATA__` + CoVe). Repricing dinamico fuori-scope v1. MVP 40-80h.
- #2 A=2: saturo free→$49 — Apollo free/$49 [apollo.io/pricing](https://apollo.io/pricing), Lusha free/$37 [checkthat.ai/brands/lusha/pricing](https://checkthat.ai/brands/lusha/pricing), Skrapp free/$29 [skrapp.io/pricing](https://www.skrapp.io/pricing). B=3: data-moat (275M+ contatti Apollo) non costruibile solo.
- #3 A=6: Mention killed piani $49-179 lug-2025, min ora $599 [mention.com/en/pricing](https://mention.com/en/pricing/). MA Awario €29/mo [awario.com/pricing](https://www.awario.com/pricing/) riempie già il gap (orphan base **sovrastimata**). B=4: crawl broad-web + API Twitter/X a pagamento [costo unverified] = build più pesante di #1.

### Nicchia selezionata (post re-scoring): **#1 — Competitor price monitoring per micro-seller ecommerce (<500 SKU, budget <$30/mo)**. Tipo: B2B-globale.

**Tesi di domanda**: i micro-seller (<500 SKU, side-hustle Shopify/Etsy) trovano Prisync/PriceMole/Pricefy ($49-99/mo, cap 100 SKU) sproporzionati. Fascia sub-$30 affidabile = vuota. Spesa esistente confermata lato-offerta; pain lato-domanda confermato MODERATE (3 citazioni primarie, sotto).

**Demand-signal lato-buyer (harvest 2026-06-08, primario non sollecitato):**
| Fonte | Citazione verbatim | URL | Classe |
|---|---|---|---|
| Shopify App Store, recensione PriceMole (Scented Royalty, 1★, 2023-10-09) | "overpriced at $99 limited to only 100 skus... isn't recommended for start-ups or beginners with no funding" | [pricemole/reviews?page=4](https://apps.shopify.com/pricemole/reviews?page=4) | (a) too expensive |
| Shopify App Store, PriceMole (Matero, 2022-04-05) | "find the price a bit high for a small business" | [pricemole/reviews?page=4](https://apps.shopify.com/pricemole/reviews?page=4) | (a) too expensive |
| Shopify App Store, PriceMole (The Craft Drinks Store, 4★, 2023-07-03) | "Pricing... could've been more generous, say up to 500 products at $99 would be more reasonable" | [pricemole/reviews?page=3](https://apps.shopify.com/pricemole/reviews?page=3) | (c) troppo limitato |

**Forza domanda = MODERATE**: 3 citazioni primarie reali, ma concentrate su un solo app e **Reddit inaccessibile al worker** (gap metodologico). NON STRONG.

**G1 VERDICT**: **GO-CONDIZIONATO → S3**. Distribution-fit PASS (kill-criterion superato, a differenza di #3). Build-feasibility alta. Demand MODERATE (reale ma sottile). Premessa portante da chiudere a STRONG **prima del build S4** = harvest Reddit (r/shopify "cosa usate per tracciare prezzi competitor?") o micro-survey Tally/r/shopify ≥30 risposte. **NON eseguito `advance --gate PASS`**: firmerebbe una premessa thin (§5).

```yaml
provenance:
  rescoring_tool: Task(trend-researcher) x2 — competitor-density + demand-harvest, WebSearch/WebFetch
  formula: "Si = mu - 0.5*sigma su criteri [A competitor-density, B build-feasibility-solo, C distribution-fit/KILL]"
  Si: {niche_1: 5.59, niche_3: 4.20, niche_2: 2.71}
  selected: niche_1_price_monitoring_microseller
  superseded: niche_3_media_monitoring  # selezione originale, ribaltata da re-scoring
  competitor_urls: [https://www.pricefy.io/pricing, https://www.prisync.com/pricing/, https://apps.shopify.com/pricemole, https://apps.shopify.com/lurk, https://apollo.io/pricing, https://www.skrapp.io/pricing, https://mention.com/en/pricing/, https://www.awario.com/pricing/]
  demand_urls: [https://apps.shopify.com/pricemole/reviews?page=4, https://apps.shopify.com/pricemole/reviews?page=3]
  ts: 2026-06-08
gate: G1
gate_status: GO-CONDIZIONATO  # NON advance --gate PASS: demand MODERATE, premessa portante thin
demand_strength: MODERATE
killed_niches:
  - "#2 prospect-research/SDR — KILL: saturo (A=2) + data-moat non costruibile solo (B=3)"
  - "#3 media-monitoring — demote: distribution-fit FAIL (canale PR gated, channel_reach=0) + Awario riempie gap"
blocked_on:
  - "[BLOCKED-ON Luke] demand-STRONG: harvest Reddit r/shopify O micro-survey >=30 risposte (worker Reddit-blocked, ~2h browser Luke). Fatto esterno raggiungibile solo da Luke (#1b) — mai re-validare staticamente."
gate_decided_by: Luke   # collaudo umano su demand-STRONG prima di S4-build
open_assumptions:
  - "[ASSUNTO-NON-VERIFICATO] costo attuale API Twitter/X (impatta solo #3, demoted)"
  - "[ASSUNTO-NON-VERIFICATO] dimensione reale segmento sub-$30 micro-seller (floor preciso)"
```

---

### [SUPERATA] Selezione originale #3 — media-monitoring (conservata per tracciabilità)

Nicchia selezionata: **Media monitoring per freelancer PR / micro-agenzie (<5 persone) espulsi dal repricing Mention (lug 2025)**. Tipo: B2B-globale.

**Tesi di domanda triangolata**: chi pagava $49/mo Mention per monitorare i brand dei clienti è rimasto senza soluzione di pari fascia (Mention ora min $599/mo, Brand24 $199/mo, sotto = solo F5Bot gratis senza analytics/sentiment). La spesa non è ipotetica: è una base-clienti con WTP già dimostrata, resa orfana da una scelta di pricing datata e verificabile. Cattura, non creazione di domanda.

Kill-criteria (market-intelligence-engine.md) — ognuno con evidenza esterna:

| Gate | Criterio | Esito | Evidenza (URL) |
|---|---|---|---|
| A | Audience raggiungibile e nominabile | PASS | r/marketing (1,4M membri) + gruppi LinkedIn "Freelance PR & Communications". Post tipo "Mention raised prices — what are you using now?". [r/marketing](https://www.reddit.com/r/marketing/) |
| B | Evidenza di spesa esistente | PASS | (1) Mention piani legacy $49/99/179 con acquirenti reali pre-lug-2025 [checkthat.ai](https://checkthat.ai/brands/mention/pricing); (2) Brand24 254 recensioni paganti a $199/mo [Capterra](https://www.capterra.com/p/149054/Brand24/reviews/); (3) mercato alternative <$100 attivo [xpoz.ai](https://www.xpoz.ai/blog/comparisons/best-brandwatch-alternatives-under-100/) |
| C | Floor di dimensione quantificabile | PASS | Brand24 254 recensioni Capterra + 4.7/5 G2 → base clienti nell'ordine delle migliaia; Mention base enterprise pre-pivot stimata decine di migliaia. [Brand24 Capterra](https://www.capterra.com/p/149054/Brand24/reviews/). Conteggio esatto ex-clienti $49 NON pubblico → `[ASSUNTO-NON-VERIFICATO]` sul floor preciso |
| D | Distribuzione fattibile da solo | PASS | Primi 50 senza ads: thread "Mention alternative 2025" su Reddit/Google (utenti in shopping-mode) + post diretto r/marketing. channel_reach=0 ma il segmento è già in ricerca attiva = Componente 0 costruibile su quella query |
| E | Intensità del dolore | **PARZIALE** | Citazione diretta vendor-page: "The $599/month minimum makes Mention impractical for individual freelancers or solopreneurs" [checkthat.ai](https://checkthat.ai/brands/mention/pricing). MA nessuna citazione utente NON sollecitata con superlativi (Reddit non indicizzabile dalla worker). `[ASSUNTO-NON-VERIFICATO]` → E va chiuso con harvesting Reddit manuale prima del build |

**G1 VERDICT**: **raccomandato GO → S3** (A,B,C,D PASS; E parziale). Condizione anti-falso-positivo (engine: E filtra "budget senza dolore"): chiudere E con ≥3 citazioni primarie di dolore non sollecitate su Reddit/LinkedIn PRIMA di S4-build. Decisione formale = collaudo Luke sull'evidenza.

```yaml
provenance:
  sources: [https://checkthat.ai/brands/mention/pricing, https://www.capterra.com/p/149054/Brand24/reviews/, https://brand24.com/prices/, https://www.xpoz.ai/blog/comparisons/best-brandwatch-alternatives-under-100/, https://www.reddit.com/r/marketing/]
  ts: 2026-06-06T19:00:02Z
gate: G1
gate_status: PENDING-COLLAUDO-LUKE
recommended_verdict: GO-CONDIZIONATO (E da chiudere con harvesting primario)
open_assumptions:
  - "[ASSUNTO-NON-VERIFICATO] conteggio esatto ex-clienti Mention $49/mo (floor C preciso)"
  - "[ASSUNTO-NON-VERIFICATO] citazioni primarie di dolore non sollecitate (criterio E)"
gate_decided_by: Luke      # collaudo umano sull'evidenza, non auto-validazione
```

---

## S3 — offerta (Offer scoping) — stazione 2 (parte A), worker builder

- **Cosa vendi** (job-core, 1 frase): {{...}}
- **Prezzo**: {{≥ revenue_floor / unità}}
- **Positioning vs workaround esistente**: {{...}}
- **Feature minima del job-core**: {{...}}

```yaml
provenance:
  derived_from: S2
  ts: 2026-06-06T19:00:02Z
```

---

## S4 — MVP (Build) — stazione 2 (parte B) — GATE G2

- **Repo / path**: {{...}}
- **URL deploy** (se applicabile): {{...}}
- **Test E2E del job-core**: comando eseguito = `{{...}}`, esito = {{exit-code / output osservabile}}

**G2 VERDICT**: {{GO → S5 | REWORK (max 1) | escala}}

```yaml
provenance:
  e2e_command: "{{...}}"
  e2e_result: "{{exit-code / URL raggiungibile}}"
  artifact_paths: [{{...}}]
  ts: 2026-06-06T19:00:02Z
gate: G2
```

---

## S5 — outreach (Distribution) — stazione 3 (parte A), worker distributor

- **Canale usato** (Componente 0): {{...}}
- **Buyer raggiungibili targetizzati**: {{N}}
- **Outreach consegnato**: {{N inviati, come, quando}}
- **Risposte tracciate**: {{...}}

```yaml
provenance:
  channel: {{Componente 0 ref}}
  outreach_log: {{path/URL}}
  ts: 2026-06-06T19:00:02Z
```

---

## S6 — verdetto (Validation) — GATE G3 = gate F TERMINALE

**Tasso di conversione** (niche-free): paganti reali / buyer raggiunti — NESSUN proxy.

- **Buyer raggiunti (N)**: {{...}} / target `buyers_reached_target`
- **Paganti reali**: {{...}} (soglia SHIPPED = `min_paying_to_pass`)
- **Esito**: {{≥soglia → SHIPPED | 1 → segnale debole, rework/kill | 0 → KILLED}}

**G3 VERDICT**: `BLOCKED-ON: ≥3 pagamenti reali (Stripe/Lemon/LOI) su 50 buyer raggiunti` — fatto terminale esterno NON raggiungibile in-sessione (vincolo #1b). Unico lavoro ammesso su G3 = renderlo raggiungibile (build job-core + Componente 0 + outreach), MAI re-validarlo staticamente.

```yaml
provenance:
  buyers_reached: {{N}}
  paying_count: {{...}}
  payment_refs: [{{Stripe/Lemon tx id}}]
  ts: 2026-06-06T19:00:02Z
gate: G3
gate_decided_by: Luke      # pagamento reale osservato da Luke, terminale
verdict: {{SHIPPED | KILLED}}
```

---

## Log decisioni di linea (append-only)
- 2026-06-06T19:00:02Z — S0 creato (seed_20260606, niche-free)
- 2026-06-06T19:00:02Z — S1 Discovery: 3 nicchie partorite da VOS via Task(trend-researcher), research reale con URL
- 2026-06-06T19:00:02Z — S2 compilato: nicchia selezionata = media-monitoring freelancer PR post-Mention. G1 PENDING-COLLAUDO-LUKE, raccomandato GO-condizionato (E da chiudere)
- 2026-06-08 — RE-SCORING (ordine OPERATE §3): 3 criteri [competitor-density, build-feasibility-solo, distribution-fit/KILL], Si=μ−0.5σ. Si: #1=5.59, #3=4.20, #2=2.71. Selezione **ribaltata #3→#1**. #2 KILLED (saturo+data-moat). #3 demoted (distribution-fit FAIL: canale PR gated + Awario riempie gap → orphan base sovrastimata). 2x Task(trend-researcher), URL competitor reali in provenance.
- 2026-06-08 — G1 su #1 = **GO-CONDIZIONATO**. Distribution-fit PASS (Shopify App Store €0 + subreddit aperti). Demand MODERATE (3 citazioni primarie Shopify reviews, Reddit worker-blocked). NON advance --gate PASS (premessa thin, §5). BLOCKED-ON Luke = demand-STRONG (harvest Reddit/micro-survey ~2h) prima di S4-build.
- G2 — non raggiunto (richiede S3 offerta + S4 build)
- G3 — BLOCKED-ON pagamento reale (vincolo #1b), irraggiungibile in-sessione
