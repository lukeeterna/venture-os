# DRAFT SEED — teamwear tecnico per società sportive dilettantistiche

> Generato dalla pipeline VOS `plan_seed_sportswear` (plan_execute, 2026-07-11).
> thinker (A) → verifier (B) → worker (C). Chiamate LLM SOLO via router/routing.yaml, free-tier.
> STATO: **draft in attesa di validazione giudice + Luke**. NON è il seed finale (non scritto in `seeds/`).

## Provenance per subtask

| subtask | role | modello (da costs.jsonl) | provider | ts | in_tok | out_tok |
|---------|------|--------------------------|----------|-----|--------|---------|
| A (thinker) | reasoning | deepseek/deepseek-chat | openrouter | 2026-07-11T15:56:15Z | 323 | 882 |
| B (verifier) | code_review | deepseek/deepseek-chat | openrouter | 2026-07-11T15:56:40Z | 1003 | 876 |
| C (worker) | cheap | gemini-2.5-flash | google | 2026-07-11T15:56:48Z | 2328 | 1317 |
| aggregator | long_context | gemini-2.5-flash | google | 2026-07-11T15:56:53Z | 510 | 825 |

**Data-flow provato**: in_tok(B)=1003 >> in_tok base(A)=323 → B ha ricevuto il draft di A iniettato nel prompt. in_tok(C)=2328 → C ha ricevuto A+B iniettati. L'output di C referenzia esplicitamente le correzioni di B (anticipo 10% non rimborsabile, domanda pericolosa incorporata nel kill-criterion WTP).

---

## A — DRAFT (thinker, deepseek/deepseek-chat)

### **DRAFT SEED VENTURE – TEAMWEAR RESALE PER LO SPORT DILETTANTISTICO**

#### **Tesi**
1. Le società sportive dilettantistiche (calcio, pallavolo, basket) in Basilicata e Nord Puglia preferiscono **teamwear tecnico italiano** (Macron, Errea, Givova) ma sono servite da intermediari inefficienti o con poca personalizzazione.
2. Il modello **reseller su commessa** (zero magazzino, margine sul listino ufficiale) è scalabile perché allinea costi e ricavi senza capitale circolante.
3. Le relazioni dirette del founder nel calcio locale possono **bypassare la diffidenza** verso nuovi fornitori e testare rapidamente la domanda.

---

#### **Cliente Pagante Preciso**
- **Chi firma**: Presidente/Team Manager della società sportiva dilettantistica (es. ASD Calcio Montescaglioso, Polisportiva Matera Volley).
- **Chi paga**: Cassiere della società (bonifico) o genitori/atleti (Stripe, se finanziamento diviso). [DA-VERIFICARE: % società che pagano interamente vs. ripartizione].

---

#### **Revenue Model (Numeri Ipotizzati [DA-VERIFICARE])**
- **Margine reseller**: 20-30% su listino Macron/Errea (es. kit completo a €100 → ricavo €20-30/commessa).
- **Ordine medio**: €1.500-3.000/squadra (15-30 giocatori, 2 divise + felpe).
- **Volume stagionale**: 5-10 squadre/anno (€7.500-30.000 revenue, margine €1.500-9.000).

---

#### **5 Segnali S1 Falsificabili (2 Settimane)**
1. **Condizioni reseller**: Margini effettivi, minimi d'ordine, esclusive territoriali [DA-VERIFICARE con Macron/Errea/Givova].
2. **Concorrenza locale**: Chi rifornisce oggi le società target? Prezzi praticati (es. negozi fisici vs. e-commerce nazionali) [DA-VERIFICARE interviste a 3-5 presidenti].
3. **Finestra d'acquisto**: Le società ordinano **solo in estate** (pre-campionato) o anche a gennaio (ripescaggi)? [DA-VERIFICARE].
4. **Fattibilità logistica**: Tempi di consegna dei brand dopo ordine reseller [DA-VERIFICARE con altri reseller esistenti].
5. **Propensione a prenotare**: 3 società disposte a firmare una **lettera d'intenti** (non vincolante) per ordini a condizioni X? [DA-VERIFICARE].

---

#### **3 Kill-Criteria Numerici per G1**
1. **Margine reseller <15%** (soglia minima per sostenere costi operativi).
2. **0/5 società intervistate** disposte a pagare **un anticipo del 30%** (segnala diffidenza verso nuovi fornitori).
3. **Concorrenza locale offre prezzi >20% inferiori** a listino reseller (no spazio per margine).

