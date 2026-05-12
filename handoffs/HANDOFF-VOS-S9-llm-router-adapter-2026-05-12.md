# HANDOFF VOS S8 → S9

**Data**: 2026-05-12
**Sessione chiusa**: S8 (routing HTTP verify + nexu-io eval + OpenRouter setup + ARGOS S163 sanitizer)
**Prossima sessione**: S9 — LLM Router Adapter

---

## Prossimi step (3 task, in ordine)

### 1. S9 OpenRouter integration adapter (PRIMARY, sblocca S10)

Usare la chiave OpenRouter setupata in S8 (`~/.claude/.env.free-gpu`,
verified 5/5 in `routing-http-verify.py`). Scrivere
`~/venture-os/components/_shared/llm_router.py` che:

- Legge `~/venture-os/config/routing.yaml`
- Prova primary → fallback chain (`gemini-flash` → `openrouter-llama-3.3-70b`
  → `gemini-pro` per `long_context`)
- Gestisce **chunking output per OpenRouter** (cap `output_tokens_max=4096`
  vs Gemini `65536`) — adapter deve concatenare multiple chunked completions
  se prompt richiede output >4K tokens
- Tracking costo in `~/venture-os/state/costs.jsonl` per ogni chiamata
- Circuit breaker su provider (3 fail in 5 min → skip, coerente con
  CLAUDE.md ARGOS security rules)

Test gate verde: compilation Karpathy ARGOS handoff 14693 righe →
`COMPILED-STATE.md` ≤500 righe, output coerente, fallback chain triggered
almeno una volta in test fault-injection (Gemini quota simulata exhausted).

### 2. S10 Karpathy compilation Sessione 4 Fase C (UNBLOCKED da S9)

3 progetti con handoff debt sopra soglia (brief mattutino 2026-05-12):
- **ARGOS**: 14693 righe (soglia 2000) — surplus 12693
- **FLUXION**: 3277 righe (soglia 2000) — surplus 1277
- **Guardian**: 16398 righe (soglia 1500) — surplus 14898

Adapter S9 abilita la pipeline. Output per ogni progetto:
- `wiki/projects/<NAME>/COMPILED-STATE.md` ≤500 righe (stato attuale verificato
  + decisioni chiuse + blocker aperti + prossimi passi)
- Archive vecchi handoff in `wiki/raw/archived-handoffs/<project>/<data>/`

Sessioni successive dei 3 progetti partono leggendo solo `COMPILED-STATE.md`,
non più i 35K+ righe accumulate.

### 3. Pre-flight blacklist update (BACKLOG, non blocking)

Aggiungere a `~/venture-os/config/preflight-blacklist.yaml`:
- `node>=24` — wheel/binary richiede macOS 13.5+ (verified S8 nexu-io eval)
- `next>=16` — pulla node 24 transitively
- (NB pyobjc-framework-Vision NON va in blacklist — funziona su Big Sur,
  S163 ha verified `macosx_10_13_universal2` wheel cp311/cp313)

Pattern S163 deve essere riproducibile (Vision Framework drop-in OCR su
Big Sur), pattern S8 nexu-io critique deve essere enforced (stack Node 24
modern incompat Big Sur).

---

## Raccomandazione singola

**Prossima sessione = S9 LLM router adapter.**

Sblocca S10 Karpathy che è hard-blocker per i 3 progetti (brief mattutino
2026-05-12 segnala compilation raccomandata su tutti e 3). Senza adapter,
openrouter è solo `verified` in `routing.yaml` ma inutilizzato runtime.

---

## Stato chiusura S8 (per audit S9)

- `routing.yaml v4`: 5/5 verified, fallback chain estesa
- `routing-http-verify.py`: nuovo script stdlib, riusabile per S5g+
- `OPENROUTER_API_KEY` scope VOS in `~/.claude/.env.free-gpu` (chmod 600)
- `blueprint-deviations.jsonl`: 3 entry S8 (brief premise inaccurate,
  nexu-io eval verdict, openrouter setup)
- `brief-actions.jsonl`: 2026-05-12 entry chiusa
- ARGOS S163 scope-extension committato `master` (`13e24d0` + `23d120a`),
  non pushed
- Auto-memory globale: `feedback_vision_framework_bigsur_ocr.md` aggiunto a
  `MEMORY.md`

Tutto verde, nessun PARTIAL.
