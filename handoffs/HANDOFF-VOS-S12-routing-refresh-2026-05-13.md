# HANDOFF VOS S11 → S12

**Data**: 2026-05-13
**Sessione chiusa**: S11 (loop validation + FASE 3.2 RESOLVED-DEDUP + B4 RESOLVED-MITIGATED)
**Prossima sessione**: S12 — FASE 3.1 `routing-refresh` componente notturno

---

## Stato post-S11

Roadmap VOS aggiornata (`~/venture-os/ROADMAP.md`):
- FASE 1 ✅ chiusa
- FASE 2: 2.1 ✅ (S8), 2.3 ✅ (S7), 2.2 blocked (baseline cc-violations 7gg matura **2026-05-18**, oggi 2026-05-13 → 5gg)
- FASE 3: 3.2 ✅ RESOLVED-DEDUP (S11), 3.3 ✅ chiusa (S6), **3.1 = unico open item strutturale**
- Backlog: B4 ✅ RESOLVED-MITIGATED (S11), B5 ✅ shipped (S7), B2 humanizer captured

Loop end-to-end Karpathy compilation verificato S11:
- ARGOS 14693 → 0 righe, FLUXION 3277 → 41 (auto-rigenerato sub-threshold), Guardian 16398 → 0
- Brief domani non genererà alert "compilation Karpathy raccomandata"

`llm_router.complete(role='long_context')` (S9) production-validated da S10: 12 call Gemini-flash, fb_depth=0, zero-cost.

---

## Goal S12

Implementare `routing-refresh` notturno citato in CLAUDE.md (sez. "Vincoli invarianti") ma non esistente. Componente VOS che ogni notte (RunAtLoad, pattern operativo Luke):
1. Interroga `/v1/models` (o equivalente) di 3 provider: Gemini, Cerebras, OpenRouter
2. Confronta catalogo live vs entries in `~/venture-os/config/routing.yaml`
3. Log delta in `~/venture-os/state/routing-drift.jsonl` (mai modifica routing.yaml auto — gate manuale Luke)
4. Brief mattutino segnala drift se presente

---

## Approccio raccomandato (vincolo #3, singola)

