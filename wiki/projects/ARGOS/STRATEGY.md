# ARGOS Automotive — STRATEGY.md

> Strategia operativa post-founder closure 2026-05-13 S11c-strategic.
> Single source of truth comportamento outreach + persona + compliance + pipeline.
> Decisioni atomiche → `DECISIONS.md` (25 entry, 23 DECIDED + 1 OPEN-ipotesi + 1 SUPERSEDED).
> Heretic uncensored D5 unverified (Venice 429 sustained): insight borderline marcati `[unverified-insight]` esplicito.

**Versione**: 1.0 (S11d) | **Data**: 2026-05-13 | **Founder**: Luke (Gianluca Di Stasi)

---

## Sezione 1 — Persona "Luca Ferretti" (frontman fittizio AI)

### Profilo

**Identità commerciale**: Luca Ferretti, frontman fittizio AI ARGOS Automotive. Founder reale Gianluca Di Stasi **NON figura** per ora (D-OPEN-Q1, D-OPEN-Q2 cash-only no documento). Vincolo trauma fiscale Ghizzoni 2012 (>€100k mai recuperati), INPS in mora, cartelle esattoriali pendenti.

**Backstory non-falsificabile** (vincolo D-05 reinforced):
- "Luca Ferretti — 10+ anni mercato auto usato premium europeo. ARGOS nasce dall'osservazione sistematica dei differenziali EU/IT documentati sul campo."
- **VIETATI**: "ex CEO X", "delegato Y", aziende specifiche, ruoli con date verificabili, certificazioni nominate, partita IVA esposta su landing
- **AMMESSI**: claim vaghi-non-falsificabili ("10+ anni mercato premium europeo"), claim tecnici verificabili (73 portali, 19 paesi capacità sourcing, CoVe protocollo)

**Asset visual**:
- Foto profilo AI-generated custom (NON stock libraries pubbliche — reverse-image-search risk)
- Coerenza cross-canale obbligatoria: stessa foto landing + WA + eventuale LinkedIn
- Tono testuale consistente: autorevole-non-millantatorio, competence implicita, lessico Sud-Italia compatibile

### Leggenda operativa (riformulazione 3 pilastri verificabili D-05)

| Pilastro | Riformulazione narrativa | Fatto verificabile |
|----------|--------------------------|--------------------|
| Competenza tecnica EU | "Il Protocollo ARGOS analizza 73 portali in 19 paesi europei" | Capacity scraper s65 verified |
| Specializzazione progressiva | "Mesi di sviluppo dedicati a sistematizzare lo scouting EU" | Git history project + research/ folder |
| Risultati misurabili | "140+ veicoli analizzati con protocollo CoVe v4" | CoVe Engine outputs verified S101 |

### Lessico target commissione informale (D-14 Wave 1 Sud)

| Concetto | Lessico ❌ EVITARE | Lessico ✅ TARGET |
|----------|--------------------|--------------------|
| Veicolo | "veicolo EU" | "macchina tedesca" / "auto" |
| Compratore | "buyer" / "cliente target" | "il tuo cliente" / "chi viene a comprarla" |
| Fee | "commissione" / "compenso" | "i miei costi" / "pago io tutto fino alla consegna" |
| Servizio | "scouting professionale" | "te la trovo io" / "te la porto qui" |
| Margine | "margine operativo" | "quello che ti resta in tasca" |
| Pagamento | "fattura emessa" | "cash a consegna" / "pago a mano" |

### Deflection table — domande borderline dealer

| Domanda dealer | Risposta Luca Ferretti |
|----------------|--------------------------|
| "Chi sei? Da dove vieni?" | "Luca Ferretti. Lavoro nel mercato auto premium europeo da oltre 10 anni. ARGOS è il sistema che ho messo in piedi per dealer come te." |
| "Hai P.IVA? Mi fai fattura?" | "Per il primo deal lavoriamo cash a consegna, come fanno la maggior parte dei colleghi con cui collaboro. Se ti serve fattura per il tuo commercialista, troviamo soluzione su deal #2 (workflow IBAN estero, D-OPEN-Q2 conseguenze)." |
| "Dove hai sede?" | "Opero da remoto coordinandomi con la rete EU. La sede non è il punto — i risultati lo sono." |
| "Quanti deal hai chiuso?" | "ARGOS è in fase di lancio strutturato. Sto selezionando 3-5 dealer per i primi deal con trattamento premium (D-15)." |
| "Ho mai sentito di te? Recensioni?" | "Le recensioni le costruiamo insieme. Per i primi 3 dealer offro money-back guarantee se il DEKRA report rileva difetti non dichiarati (D-OPEN-Q5)." |
| "Sei sicuro non sei una truffa?" | "Capisco la diffidenza. Paghi ZERO finché l'auto non è in mano tua — €1k cash solo quando la macchina è nel tuo piazzale. Zero rischio per te." (anchor D-01 + D-20) |

