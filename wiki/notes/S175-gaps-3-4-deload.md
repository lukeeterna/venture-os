# S175 — Gap #3 pipeline-runner + Gap #4 llm-router multi-role DELOAD

**Sessione**: S175 VOS coordinator
**Data**: 2026-05-15
**Predecessore**: S174 session-health implementato + heretic-retry-d23 deload
**Input**: VOS-COMPLETION-AUDIT-S172 ranking 4 gap critici, prompt resume S174 ultime righe

## Outcome

VOS-COMPLETION-AUDIT-S172 closure: **4/4 gap risolti**.

| Gap | Sessione | Esito |
|-----|----------|-------|
| decision-template | S173 | IMPLEMENTED (validator + template + Guardian backfill) |
| session-health | S174 | IMPLEMENTED (probe + briefer signal) |
| pipeline-runner | S175 | **DELOAD** — overlap ~85% con skill `gsd:*` |
| llm-router multi-role | S175 | **DELOAD** — no demand reale, speculative |

## Gap #3 pipeline-runner — DELOAD (overlap gsd:*)

### Verdetto

Pipeline-runner come componente VOS-core NON va implementato. Funzione coperta nativamente da skill `gsd:*` Anthropic-distributed (~/.claude/skills/).

### Overlap mapping

Audit S172 definiva pipeline-runner come "orchestratore phases discuss→plan→execute con commit atomici".

| Funzione richiesta | Skill `gsd:*` corrispondente |
|---|---|
| discuss→plan→execute autonomo | `gsd:autonomous` ("Run all remaining phases autonomously — discuss→plan→execute per phase") |
| Advance step automatico | `gsd:next` ("Automatically advance to the next logical step in the GSD workflow") |
| Wave-based parallel execution + commit atomici | `gsd:execute-phase` ("Execute all plans in a phase with wave-based parallelization") |
| Multi-phase command center | `gsd:manager` ("Interactive command center for managing multiple phases from one terminal") |
| Phase planning | `gsd:plan-phase` |
| Phase verification gate | `gsd:verify-work`, `gsd:validate-phase` |
| Atomic state tracking | `gsd:quick` ("atomic commits, state tracking"), `gsd:audit-uat` |

Overlap stimato: ~85%. Costruire pipeline-runner VOS-core = duplicare 10+ skill `gsd:*` mature distributed con Claude Code.

### Motivazione deload

Vincolo #4 punto 4 (sovradimensione): VOS-core deve essere infra-meta NON riproducibile da skill esterne. `gsd:*` già nel runtime di Luke, integrato con Claude Code, mantenuto upstream. Implementare wrapper Python VOS-only = lavoro che si auto-obsolesce alla prossima `gsd:update`.

Audit S172 stesso lo notava (§3, terza voce): "pipeline-runner: orchestrazione gate atomici. Utile per FLUXION/ARGOS execution, ma sovrapposto con skill `gsd:*` già disponibili. Terzo."

### Trade-off

Pro: zero LOC scritto, zero superficie da mantenere, allineamento con upstream Anthropic.
Contro: nessuno path VOS-only stand-alone se Luke perde accesso skill. Mitigazione: skill `gsd:*` sono filesystem-local in ~/.claude/skills/, backed up via claude-memory-backup componente VOS. Non dipendenti da rete Anthropic per esecuzione.

### Azione

NESSUNA. Pattern: gap "audit-listed" non implica gap "to-implement". Audit S172 va aggiornato (sezione 6 sotto).

## Gap #4 llm-router multi-role — DELOAD (no demand)

### Verdetto

Espansione llm-router a ruoli `reasoning` / `coding` / `vision` / `cheap` oltre attuale `long_context` + `fast_short_context` + `uncensored` NON va fatta in S175. La lista è S174-residual generic-LLM-thinking, non driven da use case VOS verificato.

### Analisi demand reale per ruolo proposto

| Ruolo proposto | Use case VOS reale | Copertura attuale | Demand verificato? |
|---|---|---|---|
| `reasoning` | Decisioni complesse cross-progetto | Gemini Flash + thinking budget basta | NO |
| `coding` | Generation codice VOS | Claude Code stesso (€240/mese paid) | NO — duplicazione |
| `vision` | ARGOS foto annunci, Guardian debug | Nessun consumer attivo nei components | NO |
| `cheap` | Bulk classification | `fast_short_context` Cerebras llama3.1-8b già copre | NO — overlap |

