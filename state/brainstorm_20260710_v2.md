# Brainstorm venture — 2026-07-10 (v2, POST fix data-flow)

Seconda corsa REALE di `plan_execute`, piano IDENTICO alla v1 (`plan_brainstorm_20260710`),
cambiato SOLO `plan_id` → `plan_brainstorm_20260710_v2`. Scopo: confronto prima/dopo il fix
del data-flow tra subtask. Chiamate LLM via `router.py` → `routing.yaml` (free-tier, `.env.free-gpu`).
3 subtask in 3 wave (A → B → C) | aggregator: long_context.

> **FIX VERIFICATO (su disco).** `plan_execute._build_subtask_prompt` (righe 368-403) ora
> inietta l'output delle dipendenze nel prompt a valle sotto la sezione delimitata
> `=== OUTPUT DIPENDENZE ===`, e `execute_plan` (righe 786-798) costruisce `dep_outputs` da
> `all_results` e li passa a `_execute_subtask`. Nella v1 veniva passata solo `subtask["description"]`.
> **Prova osservabile**: B in_tok 164 (v1) → **1455 (v2)**; C in_tok 98 (v1) → **2271 (v2)**.
> B nella v2 kill-testa i 10 candidati REALI di A, numero per numero (mappatura 10/10 sotto),
> mentre nella v1 killava gli ASSET di input (rete dealer, gestionale, motore scouting).

---

## Subtask A — role: reasoning (thinker)
**Provenance:** role=`reasoning` | modello RISOLTO (log)=`deepseek/deepseek-chat` (openrouter) | ts=`2026-07-10T20:50:10Z` | in_tok=225 / out_tok=1272 | cost_usd loggato=0.0 (artefatto path `--model`, reale ~$0.0012)

Ecco 10 candidati micro-venture che sfruttano i tuoi asset con i vincoli indicati:

1. **Prenotazione veicoli premium per eventi PMI/sportivi**
   - *Tesi*: Le PMI e società sportive in Puglia/Basilicata noleggiano auto premium per eventi ma trovano poca disponibilità locale. Il motore di scouting EU + rete dealer risolve il problema.
   - *Cliente pagante*: Società di catering per matrimoni [DA-VERIFICARE].
   - *Prezzo*: 10% sul noleggio (es. €150/evento).
   *60 giorni*: Basta integrare n8n per match domanda/offerta dealer.

2. **Alert personalizzati per veicoli rare per rivenditori**
   - *Tesi*: I dealer indipendenti cercano modelli specifici per clienti premium ma perdono tempo su annunci EU. Il motore esistente può filtrare e notificarli.
   - *Cliente pagante*: Concessionaria Fiat professional [DA-VERIFICARE].
   - *Prezzo*: €29/mese per alert mirati.
   *60 giorni*: Configurazione flusso n8n + landing page Stripe.

3. **Gestione digitale sconti per tifosi (squadre dilettantistiche)**
   - *Tesi*: Le società sportive vogliono trattenere tifosi con sconti presso PMI locali, ma manca uno strumento agile. L'app gestionale esistente può gestire coupon.
   - *Cliente pagante*: Bar affiliato a squadra di calcio [DA-VERIFICARE].
   - *Prezzo*: €49/mese per 10 PMI.
   *60 giorni*: Adatta modulo sconti esistente + onboarding Stripe.

4. **Database veicoli "pronto consegna" per dealer**
   - *Tesi*: I dealer perdono clienti per tempi di attesa lunghi. Creare un database condiviso di auto immediatamente disponibili in rete.
   - *Cliente pagante*: Dealer moto usate [DA-VERIFICARE].
   - *Prezzo*: €199/mese per accesso.
   *60 giorni*: Motore esistente già raccoglie dati, bastano filtri aggiuntivi in n8n.

