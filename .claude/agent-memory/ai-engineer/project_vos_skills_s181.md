---
name: Skills VOS S181 WAVE 1+2 create
description: Stato creazione skill e agent P1/P2/P3/P7 di S181 VOS — WAVE 1 (delegation enforcement) + WAVE 2 (agent factory + reviewer chain)
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
