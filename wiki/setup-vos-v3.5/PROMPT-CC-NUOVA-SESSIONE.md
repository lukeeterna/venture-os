# Apertura nuova sessione Claude Code — Venture OS Sessione 1

Ciao. Sono Luke (Gianluca Di Stasi). Ti apro questa sessione con context pulito **fuori da progetti specifici**. Lavora dalla home `~/` o ovunque non sia dentro `FLUXION`, `combaretrovamiauto-enterprise`, `pulizia-smartphone`. Italiano sempre.

## Contesto storico (sintetico, leggi e applica, non riaprire)

Sto avviando il Venture OS — sistema personale che osserva il portfolio dei miei 3 progetti attivi (ARGOS, FLUXION, Guardian) e mi aiuta a chiuderli invece di accumulare costruzione senza revenue. Decisioni già chiuse, non riaprire:

1. **Path canonico VOS**: `/Volumes/MontereyT7/venture-os/` con symlink `~/venture-os`. Motivo: SSD MacBook è al 93%, T7 ha spazio. Decisione D1 di una review CC precedente.
2. **Installazione GLOBALE CC**: skill, agents, CLAUDE.md VOS vivono in `~/.claude/`, NON dentro un progetto. Vedi blueprint sezione 3.3. Vincolante.
3. **VOS è agnostico ai progetti**: non scrive codice di ARGOS/FLUXION/Guardian, lavora a livello sopra. Lettura read-only sui DB progetti, mai scrittura.
4. **Stack approvato**: Mole + psutil custom (no Glances), Streamlit dashboard read-only, launchd nativo, LiteLLM SDK in-process, OpenRouter + free-gpu-api skill globale + Claude Code subscription, Karpathy LLM Wiki + L1/L2 cache markdown, decision-template a 2 livelli (strategic/operational).
5. **Tre progetti attivi confermati**: ARGOS in `~/Documents/combaretrovamiauto-enterprise/`, FLUXION in `/Volumes/MontereyT7/FLUXION/`, Guardian in `~/Documents/pulizia-smartphone/`.
6. **Una precedente sessione CC dentro FLUXION ha probabilmente installato file VOS in `<FLUXION>/.claude/` per errore di scope. Vai a controllare e sistema (Task 0 del prompt allegato).**

## Documenti allegati

1. `BLUEPRINT-JD-v3.4.md` — blueprint completo finale (1065 righe). Leggilo integralmente. Sezioni critiche per questa sessione:
   - **Sezione 3.3** Installation scope (vincolante: VOS = globale `~/.claude/`)
   - **Sezione 7.6** Session Health (`/context` monitoring, preflight env check, handoff debt)
   - **Sezione 11** Piano costruzione (sei sessioni, oggi facciamo SOLO la 1)
   - **Sezione 13bis** Protocollo Blocker Operativo (vincolante: davanti a un blocker fai ricerca con dati prima di chiedermi qualunque cosa, mai opzioni A/B/C scaricate su di me)

2. `PROMPT-CC-SESSIONE-1.md` — istruzioni esecutive per oggi. 13 task numerati (Task 0 Recovery scope + Task 1-12 esecuzione), 6 gate finali misurabili, vincoli operativi non-negoziabili.

## Cosa devi fare in questa sessione

Solo la **Sessione 1 del piano di costruzione** (vedi blueprint sezione 11). Niente altro. Niente Sessione 2-6, niente componenti che non sono nel Task 0-12.

Risultato atteso a fine sessione:
- Eventuali file VOS misplaced dentro progetti → spostati in `~/.claude/` (Task 0)
- SSD MacBook sotto 85% (cleanup whitelist-ato approvato da me)
- Struttura `/Volumes/MontereyT7/venture-os/` creata + symlink `~/venture-os` funzionante
- `disk-keeper` v0 implementato e testato
- `mount_check.py` condiviso operativo
- Git repo VOS inizializzato con primo commit
- 6 gate finali tutti verdi

Tempo stimato: 3 ore. Se sfori 60% di context, fai handoff strutturato e ti fermi (PBO).

## Vincoli che NON puoi violare

- **Italiano sempre** (inglese solo per nomi tecnici/comandi/path)
- **Mai stati "PARTIAL" o "ARANCIONE"**: sessione chiude verde o in handoff strutturato con prompt resume
- **Mai opzioni A/B/C/D scaricate su di me** davanti a un blocker. Applica PBO sezione 13bis: ricerca attiva con dati → decisione automatica con regole fisse → procedi da solo nei casi previsti dalla tabella
- **Mai install di librerie pesanti in questa sessione** (Sessione 1 è leggera per design: Mole brew + Python stdlib + comandi shell)
- **Mai tocchi codice di ARGOS/FLUXION/Guardian**. Il VOS è separato. L'unico contatto è il Task 0 Recovery che sposta file VOS misplaced (mai file project-specific)
- **Mai stack trace verso di me**: errori interpretati in italiano, stack trace originale in `state/errors.jsonl`

## Approvazioni mie esplicite richieste solo a:

- Task 0: prima di `mv` di file misplaced, mostrami cosa sposti
- Task 5 (cleanup `--execute`): prima di rimuovere file
- Task 12 (gate finale): conferma sistema funzionante

## Conferma comprensione prima di partire

In 6-8 righe italiano:
- Hai letto BLUEPRINT-JD-v3.4.md integralmente, in particolare sezioni 3.3 / 7.6 / 11 / 13bis
- Hai letto PROMPT-CC-SESSIONE-1.md e capisci i 13 task (0 Recovery + 1-12 esecuzione)
- Hai capito che lavori SOLO sulla Sessione 1, niente Sessione 2-6
- Hai capito il PBO: ricerca con dati prima di chiedermi cose
- Hai capito i vincoli: italiano, no PARTIAL, no install pesanti, no A/B/C, no codice progetti
- Hai capito che le mie approvazioni sono richieste a Task 0/5/12, mai altre

Poi attendi il mio "vai" prima di iniziare il Task 0.
