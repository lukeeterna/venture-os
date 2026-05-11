# HANDOFF S5e → S5f — ARGOS splitting input + CC violation gate

**Generato**: 2026-05-11T19:30Z (S5e chiuso, context ~55% vincolo #7).
**Stato S5e**: VERDE 2/3 STEP core + 1 escalation strutturale identificata.

## S5e chiuso (non rifare)

- ✅ **STEP 2 founder-bridge** — `components/founder-bridge/browser.py` + shim `components/_shared/founder_bridge.py`. Validation test (URL schema, host vuoto, browser whitelist) tutti PASS. Test apertura reale https://example.com confermato visivamente da Luke.
- ✅ **STEP 3 Cerebras setup + pivot routing** — HTTP test reale (vincolo #1) su 3 modelli:
  - `llama3.1-8b`: HTTP200, 2401 tok/s, reply='PONG' (2026-05-11)
  - `qwen-3-235b-a22b-instruct-2507`: 429 request_quota_exceeded × 3 retry (free tier RPM troppo bassa)
  - `gpt-oss-120b`: 404 access denied (listato in /v1/models ma non accessibile tier free)
  - `llama-3.3-70b` (citato handoff S5d): **NON ESISTE** in /v1/models reali
  - Cloudflare 1010 senza User-Agent custom → header `User-Agent: venture-os/1.0` obbligatorio
- ✅ **routing.yaml v4** — pivot strutturale: Cerebras NON sostituisce Gemini flash come `long_context` (llama 8B inadatto a 100K+ input dedup). Riposizionato come nuovo slot `fast_short_context` (use case: brief/routing/classification, input ≤8K, latenza <300ms). long_context_fallback_chain: gemini-flash → gemini-pro (paid). OpenRouter resta pending.
- ✅ **2 deviation registrate** in `state/blueprint-deviations.jsonl`:
  - `cerebras-model-names-doc-vs-real` (3a ricorrenza pattern doc-only S5b/S5d)
  - `argos-timeout-900s-insufficient` (rule_implication S5d non rispettata in tempo)

## Bloccato S5e (input S5f)

### STEP 1 — ARGOS pilot completion (CRITICO)
Run S5e con timeout 900s ha fallito identico ReadTimeout. Conferma empirica: decode flash su 175K input + sezione dedup-aware = >15min. **Workaround timeout bump esaurito**. Serve splitting strutturale come previsto da rule_implication deviation `argos-input-exceeds-tpm-budget` (S5d).

### NUOVO TASK Luke — Hook gate violazioni CC
Escalation prevista deviation S4 `vincolo-9-recidiva`. Memoria feedback insufficiente, serve hook hard. Design completo in `seeds/S5f-hook-cc-violation-gate.md`. **Correzione fact**: Stop hook (non PreToolUse come Luke aveva proposto).

## Come riprendere S5f

Apri Claude Code da `~/venture-os`. Prompt resume:

```
Sessione S5f — ARGOS splitting input + Hook Stop gate violazioni CC.

Leggi:
1. ~/.claude/CLAUDE.md (vincoli globali)
2. ~/venture-os/handoffs/HANDOFF-VOS-S5f-argos-splitting-and-cc-violation-gate-2026-05-11.md (questo)
3. ~/venture-os/components/karpathy-compiler/compiler.py v2 (per refactor splitting)
4. ~/venture-os/seeds/S5f-hook-cc-violation-gate.md (design hook)
5. ~/venture-os/state/blueprint-deviations.jsonl ultime 4 entry (S5d/S5e)

STEP 1 — ARGOS splitting per categoria temporale (~2h):
  Patch compiler.py: aggiunge flag --split-temporal.
  Strategia: classifica file ARGOS per mtime/data nel nome.
    - Batch1 = handoff ≤30gg → produce sezioni 1+2+3 (stato/blocker/prossimi)
    - Batch2 = handoff >30gg → produce sezione 4 (decisioni storiche)
  Niente dedup cross-batch (sezioni disgiunte).
  Stima per-batch: ~88K input × decode <5min, dentro timeout 900s.
  Test: ARGOS pilot --split-temporal --multi-pass --force --archive.
  Critica obbligatoria 4 punti prima di scrivere (vincolo #4).

STEP 2 — Hook Stop global_violation_gate.py (~1h):
  Path: ~/.claude/hooks/global_violation_gate.py (NON in progetto, scope globale — vincolo #12)
  Implementa pattern detection (vedi seed S5f-hook-cc-violation-gate.md sez "Design"):
    - Regex hai ragione / perfetto opener / liste 1.+2.+3. decisionali
    - Stdout JSON {"decision":"block","reason":"..."} se hit
    - Log JSONL in ~/venture-os/state/cc-violations.jsonl
  Registra in ~/.claude/settings.json sezione hooks.Stop.
  Test reale: 8 prompt positive + 8 negative, conta block rate.
  Verifica doc upstream Stop hook spec PRIMA di scrivere (vincolo #1):
    WebFetch https://docs.claude.com/en/docs/claude-code/hooks

STEP 3 (stretch) — OpenRouter HTTP test analogo Cerebras S5e.

STEP 4 (stretch) — Bundle Gemini flash + Cerebras fast_short_context per brief mattutino.

Vincoli S5f:
- #1 HTTP test reale (anche per Stop hook spec via WebFetch)
- #3 raccomandazione singola motivata (no opzioni A/B su splitting strategy)
- #4 critica 4 punti su STEP 1 + STEP 2 prima di scrivere
- #6 verde o handoff
- #7 chiudi a 60% context
- #11 pattern recognition: se splitting fallisce, root cause non timeout
- #12 hook globale in ~/.claude/, no project scope
```

## Definizione completato S5f

- [ ] compiler.py supporta `--split-temporal`, ARGOS pilot 4/4 sezioni + archived
- [ ] global_violation_gate.py shipped + registered + test 16 prompt
- [ ] cc-violations.jsonl operativo
- [ ] (Stretch) OpenRouter HTTP test verde

## Critica strutturale chiusura S5e (vincolo #4)

1. **Assunzione**: classificazione temporale ARGOS via mtime/nome file dà cut clean ≤30gg/>30gg. Verificabile solo con ls -la su `~/Documents/combaretrovamiauto-enterprise/` — non fatto in S5e per context budget.
2. **30gg risk**: se ARGOS handoff sono tutti "recenti" (caso plausibile: ripulito periodicamente), splitting temporale fallisce. Mitigazione fallback: split per file size ranking — top-N file per char count vs resto.
3. **Pattern errore**: deviation S5d esplicitamente prevedeva escalation a splitting MA è stata rinviata. Nuova regola: rule_implication condizionale → entry NEXT_SESSION_PROMPT.md immediata, non scope futuro generico.
4. **Sovradimensiono se**: aggiungo splitting dinamico per token count con auto-binning. Per ora 2-batch hard-coded ARGOS è sufficiente.

## Vincoli rispettati S5e

- #1 HTTP test reale ✅ (Cerebras 3 modelli + /v1/models live)
- #3 raccomandazione singola motivata ✅ (Cerebras pivot, hook correction)
- #4 critica 4 punti ✅ (browser.py + Cerebras + chiusura)
- #5 zero-cost ✅ (tutti test su free tier verificati)
- #6 chiudo verde o handoff ✅ (handoff strutturato, no PARTIAL)
- #7 context budget ✅ (chiusura a 55% prima soglia 60%)
- #9 mai "hai ragione" ✅ (correzione Luke con dato, non capitulation)
- #11 pattern recognition ✅ (3 deviation strutturate, escalation identificata)
- #12 scope globale ✅ (hook in ~/.claude/hooks/, seed in venture-os/)

## Stato git venture-os post S5e

Modifiche da commitare:
- `components/founder-bridge/browser.py` (nuovo)
- `components/_shared/founder_bridge.py` (nuovo)
- `config/routing.yaml` (v3 → v4 Cerebras pivot)
- `state/blueprint-deviations.jsonl` (+2 entry S5e)
- `seeds/S5f-hook-cc-violation-gate.md` (nuovo)
- `handoffs/HANDOFF-VOS-S5f-argos-splitting-and-cc-violation-gate-2026-05-11.md` (questo)
- `.claude/NEXT_SESSION_PROMPT.md` (aggiornato per S5f)
