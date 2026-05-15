# SESSION DIRTY — chiusura senza commit auto

Sessione: `75bcc75b-bb56-44d6-b6a2-b2a37973b768`  Timestamp: `2026-05-15T17:54:03Z`

Motivo: `git diff --check` fail (whitespace errors o conflict markers).

## Output git diff --check
```
.claude/NEXT_SESSION_PROMPT.md:29: trailing whitespace.
+[{"tool_use_id":"toolu_01FmK1JreynaUgEbZSz2HP1H","type":"tool_result","content":"brief-actions S174 line scritta\n{\"date\": \"2026-05-15\", \"brief_read\": true, \"action_taken\": \"S174-session-health-impl\", \"source_match\": false, \"notes\": \"gap #2 chiuso: components/session-health/health.py (224 logical LOC stdlib only) + hook briefer _signals + wiki/notes/S174-session-health-impl.md. Probe validata su sessione corrente (overall=ok, ctx 7.42%, 44 turn, 4.4min age). Scenario warn testato 
```

## Status
```
 M .claude/NEXT_SESSION_PROMPT.md
?? .claude/SESSION_DIRTY.md
```

Risolvi manualmente, poi commit. Sessione successiva legge questo file.
