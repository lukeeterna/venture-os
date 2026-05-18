---
name: Skills VOS S181 WAVE 1+2+3 create
description: Stato creazione skill e agent P1/P2/P3/P6/P7/P8/P9 di S181 VOS — WAVE 1 (delegation enforcement) + WAVE 2 (agent factory + reviewer chain) + WAVE 3 (eval-tracker, meta-monitor, plan-execute)
type: project
---

Skills create in sessione S181 WAVE 1 (2026-05-16):

- `~/.claude/skills/vos-llm-router/SKILL.md` — delega task long-context/classification a Gemini Flash/DeepSeek via router.py. Decision matrix intent→role, 4 esempi concreti, anti-pattern, check costo mensile.
- `~/.claude/skills/vos-auto-router/SKILL.md` — orchestrator-workers pattern. Plan JSON → spawn parallelo → aggregazione via router cheap. Decision matrix intent→(agent, model), 3 esempi concreti, logging orchestration.jsonl.

Deliverable S181 WAVE 2 (2026-05-18):

- `~/.claude/skills/vos-agent-factory/SKILL.md` — P2: genera agent on-demand in `_generated/`. Match check keyword overlap >40%, cap 10/sessione 50/totale, audit agent-factory.jsonl + dispatch-matrix.jsonl.
- `~/.claude/agents/code-reviewer.md` — P7a: review security/correctness/idempotency/BigSur. Output JSON PASS|FAIL, solo bug reali (no nitpick). Read-only (no Write/Edit).
- `~/.claude/agents/research-fact-checker.md` — P7b: verifica claim tecnici con 2+ fonti secondarie. Output JSON CONFIRMED|DISPUTED|UNVERIFIABLE. MAI training data come fonte.
- `~/.claude/agents/decision-validator.md` — P7c: valida proposte vs DECISIONS.md. Check 3-line (D-XX rif, vincolo founder, fonte dati). Output JSON APPROVED|REJECTED|NEEDS_REVISION. Allineato a pre-action-check skill.
- `~/.claude/agents/_generated/` — directory per agent auto-generati (vuota, pronta).

**Why:** delegation gap WAVE 1 + quality gate mancante WAVE 2. Reviewer chain è invocato via Task tool dal main (no hook automation in questa WAVE — WAVE 3).

**How to apply:** prima di commit non-trivial → Task(code-reviewer). Prima di DECISIONS.md write → Task(decision-validator). Su claim tecnici critici → Task(research-fact-checker). Per domain senza agent → vos-agent-factory protocollo.

Deliverable S181 WAVE 3 (2026-05-18):

- `~/.claude/agents/cc-meta-monitor.md` — P9: subagent audit anti-pattern. Rileva delegation_gap/search_loop/edit_revert/context_pollution/blind_execution su session jsonl.
- `~/venture-os/components/cc-meta-monitor/monitor.py` — P9: script Python detection, append `state/cc-anti-patterns.jsonl` + `cc-alerts-pending.jsonl` (HIGH) + weekly report.
- `~/Library/LaunchAgents/com.vos.cc-meta-monitor.plist` — P9: LaunchAgent ogni 30min. NON ancora attivato (richiede `launchctl bootstrap` da Luke).
- `~/venture-os/components/llm-router/plan_execute.py` — P6: plan-and-execute engine. Topological sort + ThreadPoolExecutor max 3 concurrent. Mock mode per test senza API. Cost pre-flight: warn >$0.10, blocca >$1.
- `~/.claude/skills/vos-auto-router/SKILL.md` — P6: nuova sezione "Modalità plan-and-execute" aggiunta.

**Stato state files generati (2026-05-18):**
- `state/cc-anti-patterns.jsonl` — popolato (3 entries da test)
- `state/cc-alerts-pending.jsonl` — popolato (1 HIGH alert: delegation_gap)
- `state/plan-executions/` — 3 file summary da test mock
- `state/cc-anti-patterns-weekly-2026-20.md` — creato

**Session jsonl struttura reale Claude Code (IMPORTANTE):**
- type=assistant → message.content = lista {type:"tool_use", name, input, id}
- type=user → message.content = lista {type:"tool_result", tool_use_id, content, is_error}
- NON usare type="tool_use" direttamente come top-level type (solo come nested in message.content)