---

#### **Assunzioni Marcate [DA-VERIFICARE]**
- Le società preferiscono brand noti (Macron > cinesi low-cost).
- I reseller esistenti non offrono **assistenza personalizzata** (design, loghi, pagamenti rateali).
- Il founder può ottenere **10 call esplorative** con società target in 2 settimane.
- Nessun **minimum commitment** contrattuale da parte dei brand per avviare il reselling.

---

## B — KILL-TEST (verifier, deepseek/deepseek-chat)

### **Kill-Test del Draft: Difetti Gravi e Correzioni Minime**

#### **1. Tesi**
- **Difetto più grave**: **"Relazioni dirette del founder bypassano la diffidenza"** è un'assunzione non falsificabile. La diffidenza verso nuovi fornitori nel settore sportivo dilettantistico è alta, e le relazioni personali non garantiscono conversione.
- **Correzione minima**: Aggiungere un **segnale falsificabile**: "3 società contattate tramite conoscenze del founder rifiutano esplicitamente di cambiare fornitore nonostante rapporto preesistente".

---

#### **2. Cliente Pagante Preciso**
- **Difetto più grave**: **"DA-VERIFICARE: % società che pagano interamente vs. ripartizione"** è un buco nero. Se il 90% delle società fa pagare i genitori, il modello di incasso (bonifico vs. Stripe) cambia radicalmente.
- **Correzione minima**: Richiedere al founder di **chiamare 5 società** e chiedere esplicitamente "Chi paga l'ultima fattura del teamwear?" prima di investire tempo.

---

