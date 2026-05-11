# NEXT SESSION — VOS S6 (S5e+S5f STEP1+2 entrambi shipped)

**Close S5e**: 2026-05-11T19:35Z (chiusura iniziale a 58% stimato hook, RIAPERTA dopo fix bug 5x: reale ~15%).
**Stato S5e**: VERDE 3/3 STEP S5e + STEP 2 S5f hook gate shipped in S5e-extended. STEP 1 ARGOS → S5f.

## Riassunto S5e

- ✅ STEP 2 — founder-bridge component (browser.py + shim) + test reale verde
- ✅ STEP 3 — Cerebras HTTP verified, routing.yaml v4 con pivot strutturale (fast_short_context vs long_context)
- ✅ **EXTRA fix bug** `context-gate-budget-5x-wrong` — hook `~/.claude/hooks/global_context_gate.py:88` budget 200K vs 1M reale. Tutte le auto-close S2-S5e prematura. Fix shipped + deviation tracciata.
- ✅ **STEP 2 S5f anticipato** — `~/.claude/hooks/global_violation_gate.py` + register `~/.claude/settings.json:Stop[3]` + log `state/cc-violations.jsonl`. 12/12 unit test (6 positive + 6 negative) verdi. **Mode `log-only` di default** (env `CLAUDE_VIOLATION_GATE_MODE=block` per attivare gate). Versione versionata in `scripts/hooks/global_violation_gate.py`.
- ✅ Deviation registrate: `cerebras-model-names-doc-vs-real` (3a ricorrenza doc-only) + `argos-timeout-900s-insufficient` + `context-gate-budget-5x-wrong`
- ✅ **STEP 1 S5f ARGOS shipped** (S5e extended sessione singola) — compiler v3 `--split-temporal` flag: split per mediana mtime. ARGOS pilot 188 righe 4/4 sezioni: stato/blocker/prossimi su batch recent (103K tok), decisioni su batch old (72K tok). 98 file archived in `wiki/raw/archived-handoffs/ARGOS/2026-05-11/`. 4 call, 2 retry 429 iniziali risolti, 0 timeout. Deviation `argos-timeout-900s-insufficient` CLOSED.

## Prompt resume S5f

```
Sessione S5f — ARGOS splitting input + Hook Stop gate violazioni CC.

Leggi:
1. ~/.claude/CLAUDE.md (vincoli globali)
2. ~/venture-os/handoffs/HANDOFF-VOS-S5f-argos-splitting-and-cc-violation-gate-2026-05-11.md
3. ~/venture-os/components/karpathy-compiler/compiler.py v2 (per refactor splitting)
4. ~/venture-os/seeds/S5f-hook-cc-violation-gate.md (design hook completo)
5. ~/venture-os/state/blueprint-deviations.jsonl ultime 4 entry (S5d/S5e)

**Roadmap canonica**: `~/venture-os/ROADMAP.md` (S5f close, documento vivente).
Sequenza eseguibile: FASE 1 → FASE 2 → FASE 3 → FASE 4 (manutenzione).
S6 target: chiudere FASE 1 (3 task, totale ~65min).

---

STEP 1 — Audit baseline cc-violations (7gg, ~30min):
  - tail -50 ~/venture-os/state/cc-violations.jsonl → conta hit per pattern_id
  - Se ≥5 violazioni reali catturate → switch mode log-only → block:
    Edit ~/.claude/hooks/global_violation_gate.py MODE default o env CLAUDE_VIOLATION_GATE_MODE=block
  - Se baseline mostra falsi positivi → raffinare regex

STEP 2 — Audit FLUXION hook context budget (analogo bug S5e):
  - Read /Volumes/MontereyT7/FLUXION/.claude/hooks/ (cercare context_budget_gate.py se exist)
  - Verifica hardcoded 200K → fix se necessario (pattern S5e bug 5x)

STEP 3 — OpenRouter HTTP test analogo Cerebras S5e:
  - Luke crea account openrouter.ai → OPENROUTER_API_KEY
  - HTTP test su meta-llama/llama-3.3-70b-instruct:free (vincolo #1)
  - Update routing.yaml v5 long_context_fallback_chain con OpenRouter verified

STEP 4 (stretch) — Karpathy compilation Guardian con --split-temporal se utile.

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
