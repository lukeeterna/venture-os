# Distribution + Validation — la STAZIONE-VINCOLO (stazione 3) + Componente 0

**Creato**: 2026-06-06 · **Owner**: Luke · **Stato**: v0.1 · **Tipo**: generalista, niche-free
**Priorità**: COSTRUITA PER PRIMA (ToC — throughput = bottleneck; costruire 1-2 prima = throughput zero)

> Stazione 3 di `VOS_RUN_SPEC.md`. Porta la scocca **S4 → S6**. Contiene il gate terminale **G3 (pagamento reale)** e l'unica infrastruttura davvero riusabile cross-venture del solo-founder: il **Componente 0 (canale durevole)**.
> Verifica empirica §8b di factory-line (Pieter Levels): la distribuzione non è "fai outreach", è **un asset che PREESISTE al prodotto**. Photo AI ha incassato in settimana 1 *perché il canale c'era già da 10 anni*. Senza l'asset, la distribuzione è grind per-prodotto che non compone.

---

## Perché questa stazione esiste per prima

Dato CB Insights: 70% del fallimento è distribuzione, non prodotto. ToC: se la stazione-vincolo non esiste, le stazioni a monte producono solo coda. Quindi: **Componente 0 va costruito ora, una volta, e riusato su ogni venture.** Le stazioni 1-2 restano contratti minimi finché Componente 0 non respira.

---

## Componente 0 — Canale durevole (infrastruttura, non una stazione)

**Definizione operativa**: un canale di distribuzione **proprietario** che VOS/Luke possiede e che preesiste a ogni venture, su cui la stazione 5 di OGNI venture si innesta a costo zero-marginale.

**Criterio di "esiste" (esterno-binario, non auto-valutato)**: il canale esiste sse ha **un endpoint con ≥1 destinatario raggiungibile oggi senza paid ads** e un meccanismo di append (posso aggiungere un messaggio e qualcuno lo riceve). Esempi di forma (niche-free, scelta JIT):

| Forma di canale | "Esiste quando..." (test binario) | Costo |
|---|---|---|
| Newsletter (lista email own) | ≥1 iscritto reale + provider free-tier configurato (invio test ricevuto) | €0 (free tier) |
| Account build-in-public (X/Reddit/LinkedIn) | profilo attivo + ≥1 post pubblicato + ≥1 follower non-bot | €0 |
| Aggregatore/directory esistente come canale (marketplace, app store, subreddit di nicchia) | accesso a pubblicare + regole lette | €0 |
| Rete outreach diretta (DM/email a lista nominale) | lista di ≥N contatti raggiungibili con indirizzo verificato | €0 |

> ⚠️ Il canale è **niche-agnostico nella forma** ma il *pubblico* lo specializza la venture: si costruisce l'infrastruttura (lista/account/automazione invio), il *contenuto* si attrezza per-venture. Come Componente 0 di factory-line: si costruisce una volta, si riusa.

**Costruzione minima (zero-cost, Big Sur compat)**:
1. Scegli UNA forma sopra (decisione tecnica VOS, non lista a Luke — vincolo #3). Default raccomandato per solo-founder a `channel_reach: 0`: **account build-in-public** + **lista email free-tier** (es. provider con free tier; tool specifico scelto JIT via tool-evaluator quando si tocca lo slot).
2. Setup: 1 endpoint pubblicabile + 1 meccanismo di cattura contatti (form → lista).
3. **Gate-esistenza** (binario, owned da Luke): invio un messaggio di test e VOS verifica che un destinatario reale l'abbia ricevuto / il post sia live e raggiungibile via URL.
4. Automazione invio: **n8n self-host** (OSS, €0) per outreach ripetibile — configurato JIT, non ora.

**Stato attuale**: `channel_reach` da leggere dal seed_envelope. Se 0 → Componente 0 è **0-build e BLOCCA G3** → primo lavoro della prima corsa. Se >0 → canale esistente è Componente 0, salta il build.

---

## La stazione 3 — flusso S4 → S6

Worker-ROLE: `distributor` → `Task(growth-hacker)` + n8n + Componente 0 + Stripe/Lemon (mappatura JIT, VOS_RUN_SPEC §Mappatura).

### S5 — outreach (Distribution)
1. Da S4 hai un MVP con job-core funzionante (G2 passato).
2. Targetizza buyer raggiungibili **sul Componente 0** (no paid ads — gate D del seed).
3. Outreach consegnato a ≥N buyer (N dal floor: revenue_floor / prezzo, tipicamente puntare ai primi 20-100 contatti caldi).
4. Traccia risposte (outreach_log con path/URL → provenienza S5 della scocca).

### S6 — validation — GATE G3 (terminale, tasso di conversione)
- Payment link reale (Stripe / Lemon Squeezy, €0 setup).
- Misura: **paganti reali / `buyers_reached_target`** (N raggiunti, no paid ads). Niche-free: non un € assoluto.
- **Esiti** (deciso da Luke sull'evidenza, non VOS):
  - **≥ `min_paying_to_pass`** paganti su N → **SHIPPED** (nicchia efficace, vale scalare).
  - **1** pagante su N → segnale debole: rework offerta (max 1) o kill.
  - **0** dopo N raggiunti → **KILLED-motivato** (output valido: nicchia uccisa a costo basso).
- **Nessun proxy ammesso**: waitlist, like, "lo comprerei", survey → NON contano (vincolo #6, gate-proxy = morte modello).

---

## Done-condition esterna (vincolo #1b/#1c)

- **TERMINAL_FACT G3**: transazione di pagamento reale visibile nella dashboard Stripe/Lemon. Esterno, binario, deciso da Luke.
- Se irraggiungibile in-sessione (dipende da buyer nel mondo reale): `BLOCKED-ON: primo pagamento`. **Mai re-validare staticamente** — l'unico lavoro ammesso è rendere il fatto raggiungibile (più outreach, fix offerta) o escalare. Non si "controlla di nuovo il codice del payment link" per simulare progresso.

---

## Autocritica strutturale (vincolo #4)

1. **Assunzione nascosta**: che un canale build-in-public da `channel_reach: 0` produca ≥1 buyer in tempi utili alla prima corsa. Falso per molti: Levels ci ha messo 10 anni. Mitigazione: per la PRIMA corsa, preferire una forma di canale che **sfrutta un aggregatore esistente** (subreddit di nicchia, marketplace) dove il pubblico c'è già, invece di costruire audience da zero — riduce il time-to-first-buyer.
2. **Rompe a 30/60gg**: se ogni venture richiede un pubblico *diverso* sul canale, il Componente 0 non compone davvero (un account build-in-public generico non converte su nicchie B2B verticali). Rischio che "riusabile" sia teorico. Da verificare alla seconda corsa, non assumere.
3. **Pattern errore noto**: lucidare il setup del canale (automazioni n8n elaborate) prima di avere 1 buyer. Tetto: Componente 0 = endpoint + cattura contatti + 1 invio test riuscito. Stop. L'automazione si aggiunge solo se la prima corsa la richiede.
4. **Sovradimensiona**: 4 forme di canale elencate quando ne serve 1. La scelta è di VOS (vincolo #3), non un menu per Luke.

---

## Fonti
- factory-line.md §8b (Pieter Levels, distribuzione come asset 10-anni; correzione hard #3).
- market-intelligence-engine.md (gate D distribuzione fattibile, gate F pagamento).
- CB Insights 70% distribuzione: https://www.cbinsights.com/research/report/startup-failure-reasons-top/
