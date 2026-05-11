# S128 — human-first-outreach: Phase 2 Minima + E2E Test

## Contesto essenziale

S127 era una sessione architetturale. L'architettura è saturata e approvata.
**S128 implementa e testa. Zero nuova architettura.**

Source of truth completa: `memory/MEMORY.md` (già caricata).
Handoff sessione: `HANDOFF.md`.

## Task unico di S128

Implementare i **7 componenti Phase 2 minima** e passare **6 checkpoint E2E**
su TEST_FOUNDER prima di dichiarare qualsiasi cosa pronta.

---

## Step 0 — Verifica infrastruttura (prima di tutto)

```bash
ssh gianlucadistasi@192.168.1.2 "curl -s localhost:9191/status"
```

Se iMac offline: fermarsi, comunicare al founder, non procedere con implementazione
che dipende da DB remoto.

---

## Step 1 — SQL schema (su dealer_network.sqlite via iMac)

```sql
-- conversations: aggiungi opt_out
ALTER TABLE conversations ADD COLUMN opt_out INTEGER DEFAULT 0;
ALTER TABLE conversations ADD COLUMN opt_out_at TIMESTAMP;
ALTER TABLE conversations ADD COLUMN opt_out_source TEXT;
ALTER TABLE conversations ADD COLUMN opt_out_raw_message TEXT;

-- validation_log (nuovo)
CREATE TABLE IF NOT EXISTS validation_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dealer_id TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    decision TEXT NOT NULL,  -- pass | block | warn
    motivation TEXT,
    message_hash TEXT,
    mode TEXT DEFAULT 'shadow',  -- shadow | canary | enforce
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- lia_log (nuovo)
CREATE TABLE IF NOT EXISTS lia_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dealer_id TEXT NOT NULL,
    legal_basis TEXT DEFAULT 'Art. 6(1)(f) GDPR - legitimate interest',
    purpose TEXT,
    data_source TEXT,
    data_source_date DATE,
    opt_out_mechanism_present INTEGER DEFAULT 1,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Step 2 — signal_event (oggetto unificato)

Creare `.claude/skills/human-first-outreach/scripts/signal_event.py`:

```python
# Oggetto unificato che fluisce in: message anchor + LIA data_source + opt-out {data_source}
@dataclass
class SignalEvent:
    url: str
    days_on_market: int        # ESATTO — mai parafrasi
    vehicle: str               # es. "BMW X3 30d 2022"
    listing_price: int
    scrape_date: date
    signal_strength: str       # S+ | S | A | B | C
    signal_observed_at: datetime
    dealer_id: str
    data_source: str           # nome leggibile per opt-out: "AutoScout24.it"
