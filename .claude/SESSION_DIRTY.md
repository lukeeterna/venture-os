# SESSION DIRTY — chiusura senza commit auto

Sessione: `91497afa-a50c-47a3-b985-f27380249b25`  Timestamp: `2026-05-13T17:15:56Z`

Motivo: `git diff --check` fail (whitespace errors o conflict markers).

## Output git diff --check
```
.claude/NEXT_SESSION_PROMPT.md:25: trailing whitespace.
+    operativo, NON il rischio identitario. va bene cosi uncensored fa il resto 
```

## Status
```
 M .claude/NEXT_SESSION_PROMPT.md
 M state/cc-violations.jsonl
?? .claude/SESSION_DIRTY.md
```

Risolvi manualmente, poi commit. Sessione successiva legge questo file.
