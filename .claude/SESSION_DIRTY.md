# SESSION DIRTY — chiusura senza commit auto

Sessione: `c5118b5e-5777-49f9-8147-a39c285a98ed`  Timestamp: `2026-05-18T17:48:23Z`

Motivo: `git diff --check` fail (whitespace errors o conflict markers).

## Output git diff --check
```
.claude/NEXT_SESSION_PROMPT.md:34: trailing whitespace.
+[{"tool_use_id":"toolu_019CHQ2pJ2Z38hLHuBcSSVQA","type":"tool_result","content":"-rwxr-xr-x  1 macbook  staff  6177 18 Mag 11:05 /Users/macbook/.claude/hooks/auto_code_review.py\n-rw-r--r--  1 macbook  staff  1381 18 Mag 11:04 /Users/macbook/Library/LaunchAgents/com.vos.eval-dashboard.plist\n-rwxr-xr-x  1 macbook  staff  4588 18 Mag 11:09 /Volumes/MontereyT7/venture-os/scripts/eval-dashboard.sh\n\n/Volumes/MontereyT7/venture-os/components/eval-tracker/:\ntotal 40\ndrwxr-xr-x   5 macbook  staff  
```

## Status
```
 M .claude/NEXT_SESSION_PROMPT.md
 M .claude/agent-memory/ai-engineer/project_vos_skills_s181.md
 M state/costs.jsonl
?? .claude/SESSION_DIRTY.md
?? components/cc-meta-monitor/
?? components/llm-router/plan_execute.py
?? state/cc-anti-patterns-weekly-2026-20.md
?? state/plan-executions/
```

Risolvi manualmente, poi commit. Sessione successiva legge questo file.