5. **Affitti brevi auto premium per influencer locali**
   - *Tesi*: Micro-influencer Puglia cercano auto fotogeniche per contenuti ma non possono comprarle. Match con dealer via API esistenti.
   - *Cliente pagante*: Blogger turistico [DA-VERIFICARE].
   - *Prezzo*: €75/giorno + fee 15%.
   *60 giorni*: Pagamenti diretti Stripe, no modifiche app.

6. **Corso "Digitalizzare il tuo dealer auto in 7 giorni"**
   - *Tesi*: I dealer indipendenti non sanno usare tool base per lead generation. Pacchetto con template n8n + video guida.
   - *Cliente pagante*: Officina familiare [DA-VERIFICARE].
   - *Prezzo*: €397 una-tantum.
   *60 giorni*: Documentazione esiste già, basta imballarla.

7. **Abbonamento "Opportunità PMI" (auto + forniture)**
   - *Tesi*: Le PMI cercano mezzi/attrezzature con budget limitato. Notifiche bimestrali su affari (veicoli da dealer + stock PMI locali).
   - *Cliente pagante*: Idraulico con furgone [DA-VERIFICARE].
   - *Prezzo*: €15/mese.
   *60 giorni*: flusso n8n con dati esistenti + email automatiche.

8. **Assistenza remota per gestionale PMI (white-label)**
   - *Tesi*: Le PMI comprano gestionale ma non lo usano. Offri assistenza remota "light" con app già costruita.
   - *Cliente pagante*: Negozio di articoli sportivi [DA-VERIFICARE].
   - *Prezzo*: €80/ora.
   *60 giorni*: Basta pubblicizzare servizio a contatti esistenti.

9. **Servizio "Trova finanziamento auto" per dealer**
   - *Tesi*: I dealer non hanno time per cercare finanziamenti vantaggiosi clienti. Usa KB per generare report comparativi.
   - *Cliente pagante*: Cliente privato acquisto SUV [DA-VERIFICARE].
   - *Prezzo*: €50/report.
   *60 giorni*: Template n8n con dati pubblici banche.

10. **Partner tecnologico per eventi sportivi**
    - *Tesi*: Le società dilettantistiche gestiscono sponsor e biglietteria in modo analogico. L'app gestionale può automatizzare rapporti con sponsor.
    - *Cliente pagante*: ASD locale [DA-VERIFICARE].
    - *Prezzo*: 5% su transazioni sponsor.
    *60 giorni*: Modulo pagamenti esistente + accordi verbali.

**Nota**: Tutte le tesi presuppongono domanda latente [DA-VERIFICARE]. Prioritizza quelle con contatti diretti per test rapido.

---

## Subtask B — role: code_review (verifier)
**Provenance:** role=`code_review` | modello RISOLTO (log)=`deepseek/deepseek-chat` (openrouter) | ts=`2026-07-10T20:50:38Z` | in_tok=**1455** / out_tok=1006 | cost_usd loggato=0.0 (artefatto path `--model`, reale ~$0.0014)
> **PROVA DEL FIX**: in_tok balzato da 164 (v1) a 1455 (v2): il prompt di B ora INGLOBA l'output integrale di A via sezione `=== OUTPUT DIPENDENZE ===`. B kill-testa i 10 candidati REALI di A (mappatura 10/10, sezione "PROVA DEL FIX" più sotto), NON più gli asset di input come nella v1.

Ecco la tua kill-list, ordinata dal più robusto al più fragile, con il motivo di morte più probabile e il dato osservabile per falsificarlo in una settimana. Niente peli sulla lingua:

---

### **1. Alert personalizzati per veicoli rari per rivenditori**
**Kill-reason**: I dealer non sono disposti a pagare per un servizio che replicano con una ricerca manuale su Subito/Autoscout.
**Dato osservabile**: 0 dealer paga dopo demo gratuita di 7 giorni (soglia: almeno 2/10 conversioni).

### **2. Prenotazione veicoli premium per eventi PMI/sportivi**
**Kill-reason**: Le PMI preferiscono noleggiare auto "normali" da agenzie locali invece di pagare un premium per logistica complessa.
**Dato osservabile**: Nessuna prenotazione confermata dopo 10 chiamate a società di catering (soglia: 1 prenotazione).

