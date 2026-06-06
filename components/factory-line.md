# Factory Line — la catena di montaggio VOS (architettura completa end-to-end)

**Creato**: 2026-06-06 · **Owner**: Luke · **Stato**: v0.1 — linea completa progettata, stazioni in vari stati di build (vedi §8) · **Tipo**: architettura generalista, agnostica al verticale

> Questo documento è la **LINEA**, non una stazione. Definisce le 6 stazioni + l'infrastruttura condivisa + **la scocca che viaggia** + **il nastro che la muove** + **i gate** che la fanno avanzare o la scartano. Senza queste ultime tre cose le stazioni isolate non sono una fabbrica. `factory-routing.md` e `market-intelligence-engine.md` sono spec di singole stazioni e si agganciano qui.

---

## Principio: perché la linea va costruita COMPLETA (non a pezzi)

Una linea di montaggio non ha modalità di esercizio parziale. Tre fatti strutturali:

1. **Throughput = stazione bottleneck** (Teoria dei Vincoli, Goldratt *The Goal*, 1984). Una stazione **mancante** = throughput **zero**. Non si può "avviare" una linea con solo lo stampaggio.
2. **La fabbrica è un pipeline a stage-gate** (Cooper, *Winning at New Products*): stadi separati da gate go/kill/rework. Il valore è nel **flusso** di un candidato attraverso TUTTI gli stadi, non nella perfezione di uno stadio.
3. **I venture studio operano così** (High Alpha, Pioneer Square Labs, Atomic, Hexa/eFounders): un processo ripetibile idea→validazione→build→launch end-to-end, non stazioni validate in isolamento. (Validazione empirica del modello: delegata 2026-06-06, vedi §9 fonti.)

**Distinzione che risolve l'apparente conflitto col vincolo "tool JIT"**: si costruiscono COMPLETE le **stazioni + la logica di collegamento**; si configurano **per-verticale (JIT)** solo i **tool specifici** dentro ogni stazione. Come la fabbrica auto: tutte le stazioni esistono fisicamente, i robot si riattrezzano per modello. Congelare i tool = trappola. NON costruire le stazioni = nessuna fabbrica.

---

## La SCOCCA — il WIP unit che viaggia sulla linea

Il pezzo che rende le stazioni componibili: un **singolo artefatto `venture-dossier.md`** (uno per venture-candidato) che percorre la linea e viene arricchito da ogni stazione. È l'interfaccia standard di handoff. Stati progressivi:

| Stato | Dopo stazione | Sezioni compilate |
|---|---|---|
| **S0 — seed** | (intake) | dominio/seme + classificazione tipo-verticale (B2B-globale / servizi-locali / consumer) |
| **S1 — segnali** | 1. Discovery | lista nicchie candidate + segnali di spesa esistente, ognuno con URL |
| **S2 — scocca** | 2. Demand validation | tesi di domanda + verdetto gate A–E (kill o pass). *Questa è la scocca strutturale.* |
| **S3 — offerta** | 3. Offer scoping | servizio/offerta: cosa vendi, prezzo, positioning, feature minima |
| **S4 — MVP** | 4. Build | artefatti MVP: repo, URL deploy, esito test E2E del job-core |
| **S5 — outreach** | 5. Distribution | canale usato, buyer raggiunti, risposte tracciate |
| **S6 — verdetto** | 6. Validation | esito gate F (€ incassato o no) → SHIPPED o KILLED |

Senza questo artefatto condiviso, ogni stazione produce output in formati scollegati → la linea non scorre. **Questo era il buco** dei componenti scritti finora come isole.

---

## Le 6 stazioni (linea completa)

| # | Stazione auto | Stazione VOS | Input (stato scocca) | Transform | Worker / famiglia tool (JIT) | Exit-gate (Stage-Gate) |
|---|---|---|---|---|---|---|
| 1 | Stampaggio lamiere | **Discovery** | S0 seed | dati mercato grezzi → segnali nicchia | `trend-researcher` / deep-research; famiglie data-source per tipo-verticale (vedi market-intelligence-engine.md) | ≥1 nicchia con segnale di **spesa esistente** |
| 2 | **Lastratura (scocca)** | **Demand validation** | S1 segnali | segnali → tesi di domanda triangolata | `trend-researcher` (triangolazione, URL) | **kill-criteria A–E** (market-intelligence-engine.md). Fail uno → KILL |
| 3 | Verniciatura | **Offer scoping** | S2 scocca | domanda → offerta minima (cosa, prezzo) | Claude (Opus, orchestratore) + `sprint-prioritizer` | offerta mappata su dolore provato + raggiungibile a prezzo ≥ floor |
| 4 | Montaggio | **Build** | S3 offerta | offerta → MVP assemblato | `backend-architect` / `frontend-developer` / `rapid-prototyper` | il **job-core funziona** (test E2E reale, no demo finta) |
| 5 | Collaudo/road test | **Distribution** | S4 MVP | MVP → outreach via canale | `growth-hacker` + n8n (OSS) + **Componente 0 (canale)** | outreach **consegnato** a ≥N buyer raggiungibili, risposte tracciate |
| 6 | Linea finale/ship | **Validation** | S5 outreach | outreach → pagamento | Stripe / Lemon Squeezy payment link | **gate F: ≥1 pagamento reale** (terminale, no proxy) → SHIPPED o KILL |