**Componente**: `~/venture-os/components/routing-refresh/refresher.py`
**Stack**: stdlib only (urllib.request) + pyyaml. NO requests (memo: vincolo #8 mantenere deps minime, llm_router già usa urllib).
**Auth**: riusa `_load_env_file(~/.claude/.env.free-gpu)` da llm_router → keys condivise.
**Endpoints verificati S8**:
- Google: `https://generativelanguage.googleapis.com/v1beta/models?key=<KEY>` → JSON `{ "models": [{"name": "models/gemini-2.5-flash", ...}, ...] }`
- Cerebras: `https://api.cerebras.ai/v1/models` con header `Authorization: Bearer <KEY>` → OpenAI-compat `{ "data": [{"id": "llama3.1-8b", ...}, ...] }`
- OpenRouter: `https://openrouter.ai/api/v1/models` con header `Authorization: Bearer <KEY>` → `{ "data": [{"id": "meta-llama/llama-3.3-70b-instruct:free", ...}, ...] }`

Riusa pattern da `~/venture-os/scripts/routing-http-verify.py` (S8) che già fa esattamente questo verify cycle — `routing-refresh` è la versione LaunchAgent-ized + drift JSONL.

**Schema `state/routing-drift.jsonl` (append)**:
```json
{"ts": "...", "provider": "google", "drift_type": "model_removed", "model_id": "gemini-1.5-flash", "details": "presente in routing.yaml ma non in /v1beta/models"}
{"ts": "...", "provider": "openrouter", "drift_type": "model_added", "model_id": "...", "details": "presente live ma non in routing.yaml — valutare add"}
{"ts": "...", "provider": "google", "drift_type": "field_change", "model_id": "gemini-2.5-flash", "details": "input_tokens_max in catalog=1048576 vs yaml=1000000"}
```

3 drift_type: `model_removed`, `model_added`, `field_change`. Tutti append-only.

**LaunchAgent**: `~/Library/LaunchAgents/com.luke.vos.routing-refresh.plist`
- RunAtLoad=true (pattern Luke MacBook saltagiorni)
- Workingdirectory=`/Volumes/MontereyT7/venture-os`
- StandardOutPath: **NIENTE su /Volumes/** (memo `feedback_launchd_volumes_fda.md` — EX_CONFIG 78). Usa `/Users/macbook/.claude/logs/routing-refresh.{out,err}`
- ProgramArguments: `["/usr/local/bin/python3", "components/routing-refresh/refresher.py"]`

**Brief integration**: edit `briefer.py` per leggere ultima entry per provider in `routing-drift.jsonl` (window 24h), se conta drift > 0 → aggiungere a sez. Segnali: `routing-drift: <provider> N entries — review state/routing-drift.jsonl`.

---

## Test sequence S12

1. **Pre-flight**: verifica 3 chiavi presenti in `~/.claude/.env.free-gpu` (GOOGLE_API_KEY, CEREBRAS_API_KEY, OPENROUTER_API_KEY). Già OK da S8/S9.
2. **Scrittura `refresher.py`**: ~200-250 LOC stdlib. Funzioni: `fetch_catalog_google()`, `fetch_catalog_cerebras()`, `fetch_catalog_openrouter()`, `compute_drift()`, `append_drift_jsonl()`, `main()`.
3. **Dry-run live (no append)**: `python3 refresher.py --dry-run` → stampa drift detected senza scrivere JSONL.
4. **Real run** primo snapshot: scrive `routing-drift.jsonl` con drift iniziale. Aspettativa: 0 drift su modelli `last_verified=2026-05-12 method=real_http_call`. Eventuali drift = signal reale.
5. **Test drift simulato**: backup routing.yaml, edit aggiunto fake model `gemini-fake-9000` → re-run → verifica entry `model_removed` appende correttamente. Restore.
6. **LaunchAgent install**: `launchctl load -w ~/Library/LaunchAgents/com.luke.vos.routing-refresh.plist`. Verifica `launchctl list | grep routing-refresh` → loaded.
7. **Brief integration**: edit `briefer.py`, test con drift fittizio inserito a mano → brief mostra "routing-drift: 1 entries".
8. **Cleanup**: rimuovi entry test, brief torna pulito.

---

## Vincoli per S12

- **#1 fattualità**: endpoint shape già verificato S8 (`scripts/routing-http-verify.py:`). Non re-inventare HTTP test, riusa pattern.
- **#5 zero-cost**: `/v1/models` è gratuito su tutti e 3 provider (no inference token consumption). Nessun rischio quota.
- **#6 mai PARTIAL**: 6 test sequence sono atomi indipendenti. Se test 5 (drift simulato) o test 6 (LaunchAgent install) fail → chiudere comunque commit con quanto verde + handoff S12b.
- **#7 context budget**: dopo test 4 (real run primo snapshot) controllo `/context`. Se >50% → spezzare in S12 (componente + dry-run) + S12b (LaunchAgent + brief integration).
- **#8 no libs blacklist**: stdlib `urllib.request` + `json` + `yaml`. Niente `requests` (già evitato in llm_router).

---

## Pre-flight S12 obbligatorio

```bash
# 1. Verifica 3 keys presenti
grep -c "^GOOGLE_API_KEY=\|^CEREBRAS_API_KEY=\|^OPENROUTER_API_KEY=" ~/.claude/.env.free-gpu
# Atteso: 3

# 2. Verifica routing-http-verify.py esiste (pattern riusabile)
ls -la ~/venture-os/scripts/routing-http-verify.py
# Atteso: file presente

# 3. Live ping Gemini (no quota burn, prompt nullo)
source ~/.claude/.env.free-gpu && curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_API_KEY" | head -c 200
# Atteso: JSON che inizia con {"models":[

# 4. Verifica ~/.claude/logs/ directory esiste (StandardOutPath LaunchAgent)
ls -la ~/.claude/logs/ 2>&1 | head -3
# Se mancante: mkdir prima del plist install
```

Se uno fail: STOP, debug. Non procedere con scrittura componente.

---

## Refs

- `~/venture-os/components/_shared/llm_router.py` (pattern provider classes)
- `~/venture-os/scripts/routing-http-verify.py` (HTTP test cycle riusabile)
- `~/venture-os/config/routing.yaml` v4 (input per diff)
- `~/venture-os/components/morning-briefer/briefer.py:307-310` (pattern lettura JSONL segnali → brief)
- `~/venture-os/state/blueprint-deviations.jsonl` (audit deviazioni)
- `~/.claude/projects/-Users-macbook/memory/feedback_launchd_volumes_fda.md` (vincoli plist su /Volumes/)
- `~/.claude/projects/-Users-macbook/memory/user_pattern_operativo_macbook.md` (RunAtLoad mai schedule fissi)

---

## Done when

- `components/routing-refresh/refresher.py` shipped, syntax OK, dry-run + real run verde
- `state/routing-drift.jsonl` esiste con ≥1 entry (anche se "no drift detected" come marker)
- `Library/LaunchAgents/com.luke.vos.routing-refresh.plist` loaded, `launchctl list` conferma
- `briefer.py` consuma drift, test brief mostra entry quando drift simulato
- Commit con message `S12: routing-refresh notturno shipped` + ROADMAP aggiornato FASE 3.1 ✅
- Deviation `routing-refresh-shipped-FASE-3.1-closed` in `blueprint-deviations.jsonl`
- VOS roadmap completamente chiusa (post-S12 non resta nulla strutturale, solo FASE 2.2 post-baseline)