### **3. Database veicoli "pronto consegna" per dealer**
**Kill-reason**: I dealer non condividono i dati per paura di favorire concorrenti.
**Dato osservabile**: 0 dealer accetta di inserire il proprio stock nel database (soglia: 3 dealer).

### **4. Affitti brevi auto premium per influencer locali**
**Kill-reason**: Gli influencer preferiscono chiedere auto in comodato d'uso alle concessionarie in cambio di visibilità.
**Dato osservabile**: 0 influencer paga dopo proposta diretta (soglia: 1 booking).

### **5. Corso "Digitalizzare il tuo dealer auto in 7 giorni"**
**Kill-reason**: I dealer non credono di poter imparare da un corso fai-da-te e cercano soluzioni "chiavi in mano".
**Dato osservabile**: 0 acquisti dopo landing page con testimonial fake (soglia: 2 vendite).

### **6. Assistenza remota per gestionale PMI (white-label)**
**Kill-reason**: Le PMI abbandonano il gestionale prima di pagare per assistenza.
**Dato osservabile**: 0 richieste dopo email a 20 clienti esistenti (soglia: 3 richieste).

### **7. Gestione digitale sconti per tifosi (squadre dilettantistiche)**
**Kill-reason**: Le società sportive non vogliono gestire un sistema digitale per sconti irrisori.
**Dato osservabile**: 0 squadre attiva il servizio dopo presentazione (soglia: 1 adesione).

### **8. Servizio "Trova finanziamento auto" per dealer**
**Kill-reason**: I clienti privati vanno direttamente in banca, i dealer non vogliono fare da intermediari.
**Dato osservabile**: 0 report venduti a clienti dealer (soglia: 1 transazione).

### **9. Abbonamento "Opportunità PMI" (auto + forniture)**
**Kill-reason**: Le PMI non hanno tempo/voglia di leggere newsletter con "offerte".
**Dato osservabile**: 0 iscritti paganti dopo trial gratuito (soglia: 5 abbonati).

### **10. Partner tecnologico per eventi sportivi**
**Kill-reason**: Le ASD preferiscono accordi informali con sponsor e biglietti cartacei.
**Dato osservabile**: 0 società firma accordo dopo proposta (soglia: 1 contratto).

---
**Perché questo ordine?**
- I primi 3 sfruttano asset esistenti (motore scouting, rete dealer) e hanno clienti con problemi tangibili (tempo perso, stock fermo).
- Gli ultimi 5 sono "nice-to-have" per clienti con budget ridotti e abitudini analogiche.
- Il #10 è morto in partenza: le ASD sono nemiche giurate della tecnologia (fonte: ho lavorato con 20+ società dilettantistiche).

**Come testare**: Per ogni candidato, contatta **direttamente** i clienti indicati in [DA-VERIFICARE] e misura il tasso di conversione. Se non raggiungi la soglia minima in 7 giorni, killalo senza pietà.

---

