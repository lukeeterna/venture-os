# SESSION DIRTY — chiusura senza commit auto

Sessione: `dd078cd0-e03e-431d-bc60-c51990301308`  Timestamp: `2026-05-13T11:40:24Z`

Motivo: `git diff --check` fail (whitespace errors o conflict markers).

## Output git diff --check
```
.claude/NEXT_SESSION_PROMPT.md:31: trailing whitespace.
+[{"tool_use_id":"toolu_012BxkYcQntCAjojjdw3AdX2","type":"tool_result","content":"[deviation logged]\n---\nM  .claude/NEXT_SESSION_PROMPT.md\nM  ROADMAP.md\nA  handoffs/HANDOFF-ARGOS-S165-landing-cleanup-2026-05-13.md\nA  handoffs/HANDOFF-VOS-S11c-prereq-heretic-handler-2026-05-13.md\nA  handoffs/HANDOFF-VOS-S11c-strategic-wiki-argos-2026-05-13.md\nM  state/blueprint-deviations.jsonl\nM  state/cc-violations.jsonl\n---\n[master 3dbcd7c] S11c planning: 3 handoff atomici + FASE 4 wiki consolidation 
```

## Status
```
 M .claude/NEXT_SESSION_PROMPT.md
 M state/blueprint-deviations.jsonl
?? .claude/SESSION_DIRTY.md
```

Risolvi manualmente, poi commit. Sessione successiva legge questo file.
