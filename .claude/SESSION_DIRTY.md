# SESSION DIRTY — chiusura senza commit auto

Sessione: `d483065d-2a3d-4f04-8b12-d2584e1d2cb0`  Timestamp: `2026-05-14T09:37:57Z`

Motivo: `git diff --check` fail (whitespace errors o conflict markers).

## Output git diff --check
```
.claude/NEXT_SESSION_PROMPT.md:25: trailing whitespace.
+[{"tool_use_id":"toolu_01BHVj7FmAMuz9xMGFN4QP6g","type":"tool_result","content":"Web search results for query: \"python-statemachine vs transitions library 2026 comparison SQLite persistence workflow\"\n\nLinks: [{\"title\":\"What are the best Python libraries for the implementation of finite state machine? - Quora\",\"url\":\"https://www.quora.com/What-are-the-best-Python-libraries-for-the-implementation-of-finite-state-machine\"},{\"title\":\"GitHub - pytransitions/transitions: A lightweight, 
```

## Status
```
 M .claude/NEXT_SESSION_PROMPT.md
 M state/cc-violations.jsonl
?? .claude/SESSION_DIRTY.md
```

Risolvi manualmente, poi commit. Sessione successiva legge questo file.
