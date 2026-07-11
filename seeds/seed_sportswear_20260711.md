# SEED_ENVELOPE — input fabbrica VOS — teamwear tecnico per società sportive dilettantistiche

> Blockquote di note di frame: Il seed nasce dall'osservazione del founder (A) sulle inefficienze nella fornitura di teamwear nel Sud Italia. La decisione di procedere è condizionata da una stringente verifica dei kill-criteria (B) e dalla conferma della reale propensione all'anticipo da parte dei clienti. Firewall G1 = evidenza esterna primaria (anticipo non rimborsabile). Distribuzione verso il cliente = AI sales agent cold-outreach targettizzato su presidenti/team manager.
>
> **CORREZIONE GIUDICE (validazione web 2026-07-11) — canale di FORNITURA su DUE binari.** 'My Macron Kit' NON è un programma reseller: è l'app di personalizzazione kit di Macron per le squadre. L'accesso al prodotto da rivendere resta un'assunzione da verificare per contatto diretto, su due binari alternativi: (1) **dealer autorizzato** Macron/Erreà/Givova a condizioni non pubbliche — RISCHIO dichiarato: minimi d'ordine ⇒ magazzino ⇒ violerebbe il vincolo zero-stock; (2) **procacciatore/agente commissionale** per un dealer GIÀ esistente — zero stock, commissione sugli ordini portati (modello analogo al mandatario ARGOS). Entrambi i binari = `[DA-VERIFICARE per contatto diretto]`.

```yaml
seed_id: seed_sportswear_20260711
parent_seed: null
created_ts: 2026-07-11T16:12:46Z
mode: B-first
wip_limit: 1

# --- Vincoli economici ---
budget_max_eur: 0

# --- Soglia di efficacia ---
buyers_reached_target: 10        # Tentare di raggiungere 10 presidenti/team manager per le verifiche iniziali
min_paying_to_pass: 3            # Almeno 3 società che accettano di pagare un anticipo del 10% non rimborsabile

# --- Edge = capability della fabbrica (NON skill personale del founder) ---
factory_capabilities:
  - contract_negotiation_reseller_agreements
  - logistics_coordination_multi_brand
  - digital_marketing_cold_outreach_segmentation
  - CRM_integration_payment_tracking
time_per_week_hours: 20          # Ore settimanali dedicate dal founder alla convalida iniziale

# --- Distribuzione verso il cliente ---
distribution_method: ai_sales_agent_cold
distribution_no_paid_ads: true
warm_graph: null                 # Nessun warm graph significativo per questa fase, cold outreach puro.

# --- Canale di FORNITURA (accesso al prodotto da rivendere) — DUE BINARI (correzione giudice) ---
supply_channel:
  binario_1_dealer_autorizzato:
    stato: "[DA-VERIFICARE per contatto diretto]"
    descrizione: "Dealer autorizzato Macron/Erreà/Givova, condizioni reseller non pubbliche."
    rischio: "Minimi d'ordine ⇒ magazzino ⇒ violerebbe il vincolo zero-stock."
  binario_2_procacciatore:
    stato: "[DA-VERIFICARE per contatto diretto]"
    descrizione: "Procacciatore/agente commissionale per un dealer GIÀ esistente. Zero stock, commissione sugli ordini portati."
    modello: "Analogo al mandatario ARGOS."

# --- SEGNALI S1 falsificabili (2 settimane) — ordine di priorità ---
s1_signals:
  - priorita: 1                  # PRIORITARIO (correzione giudice)
    segnale: "Censimento di chi serve OGGI le società di Basilicata/Nord Puglia: dealer di zona, esclusive territoriali, prezzi praticati alle società."
    stato: "[DA-VERIFICARE con interviste a 3-5 presidenti + mappatura dealer locali]"
  - priorita: 2
    segnale: "Condizioni di fornitura reali sui due binari: margini/commissioni effettivi, minimi d'ordine, esclusive territoriali."
    stato: "[DA-VERIFICARE per contatto diretto con dealer Macron/Erreà/Givova]"
  - priorita: 3
    segnale: "Chi effettivamente paga l'ultima fattura del teamwear: società (bonifico) vs. genitori/atleti (ripartizione)."
    stato: "[DA-VERIFICARE chiamando almeno 5 società]"
  - priorita: 4
    segnale: "Finestra d'acquisto: le società ordinano solo in estate (pre-campionato) o anche a gennaio (ripescaggi)?"
    stato: "[DA-VERIFICARE]"
  - priorita: 5
    segnale: "Propensione all'anticipo: 3 società disposte a pagare un anticipo del 10% non rimborsabile per bloccare un ordine a condizioni X?"
    stato: "[DA-VERIFICARE]"

# --- KILL-CRITERIA (numeri proposti dal draft, ratifica a G1 da Luke) ---
kill_criteria:
  wtp_floor:
    rule: "0/5 società intervistate accettano di pagare un anticipo del 10% non rimborsabile per bloccare un ordine a condizioni X."
    note: "Se i clienti non sono disposti a un minimo impegno economico iniziale, la propensione al pagamento è troppo bassa per sostenere il modello."
  anti_freemium:
    rule: "Il costo di acquisizione cliente (CAC) supera il 50% del margine lordo per ordine medio (es. se chiudere una squadra richiede 10 ore/call con un margine di 300€, CAC = 10*costo_orario_founder > 150€)."
    note: "Un CAC elevato rispetto al margine erode la redditività e la scalabilità."
  territory_exclusive:
    rule: "Il territorio target (Basilicata/Nord Puglia) è presidiato da un dealer con esclusiva territoriale sui brand Macron/Erreà/Givova ⇒ canale di fornitura bloccato su entrambi i binari."
    note: "Correzione giudice: se un dealer detiene l'esclusiva di zona, né il binario dealer-autorizzato né il procacciamento sono percorribili senza passare da lui."
  margin_floor:
    rule: "Margine/commissione sotto soglia: margine reseller <15% sul listino ufficiale, o commissione da procacciatore che non copre l'unit-economics solo-founder €0."
    note: "Numero (<15%) proposto dal draft — ratifica a G1 da Luke. Senza condizioni di fornitura favorevoli, il modello non è sostenibile."

# --- Esclusioni ---
excluded_domains:
  - automotive / dealer
  - gestionali SMB / voice-agent
  - elderly-care / phone-cleanup
  - agenzie di marketing / social media manager
  - consulenti finanziari / broker

# --- Scoring residuo ---
lambda_scoring: null             # Non applicabile in questa fase di validazione binaria

# --- Done-condition esterna (vincolo #1b) ---
terminal_fact: "3 società sportive dilettantistiche in Basilicata/Nord Puglia (verificate tramite AI sales agent cold-outreach) hanno firmato un accordo di pre-ordine (non vincolante all'acquisto finale ma con pagamento del 10% non rimborsabile) per la fornitura di teamwear a condizioni X."
g2_fact: "0/5 società intervistate tramite cold-outreach (non contatti personali) riferiscono che il loro attuale fornitore è in ritardo nei pagamenti da oltre 3 mesi."
```

