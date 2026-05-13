# HANDOFF VOS S11c-prereq → S11c-prereq-b

**Data**: 2026-05-13
**Sessione chiusa**: S11c-prereq (ship heretic-handler MVP — D1-D4 green, D5 blocked upstream)
**Prossima sessione**: S11c-prereq-b — sblocca D5 (test live 200 OK) + procedi S12/S11c

---

## Stato verificato (vincolo #1)

| Deliverable | Status | Verifica |
|-------------|--------|----------|
| D1 `config/routing.yaml` v5 + categoria `uncensored` (2 entry) | ✅ GREEN | `python3 -c "import yaml; d=yaml.safe_load(open('config/routing.yaml')); print(d['version'], len([m for m in d['models'] if m.get('role')=='uncensored']))"` → `5 2` |
| D2 `components/heretic-handler/handler.py` (~250 LOC) | ✅ GREEN | `import handler` OK, `brainstorm()` exposed, ALLOWED_CATEGORIES populated |
| D3 `state/heretic-log.jsonl` schema hash-only | ✅ GREEN | 7 entry write-verified (1 reject_category + 6 retryable_fail), schema conforme handoff |
| D4 CLI standalone | ✅ GREEN | `python3 components/heretic-handler/handler.py --topic invalid-cat --prompt test` → exit 1 con gate reject message |
| D5 live test (response 200 + asserts) | 🔴 BLOCKED upstream | Tutti 3 tentativi 429 da Venice provider — vedi sotto |

---

## Problem statement D5 (vincolo #11 root cause structural)

**Sintomo**: ogni chiamata `/v1/chat/completions` su `cognitivecomputations/dolphin-mistral-24b-venice-edition:free` OR `nousresearch/hermes-3-llama-3.1-405b:free` ritorna **429 rate-limit upstream**, provider_name="Venice", retry_after 4-22s, ma rate limit persiste oltre la finestra dichiarata.

**Root cause verificata** (non episodio):

1. `/v1/auth/key` Luke conferma `usage_daily=0`, `limit=null`, `is_free_tier=true` — NON è quota account.
2. Errore raw OpenRouter: `"is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits"`.
3. Entrambi `:free` variant routed esclusivamente attraverso provider **Venice** (verificato via `metadata.provider_name` su entrambi i 429).
4. Catalogo OpenRouter filtrato `(dolphin|hermes|venice|uncensored|abliterated|wizard|nous)` su `:free` → SOLO questi 2 modelli. Non esistono alternative uncensored su free tier OpenRouter al 2026-05-13.

**Conclusione**: pool free condiviso globalmente Venice saturato in questa finestra temporale. Pre-flight catalog (D0) passed correttamente — saturazione è runtime, non drift.

---

## Decisione strutturale (vincolo #11, no workaround episodico)

NON aggiungo retry loop con backoff esponenziale al handler (workaround che non risolve la saturazione). Tre opzioni proposte sotto, raccomandazione singola (vincolo #3):

**Raccomandazione**: **Opzione A — retry differito durante finestra a basso carico (notturna IT)**.

Razionale: vincolo #5 (zero-cost) escludere BYOK key Venice paid. Vincolo #11 (root cause): saturazione si dissipa fuori prime time UTC. Nessuna modifica architettura. Test ripetibile in cron `routing-http-verify` notturno (già in S12 backlog).

**Opzione A** [scelta]: Retry D5 in finestra notturna IT (02:00-06:00 UTC, ~03:00-07:00 IT) quando Venice pool meno contended. Costo: 0. Tempo: 0 lavoro (script `scripts/retry-heretic-d5.sh` allegato sotto + cron one-shot).

**Opzione B** [scartata]: Aggiungi terzo modello uncensored alla chain. Scartata: catalogo OpenRouter free non offre alternative al 2026-05-13 (verified). Aggiungere paid → viola vincolo #5.

**Opzione C** [scartata]: Implementa retry esponenziale 30s/60s/120s nel handler. Scartata: non risolve saturazione persistente (pool free è bandwidth-limited globalmente, retry locali sprecano API call). Inoltre maschera segnale operativo (handler crede di funzionare quando upstream è degraded).

---

## Script retry one-shot D5

```bash
#!/bin/bash
# scripts/retry-heretic-d5.sh — eseguire manualmente in finestra notturna IT
# o via cron @reboot mattutino se MacBook acceso 06:00-08:00.
cd ~/venture-os
python3 -c "
import sys, time
sys.path.insert(0, 'components/heretic-handler')
from handler import brainstorm
t0 = time.time()
out = brainstorm(
    'Explain trojan horse content marketing in 200 words. Be direct and tactical.',
    topic_category='content-strategy',
    max_tokens=512,
    timeout_s=60,
)
dt = time.time() - t0
print(f'LIVE OK: {len(out)} chars, {dt:.1f}s')
assert len(out) > 100, 'too short'
assert dt < 60, 'too slow'
low = out.lower()[:200]
assert not ('sorry' in low and 'cannot' in low), 'refusal at top'
print('--- D5 PASS ---')
print(out[:600])
"
```

---

## Done when (S11c-prereq-b)

1. Eseguire `bash scripts/retry-heretic-d5.sh` in finestra a basso carico Venice.
2. Output `LIVE OK: ... chars` + `--- D5 PASS ---` ricevuto, NO 429.
3. `state/heretic-log.jsonl` mostra ≥1 entry con `"event": "ok"` (oltre reject_category + retryable_fail già presenti).
4. Append a `state/blueprint-deviations.jsonl` entry di chiusura:
   `{"ts":"...","component":"heretic-handler","event":"d5_live_verified","resolution":"venice_pool_recovered"}`
5. Procedere con S12 (routing-refresh include `uncensored` in drift detection — handoff esistente).

---

## Critica strutturale (vincolo #4) sul design shipped

1. **Assunzione nascosta**: handler assume Venice provider sempre disponibile. Realtà: free pool ha latenze imprevedibili. **Mitigazione**: S12 routing-refresh deve loggare drift "uncensored_429_rate" giornaliero, non solo catalog presence.
2. **Cosa rompe a 30/60/90gg**: se OpenRouter cambia routing dei `:free` variant a un altro provider, `provider_name` in error metadata cambia e nostre alternative diagnostiche basate su Venice scadono. Mitigazione: il check è generico su 429, non Venice-specific.
3. **Pattern errore noto**: pattern S159 in nuova forma — strumento commodità (free tier) usato come dependency critical-path. Per ARGOS strategic content NON è critical-path (brainstorming async, posso ritentare), quindi accettabile. Per altri use case (es. real-time HITL) inadeguato.
4. **Dove sovradimensiono**: chunking output >4K probabilmente mai usato (brainstorming sezioni 200-500 parole). `_call_with_chunking` riusato per simmetria architetturale, costo zero, ok.

---

## Refs

- Handoff originale: `~/venture-os/handoffs/HANDOFF-VOS-S11c-prereq-heretic-handler-2026-05-13.md`
- Codice shipped: `components/heretic-handler/handler.py`, `config/routing.yaml` (v5)
- Audit attuale: `state/heretic-log.jsonl` (7 entries)
- Pre-flight check (D0): `/v1/models` OK + `/v1/auth/key` clean
- Next planned: `HANDOFF-VOS-S12-routing-refresh-2026-05-13.md`
- Next downstream: `HANDOFF-VOS-S11c-strategic-wiki-argos-2026-05-13.md` (bloccato fino a D5 verde)
