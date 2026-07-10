# Brainstorm venture — 2026-07-10

Prima corsa REALE di `plan_execute` attraverso il router unificato (S181).
Chiamate LLM via `router.py` → `routing.yaml` (free-tier, `.env.free-gpu`). Nessuna API Anthropic.
plan_id: `plan_brainstorm_20260710` | 3 subtask in 3 wave (A → B → C) | aggregator: long_context.

> NOTA DISCORDANZA (engine): le `dependencies` del piano controllano SOLO l'ordinamento
> topologico in wave, NON iniettano l'output a monte nei prompt dei subtask dipendenti
> (`plan_execute._execute_subtask` passa solo `subtask["description"]`). Quindi B e C hanno
> operato sul proprio prompt statico, non sull'output reale di A/A+B.

---

## Subtask A — role: reasoning (thinker)
**Provenance:** role=`reasoning` | modello RISOLTO (log)=`deepseek/deepseek-chat` (openrouter) | ts=`2026-07-10T20:14:30Z` | in_tok=225 / out_tok=1015 | cost_usd loggato=0.0 (reale ~$0.00098 — vedi nota costi in fondo)

Ecco 10 candidati micro-venture che sfruttano i tuoi asset con i vincoli indicati:

1. **Matchmaking auto usate premium per dealer**
   - *Tesi*: Collegare i dealer indipendenti al tuo motore scouting EU per transazioni B2B su veicoli premium [DA-VERIFICARE: domanda da dealer locali].
   - *Cliente*: Dealer auto che pagano €50/lead verificato.
   - *60 giorni*: Integrazione n8n + app esistente per notifiche.

2. **Software gestionale white-label per PMI**
   - *Tesi*: Rivendi l'app esistente a PMI locali (o società sportive) come soluzione "chiavi in mano" [DA-VERIFICARE: interesse per verticali specifiche].
   - *Cliente*: PMI che pagano €100/mese per l'accesso.
   - *60 giorni*: Personalizzazione minima con n8n + onboarding base.

3. **Sponsorizzazioni digitali per squadre dilettantistiche**
   - *Tesi*: Monetizza le relazioni con società sportive vendendo pacchetti promo (es. logo su siti PMI sponsor) [DA-VERIFICARE: disponibilità PMI].
   - *Cliente*: PMI pagano €300/campagna.
   - *60 giorni*: Gestione via n8n (automatizza matchmaking).

4. **Bollettino auto premium per privati B2C**
   - *Tesi*: Newsletter con veicoli selezionati dal motore scouting, monetizzata da dealer [DA-VERIFICARE: interesse collector/enthusiast].
   - *Cliente*: Dealer pagano €20/inserto.
   - *60 giorni*: Template esistente + Stripe.

5. **Corsi "digitalizzazione PMI" con app inclusa**
   - *Tesi*: Vendi workshop (online) usando l'app gestionale come case study [DA-VERIFICARE: domanda post-fondi PNRR].
   - *Cliente*: PMI pagano €200/partecipante.
   - *60 giorni*: Materiale da KB esistente + calendario Stripe.

6. **Servizio lead gen B2B per PMI tradizionali**
   - *Tesi*: Usa n8n per creare report lead da fonti pubbliche (es. bandi) e vendili [DA-VERIFICARE: efficacia per settori locali].
   - *Cliente*: Artigiani pagano €50/report.
   - *60 giorni*: Automazione già pronta nella KB.

7. **Affiliazione dealer per assicurazioni/kits tuning**
   - *Tesi*: Monetizza la rete dealer con commissioni su prodotti complementari [DA-VERIFICARE: accordi con fornitori].
   - *Cliente*: Fornitori pagano il 10% a transazione.
   - *60 giorni*: Link Stripe nei contatti esistenti.

8. **Prenotazioni online per società sportive**
   - *Tesi*: Offri l'app gestionale (già verticale "sport") come tool prenotazioni/cassa [DA-VERIFICARE: adozione da piccoli club].
   - *Cliente*: Società pagano €30/mese.
   - *60 giorni*: Configurazione rapida.

9. **"Trova finanziamenti" per PMI auto**
   - *Tesi*: Sfrutta la KB per generare liste di finanziamenti/agevolazioni per dealer/PMI [DA-VERIFICARE: frequenza aggiornamenti].
   - *Cliente*: Dealer pagano €80/ricerca.
   - *60 giorni*: Filtri n8n + export PDF.

10. **Virtual assistant per dealer (no-tech)**
   - *Tesi*: Offri servizi di backoffice (es. inserimento dati) usando la tua app + n8n [DA-VERIFICARE: volumi di lavoro].
   - *Cliente*: Dealer pagano €15/ora.
   - *60 giorni*: Flussi già documentati in KB.

Tutti partono da asset esistenti, con monetizzazione immediata e senza costi fissi. Le assunzioni critiche sono marcate.

---

## Subtask B — role: code_review (verifier)
**Provenance:** role=`code_review` | modello RISOLTO (log)=`deepseek/deepseek-chat` (openrouter) | ts=`2026-07-10T20:15:01Z` | in_tok=164 / out_tok=818 | cost_usd loggato=0.0 (reale ~$0.00078 — vedi nota costi)