```

---

## Step 3 — GATE-ICP-001 (env vars, non hardcoded)

```python
# ARGOS_ICP_MIN_RATIO default 0.20, ARGOS_ICP_CORE_RATIO default 0.30
# premium_concentration = (BMW + Mercedes + Audi) / total_stock
# < MIN_RATIO → block GATE-ICP-001
# MIN-CORE → low_priority flag
# >= CORE_RATIO → ICP-CORE, procede
```

---

## Step 4 — SIGNAL-FRESH-001

```python
# ARGOS_SIGNAL_TTL_DAYS default 14
# Se now() - signal_event.signal_observed_at > TTL → block SIGNAL-FRESH-001
# Richiede re-scrape prima di procedere
```

---

## Step 5 — Rule L4 (regex, validator.py esistente da estendere)

Aggiungere a `wa-intelligence/validator.py`:

| rule_id | Pattern | Severity |
|---|---|---|
| CRED-SEQUENCE-001 | prezzo/cifra senza recognition anchor | HARD |
| NO-OFFER-DAY1-001 | offerta in Day 1 anche dopo contesto | HARD |
| TEMPLATE-EXACT-RENDERING-001 | "diversi mesi" / "da un po'" quando days_on_market disponibile | HARD |
| LEX-SELFAUTH-001 | "sono esperto di", "mi occupo di" | HARD |
| LEX-SCARCITY-001 | "solo X slot", "offerta valida" | HARD |
| BRAND-SELFPROMO-001 | "il migliore/unico" | HARD |

GATE conflict resolution: GATE blocca prima di tutto. Poi COMP > BRAND > FORMAT > TIMING > RATE > ARCH.

---

## Step 6 — Hypothesis routing table

File: `.claude/skills/human-first-outreach/assets/hypothesis_routing.json`

```json
{
  "RAGIONIERE":   "Ipotizzo che il costo di tenerla in listino inizi a pesare più del margine atteso",
  "BARONE":       "Ipotizzo che a questo prezzo il cliente tipo della sua zona la cerchi già altrove",
  "PERFORMANTE":  "Ipotizzo che abbia un target di rotazione mensile e questa auto stia rallentando il numero",
  "NARCISO":      "Ipotizzo che stia cercando qualcosa di specifico che il mercato italiano non offre a questi km",
  "TECNICO":      "Ipotizzo che sia in attesa di verifica documentale o perizia prima di ribassare",
  "RELAZIONALE":  "Ipotizzo che stia aspettando il cliente giusto piuttosto che svenderla",
  "CONSERVATORE": "Ipotizzo che preferisca perdere qualcosa sul prezzo piuttosto che rischiare cambi di canale",
  "DELEGATORE":   "Ipotizzo che il ribasso dipenda da qualcuno che non ha ancora dato ok",
  "NEUTRO":       "Ipotizzo che aspetti il momento per ribassare senza compromettere margine"
}
```

Regola: UNA sola ipotesi per messaggio. Template usa `{hypothesis}` dal JSON.
Template usa `{days_on_market}` esatto dal signal_event.

---

## Step 7 — Batch generation + digest Telegram

```
07:00 → script processa dealer in coda giornaliera, genera messaggi candidati
07:30 → digest Telegram a Luke: raggruppato per archetipo / regione / ICP tier
08:00 → Luke approva/rigetta in bulk
09:30+ → messaggi approvati entrano in coda wa-daemon con schedule_for nella finestra oraria
```

---

## E2E Test — 6 checkpoint (TUTTI devono passare)

Usare TEST_FOUNDER (393314928901). Un dealer reale da `dealer_network.sqlite` come soggetto test.

1. signal_event generato con `days_on_market` reale da AutoScout24
2. GATE-ICP-001 eseguito su stock reale del dealer (query DB, non mock)
3. Messaggio generato: `{days_on_market}` esatto, hypothesis corretta per archetipo, zero offerte
4. PDF report: dati CoVe reali + immagini sanitizzate (`src/cove/image_sanitizer.py`)
5. Digest Telegram: messaggio leggibile con dealer name, archetipo, rule_id log
6. `validation_log` scritto in `dealer_network.sqlite` con tutti i rule_id eseguiti

**Se anche uno solo fallisce: STOP. Non procedere con shadow mode.**

---

## Cosa NON fare in S128

- L5 LLM-as-judge
- mv_market_insights / insight_delta
- Geographic routing override
- SEQ-NOEXIT-BEFORE-DAY21
- TONE rules (TALKRATIO, TRUSTDRIVER)
- CONTENT-NUMBERS-SOURCED-001
- Qualsiasi altra architettura

Tutto quanto sopra è Phase 3, dopo 30 messaggi shadow reali con dati di calibrazione.

---

## File da leggere all'avvio (solo questi)

```
HANDOFF.md                          ← stato S127
memory/MEMORY.md                    ← architettura completa (già in contesto)
wa-intelligence/validator.py        ← estendere con rule L4
wa-intelligence/wa-daemon.js        ← verifica payload /send (line 50+)
src/cove/image_sanitizer.py         ← verifica interfaccia sanitizer
tools/scripts/pdf_generator_enterprise.py  ← verifica come genera PDF
```

**Non caricare:** research files (s73, s87, s94, s126) — on demand se necessari.
**Non caricare:** handoff originale skill (già sintetizzato in memory).

---

## Definition of Done S128

Luke vede con i propri occhi, su Telegram:
- Un PDF di test con dati CoVe reali e immagini sanitizzate
- Un digest con messaggio Day 1 hypothesis-framed per un dealer reale
- Il validation_log del test con tutti i rule_id loggati

Solo allora: "Phase 2 minima completata. Pronti per shadow mode."
