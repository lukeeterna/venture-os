# SESSION DIRTY — chiusura senza commit auto

Sessione: `9d4965e5-e6d5-4643-95a9-63697ac6d77b`  Timestamp: `2026-05-16T19:47:20Z`

Motivo: `git diff --check` fail (whitespace errors o conflict markers).

## Output git diff --check
```
.claude/NEXT_SESSION_PROMPT.md:31: trailing whitespace.
+Loop Oracle ha finito cool-down e ricomincia retry (sempre 30min interval, è infra dev mia non più P0 come abbiamo chiarito). 
```

## Status
```
 M .claude/NEXT_SESSION_PROMPT.md
?? .claude/SESSION_DIRTY.md
```

Risolvi manualmente, poi commit. Sessione successiva legge questo file.
