# VOS Research Protocol v2 — Automated by Claude Code

> Versione: v2 (2026-05-14 S167). Supersedes v1 (`data-driven-research-protocol.md` S166 manual).
> v1 manuale resta valida per ricerche commerciali che richiedono triangulazione vendor-diversa (Gemini + Anthropic + Google NotebookLM). v2 automatizza ~70-80% del tempo per ricerche tecniche.

## Quando usare v2 (automated) vs v1 (manual)

| Caratteristica decisione | v2 automated | v1 manual |
|---|---|---|
| Decisione tech (stack, libreria, API) | ✅ | overkill |
| Decisione strategica/commerciale (messaging, target, positioning) | parziale | ✅ richiede multi-vendor triangulation |
| Single-vendor risk tollerabile | sì | no |
| Tempo budget | ≤60 min wallclock | 2-4h wallclock |
| Volume fonti necessarie | 5-30 | 40+ |
| Audit-bias mandatorio | sì (Agent dedicato) | sì (manual cross-tool) |

## Tier-by-complexity

### TIER 1 — Lean (5-10 fonti, decisione singola)
- 1× WebSearch + 1-2× WebFetch + sintesi inline Claude Code
- Tempo: ~5-10 min
- Use case: "Stripe pricing 2026?", "Groq free tier limits?"

### TIER 2 — Medium (20-30 fonti, comparison multi-opzione)
- 1× WebSearch (multi-query) + 3-5× WebFetch parallel + 1× Agent(`Explore`)
- Tempo: ~15-25 min
- Use case: "Best Python state machine library 2026?", "WhatsApp libraries comparison"

### TIER 3 — Strategic (50+ fonti, decisione strutturale tipo S166)
- 2-3× Agent(`general-purpose`) parallel + 1× Agent(`audit-bias-checker`) + WebSearch + WebFetch parallel
- 1 round cross-validation esterno manuale (Perplexity / Gemini AI Studio quick fact-check) — non automatizzato, Luke esegue
- Tempo: ~45-90 min wallclock
- Use case: "ARGOS workflow communication infrastructure stack" (S167 Thread 4), "Day 1 messaging research" (S166)

## Workflow standard TIER 3

```
1. PREP (5 min) — Claude Code:
   - Audit locale HW/SW (Bash): MacBook macOS / Python / Node / stack esistente
   - Read DECISIONS.md progetto (vincolo #13 pre-action check)
   - Read CLAUDE.md vincoli + ROADMAP

2. RESEARCH SPAWN (parallel) — Claude Code:
   - 2-4 Agent(general-purpose) con brief self-contained markdown
   - Ogni Agent ha: Context (workflow + DECISIONS.md citate), Goal, Sub-questions atomiche,
     Output format, Vincoli (zero-cost, OSS-only, Big Sur compat), 4-point critique mandatory
   - Brief contiene fact verified pre-loaded (Groq pricing, library versions) — Agent
     focus su synthesis non re-verification basics

3. AUDIT-BIAS (parallel con #2) — Claude Code:
   - 1 Agent dedicato review brief + output preliminary per detecting:
     - assumption founder-bias (es. Sud-Italia bias S159)
     - assumption tech-stack-bias (es. preferenza Anthropic over multi-vendor)
     - confidence > verification flag

4. SYNTHESIS — Claude Code:
   - Convergenze 3-fonti (2+ Agent + WebSearch verified facts)
   - Contraddizioni esplicite (vincolo #9 no diplomatico)
   - 4-point critique strutturale singola raccomandazione (vincolo #3 + #4)

5. CROSS-VALIDATION (manual, ~5 min) — Luke:
   - 1 round Perplexity / Gemini AI Studio su 1-2 claim più rischiosi
   - Conferma o flagga discrepancy
   - Se discrepancy critica → loop 1 Agent re-research focused

6. ARTIFACT SHIPPING — Claude Code:
   - Update DECISIONS.md progetto con D-NN entry
   - Append `state/blueprint-deviations.jsonl` evento
   - Commit + push
```

## Anti-pattern (lessons learned S166 + S167)

1. **Founder-bias replication**: prompt Agent senza audit-bias prima → Sud-Italia bias replicato 14× S166. Mitigazione: audit-bias Agent obbligatorio TIER 3.
2. **Carry-over senza re-check**: artifact da sessione precedente (V3 messaging S166 carry-over S167) drift workflow. Mitigazione: B6 L2 nudge applica anche su carry-over inter-sessione.
3. **Confidence > verification**: Claude proietta numeri verosimili senza audit stack esistente (€30/mese projection S167 quando reale è €0/mese). Mitigazione: Bash audit locale obbligatorio PRIMA di proiezione costo.
4. **Single-vendor in-house bias**: tutto CC + Anthropic API → manca audit esterno. Mitigazione: 1 step cross-validation esterno manuale TIER 3.
5. **Single-question brief Agent**: brief con 1 question = output verboso senza decision. Mitigazione: sub-questions 5-10 atomiche + recommendation singola motivata + 4-point critique strutturale.

## Successo S167 (validation PoC)

Thread 4 (ARGOS comm infrastructure stack): output 70-80% completo in ~15 min via CC autonomous (WebSearch + Bash audit + Read skill) vs 3-4h protocollo manuale S166.

Thread 1+2+3 parallel via 3 Agent + DocuSeal WebFetch: ~10 min wallclock per ricerca composita 4 thread completa.

Risparmio totale stimato: 70-80% vs manuale.

## Tool stack CC available 2026-05-14

- **WebSearch** built-in Anthropic-proxied
- **WebFetch** built-in URL→LLM-extract
- **mcp__context7__*** docs library lookup (Anthropic MCP)
- **mcp__firecrawl__*** advanced web scraping (Anthropic MCP)
- **mcp__exa__*** semantic search (Anthropic MCP)
- **Agent** parallelizable subagents (general-purpose, Explore, trend-researcher, tool-evaluator, gsd-* family)
- **Bash** curl/jq/python any HTTP API
- **free-gpu-api skill** modelli HF su Colab T4 free per LLM inference local-controlled
- **vos-scout skill** OSS scouting wrapper
- **Memory persistente** cross-session learnings in `~/.claude/projects/<id>/memory/`

## Riferimenti

- v1 manual: `wiki/patterns/data-driven-research-protocol.md` (S166)
- S166 SYNTHESIS: `handoffs/S166-SYNTHESIS-approach-method.md`
- S167 PoC: 4 thread research output in `.claude/PROMPT-S168.md`
- ARGOS DECISIONS: `wiki/projects/ARGOS/DECISIONS.md` D-21..D-25 (workflow evolution outcomes)
- CLAUDE.md vincoli #1 verifica fattuale + #4 critica strutturale + #11 pattern recognition
- B6 mitigation: `~/.claude/skills/pre-action-check/SKILL.md`