Ecco una lista di 10 tipici candidati di micro-venture per un founder non-sviluppatore in Italia, ordinati dal più robusto al più fragile, con il motivo di morte più probabile e un dato osservabile che lo falsificherebbe o confermerebbe in una settimana.

### 1. Rete dealer auto consolidata
**Motivo di morte più probabile:** Impossibilità di scalare oltre la regione Basilicata/Puglia.
**Dato osservabile:** Mancanza di interesse da parte di dealer di altre regioni nell'aderire alla rete in una settimana.

### 2. Gestionale verticale per PMI
**Motivo di morte più probabile:** Troppa complessità nell'integrazione con i sistemi esistenti delle PMI.
**Dato osservabile:** Nessuna PMI completa l'onboarding iniziale entro una settimana.

### 3. Motore di scouting veicoli premium EU
**Motivo di morte più probabile:** Mancanza di fonti affidabili per i dati sui veicoli premium.
**Dato osservabile:** Nessun nuovo veicolo premium aggiunto al database in una settimana.

### 4. Rapporti con società sportive dilettantistiche
**Motivo di morte più probabile:** Impossibilità di monetizzare le relazioni esistenti.
**Dato osservabile:** Nessun contratto o accordo di sponsorizzazione siglato con una società sportiva in una settimana.

### 5. KB n8n orientato alle PMI
**Motivo di morte più probabile:** Troppa competizione da soluzioni no-code più affermate.
**Dato osservabile:** Nessuna prova di utilizzo attivo da parte di una PMI in una settimana.

### 6. App gestionale multi-verticale
**Motivo di morte più probabile:** Mancanza di focus su una verticale specifica, leading to mediocrità generale.
**Dato osservabile:** Nessun feedback positivo da parte degli utenti in una specifica verticale in una settimana.

### 7. Piattaforma di networking per PMI
**Motivo di morte più probabile:** Mancanza di partecipazione attiva da parte delle PMI.
**Dato osservabile:** Nessuna interazione significativa tra le PMI registrate in una settimana.

### 8. Servizio di consulenza per dealer auto
**Motivo di morte più probabile:** Difficoltà nel dimostrare valore tangibile ai dealer.
**Dato osservabile:** Nessun dealer richiede una seconda consulenza entro una settimana.

### 9. Marketplace veicoli premium di nicchia
**Motivo di morte più probabile:** Bacino di utenti troppo ristretto e difficoltà nell'attrarre acquirenti.
**Dato osservabile:** Nessuna nuova registrazione di acquirenti premium in una settimana.

### 10. Piattaforma di crowdfunding per società sportive
**Motivo di morte più probabile:** Mancanza di interesse da parte dei potenziali sostenitori.
**Dato osservabile:** Nessuna campagna crowdfunding raggiunge il 10% del suo obiettivo in una settimana.

**Commento finale:** Il candidato più robusto è la **rete dealer auto consolidata**, poiché ha già una base esistente e può scalare regionalmente. Il più fragile è la **piattaforma di crowdfunding per società sportive**, che dipende totalmente dall'engagement degli utenti e ha un rischio elevato di fallimento per mancanza di interesse.

---

## Subtask C — role: cheap (worker)
**Provenance:** role=`cheap` | modello RISOLTO (log)=`gemini-2.5-flash` (google) | ts=`2026-07-10T20:15:12Z` | in_tok=98 / out_tok=126 | cost_usd=0.0 (free-tier reale)
> ATTENZIONE: output TRONCATO dal modello a metà frase (out_tok=126). gemini-2.5-flash via `router.py` (path `--model`) NON disabilita il thinking budget (a differenza di `_shared/llm_router.py`), plausibile causa della resa corta. Riportato integralmente come restituito.

Ecco le top-5 micro-venture per robustezza, pensate per un founder non-sviluppatore in Italia, sfruttando i tuoi asset. Le ho ordinate dalla più alla meno robusta (secondo la mia interpretazione, basata su leveraging degli asset esistenti, chiarezza del problema/soluzione e scalabilità iniziale).

### 1. Automazione Commerciale su Misura per PMI (con n8n)

Questa venture capitalizza direttamente sulla tua conoscenza di n8n e la tua rete di PMI, offrendo un servizio ad alto valore percepito e con costi iniz

---

## Aggregato (aggregator)
**Provenance:** role=`long_context` | modello RISOLTO (log)=`gemini-2.5-flash` (google) | ts=`2026-07-10T20:15:23Z` | in_tok=521 / out_tok=78 | cost_usd=0.0 (free-tier reale)
Path summary engine: `state/plan-executions/plan_brainstorm_20260710.md`

---

## Nota costi (telemetria)
`router.py`, invocato con `--model` esplicito dallo shim S181, forza `cost_in=cost_out=0` per QUALSIASI modello (riga `candidates = [(model, provider, 0, 0)]`). Quindi le chiamate deepseek (modello a pagamento: 0.32/0.89 $/M in routing.yaml) sono loggate `cost_usd=0.0`. Costo reale stimato: A ~$0.00098, B ~$0.00078, totale reale ~$0.0018 (gemini genuinamente free). Il `cost_usd=0.0` in costs.jsonl per deepseek è un artefatto noto del path `--model`, non un costo zero reale.
