# HANDOFF VOS S9 → S10

**Data**: 2026-05-12
**Sessione chiusa**: S9 (llm-router adapter verde, 3/3 test PASS)
**Prossima sessione**: S10 — Karpathy compilation Sessione 4 Fase C

---

## Stato post-S9

`~/venture-os/components/_shared/llm_router.py` (598 LOC) operativo:
- `complete(prompt, role='long_context', system=None, max_output_tokens=None, temperature=0.0, stream=False, timeout_s=600) -> str`
- Fallback chain runtime da `routing.yaml` defaults: gemini-flash → openrouter-70b → gemini-pro
- Provider classes: `GoogleProvider`, `OpenAICompatProvider` (openrouter+cerebras)
- Errori: `_ProviderFatal` (4xx non-quota → raise) vs `_ProviderRetryable` (429/5xx/timeout → next)
- Eccezione: `missing_key` degradato a retryable (consente fallback se solo una key manca)
- Output chunking automatico se `max_output_tokens > provider.output_tokens_max` (OpenRouter 4096 cap)
- Circuit breaker in-process: 3 fail/5min → skip 10min (deferred file-state a S9b se serve)
- Cost tracking append `state/costs.jsonl` per ogni call: ts, role, provider, model, input_tokens, output_tokens, cost_usd, latency_ms, fallback_depth, chunk_rounds

**Findings produzione** (vedi `state/blueprint-deviations.jsonl` ts=2026-05-12T16:31):
- `meta-llama/llama-3.3-70b-instruct:free` è frequentemente 429 upstream-throttled (provider Venice, Retry-After 17s). Catalog OK, ma free-tier produzione inaffidabile. Per S10 single Karpathy call: Gemini-flash primary basta (3 call/settimana << 250 RPD).

---

## Goal S10

Eseguire compilation Karpathy sui 3 progetti con handoff debt sopra soglia (brief 2026-05-12):
- **ARGOS**: 14693 righe (soglia 2000) — surplus 12693
- **FLUXION**: 3277 righe (soglia 2000) — surplus 1277
- **Guardian**: 16398 righe (soglia 1500) — surplus 14898

Output per ogni progetto:
- `wiki/projects/<NAME>/COMPILED-STATE.md` ≤500 righe (4 sezioni: Stato/Decisioni/Blocker/Prossimi)
- Archivio originali in `wiki/raw/archived-handoffs/<project>/2026-05-12/`

---

## Approccio raccomandato

**Opzione A (preferita): refactor `compiler.py` per usare router.**
`components/karpathy-compiler/compiler.py:290` ha `call_gemini()` interno che parla diretto a generativelanguage.googleapis.com. Sostituire con import + `complete()` di router.

```python
# da:
from karpathy-compiler.compiler import call_gemini
response = call_gemini(model, sys_prompt, up, api_key)
text = extract_text(response)

# a:
sys.path.insert(0, '../_shared')
from llm_router import complete
text = complete(prompt=up, role='long_context', system=sys_prompt,
                max_output_tokens=model.get('output_tokens_max'))
```

Cancellare `call_gemini`, `extract_text`, `extract_usage`, `_parse_retry_delay` (logica spostata in router). Cost tracking in `costs.jsonl` ora viene scritto 2 volte (router + compiler `log_cost`): rimuovere `log_cost(compiled)` dal compiler, basta router entry. Aggiungere event="karpathy-compiled" come secondo append separato se serve metric progetto-level.

**Opzione B (minima invasività)**: NON refactor, solo run come-è. Compiler già funziona standalone S5e+. Test S9 dimostra che router è equivalente. Skip refactor, dichiarare S10=run-only.

Preferenza A per validare router su carico reale (ARGOS 175K tok input). Se A fallisce → B come fallback.

---

## Test sequence S10

1. **Refactor compiler.py** (Opzione A) — ~30 min, diff piccolo.
2. **Dry-run su FLUXION** (più piccolo): `python3 compiler.py --project FLUXION --dry-run` per validare prompt size + token estimate.
3. **Real run FLUXION** con `--multi-pass`: ~60K tok input, 4 call multi-pass. Spot-check `COMPILED-STATE.md` ≤500 righe, 4 sezioni complete.
4. **Real run Guardian** con `--multi-pass`: simile dimensione, validare seconda volta.
5. **Real run ARGOS** con `--multi-pass --split-temporal` (175K tok richiede split, deviation S5e). Multi-pass + split-temporal sono già implementati in compiler.py:225-449.
6. **Archive originali** solo dopo spot-check umano OK: `--archive` flag richiede output non-truncato + 4/4 sezioni (gating S5c).

---

## Vincoli per S10

- **#1 fattualita**: Spot-check obbligatorio prima `--archive`. Vincolo S5c già in compiler.py:548-554.
- **#6 mai PARTIAL**: se ARGOS 175K supera timeout 900s nonostante split-temporal, chiudere ARGOS-only handoff S10b, FLUXION+Guardian devono chiudere verde.
- **#7 context budget**: monitora `/context` ogni 5 turni. ARGOS spot-check di 500 righe consuma context — se prima di ARGOS sei >50%, chiudi e fai ARGOS in sessione dedicata.

---

## Refs

- `~/venture-os/components/_shared/llm_router.py` (S9 deliverable)
- `~/venture-os/components/karpathy-compiler/compiler.py` (target refactor)
- `~/venture-os/config/routing.yaml` v4
- `~/venture-os/config/handoff-debt-config.yaml` (pattern glob per progetto)
- `~/venture-os/state/blueprint-deviations.jsonl` (deviation S9 logged)
- `~/venture-os/state/costs.jsonl` (entry router post-S9)

---

## Pre-flight S10 obbligatorio

```bash
# 1. Verifica router import + chain resolution
cd ~/venture-os && python3 -c "
import sys; sys.path.insert(0, 'components/_shared')
import llm_router
chain = llm_router._resolve_chain(llm_router._load_routing(), 'long_context')
print('chain:', [m['model_id'] for m in chain])
"

# 2. Verifica Gemini-flash live (no quota burn, prompt 5 tok)
cd ~/venture-os && python3 -c "
import sys; sys.path.insert(0, 'components/_shared')
import llm_router
print(llm_router.complete('Reply with: OK', max_output_tokens=10))
"

# 3. Verifica config debt
cat ~/venture-os/config/handoff-debt-config.yaml
```

Se uno dei 3 fallisce: STOP, debug prima di toccare i 3 progetti.