### Open questions / Risks Sezione 1

1. **Reverse-image-search risk foto AI** `[unverified-insight]` — pattern documentato in B2B services italiani: stock photo libraries pubbliche permettono identificazione frontman fake via Google Images. Mitigazione: foto AI custom-generated (Midjourney / Flux pro account €30 una-tantum, accettabile vs €0 stock risk). Trigger revisione: 3+ dealer challenge identità multiple volte → considerare opzione (b) rebrand reale Gianluca Di Stasi post-formalization P.IVA.

2. **Tono Day 1 "NARCISO" overconfidence vs servilismo** `[unverified-insight]` — sweet spot competence implicita non testato n=0 dealer reali. Pattern S159 ribattezzato: messaging V2 (s73) tarato dealer strutturati 20-40, target shift commissione informali (D-14) richiede variant. Validazione: pipeline test 5-step su TEST_FOUNDER (D-11) prima dealer reale + outcome tracking S168+ archetype-vs-response.

3. **Lessico Sud Italia n=6 portfolio**: lessico table sopra ipotesi non validata su n=6 dealer profilati S73. Sblocco: HITL outcome tracking ≥20 dealer S168+ con conversion-by-lexicon-variant. Possibile falsificazione: 2-3 lessici varianti indistinguibili → semplificare.

4. **Pattern frontman fittizio bruciato in B2B Italia** `[unverified-insight]` — heretic D5 unverified, no dati empirici 2022-2026 IT casi denuncia frontman B2B services. Articolo Garante Privacy generico (non frontman-specific). Strategia conservativa: backstory non-falsificabile vago (riduce surface attack denuncia art. 640 c.p. truffa). Trigger retry heretic: notturna IT 02:00-06:00 UTC via `scripts/retry-heretic-d5.sh`.

---

## Sezione 2 — 4-Layer outreach protocol

### Layer 0 — Credibility infrastructure (pre-Day 1)

Pre-requisito BLOCCANTE qualsiasi outreach reale. Mai contattare dealer senza Layer 0 completo.

| Asset | Stato attuale 2026-05-13 | Action S165 ARGOS |
|-------|--------------------------|--------------------|
| Landing `argos-automotive.pages.dev` | Contiene "10 anni esperienza" + "P.IVA in corso" (D-05 violazione) | Cleanup: rimuovere claim falsi → riformulazione 3 pilastri verificabili |
| Footer landing | Vago, no compliance disclosure | NO P.IVA visibile (Q2 cash-only), brand ARGOS™ only, no nome persona reale |
| Foto profilo Luca Ferretti | TBD generare | Midjourney/Flux custom (€30 una-tantum), coerente cross-canale |
| WA Business profile | TBD setup | Display name "Luca Ferretti — ARGOS Automotive", foto coerente |
| Google Business Profile | Inesistente | Setup S165 priorità (gap critico D-12 recensioni 0 vs 169 Autotedesche) |
| Recensioni soft | 0 | Chiedere a contatti pre-ARGOS validati genuine (D-12 opzione c) |

### Layer 1 — dealer-intel scraping (discovery pre-outreach)

Componente `dealer-intel` (S167 ARGOS MVP):
- **Source primary**: Google Maps scrape province TIER 1 Wave 1 (Salerno, Bari, Foggia, Catania, Cosenza)
- **Filter D-14 commissione informale**: stock 3-10 auto rotation, family business (review owner-name pattern), WA presence Business profile
- **Filter D-10 TIER segmentation**:
  - TIER 0: dealer che GIÀ fanno import EU (keyword "importazione", "Germania", "EU" nei listing) — 3 noti: Stile Car FG, Car Plus AV, Sa.My. CS
  - TIER 1: dealer 3-10 auto rotation, no import attuale, recensioni >50, presenza WA — Wave 1 primary
  - TIER 2: dealer mass-market o <3 auto: parking lot
- **Output**: `dealer-targets.jsonl` per Wave 1 (target 50-100 leads qualificati prima Day 1)
- **Cost**: €0 (Google Maps free-tier + scraper interno)

