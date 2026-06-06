# VOS_RUN_SPEC — la fabbrica ESEGUIBILE (non il design)

**Creato**: 2026-06-06 · **Owner**: Luke · **Stato**: v0.1 eseguibile · **Tipo**: generalista, niche-free, zero nomi-venture

> `factory-line.md` è il **design** (6 stazioni, scocca, nastro, gate). Questo file è il **contratto di esecuzione**: cosa entra, cosa esce, chi muove cosa, quando si scarta. Riduce le 6 stazioni concettuali a **3 stazioni eseguibili minime** (autocritica #4 di factory-line: costruisci la linea minima che porta una scocca a S6, struttura in più solo se una corsa reale la richiede).
>
> **Test della fabbrica**: una `venture-dossier.md` portata da **S0 a S6** su una **nicchia NUOVA scelta da VOS** (non da Luke). Tutto il resto è lucidatura.

---

## Principio FIREWALL (chi decide cosa — non negoziabile)

La fabbrica esiste per separare due ruoli che il solo-founder tende a fondere (e così facendo si avvita):

| Ruolo | Chi | Cosa fornisce | Cosa NON fa |
|---|---|---|---|
| **Committente** | Luke | il `seed_envelope`: **solo vincoli** (budget, skill disponibili, reach di canale, €0-cost, revenue-floor, tempo) — **niche-free** | NON sceglie la nicchia, NON sceglie il prodotto |
| **Fabbrica** | VOS (main Claude + worker) | **partorisce la nicchia** dai vincoli, costruisce, distribuisce | NON chiede a Luke "quale nicchia preferisci?" |
| **Collaudo** | Luke | valida l'**evidenza esterna** ai gate (URL, pagamento reale) | NON valida il design, NON valida "mi sembra buono" |

**Conseguenza load-bearing**: ogni dato in `venture-dossier.md` porta **provenienza obbligatoria** (`source:` URL / tool / comando + `ts:`). Senza provenienza un gate non è valutabile da Luke → il gate è FAIL per definizione. Questo è il firewall reso meccanico: Luke audita l'evidenza, non la narrazione.

---

## INPUT — `seed_envelope` (niche-free)

Luke compila `seeds/SEED_ENVELOPE.template.md` con i soli **vincoli**. Esempio di campi (niche-free):

- `budget_max_eur`: 0 (salvo Claude Code già pagato)
- `time_per_week_hours`: N
- `skills_available`: [coding via CC, ...]  ← capacità, non settore
- `channel_reach`: dove Luke può già raggiungere persone (0 = Componente 0 da costruire)
- `revenue_floor_eur`: primo pagamento-soglia che conta come SHIPPED
- `excluded_domains`: settori da escludere (es. quelli delle venture attive, per non verticalizzare)
- `verticale_type_hint`: opzionale — B2B-globale / servizi-locali / consumer (orienta le famiglie-tool, NON è la nicchia)

VOS legge questo, e **da qui partorisce la nicchia** alla stazione 1. Se l'envelope nomina una nicchia → violazione firewall, VOS la ignora e la flagga.

---

## LE 3 STAZIONI ESEGUIBILI (worker-ROLE generici)

I worker sono **ruoli astratti**, non agent-name. La mappatura ROLE→agent concreto avviene a runtime (JIT, dipende dal tipo-verticale partorito) — vedi §Mappatura. Questo tiene la spec generalista.

| # | Stazione | Worker-ROLE | Input (stato scocca) | Output | **GATE esterno-binario** (decidibile da Luke) |
|---|---|---|---|---|---|
| **1** | **Discovery + Demand** | `market-researcher` | S0 seed_envelope | S2 scocca: nicchia partorita + tesi domanda, ogni claim con URL | **G1**: ≥1 evidenza di **spesa esistente** verificabile (competitor con revenue / ≥3 post workaround a pagamento / ≥5 job-posting che pagano l'esecuzione manuale) **con URL**. Kill-criteria A–E (market-intelligence-engine.md). Fail uno → **KILL** |
| **2** | **Build + Offer** | `builder` | S2 scocca | S4 scocca: offerta (cosa/prezzo) + MVP del job-core | **G2**: il **job-core funziona** — test E2E reale eseguito, output osservabile (no demo finta). Exit-code / URL deploy raggiungibile. Fail → REWORK (max 1 ciclo, poi escala — vincolo #1c) |
| **3** | **Distribution + Validation** ⟵ **VINCOLO (ToC)** | `distributor` | S4 scocca | S6 scocca: outreach consegnato su **Componente 0** + verdetto | **G3 = gate F TERMINALE**: **≥1 pagamento reale** (carta / LOI con deposito / pre-ordine). Nessun proxy (no waitlist, no like, no "lo comprerei"). Pass → **SHIPPED**. Fail dopo N buyer raggiunti → **KILL motivato** |

**Perché 3 e non 6**: le 6 di factory-line collassano in 3 unità con un solo gate-binario ciascuna. Ogni stazione-design con gate *interno* (es. stazione 3 "Offer scoping" col gate "offerta mappata su dolore") è stata **fusa** (correzione hard §8b.2 di factory-line: gate interno = over-engineering). Restano 3 gate, tutti esterni-binari.

**La stazione 3 si costruisce PER PRIMA** (questo file la specifica per prima sotto, §Stazione-vincolo). Costruire 1-2 prima = throughput zero (ToC: throughput = bottleneck). Le stazioni 1-2 NON si lucidano: esistono come contratto, i tool dentro si attrezzano JIT.

---

## La SCOCCA — `venture-dossier.md`

Un solo artefatto per venture-candidato, percorre la linea, arricchito da ogni stazione. Template canonico: `templates/venture-dossier.md`. Stati S0→S6 = sezioni che si compilano in ordine. **Ogni sezione ha un blocco `provenance:` obbligatorio** (vedi firewall). Senza, la stazione non può chiudere il gate.

Mappatura stazione → stati scocca:
- Stazione 1 porta S0 → S2
- Stazione 2 porta S2 → S4
- Stazione 3 porta S4 → S6

---

## Il NASTRO — come si muove la scocca (verificato empiricamente 2026-06-06)

**Il nastro NON è uno script autonomo.** Verifica empirica: `vos-auto-router` è una **SKILL = protocollo** che il main Claude segue; `plan_execute.py` esegue solo subtask testo (no write-file); i subtask che scrivono file → **Task tool**. Quindi:

> Nastro = **main Claude** che, seguendo il protocollo `vos-auto-router`, per ogni stazione invoca il worker-ROLE via `Task` (build/file) o `vos-llm-router`/`plan_execute.py` (analisi testo), legge il gate, e — se PASS — avanza lo stato scocca alla stazione successiva.

Helper di stato: `bin/vos-factory-run` (DELEGATO a rapid-prototyper, vedi §Runner) — thin CLI che (a) istanzia il dossier dal template, (b) registra avanzamenti di stato + provenienza in `state/factory-runs.jsonl`, (c) non decide i gate (lo fa Luke sull'evidenza). Lo script è **infrastruttura di tracciabilità**, non intelligenza.

### Controllo-linea: GO / KILL / REWORK
- **GO** → avanza stato scocca, prossima stazione.
- **KILL** → archivia dossier con motivo + URL evidenza in `ventures/_killed/`. Una nicchia uccisa a costo zero è un **OUTPUT VALIDO** (sostituisce il voto-IC che il solo-founder non ha — §8b.1 factory-line).
- **REWORK** → torna stazione precedente con nota, max 1 ciclo, poi escala (vincolo #1c).
- **WIP limit = 1** venture in linea (solo-founder, ToC).

---

## Mappatura ROLE → agent concreto (JIT, runtime)

| Worker-ROLE | Agent/tool concreto candidato (scelto JIT per tipo-verticale) |
|---|---|
| `market-researcher` | `Task(trend-researcher)` + skill `deep-research` (research.py) + WebSearch. Famiglie data-source: market-intelligence-engine.md §Famiglie. |
| `builder` | `Task(backend-architect)` / `Task(frontend-developer)` / `Task(rapid-prototyper)` secondo il job-core |
| `distributor` | `Task(growth-hacker)` + n8n (OSS self-host) + **Componente 0** (canale) + Stripe/Lemon link per G3 |

La scelta del tool *specifico* dentro la famiglia è JIT via `tool-evaluator`, uno slot alla volta quando la venture lo tocca (mai sweep anticipato = trappola tool-collection).

---

## §Stazione-vincolo (3): Distribution + Validation — vedi `components/distribution-station.md`

Specificata per prima e separatamente (è il vincolo). Include **Componente 0** (canale durevole che preesiste alla venture). Senza Componente 0 la stazione 3 non può funzionare per nessuna venture → throughput zero.

---

## §Runner — `bin/vos-factory-run` (DELEGATO)

Thin CLI stdlib-only, Big Sur compat, no deps. Comandi:
- `vos-factory-run init <seed_envelope.md>` → crea `ventures/<slug>/venture-dossier.md` da template, assegna run-id, logga S0 + provenienza envelope.
- `vos-factory-run advance <run-id> --to S<n> --gate <PASS|KILL|REWORK> --evidence <url-or-path>` → valida che il dossier abbia provenienza per la sezione, append a `state/factory-runs.jsonl`, sposta dossier in `_killed/` se KILL.
- `vos-factory-run status [<run-id>]` → stato corrente scocca + prossimo gate atteso.

Non decide i gate. Rifiuta `advance` se la sezione target non ha blocco `provenance:` compilato (firewall meccanico).

---

## Obiettivo terminale di questa fabbrica

**Una `venture-dossier.md` portata S0→S6 su una nicchia NUOVA che VOS sceglie dal `seed_envelope`.** SHIPPED (pagamento reale) o KILLED-motivato sono entrambi esiti validi. Tutto ciò che non avvicina una scocca a S6 è lucidatura (autocritica #3 factory-line).

---

## Autocritica strutturale (vincolo #4)

1. **Assunzione nascosta**: che il main Claude segua il protocollo nastro con disciplina senza un orchestratore che lo forza. Mitigazione: `vos-factory-run` rende lo stato esplicito e auditabile; ma la decisione GO/KILL resta umana+evidenza.
2. **Rompe a 30/60gg**: se Componente 0 non esiste, la stazione 3 è un guscio e la prima corsa muore a S5 senza canale → si ripiega su "outreach per-prodotto" che non compone. Per questo §distribution-station costruisce Componente 0 PRIMA.
3. **Pattern errore noto**: "linea su carta" — questo file vale 0 finché una scocca non lo attraversa fino a S6. Misura = corse, non spec.
4. **Sovradimensiona**: 3 stazioni + scocca + runner potrebbero essere troppe se la prima corsa muore a G1. Tetto: non scrivere il runner-feature oltre i 3 comandi sopra finché una corsa non lo richiede.
