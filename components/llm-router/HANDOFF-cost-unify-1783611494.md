# HANDOFF — Unificazione tabella costi plan_execute.py (routing.yaml come fonte primaria)

- **Data**: 2026-07-09
- **Stato**: STOP al GATE FASE 1 — DIVERGE. FASE 2 (build) NON eseguita.
- **File modificati**: NESSUNO. `plan_execute.py` integro (py_compile OK), backup `plan_execute.py.bak-1783611494` (32266 byte) disponibile. Nessun rollback necessario.

## Mandato
Eliminare duplicazione `ROLE_COST_PER_1K_TOKEN` in `plan_execute.py`: fonte primaria costi = `routing.yaml` (come shim modelli S181). Fatto terminale = EQUIVALENZA stime pre-flight (stesso piano → stessa stima). Cambiare le stime silenziosamente = fallimento da impedire.

## Cosa è stato verificato (direttamente su disco, non solo subagent)
- **Consumatore unico**: `_estimate_cost_usd()` (plan_execute.py:124-134) → **budget gate BLOCCANTE** in `execute_plan()` (629-643), soglia `COST_BLOCK_THRESHOLD=1.00` USD (riga 89). Warn non-bloccante 0.10 (riga 88).
- **Tabella hardcoded** (plan_execute.py:79-85): long_context 0.0 | cheap 0.0 | code_review 0.00032 | code_gen 0.00040 | reasoning 0.00125 (per-1K blended).
- **routing.yaml reale = `config/routing.yaml`** (NON `components/llm-router/`). Usa `cost_per_1m_in`/`cost_per_1m_out` (per-1M, split in/out):
  - code_review & reasoning → `deepseek/deepseek-chat` = 0.32 in / 0.89 out.
  - cheap & long_context → `gemini-2.5-flash` = 0.0 / 0.0.
  - **code_gen: NESSUNA entry** (0 occorrenze). `code_gen` assente anche da `MODEL_TARGET_TO_ROLE` (58-66) → irraggiungibile da dispatch vivo, solo mock (riga 292).

## Matrice (verificata)
| role | pre /1K | routing in/out /1M | post input-only /1K | post blended /1K | verdict |
|---|---|---|---|---|---|
| long_context | 0.0 | 0.0/0.0 | 0.0 | 0.0 | MATCH |
| cheap | 0.0 | 0.0/0.0 | 0.0 | 0.0 | MATCH |
| code_review | 0.00032 | 0.32/0.89 | 0.00032 | 0.00121 | DIVERGE (convenzione-dipendente) |
| reasoning | 0.00125 | 0.32/0.89 | 0.00032 | 0.00121 | DIVERGE sotto ENTRAMBE |
| code_gen | 0.00040 | — nessuna entry — | — | — | UNRESOLVABLE (solo mock) |

## Perché STOP (decisione riservata a giudice+Luke)
1. **Convenzione conversione indefinita**: code_review combacia SOLO con input-only; con blended diverge 3.8×.
2. **reasoning diverge sotto qualsiasi convenzione**: hardcoded 0.00125/1K = input di **gemini-2.5-pro** (routing.yaml:150), NON di deepseek a cui reasoning risolve. Il commento riga 84 "Gemini 2.5 Pro" è coerente col numero ma NON col modello risolto. Switch → cambia silenziosamente la stima reasoning = fallimento esatto da prevenire.
3. code_gen: nessuna entry routing.yaml (non-bloccante perché solo mock, ma la `_FALLBACK` dovrebbe conservarlo).

## Decisioni necessarie PRIMA di FASE 2 (giudice + Luke)
- **D1**: convenzione costo pre-flight = input-only oppure blended (in+out)? (`_estimate_cost_usd` usa un singolo numero × 2K token; routing.yaml è split.)
- **D2**: per `reasoning`, quale fonte vince — il numero hardcoded (gemini-2.5-pro 1.25/M) o il modello realmente risolto (deepseek 0.32/0.89)? Sono numeri e modelli diversi.
- **D3**: `code_gen` — confermare che resti solo in `_FALLBACK_ROLE_COST` (nessuna entry routing.yaml, nessun dispatch vivo).

## Prompt di resume
> Riapri il mandato "unificazione costi plan_execute → routing.yaml". FASE 0/0bis/1 già fatte, gate = DIVERGE (vedi questo handoff). Con le decisioni D1 (convenzione input-only vs blended), D2 (fonte reasoning: hardcoded vs deepseek risolto), D3 (code_gen fallback-only) già prese da giudice+Luke, procedi a FASE 2: risoluzione costi via `config/routing.yaml` riusando il modulo `_shared` dello shim S181; rinomina la vecchia tabella `_FALLBACK_ROLE_COST` con commento `# fallback-only, fonte primaria routing.yaml`, usata solo su risoluzione fallita. Verifica i 5 fatti terminali del mandato (py_compile, matrice pre/post IDENTICA data la convenzione scelta, dry-run pre-flight stima identica ZERO chiamate LLM, fail-safe con routing.yaml non leggibile → _FALLBACK, backup per stat). accept-edits OFF.

## FASE 0bis — nota settings.json
`permissions.defaultMode` supportato su CC 2.1.110; chiave ASSENTE = avvio in "ask"/default = accept-edits GIÀ OFF. NON scritto nulla (goal già soddisfatto + incertezza enum + Rule 1d su file boot-critical).
