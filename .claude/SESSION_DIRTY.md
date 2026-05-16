# SESSION DIRTY — chiusura senza commit auto

Sessione: `9d4965e5-e6d5-4643-95a9-63697ac6d77b`  Timestamp: `2026-05-16T18:57:02Z`

Motivo: `git diff --check` fail (whitespace errors o conflict markers).

## Output git diff --check
```
.claude/NEXT_SESSION_PROMPT.md:26: trailing whitespace.
+[{"tool_use_id":"toolu_01M14CfrNuVdF3qL13yBeXNo","type":"tool_result","content":"Web search results for query: \"Oracle Cloud ARM A1 free tier capacity availability window seconds retry script success rate\"\n\nLinks: [{\"title\":\"FAQ on Oracle's Cloud Free Tier\",\"url\":\"https://www.oracle.com/cloud/free/faq/\"},{\"title\":\"oracle-cloud-free-tier-guide · GitHub\",\"url\":\"https://gist.github.com/rssnyder/51e3cfedd730e7dd5f4a816143b25dbd?permalink_comment_id=4015735\"},{\"title\":\"Oracle 
```

## Status
```
 M .claude/NEXT_SESSION_PROMPT.md
?? .claude/SESSION_DIRTY.md
```

Risolvi manualmente, poi commit. Sessione successiva legge questo file.