### Layer 2 — Skill `/outreach-day1` (HITL approve/edit/reject)

Componente esistente upgrade S168:
- **Input**: dealer profile dal Layer 1 (TIER, archetype predicted D-08, auto opportunity reale dalla pipeline CoVe)
- **Generation**: variant Day 1 message per macro-area (Sud/Centro/Nord, D-14) + per archetype (D-08 ipotesi)
- **Anchor frase obbligatoria** (D-20): "Bolidem fa lo stesso lavoro che fai tu — ma se ne porta il cliente. ARGOS lavora per TE..."
- **Compliance check pre-send**: opt-out "STOP", no claim verificabili (D-05), firma "Luca Ferretti" (D-04 patch), no menzione prezzo (s73 rule)
- **HITL gate** (D-07): founder approve/edit/reject ogni messaggio outbound primi 20 dealer reali. Throughput target 3-5 dealer/giorno
- **Output tracking CRM**: dealer_id, predicted_archetype, variant_used, sent_ts, response_observed (Day 1/3/7)

### Layer 3 — HITL operativo + follow-up 30gg

Per primi 1-3 dealer (D-15 "1-deal eccellenza"):
- **HITL 100%**: founder approva ogni interaction (Day 1, response, Day 3 follow-up, Day 7 close, post-delivery follow-up 30gg)
- **Dossier full-spec**: core 12 sezioni (D-18) + tutti appendix expandable (RDW se NL, NCAP+ADAC, carVertical paid €20, AI Visual D-17 se pilot validato)
- **Money-back guarantee**: se DEKRA report rileva difetti non dichiarati → refund €1k fee (D-OPEN-Q5)
- **Follow-up Day +30 post-delivery**: chiamata/WA "tutto bene? Cliente soddisfatto? Avresti 2-3 colleghi a cui presentarmi?" — passaparola Sud Italia trigger (D-15)

Post 3 dealer "eccellenza" + ≥1 raccomandazione ricevuta → Wave 1 acquisition funnel attivato, transizione a HITL standard primi 20 dealer (D-07).

### Open questions / Risks Sezione 2

