---
name: Skills vos-llm-router e vos-auto-router create S181
description: Stato creazione skill P1 e P3 di S181 VOS — wrapper sopra router.py esistente, no nuovi script aggiuntivi
type: project
---

Skills create in sessione S181 (2026-05-16):

- `~/.claude/skills/vos-llm-router/SKILL.md` — delega task long-context/classification a Gemini Flash/DeepSeek via router.py. Decision matrix intent→role, 4 esempi concreti, anti-pattern, check costo mensile.
- `~/.claude/skills/vos-auto-router/SKILL.md` — orchestrator-workers pattern. Plan JSON → spawn parallelo → aggregazione via router cheap. Decision matrix intent→(agent, model), 3 esempi concreti, logging orchestration.jsonl.

**Why:** delegation gap: 4 Task invocations su 60 sessioni (98% peso morto). Vincolo Luke S180 non sindacabile: delegare proattivamente.

**How to apply:** quando il main Claude valuta task multi-step o analisi lunga, leggere vos-auto-router prima di procedere inline. Per task di sola analisi/sintesi, leggere vos-llm-router.
