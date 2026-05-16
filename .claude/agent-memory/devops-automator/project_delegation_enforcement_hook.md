---
name: Delegation enforcement hook P0 S181
description: Hook UserPromptSubmit che forza valutazione delega Task tool prima di sequenze multi-step — implementato S181
type: project
---

Hook `user_prompt_route_enforce.py` implementato e registrato in S181 come P0 del framework CC Autonomy & Orchestration.

**Why:** 4 Task invocations su 60 sessioni ARGOS+FLUXION = 98% peso morto delegation. Luke ha posto vincolo non sindacabile: prima di sequenze Bash/Read/Edit/Write multi-step (>2 azioni), Claude deve valutare delega.

**How to apply:** Hook e' attivo globalmente su tutte le sessioni CC. Log audit in `~/venture-os/state/delegation-enforcement.jsonl`. Il hook esistente `prompt-router.sh` rimane attivo ma e' meno aggressivo (solo hint, non mandatory). Se i due hook coesistono nello stesso array UserPromptSubmit entrambi si eseguono — additionalContext si concatena.