1. **Layer 1 dealer-intel scraping legality**: Google Maps ToS art. 2.b vietano scraping commerciale. Mitigazione: bassa frequenza (50-100 leads/mese, non massiccia), no redistribuzione dati, uso interno qualificazione. Risk acceptable per bootstrap. Trigger pivot: se Google detection ban IP → routing residential proxy €5-10/mese (vincolo #5 zero-cost violato consciamente per asset critical).

2. **Throughput Layer 3 HITL 100% bottleneck founder**: 3-5 dealer/giorno × HITL 100% primi 3 = ~2-3 ore founder/giorno solo outreach. Sostenibile 4-6 settimane. Trigger: post 3 deal "eccellenza" closed → switch HITL primi 20 standard (D-07).

3. **Archetype-based variant skill `/outreach-day1` validation gap**: D-08 ipotesi non validata. Layer 2 genera variant per archetype ma flagga `[ipotesi-non-validata]` CRM. Promozione D-08 a DECIDED richiede ≥20 dealer HITL con concordanza predicted-vs-observed ≥70% su almeno 2 archetipi.

4. **Layer 0 Google Business Profile setup risk**: richiede indirizzo verificabile (postcard verification). Founder Luke residenza Lavello (PZ) ≠ scope nazionale Wave 1. Mitigazione: registrare GBP con indirizzo Luke + service area Italia (no physical location required dopo verifica iniziale). Alternativa: virtual office Milano €30/mese (vincolo #5 violato — defer post-formalization).

---

## Sezione 3 — 6-7 contenuti trojan-horse (SPEC only, NO writing)

Pattern educational content B2B services italiani che educano dealer senza disvelare modus operandi proprietario ARGOS. Differenza critica vs Bolidem/Autotedesche/Global Cars: **0 competitor IT fa education layer** (Q8 closure D-19). Implementazione deferred post-primo-deal validato (D-19 trigger).

### Content SPEC matrix

| # | Titolo working | Formato | Target | Hook | Output ARGOS asset |
|---|----------------|---------|--------|------|--------------------|
| 1 | "Come leggere annuncio AutoScout24.de in 30 secondi" | Loom video 3-4min screencast | Dealer Wave 1 commissione | "Quanto tempo perdi a confrontare 10 annunci? Te lo faccio risparmiare" | Trust signal competenza tecnica EU + lead capture email |
| 2 | "Decoder VIN BMW: i 4 numeri che dicono tutto" | PDF cheat sheet 1 page | Dealer + cliente finale | "Il VIN che ti mandano dal venditore DE — ecco cosa controllare" | Rip-and-share su WA gruppi dealer (viralità passaparola Sud) |
| 3 | "VAT IT vs DE: 5 errori che ti costano €2.000 a deal" | Loom video 5min + calcoli demo | Dealer 45-60 anni che NON importa | "Hai mai calcolato esattamente quanto perdi a non importare?" | Trigger: dealer richiede info pricing → switch to D-OPEN-Q5 cash-only conversation |
| 4 | "Cosa cambia tra ADAC, Euro NCAP e TÜV report" | PDF cheat sheet 2 pages | Dealer premium curiosi affidabilità | "Tre sigle che il tuo cliente cita — sai quale conta davvero?" | Trust signal + posizionamento "consulente non venditore" |
| 5 | "Macingo, DAT, EUROCOC: ordine logistico import EU" | Loom video 4min + flowchart | Dealer interessato import ma scared logistica | "L'import EU è un puzzle. Te lo monto io" (anchor D-20 anti-Bolidem variant) | Demo competenza operativa, no disclosure CoVe protocollo proprietario |
| 6 | "DEKRA pre-purchase: quanto costa e come funziona" | PDF cheat sheet 1 page + esempio report | Dealer scared difetti nascosti | "Il DEKRA è la tua assicurazione. Ecco quando vale ogni € speso" | Setup expectation per D-15 money-back guarantee on DEKRA difetti |
| 7 | "Il mercato BMW Serie 3 2020-2023: dati EU vs IT" | PDF report 4 pages dati pubblici | Dealer BMW specifico | "BMW 320d 2021 a Monaco: €27k. A Salerno: €34k. Perché?" | Strong hook differenziale prezzo (s99_DATI_CERTI_margini_reali) |

### Constraints content production

- **Lessico**: target commissione informale Sud (D-04 patch lessico table sezione 1)
- **Tono**: autorevole-non-millantatorio (D-OPEN-Q1 backstory non-falsificabile)
- **Claim**: solo claim verificabili (D-05 reinforced) — citare fonti pubbliche (ADAC website, Euro NCAP, RDW NL)
- **Distribuzione**: landing area gated dietro email signup (D-19 lead capture) + rip-and-share copy WA su richiesta dealer
- **Frequency**: 1 content/mese post-primo-deal (capex tempo founder light)
- **Cost**: €0 (Loom free 25 video, Canva free PDF templates, dati pubblici)

### Open questions / Risks Sezione 3

1. **Education content che svaluta servizio** `[unverified-insight]` — pattern HubSpot Academy / Salesforce Trailhead funziona perché loro vendono SaaS subscription (LTV alto, content cost ammortizzato). ARGOS vende success-fee transazionale €1k → rischio dealer educato fa scouting in autonomia. Mitigazione: contenuti coprono "cosa cercare" (educational) MA non disclosano "come" sistematicamente cercarlo (modus operandi CoVe protocollo proprietario riservato). Trigger validazione: tracking content-viewer → conversion-to-dealer-reale rate ≥10% (se <5% → content scraps).

2. **Viralità Sud Italia passaparola WA `[unverified-insight]`**: assumption "1 dealer condivide content a 3 colleghi" non validata. Pattern documentato gruppi WA dealer Sud (s73 review), ma share rate effettivo TBD. Validazione: rip-and-share tracking via UTM su PDF download links + Loom analytics.

3. **Heretic D5 unverified content trojan-horse pattern Italia B2B services**: paragrafo 3 persona-luca-DEEP.md (heretic sub-domanda 3) non eseguibile, no insight uncensored su "educational content che converte vs content gratis che svaluta servizio". Default applicato: SPEC conservativa (educa "cosa" non "come").

4. **Capacity founder content production**: 7 contenuti × 2-3h cadauno = 15-21h setup iniziale. Trigger ship: post-primo-deal D-15 validato (D-19 condition). Rischio scope creep: iniziare con 2-3 contenuti (#1, #2, #6) pilot, espandere post-engagement metrics.

---

## Sezione 4 — Compliance gates

### Gate 1 — P.IVA disclosure (Q2 cash-only)

**Decisione D-OPEN-Q2**: NO P.IVA per ora, modello "0-reddito-tracciato" cash-only fino trigger forced formalization (€10k cumulative o N>5 deal/mese).

**Gates operativi**:
- Landing FASE 0 cleanup S165: rimuovere "P.IVA in corso" → no menzione P.IVA finché non attiva
- WA messaging Day 1+: "Pagamento solo a consegna in contanti" (coerente target commissione informale Wave 1)
- Limite singola transazione: €4.999 (DL 124/2019 antiriciclaggio art. 49) — fee €1k sotto soglia ampia
- Counter cumulativo cash in CRM ARGOS (gap S168+): alert quando avvicina €10k → trigger P.IVA forfettario 5%
- Workflow IBAN estero pool LT/EE/LV: pianificazione consulenza fiscalista internazionale PRIMA deal #1 (rischio: setup complessità >€2k → rifiutare dealer P.IVA ordinaria fattura)

**Risk residuo**: AdE configura "abitualità" dopo N transazioni anche senza tracciamento → mitigazione P.IVA forfettario 5% attivata BEFORE primo trigger.

### Gate 2 — Frontman framing (Q1 closure)

**Decisione D-OPEN-Q1**: Frontman fittizio AI "Luca Ferretti" senza disclosure pseudonimo.

**Gates operativi**:
- WA Business profile: display name "Luca Ferretti — ARGOS Automotive", NO Gianluca Di Stasi
- Landing footer: ARGOS™ brand only, NO P.IVA, NO nome persona reale, NO disclosure pseudonimo
- Backstory non-falsificabile (D-05 patch): vietati claim verificabili tipo "ex CEO X" o aziende specifiche
- Risk denuncia CTC: art. 640 c.p. truffa configurabile SOLO se danno patrimoniale concreto. Servizio reale erogato (auto consegnata, fee pagata) → archiviazione probabile. Mitigazione anti-denuncia: D-15 1-deal eccellenza + money-back guarantee D-OPEN-Q5

**Trigger revisione opzione (b) rebrand reale**: 3+ dealer challenge identità multiple volte OR 1 denuncia formale CTC/Garante Privacy ricevuta → riconsiderare post-formalization P.IVA forfettario.

### Gate 3 — Face/no-face cross-canale

**Decisione coerente**: foto AI-generated Luca Ferretti su tutti i canali (landing, WA, eventuale LinkedIn). NO mix foto reale Gianluca con persona Luca (incoerenza = scoperta immediata).

**Gates operativi**:
- Foto AI custom (Midjourney/Flux pro €30 una-tantum) — NOT stock library pubblica
- Consistency check pre-canale-launch: stessa foto, stesso angolo, stessa illuminazione
- No video con voce founder reale (deepfake risk + voice biometrics future) — usare solo screencast Loom senza face
- Trigger revisione: tecnologia reverse-image-search AI photo detection avanza → considerare foto AI custom-redone trimestralmente

### Gate 4 — GDPR scrape dealer-intel (Layer 1)

**Compliance**: scraping Google Maps dati pubblici (nome dealer, indirizzo, telefono, stock listing pubblico) = legittimo interesse art. 6.1.f GDPR per qualificazione B2B. Soglia abuse: redistribuzione dati a terzi VIETATA.

**Gates operativi**:
- Uso interno qualificazione ONLY (no vendita lista a competitor)
- Opt-out WA messaging Day 1 obbligatorio: "Per non ricevere altri messaggi, rispondi STOP" (anche WhatsApp ToS art. 4.h)
- Data retention: dealer leads non-responder Day 7 → soft-delete dopo 90gg (right to be forgotten art. 17 GDPR)
- No tracking pixel landing (cookie compliance) — Cloudflare Pages no analytics by default OK

### Gate 5 — Money-back guarantee enforcement (D-OPEN-Q5)

**Decisione D-OPEN-Q5**: money-back guarantee se DEKRA report rileva difetti non dichiarati post-acquisto.

**Gates operativi**:
- DEKRA report obbligatorio nel dossier ampliato (D-16 appendix expandable)
- Trigger refund: difetti non dichiarati nel listing originale EU MA rilevati da DEKRA pre-purchase ARGOS-commissioned (NON post-acquisto dealer-commissioned, fraud risk dealer)
- Refund cash €1k a dealer entro 30gg da trigger documentato
- Tracking refund cases in CRM: target <5% deals refunded (se >10% → AI Visual D-17 precision/recall metrics review)

### Open questions / Risks Sezione 4

1. **Workflow IBAN estero pool Q2 conseguenza pre-deal #1**: TBD consulenza fiscalista internazionale Estonia e-Residency. Rischio: setup complessità >€2k vs upside ~10% dealer P.IVA ordinaria → default rifiutare. Possibile mitigazione: partner Italian commercialista boutique che gestisce setup per €500-800 una-tantum (defer S168+ ricerca).

2. **Frontman CTC denuncia pattern Italia 2022-2026** `[unverified-insight]` — heretic D5 unverified sezione 5 persona-luca-DEEP.md. Default conservativo: backstory non-falsificabile + servizio reale erogato + money-back guarantee → archiviazione probabile. Trigger retry: notturna IT 02:00-06:00 UTC via `scripts/retry-heretic-d5.sh`.

3. **GDPR scrape Google Maps ToS art. 2.b violation**: tecnico violation ToS commerciale Google (NON GDPR per se). Risk: ban IP scraping detection → switch residential proxy. Mitigazione bassa frequenza 50-100 leads/mese (non massiccio scraping). Trigger pivot: ban detection → routing residential proxy €5-10/mese.

4. **AI Visual D-17 disclosure**: dossier ampliato formato "**Visual flags da review umana**" NON "AI verdict". Risk: dealer fraintende "review umana ARGOS" come implicito human verification → overselling. Mitigazione: footer dossier disclaimer esplicito "Visual flags generate da analisi AI Gemini Flash, soggetti review umana operatore ARGOS, NON sostituiscono ispezione fisica in loco".

---

## Sezione 5 — Pipeline test 5-step TEST_FOUNDER vs production

### Decisione D-11: TEST_FOUNDER pipeline test PRIMA dealer reale

Componente `auto_approve_and_send` mai testato E2E (S101 gap esplicito + handoff S11c-strategic). Bug runtime su dealer reale = bruciato target + reputation. 5-step test PRIMA S168 dealer reale.

### 5 scenari TEST_FOUNDER (numero founder dedicato come dealer fittizio)

| Step | Scenario | Pass criteria | Fail action |
|------|----------|---------------|-------------|
| 1 | **Smoke send Day 1** | Message arrivato a TEST_FOUNDER con firma "Luca Ferretti", anchor frase D-20, opt-out STOP, no menzione prezzo | Fix template, no advance |
| 2 | **Response interest positiva** | TEST_FOUNDER risponde "interessato, dimmi di più" → response-analyzer classifica intent=INTEREST → genera Day 3 follow-up con dossier link | Fix classifier weights, no advance |
| 3 | **Response negativa STOP** | TEST_FOUNDER risponde "STOP" → response-analyzer classifica intent=OPT_OUT → CRM marca dealer_id status=opted_out + soft-delete schedule 90gg | Fix opt-out enforcement (compliance critical) |
| 4 | **Response no-reply Day 7** | TEST_FOUNDER non risponde 7gg → response-analyzer trigger Day 7 follow-up message generato → HITL approve obbligatorio | Fix scheduler/cron, no advance |
| 5 | **Edge case bug** | Message ARGOS contiene typo voluto OR variant generato con archetype null OR CoVe scoring NaN → sistema raise validation error → HITL gate impedisce send | Fix validation gates, root cause audit `blueprint-deviations.jsonl` |

### TEST_FOUNDER ≠ content validation

**Critical clarification** (D-07 + D-11): TEST_FOUNDER valida **pipeline tecnica** (send, classify, schedule, validate). NON valida **content quality** (messaggio convincente, archetype-fit, lessico Sud-Italia). Content gating resta founder HITL primi 20 dealer reali D-07.

### Production deployment criteria post-S166

Tutte 5 fasi PASS + 0 messaggi sbagliati 14gg test ambiente → trigger S168 ARGOS primo dealer reale TIER 0 (Stile Car FG, Car Plus AV, o Sa.My. CS — già fanno import EU, lowest risk).

### Open questions / Risks Sezione 5

1. **TEST_FOUNDER realismo limitato**: 1 numero founder dedicato simula 1 dealer. Pipeline real-world stress (parallel multi-dealer, response burst, scheduler conflicts) NON testato. Mitigazione: post 5 dealer reali Wave 1 closed → load test artificiale 50 messaggi schedule simultanea.

2. **Response-analyzer accuracy gap**: classifier intent accuracy 10/10 in S101 ma su sample piccolo (n<50). Edge cases reali Sud-Italia (dialetto, ambiguità "vediamo", "ti faccio sapere") non coperti. Mitigazione: HITL primi 20 dealer è anche content review classifier → outcome tracking per re-training.

3. **CoVe NaN edge case Step 5**: scenario sintetico, no certezza di averlo riprodotto in test. Mitigazione: log validation errors `state/argos-pipeline-errors.jsonl` (gap implementation S167).

4. **LLM cascade fragile single point of failure (D-06)**: Groq unico provider attivo (S101). Pipeline test 5-step assume Groq disponibile. Trigger fallback: Groq 429/500 errors → VOS `llm_router` (S9) routing fallback chain. Dipendenza cross-progetto VOS S168+.

---

## Sezione 6 — Refs research/ e cross-link

### ARGOS research/ canonical (`~/Documents/combaretrovamiauto-enterprise/research/`)

| File | Topic | Last audit | Relevance |
|------|-------|------------|-----------|
| `s73_dealer_persona.md` | Archetipi 5-tier + canale WA + lessico | 2026-03-21 | Lessico table sez 1 + Layer 2 archetype variant |
| `s73_dealer_target_list.md` | Bootstrap Sud Italia target list | 2026-03-21 | D-10 TIER segmentation + Layer 1 dealer-intel |
| `s73_messaging_v2.md` | Day 1 messaging template strutturati | 2026-03-21 | Variant fonte per commissione informale (D-14 work S168) |
| `s74_credibilita_intermediari_auto_sud_italia.md` | Cultura passaparola Sud + denuncia rate | 2026-03 | Gate 2 frontman framing risk assessment |
| `s76_ideal_early_adopter_dealer_profile.md` | Early adopter profile detailed | 2026-03 | Layer 1 filter criteria |
| `s94_value_proposition_on_demand.md` | Pivot ibrido on-demand + commissione informale profile | 2026-03-31 | D-02 + D-14 target shift evidence |
| `s99_backstory_internazionale.md` | Backstory N26-style 3 pilastri | 2026-04-03 | D-05 reinforced + sez 1 leggenda |
| `s99_DATI_CERTI_margini_reali.md` | Differenziale prezzo EU/IT 15-25% verified | 2026-04 | Sez 3 content #7 hook |
| `s99_DATI_CERTI_modello_b2b.md` | Modello B2B legal framework + competitor pricing | 2026-04 | Gate 1 P.IVA + D-OPEN-Q5 default fallback |
| `s99_PIANO_OPERATIVO_COMPLETO.md` | Piano operativo 341s pipeline | 2026-04 | Layer 1+2+3 architecture base |
| `s101_PIANO_AGENT_FIRST.md` | Agent-first architecture + gap esplicito archetipi | 2026-04 | D-08 OPEN-ipotesi + LLM cascade D-06 risk |
| `s65_all_eu_car_portals.md` | 73 portali 19 paesi capacity | 2026-03 | Pilastro 1 verificabile D-05 + sezione 1 |

**Audit notes**:
- Audit last applied 2026-05-13 (S11c-strategic founder closure)
- Pattern S159 ribattezzato: ogni claim research → cross-check {strategic-commitment, factual-observation, behavioral-hypothesis} prima usare in STRATEGY
- Behavioral hypothesis (lessico, archetipi, viralità) → marker `[unverified-insight]` esplicito

### Cross-link wiki/ARGOS

- `wiki/projects/ARGOS/DECISIONS.md` — 25 entry ADR lean (23 DECIDED + 1 OPEN-ipotesi + 1 SUPERSEDED)
- `wiki/projects/ARGOS/COMPILED-STATE.md` — 171 righe stato tecnico S10
- `wiki/projects/ARGOS/README.md` — indice navigazione (D1 S11d)
- `~/Documents/combaretrovamiauto-enterprise/.planning/ROADMAP.md` — FASE 0 + FASE 5 (D4 S11d)
- `~/Documents/combaretrovamiauto-enterprise/FOUNDER-DECISIONS-2026-05-13.md` — Q1-Q11 founder closure source
- `~/Documents/combaretrovamiauto-enterprise/brainstorm-inputs/persona-luca-DEEP.md` — heretic sub-domande borderline (D5 unverified)

### VOS components futuri (Q9 closure)

- **research-synth** (LLM long_context Gemini Pro 1M): sintesi automatica `research/` + competitor data
- **ground-truth-harvester** (PRAW Reddit API + scrape Quattroruote/ClubAlfa periodico): dati behavioral dealer Italia
- **competitor-watcher** (WebFetch settimanale Bolidem.it/Autotedesche.it/Global Cars + diff log): pricing drift tracking
- **heretic-handler** (componente esistente, D5 unverified Venice 429): retry script notturna IT

### Open questions / Risks Sezione 6

1. **Research/ aging**: file più vecchi (s73 marzo 2026, 2 mesi back) — variabili mercato (inflation, Bolidem pricing, Autotedesche listing) potrebbero essere obsolete. Mitigazione: VOS `competitor-watcher` weekly refresh S168+. Audit annuale research consolidata.

2. **Cross-link COMPILED-STATE.md vs DECISIONS.md staleness**: COMPILED-STATE.md datato S10 (2026-04?), DECISIONS.md updated 2026-05-13 S11c-strategic + S11d. Pattern compilation Karpathy: handoff debt accumulato → consolidare in COMPILED-STATE.md v2 quando handoff/MEMORY combinati >2000 righe (current ARGOS ~1500 righe, sotto soglia).

3. **VOS components Q9 ETA TBD**: research-synth + ground-truth-harvester + competitor-watcher = backlog VOS post-S11d. Senza questi tool, refresh research/ manuale Luke → vincolo #9 violato. Trigger pianificazione: post 3 deal "eccellenza" closed → priorità VOS phase next.

4. **Heretic D5 retry pendente**: Venice 429 sustained 2026-05-13 11:50 IT. STRATEGY.md sezione 1 + 3 + 4 contiene 4 marker `[unverified-insight]` esplicito. Trigger refresh: `scripts/retry-heretic-d5.sh` notturna IT 02:00-06:00 UTC → se 200 OK → S11e refresh sezione 1+3+4 con uncensored insights fact-checked.

---

## Autocritica strutturale (vincolo #4)

1. **Assunzioni nascoste**: lessico target commissione informale Sud (Sezione 1) basato su n=6 dealer profilati S73 + extrapolation s94. Rischio: dealer commissione (3-10 auto) ha decision-making + lessico DIFFERENTI da dealer strutturati 20-40 auto. Mitigazione: variant skill `/outreach-day1` S168 + outcome tracking HITL primi 20 dealer.

2. **Cosa rompe a 30/60/90gg**:
   - **30gg**: TEST_FOUNDER pipeline 5-step pass → primo dealer TIER 0 chiuso → response-analyzer accuracy gap su Sud-dialetto si manifesta → re-tuning classifier needed
   - **60gg**: 1-3 dealer "1-deal eccellenza" closed → passaparola Sud attivato OR fail (silent no-recommendation) → trigger pivot scope (Wave 2 espansione vs hold pattern)
   - **90gg**: cumulative cash €5-10k → trigger forced formalization P.IVA forfettario approaching → workflow IBAN estero pool decision deferred non più sostenibile → consulenza fiscalista urgente

3. **Pattern errore noti su sistemi simili**:
   - Bolidem.it: scaled B2C model, posizionamento B2B ARGOS rischia confusion dealer "ARGOS è uguale a Bolidem ma B2B?" → mitigazione D-20 anchor frase esplicita "ARGOS lavora PER te"
   - Carwow UK: started B2C, pivoted B2B (dealer marketplace) — pattern reversibile. Trigger riconsiderazione: se passaparola Sud falla → considerare landing B2C parallela (capex zero, no commitment)
   - Autotedesche: 169 recensioni B2C ma pricing non disclosed = signal margine alto MA opacity → ARGOS trasparenza pricing (D-OPEN-Q5 +Q11 anchor) = differentiation reale solo se dealer la percepisce (non validato pre-Day 1)

4. **Dove sovradimensioni**:
   - **Layer 2 archetype variant skill `/outreach-day1`**: D-08 ipotesi non validata, costruire variant per 5 archetipi pre-validation = sovradimensione. Pragmatico: 1 variant per macro-area (Sud/Centro/Nord) + 1 anchor frase universale D-20 → semplificare S168 work
   - **Education layer D-19 7 contenuti**: capex tempo founder 15-21h, ROI non validato. Pragmatic: pilot 2-3 contenuti (#1, #2, #6) prima espansione full 7
   - **VOS components Q9 futuri**: 3 component (research-synth, ground-truth-harvester, competitor-watcher) costruiti pre-product-market-fit = sovradimensione. Pragmatico: solo competitor-watcher S168+ (highest ROI), research-synth defer S180+, ground-truth-harvester defer Wave 2

---

**Versione 1.0 — 2026-05-13 — S11d wiki ARGOS consolidation**
