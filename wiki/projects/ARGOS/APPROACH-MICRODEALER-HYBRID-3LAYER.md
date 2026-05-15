# Approach Micro-Dealer Hybrid 3-Layer — CTO Proposal S170-post-close

> **Status**: PROPOSED (founder S170-post-close 2026-05-14 ha chiesto: "io non so come trovare metodo vincente, dobbiamo usare tool, o altro che mi devi proporre, skills psicologiche, sei tu il CTO")
> **Vincolo**: documento di proposta — necessita validation via research P1 (PROMPT-S171-ARGOS) prima di operationalize
> **Vincolo**: zero capex (vincolo #5 founder) — solo OSS + free-tier tools

---

## Sintesi 30 secondi

3 layer outreach a cascata, ognuno con tool stack e psychology specifici:

| Layer | Funzione | Tool | Skills psicologiche | Cost |
|---|---|---|---|---|
| **L1 Marketing infiltration** | Discovery + pain listening passive | PRAW Reddit + Telethon Telegram + Subito.it scraper | Reciprocity (rispondi gratis a question altri) + Mirror language (lessico micro-dealer) | €0 |
| **L2 Mystery shopper WA** | 1-to-1 trust building + pivot | WA personal/burner number + script template variabile | Curiosità (pivot organico non scripted) + Social proof ("ho sentito di un servizio") + Reciprocity (info gratis) | €0 |
| **L3 AMBRA agent autonomous** | Scale follow-up dealer warm | ARGOS Phase 6 AMBRA agent (WA Baileys + LLM cascade) | Mirror language (lessico FSM) + Anchoring (€1k vs DIY scout time-cost) + Authority (trust signals tecnici) | €0 (free tier LLM) |

---

## Layer 1 — Marketing infiltration

### Obiettivo
NON outbound, NON broadcast. Passive listening + identificazione micro-dealer commissione attivi nei canali dove vivono naturalmente, senza disturbarli.

### Tool stack OSS gratis

#### Reddit (PRAW Python)
```python
# Setup ~/Documents/combaretrovamiauto-enterprise/tools/layer1_reddit_scout.py
import praw
reddit = praw.Reddit(
    client_id=os.environ["REDDIT_CLIENT_ID"],      # free tier 60 req/min
    client_secret=os.environ["REDDIT_CLIENT_SECRET"],
    user_agent="argos-scout/1.0",
)
# Subreddit target
SUBS = ["automobili", "ItaliaCarOwners", "ItaliaCareerHelp", "Italia",
        "AutomobileItalia", "ImportAutoUE"]  # validate exist S171
# Pattern keyword
KEYWORDS = ["commissione", "dealer", "scouting", "importare auto",
            "auto Germania", "BMW Belgio", "concessionario piccolo"]
```

**Setup founder action**: create Reddit app https://www.reddit.com/prefs/apps (script type, free, 60 req/min) → save creds in `~/Documents/combaretrovamiauto-enterprise/.env`

#### Telegram (Telethon Python)
```python
# tools/layer1_telegram_scout.py
from telethon import TelegramClient
# Setup: phone-based auth (founder phone OR dedicated num)
client = TelegramClient("argos_scout", api_id, api_hash)
# Groups target (da validare S171 P1 Agent 3)
GROUPS = [
    "@ImportAutoItalia",        # validate exist
    "@DealerAutoCommissione",   # validate exist
    "@AutoBerlinaPremium",      # validate exist
    "@ConcessionariItaliaUE",   # validate exist
]
```

**Setup founder action**: create Telegram app https://my.telegram.org/apps → save api_id/api_hash. Phone auth one-time interactive.

#### Subito.it dealer profile analysis
- Pattern: dealer profili 5-15 annunci + annunci con descrizione "importato Germania" o "su richiesta cliente" = signal commissione
- Tool: estendere `tools/scrapers/` esistente con `subito_dealer_profiles.py` (vincolo #5 zero capex, ARGOS già ha rate-limited scraper)
- Output: lista dealer + phone + email + region + signal_score

### Skills psicologiche Layer 1

**Reciprocity** (prima di chiedere, dai):
- Quando vedi question su Reddit "qualcuno ha importato auto da Germania? quali tasse?" → rispondi con info concrete utili (es. tabella IVA intra-UE link Agenzia Entrate). NON menziona Argos.
- Crea karma + identity "civilian helpful" sul sub
- I dealer che apprezzano la risposta possono diventare warm-lead per Layer 2

**Mirror language**:
- Vocabolario micro-dealer (da validare research P1 Agent 4): "lavoro su commissione", "porto auto da fuori", "tarata" (per auto certificata), "spesa" (per costo totale incluso trasporto+dazi), "imt" (Imposta Mortgage Transfer), "atto" (atto vendita)
- NON usare: "lead", "funnel", "B2B", "scaling", "ROI", "ROAS" — instant burned credibility

**Anti-pattern (cosa NON fare Layer 1)**:
- Postare promo Argos (instant ban + brand burned)
- DM cold a user (no consent + WA spam-like)
- Reply che self-promote anche se relevant (es. "io faccio scouting, ti aiuto" — patetico)

### Output Layer 1
- `state/layer1-dealer-discovered.jsonl`: append-only log dealer identificati con metadata (subreddit/group sorgente, signal type, phone se publica, pain point citato)
- Threshold: ≥20 dealer micro-commissione identificati = trigger Layer 2

---

## Layer 2 — Mystery shopper WA

### Obiettivo
1-to-1 conversation naturale, simulazione prospect cliente finale che chiede quote → ascolto offer + pain di dealer → pivot organico introduzione Argos.

### Tool stack

#### Numero "civilian" diverso da Luca Ferretti brand
**Opzioni** (founder decide — DUBBIO #1 PROMPT-S171-ARGOS):
- (a) 2° SIM founder Italia (più credibile)
- (b) Google Voice / TextNow / Tally burner free (zero capex, ma trust signals meno)
- (c) Stesso 3314928901 pretending civilian (rischio brand mixing)

**Raccomandazione CTO**: (a) se possibile, (b) altrimenti. (c) escluso.

#### WA Personal o Business
- WA Personal (no API) per Layer 2: msg manuali founder OR automated via Baileys non-brand
- Anti-spam: NO template fisso, message-by-message human-written OR LLM-generated variant per dealer

### Script template Layer 2 (NON usare fisso, varia per dealer)

#### Msg 1 — Quote request (mystery shopper)
```
Buongiorno, ho visto il suo profilo su [Subito/altro canale L1]. Cerco una BMW Serie 3 anno 2021 km <50k, possibilmente diesel. Riesce a propormi qualcosa nel suo piazzale o a trovarmela se non ce l'ha?
```

Variabili da swap:
- Marca/modello (BMW/Mercedes/Audi/VW)
- Anno (2020/2021/2022)
- Km (<30k, <50k, <70k)
- Fuel (diesel/benzina/ibrido)

**Stile**: italiano natural, NO formality eccessiva, no "Distinti saluti" formale. Tono "cliente privato curioso".

#### Msg 2 — Follow-up natural (post dealer response)
Dipende dalla risposta dealer:
- Se dealer ha auto in piazzale: "Ottimo, può girarmi qualche foto e i km esatti?"
- Se dealer non ha e fa scouting: "Capisco, quanto tempo ci vuole per trovarla? Lavora con Germania o anche altro?"
- Se dealer dice no/non disponibile: "Capisco grazie. Posso chiederle perché? È difficile reperire questi modelli?"

**Goal Msg 2**: ascoltare pain reale dealer (lessico, tempi, canali sourcing, friction)

#### Msg 3 — Pivot organico (depends Msg 2 signal)
Trigger: dealer ha mostrato pain o curiosità o lamento. NO pivot if dealer ha closed quickly o se non c'è signal.

```
A proposito, ho sentito parlare di un servizio si chiama Argos che fa scouting auto da Germania/Belgio/Olanda per dealer come voi — penso facciano tutto loro, scouting, calcolo tariffe, documenti. Vi è mai capitato di sentirlo o lavorarci?
```

**Goal Msg 3**: osservare reazione. Se dealer interessato → handoff Layer 3. Se dealer freddo → polite exit (NO insistenza), Argos burned per quel dealer.

#### Msg 4 (se signal positivo) — Handoff brand
Dopo 24-48h:
```
[Da numero Luca Ferretti / brand Argos]
Buongiorno, sono Luca Ferretti di Argos. Una persona mi ha detto che cercava info sul nostro servizio scouting auto premium EU per dealer. È lei? Le posso dare qualche info se le interessa.
```

**Note**: il handoff brand è il TRICK pivot. Dealer pensa di essere "trovato" non "contattato cold". Trust signal molto più alto.

### Skills psicologiche Layer 2

**Curiosità** (Cialdini Influence): pivot Msg 3 deve essere genuinamente curioso, non sales. "Ho sentito parlare di..." crea spazio di esplorazione senza commitment.

**Social proof** soft: "un servizio si chiama Argos che fa scouting per dealer come voi" = implicit "altri dealer lo usano".

**Reciprocity** continua: durante conversazione Layer 2, se dealer condivide pain → tu condividi info utile (es. link Agenzia Entrate IVA intra-UE) PRIMA del pivot Msg 3.

**Loss aversion** sottile: NO usare. "Senza Argos perdi €X" = americanata banned.

**Authority technical** (Msg 4 handoff): "sono Luca Ferretti di Argos" + breve credibility (es. "abbiamo scoutato 50+ auto da Germania quest'anno per dealer in [regione]") — solo se VERIFIED claims (vincolo #1).

### Anti-pattern (cosa NON fare Layer 2)
- CTA aggressivo Msg 1 ("vuole maggiori info?")
- Self-introduce Argos in Msg 1 (= V5 paradigma INVALIDATED)
- Template identico per N dealer (= spam pattern, WA ban risk)
- Pivot Msg 3 senza signal positivo Msg 2 (= push, brand burned)
- Insistenza dopo dealer freddo (= classic salesman, anti-italiano natural)

### Output Layer 2
- `state/layer2-conversations.jsonl`: append-only log conversazioni (dealer_alias, phone hash, msg history, signal score Msg 2/3, pivot outcome)
- Threshold: ≥3 dealer warm "handoff brand done" → trigger Layer 3 AMBRA scale

---

## Layer 3 — AMBRA agent autonomous

### Obiettivo
Scale follow-up dealer warm (post-pivot Layer 2 OR post-handoff brand). NON cold outbound. AMBRA gestisce N conversazioni parallele, escalation human (Luca Ferretti) su trigger.

### Stato attuale
**TBD AUDIT** (PROMPT-S171-ARGOS P0). Phase 6 ARGOS roadmap prevede AMBRA ma stato implementation unknown.

### Architettura proposta (se da fare from scratch)

```
┌─────────────────────────────────────────────────────────────┐
│ AMBRA AGENT — FSM stati conversazione                       │
├─────────────────────────────────────────────────────────────┤
│  warm_curious      (post Layer 2 handoff, dealer ask info)  │
│       │                                                       │
│       ▼                                                       │
│  asking_details    (AMBRA chiede preferenze: marca/anno/km)  │
│       │                                                       │
│       ▼                                                       │
│  showing_dossier   (dealer chiede auto specifica, AMBRA      │
│                     scout fittizio + dossier preview D-25)   │
│       │                                                       │
│       ▼                                                       │
│  pre_deal_ready    (dealer interessato concreto, AMBRA       │
│                     manda DocuSeal contract D-22/D-24)       │
│       │                                                       │
│       ▼                                                       │
│  escalation_human  (handoff Luca Ferretti per closing deal)  │
└─────────────────────────────────────────────────────────────┘
```

### Stack AMBRA
- WA: Baileys (riuso ARGOS daemon stack iMac OR separato — TBD)
- LLM: Groq cascade (free tier, primary), OpenRouter fallback (free tier)
- FSM: python-statemachine (already in stack D-22)
- DB: bridge.sqlite extended con `ambra_conversations` table
- Lessico injection: research P1 Agent 4 output integrato in system prompt

### Skills psicologiche Layer 3 (FSM-driven)

**warm_curious state**:
- Specchio lessico dealer (Mirror): se dealer dice "porto auto", AMBRA risponde "Capito, lavora a commissione informale?". Se dealer dice "scout", AMBRA risponde "Cerca personalmente in piazzale Germania o usa portali?".
- Reciprocity: AMBRA condivide info concrete (es. tariffario IVA intra-UE 2026, link Agenzia Entrate). Solo dopo, chiede preferenze auto.

**asking_details state**:
- Anchoring time-cost: "Posso scoutare l'auto in 3-5 giorni, calcolo tariffe import, produco documenti. Sarebbe utile?". Dealer associa tempo risparmiato.
- Authority technical: AMBRA cita CoVe scoring framework, fingerprint VIN check, history check. Verifiable claims only.

**showing_dossier state**:
- Loss aversion sottile (no aggressivo): "Auto bella, km verified Mileage history. Se non se la prende lei oggi, normalmente la vendiamo entro 5-7gg ad altro dealer". Solo se VERO (vincolo #1).
- Social proof: "Altri dealer come lei in [regione] hanno chiuso 2-3 deal con questo modello quest'anno". Solo se VERO.

**pre_deal_ready state**:
- AMBRA non chiude deal. Genera DocuSeal link contract + escalation a human (Luca Ferretti) per signature + closing call.

### Vincoli AMBRA
- **NO outbound vehicle push** (Open Q #15, founder S170-post-close): dealer chiede auto, AMBRA NON propone. AMBRA risponde con auto scoutate solo a richiesta esplicita dealer.
- **NO americanate**: italiano natural, NO CTA aggressivo, NO urgency manufactured.
- **NO closing deal autonomous**: handoff founder a pre_deal_ready obbligatorio.
- **Audit log every conversation**: `state/ambra-audit.jsonl` hash-only per privacy (no raw content), per debug + B6 pattern recognition.

### Output Layer 3
- N dealer in pipeline avanzati a `pre_deal_ready` state → Luca Ferretti closes
- Metric: % handoff Layer 2 → escalation_human ≥ 30% = AMBRA framework valido
- Metric: % escalation_human → deal closed ≥ 40% = pipeline operationally healthy

---

## Test E2E founder phone 3314928901 (Pezzo 4 founder S170)

### Goal
Validare flusso completo 15-step da mystery shopper Layer 2 fino a bonifico simbolico + post-payment trigger dossier + tracking veicolo fittizio.

### Setup
- Founder simula "Mario Rossi, dealer Lecce, P.IVA forfettaria, 8 auto stock"
- Layer 2 mystery shopper contatta Mario da numero NON Argos
- Pivot organico → handoff brand Luca Ferretti
- Layer 3 AMBRA gestisce conversazione fino pre_deal_ready
- Founder simula closing deal: chiede auto specifica (es. BMW X3 2022 km 40k)
- ARGOS produce quote formale + DocuSeal contract
- Mario simula firma contract + bonifico simbolico €0.01 o €1 su IBAN test
- Trigger post-payment: dossier finale + tracking auto fittizio
- Closure cycle: delivery confirm

### Stack pagamento BONIFICO ONLY (founder S170 explicit)
- NO Stripe/SumUp/PSP commerciali
- IBAN test Argos (TBD founder fornisce — DUBBIO #4 PROMPT-S171-ARGOS)
- Reconciliation: manuale post-test OR webhook PSD2 open banking (Plaid IT? Fabrick? — investigation S171 P6)
- Per N IBAN multipli: config `iban-routing.yaml` (Open Q #13)

### Tracking auto fittizio
- Sistema invia ogni 24-48h update simulato: "auto presa in carico spedizioniere", "auto in transito", "ETA delivery 7gg", "auto consegnata"
- Source: hardcoded fake data S171, no real Macingo integration
- Real Macingo integration = post first deal real (Phase 7+)

---

## Riassunto comparativo paradigmi

| Aspetto | V5 (D-26 SUPERSEDED) | D-27 Hybrid 3-Layer (NEW) |
|---|---|---|
| Paradigma | Self-introduce relational | Mystery shopper inverso |
| Layer 1 | Direct cold outbound | Passive listening discovery |
| Target | Dealer "premium" stock alto | Micro-dealer commissione stock<20 |
| Brand exposure | Immediate Msg 1 | Delayed (Layer 2 Msg 3-4 pivot) |
| Trust building | Mirror reality + question | Reciprocity + curiosità + social proof |
| Vehicle push | Possibile (V5 = Argos propone) | VIETATO (dealer chiede only) |
| Skills | Mirror language only | Mirror + Reciprocity + Social proof + Authority + Curiosity |
| Tools | WA daemon + scraper | PRAW + Telethon + Subito + WA mystery + AMBRA agent |
| Stato AMBRA | Phase 6 finale | CRITICAL PATH NOW |
| Scope wave | 5 dealer wave-based | N dealer Layer 1 discovery + N Layer 2 mystery + N Layer 3 escalation |
| Reply rate target | ≥20% Msg 1 | ≥30% Layer 2 pivot signal + ≥30% Layer 3 escalation |

---

## Risks + autocritica CTO obbligatoria (vincolo #4)

1. **Assunzione**: micro-dealer commissione esistono in numero sufficiente come segmento + sono raggiungibili via Reddit/Telegram/Subito. Mitigation: research P1 valida QUANTI sono + dove vivono PRIMA di costruire stack Layer 1.

2. **Cosa rompe a 30/60gg**:
   - 30gg: se Layer 1 discovery rivela <10 dealer micro identificabili → segmento troppo opaco, target re-evaluation D-28.
   - 60gg: se Layer 2 mystery shopper signal rate <30% → pivot script broken, redesign con learnings empirical.
   - 90gg: se AMBRA escalation→deal rate <10% → Layer 3 framework broken, simplify a Luca Ferretti manual closing all deal.

3. **Pattern errore noto**:
   - V5 invalidato per applied senza validation (S170 lesson). D-27 hybrid 3-layer non deve ripetere: research P1 OBBLIGATORIA prima implementation.
   - "AI persona infallibile" trap: AMBRA agent rischia di sembrare unrealistic perfetto = burned credibility. Mitigation: imperfezioni intenzionali (typos human-like, latenza response variabile 5-30s, qualche "non lo so"), audit ogni 10 conversazioni.

4. **Sovradimensiono?**:
   - Layer 1 3 tool (PRAW + Telethon + Subito) = forse troppo. Inizio MVP con SOLO Telethon Telegram (più ROI per target Italia commissione) + Subito.it scraper esistente. Reddit add later.
   - AMBRA FSM 5 stati = forse troppo. MVP con 3 stati (warm → details → escalation_human), expand later.

---

## Roadmap implementation depend chain

```
P0 audit AMBRA stato (1-2h, ARGOS terminal)
    ↓
P1 research microdealer (2-3h, 4-agent thread, validation)
    ↓
P2 dataset re-baseline filtro stock<20 (2-3h)
    ↓
P3 fix daemon dedup (4-6h, Open Q #12)
    ↓ ┌───────────────┬─────────────┐
      ↓               ↓              ↓
P4 design L1 setup  P4 design L2 script  P4 design L3 AMBRA (depends P0)
  (PRAW+Telethon)    (numero + template)   (FSM + LLM cascade)
      ↓               ↓              ↓
      └───────────────┴──────────────┘
                ↓
P5 test E2E founder phone 3314928901 (15-step cycle)
                ↓
P6 IBAN multipli config (post P5 verde)
                ↓
[wave 2 reale con dealer micro Layer 1 discovered]
                ↓
[primo deal chiuso = €1k cash a consegna documento]
```

---

## Output prossima sessione ARGOS terminal

Vedi `PROMPT-S171-ARGOS.md` per sequenza atomica priorità P0-P6 esecuzione.
