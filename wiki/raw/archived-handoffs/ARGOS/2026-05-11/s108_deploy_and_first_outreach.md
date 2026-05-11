# PROMPT S108 — DEPLOY S106 + FIRST OUTREACH

**Date**: 2026-04-10 (T+1)  
**Status**: S106 code ready (36/36 test PASS), S107 plan validated  
**Blocker**: iMac offline 2026-04-09 18:00 UTC → awaiting reconnect

---

## TASK SUMMARY

Execute S106 deploy to iMac with zero WA downtime, then run first outreach test to 1 dealer.

---

## PREREQUISITE CHECKS

Before executing ANY step below, run these health checks:

```bash
# 1. SSH iMac reachable
ssh gianlucadistasi@192.168.1.12 "echo 'OK' && date"

# 2. PM2 daemon online
ssh gianlucadistasi@192.168.1.12 "source ~/.nvm/nvm.sh && pm2 list | grep argos-wa-daemon"

# 3. WA still connected
curl -s http://192.168.1.12:9191/status | python3 -m json.tool
```

If ANY of above fail → ESCALATE: iMac unreachable or daemon crashed.

---

## PHASE 1: ATOMIC DEPLOY (Follow .planning/deploy_s106_checklist.md exactly)

All 8 phases MUST execute in order:
1. Backup iMac wa-intelligence
2. Rsync code from MacBook
3. pip install requirements
4. Restart daemon with nvm
5. Health check /health endpoint
6. Verify pm2 list status
7. Check logs for errors
8. Rollback if health check fails

**Expected outcome**: Daemon ONLINE, WA connected, logs clean.

**Rollback trigger**: If /health returns wa_connected:false or daemon shows errored after 30 sec → AUTO-ROLLBACK

---

## PHASE 2: POST-DEPLOY VERIFICATION

After daemon restarts and health check is GREEN:

```bash
# 1. Daemon test: call outbound_guard with valid args
ssh gianlucadistasi@192.168.1.12 "
  cd ~/Documents/app-antigravity-auto/wa-intelligence
  python3 outbound_guard.py \
    --db-path ~/.../dealer_network.sqlite \
    --dealer-id test_001 \
    --template-id DAY1_PREMIUM \
    --message 'Test message'
"

# 2. Verify state_machine loaded
python3 -c "from state_machine import can_send; print('OK')"

# 3. Check db schema for state columns
sqlite3 ~/.../dealer_network.sqlite "
  SELECT name FROM pragma_table_info('conversations') 
  WHERE name IN ('conversation_state', 'outbound_count');
"
```

All 3 should return OK / column exists.

---

## PHASE 3: FIRST OUTREACH TEST (1 dealer, dry-run mode)

**Dealer selected**: AZ Auto Evolution (ID: az_auto_evolution_av)  
From `research/s106_dealer_profiled_30.json` — PREMIUM, RELAZIONALE

**Message template**: DAY1_PREMIUM (filled + validated)

**Steps**:

1. Fill DAY1_PREMIUM template:
   ```python
   from templates import fill_template
   filled = fill_template(
       template_id='DAY1_PREMIUM',
       dealer_name='AZ Auto Evolution',
       brand='BMW',
       message_context={'vehicle': 'BMW X3 2021', 'price': '€28.500'}
   )
   ```

2. Validate:
   ```python
   from validator import validate
   result = validate(filled, 'DAY1_PREMIUM', {})
   assert result['result'] == 'PASS', f"Validation failed: {result}"
   ```

3. **DRY RUN** (no actual send):
   - Log the filled message to stdout
   - Verify no fee_leak / tech_leak / banned words
   - Check length < 4096 chars
   - Review tone (B2B, professional, no startup)

4. If DRY RUN PASS:
   - Approve manually (output message to terminal)
   - Ask user: "Send to AZ Auto Evolution now? Y/N"
   - If Y: call /send endpoint with dealer_id + template_id + filled_message
   - If N: skip and document decision

5. Post-send:
   - Call post_send_update.py to increment state
   - Verify DB: conversation_state should transition COLD → CONTACTED
   - Check outbound_count = 1

---

## PHASE 4: MONITORING (30 min post-deploy)

Monitor iMac every 5 min for 30 minutes:

```bash
watch -n 300 "ssh gianlucadistasi@192.168.1.12 'curl -s localhost:9191/health | python3 -m json.tool'"
```

