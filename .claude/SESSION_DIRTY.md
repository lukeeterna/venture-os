# SESSION DIRTY — chiusura senza commit auto

Sessione: `36bb04de-0a68-4f10-85a1-e414670b13d4`  Timestamp: `2026-05-15T15:09:01Z`

Motivo: `git diff --check` fail (whitespace errors o conflict markers).

## Output git diff --check
```
.claude/NEXT_SESSION_PROMPT.md:31: trailing whitespace.
+Letto. Sessione precedente chiusa per context budget (#7 60%). 
```

## Status
```
 M .claude/NEXT_SESSION_PROMPT.md
?? .claude/SESSION_DIRTY.md
```

Risolvi manualmente, poi commit. Sessione successiva legge questo file.
