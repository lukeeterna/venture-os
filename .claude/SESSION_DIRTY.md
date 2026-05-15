# SESSION DIRTY — chiusura senza commit auto

Sessione: `36bb04de-0a68-4f10-85a1-e414670b13d4`  Timestamp: `2026-05-15T15:34:38Z`

Motivo: `git diff --check` fail (whitespace errors o conflict markers).

## Output git diff --check
```
.claude/NEXT_SESSION_PROMPT.md:25: trailing whitespace.
+  F2: [N clienti BASE €297 paganti, 0 se zero]     0 , MA NON ESISTE NESSUN PACCHETTO DA QUEL PREZZO!! 
```

## Status
```
 M .claude/NEXT_SESSION_PROMPT.md
 M state/cc-violations.jsonl
?? .claude/SESSION_DIRTY.md
```

Risolvi manualmente, poi commit. Sessione successiva legge questo file.