Audit consumer attivi llm_router (`components/_shared/llm_router.py`):
- `karpathy-compiler` → role=`long_context` (Gemini Flash 1M)
- `heretic-handler` → role=`uncensored` (dolphin + hermes fallback)
- `morning-briefer`, `tool-scout`, `routing-refresh` → NO LLM call diretta
- `decision-validator`, `session-health`, `host-monitor` → stdlib only

Tre consumer LLM su 13 componenti, tutti coperti. Zero feature roadmap VOS richiede LLM role nuovo.

### Motivazione deload

Vincolo #4 punto 1 (assunzione nascosta): "multi-role è necessario" è assunzione non verificata da consumer attivi. Aggiungere 4 ruoli speculativi = config bloat (226 righe → 400+) senza payoff misurabile.

Vincolo #10 (output verificato > verosimile): 4 entry YAML con `last_verified: real_http_call` su modelli mai chiamati da consumer reale = costo verifica HTTP senza beneficio.

Vincolo #5 (zero-cost): non hard-violato (free-tier candidate esistono), ma soglia €30/mese tracked in `state/costs.jsonl` resta su 3 chiamate/giorno Gemini Flash. Aggiungere ruoli speculative aumenta surface di drift quota.

### Trade-off

Pro: zero config bloat, zero entry da verificare HTTP, focus su consumer reali.
Contro: se domani ARGOS/FLUXION/Guardian inizia a richiedere vision o reasoning specifico, va aggiunto on-demand. Costo aggiunta singolo ruolo on-demand: ~30min (WebSearch candidate + HTTP verify + YAML entry + 1 consumer integration). Reversibile.

### Azione

Documenta in `routing.yaml` policy comment: "Add new role only when ≥1 component VOS attivo declares it as dependency. No speculative roles."

### Pattern recognition (vincolo #11)

Pattern S174-residual generic-LLM-thinking: alla chiusura S174 il prompt resume listava "reasoning/coding/vision/cheap" come obvious next expansion. È pattern "feature creep by template" — la categoria "LLM router multi-role" suggerisce ruoli generic comuni in stack moderni (es. Cline, Aider, Continue.dev) ma quei stack hanno consumer reali per ognuno (code completion → coding role; image input → vision role). VOS non ha (ancora) quei consumer.

Mitigazione duratura: policy "demand-driven role addition" da scrivere in routing.yaml header. Fatto in step 6.

## Step 6 — Update routing.yaml header policy

Aggiungere commento prima di `version: 5.1` (linea 13):

```yaml
# POLICY (S175): demand-driven role addition.
# Nuovo `role:` aggiunto SOLO quando ≥1 componente VOS attivo dichiara dependency
# nel proprio source. NO ruoli speculativi (reasoning/coding/vision/cheap) senza
# consumer reale. Verifica consumer prima di aggiungere:
#   grep -r "_resolve_chain(role='<NAME>')" components/
```

## Step 7 — Aggiornamento VOS-COMPLETION-AUDIT-S172

Sezione 2 tabella aggiornata con righe "RISOLTO S17X". Vedi diff `wiki/VOS-COMPLETION-AUDIT-S172.md`.

## Step 8 — Brief-actions log

```bash
echo '{"date": "2026-05-15", "brief_read": true, "action_taken": "S175-gap-3-4-deload", "source_match": false, "notes": "Gap #3 pipeline-runner deload (overlap gsd:* ~85%). Gap #4 llm-router multi-role deload (no demand reale, 0 consumer in 13 components). Audit S172 closure 4/4 (2 impl S173-S174 + 2 deload S175). Policy demand-driven role addition aggiunta a routing.yaml."}' >> ~/venture-os/state/brief-actions.jsonl
```

## Critica strutturale obbligatoria S175 (vincolo #4)