**RED FLAGS** (trigger immediate investigation):
- wa_connected: false
- Error in response
- Daemon logs show disconnection/reconnection pattern
- > 1 second latency on /health

If RED FLAG → Check logs:
```bash
ssh gianlucadistasi@192.168.1.12 "source ~/.nvm/nvm.sh && pm2 logs argos-wa-daemon --lines 50 --nostream"
```

---

## PHASE 5: DOCUMENT OUTCOME

Create `memory/s108_deploy_outcome.md`:
- Timestamp start/end
- All health checks passed: Y/N
- Files rsync'd (count)
- First outreach: Y/N / skipped / failed
- Issues encountered (if any)
- Rollback needed: Y/N

Example:
```markdown
# S108 Deploy Outcome

**Start**: 2026-04-10 15:30 UTC  
**End**: 2026-04-10 15:45 UTC  
**Duration**: 15 minutes

### Health Checks
- SSH reachable: ✓
- PM2 online: ✓
- WA connected: ✓
- /health 200: ✓

### Deploy
- Backup created: wa-intelligence.backup.20260410_153000
- Rsync files: 19 files transferred
- pip install: 3 deps installed (fastapi, uvicorn, itsdangerous)
- pm2 restart: OK
- Logs: CLEAN

### First Outreach
- Dealer: AZ Auto Evolution
- Template: DAY1_PREMIUM
- Dry run: PASS
- Manual approval: APPROVED
- Send result: OK (message_id = xxx)
- State transition: COLD → CONTACTED ✓

### Issues
None.

### Next
S109: Monitor responses + prepare Day 3 follow-up
```

---

## CRITICAL RULES

1. **ROLLBACK GATE**: If health check fails at any point → AUTO-ROLLBACK, don't proceed to outreach
2. **MANUAL APPROVAL**: First outreach requires explicit user confirmation (DRY RUN → Y/N prompt)
3. **NO TEMPLATE FALLBACK**: If template system crashes, don't fall back to LLM — escalate
4. **MONITORING**: Stay attached for 30 min post-deploy to catch early failures
5. **VERSIONING**: Tag backup with datetime. If rollback needed, use most recent backup

---

## SUCCESS CRITERIA

Deploy is SUCCESS if:
- [x] Daemon restarts without errors
- [x] WA reconnects within 30 seconds
- [x] /health returns 200 with wa_connected: true
- [x] outbound_guard + post_send_update callable
- [x] First outreach to 1 dealer completes with state transition
- [x] No logs show warnings/errors during 30 min monitoring

---

## ESCALATION PATHS

| Issue | Action |
|-------|--------|
| iMac unreachable | Check Tailscale IP, restart SSH |
| Daemon won't restart | Check logs: SyntaxError? Missing Node deps? |
| WA disconnected post-deploy | PM2 logs will show. Likely Python module import issue |
| Validation fails on message | Review validator.py rules — may be new regex blocking valid text |
| First outreach fails | Check /send endpoint logs, verify dealer_id exists in DB |

---

## WHAT NOT TO DO

- Do NOT skip health checks and deploy again if first attempt fails
- Do NOT manually send WA without /send endpoint (use daemon)
- Do NOT modify code during deploy window
- Do NOT run tests in parallel with deploy
- Do NOT commit code during active deploy

---

## FILES REFERENCED

- Deploy checklist: `.planning/deploy_s106_checklist.md`
- S106 readiness: `.planning/s106_readiness_report.md`
- Code modules: `wa-intelligence/outbound_guard.py`, `post_send_update.py`, templates.py, etc.
- DB schema: `dealer_network.sqlite` (on iMac)
- Dealer data: `research/s106_dealer_profiled_30.json`

---

## ESTIMATED DURATION

- Prerequisite checks: 2 min
- Phase 1 (deploy): 10-15 min
- Phase 2 (post-deploy verify): 5 min
- Phase 3 (first outreach dry-run): 10 min
- Phase 4 (monitoring, first 30 min): 30 min (parallel, not blocking)
- Phase 5 (documentation): 5 min

**Total**: ~65 minutes wall time (mostly monitoring in background)

---

## ACTIVATION

Activate with:
```
/agent-ops → deploy S106 to iMac per S108 prompt
```

Or manually:
```bash
python3 -c "
from pathlib import Path
prompt = Path('prompts/s108_deploy_and_first_outreach.md').read_text()
# Paste into agent context
"
```

---

**Author**: Agent-Ops  
**Date**: 2026-04-09  
**Next**: S109_monitor_responses.md (after first outreach)