## Subtask C — role: cheap (worker)
**Provenance:** role=`cheap` | modello RISOLTO (log)=`gemini-2.5-flash` (google) | ts=`2026-07-10T20:50:47Z` | in_tok=**2271** / out_tok=615 | cost_usd=0.0 (free-tier reale)
> in_tok da 98 (v1) a 2271 (v2): C ora ingloba l'output di A (per tesi/cliente/prezzo) E di B (per ordine + kill-criteria). Le schede riflettono l'ordinamento di robustezza deciso da B (Alert #1, Prenotazione #2, Database #3, Affitti #4…).
> ATTENZIONE: output TRONCATO dal modello a metà scheda #5 (out_tok=615). Stesso caveat noto della v1: gemini-2.5-flash via `router.py` (path `--model`) NON disabilita il thinking budget (a differenza di `_shared/llm_router.py`). Riportato integralmente come restituito.

Ecco i top-5 micro-venture ordinati per robustezza, presentati in schede pulite come richiesto:

---

### **1. Alert personalizzati per veicoli rari per rivenditori**

*   **Tesi**: I dealer indipendenti cercano modelli specifici per clienti premium ma perdono tempo su annunci EU. Il motore esistente può filtrare e notificarli.
*   **Cliente**: Concessionaria Fiat professional
*   **Prezzo**: €29/mese per alert mirati
*   **Segnali S1 da raccogliere**: Almeno 2 dealer su 10 pagano dopo demo gratuita di 7 giorni.
*   **Kill-criteria proposti**: I dealer non sono disposti a pagare per un servizio che replicano con una ricerca manuale su Subito/Autoscout.

---

### **2. Prenotazione veicoli premium per eventi PMI/sportivi**

*   **Tesi**: Le PMI e società sportive in Puglia/Basilicata noleggiano auto premium per eventi ma trovano poca disponibilità locale. Il motore di scouting EU + rete dealer risolve il problema.
*   **Cliente**: Società di catering per matrimoni
*   **Prezzo**: 10% sul noleggio (es. €150/evento)
*   **Segnali S1 da raccogliere**: Almeno 1 prenotazione confermata dopo 10 chiamate a società di catering.
*   **Kill-criteria proposti**: Le PMI preferiscono noleggiare auto "normali" da agenzie locali invece di pagare un premium per logistica complessa.

---

### **3. Database veicoli "pronto consegna" per dealer**

*   **Tesi**: I dealer perdono clienti per tempi di attesa lunghi. Creare un database condiviso di auto immediatamente disponibili in rete.
*   **Cliente**: Dealer moto usate
*   **Prezzo**: €199/mese per accesso
*   **Segnali S1 da raccogliere**: Almeno 3 dealer accettano di inserire il proprio stock nel database.
*   **Kill-criteria proposti**: I dealer non condividono i dati per paura di favorire concorrenti.

---

### **4. Affitti brevi auto premium per influencer locali**

*   **Tesi**: Micro-influencer Puglia cercano auto fotogeniche per contenuti ma non possono comprarle. Match con dealer via API esistenti.
*   **Cliente**: Blogger turistico
*   **Prezzo**: €75/giorno + fee 15%
*   **Segnali S1 da raccogliere**: Almeno 1 influencer paga dopo proposta diretta.
*   **Kill-criteria proposti**: Gli influencer preferiscono chiedere auto in comodato d'uso alle concessionarie in cambio di visibilità.

---

### **5.

[FINE OUTPUT — troncato dal modello a metà scheda #5, out_tok=615]

---

## Aggregato (aggregator)
**Provenance:** role=`long_context` | modello RISOLTO (log)=`gemini-2.5-flash` (google) | ts=`2026-07-10T20:50:57Z` | in_tok=540 / out_tok=99 | cost_usd=0.0 (free-tier reale)
Path summary engine: `state/plan-executions/plan_brainstorm_20260710_v2.md`

---

## PROVA DEL FIX — data-flow A→B→C (fatto terminale #2)

Il prompt di B ha inglobato l'output di A (sezione `=== OUTPUT DIPENDENZE ===` iniettata da
`_build_subtask_prompt`, confermata da in_tok B = 1455 vs 164 v1). B ha kill-testato **i dieci
candidati di A, numero per numero** — non gli asset. Mappatura 10/10:

| B (ordine robusto→fragile) | Candidato REALE di A | A# |
|---|---|---|
| B1 — Alert personalizzati veicoli rari | Alert personalizzati per veicoli rare | A2 |
| B2 — Prenotazione veicoli premium eventi | Prenotazione veicoli premium eventi PMI/sportivi | A1 |
| B3 — Database "pronto consegna" | Database veicoli "pronto consegna" | A4 |
| B4 — Affitti brevi influencer | Affitti brevi auto premium per influencer | A5 |
| B5 — Corso "Digitalizzare il dealer" | Corso "Digitalizzare il tuo dealer auto in 7 giorni" | A6 |
| B6 — Assistenza gestionale PMI | Assistenza remota per gestionale PMI (white-label) | A8 |
| B7 — Sconti tifosi | Gestione digitale sconti per tifosi | A3 |
| B8 — Trova finanziamento auto | Servizio "Trova finanziamento auto" per dealer | A9 |
| B9 — Abbonamento "Opportunità PMI" | Abbonamento "Opportunità PMI" | A7 |
| B10 — Partner tecnologico eventi sportivi | Partner tecnologico per eventi sportivi | A10 |

**Esito: VERDE.** Tutti e 10 i candidati di A compaiono uno-a-uno nella kill-list di B, con
kill-reason e dato osservabile specifici PER quel candidato. C ha poi formattato il top-5
secondo l'ordine di robustezza di B, riusando tesi/cliente/prezzo di A. Nessun finding rosso.

Contrasto v1: là B killava "rete dealer auto consolidata / gestionale verticale / motore
scouting…" = gli ASSET DI INPUT, perché il suo prompt NON conteneva l'output di A (in_tok=164).

---

## Telemetria (fatto terminale #3)

| role | modello atteso (routing.yaml) | modello osservato (log) | MATCH |
|---|---|---|---|
| reasoning (A) | deepseek/deepseek-chat | deepseek/deepseek-chat | ✅ |
| code_review (B) | deepseek/deepseek-chat | deepseek/deepseek-chat | ✅ |
| cheap (C) | gemini-2.5-flash | gemini-2.5-flash | ✅ |
| long_context (agg) | gemini-2.5-flash | gemini-2.5-flash | ✅ |

**4/4 MATCH** (identico alla v1).

**Delta costs.jsonl**: 167 → 175 righe = **+8**. Sono 4 coppie: per ogni subtask una riga da
`plan_execute._log_cost_entry` (con `plan_id`/`subtask_id`) + una self-log di `router.py` (senza
`plan_id`, ts a microsecondi). Tutte `cost_usd=0.0`: per deepseek è l'artefatto noto del path
`--model` (`router.py` forza `cost_in=cost_out=0`), costo reale stimato A ~$0.0012 + B ~$0.0014 ≈
$0.0026; gemini genuinamente free.

**Token per subtask (v1 → v2)**:

| subtask | in_tok v1 | in_tok v2 | out_tok v1 | out_tok v2 |
|---|---|---|---|---|
| A | 225 | 225 | 1015 | 1272 |
| B | 164 | **1455** | 818 | 1006 |
| C | 98 | **2271** | 126 | 615 |
| aggregator | 521 | 540 | 78 | 99 |

Il salto di in_tok su B (+1291) e C (+2173) è la firma quantitativa del fix: entrambi ora
ricevono l'output a monte nel prompt.

---

## Confronto secco v1 / v2 (fatto terminale #4)

1. **B, contenuto**: v1 kill-testava gli ASSET di input generici (rete dealer, gestionale, motore scouting…); v2 kill-testa i 10 candidati REALI di A, uno per uno, con soglie numeriche a 7 giorni.
2. **B, ordinamento**: v1 dava un ranking di asset scollegato dalle idee; v2 ordina le 10 idee di A da robusta a fragile con razionale esplicito (top-3 = asset-driven, #10 morto in partenza).
3. **C, contenuto**: v1 inventava schede scollegate (es. "Automazione Commerciale n8n" non presente in A); v2 formatta le idee REALI di A nell'ordine di robustezza di B, con kill-criteria ripresi da B.
4. **Data-flow**: v1 = B/C su prompt statico (in_tok 164/98); v2 = B/C inglobano l'upstream (in_tok 1455/2271). Il fix è attivo e misurabile.
5. **Invariato**: risoluzione modelli 4/4 MATCH; troncamento di C a metà scheda #5 (thinking budget gemini via path `--model`) persiste identico — caveat noto non risolto dal fix data-flow.
