# SESSION DIRTY — chiusura senza commit auto

Sessione: `9d4965e5-e6d5-4643-95a9-63697ac6d77b`  Timestamp: `2026-05-16T15:27:42Z`

Motivo: `git diff --check` fail (whitespace errors o conflict markers).

## Output git diff --check
```
.claude/NEXT_SESSION_PROMPT.md:30: trailing whitespace.
+3. Test `ssh oracle-arm "uname -a"` 
```

## Status
```
 M .claude/NEXT_SESSION_PROMPT.md
 M wiki/projects/ARGOS/DECISIONS.md
 M wiki/projects/Guardian/HANDOFF-S180-oracle-bootstrap-PAUSED.md
?? .claude/SESSION_DIRTY.md
```

Risolvi manualmente, poi commit. Sessione successiva legge questo file.