**Bottleneck noto a priori** (ToC + dato CB Insights 42-43% "no market need" + 70% distribuzione): la stazione vincolo è la **5 (Distribution)**, non la 1-2. Lì va concentrato il budget di build, non sullo stampaggio. (Coerente con autocritica #4 dei componenti a monte.)

---

## Il NASTRO + controllo-linea (orchestrazione)

- **Nastro**: la skill `vos-auto-router` (orchestrator-workers, già esiste) muove `venture-dossier.md` da stazione N a N+1 e invoca il worker della stazione.
- **Controllo-linea (gate Stage-Gate)**: a ogni uscita di stazione, decisione **GO / KILL / REWORK**:
  - GO → avanza stato scocca, prossima stazione.
  - KILL → archivia il dossier con motivo + URL evidenza. (Una nicchia uccisa a costo zero è un OUTPUT valido della fabbrica, non un fallimento.)
  - REWORK → torna alla stazione precedente con nota correttiva (max 1 ciclo, poi escala — vincolo #1c anti-avvitamento).
- **WIP limit**: max 1-2 venture in linea contemporaneamente per il solo-founder (ToC: più WIP del bottleneck = solo coda, non throughput).

---

## Infrastruttura condivisa (non una stazione — la "rete elettrica")

**Componente 0 — Audience/Channel asset**: il canale di distribuzione personale (community, newsletter, rete outreach) su cui la **stazione 5 di OGNI venture si innesta**. Si costruisce una volta, si riusa su ogni candidato. Per il solo-founder è l'unico asset davvero riusabile cross-venture (equivalente del GTM centralizzato dei corporate studio). **È infrastruttura della linea, va costruita prima che la stazione 5 possa funzionare per qualunque venture.**

---

## §8 — Stato build delle stazioni (onestà: cosa esiste vs cosa è stub)

| Stazione | Stato spec | Stato eseguibile |
|---|---|---|
| 1-2 Discovery + Demand validation | **SPECCATA** (market-intelligence-engine.md, v0.1) | metodo+gate definiti, mai eseguita su nicchia reale |
| 3 Offer scoping | stub (riga in factory-routing.md) | da speccare |
| 4 Build | stub (agent esistono: backend/frontend/rapid) | worker pronti, manca il contratto di ingresso S3→S4 |
| 5 Distribution | stub + **dipende da Componente 0 non ancora costruito** | **stazione-vincolo, prioritaria** |
| 6 Validation | stub (Stripe/Lemon noti) | da configurare per-venture |
| Scocca (WIP) | **definita qui** (§ La scocca) | template `venture-dossier.md` da creare |
| Nastro (orchestrazione) | `vos-auto-router` esiste | mai cablato sulle 6 stazioni |
| Componente 0 (canale) | concetto | **0 build — blocca la stazione-vincolo** |

**Sequenza di costruzione corretta** (non a caso, per priorità-vincolo ToC): (a) template scocca `venture-dossier.md`; (b) spec stazione 3 e contratto di handoff 3→4; (c) **Componente 0 + stazione 5** (il vincolo); (d) cablaggio nastro `vos-auto-router` sulle 6 stazioni; (e) prima corsa end-to-end su 1 nicchia nuova.

---

## §9 — Autocritica strutturale (vincolo #4)

1. **Assunzione nascosta**: assume che il modello venture-studio (pipeline stage-gate) sia trasferibile al solo-founder a budget €0. I studio hanno team multi-funzione per ogni stazione; qui il "team" sono agent CC. La validazione delegata 2026-06-06 deve confermare/smentire la trasferibilità, non darla per scontata.
2. **Cosa rompe a 30/60/90gg**: se la stazione-vincolo (5 Distribution + Componente 0) non viene costruita per prima, costruire le altre stazioni produce throughput zero comunque — esattamente l'errore che questo documento corregge, riproposto a un livello più sottile. Rischio: lucidare stazioni 1-4 perché più facili.
3. **Pattern errore noto**: "linea su carta". Tutte le stazioni speccate ma mai una scocca che le attraversa fino a S6 → la linea vale 0. Misura della fabbrica = **una venture-dossier portata da S0 a S6 (pagamento o kill motivato)**, non il numero di stazioni documentate.
4. **Dove sovradimensiona**: 6 stazioni + scocca + nastro per un solo-founder potrebbero essere troppa struttura se la prima corsa rivela che 3 stazioni bastano. Tetto: costruire la linea **minima** che porta una scocca a S6, poi aggiungere struttura solo se una corsa reale lo richiede.

---

## §10 — Fonti / framework (concetti foundational, non cutoff-sensitive)

- Teoria dei Vincoli — E. Goldratt, *The Goal* (1984): throughput di linea = bottleneck.
- Stage-Gate — R. Cooper, *Winning at New Products*: pipeline NPD a stadi + gate go/kill.
- Build-Measure-Learn — E. Ries, *The Lean Startup*: loop di validazione, gate = apprendimento validato.
- Modello venture-studio (High Alpha, Pioneer Square Labs, Atomic, Hexa): pipeline ripetibile end-to-end. **Validazione empirica del design delegata 2026-06-06** (trend-researcher) — aggiornare questa sezione con URL e dettaglio processo reale al ritorno.