#### **3. Revenue Model**
- **Difetto più grave**: **"Volume stagionale: 5-10 squadre/anno"** è un numero campato in aria senza legame a dati reali (es. quante società ci sono nel raggio d'azione? Quante cambiano fornitore/anno?).
- **Correzione minima**: Sostituire con: "Basare il volume su **dati ISTAT** (es. 200 società in Basilicata) * % che cambia fornitore/anno (es. 10% → 20 potenziali clienti)".

---

#### **4. Segnali S1 Falsificabili**
- **Difetto più grave**: **"Lettere d'intenti non vincolanti"** sono inutili. Le società dilettantistiche firmano qualsiasi cosa senza impegno.
- **Correzione minima**: Sostituire con: "3 società accettano di **pagare un anticipo del 10%** (non rimborsabile) per bloccare un ordine a condizioni X".

---

#### **5. Kill-Criteria Numerici**
- **Difetto più grave**: **"Margine reseller <15%"** è aggirabile: molti reseller sopravvivono con margini bassi grazie a volumi alti o servizi aggiuntivi (es. logistica).
- **Correzione minima**: Aggiungere: **"Costo acquisizione cliente >50% del margine"** (es. se servono 10 ore/call per chiudere una squadra da €1.500, il modello non scala).

---

#### **6. Assunzioni [DA-VERIFICARE]**
- **Difetto più grave**: **"Nessun minimum commitment da parte dei brand"** è letale: se Macron/Errea richiedono ordini minimi (es. €50k/anno), il modello collassa.
- **Correzione minima**: Verificare **subito** via email ai brand: "Quali sono i requisiti per diventare reseller? Esistono minimi di ordine annuali?".

---

### **Domanda Singola Più Pericolosa per il Founder**
**"Se le società già pagano in ritardo (o non pagano) i fornitori attuali, perché dovrebbero pagare in tempo te, sconosciuto senza credibilità di marca?"**

Se la risposta non è **"Ho già verificato che 3 presidenti accettano pagamento anticipato al 30% perché il loro attuale fornitore ha ritardi di 6 mesi"**, il modello è morto.

---

## C — SEED FINALE (worker, gemini-2.5-flash) — output completo, non troncato

# SEED_ENVELOPE -- input fabbrica VOS -- teamwear tecnico per società sportive dilettantistiche

> Blockquote di note di frame: Il seed nasce dall'osservazione del founder (A) sulle inefficienze nella fornitura di teamwear nel Sud Italia. La decisione di procedere è condizionata da una stringente verifica dei kill-criteria (B) e dalla conferma della reale propensione all'anticipo da parte dei clienti. Firewall G1 = evidenza esterna primaria (anticipo non rimborsabile). Distribuzione = AI sales agent cold-outreach targettizzato su presidenti/team manager.

```yaml
seed_id: seed_sportswear_20240726
parent_seed: null
created_ts: 2024-07-26T10:00:00Z
mode: B-first
wip_limit: 1

# --- Vincoli economici ---
budget_max_eur: 0

# --- Soglia di efficacia ---
buyers_reached_target: 10 # Tentare di raggiungere 10 presidenti/team manager per le verifiche iniziali
min_paying_to_pass: 3 # Almeno 3 società che accettano di pagare un anticipo del 10% non rimborsabile

# --- Edge = capability della fabbrica (NON skill personale del founder) ---
factory_capabilities:
  - contract_negotiation_reseller_agreements
  - logistics_coordination_multi_brand
  - digital_marketing_cold_outreach_segmentation
  - CRM_integration_payment_tracking
time_per_week_hours: 20 # Ore settimanali dedicate dal founder alla convalida iniziale

# --- Distribuzione ---
distribution_method: ai_sales_agent_cold
distribution_no_paid_ads: true
warm_graph: null # Nessun warm graph significativo per questa fase, si punta al cold outreach puro.

# --- KILL-CRITERIA ---
kill_criteria:
  wtp_floor:
    rule: "0/5 società intervistate accettano di pagare un anticipo del 10% non rimborsabile per bloccare un ordine a condizioni X."
    note: "Se i clienti non sono disposti a un minimo impegno economico iniziale, la propensione al pagamento è troppo bassa per sostenere il modello."
  anti_freemium:
    rule: "Il costo di acquisizione cliente (CAC) supera il 50% del margine lordo per ordine medio (es. se chiudere una squadra richiede 10 ore/call con un margine di 300€, CAC = 10*costo_orario_founder > 150€)."
    note: "Un CAC elevato rispetto al margine erode la redditività e la scalabilità, indicando che il valore percepito è insufficiente per il costo di vendita."
  edge_fit:
    rule: "Macron, Errea o Givova richiedono un minimum commitment contrattuale (es. ordini annuali >€10.000) o condizioni reseller peggiori di un margine lordo <15% sul listino ufficiale."
    note: "Senza condizioni di fornitura favorevoli, il modello reseller non è sostenibile o scalabile."

# --- Esclusioni ---
excluded_domains:
  - automotive / dealer
  - gestionali SMB / voice-agent
  - elderly-care / phone-cleanup
  - agenzie di marketing / social media manager
  - consulenti finanziari / broker

# --- Scoring residuo ---
lambda_scoring: null # Non applicabile in questa fase di validazione binaria

# --- Done-condition esterna (vincolo #1b) ---
terminal_fact: "3 società sportive dilettantistiche in Basilicata/Nord Puglia (verificate tramite AI sales agent cold-outreach) hanno firmato un accordo di pre-ordine (non vincolante all'acquisto finale ma con pagamento del 10% non rimborsabile) per la fornitura di teamwear a condizioni X."
g2_fact: "0/5 società intervistate tramite cold-outreach (non contatti personali) riferiscono che il loro attuale fornitore è in ritardo nei pagamenti da oltre 3 mesi."
```

## Note
Il deliverable principale di questa fase è la convalida della propensione al pagamento anticipato e delle condizioni di fornitura. Il founder deve concentrarsi sulla raccolta di **segnali S1 forti**, in particolare l'accettazione di un anticipo non rimborsabile da parte di almeno 3 società. Questa è la metrica più critica per superare il kill-criteria G1.
La scoperta deve prioritariamente chiarire:
1. Chi effettivamente paga l'ultima fattura del teamwear (società vs. genitori/atleti) chiamando almeno 5 società.
2. Le condizioni precise per diventare reseller dei brand italiani target (Macron, Errea, Givova), con particolare attenzione a minimi d'ordine e margini.
3. Se l'inefficienza dei fornitori attuali si traduce in **ritardi di pagamento percepibili** dai clienti, incentivandoli a cambiare. Questo è un segnale G2 di valore percepito.

Il kill-criteria G1 è stringente: se 0 su 5 società contattate non sono disposte a pagare un anticipo non rimborsabile (anche piccolo), il modello di business basato sul superamento dell'inefficienza degli intermediari è a rischio grave, poiché non c'è una chiara evidenza di maggiore affidabilità o valore percepito che giustifichi un impegno finanziario anticipato. La "domanda singola più pericolosa" evidenziata dal verifier (B) è stata incorporata direttamente nel kill-criteria del WTP (willingness to pay), enfatizzando la necessità di un'azione concreta (pagamento anticipato) come prova di validità.
