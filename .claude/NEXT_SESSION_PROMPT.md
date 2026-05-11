# NEXT SESSION — VOS S5f

**Auto-close S5e**: 2026-05-11T19:35Z, context ~58% (vincolo #7).
**Stato S5e**: VERDE 2/3 STEP. STEP 2 founder-bridge + STEP 3 Cerebras shipped. STEP 1 ARGOS bloccato strutturalmente → splitting S5f.

## Riassunto S5e

- ✅ STEP 2 — founder-bridge component (browser.py + shim) + test reale verde
- ✅ STEP 3 — Cerebras HTTP verified, routing.yaml v4 con pivot strutturale (fast_short_context vs long_context)
- ✅ Deviation `cerebras-model-names-doc-vs-real` (3a ricorrenza doc-only) + `argos-timeout-900s-insufficient`
- ❌ STEP 1 ARGOS — timeout 900s confermato insufficiente, serve splitting input
- 🆕 NUOVO Luke — seed S5f hook Stop gate violazioni CC

## Prompt resume S5f

```
Sessione S5f — ARGOS splitting input + Hook Stop gate violazioni CC.

Leggi:
1. ~/.claude/CLAUDE.md (vincoli globali)
2. ~/venture-os/handoffs/HANDOFF-VOS-S5f-argos-splitting-and-cc-violation-gate-2026-05-11.md
3. ~/venture-os/components/karpathy-compiler/compiler.py v2 (per refactor splitting)
4. ~/venture-os/seeds/S5f-hook-cc-violation-gate.md (design hook completo)
5. ~/venture-os/state/blueprint-deviations.jsonl ultime 4 entry (S5d/S5e)

STEP 1 — ARGOS splitting per categoria temporale (~2h):
  Patch compiler.py: flag --split-temporal.
  Strategia: classifica file ARGOS per mtime.
    - Batch1 = handoff ≤30gg → sezioni 1+2+3 (stato/blocker/prossimi)
    - Batch2 = handoff >30gg → sezione 4 (decisioni storiche)
  Stima per-batch: ~88K input × decode <5min, dentro timeout 900s.
  Test: python3 components/karpathy-compiler/compiler.py --project ARGOS --split-temporal --multi-pass --force --archive
  Critica obbligatoria 4 punti prima di scrivere (vincolo #4).
  Fallback se classificazione temporale degenere: split per file size ranking (top-N vs resto).

STEP 2 — Hook Stop global_violation_gate.py (~1h):
  Path: ~/.claude/hooks/global_violation_gate.py (scope globale, vincolo #12)
  WebFetch https://docs.claude.com/en/docs/claude-code/hooks PRIMA (vincolo #1)
  Pattern: regex hai ragione / perfetto opener / liste 1.+2.+3. decisionali
  Stdout JSON {"decision":"block","reason":"..."} se hit
  Log JSONL in ~/venture-os/state/cc-violations.jsonl
  Register in ~/.claude/settings.json hooks.Stop
  Test: 8 positive + 8 negative prompts, conta block rate.

STEP 3 (stretch) — OpenRouter HTTP test analogo Cerebras S5e.

Vincoli S5f: #1 verifica fattuale | #3 singola raccomandazione | #4 critica 4 punti |
             #6 verde o handoff | #7 60% context | #11 pattern recognition | #12 scope globale
```

## Blocker noti S5f

1. ARGOS splitting temporale assume cut ≤30gg/>30gg clean — non verificato in S5e. Fallback split-by-size se degenere.
2. Stop hook spec da verificare con WebFetch doc Anthropic (vincolo #1). Luke aveva proposto PreToolUse, corretto a Stop ma da confermare.
3. Memoria feedback_no_hai_ragione_diplomatico.md insufficiente — verifica empirica deviation S4. Hook è gate hard di backup.

## Pre-flight S5f

- T7 mount check (invariante)
- `tail -5 state/costs.jsonl` quota S5e (~7-10 call flash + 5 call cerebras free)
- `tail -5 state/blueprint-deviations.jsonl` riconferma rule_implications S5e
- `grep -c CEREBRAS_API_KEY ~/.claude/.env.free-gpu` verifica chiave persiste
