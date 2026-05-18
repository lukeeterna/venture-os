---
name: WAVE 3 P8 deliverables — eval-tracker, eval-dashboard, auto_code_review hook
description: File creati in S181 WAVE 3 P8 per osservabilità delegation performance + code review automatico
type: project
---

WAVE 3 P8 completata in S181. Deliverable prodotti e testati 5/5 PASS.

**File creati:**
- `~/venture-os/components/eval-tracker/eval.py` — API log_delegation(), mount T7 check + fallback ~/Library/Application Support/VOS/eval.jsonl, lock via fcntl
- `~/venture-os/components/eval-tracker/eval_dashboard_core.py` — motore Python dashboard (import da eval-dashboard.sh via EVAL_DRY_RUN env var)
- `~/venture-os/scripts/eval-dashboard.sh` — bash wrapper: mount check, lock via mkdir atomico (flock non disponibile macOS Big Sur), chiama eval_dashboard_core.py
- `~/Library/LaunchAgents/com.vos.eval-dashboard.plist` — LaunchAgent 07:00 daily, RunAtLoad=false, log in ~/Library/Logs/VOS/ (NON T7 — vincolo S176)
- `~/.claude/hooks/auto_code_review.py` — PostToolUse hook Edit|Write: triggera Task code-reviewer se file .py/.sh/.ts/.tsx >20 righe, path non in skiplist

**Patch settings.json:**
- Aggiunto PostToolUse matcher "Edit|Write" per auto_code_review.py (primo nel blocco PostToolUse, prima di Bash)
- Backup: settings.json.bak.s181-wave3-20260518-105842

**Decisione chiave:** lock bash via `mkdir` atomico invece di `flock` — flock è util-linux, non disponibile su macOS Big Sur. mkdir POSIX-garantito atomico.

**Why:** flock mancante causa script che non si avvia su macOS. Pattern già visto S176 con exit 78.
**How to apply:** ogni script bash con lock su macOS → `mkdir LOCKDIR` + `trap rmdir EXIT`.