## Note
Il deliverable principale di questa fase è la convalida della propensione al pagamento anticipato e delle condizioni di fornitura. Il founder deve concentrarsi sulla raccolta di **segnali S1 forti**, in particolare l'accettazione di un anticipo non rimborsabile da parte di almeno 3 società. Questa è la metrica più critica per superare il kill-criteria G1.

La scoperta deve prioritariamente chiarire, **nell'ordine**:
1. **[S1 PRIORITARIO]** Chi serve OGGI le società di Basilicata/Nord Puglia — dealer di zona, esclusive territoriali, prezzi praticati alle società. Questo censimento decide in anticipo se il canale di fornitura è percorribile (kill-criterion `territory_exclusive`).
2. Le condizioni precise di fornitura sui due binari (dealer autorizzato vs. procacciatore per dealer esistente), con particolare attenzione a minimi d'ordine, margini e commissioni. Nota: 'My Macron Kit' è l'app di personalizzazione kit, NON un programma reseller — entrambi i binari restano `[DA-VERIFICARE per contatto diretto]`.
3. Chi effettivamente paga l'ultima fattura del teamwear (società vs. genitori/atleti) chiamando almeno 5 società.
4. Se l'inefficienza dei fornitori attuali si traduce in **ritardi di pagamento percepibili** dai clienti (segnale G2 di valore percepito).

Il kill-criteria G1 è stringente: se 0 su 5 società contattate non sono disposte a pagare un anticipo non rimborsabile (anche piccolo), il modello è a rischio grave. La "domanda singola più pericolosa" evidenziata dal verifier (B) è stata incorporata direttamente nel kill-criterion del WTP: se le società già pagano in ritardo i fornitori attuali, perché dovrebbero pagare in tempo un nuovo entrante senza credibilità di marca? L'unica risposta valida è evidenza concreta (anticipo accettato), non retorica.
