# SESSION DIRTY — chiusura senza commit auto

Sessione: `af302b7a-6d6e-4972-8a53-ddc925c1102f`  Timestamp: `2026-05-18T07:00:52Z`

Motivo: `git diff --check` fail (whitespace errors o conflict markers).

## Output git diff --check
```
.claude/NEXT_SESSION_PROMPT.md:25: trailing whitespace.
+  fresh.  
```

## Status
```
 M .claude/NEXT_SESSION_PROMPT.md
?? .claude/SESSION_DIRTY.md
```

Risolvi manualmente, poi commit. Sessione successiva legge questo file.