1. **Assunzione nascosta**: deload Gap #3 assume Luke continuerà a usare Claude Code + skill `gsd:*`. Se Luke disdice abbonamento o passa altro stack, pipeline-runner VOS-core diventa necessario. Mitigation: documentazione esplicita "VOS depends on gsd:* skills filesystem-local backed up via claude-memory-backup" → reversibile in 1 sessione se trigger fires.
2. **Cosa rompe a 30/60/90gg**: routing.yaml policy "demand-driven" è regola scritta nel commento header. Se in 90gg Luke (o futuro coordinatore) ignora il commento e aggiunge ruoli speculativi, drift ricomincia. Mitigation reale = enforcement non-policy: hook commit su config/routing.yaml che chiama `validate_routing.py` (NOT IMPL S175, defer). Per ora policy = nudge fail-soft.
3. **Pattern errori noti**: "audit-driven implementation" classicamente porta a costruire ciò che è elencato anche senza demand (es. enterprise feature matrices). VOS è venture-of-1 (Luke solo), demand-driven è l'unico filtro sostenibile. Pattern conferma vincolo #11 (root cause su pattern, non episodio).
4. **Dove sovradimensiono**: stavo per scrivere doc 400+ righe routing-multirole-strategy.md. Tagliato a 1 commento header + nota S175 (questo file). Compressione 90%.

## Vincolo founder rispettato

- Vincolo #3 (no A/B tecnico): decisioni CTO unilaterali entrambe motivate con dati (overlap %, consumer count).
- Vincolo #5 (zero-cost): zero costi aggiunti, anzi 0 entry HTTP-verify in più.
- Vincolo #6 (no PARTIAL): S175 chiude VERDE — 4/4 audit closure, decisioni documentate.
- Vincolo #11 (pattern recognition): pattern "audit-completion-bias" documentato + mitigation policy header.

## Flag aperti per S176

1. **disk-keeper trigger gap residuale**: oggi 15 mag triggered alle 17:00 manualmente. Audit S172 nota "mai eseguito post-S5", obsolete. Verificare se cron/LaunchAgent settimanale già installato; se no, installarlo.
2. **sara-gate-orchestrator STUB**: dipende da FLUXION self-hosted runner non attivato. Pre-revenue FLUXION = non bloccante. Resta STUB documented.
3. **OQ-02 Guardian deep research zero-cost client** (da S174 flag): scout `edge-inference-mobile`.
4. **OQ-01 Guardian pulizia smartphone scope**: discovery founder dedicata.
5. **routing.yaml validate hook**: enforcement policy "demand-driven role addition" via pre-commit hook (autocritica punto 2).
6. **Calibration session-health `CHARS_PER_TOKEN`**: defer fino primo falso positivo (da S174 flag).

## Prompt resume S176

```
Sessione S176 VOS. S175 chiuso VERDE — VOS-COMPLETION-AUDIT-S172 closure 4/4.
Gap #3 pipeline-runner deload (overlap gsd:* ~85%). Gap #4 llm-router multi-role
deload (no demand reale, 0/13 consumer). Policy demand-driven role addition
aggiunta a routing.yaml header.

LEGGI:
- /Volumes/MontereyT7/venture-os/wiki/notes/S175-gaps-3-4-deload.md
- /Volumes/MontereyT7/venture-os/wiki/VOS-COMPLETION-AUDIT-S172.md (sezione 2
  tabella aggiornata con risoluzioni)

TASK CANDIDATO RACCOMANDATO (decisione CTO, vincolo #3):
S176 = bilancia gap residuali. Due opzioni equivalenti come priorità:
(a) disk-keeper cron/LaunchAgent settimanale (operativo, ~30min)
(b) OQ-02 Guardian deep research zero-cost client edge-inference-mobile
    (vos-scout dedicata, ~45min)

Scelta CTO: (a) PRIMA. Motivo: operativo, deterministico, chiude STUB →
ATTIVO con trigger automatico. (b) è ricerca esplorativa che apre branch
non chiude. Sequenza: chiudi quello chiude prima.

NON FARE:
- Riapertura Gap #3 o #4 senza demand reale documentato
- Aggiungere ruoli routing.yaml senza consumer attivo
- ARGOS/FLUXION operations (workspace separate, vincolo memory split)

VINCOLI: CLAUDE.md v1.1 invariati.
```
