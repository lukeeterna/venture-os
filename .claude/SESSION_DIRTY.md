# SESSION DIRTY — chiusura senza commit auto

Sessione: `9d4965e5-e6d5-4643-95a9-63697ac6d77b`  Timestamp: `2026-05-16T20:56:46Z`

Motivo: `git diff --check` fail (whitespace errors o conflict markers).

## Output git diff --check
```
.claude/NEXT_SESSION_PROMPT.md:25: trailing whitespace.
+adesso non ne ha bisogno , anche il fatto che non abbia invocato subagent agent skills, non va bene . gli ho fornito strumenti per lavorare bene e pretendo che li usi , e li invochi al momento giusto , ad esempio VOS , tu stesso in queste sessioni nonostante abbia tutti i comandi piu volte hai sbagliato e non li hai ne eseguiti ne utilizzati. questo non va bene , io non son uno sviluppatore e pretendo che cc operi i maniera autonoma e addirittura CREI quello che gli serve per produrre sempre il 
```

## Status
```
 M .claude/NEXT_SESSION_PROMPT.md
 M state/cc-violations.jsonl
?? .claude/SESSION_DIRTY.md
```

Risolvi manualmente, poi commit. Sessione successiva legge questo file.
