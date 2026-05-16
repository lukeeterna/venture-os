# DECISIONS-VOS.md — Venture OS top-level ADR

> Architecture Decision Records lean (5-field schema) per VOS infrastructure.
> Project-specific decisions sono in `wiki/projects/<NAME>/DECISIONS.md`.
> Append-only. Mai cancellare entry SUPERSEDED — sostituirne Status e linkare alla nuova D-VOS-NN.

---

## D-VOS-01 — CC Autonomy & Orchestration architecture (P0-P11) (2026-05-16, S180→S181)

**Status**: DECIDED (founder S180 raw "io non sono uno sviluppatore e pretendo che cc operi i maniera autonoma e addirittura CREI quello che gli serve, questo non è sindacabile")

**Contesto**: Dati audit 60 sessioni ARGOS+FLUXION = 4 Agent invocations totali (general-purpose), 0 Skill invocations specifici = 98% peso morto delegation. Pattern S159 ricaduta strutturale: CC fa direttamente task delegabili a sub-agents/LLM economici → context bloat 38% startup ARGOS + costo Opus su task low-stakes (47-84x più caro di DeepSeek V3 verified 2026-05-16) + qualità mediocre per mancanza specializzazione. Routing.yaml v5.1 esiste con 12k bytes config modelli (Gemini/Cerebras/OpenRouter) ma 0 skill user-facing lo invoca operativamente.

**Opzioni considerate**:
- (a) Status quo: CC fa tutto direttamente, accept overhead 38% context + costi Opus full
- (b) Workspace activator VOS (archive agents/skills non usati) — proposta S180 initial, RIFIUTATA da Luke: "se poi servono?" + "ho fornito strumenti e pretendo li usi"
- (c) Hook deterministic + orchestrator-workers pattern + agent factory + multi-LLM router (best practice Anthropic 2026)

**Decisione**: Opzione (c). Architettura 11-pattern (P0-P11) come definito in `wiki/HANDOFF-S181-cc-autonomy-orchestration.md`. Implementazione strutturata 4 wave (~90 min):
- WAVE 1 core enforcement: hook P0 + skill router P1+P3 + regola CLAUDE.md P4
- WAVE 2 auto-creation: agent factory P2 + reviewer chain P7
- WAVE 3 eval & monitoring: eval framework P8 + meta-monitor P9 + plan-execute P6
- WAVE 4 knowledge & integration: statusline P5 + learning extractor P10
- DEFERRED S182: voice integration P11 via Luna

**Conseguenze**:
- BLUEPRINT-JD-v3.5 sezione 14.3 FASE D aggiunta (riferimento canonical)
- CLAUDE.md global update: nuova REGOLA #0 "delegation-first mandatory" (S181 P4 implementation)
- Tutti i nuovi componenti in `~/venture-os/components/` (eval-tracker, cc-meta-monitor, llm-router, learning-extractor) + `~/.claude/skills/` (vos-auto-router, vos-agent-factory, vos-llm-router) + `~/.claude/hooks/` (user_prompt_route_enforce.py) + `~/.claude/agents/` (code-reviewer, research-fact-checker, decision-validator, cc-meta-monitor)
- Cost tracking obbligatorio `state/costs.jsonl` con soglia hard €30/mese (vincolo founder #5), target <€15/mese
- Implementation MAI direct da main context — sempre delega a ai-engineer + devops-automator agents (eat own dogfood)
- Memory feedback rules update: delegation_first_mandatory + cc_create_agents_on_demand + llm_router_use_routing_yaml
- Reversibile: commit dedicato `s181-cc-autonomy`, revert con `git revert` se rompe flow esistenti

**Ref**: 
- HANDOFF-S181 piano completo: `wiki/HANDOFF-S181-cc-autonomy-orchestration.md`
- BLUEPRINT FASE D: `wiki/BLUEPRINT-JD-v3.5.md` sezione 14.3
- Best practice Anthropic verified 2026-05-16: hooks docs + orchestrator-workers pattern + 6 multi-agent patterns beam.ai
- Dati cost confronto: Opus 4 $15/$75 vs DeepSeek V3 $0.32/$0.89 per M token (OpenRouter pricing 2026-05-16)
- Critica founder S180 raw: turno conversazione "io non son uno sviluppatore e pretendo che cc operi i maniera autonoma e addirittura CREI quello che gli serve"

<!-- last_reviewed: 2026-05-16 -->

---

# Indice cronologico

| # | Titolo | Status | Data | Sessione |
|---|--------|--------|------|----------|
| D-VOS-01 | CC Autonomy & Orchestration architecture P0-P11 | DECIDED | 2026-05-16 | S180→S181 |

**Totale**: 1 DECIDED. Prima entry top-level VOS post-bootstrap S173 cycle.
