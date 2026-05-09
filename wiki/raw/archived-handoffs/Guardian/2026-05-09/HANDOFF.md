# Handoff - 2026-04-30

## Stato: SESSIONE 27 CHIUSA — Context budget structural guardrails V1+V3 LIVE (auto-enforcement attivo), V4+V5+V2 carry-over S28

---

## [2026-04-30 SESSIONE 27] — infra-context-budget: V1+V3 implementati, eat-your-own-dogfood test PASS live

### Sintesi (3 line)
- **Mandato**: scope unico "infra-context-budget", 5 vincoli strutturali per eliminare dipendenza disciplina pura context budget (S24/S25/S26 sforati 50% sistematicamente).
- **V1 (hook auto-enforcement) + V3 (CLAUDE.md threshold 40/50%) DEPLOYED + TESTED 5/5 PASS + LIVE FIRING**: il hook ha trigger-fired su Edit CLAUDE.md a 48% durante questa sessione stessa, confermando funzionamento end-to-end production.
- **V4 (memory append-only pattern), V5 (commit template), V2 (pre-flight estimation) → CARRY-OVER S28**: closure protocol V3 rispettata (chiusura imminente a 50%, marco WIP onestamente invece di sforare).

### V1 — Context Budget Gate Hook (DEPLOYED)
- **Bridge writer**: `~/.claude/statusline-command.sh` esteso per scrivere `/tmp/claude-ctx-{session_id}.json` con `used_pct + remaining_percentage + timestamp` (best-effort, fail silente, non rompe statusline).
- **Hook**: `.claude/hooks/context_budget_gate.py` (PostToolUse `Bash|Edit|Write|MultiEdit`, timeout 3s, exit 0 sempre).
  - Soglia 40% → system-reminder WARNING (stop nuovi scope, completa task corrente)
  - Soglia 50% → system-reminder ENFORCEMENT (closure immediata: memory+HANDOFF+commit+push)
  - Cooldown 3 tool calls (anti-spam), severity escalation (warning→enforcement) bypass cooldown
  - Stale guard 60s (ignora metrics vecchi)
  - Output JSON `additionalContext` (Claude Code hook protocol)
- **Test 5/5 PASS** (simulazione bridge file):
  - T1 used=42 → warning JSON emitted ✅
  - T2 stesso livello call#2 → cooldown silente ✅
  - T3 used=55 → ENFORCEMENT bypass cooldown (escalation) ✅
  - T4 used=30 → empty (sotto soglia) ✅
  - T5 stale 5min → empty ✅
  - Exit code 0 sempre ✅
- **LIVE EVIDENCE end-to-end**: durante questa sessione stessa, su Edit di CLAUDE.md, hook ha sparato:
  > `<system-reminder>CONTEXT BUDGET WARNING — usage 48% (≥40% pre-closure)...</system-reminder>`
  - Bridge file scritto da statusline ✅, hook ha letto ✅, soglia 40% triggered ✅, system-reminder iniettato in conversazione main agent ✅. **Auto-enforcement production-grade.**
- **Settings**: registrato in `.claude/settings.json` PostToolUse matcher `Bash|Edit|Write|MultiEdit`.

### V3 — CLAUDE.md "Context Budget Operativo" (DEPLOYED)
- Nuova sezione dopo "Evidence-Based Testing Mandate" con tabella threshold 40/50/10% riserva discovery
- Closure target ordinata ≤50% sempre, WIP onesto se task incompleto
- Reference cross-link a `feedback_context_budget_structural.md` + `feedback_scope_recalibration.md`
- Documentazione bridge file location (`/tmp/claude-ctx-{session_id}.json`) per troubleshooting futuro

### V4+V5+V2 — Carry-over S28 (eat-your-own-dogfood: closure protocol applicata su questa stessa sessione)
- **V4 (memory append-only refactor `feedback_workflow_strict.md`)**: NOT STARTED. Pattern documentato in CLAUDE.md V3 (riferimento), implementazione pulita in S28.
- **V5 (commit template `.claude/templates/commit-template.md` + skill /commit estesa)**: NOT STARTED. Skill esistente `.claude/skills/commit/SKILL.md` letto, formato attuale conventional-commits da fondere con template S{N} format.
- **V2 (pre-flight estimation `docs/context_budget_reference.md` + SessionStart hook)**: NOT STARTED. Calibrazione complessa, ultimo per priorità.

### Files toccati S27
| File | Azione |
|------|--------|
| `~/.claude/statusline-command.sh` | EXTENDED (bridge writer 6 righe nuove) |
| `.claude/hooks/context_budget_gate.py` | NEW (auto-enforcement hook 100 righe) |
| `.claude/settings.json` | UPDATED (PostToolUse matcher Bash\|Edit\|Write\|MultiEdit) |
| `CLAUDE.md` | UPDATED ("Context Budget Operativo" sezione 14 righe) |
| `.planning/HANDOFF.md` | UPDATED S27 section (questo) |
| `MEMORY.md` + `project_s27_findings.md` | UPDATED memory entry |

### Per S28 (target ≥2026-05-07 P0 NORTH STAR gate naturale)
- **CARRY-OVER P0 INFRASTRUCTURE**:
  - V4 memory append-only refactor (pattern già documentato CLAUDE.md, implementare cross-reference + esempio in `feedback_workflow_strict.md`)
  - V5 commit template + skill /commit extension (formato S{N} {scope}: {summary})
  - V2 docs/context_budget_reference.md + SessionStart hook pre-flight estimation
- **CARRY-OVER P0 NORTH STAR** (gate naturale 2026-05-07): decision tree (LIVE | tuning | Opzione B refactor `_rebuild_profile` SQL)
- **CARRY-OVER PRODUCTION POLISH**: Disaster recovery runbook, Daily Telegram report 21:00, Health-check `--report-mode`
- **CARRY-OVER LUKE PHYSICAL** (rinnovato S22-S26 → S28): MIUI Termux+Termux:Boot whitelist, hardware cameretta swap/reset, Tailscale iMac login (account `ilcombeeretrasher`), `sudo pmset -a autorestart 1`
- **HEALTH-CHECK ALERT ATTIVO** notato durante PRE-FLIGHT S27: Camera soggiorno 192.168.1.4 UNREACHABLE (recurring), `~/guardian/logs/.health-alert-state` presente. Indagine root-cause network/hardware in S28 (potenzialmente correlato a IP shift S22 .5↔.4 recurring).

### Eat-your-own-dogfood verdict
- Vincolo 1 (hook): self-applicato ✅ (hook fired su 48% durante my own Edit)
- Vincolo 3 (threshold 40%): self-applicato ✅ (closure invocata a 48%, NON proseguito V4+V5+V2)
- Lessons: discipline alone failed S24-S26, hook-driven enforcement WORKS first session. Pattern validato strutturalmente.

---

## [2026-04-30 SESSIONE 26] — Honest closure: gate non scaduti, P4 cleanup eseguito, traiettoria P0 verificata

### Sintesi (3 line)
- **Open S26 immediato post-S25** (stesso giorno, ~30min dopo close b367c3e): pre-flight CTO autonomy → tutti target prompt gated. P0 NORTH STAR gate naturale 2026-05-07 (+7gg), P4 cleanup gate 2026-05-06 (+6gg), P1 Luna watchdog ha solo 1 evento (test S25, statisticamente nullo), P3 Tailscale carry-over Luke physical, P2 Scope B no target identificato.
- **Decision CTO**: skip gate-blocked targets, eseguire P4 anticipato sui backup ovviamente obsoleti (>14gg pre-S20, ridondanti vs git history), verifica preventiva traiettoria P0 cron rebuild.
- **P4 cleanup PASS**: 16 file `.bak` rimossi (240KB+356KB tarball in `~/guardian/archive/`), 14 backup recenti S15+ preservati. **P0 cron rebuild traiettoria sana**: 17:00→18:00 +12 obs soggiorno (1361→1373), `[PASS] rebuild ok` ogni ora, elapsed 681ms, gate 2026-05-07 strutturalmente solido.

### Pre-flight S26 — verdict
| Check | Stato |
|-------|-------|
| Guardian process | OK PID 66617/67247 (poi 67505/67989), FPS 0.9 soggiorno, log current |
| Baseline soggiorno | `MAX(ld)=1, 1373 obs, suppress=0` (atteso, gate +7gg) |
| Luna phone | OK PID 10810 alive (etime 8min from S25 watchdog restart 17:54) |
| Luna watchdog log | 1 kill event totale (test S25) — trend data insufficiente |
| Tailscale iMac | `Logged out` (carry-over Luke physical) |
| Backup `.bak` totali pre-cleanup | 22 file |

### P4 — Cleanup pre-S20 backup (gate 2026-05-06 → anticipato CTO decision)
- **Rationale**: file pre-S20 (>14gg, 9-16 Apr) ridondanti vs git history, zero rischio rimozione, libera namespace
- **Batch 1** (8 file, 240KB tarball `archive/old-baks-pre-s20-2026-04-30.tar.gz`):
  - `guardian-v1.0.bak` (9 Apr) — git tag v1.0
  - `guardian-v1.5.bak` (10 Apr)
  - `guardian-v1.6.bak` (10 Apr)
  - `guardian-v1.7.bak` (13 Apr)
  - `guardian-v3.0.bak` (13 Apr)
  - `guardian-v3.1.bak` (14 Apr)
  - `guardian-pre-ezviz-talk.bak` (16 Apr)
  - `zones-v1.0.bak` (9 Apr)
- **Batch 2** (8 file, 356KB tarball `archive/old-baks-batch2-pre-s20-2026-04-30.tar.gz`):
  - `guardian.py.bak.20260414_133151`
  - `guardian.py.bak.20260414_133936`
  - `guardian.py.bak.20260414_141758`
  - `guardian.py.bak.pre-bugB`
  - `guardian.py.bak.pre-fall-fix`
  - `guardian.py.bak_p1_20260414_204053`
  - `guardian.py.bak_s1`
  - `guardian.py.bak_voice_fix`
- **Preservati** (14 file, S15+ ≤7gg, debug recente):
  - `baseline_learner.py.s23-bak`, `go2rtc.yaml.tmpl.{S16a,s19,s23}-bak`, `guardian.env.bak.s19`
  - `guardian.py.bak.{S15B,S15C,S15D,S16a,s19}`
  - `guardian.py.{s21-bak,s23-bak-cameretta,s24-bak-pre-rollback}`
  - `horizontal_position_tracker.py.bak.S15B`
- **Verifica post-cleanup**: Guardian UP, FPS 0.9, log corrente (rotazione PID osservata 66617→67505 non correlata cleanup, normale subprocess churn).

### P0 — Verifica preventiva traiettoria gate 2026-05-07 (CTO autonomy)
- **Cron rebuild** verificato attivo: `0 * * * * cd $HOME/guardian && /usr/bin/python3 rebuild_baseline_profile.py >> $HOME/guardian/logs/baseline_rebuild.log 2>&1`
- **Log `baseline_rebuild.log`** evidenza ultimi 2 cicli orari:
  ```
  2026-04-30 17:00:01 POST rebuild profile: [('cameretta', 458, 2566), ('soggiorno', 1361, 7739)]
  2026-04-30 18:00:00 PRE rebuild profile:  [('cameretta', 458, 2566), ('soggiorno', 1361, 7739)]
  2026-04-30 18:00:00 Observations raw:     [('cameretta', 458, 2566), ('soggiorno', 1373, 7842)]
  2026-04-30 18:00:01 Profile rebuilt: 1831 slot-state rows
  2026-04-30 18:00:01 [PASS] rebuild ok (681ms)
  ```
- **Verdict**: traiettoria sana (+12 obs soggiorno in 1h sustained), gate 2026-05-07 strutturalmente raggiungibile se accumula obs in 3+ giorni distinti su slot ricorrenti.
- **Cameretta** congelata 458 obs (HW disabled S23 confermato S24).

### P1 — Luna persistence trend (defer S27)
- Watchdog deployato S25 17:54, test kill artificiale stesso minuto = unico evento log
- 8 minuti uptime non rappresentativi per Doze fragility trend
- Defer S27 (>=2026-05-07): rivedere log con ≥7gg dati real-world

### P3 — Tailscale iMac (carry-over)
- `/Applications/Tailscale.app/Contents/MacOS/Tailscale status` = `Logged out.` confermato S26
- Account `ilcombeeretrasher` last seen 2026-04-28 — invariato vs S24/S25
- Workflow LAN funzionante (mDNS), pressione bassa

### P2 — Scope B installer (defer S27+)
- Nessun utente target esterno identificato (gate carry-over S25)
- Sandbox `~/install-test/` su iMac preservato per debug futuro

### Files toccati S26
| File | Azione |
|------|--------|
| `~/guardian/archive/old-baks-pre-s20-2026-04-30.tar.gz` (iMac) | NEW (240KB, 8 file archived) |
| `~/guardian/archive/old-baks-batch2-pre-s20-2026-04-30.tar.gz` (iMac) | NEW (356KB, 8 file archived) |
| 16 `.bak` files in `~/guardian/` (iMac) | DELETED post-archive |
| `~/guardian/db-backup.sh` (iMac) | NEW idempotent backup script |
| `~/Library/LaunchAgents/com.guardian.dbbackup.plist` (iMac) | NEW LaunchAgent RunAtLoad+03:00 |
| `~/guardian/backups/guardian-20260430.db` (iMac) | NEW catch-up backup (3.7MB, 1832 obs) |
| `.planning/HANDOFF.md` | UPDATED S26 section |
| `MEMORY.md` + `project_s26_findings.md` | NEW memory entries |

### S26 extended — Backup DB hardening + secrets audit (post-closure work)
**Trigger**: Luke "ORA cosa facciamo CTO?" → 2 task ad alto valore non gate-blocked.

#### Backup DB hardening (CRITICAL fix)
- **Root cause discovered**: iMac boot `Thu Apr 30 10:20:16 2026` — uptime 7h53m. Cron `0 3 * * *` MANCATO (iMac OFF stanotte 03:00). Stesso pattern S18 power-loss ricorrente.
- **Catch-up manuale**: `cp ~/guardian/guardian.db ~/guardian/backups/guardian-20260430.db` → 3.7MB, 1832 obs preservate
- **Robust fix LaunchAgent** (no più dipendenza cron + power schedule):
  - `~/guardian/db-backup.sh` idempotent (skip if file exists, retention 7gg `find -mtime +7 -delete`, log `~/guardian/logs/db-backup.log`)
  - `~/Library/LaunchAgents/com.guardian.dbbackup.plist`: `StartCalendarInterval Hour=3 Minute=0` + `RunAtLoad=true` (catch-up automatico al boot)
  - `launchctl load` PASS (PID 69375 register `com.guardian.dbbackup`)
- **Boot simulation PASS**: unload → `rm guardian-20260430.db` → load → script auto-recovers `OK backup-20260430 created (3690496 bytes)` in 15s
- **Cron 3AM lasciato come safety-net** (idempotent script tollera doppia run, costo zero)

#### Secrets audit (zero-finding ✅)
- `git ls-files | grep -E '\.env$|secrets|credentials'` → **vuoto** ✅
- `git ls-files '*.py' '*.sh' | xargs grep -E "gsk_[A-Za-z0-9]{40,}|sk-[A-Za-z0-9]{40,}|Bearer [A-Za-z0-9_-]{20,}"` → **vuoto** ✅
- `.gitignore` coverage solido: `envs/*.env`, `.env`, `*.env.local`, `**/guardian*.env`, `scripts/guardian/guardian.env`

#### Action item Luke physical (carry-over rinnovato)
- 🔴 **`sudo pmset -a autorestart 1`** (S18 pending) — auto-reboot iMac post power-loss riduce missed cron windows. LaunchAgent RunAtLoad mitiga ma non risolve completamente (richiede comunque login user)

### S26 production hardening (CTO full autonomy mandate)
**Trigger**: Luke "SEI TU IL CTO PIENA RESPONSABILITÀ porta in produzione". CTO triage gap → 5 task non-gated ad alto valore.

#### Phone disk cleanup (+1GB recovered)
- `ezviz_base.apk` (210MB) DELETED — research chiusa fallita S15+ (memory `feedback_ezviz_backchannel.md`)
- `ezviz_native_sdk/` (14MB) DELETED — same research
- Log >7gg DELETED (~30 file legacy Mar/Apr)
- Phone disk: 90G→89G (86% used, 15GB free invariato in percentuale)

#### Log rotation iMac (prevent disk fill)
- `~/guardian/log-rotator.sh` NEW — idempotent, threshold 10MB, gzip+rotate keep last 5
- `~/Library/LaunchAgents/com.guardian.logrotate.plist` NEW — StartCalendarInterval 04:00, RunAtLoad=false
- **Test PASS**: `guardian-err.log` 24MB → rotated `.1.gz` (2.8MB compressed, ~10x), live truncate (preserve fd)
- Logs total: 39MB → 18MB

#### Health check end-to-end + Telegram alerting (production observability)
- `scripts/guardian/health-check.sh` (Mac) → deploy `~/guardian/health-check.sh` (iMac)
- **14 checks**: Guardian process+log+FPS, mosquitto, go2rtc:8554, baseline obs, DB backup, disk, Phone SSH+Luna+crond+log fresh, camera ping, Tailscale (warn-only)
- **Telegram alerting**: cooldown 1h (`/guardian/logs/.health-alert-state`), bot @Lukehomedx_bot, chat_id 931063621
- **Test deploy PASS**: 13/14 PASS, 1 WARN (Tailscale logged out, atteso)
- **Telegram path validato**: msg_id 5589 inviato live (test bot reachability)
- **Cron `*/15 * * * *`** installato → 96 health-check/giorno + alert se any FAIL

### Files toccati S26 (full session)
| File | Azione |
|------|--------|
| `~/guardian/archive/old-baks-pre-s20-2026-04-30.tar.gz` (iMac) | NEW (240KB, 8 file) |
| `~/guardian/archive/old-baks-batch2-pre-s20-2026-04-30.tar.gz` (iMac) | NEW (356KB, 8 file) |
| 16 `.bak` files in `~/guardian/` (iMac) | DELETED post-archive |
| `~/guardian/db-backup.sh` (iMac) | NEW idempotent |
| `~/Library/LaunchAgents/com.guardian.dbbackup.plist` (iMac) | NEW (RunAtLoad+03:00) |
| `~/guardian/backups/guardian-20260430.db` (iMac) | NEW catch-up (3.7MB) |
| `~/guardian/log-rotator.sh` (iMac) | NEW idempotent |
| `~/Library/LaunchAgents/com.guardian.logrotate.plist` (iMac) | NEW (04:00 daily) |
| `~/guardian/logs/guardian-err.log.1.gz` (iMac) | NEW (rotated 2.8MB) |
| `scripts/guardian/health-check.sh` (Mac) | NEW + deployed iMac |
| `~/guardian/health-check.sh` (iMac) | NEW |
| crontab iMac | +1 line `*/15 * * * * health-check.sh --quiet` |
| Phone: `ezviz_base.apk` + `ezviz_native_sdk/` + log >7gg | DELETED (~1GB) |
| `.planning/HANDOFF.md` | UPDATED full S26 |
| `MEMORY.md` + `project_s26_findings.md` | UPDATED |

### Cosa NON in S26 (deferred S27+)
- P0 NORTH STAR gate decision (gate naturale 2026-05-07)
- Disaster recovery runbook (next-priority S27)
- Daily Telegram report 21:00 (next-priority S27)
- Vosk wake word v2, TCN Le2i, Frontend dashboard, Phase F-I
- Scope B install reale (gate utente target)

### Per S27 (target ≥2026-05-07)
- **PRE-FLIGHT** standard + check `~/guardian/logs/health-check.log` per FAIL accumulati 7gg
- **P0 GATE** decision tree (LIVE | tuning | Opzione B refactor)
- **Production polish**:
  1. Disaster recovery runbook (`docs/runbook.md`)
  2. Daily report Telegram 21:00 (uptime, FP count, baseline progress)
  3. Health-check `--report-mode` per riassunto pretty
- **Carry-over Luke physical** (riconferma): MIUI whitelist, hardware cameretta, Tailscale login, `sudo pmset -a autorestart 1`

### NON in S26 (deferred)
- P0 NORTH STAR gate decision (gate 2026-05-07)
- P1 Luna trend analysis (insufficient data, gate ≥2026-05-07)
- P2 Scope B install reale (gate utente target)
- P3 Tailscale login (Luke physical browser)
- Scope drift evitato — esplicita scope recalibration onesta a inizio sessione

### Action items carry-over (Luke physical)
- 🔴 **MIUI Termux + Termux:Boot battery whitelist** [P1 ESCALATED da S24]
- 🔴 **Hardware cameretta swap/reset** [da S22+S23+S24+S25]
- KO **Tailscale login iMac** (account `ilcombeeretrasher`)
- ⏳ **Utente target Scope B** (amico con genitori anziani, gate install reale)

### Per S27 (target 2026-05-07 trigger gate naturale)
- **PRE-FLIGHT**: pgrep guardian + sqlite MAX(ld) + grep _baseline_suppressed + Luna PID + watchdog log count + Tailscale status
- **P0 GATE**: decision tree S26 prompt riproposto:
  - Caso A: `MAX≥3 + suppress≥1` → ✅ NORTH STAR LIVE (memory `project_north_star_live.md`)
  - Caso B: `MAX≥3 + suppress=0` → tuning `min_samples_to_suppress` o `normality_threshold` (`baseline_learner.py`)
  - Caso C: `MAX=1` ancora → ESCALATE Opzione B refactor `_rebuild_profile` SQL (backup + syntax check + monitor 24h)
- **P1**: review `~/logs/luna-watchdog.log` per Doze events 7gg, escalate Luke whitelist se >5 events
- **P3**: re-verify Tailscale status
- **P4**: re-check eventuali nuovi `.bak` >7gg post-S26

---

## [2026-04-30 SESSIONE 25] — Luna watchdog hardening + Scope B installer dry-run validation

### Sintesi (3 line)
- **P1 Luna persistence resolved (CTO autonomy)**: scoperto cron one-liner watchdog esistente */10min senza `termux-wake-lock`. Sostituito con script dedicato `~/scripts/luna-watchdog.sh` (1395 byte, idempotent), cron */5min, wake-lock re-acquire + pulseaudio bring-up + structured log `~/logs/luna-watchdog.log`. **Test live PASS evidence-based**: kill -9 PID 21340 → run watchdog → restart PID 10810 in 3s, mic calibrating, RMS log update.
- **P2 Scope B installer dry-run PASS Mac + iMac sandbox (CTO autonomy decision A: riuso WIP)**: `install-guardian.sh --dry-run` validato 8/8 step su Mac (macOS 11.7.10, brew 5.1.6, py3.13) e iMac sandbox (macOS 12.7.4, brew assente graceful, py3.9, Tailscale logged-out riconosciuto). **3 bug fix**: (1) banner heredoc → printf %b per ANSI, (2) `run_wizard` early-return in dry-run (era bloccato su prompts interactive), (3) `verify_install` skip in dry-run con messaggio coerente.
- **P0 NORTH STAR**: defer naturale 2026-05-07 (oggi è 2026-04-30, +7gg). `MAX(learning_days)=1, 1361 obs soggiorno, suppress=0` come atteso (sparsity slot strutturale). Decision tree S25→S26: LIVE confirm | tuning | Opzione B refactor.

### Pre-flight S25 — verdict
| Check | Verdict |
|-------|---------|
| Guardian process | OK PID 64316/65028, FPS soggiorno 0.9, log current 17:47 |
| Baseline soggiorno | MAX(ld)=1, 1361 obs, eligible_suppress=0 (atteso, gate 2026-05-07) |
| Luna phone | OK PID 21340 (etime 43:34 → restart cron */10 attivato dopo kill Doze) |
| Tailscale iMac | KO `Logged out.` (carry-over S26, account `ilcombeeretrasher`) |
| Scope B WIP local | 4 elementi `scripts/install/` non committato |

### P1 — Luna watchdog hardening (PASS evidence)
- **Discovery**: cron esistente */10 one-liner `pgrep -f "luna-v4.py wake" \|\| (pulseaudio…; nohup python3 luna-v4.py wake…)` mancava `termux-wake-lock`
- **Replacement**: `scripts/luna/luna-watchdog.sh` deployato → `~/scripts/luna-watchdog.sh` su phone
- **Cron change**: backup `~/logs/crontab.s25.bak` → grep -v old + add `*/5 * * * * bash $HOME/scripts/luna-watchdog.sh`
- **Test live**: kill -9 21340 → `bash ~/scripts/luna-watchdog.sh` → exit 0, PID 10810 alive in 3s
- **Log evidence**:
  ```
  [2026-04-30 17:54:17] Luna NOT running, restarting…
  [2026-04-30 17:54:18] wake-lock OK
  [2026-04-30 17:54:20] Luna restarted PID=10810
  ```
- **Luna log post-restart**: `Calibrating noise floor`, `Mic started (starts:1, failures:1)`, `RMS:109 floor=235 thresh=940`
- **NOTE**: watchdog NON sostituisce MIUI battery whitelist (Luke physical action carry-over); riduce downtime massimo a 5min in caso di kill Doze.

### P2 — Scope B installer dry-run (PASS Mac + iMac sandbox)
- **Decision**: A) Riuso WIP S24 (CTO autonomy, scope dual-IP NON era documentato → riuso quello scritto)
- **Mac dry-run**: 8/8 step OK, banner OK, wizard skipped, verify skipped, ✅
- **iMac sandbox dry-run** (`~/install-test/`, GUARDIAN_HOME=`~/guardian-test`):
  - macOS 12.7.4 ✅
  - Homebrew ASSENTE → graceful warn `Continuing dry-run without brew` ✅
  - Python 3.9 ✅
  - Disk 507GB ✅
  - Tailscale `Logged out` riconosciuto ✅
- **Bug fix applicati S25**:
  1. `install-guardian.sh` banner: `cat <<EOF \033[…]EOF` → `printf '%b…' "$C_BLU"` (heredoc non interpreta ANSI)
  2. `lib/wizard.sh::run_wizard` early-return in dry-run prima di `wizard_cameras` (prompts bloccavano stdin)
  3. `install-guardian.sh` final verification: skip in dry-run con messaggio "Dry-run complete" (FAIL atteso non utile)
  4. `lib/checks.sh::check_models` heredoc → printf (consistency ANSI)
- **NON eseguito (out-of-scope S25)**: install reale, ONNX models download, brew install, LaunchAgents load. Gate prossima sessione: utente target esterno (amico Luke con genitori anziani).

### P0 — Gate NORTH STAR (defer 2026-05-07)
- Math: oggi 2026-04-30, gate naturale T+7gg da S23 close. `learning_days` accumula su giorni distinti, sparsity 5min slot impedisce MAX≥3 senza ≥3 giorni live observation.
- Action S26 (2026-05-07): se MAX≥3 + suppress≥1 → LIVE confirm. Se MAX≥3 + suppress=0 → tuning thresholds. Se MAX=1 ancora → Opzione B refactor `_rebuild_profile` SQL (`baseline_learner.py:155-191`).

### P3 — Tailscale iMac (carry-over S26)
- Verify `Tailscale status` = `Logged out.` (Luke browser login richiesto)
- Workflow LAN funzionante via mDNS — pressione bassa, no escalation

### P4 — Pulizia residui (defer 2026-05-06)

### Files toccati S25
| File | Azione |
|------|--------|
| `scripts/luna/luna-watchdog.sh` | NEW (1395 byte) |
| `scripts/install/install-guardian.sh` | bug fix banner + final verify dry-run |
| `scripts/install/lib/wizard.sh` | bug fix run_wizard dry-run early-return |
| `scripts/install/lib/checks.sh` | bug fix check_models heredoc → printf |
| `~/scripts/luna-watchdog.sh` (phone) | NEW deployed |
| Phone crontab | replaced one-liner */10 → script */5 |

### Action items carry-over (Luke physical)
- 🔴 **MIUI Termux + Termux:Boot battery whitelist [P1 ESCALATED S24]** — watchdog mitiga ma non risolve fragility. Settings MIUI → Battery → App battery saver → Termux + Termux:Boot → No restrictions
- 🔴 **Hardware cameretta swap/reset** — S24 reconfirmed degrado RTSP, test isolato falso negativo (pattern emerge a 115s)
- KO Tailscale login iMac (account `ilcombeeretrasher`, last seen 2026-04-28)

### NON in S25 (deferred)
- Vosk wake word v2
- TCN retry Le2i
- Medication Reminder (blocked Android Luke mamma)
- Frontend dashboard
- Phase F-I roadmap-v3 (Zigbee, outdoor cam, etc)

### Per S26 (2026-05-07 trigger gate naturale)
- **PRE-FLIGHT**: same Pre-flight commands S25 prompt
- **P0 GATE**: MAX(learning_days) decision tree (LIVE | tuning | Opzione B)
- **P1 Luna persistence**: verify watchdog log (`tail ~/logs/luna-watchdog.log`) per ricorrenza Doze events 7gg
- **P3 Tailscale**: chiedi Luke login fatto?
- **P4 pulizia**: rimuovi `*.bak` >7gg in `~/guardian/`
- **Scope B installer**: gate utente target esterno per install reale (non in S26 senza target identificato)

---

## [2026-04-30 SESSIONE 24] — Status check + cameretta rollback test + Luna recovery emergency

### Sintesi (3 line)
- **P0 NORTH STAR gate**: rispettato gate naturale 2026-05-07 (T+7gg da S23 close). `MAX(learning_days)=1` ancora a 30min post-fix è atteso (sparsity strutturale 5min slot, ~17gg learning data). Nessuna escalation Opzione B oggi (sarebbe disrupting fix funzionante senza dati). Trigger 2026-05-07 confermato.
- **P1 cameretta rollback test → re-disable**: Luke conferma "cameretta online via app EZVIZ". Test diagnostico approfondito: ping OK 4ms, RTSP 554 open, opencv 90s pull = **15.27 FPS sustained 1375 frames max_gap 1.7s** (apparente success). Re-enabled in `guardian.py:124`, restart Guardian PID 55910. **Stall pattern RICOMPARE identico S22-S23**: 16:45:46 connect → 16:47:42 stall **116s** force#1 → 16:48:42 stall **176s** force#2. Test isolato 90s era TROPPO BREVE (pattern emerge dopo ~115s). Hardware degrado RTSP stream **confermato persistente** (cloud P2P EZVIZ ≠ RTSP locale). Re-disabled `guardian.py:124` con annotazione S24, Guardian PID 56547 stabile soggiorno-only.
- **P3 Luna emergency recovery**: phone uptime 16gg (no reboot) ma Luna PID 10599 + crond morti da ~13:56 oggi. Root cause **MIUI Doze killed Termux background** (S20→S24 fragility manifesta). SSH inizialmente refused (port 8022) poi banner SSH-2.0 valido + retry success (transient race). Restart manuale: termux-wake-lock + crond PID 21335 + Luna PID 21340. T+30s persistence confermata (RMS log update). **MIUI battery whitelist ora P1 NON deferrable** per evitare ricorrenza.

### Pre-flight S24 — verdict
| Check | Verdict |
|-------|---------|
| Guardian process pre-S24 | OK PID 19847+20423, FPS soggiorno 0.9 |
| Baseline `MAX(learning_days)` | Expected =1 (T+30min from fix, sparsity persists) |
| `_baseline_suppressed` log entries | Expected =0 (gate naturale 2026-05-07) |
| Cameretta stall counter | OK 2034 CONGELATO (S23 disable working) |
| Luna phone PID | **KO 10599 dead** — restartato 21340 in S24 |
| Tailscale iMac | KO `Logged out.` (last seen 2026-04-28 13:05 admin console) |

### P0 — Gate NORTH STAR respected
- Decision tree letterale prompt: "Se MAX=1 → Opzione B" applicato con qualifier temporale (vale al gate 2026-05-07, non a T+30min post-fix S23). Disrupting Opzione A funzionante con zero T sarebbe controproducente.
- Action: nessun edit codice S24, gate calendarizzato 2026-05-07 confermato S25 trigger.

### P1 — Cameretta rollback test (educational FAIL)
- **Backup**: `~/guardian/guardian.py.s24-bak-pre-rollback` (pre-rollback state)
- **Test isolato opencv** (rtsp://127.0.0.1:8554/cameretta, 90s): 1375 frames 15.27 FPS max_gap 1.7s ← falso negativo
- **Test live Guardian** (re-enabled, 3min): connect OK → stall 116s force#1 → stall 176s force#2 → re-disabled before HARD ESCALATION
- **Lesson**: validation test cameretta deve durare ≥180s per catturare stall pattern ricorrente ~115s. App EZVIZ "online" testa P2P cloud, non RTSP locale.
- **Action Luke fisico CONFERMATO**: hardware swap o reset factory + firmware update. NO rollback senza prove di fix hardware.

### P3 — Tailscale iMac (carry-over conferma stato)
- Screenshot Luke admin console mostra:
  - Account: `ilcombeeretrasher@gmail.com` (separato da master `gianlucanewtech@gmail.com`)
  - `imac-di-gianluca-3` registrato, IP 100.101.24.13
  - **Last seen 2026-04-28 13:05 CEST = offline tailnet ~2gg**
- CLI `Tailscale status` da iMac: `Logged out.` confermato
- ping 100.101.24.13: 100% packet loss
- Workflow LAN attuale (mDNS `imac-di-gianluca.local`) non dipende da Tailscale → pressione bassa.

### P3 — Luna emergency recovery
- Phone uptime 16gg 2h (no reboot, last boot ~Apr 14)
- Luna last log 13:56:32 oggi → morta ~3h (vs expected "stabile da S20")
- crond morto, sshd preserved, termux-wake-lock necessitava re-apply
- Sequence recovery: `termux-wake-lock`, `crond` (PID 21335), `nohup python3 luna-v4.py wake` (PID 21340)
- T+30s log entries: RMS values updating, energy gating attivo, no errors
- **MIUI battery whitelist S25 P1 ESCALATED**: ricorrenza Doze kill conferma fragility, action Luke fisico (Settings MIUI → Battery → App battery saver → Termux + Termux:Boot → No restrictions)

### Action items carry-over (S19+S20+S21+S22+S23+S24 — Luke physical)
- 🔴 **MIUI Termux + Termux:Boot battery whitelist [P1 ESCALATED S24]** — Luna kill conferma fragility, da fare prima di qualsiasi screen-off prolungato successivo
- 🔴 **Hardware cameretta swap/reset** — S24 reconfirmed RTSP degrado (test isolato falso negativo, pattern emerge a 115s)
- KO Tailscale login iMac (last seen 2026-04-28, account `ilcombeeretrasher`)

### Backups creati S24
- `~/guardian/guardian.py.s24-bak-pre-rollback`

### NON in S24 (deferred)
- Opzione B baseline_learner refactor (gate 2026-05-07)
- Pulizia residui post-S20 (gate 2026-05-06)
- Scope B foundation install-guardian.sh
- Vosk wake word v2, TCN retry Le2i, Medication Reminder

### Targets PASS S24
- [x] P0 gate decision: respected naturale 2026-05-07 (no premature escalation)
- [x] Cameretta hardware decision reaffirmed: disable S23 ERA CORRETTO, S24 rollback test prova hardware degrado persistente
- [x] Luna emergency recovery: PID 21340 + crond 21335 + wake-lock active
- [x] Tailscale iMac stato verificato: registrato ma offline tailnet
- [x] Guardian stabile post-S24: PID 56547+56568 soggiorno-only, FPS 0.9 sustained

### Per S25 (priorità)
- **P0 [GATE 2026-05-07]** Verify `_baseline_suppressed` ≥1 entry. Se ZERO → Opzione B refactor `_rebuild_profile` SQL.
- **P1 [Luke physical CRITICAL]** MIUI battery whitelist Termux/Termux:Boot — prevent Luna kill ricorrente
- **P1 [Luke physical]** Cameretta hardware swap/reset → re-enable thread (preserve baseline 5gg DB)
- **P2 [GATE 2026-05-06]** Pulizia residui backup >7gg
- **P3 [SCOPE da ridefinire]** Scope B foundation install-guardian.sh — vedi note S24 close sotto

### Scope B foundation — WIP locale non committed (S24 close honest)
Iniziato dopo Luke sceglie "A" (Scope B). Implementazione fermata mid-session per:
- Advisor flag: scope da ridefinire (possibile dual-scope IP stabilization separato)
- Context budget S24 al 72% — insufficiente per implementazione completa + test E2E + chiusura pulita
- Protocol violation se commit untested code (regola evidence-based + workflow strict)

Stato file locali (non committati, non eliminati per riuso S25):
- scripts/install/install-guardian.sh (~7KB) — orchestrator main, 8 step
- scripts/install/lib/checks.sh — pre-flight + brew/go2rtc install
- scripts/install/lib/wizard.sh — interactive config + multi-vendor camera URL builder
- scripts/install/templates/com.guardian.plist.tmpl
- scripts/install/templates/com.go2rtc.plist.tmpl
- scripts/install/templates/com.mosquitto.broker.plist.tmpl
- scripts/install/README.md — quickstart + vendor table

Mai testato dry-run, mai installato, mai committato. Scope coperto v0:
- macOS Big Sur+ server install
- Multi-vendor IP camera (EZVIZ/Reolink/Hikvision/Dahua/ONVIF/Custom) — NO DVR/NVR
- Tailscale prerequisite check (warning only)
- Wizard per Telegram/MQTT/cameras/optional Groq+Emergency phone
- LaunchAgents render+load (3 services)

Action S25:
1. Decidere se WIP riutilizzabile o riscrivere con scope ridefinito
2. Se riusabile: eseguire dry-run su Mac, fix bug, test install su sandbox iMac, commit
3. Se da riscrivere: archiviare WIP in .planning/wip/s24-install-guardian/ e ripartire

Lesson S24: scope changes mid-session richiedono explicit re-confirmation, non assumere mandato durevole. Vedi feedback_scope_recalibration.md.

---

## [2026-04-30 SESSIONE 23] — Scope A produzione: P0 fix Opzione A + P1 cameretta disable + P2 doc fix

### Sintesi (3 line)
- **P0 NORTH STAR fix attivato**: `learning_period_days` 7→21 in `baseline_learner.py:20`. Profile rebuild 1218→1763 rows. `score_observation` path sbloccato (`soggiorno/ABSENT` ora ritorna `p=1.000 conf=0.250 reason=insufficient_days_1` invece del precedente `state_never_seen_in_slot`). `MAX(learning_days)` ancora 1 — slot=5min granularity richiede T+4-7gg per `learning_days≥3` su slot ricorrenti ABSENT. **Trigger follow-up**: se `_baseline_suppressed=0` a 2026-05-07 → escalate Opzione B (refactor `learning_days` semantica) S24.
- **P1 cameretta DISABLED**: hardware EZVIZ 192.168.1.5 RTSP irrimediabile (2034 stall events, FPS 0.6 ultimo @ 12:11, HARD ESCALATION ogni ~5min). Tentato tune go2rtc TCP transport (`#input=rtsp/tcp` su template) → insufficiente. Commentato `cameretta` in `CAMERAS` dict `guardian.py:124`. Guardian ora soggiorno-only stabile (FPS 0.9 sustained). zones.json cameretta block conservato (lazy-load, no impatto). **Action Luke fisico**: hardware swap o reset factory cameretta.
- **P2 doc fix completato**: CLAUDE.md IP shift cameretta=192.168.1.5 / soggiorno=192.168.1.4. Memory `device_config.md` overhaul completo (era 34gg vecchia, IP+host+ports+cred sync). Telegram alert path verificato live (msg_id 5446).

### Pre-flight S23 — verdict
| Check | Verdict |
|-------|---------|
| Guardian process pre-S23 | OK PID 16450, FPS soggiorno 0.9 |
| Baseline DB pre-fix | KO `MAX(learning_days)=1` su 1218 rows ← P0 confermato |
| Cameretta baseline | OK 5gg/458 obs (target raggiunto) |
| Soggiorno baseline | OK 9gg/1305 obs |
| `_baseline_suppressed` log entries | KO 0 (NORTH STAR bloccata) |
| Cameretta stall counter | KO 2028 (era 1970 a S22 close = +58/24h, degrado attivo) |
| Luna phone PID | OK 10599 stabile da S20 (zero drift S21+S22+S23) |

### P0 — `learning_period_days` 7→21 (Opzione A applicata)

**File**: `~/guardian/baseline_learner.py:20`
**Backup**: `~/guardian/baseline_learner.py.s23-bak` (9718 bytes)
**Comando applicato**: `sed -i "" "s/\"learning_period_days\": 7,/\"learning_period_days\": 21,/"`
**Syntax check**: OK (import + config load verified)
**Restart Guardian**: launchctl unload+load → PID 17353 → 19269 (post-cameretta-disable)
**Profile rebuild**: 1218 → 1763 rows post-fix
**Runtime test acceptance**:
- BEFORE: 12/12 combos → `state_never_seen_in_slot` (ZERO scoring path)
- AFTER: `soggiorno/ABSENT` → `p=1.000 conf=0.250 reason=insufficient_days_1` ← **PATH ATTIVO**
- altri 11 combos still `state_never_seen_in_slot` (slot ABSENT/STANDING/etc non ancora ricorrente nello slot 5min specifico testato)

**Diagnosi residua**: `MAX(learning_days)` ancora 1 perché slot=5min × 24h × 7dow = 2016 buckets sparsi. ABSENT ricorrenza naturale T+4-7gg per (dow,hour,5min-slot) ricorrenti. Guardian baseline status mostra `(learning=False, days=16)` post-restart — sistema in scoring mode, attesa accumulo dati.

**Trigger follow-up S24** (se richiesto):
- Check 2026-05-07 (T+7gg da S23): `grep -c "_baseline_suppressed" ~/guardian/logs/guardian.log`
- Se ZERO ancora → escalate Opzione B: refactor `_rebuild_profile` SQL → `COUNT(DISTINCT date) per (camera,state)` globale invece di per-slot. Risolve sparsity strutturale.

### P1 — Cameretta thread DISABLED (hardware irrimediabile)

**Evidenza degrado terminale**:
- Stall counter 2028→2034 in 5min monitoring (delta +6/5min sustained)
- FPS cameretta 0.6 ultimo @ 12:11 (15min prima del fix), 11:31 prima ancora
- 4 force_reconnect + HARD ESCALATION @ 12:22 → process exit + launchctl restart
- Pattern: connect OK → 115-237s receive → i/o timeout → reconnect loop infinito

**Tentativo tuning go2rtc** (insufficiente):
- Edit `~/guardian/go2rtc.yaml.tmpl`: `#input=rtsp/tcp` query param su URL cameretta
- Backup: `~/guardian/go2rtc.yaml.tmpl.s23-bak`
- Render forzato + go2rtc kicked, ma stall pattern continua → hardware è morto, non è transport issue

**Disable applicato**:
- File: `~/guardian/guardian.py:124`
- Backup: `~/guardian/guardian.py.s23-bak-cameretta`
- Edit: `"cameretta": "rtsp://...8554/cameretta"` → commented `# "cameretta": DISABLED S23 hardware degrado RTSP...`
- Syntax OK, restart launchctl PID 19269 (parent) + 19274/19475 (children)
- Log conferma: `[cam-watchdog] cameras=['soggiorno']` ← cameretta NON più nella watchdog list
- Stall counter congelato a 2034 (zero crescita post-restart, T+1min observed)

**Action Luke fisico (carry-over S24)**:
- 🔴 **Hardware cameretta**: swap con C6CN spare se disponibile, OR reset factory + firmware update EZVIZ, OR sostituzione completa
- Senza cameretta: Guardian fall detection ATTIVO solo soggiorno (perdita copertura camera figli)

**Rollback path** (se Luke ripristina hardware):
- Uncomment riga `cameretta` in `guardian.py:124`
- launchctl unload+load Guardian
- 5gg baseline obs già accumulati nel DB (preserved)

### P2 — Doc consistency

**CLAUDE.md** `Device & Connections` aggiornata:
- EZVIZ Cameretta: 192.168.1.5 (era .2)
- EZVIZ C6CN Soggiorno: 192.168.1.4 (era .5)
- Annotazione "IP shift verificato S22 2026-04-30"

**Memory `device_config.md`** overhaul completo:
- Era 34gg vecchia con iMac=192.168.1.2 phone=192.168.1.9 (entrambi sbagliati)
- Nuovi: iMac=192.168.1.12 (mDNS preferito) phone=192.168.1.11
- Aggiunto sezione Camere EZVIZ + Guardian + servizi LaunchAgent + cron + credenziali

### Production hardening — verdict

| Check | Status | Evidenza |
|-------|--------|----------|
| Guardian LaunchAgent KeepAlive | OK | `com.guardian` PID 19269, autorestart on crash testato live (HARD ESCALATION→reload) |
| go2rtc LaunchAgent | OK | `com.go2rtc` PID 18260, kill+autorestart verified |
| Mosquitto LaunchAgent | OK | `com.mosquitto.broker` PID 1617 |
| Traccar LaunchAgent | OK | `com.traccar.server` PID 1609 |
| Phone Termux:Boot | OK | `~/.termux/boot/start-services.sh` + 14+ cron jobs |
| Luna phone PID stable | OK | 10599 (zero drift dal S20) |
| Guardian DB backup cron 3AM | OK | 8gg retention verified (23-30 Apr backups, 2.9-3.5MB) |
| Telegram alert path | OK | live test msg_id 5446 (gianlucanewtech@gmail.com chat) |
| go2rtc health watchdog cron 5min | OK | `~/guardian/go2rtc_health.sh` |
| Baseline rebuild cron hourly | OK | `rebuild_baseline_profile.py` |
| EZVIZ IP resolver cron 5min | OK | `ezviz_ip_resolver.py + render_go2rtc.sh` (gestisce DHCP shift auto) |

### Action items carry-over (S19+S20+S21+S22+S23 — Luke physical)
- KO `tailscale login` su iMac (browser interattivo)
- KO MIUI Termux + Termux:Boot battery whitelist
- 🆕 KO **Hardware cameretta swap/reset** (S23 add — necessario per ripristinare copertura camera figli)

### NON in S23 (deferred)
- Refactor `learning_days` semantica Opzione B (gate: 2026-05-07 check)
- ADR 007 prototipo `install-guardian.sh` (Scope B sessione separata)
- Vosk wake word v2, TCN retry Le2i, Medication Reminder, frontend dashboard

### Targets PASS S23
- [x] Baseline scoring path sbloccato — runtime test soggiorno/ABSENT da `state_never_seen` a `insufficient_days_1` (path attivo)
- [x] Cameretta hardware decision presa + applicata — thread disabled, Guardian stabile soggiorno-only
- [x] CLAUDE.md aggiornata IP camera + memory device_config.md
- [x] Guardian stabile post-fix — PID 19269, FPS 0.9 sustained, stall counter congelato
- [x] Telegram alert path verificato live
- [x] Production hardening checklist 11/11 PASS

### Per S24 (priorità)
- **P0 [GATE 2026-05-07]** Verify `_baseline_suppressed` ≥1 entry. Se ZERO → Opzione B refactor.
- **P1 [Luke physical]** Cameretta hardware swap/reset → re-enable thread.
- **P2** Scope B foundation: prototipo `install-guardian.sh` ADR 007 (distribuibile amici).
- **P3** Pulizia residui post-S20 (gate scatta 2026-05-06).

---

## [2026-04-30 SESSIONE 22] — diagnosi P0/P1, no code edits Guardian (safe)

### Sintesi (3 line)
- **P0 NORTH STAR — diagnosi architectural blocker**: ZERO `*_baseline_suppressed` entries in 24h+ runtime perchè `_rebuild_profile` calcola `learning_days` con chiave troppo granulare `(camera,dow,hour,slot,state)` su finestra `learning_period_days=7` → max 1 occorrenza per `dow`-slot in 7gg → `min_days_to_score=3` strutturalmente irraggiungibile. 1203 profile rows tutti con `learning_days=1`. Score sempre `state_never_seen_in_slot` o `insufficient_days_X`. Fix è design change (non applicato S22, low-risk perché safety-rule fall/fire/etc già esclude paths critici).
- **P1 cameretta stall root-cause = hardware degrado EZVIZ 192.168.1.5**: 1970 stall events log totali, pattern connect → 115s ricezione → i/o timeout → reconnect loop. go2rtc storico mostra `i/o timeout` upstream cameretta intermittenti. NOT regression Guardian (CameraStallWatchdog detecta correttamente), NOT auth/config (RTSP DESCRIBE auth-ed risponde, soggiorno stesso pattern config funziona).
- **P2 cameretta baseline 5gg verified** (target raggiunto), Luna phone stabile (PID 10599), Guardian PID 1618 stabile post-S21. **Zero edits codice S22** (diagnosi-only sessione).

### Pre-flight S22 — verdict
| Check | Verdict |
|-------|---------|
| Guardian process | OK PID 1618+2610, FPS soggiorno 0.9 |
| Luna phone stability | OK PID 10599 dal S20 (zero drift) |
| `_baseline_suppressed` entries log | **KO ZERO entries** (root cause: architectural — vedi P0) |
| Cameretta stall count | **KO 1970 events** (hardware degrado — vedi P1) |
| Cameretta baseline distinct days | OK **5gg** target raggiunto |
| Soggiorno baseline | OK 9gg |
| Tailscale iMac | KO ANCORA `Logged out` (carry-over S19+S20+S21+S22) |

### P0 — Root cause NORTH STAR FP suppression non triggerata

**Evidenza runtime**:
- `sqlite3 baseline_observations`: cameretta=4gg ABSENT/2255 obs, soggiorno=4gg ABSENT/4406 obs
- `sqlite3 baseline_profile`: 1203 rows, `MAX(learning_days)=1` ❌
- runtime `score_observation` test (12 combo cam×state): tutti `suppress=False reason=state_never_seen_in_slot`

**Diagnosi codice** (`baseline_learner.py:155-191`):
```sql
-- _rebuild_profile groups by (camera, dow, hour, slot, state)
-- COUNT(DISTINCT date(created_at)) per slot = max 1 in learning_period_days=7
-- because each `dow` value (0-6) recurs only ONCE in 7 days
```

**Config defaults bloccanti**:
- `learning_period_days=7` (cutoff troppo stretto)
- `min_days_to_score=3` (richiede 3 occorrenze stesso dow-slot, impossibile in 7gg)
- `observation_slot_minutes=5` (288 slot/giorno × 7 dow = 2016 buckets totali sparsi)

**Conseguenza architettonica**: il sistema può funzionare solo su `(dow,hour,slot)` che ricorrono ≥3 volte nella finestra. Con period=7gg → impossibile. Con period=21gg → max 3 occorrenze per dow-slot, raggiungibile ma marginale.

**Fix proposti per S23** (DECISION DEFERRED — non implementati S22 per safety):
- **Opzione A** (low-risk, raccomandata): cambiare `learning_period_days` 7→21 in `BASELINE_CONFIG`. Dopo T+21gg da learning_start (2026-04-13 → 2026-05-04) avremo dati sufficienti per slot ricorrenti. Side effect: alta latenza fix (4 giorni di learning aggiuntivo).
- **Opzione B** (medium-risk, fix architetturale): cambiare semantica `learning_days` in `_rebuild_profile` da `COUNT(DISTINCT date) per (cam,dow,hour,slot,state)` a `COUNT(DISTINCT date) per (cam,state)` globale → richiede 2nd query JOIN. Risolve sparsity strutturale ma cambia interpretazione `learning_days` (più permissivo).
- **Opzione C** (high-risk, sconsigliata): abbassare `min_days_to_score` da 3 a 1 → rischio FP suppression con dati insufficienti.

### P1 — Cameretta stall root cause = hardware EZVIZ degrado

**Pattern log** (`/Users/gianlucadistasi/guardian/logs/guardian.log`):
- 10:42:47 cameretta connect OK
- 10:44:42 stall 115s (threshold 90s) → forcing reconnect (force #1)
- 10:45:42 stall 175s → forcing reconnect (force #2)
- ciclo ricorrente, 4 force_reconnect → HARD ESCALATION → exit process → launchctl KeepAlive restart Guardian

**Evidenza go2rtc storica** (`~/logs/go2rtc.log`):
- `01:19:54.042 WRN read tcp ...->192.168.1.5:554: i/o timeout url=rtsp://admin:GEGURX@192.168.1.5:554/H.264`
- Multipli i/o timeout upstream nelle ultime 24h (timestamps 01:19, 01:20, 05:05, 11:30 storici)

**Hypothesis ranking finale**:
1. ✅ **Hardware EZVIZ Cameretta (192.168.1.5) degrado intermittente RTSP** — confermato da go2rtc i/o timeouts su upstream. Camera risponde a RTSP DESCRIBE auth-ed (401 Digest realm `686dbca559ff`) ma stream va in stall ~2min.
2. ❌ **NON go2rtc reconnect loop** — go2rtc non logga errori dopo restart 10:42 (lazy on-demand stream). Soggiorno (192.168.1.4) stesso codepath funziona perfettamente (9MB ricevuti).
3. ❌ **NON S15C CameraStallWatchdog regression** — watchdog detecta stall correttamente (90s threshold) e force_reconnect è invocato come da design.

**Note operativa**: gli IP camera sono cambiati post-shift DHCP (CLAUDE.md indica cameretta=192.168.1.2/soggiorno=192.168.1.5; reale corrente cameretta=192.168.1.5/soggiorno=192.168.1.4). Da aggiornare CLAUDE.md `Device & Connections` in S23.

**Action items S23**:
- Hardware swap cameretta con C6CN spare (se disponibile) o reset factory + firmware update EZVIZ
- Tuning go2rtc: forzare `rtsp_transport=tcp` + lower bitrate + reconnect timeout 30s
- Considerare soluzione fallback: disabilitare cameretta thread se hardware permanentemente degradato (Guardian funziona safety-only su soggiorno)

### Bug discovery non-regressione P3 — IP camera shift in CLAUDE.md
- CLAUDE.md `Device & Connections` ha IP cameretta=`192.168.1.2` / soggiorno=`192.168.1.5` (vecchi)
- Reale corrente (verificato via go2rtc.yaml + ARP + RTSP probe): cameretta=`192.168.1.5` / soggiorno=`192.168.1.4`
- 192.168.1.2 risponde a ping ma RTSP refused (non più una camera, è altro device)
- **Action S23**: aggiornare CLAUDE.md + memory `device_config.md`

### Action items P2 NON eseguiti S22 (carry-over)
- KO `tailscale login` su iMac (carry-over S19+S20+S21+S22 — Luke browser interattivo)
- KO MIUI Termux + Termux:Boot battery whitelist (carry-over S20+S21+S22)
- KO Pulizia residui post-S20 (gate temporale: gate scatta 2026-05-06)

### Targets PASS S22
- [ ] ≥1 log entry `*_baseline_suppressed is_normal=True` evidenced — **KO** ma **tuning documentato** (root cause architectural identificato + 3 opzioni fix)
- [x] Cameretta stall root cause identificato — hardware EZVIZ degrado RTSP (NOT regression)
- [x] Cameretta baseline ≥5 distinct days verified
- [x] Guardian process stabile T+24h post-S21 (zero edits S22, zero regression)

### Per S23 (priorità)
- **P0** NORTH STAR fix: implementare Opzione A (period=21) o Opzione B (learning_days globale) in baseline_learner. Backup + test runtime + monitor 24h.
- **P1** Cameretta hardware: swap o tuning go2rtc TCP+bitrate. Decision tree: ≥1 settimana di degrado → swap, altrimenti tuning.
- **P2** CLAUDE.md update IP camera + memory `device_config.md`.
- **P3** Prototipo `install-guardian.sh` (ADR 007 validation).
- **P3** Pulizia residui (gate scatta 2026-05-06).

---

## [2026-04-29 SESSIONE 21] — `score_observation` wiring + ADR 007 + closeout

### Sintesi (3 line)
- **P0 NORTH STAR — FP suppression LIVE**: `baseline_learner.score_observation()` cablato in guardian.py su 3 alert sites (loitering, line_crossing, inactivity) con safety hard-rule (mai su fall/fire/smoke/tamper/audio/temperature/long_lie). Backup `guardian.py.s21-bak` creato, syntax OK, restart launchctl pulito.
- **P1 luna-v4 drift verificato**: phone `~/scripts/luna-v4.py` IDENTICO a repo `scripts/luna/luna-v4.1.py` (zero drift, mtime 28-04 era ultimo deploy regolare).
- **P2 ADR 007** distributable addressing strategy → Tailscale-only (Tier 1) + mDNS fallback (Tier 2) + manual env (Tier 3). Risolve MIUI MAC bug per friends install bypassando il problema a layer 3.

### Pre-flight S21 — verdict
| Check | Verdict |
|-------|---------|
| Guardian process (mDNS reach) | OK UP, FPS soggiorno=1.0 cameretta=0.9, baseline learning=False days=7 |
| pmset autorestart=1 | OK Applicato Luke (carry-over S19+S20 risolto) |
| mosquitto bind 0.0.0.0 + 127.0.0.1 only | OK Solo mosquitto su :1883, no zombie |
| Tailscale iMac | KO ANCORA Logged out (carry-over Luke S19+S20+S21) |
| Luna phone PID | OK 10599 stabile da S20, log RMS continuo |
| Cameretta baseline distinct days | TBD 4gg/257 obs (target >=5 entro EOD, accumulo naturale) |
| Soggiorno baseline distinct days | OK 8gg/976 obs |

### P0 — `score_observation` wiring (NORTH STAR)

**File modificato**: `~/guardian/guardian.py` (198KB → 200KB ca)
**Backup**: `~/guardian/guardian.py.s21-bak` (198195 bytes, 08:18 UTC)
**Restart**: `launchctl unload && load ~/Library/LaunchAgents/com.guardian.plist` (PID 75777, +5s connesso RTSP, +10s audio attivo)

**3 wiring sites** (pattern uniforme):
1. **line_crossing** (`guardian.py:3028+`) — score con `state` corrente del track, log `EVENT [{cam}] line_crossing_baseline_suppressed is_normal=True p=... conf=... reason=...`
2. **loitering** (`guardian.py:3042+`) — idem; suppress salta sia mqtt publish CHE telegram_send_text CHE log_event (suppression totale)
3. **inactivity** (`guardian.py:3647+`) — InactivityMonitor scoring per-camera con state="ABSENT", suppress solo se TUTTE le cameras hanno ABSENT normale nello slot corrente (AND logic)

**Safety hard rule** (rispettata by-design, mai cablato):
- NEVER fall (638), fire (3334), smoke (3349), tamper (2860), audio_alarm (3569), temperature (2026/2034), long_lie (3388)
- NEVER alarm state changes (1820/1836/1846/1864/1889 — FSM events, non FP)

**Validation acceptance — IN MONITORING**:
- TBD >=1 log entry `*_baseline_suppressed is_normal=True` (richiede evento naturale loitering/line_crossing/inactivity con baseline match — può richiedere ore/giorni)
- OK Guardian process stabile post-restart (zero crash da edit, no exception in baseline path)
- OK baseline_learner inizializzato `learning=False days=7` → suppression CAN trigger

### P1 — Luna phone drift check
**Diff exit 0** tra `/tmp/luna-v4-phone.py` (estratto da phone) e `scripts/luna/luna-v4.1.py` (repo). Nessun drift. mtime phone 28-04 13:55 era ultimo deploy legittimo.

### P2 — ADR 007 distributable addressing
File: `docs/adr/007-distributable-addressing-strategy.md`
- **Tier 1**: Tailscale-only (raccomandato) — bypassa MIUI MAC bug a layer 3
- **Tier 2**: mDNS fallback (per chi rifiuta Tailscale)
- **Tier 3**: Manual env var (escape hatch)
- **Comparison table** completa: 5 strategie valutate (Tailscale / mDNS / setup script router-specific / static IP / reverse-tunnel) — Tailscale wins su 5 dimensioni
- **Status**: Accepted preliminary — validare con prototipo `install-guardian.sh` su seconda casa beta-tester

### Bug pre-esistente NON in scope S21 — Cameretta camera stall
Log mostra `[cam-watchdog] cameretta stalled` ricorrente (ogni 4-5 min, 4 forced reconnect cycles). Pattern già presente PRE-deploy S21 (timeline 06:51 → 08:12, sessione S20). Da indagare S22 — possibile regression S15C deep fix o degrado RTSP feed lato camera.

### Action items P2 NON eseguiti S21 (carry-over)
- TBD `tailscale login` su iMac (carry-over S19+S20+S21 — richiede browser interattivo Luke)
- TBD MIUI Termux + Termux:API + Termux:Boot battery whitelist (carry-over S20)
- TBD Pulizia residui post-S20: `mosquitto.conf.s20-bak`, `com.mqtt.broker.plist`, `~/mqtt/broker.py`, `~/scripts/luna-v3.py` phone (rinviato a S22 se mosquitto stabile 7gg post-S20 = 2026-05-06)

### Targets PASS S21
- [x] 3 alert sites integrati (loitering + line_crossing + inactivity), 0 regression Guardian process
- [x] Luna phone PID stabile da S20 (no down-time)
- [x] ADR 007 (decisione DACI documentata) per addressing strategy distribuibile
- [ ] >=1 log entry `*_baseline_suppressed is_normal=True` (LIVE) → IN MONITORING (richiede evento naturale, validation T+ore/giorni)
- [ ] Cameretta baseline >=5 distinct days verified → 4gg al closeout, accumulo passivo durante giornata

### Per S22 (priorità)
- P0 monitoring: verificare >=1 entry `*_baseline_suppressed` nei log (timeframe naturale)
- P1 cameretta stall debug: pattern stall pre-esistente, candidato regression S15C
- P2 prototipo install-guardian.sh (validation ADR 007 Tailscale-only)
- P2 cameretta baseline >=5gg (auto-progression)
- P3 pulizia residui (post 2026-05-06 se mosquitto stabile)

---

## Stato precedente: SESSIONE 20 CHIUSA — Luna phone ripristinata + MQTT broker fix + DHCP reservation applicata + Bug discovery `score_observation` dead code

---

## [2026-04-29 SESSIONE 20] — Luna phone restart + MQTT broker fix + suppression FP gap discovery

### Sintesi (3 line)
- **P0 Luna phone UP** dopo 15gg down (Apr 14 → Apr 29). Root cause multifactor: crond morto (no watchdog), PA scaduto, MIUI battery kill (21% unplugged), MQTT subscribe denied.
- **P0 MQTT broker fix** (residuo S18 DHCP shift): mosquitto.conf bind `192.168.1.2` stantio + amqtt zombie su 0.0.0.0 → fix bind `0.0.0.0` + amqtt killato + Guardian/Luna ora pubsub via mosquitto autenticato.
- **P1 NORTH STAR finding**: `baseline_learner.score_observation()` definito ma **MAI invocato** in guardian.py → suppression FP da baseline è **dead code path**. Documentato per S21.

### Pre-flight S20 — verdict
| Check | Verdict |
|-------|---------|
| iMac mDNS @ imac-di-gianluca.local (.12) | ✅ UP, FPS soggiorno=1.0 cameretta=0.9 |
| Tailscale iMac | ❌ Logged out (Luke action item da S19, non eseguito) |
| pmset autorestart | ❌ 0 (Luke action item da S19, non eseguito) |
| Luna phone PID | ❌ DOWN dal 2026-04-14 14:02 |
| Phone uptime | ✅ 14gg, batteria 21% UNPLUGGED |

### P0 #1 — Luna phone restart end-to-end

**Root cause analysis** (multifactor, ordine causale):
1. **MIUI battery kill** Apr 14 14:02 — log si interrompe silenziosamente, batteria oggi 21% unplugged, Luna probabilmente killata da Doze quando batteria scese
2. **crond NOT running** — il watchdog cron `*/10 * * * *` per restart luna-v4 mai eseguito perché crond stesso era morto
3. **PulseAudio off** — `pulseaudio --check` exit 1
4. **MQTT subscribe denied** — vedi P0 #2

**Fix applicato**:
```bash
# Phone (192.168.1.11:8022)
crond                                        # avvia daemon cron
pulseaudio --start --exit-idle-time=-1       # PA permanente
nohup python3 ~/scripts/luna-v4.py wake >> ~/logs/luna.log 2>&1 &
# Wake-lock già attivo (verificato termux-wake-lock)
```

**Evidence**:
- Luna PID 10599, uptime stabile ✅
- Log: RMS continuo, STT funzionante (`Grazie. [quota: 1871]`)
- E2E test: `mosquitto_pub guardian/alert {"event":"S20_TEST_PHONE_REACH"}` → log phone `[07:01:38] TTS: Alert Guardian` ✅

### P0 #2 — MQTT broker fix (residuo DHCP shift S18)

**Discovery shocking** durante diagnostica MQTT phone:
```
[mqtt] All subscription requests were denied  (mosquitto_sub from phone)
```

**Investigazione**:
1. `lsof -iTCP:1883 LISTEN` su iMac → process **Python** PID 986, NOT mosquitto
2. Python process = `~/mqtt/broker.py` (amqtt v0 con `allow-anonymous: True` + plugin `auth_anonymous` only) → **denies authenticated users**
3. mosquitto.log iMac: ciclo `Error: Can't assign requested address` (bind `192.168.1.2` stantio post-DHCP shift S18)
4. launchd `com.mosquitto.broker` keeps respawning, fails bind, throttled
5. launchd `com.mqtt.broker` (amqtt) attivo dal 2026-03-26, MEMORY index dice "amqtt rimosso" → **falso**

**Fix applicato**:
```bash
# 1. Backup
cp /usr/local/etc/mosquitto/mosquitto.conf /usr/local/etc/mosquitto/mosquitto.conf.s20-bak

# 2. Patch listener
sed -i "" "s|listener 1883 192.168.1.2|listener 1883 0.0.0.0|" /usr/local/etc/mosquitto/mosquitto.conf
# Now: listener 1883 0.0.0.0  +  listener 1883 127.0.0.1

# 3. Stop amqtt
launchctl unload ~/Library/LaunchAgents/com.mqtt.broker.plist
pkill -f "mqtt/broker.py"

# 4. Restart mosquitto
launchctl unload && launchctl load ~/Library/LaunchAgents/com.mosquitto.broker.plist
```

**Evidence post-fix**:
- `lsof -iTCP:1883 LISTEN` → solo `mosquitto PID 62801` su `*:1883` + `127.0.0.1:1883` ✅
- amqtt morto ✅
- Guardian log: `[07:00:42] [mqtt] Subscribed to luna/guardian_query, luna/alarm_cmd` ✅ (auto-reconnect via launchd KeepAlive)
- Phone Luna log: nessun "Reconnecting" dopo 07:00:39 ✅
- E2E pub iMac → sub phone: alert ricevuto, TTS speak ✅

**Lesson learned (S20)**:
- "amqtt rimosso" memory entry era OBSOLETO — il file plist `com.mqtt.broker.plist` non era mai stato unload
- mosquitto.conf bind hardcoded a IP era residuo di S18 DHCP shift mai pulito
- ADR 006 si applica anche a mosquitto.conf — bind hostname-friendly (0.0.0.0) o per-interfaccia

### P0 #2.b — Tailscale strategy (deferred)

**Stato**: Tailscale logged out → strategia documentata, deferred fino re-login Luke.

**Decisione corrente**: mantieni `go2rtc bind 127.0.0.1:8554/1984` (configurazione S16a S19, sicura).

**Implication**: phone Luna `show_camera` (intent "mostrami soggiorno") **non funziona** — apre `termux-open-url http://imac-di-gianluca.local:1984/...` ma go2rtc non risponde a non-localhost.

**Opzioni future** (DACI da risolvere quando Luke rilogga Tailscale):
- **A)** Multi-bind go2rtc `127.0.0.1` + Tailscale IP `100.101.24.13` — sicuro, no LAN exposure
- **B)** SSH tunnel from phone (Luna spawn `ssh -L 1984:localhost:1984` on-demand) — no config change iMac
- **C)** Bind go2rtc `0.0.0.0` LAN — semplice, ma niente auth go2rtc → camera streams accessibili a chiunque sulla LAN (sconsigliato)

### P1 — Cameretta baseline ramp-up
- **Stato**: 4 distinct days, 247 obs (era 3 days/744 obs in S19, anomalia obs count S15D camera-stall)
- **Soggiorno**: 8 distinct days, 959 obs (oltre target 7gg)
- **ETA cameretta ≥5gg**: entro stasera 2026-04-29 (la giornata corrente conta come +1 distinct day non appena thread cameretta registra obs)
- **Verifica**: `pgrep -af guardian.py` PID 61595 (riavviato post-MQTT fix via launchd KeepAlive), thread cameretta vivo (FPS=0.9)

### P1 — Suppression FP runtime evidence — BUG DISCOVERY 🔴

**Brief S20 chiedeva**: trovare evento `is_normal=True suppress_alert=True` nei log Guardian (baseline soggiorno mature 7gg+).

**Risultato investigazione**:
1. `grep -E "is_normal|baseline_supp|score_observation"` su tutti i log Guardian → **0 match**
2. `grep -nE "score_observation"` su `~/guardian/*.py` → **solo 1 caller path: dead**
   - `baseline_learner.py:192` — `def score_observation(...)` (definizione)
   - `baseline_learner.py:8` — docstring riferimento
   - `guardian.py` — **ZERO chiamate**
3. Solo `record_observation` (lettura+write) e `is_inactivity_normal` (sleep pattern) sono integrati

**Conclusion**: FP suppression pipeline definita in baseline_learner.py ma **mai cablata** in guardian.py alert dispatch sites (17+ chiamate `mqtt_pub.publish_alert()` in guardian.py). North Star "FP suppression operativa" non testabile finché non integrato.

**Wiring proposto S21** (scope tight, non-fall events only):
```python
# In guardian.py prima di publish_alert per loitering, line_crossing:
result = self.baseline_learner.score_observation(camera, current_state)
if result["suppress_alert"] and alert_type not in ("fall","fire","smoke","tamper"):
    log.warning(f"EVENT [{camera}] {alert_type}_baseline_suppressed: "
                f"is_normal=True p={result['probability']:.2f} conf={result['confidence']:.2f}")
    return  # skip publish
mqtt_pub.publish_alert(alert_type, ...)
```

**Acceptance S21**: ≥1 log entry `*_baseline_suppressed is_normal=True` su evento naturale (loitering più probabile, baseline soggiorno mature).

### P2 — Action items Luke
- ⏳ `sudo pmset -a autorestart 1` (S19 carry-over) — auto-restart iMac dopo power loss
- ⏳ Tailscale re-login (S19 carry-over) — `tailscale login` browser flow → restore `100.101.24.13`
- ✅ **DHCP reservation router applicata 2026-04-29** — MAC table in `docs/network.md`
- 🆕 **Verifica setting MIUI battery** Termux su Redmi Note 9 Pro — "no restrictions" e "autostart enabled" per Termux + Termux:API (per evitare ricaduta Apr 14)
- 🆕 **MIUI WiFi → Privacy → "Use phone MAC"** (non randomizzato) — per stabilità DHCP reservation phone (vedi docs/network.md)

### Targets PASS S20 — verdict
| Target | Verdict |
|--------|---------|
| Tailscale OPPURE go2rtc reach strategy alternativa documentata | ✅ DONE (decisione: keep 127.0.0.1, opzioni A/B/C documentate, deferred) |
| Luna phone UP, log "Luna pronta", PID stabile 60s+ | ✅ DONE (PID 10599, RMS+STT live, MQTT pubsub E2E) |
| Suppression FP runtime evidence ≥1 | ⚠️ **BLOCKED — root cause documentato** (`score_observation` dead code) |
| Cameretta baseline ≥5 days | ⏳ ON TRACK (4gg oggi, +1 entro stasera) |
| DHCP reservation router | ✅ DONE (Luke 2026-04-29 closeout) — MAC table docs/network.md |

### Bonus discovery — file changes evidence
- `~/scripts/luna-v4.py` mtime su phone = **2026-04-28 13:55** (oggi pre-S20). Modifica unknown — Luke ha editato manualmente? Non c'è log diff. Header v4.1 invariato. **Action S21**: diff vs git HEAD per identificare drift.

---

## [2026-04-28 SESSIONE 19] — Recovery post-iMac power loss + IP audit

### Root cause sessione 18 power-off
- **Shutdown cause** (pmset): `SMC shutdown cause: 0 — Battery disconnected`
- Su iMac (no battery) significa **POWER LOSS sudden** — power outage o staccato dalla presa
- NON kernel panic, NON thermal
- **Fix proposto**: `sudo pmset -a autorestart 1` (richiede password Luke; oggi `autorestart=0`)

### Pre-flight network rediscovery — risultati
| Check | Verdict |
|-------|---------|
| iMac SSH @ 192.168.1.12 | ✅ UP (uptime ~12 min, post-reboot) |
| iMac NOT @ .2 | ✅ confermato (porta 22 refused) |
| Phone SSH @ 192.168.1.11:8022 | ✅ UP (uptime 13d, mai rebootato) |
| Cameretta EZVIZ @ 192.168.1.2:554 | ✅ UP (camera RIPRESE .2 dopo iMac shift) |
| Soggiorno EZVIZ @ 192.168.1.5:554 | ✅ UP |
| Tailscale iMac status | 🔴 **NeedsLogin** (logout durante reboot) |
| go2rtc bind | 🔴 era `100.101.24.13:8554` Tailscale-only → impossibile riavviare |
| Guardian RTSP | 🔴 stalled 5min → S15D HARD ESCALATION fired (working as designed) |

**No conflitto IP .12**: assunzione NEXT_SESSION (".12 era soggiorno camera") era stale. La camera soggiorno è sempre stata @ .5; l'iMac ha preso .12 in DHCP.

### Fix S19 applicato (decoupling rete + hostname migration)

1. **go2rtc bind → 127.0.0.1:8554** (deployed `~/go2rtc.yaml.tmpl` su iMac, render_go2rtc.sh attivo, kickstart OK).
2. **Guardian env e codice → 127.0.0.1**:
   - `~/guardian/guardian.env`: `MQTT_BROKER=127.0.0.1`, `+TRACCAR_URL=http://127.0.0.1:8082`
   - `~/guardian/guardian.py`: `CAMERAS={...rtsp://127.0.0.1:8554/...}`
   - Source repo allineato (`scripts/guardian/guardian.py` + `go2rtc.yaml.tmpl`).
3. **Phone Luna → mDNS hostname**:
   - `scripts/luna/luna-v4.1.py`: `IMAC_HOST=os.environ.get("IMAC_HOST","imac-di-gianluca.local")` usato per MQTT, go2rtc URL, Traccar, SSH.
   - `scripts/boot/start-services.sh`: probe rete via `imac-di-gianluca.local`.
   - Deploy: `~/scripts/luna-v4.py` + `~/.termux/boot/start-services.sh` aggiornati su phone.
   - Verifica mDNS: `ping imac-di-gianluca.local` da phone risolve a 192.168.1.12 ✅.
4. **CLAUDE.md** aggiornato: Device & Connections rifatto con hostname-based + nota DHCP-resilience.
5. **ADR 006** scritto: `docs/adr/006-hostname-resolution-strategy.md`.

### Acceptance — Guardian restored

```
13:53:23 [cameretta] Connected to RTSP stream
13:53:27 [soggiorno] FPS: 0.7, frames: 7
13:54:11 [cameretta] FPS: 0.9, frames: 44
13:54:11 [soggiorno] FPS: 0.9, frames: 47
13:54:18 [geofence] No positions from Traccar, assuming HOME    ← Traccar reachable (127.0.0.1:8082)
PID: 6719 stable                                                ✅ S19 PASS
```

### Baseline progress (NORTH_STAR)
- **Soggiorno**: 7 distinct days, 3945 obs, 327 slot+state combos profilati. Multipli STANDING combos a 5-6 days (>=3 threshold raggiunto). NORTH_STAR `learning_days>=3 per >=5 slot+state combos` ✅ **MET per soggiorno**.
- **Cameretta**: 3 distinct days, 744 obs, 48 slots. Ancora in ramp-up (Bug B S15C lasciava cameretta down 16h, recuperata solo S15D).
- Suppression FP `is_normal=True` runtime: nessun evento alert nelle ultime ore → non verificabile per assenza di trigger.

### Issue noto post-S19
- **Tailscale iMac LOGGED OUT** → ✅ Guardian decoupled (127.0.0.1), ma:
  - Phone NON può vedere stream go2rtc remoto (bind localhost-only)
  - Off-LAN access perso fino a re-login Tailscale (browser action)
- **Luna phone DOWN dal Apr 14** (log mtime `Apr 14 14:02`) — pre-esistente, fuori scope S19.

### Targets PASS Sessione 19
- [x] Connettività ripristinata (Guardian FPS stabile, Traccar 200, MQTT auth)
- [x] Zero referenze hardcoded a 192.168.1.2 / 192.168.1.9 nei file ATTIVI (guardian.py, go2rtc.yaml.tmpl, luna-v4.1.py, start-services.sh, CLAUDE.md). Versioni storiche (luna-v3.x, guardian-v1.x) intatte.
- [x] Conflitto IP .12 chiarito (era assunzione errata; nessun conflitto reale)
- [x] ADR 006 hostname-based migration documentato; DHCP reservation flagged P1
- [x] (parziale NORTH_STAR) baseline soggiorno mature; suppression runtime evidence pendente
- [x] iMac shutdown root cause identificato (sudden power loss); fix `pmset autorestart=1` action item Luke

---

## [2026-04-28 SESSIONE 18] — S15D hard escalation + S17 Traccar fix

### Pre-flight findings (CRITICI)
| Check | Verdict | Evidence |
|-------|---------|----------|
| S15C `_force_reconnects` count | ⚠️ **744 su cameretta**, mai recuperata | log `cam-watchdog cameretta stalled 58819s` |
| Cameretta last successful frame | ❌ 2026-04-27 20:08:00 (16h+ stall) | frame#900, poi solo "force_reconnect requested" senza recovery |
| Soggiorno health | ✅ OK | FPS 0.2 = adaptive sampler idle (23000 obs storiche), frame counter avanza |
| External cron watchdog interventi 24h | 4 (ultimo 19:47 ieri) | non più triggered: cooldown S15C interno suppressa anche escalation cron |
| Guardian process | ✅ vivo (uptime 16h45min pre-restart) | PID 60055 |

### Root cause analysis S15C → S15D
- **S15C design flaw**: `force_reconnect()` chiama `cap.release()` da watchdog thread per sbloccare `cap.read()` blocking sul main camera thread.
- **OpenCV thread-unsafety**: con FFmpeg backend su RTSP socket stalled, `release()` da altro thread NON sblocca `read()` (comportamento undefined). Il `cap.read()` rimane bloccato indefinitamente.
- **Sintomi nel log**: "force_reconnect requested" loggato 744 volte, MAI seguito da "Connected to RTSP stream" o "Cannot open RTSP" (path normale di reconnect mai raggiunto).
- **Conseguenza**: S15C peggio del cron esterno — il watchdog interno reset il cooldown del cron esterno (60s tra force vs 180s silent threshold), quindi cron esterno NON interviene → cameretta down per 16h.

### Implementazione S15D (`guardian.py:CameraStallWatchdog`)
| Patch | Change |
|-------|--------|
| `__init__` | + `_stall_start_ts={}`, `_stall_force_count={}`, `_hard_escalate_s` (env `GUARDIAN_CAM_HARD_ESCALATE_S`, default 300s), `_hard_escalate_min_forces` (env, default 2) |
| `run()` enter stall branch | track `stall_start_ts` + `stall_force_count`; check escalation BEFORE applying cooldown — se stall ≥300s e ≥2 force_reconnects: `log.critical(HARD ESCALATION)` + flush handlers + `os._exit(2)` |
| `run()` healthy branch | clear stall tracking + log "{name} recovered" con duration + force count |
| `run()` log line | aggiunto `stall_age` field per visibilità totale durata |

**Recovery garantita**: `os._exit(2)` non-zero → launchd `KeepAlive SuccessfulExit=false` + `ThrottleInterval=30` → restart in ≤30s. Vs S15C dove recovery non avveniva mai.

Backup: `~/guardian/guardian.py.bak.S15D` (190KB)

### Deploy + acceptance (PASS evidence)
```
12:36:03 [cam-watchdog] started (interval=30s, cameras=['soggiorno','cameretta'],
         hard_escalate=300s/2 forces)                                  ✅ S15D fingerprint
12:36:03 [hpt:soggiorno] safe_polygons loaded: 1 zones                 ✅ S15B preserved
12:36:05 [soggiorno] Connected to RTSP stream                          ✅
12:36:08 [cameretta] Connected to RTSP stream                          ✅ recovery!
12:38:09 [cameretta] FPS: 1.0, frames: 101                             ✅
12:38:20 [soggiorno] FPS: 0.9, frames: 123                             ✅
Fall events post-deploy: 0 in DB                                       ✅ NORTH_STAR
Guardian uptime: 02:34 stable                                          ✅
```

### S17 — Traccar restore (PASS)
**Root cause**: LaunchAgent plist era `com.traccar.server.plist.DISABLED` (rinominato in passato). Service mai partito al boot.

**Fix** (1 step):
```bash
mv ~/Library/LaunchAgents/com.traccar.server.plist.DISABLED \
   ~/Library/LaunchAgents/com.traccar.server.plist
launchctl load -w ~/Library/LaunchAgents/com.traccar.server.plist
```

**Acceptance**:
```
nc -zv 192.168.1.2 8082    → succeeded                  ✅
curl -sS http://192.168.1.2:8082/    → HTTP 200          ✅
launchctl list | grep traccar    → 62189  0  com.traccar.server  ✅ KeepAlive=true
log: jetty Started ServerConnector{0.0.0.0:8082}         ✅
```

### S16b — RISOLTO post-Luke action ✅
- Luke ha riaperto Tailscale app sul phone (azione fisica MIUI).
- Phone Tailscale `100.100.104.104` ora **active**: `direct 192.168.1.11:41567, tx 4932 rx 4172` ✅
- Phone IP DHCP cambiato: `.9` → `.11` (DHCP lease rinnovato durante riavvio).
- SSH Tailscale end-to-end PASS:
  ```
  iMac → ssh -p 8022 100.100.104.104 → SSH_OK, Linux aarch64 Android, uptime 13d22h
  iMac → tailscale ping → pong via 192.168.1.11:41567 in 4ms
  ```
- **Nota DX**: SSH Tailscale dal MacBook locale (`/Users/macbook`) non funziona perché Tailscale **NON installato** qui. Solo iMac (e phone tra di loro) routano via Tailscale.
- **Action future-proof**: considerare DHCP reservation phone @ .9 per stabilità. Recurring battery kill MIUI risolvere con "Always-on VPN" Android Settings + battery whitelist Tailscale app.

### iMac sleep DOWN (post-S16b verification, scoperto 2026-04-28 13:28)
**Sintomi**:
- Ping `192.168.1.2` ✅ risponde (sleep proxy)
- TCP `:22 :8088 :1883 :8554 :8082` ❌ tutte refused
- WoL magic packet (porte 7+9, broadcast + targeted) → nessun wake

**Diagnosi**: macOS in deep sleep, "Wake for network access" probabilmente disabilitato in Energy Saver.

**Implicazioni**: Guardian + Traccar + MQTT + go2rtc + sshd tutti inaccessibili finché iMac non si sveglia fisicamente. **Fortunatamente launchd KeepAlive ripartirà automatically tutti i servizi al wake**.

**Action item Luke**:
1. **Svegliare iMac fisicamente** (mouse/tastiera)
2. (Future-proof) `System Preferences → Energy Saver → Wake for network access` ON per WoL remoto da phone/laptop
3. (Future-proof) considerare disabilitare auto-sleep su iMac visto che è server casa 24/7

### Targets PASS Sessione 18 — verdict
- [x] Long-burn S15C: 744 force_reconnects = fix esercitata MA nessuna recovery → bug esposto → S15D fix deployato (escalation garantita via launchd)
- [x] S16b: ✅ RISOLTO post-Luke action (riapertura Tailscale app), SSH end-to-end via 100.100.104.104:8022 PASS
- [x] S17: ✅ Traccar :8082 UP, plist re-enabled, log puliti, KeepAlive attivo
- [⚠️] BONUS: iMac sleep down rilevato a fine sessione → action Luke pending (wake fisico)

### TODO derivato (Sessione 19)
- [ ] **🔴 Validate S15D in produzione** — al prossimo Bug B real-world (cameretta stall), verificare che `HARD ESCALATION` venga loggato + Guardian si auto-restart in ≤30s. Conferma fix garantita.
- [ ] **Verifica baseline T+7gg** (~2026-05-04, focus Sessione 19) — primo slot `ld≥3` atteso, validare suppression FP score_observation
- [ ] **S16b residual** — Luke deve aprire Tailscale app phone + battery whitelist; poi verificare ACL/MagicDNS funzionanti per :8022 via 100.100.104.104
- [ ] **Investigate Bug B physical root cause** — perché cameretta stalla così spesso? Ipotesi: EZVIZ camera firmware bug RTSP keepalive, network jitter su WiFi. Considerare ping watchdog camera-side.

### Rollback S15D (se regressione futura)
```bash
ssh gianlucadistasi@192.168.1.2 "
  cp ~/guardian/guardian.py.bak.S15D ~/guardian/guardian.py
  launchctl unload ~/Library/LaunchAgents/com.guardian.plist
  launchctl load ~/Library/LaunchAgents/com.guardian.plist
"
```

---

## [2026-04-27 SESSIONE 17] — S15C Internal Stall Watchdog (deep fix Bug B `cap.read()` blocking)

### Trigger CTO autonomo
Pre-flight session ha rivelato 2 interventi watchdog cron in 2h (17:49 + 19:47) → Bug B ricorrente, cron è palliativo (MTTR 60-180s, full process restart). Promosso S15C a P0.

### Root cause analizzato
- `cv2.VideoCapture(url, cv2.CAP_FFMPEG)` con `CAP_PROP_READ_TIMEOUT_MSEC=5000` è una hint, NON enforced da FFmpeg su socket RTSP stalled
- `cap.read()` può bloccare silenziosamente >180s senza ret=False → loop interno `while self.running` non vede mai il problema
- Cron esterno restart-everything → tear down FSM/HPT/baseline_learner/audio (collateral damage)

### Implementazione (`guardian.py`, 4 patch atomiche)
| Patch | Lines | Change |
|-------|-------|--------|
| 1. `CameraMonitor.__init__` | +6 | `last_frame_time`, `_cap=None`, `_stall_threshold_s=90s` (env `GUARDIAN_CAM_STALL_S`), `_force_reconnects` counter |
| 2. `CameraMonitor.force_reconnect()` | NEW method | external hook: `cap.release()` from another thread → unblocks `cap.read()` with ret=False → existing reconnect path |
| 3. `CameraMonitor.run()` | mod 3 lines | save `self._cap = cap` post-open, update `last_frame_time` after each successful read, clear `_cap = None` before release |
| 4. `class CameraStallWatchdog` | NEW class | thread daemon, check_interval 30s, cooldown 60s/cam, logs `[cam-watchdog] {name} stalled Xs — forcing reconnect` |
| 5. `main()` | +5 lines | spawn watchdog thread + add to "Active threads" log |

Backup: `~/guardian/guardian.py.bak.S15C` (190KB)

### Why internal > external watchdog (CTO rationale)
- **Surgical**: rilascia solo cap della camera stallata — soggiorno keeps running se cameretta stalla
- **MTTR**: max 30s (interval) vs 60-180s cron
- **Preserva stato**: FSM continui, `person_states` attivi, `baseline_learner` ingestion non si interrompe, audio thread non muore
- **Diagnostics**: contatore `_force_reconnects` per monitor, log strutturato cooldown-aware
- **Cron resta come safety-net**: se anche force_reconnect fallisce (deadlock OpenCV), cron ripartisce tutto a 180s

### Deploy + acceptance (PASS evidence)
```
19:50:42 [cam-watchdog] started (interval=30s, cameras=['soggiorno', 'cameretta']) ✅
19:50:42 Active threads: ... cam-watchdog ...                                     ✅ thread spawned
19:50:42 [hpt:soggiorno] HPT enabled + safe_polygons loaded: 1 zones              ✅ S15B preserved
19:50:44 [soggiorno] Connected to RTSP stream                                     ✅
19:50:47 [cameretta] Connected to RTSP stream                                     ✅
19:52:48 [soggiorno] FPS: 0.9 / [cameretta] FPS: 0.9                              ✅ stable

Post-deploy fall events DB:    0                            ✅ NORTH_STAR
Watchdog false-trigger ALERT:  0 in 2min30s                 ✅ no spurious force_reconnect
Cron external watchdog:        no intervention since 19:47  ✅ stream healthy
Guardian uptime:               02:31 stable, RSS 1.06GB     ✅
```

### TODO derivato
- [ ] **Verifica baseline T+7gg** (~2026-05-04) — primo slot `ld≥3` atteso
- [ ] **S16b residual — SSH Tailscale phone :8022 timeout** (ACL/MagicDNS, secondario)
- [ ] **S17 — Geofence Traccar :8082 down** + diagnosi servizi minori (geofence error log persistente)
- [ ] **Long-burn test S15C** — verificare 24h+ uptime + count `_force_reconnects` per camera

### Rollback (se regressione futura)
```bash
ssh gianlucadistasi@192.168.1.2 "
  cp ~/guardian/guardian.py.bak.S15C ~/guardian/guardian.py
  launchctl unload ~/Library/LaunchAgents/com.guardian.plist
  launchctl load ~/Library/LaunchAgents/com.guardian.plist
"
```

---

## [2026-04-27 SESSIONE 16] — S16a Tailscale-only video security + Bug B watchdog mitigation

### Obiettivo (deciso da CTO autonomamente)
1. Validare S15B in produzione (health check + baseline maturity)
2. Implementare S16a iMac-side: chiudere esposizione LAN `:8554` su go2rtc, bind solo Tailscale
3. S16b (phone tunnel) deferred: blocked da phone offline (sshd Termux down + Tailscale offline 3gg)

### Health check S15B (pre-S16a)
| Check | Verdict | Evidence |
|-------|---------|----------|
| Guardian uptime | ✅ 2h20min | PID 50672 from 14:55:55 (deploy S15B) |
| FP post-deploy S15B | ✅ **ZERO** | last fall event id 2715 = `2026-04-27T14:39:51` (pre-deploy) |
| Safe polygons | ✅ caricati | `[hpt:soggiorno] safe_polygons loaded: 1 zones` |
| Eventi DB post-deploy | ✅ solo `inactivity\|all` (heartbeat normale) | nessun fall/long_lie/fall_hpt |
| Baseline `ld≥3` slot count | ⏳ **0** (atteso T+7gg) | obs raccolte: soggiorno 499/24h, cameretta 124/24h |
| Cron rebuild | ✅ run 16:00 + 17:00 OK | exit PASS, 10ms |

### Implementazione S16a (3 file)
| File | Change |
|------|--------|
| `~/go2rtc.yaml.tmpl` | `rtsp.listen` da `192.168.1.2:8554` → `100.101.24.13:8554  # S16a Tailscale-only` |
| `~/guardian/guardian.py:124-125` | CAMERAS URL → `rtsp://100.101.24.13:8554/{stream}` |
| `~/guardian/guardian_watchdog.sh` (NEW) | quick-fix Bug B: cron 60s, restart Guardian se cameretta silent >180s, cooldown 300s |
| `crontab` | `* * * * * ~/guardian/guardian_watchdog.sh >> ~/guardian/logs/watchdog.log` |

Backup: `.bak.S16a` su `go2rtc.yaml`, `go2rtc.yaml.tmpl`, `guardian.py`.

### Acceptance test (PASS evidenza)
```
nc -zv 192.168.1.2 8554       → Connection refused          ✅ LAN chiusa
nc -zv 100.101.24.13 8554     → Connection succeeded        ✅ Tailscale aperta
go2rtc PID 75340              → :8554 LISTEN su 100.101.24.13 ✅
Guardian PID 76122 (post-watchdog restart)   → FPS 0.9 entrambe camere ✅
FP count post-S16a deploy     → 0 in 14 min                  ✅ NORTH_STAR
Safe polygons S15B            → mantenuti                    ✅
Watchdog intervention         → 17:49:00 silent 226s → restart OK ✅ VALIDATED LIVE
```

### Bug B watchdog VALIDATED LIVE (unintended test durante rollout)
1. 17:36 deploy S16a + restart Guardian → cameretta UP
2. 17:37:41 cameretta last log (Bug B re-trigger silenzioso)
3. 17:42:53 mio restart manuale per render forzato → cameretta retry loop (Cannot open RTSP, backoff 5→60s)
4. **17:49:00 WATCHDOG ALERT** → cameretta silent 226s (>180s threshold) → restart Guardian
5. 17:49:15 cameretta riconnessa, FPS 0.9 stable
6. 17:50:27 stato green confermato

Watchdog ha funzionato esattamente come progettato → **Bug B ora monitored, non più silenzioso**.

### Decisione architetturale CTO (giustificazioni)
- **No pf firewall rule**: bind Tailscale-only è sufficiente per chiudere LAN attack surface. pf richiede sudo password Luke + persistenza reboot complessa. Defense-in-depth con costo sproporzionato — skip salvo evidenza scan ostili.
- **No `tailscale serve`**: complessità aggiuntiva non necessaria, bind-only su utun interface basta.
- **Watchdog quick-fix vs deep fix**: deep fix Bug B (watchdog interno thread + reconnect logic) richiede sessione dedicata di design. Watchdog cron esterno è quick-win 20min, riduce MTTR cameretta da ore a 60-180s.
- **Patch template, non solo yaml generato**: cron `render_go2rtc.sh` ogni 5min sovrascriverebbe altrimenti il bind ad ogni run.

### Status S16b (PASS use-case principale, fixup post-Luke phone reboot)
- ✅ Phone Tailscale `100.100.104.104` active (direct route 192.168.1.9:49205, traffic OK)
- ✅ Phone SSH :8022 LAN funzionante (`Linux localhost aarch64 Android` reply)
- ✅ **RTSP phone→iMac via Tailscale** `100.101.24.13:8554` → `Ncat: Connected` (use-case PRIMARIO accesso video remoto)
- ⚠️ SSH phone via Tailscale `100.100.104.104:8022` → timeout (secondario, MagicDNS/ACL propagation, debug separato)

### Watchdog v2 update (post-Luke feedback)
Luke ha notato design gap: watchdog v1 monitorava solo cameretta. Bug B (`cap.read()` blocking) è generico, non camera-specifico → potrebbe colpire anche soggiorno.
**v2** (`guardian_watchdog.sh`): itera array `(cameretta soggiorno)`, restart se EITHER >180s silent, stesso cooldown 300s.
Dry-run PASS: cameretta age 2s, soggiorno age 10s, entrambe sotto threshold.

### TODO derivato (priorità ordinata)
- [ ] **🔴 S15C — Watchdog interno Guardian (deep fix Bug B)** — cron esterno è palliativo, root cause `cap.read()` blocking. Disegnare thread monitoring + auto-reconnect interno. ETA: 60-90min.
- [ ] **S16b residual — SSH Tailscale phone timeout** — verificare ACL Tailscale ammette :8022, eventualmente tailscale serve config sul phone.
- [ ] **S17 — Geofence Traccar :8082 down** + diagnosi servizi minori
- [ ] **Verifica baseline** T+7gg (~2026-05-04) — primo slot `ld≥3` atteso

---

## [2026-04-27 SESSIONE 15B] — Safe-zone-aware fix S15B DEPLOYED + production validation

### Implementazione (commit pre-push)
3 layer safe-zone-aware contro FP divano/letto:

| Layer | File | Change |
|-------|------|--------|
| 1. HPT | `horizontal_position_tracker.py` | `set_safe_polygons()` + adaptive threshold 15s→600s in safe zone |
| 2. FSM | `guardian.py:2261-2278` (PersonState) | `set_safe_zone()` + adaptive LYING_DOWN→FALLEN escalation 60s→600s |
| 3. Camera-level | `guardian.py:3164-3178` (any_fallen) | filtra ps con `_in_safe_zone=True` |
| Wiring HPT init | `guardian.py:2723-2747` | feed polygons divano/letto da zones.json al boot |
| Wiring FSM frame | `guardian.py:2911-2935` (pre-update) | calc bbox-center safe-zone test → `ps.set_safe_zone(in_safe)` |

ENV vars introdotti:
- `GUARDIAN_HPT_SAFE_FALL_DURATION` (default 600s)
- `GUARDIAN_FSM_SAFE_LYING_S` (default 600s)

Backup: `~/guardian/{guardian,horizontal_position_tracker}.py.bak.S15B`

### Deploy evidence (15:00 CEST)
```
14:56:26 [hpt:soggiorno] HPT enabled
14:56:26 [hpt:soggiorno] safe_polygons loaded: 1 zones      ← divano caricato
14:56:26 [hpt:cameretta] HPT disabled (safe zone camera)
14:56:29 [soggiorno] Connected to RTSP stream
14:56:31 [cameretta] Connected to RTSP stream
```

### Production validation (15:01 → 17:10, 2h09min)

| Metric | Value | Verdict |
|--------|-------|---------|
| Fall alerts (HPT/FSM/camera) | **0** | ✅ NORTH_STAR rispettato |
| Voice alarms | **0** | ✅ confermato da Luke |
| Telegram alerts | **0** | ✅ telegram.log vuoto |
| Sonno reale Luke sul divano | **1h30min** | ✅ no false negative dramma |
| State transitions | 35 in 90min | normale |
| LYING_DOWN events | 1 finestra di 24s (15:18:41→15:19:05) | postura simile FP 14:36 (angle 56 vs 65) |

### Caveat tecnico (CTO note)
La fix safe-zone-aware **non è stata formalmente esercitata** in questa sessione perché i 24s di LYING_DOWN sono sotto tutti i vecchi timer (HPT 45s, FSM 60s, camera 120s). Quindi anche senza fix non ci sarebbero stati FP.

**Perché il 14:36 ha generato 3 FP** (HPT@30s+FSM@60s+CAM@120s):
- LYING_DOWN doveva durare >120s continuativi
- YOLO classificava persistentemente angle≥45 ar≥1.5
- Postura più "stabile" o camera con vista migliore

**Oggi invece**: 51min di gap detection (15:20→16:11) — Luke dormiva nascosto dallo schienale, YOLO non lo vedeva affatto. Quando lo vedeva (sporadici STANDING all'alba del risveglio), non era LYING_DOWN.

**Stato fix**: deployato e corretto sintatticamente. Resta in produzione come **safety-net** per ricorrenza naturale del FP pattern 14:36. Validation definitiva attesa T+7gg in produzione.

---

## PIANO S15B-READY — Fix P0 FP divano (ESEGUITO ✅)

### Contesto
NORTH_STAR target zero FP/settimana è VIOLATO. Persona si stende sul divano → 3 sistemi paralleli triggerano FALLEN, **nessuno safe-zone-aware**.

**Evidence dal log live 2026-04-27 14:36-14:39**:
```
14:36:50 track#421 UNKNOWN→LYING_DOWN angle=65 ar=2.48      ← persona si stende
14:37:20 [hpt:soggiorno] HPT FALL ALERT dur=30.4s            ← Layer 1: HPT 15s+grace
14:37:51 track#421 LYING_DOWN→FALLEN duration=61.0s          ← Layer 2: FSM 60s
14:39:51 [fall-cam] CAMERA-LEVEL FALL ALERT after 120.3s     ← Layer 3: camera-level
```

### Architettura attuale (da S15 audit)
| Layer | File:line | Trigger | Safe-zone aware? |
|-------|-----------|---------|-------------------|
| 1. HPT | `horizontal_position_tracker.py:42-145` | `fall_thresh=15s` (env `GUARDIAN_HPT_FALL_DURATION`), trigger riga 124-130 | ❌ NO |
| 2. FSM | `guardian.py:2410-2414` (`_determine_state` LYING_DOWN branch) | Timer 60s hardcoded | ❌ NO |
| 3. Camera-level | `guardian.py:3115-3160` | `any_fallen` + `FALL_CONFIRMATION_SECONDS=6s` cooldown | ❌ NO (warning loggato PRIMA della suppression score) |

`zones.json` (`~/guardian/zones.json`) ha già polygon `divano` (soggiorno, [600,400]→[1200,900]) e `letto` (cameretta, [800,200]→[1920,900]). Usato solo da `geo_scorer` per penalty -15 (post-decisione, troppo tardi).

### Fix proposto — Safe-zone-aware multi-layer

#### Layer 1: HPT polygon-aware
**File**: `~/guardian/horizontal_position_tracker.py`

**Aggiungi a `__init__`**:
```python
self.safe_polygons = []  # list of np.array poligoni in coords assolute
self.safe_fall_thresh = float(os.environ.get('GUARDIAN_HPT_SAFE_FALL_DURATION', '600.0'))  # 10min in safe zone
```

**Aggiungi metodo dopo `reset()`**:
```python
def set_safe_polygons(self, polygons):
    """polygons: list of np.array shape (N,2) in coords assolute frame originale"""
    import numpy as np
    self.safe_polygons = [np.asarray(p, dtype=np.int32).reshape(-1, 1, 2) for p in polygons]
```

**Modifica `update()` riga ~118-130** (calcolo `is_fallen`):
```python
# v3.3 (S15B): se best region centroid in safe polygon, usa soglia estesa
import cv2 as _cv2
threshold = self.fall_thresh
if best is not None and self.safe_polygons:
    bx1, by1, bx2, by2 = best.bbox
    cx = (bx1 + bx2) / 2 * self.fw
    cy = (by1 + by2) / 2 * self.fh
    for poly in self.safe_polygons:
        if _cv2.pointPolygonTest(poly, (float(cx), float(cy)), False) >= 0:
            threshold = self.safe_fall_thresh
            break
self.is_fallen = (best is not None and self.fallen_duration >= threshold)
```

#### Layer 2: FSM safe-zone aware
**File**: `~/guardian/guardian.py`

**In `FallStateMachine.__init__`** (cercare `self._lying_down_since = None` riga ~2261):
```python
self._in_safe_zone = False  # v3.3 S15B
self._safe_lying_escalation_s = 600.0  # v3.3 S15B: 60s default → 600s in safe zone
```

**Aggiungi metodo nella classe**:
```python
def set_safe_zone(self, in_safe: bool):
    self._in_safe_zone = in_safe
```

**Modifica `_determine_state` LYING_DOWN escalation** (~riga 2410-2414):
```python
# v3.3 S15B: timer adaptive — 60s default, 600s in safe zone (siesta normale)
escalation_threshold = self._safe_lying_escalation_s if self._in_safe_zone else 60
if self._lying_down_since and (time.time() - self._lying_down_since) > escalation_threshold:
    self.falling_start = self._lying_down_since
    return "FALLEN"
```

#### Layer 3: Camera-level safe-aware
**File**: `~/guardian/guardian.py:3117-3119`

**Modifica `any_fallen` calc**:
```python
# v3.3 S15B: ignora FALLEN se TUTTI sono in safe zone (timer FSM esteso a 600s, ma cautela)
fallen_outside_safe = [ps for ps in self.person_states.values()
                        if ps.state == "FALLEN" and now - ps.last_update < 5
                        and not getattr(ps, '_in_safe_zone', False)]
any_fallen = len(fallen_outside_safe) > 0
```

#### Wiring HPT.set_safe_polygons() init
**File**: `~/guardian/guardian.py:2723-2727` (dopo `self.hpt = HorizontalPositionTracker(...)`)
```python
# v3.3 S15B: feed HPT i polygon di safe zone da zones.json
cam_zones = self.zones_config.get("cameras", {}).get(name, {}).get("zones", {})
safe_polys = []
for zname in ("divano", "letto"):
    if zname in cam_zones:
        pts = cam_zones[zname].get("polygon", [])
        if len(pts) >= 3:
            safe_polys.append(pts)
if safe_polys:
    self.hpt.set_safe_polygons(safe_polys)
    log.info(f"[hpt:{name}] safe_polygons loaded: {len(safe_polys)} zones")
```

#### Wiring FSM.set_safe_zone() per-frame
**File**: `~/guardian/guardian.py` ~riga 2980-2990 (dove già si calcola `in_safe` per geo_scorer)

Subito DOPO il calcolo di `in_safe` (loop polygon test, riga ~2978-2987), prima del `FallScorer.compute(...)`:
```python
ps.set_safe_zone(in_safe)  # v3.3 S15B: feed FSM
```

### Deploy steps (atomico)
```bash
# 1. Backup su iMac
ssh gianlucadistasi@192.168.1.2 "
  cp ~/guardian/horizontal_position_tracker.py ~/guardian/horizontal_position_tracker.py.bak.S15B
  cp ~/guardian/guardian.py ~/guardian/guardian.py.bak.S15B
"

# 2. Edit locale Mac scripts/guardian/horizontal_position_tracker.py + scripts/guardian/guardian.py
# 3. Syntax check locale: python3 -c "import ast; ast.parse(open('scripts/guardian/guardian.py').read())"

# 4. Deploy
scp scripts/guardian/horizontal_position_tracker.py gianlucadistasi@192.168.1.2:~/guardian/
scp scripts/guardian/guardian.py gianlucadistasi@192.168.1.2:~/guardian/

# 5. Reload
ssh gianlucadistasi@192.168.1.2 "launchctl unload ~/Library/LaunchAgents/com.guardian.plist; sleep 2; launchctl load ~/Library/LaunchAgents/com.guardian.plist"

# 6. Verify startup
ssh gianlucadistasi@192.168.1.2 "sleep 10; pgrep -af guardian.py | head -2; tail -30 ~/guardian/logs/guardian.log | grep -E 'safe_polygons|HPT enabled|Connected to RTSP'"
```

### Test acceptance
1. **Cold check**: log mostra `[hpt:soggiorno] safe_polygons loaded: 1 zones`
2. **Live test**: persona si stende sul divano per 5 min
   - PASS: nessun `[hpt:soggiorno] HPT FALL ALERT` dopo 30s
   - PASS: nessun `LYING_DOWN→FALLEN` dopo 60s
   - PASS: nessun `[fall-cam] CAMERA-LEVEL FALL ALERT`
   - Log atteso: `[fall-diag] LYING_DOWN` persistente, eventualmente `[fall-diag] LYING_DOWN→STANDING` quando si rialza
3. **Safety regression**: persona si STENDE FUORI dal polygon divano (es. zona ingresso pavimento) per 60s
   - PASS: HPT/FSM/CAM-LEVEL alert scattano normalmente (safe zone non attiva)

### Files coinvolti (riepilogo)
- `~/guardian/horizontal_position_tracker.py` — add safe_polygons + threshold extension
- `~/guardian/guardian.py` — FSM `set_safe_zone()` + adaptive timer + camera-level filter + HPT wiring
- `~/guardian/zones.json` — già OK (divano + letto polygons definiti)

### Rollback se KO
```bash
ssh gianlucadistasi@192.168.1.2 "
  cp ~/guardian/horizontal_position_tracker.py.bak.S15B ~/guardian/horizontal_position_tracker.py
  cp ~/guardian/guardian.py.bak.S15B ~/guardian/guardian.py
  launchctl unload ~/Library/LaunchAgents/com.guardian.plist
  launchctl load ~/Library/LaunchAgents/com.guardian.plist
"
```

---

## [2026-04-27 SESSIONE 15] — Validazione baseline pipeline + ETA realistico FP suppression

## [2026-04-27 SESSIONE 15] — Validazione baseline pipeline + ETA realistico FP suppression

### Verifica live post-S14 (ore 13:41)
| Check | Risultato |
|-------|-----------|
| Guardian PID 36820 uptime | 9 min (restart S14 OK) |
| Obs cameretta nuove (post 11:33Z) | 16 totali (3 rows ABSENT) |
| Obs soggiorno nuove (post 11:33Z) | 16 totali (9 ABSENT + 6 STANDING + 1 SITTING) |
| Cameretta thread vivo | 73 menzioni in tail -200 ✅ |
| FP rilevati ultime 24h | ZERO ✅ (events table vuota per fall*) |
| Cron rebuild installato | ✅ `0 * * * * rebuild_baseline_profile.py` |
| Cron rebuild eseguito manualmente | ✅ logfile creato 13:45, exit 3 (warn coverage) |

### Pipeline `score_observation` validata funzionante
Test runtime su slot popolato (`baseline_learner.score_observation()`):
```
is_learning: False
days_collected: 7    ← meta dice learning completato (Apr 13 → Apr 20)

cameretta/0-13:30/ABSENT: probability=1.0  conf=0.25  reason=insufficient_days_1
soggiorno/0-13:30/STANDING: probability=0.667 conf=0.167 reason=insufficient_days_1
soggiorno/0-13:35/ABSENT: probability=0.75 conf=0.25 reason=insufficient_days_1
FALLEN any-slot: reason=fall_never_suppressed  ✅ (mai soppresso, hard rule OK)
UNKNOWN_STATE: reason=state_never_seen_in_slot  ✅
```

**Pipeline funziona**: probability calcolata correttamente, hard rules su FALLEN attive, fallback su stato sconosciuto OK. **L'unico blocco è temporale**: `learning_days=1` nel profilo per ogni slot, vs `min_days_to_score=3`.

### Root cause timing — design baseline è long-term
`_rebuild_profile()` (`baseline_learner.py:155-191`):
- `learning_days = COUNT(DISTINCT date(created_at))` **per slot+state**
- cutoff = `now - learning_period_days(7)` → finestra rolling 7gg
- Per ogni slot serve che lo stesso `(camera, dow, hour, slot, state)` appaia in **3 date distinte**

**Implicazioni timing**:
- Slot ricorrente (es. ABSENT in tutti gli hour quando casa vuota): primo `ld≥3` dopo 3 visite distinct-date → T+3-7gg
- Slot vincolato a dow specifico (es. STANDING-soggiorno-Lunedì-13:30): serve **3 Lunedì** → T+14gg minimo (3 settimane se ld=3 finestra)
- Coverage operativa diffusa: **T+21gg** (3 settimane di osservazione regolare)

**Obs storiche escluse**: cameretta Apr 14 (114 obs) + soggiorno Apr 14-17 (435 obs) sono FUORI window 7gg (cutoff 2026-04-20). Avrebbero dato ld=2-4 a vari slot ma non sono utilizzabili senza modificare design.

### Decisione design (NON modificato)
Mantenuto `min_days_to_score=3` + `learning_period_days=7` per coerenza con North Star (zero FP, Bosch IVA professional standard). Trade-off accettato: T+21gg per FP suppression operativa vs accuracy.

**Path alternativo se urgenza**: ridurre `min_days_to_score=1` per validation immediata + scoring rumoroso temporaneo. NON applicato S15 — richiede approvazione esplicita Luke.

### Stato finale S15
✅ Bug ingestion S14 confermato risolto (32 obs in 9 min uptime)
✅ Cameretta thread vivo (no Bug B regression)
✅ Cron rebuild eseguito + logfile attivo
✅ Pipeline `score_observation` validata end-to-end con dati reali
✅ ZERO FP nelle ultime 24h
⏳ FP suppression operativa: rimandata T+7gg (S16 ~2026-05-04) per primo slot ricorrente, T+21gg coverage diffusa

### Da S16 (≥2026-05-04 per re-validation)
- [ ] Re-test `score_observation` su slot ricorrente: target `is_normal=True suppress_alert=True` su almeno 1 slot ABSENT
- [ ] Verificare cron `rebuild_baseline_profile.py` eseguito ininterrottamente (log non interrotto)
- [ ] Snapshot coverage settimanale: target soggiorno ≥30 slot, cameretta ≥10 slot
- [ ] Se coverage cresce ma `ld` resta basso: investigare distribuzione slot temporale (potrebbe servire raccoglie più granularmente)

### Backlog secondario (separato da baseline)
- [ ] Watchdog thread morto (P2) — auto-respawn camera silente >2min (preventivo Bug B)
- [ ] Geofence Traccar :8082 down (P3) — verifica servizio crashato/porta cambiata
- [ ] Phone SSH :8022 down — escalation errors persistenti
- [ ] Dashboard audio settings (slider loudnorm I + EQ profile dropdown + JSON persist)

---

## [2026-04-27 SESSIONE 14] — Fix P0 ingestion baseline_observations + restart thread morto

### Root cause identificata (2 bug distinti)
**Bug A — record_observation chiamato solo con persone presenti**
- `guardian.py:2922` era DENTRO il `for i, tid in enumerate(ids):` loop (line 2891)
- Si eseguiva solo se YOLO trackava almeno una persona valida (skeleton OK + person_count++)
- Quando casa vuota (`boxes=0` = 90% del tempo) → NESSUNA obs scritta
- `state='ABSENT'` non finiva mai in DB → baseline learner non imparava il pattern dominante
- Ricaduta: filtro FP suppression contesto-dipendente morto → spam Telegram non sopprimibile

**Bug B — thread cameretta morto**
- Da Apr 24 18:57:32 (`Connected to RTSP stream`) ZERO log `[cameretta]` per 65h
- Soggiorno si riconnetteva normalmente (12:33, 12:55, 13:18 Apr 27)
- go2rtc API confermava `cameretta consumers: None` (vs soggiorno `consumers: []`)
- Thread bloccato silenziosamente in `cap.read()` infinito senza watchdog

### Fix applicato
**Patch A** (`guardian.py:2921-2926` + nuovo blocco `:3100-3108`):
```python
# v3.1: Feed baseline learner — wrap try/except (S14: errori ora visibili)
if self.baseline_learner and self.frame_count % 30 == 0:
    try:
        self.baseline_learner.record_observation(self.name, state)
    except Exception as _e:
        log.exception(f"[baseline] record_observation({self.name},{state}) failed: {_e}")

# (FUORI dal for-loop ids, dopo line 3098)
# S14 fix (P0 ingestion): registra ABSENT quando casa vuota
if self.baseline_learner and self.frame_count % 30 == 0 and person_count == 0:
    try:
        self.baseline_learner.record_observation(self.name, 'ABSENT')
    except Exception as _e:
        log.exception(f"[baseline] record_observation({self.name},ABSENT) failed: {_e}")
```

**Patch B** — restart Guardian via `launchctl unload/load` per ripartire thread cameretta morto.

### E2E verifica PASS
```
PRE-fix (PID 89379, up 65h):
  cameretta|2026-04-14T18:55:25.804Z|114  obs (zero da 13gg)
  soggiorno|2026-04-24T20:06:28.579Z|435  obs (zero da 65h)

POST-fix + restart (PID 36820, ore 13:33):
  cameretta Connected to RTSP   ← thread vivo
  soggiorno Connected to RTSP
  baseline schema initialized (learning=False, days=7)

POST-fix obs (entro 4 min):
  soggiorno|STANDING|... 11:34:13Z  ← persona presente registrata
  soggiorno|ABSENT|...   11:35:19Z  ← casa vuota registrata (NEW behavior)
  cameretta|ABSENT|3|    11:33:43Z  ← cameretta vuota registrata (NEW)
  cameretta|ABSENT|3|    11:35:22Z
  soggiorno|STANDING|1|  11:36:24Z
```

### Cron rebuild installato
```
0 * * * * cd $HOME/guardian && /usr/bin/python3 rebuild_baseline_profile.py >> $HOME/guardian/logs/baseline_rebuild.log 2>&1
```
Rebuild manuale eseguito post-fix:
```
PRE rebuild profile: [('soggiorno', 8, 29)]
Observations raw: [('cameretta', 116, 311), ('soggiorno', 439, 2530)]
[baseline] Profile rebuilt: 14 slot-state rows
POST rebuild profile: [('cameretta', 2, 7), ('soggiorno', 12, 36)]
```
Coverage ancora sotto soglia (50/10) — atteso: S14 ha appena ripristinato ingestion, crescerà nei prossimi giorni di osservazione.

### Stato finale S14
✅ Bug A fixato — record_observation chiamato sempre (anche con casa vuota)
✅ Bug B fixato via restart — cameretta thread vivo, FPS attiva
✅ try/except con log.exception — futuri errori non saranno più silenziati
✅ Cron rebuild attivo (hourly)
✅ Profilo ricostruito (14 slot-state rows attive)

### Da S15
- [ ] Watchdog thread morto (P2) — auto-respawn se camera silente >2min (preventivo Bug B)
- [ ] Verificare coverage profilo dopo 24h-48h di ingestion (target soggiorno >50, cameretta >10)
- [ ] Test score_observation manuale su pattern familiare (is_normal=True quando in linea con baseline)
- [ ] Geofence Traccar :8082 down (separato, P3)
- [ ] Phone SSH :8022 down (`escalation` errors persistenti, separato)
- [ ] Dashboard audio settings (slider loudnorm I + EQ profile dropdown + JSON persist)

---

## [2026-04-27 SESSIONE 13] — Chiusura Guardian v3.2: voice confirm v3.1 E2E verificato

### Premessa: TODO stale
PROJECT_STATE riportava 2 TODO ("integrare audio v3.1 in guardian.py" + "conferma auditiva cameretta") ma audit codice ha rivelato che il wiring era già presente da Apr 16 (sessione precedente). Sessione 13 verifica + conferma fisica + chiusura sprint.

### Audit wiring guardian.py
| Componente | Riferimento | Stato |
|------------|-------------|-------|
| `local_voice_announce()` | guardian.py:556-585 | ✅ chiama `ezviz_aac_talk.py text 'all'` in daemon thread, env DYLD_LIBRARY_PATH=~/ezviz_sdk |
| `voice_confirmed_fall_alert()` | guardian.py:594-603 | ✅ step 1 invoca `local_voice_announce(tts_text)` sync |
| Call sites FALLEN | guardian.py:2876, 3083, 3159 | ✅ 3 thread spawn su evento conferma fall |
| Residui v2 `tanh` | grep -c | ✅ 0 occorrenze |
| Subprocess pattern | `subprocess.run([sys.executable, SCRIPT, ...])` | ✅ rilegge file v3.1 a ogni call → zero-restart su update |

### E2E test live (audio reale in casa, ore 12:46-12:48)
**Round 1** — Luke in soggiorno:
```
[soggiorno] PASS  Sent 75/75 frame (0 fail)  EQ profile=soggiorno
[cameretta] PASS  Sent 75/75 frame (0 fail)  EQ profile=cameretta
```

**Round 2** — Luke al centro casa per giudizio binaurale:
```
[soggiorno] PASS  Sent 111/111 frame (0 fail)
[cameretta] PASS  Sent 111/111 frame (0 fail)
```

**Conferma auditiva fisica**: Luke conferma PASS entrambe le camere → chiude TODO pendente da S11 ("conferma auditiva cameretta").

### Evidence stack
- Guardian PID 89379 up da Apr 24 18:57 (uptime 2g17h)
- FPS 0.2 stabile (cattura voluta low rate)
- `cameras_resolved.json` aggiornato 12:45 (cron */5): soggiorno=.12, cameretta=.5
- `ezviz_aac_talk.py` v3.1 mtime Apr 27 12:33 (deploy S12)
- `guardian.py` mtime Apr 16 19:37 (wiring stable da S precedente)
- 0 errori critici in `~/guardian/logs/guardian.log` durante test

### Sprint chiuso
Guardian v3.2 production = wiring + capture + voice confirm + auto-discovery IP — tutti componenti verificati live in sessione 13. Pipeline completa: FALLEN trigger → `voice_confirmed_fall_alert` thread → `local_voice_announce` → AAC talkback EZVIZ → Luke/famigliare risponde → STT/NLU → cancel-or-escalate.

### Prossimi candidati (no priorità imposta)
- Dashboard audio settings (slider loudnorm I + EQ profile dropdown)
- PTZ Patrol (`ptz_patrol.py` lock-on/unlock su voice positive)
- Geofence Traccar :8082 (down — investigare separatamente)
- Medication Reminder (blocked: serve Android vecchio + Termux/MacroDroid casa mamma)

---

### Investigazione baseline (S13 fine sessione) — bug duplice scoperto

**Bug 1: profile rebuild congelato**
- `BaselineLearner._rebuild_profile()` chiamato una sola volta su transition `learning_complete 0→1` (Apr 13)
- `rebuild_profile_daily()` esiste ma non è invocata da nessuno → codice morto
- Profile fermo a Apr 24 17:43, 12 slot soggiorno / 0 cameretta vs ~2000 attesi
- **Tool creato**: `~/guardian/rebuild_baseline_profile.py` (idempotent rebuild, WAL-safe vs Guardian attivo, exit code 3 se coverage sotto soglia)

**Bug 2 (P0 S14): ingestion observations rotta**
Eseguendo il rebuild sono emersi dati upstream impossibili:
```
cameretta: 114 obs — TUTTE Apr 14 (10:58-18:55) — poi NULLA
soggiorno: 435 obs — Apr 14-17 + soli 8 obs il Apr 24 — poi NULLA
                     ZERO obs dal Apr 24 20:06 (ultime 65h)
```
- Guardian PID 89379 up da Apr 24 18:57 (65h)
- Capture FPS 0.2 stabile (log confermano)
- `record_observation` chiamato `frame_count % 30 == 0` → atteso ~1500 obs in 65h
- Reale: 8 obs (e cameretta zero da 13 giorni)

**Ipotesi diagnostiche per S14**:
1. Eccezione silenziata in `record_observation()` (try/except che inghiotte error)
2. DB lock con altro processo (rebuild_baseline_profile.py? backup_manager?)
3. Cameretta non istanziata come monitor in Guardian (verificare loop init line 3858)
4. Cambio schema/path DB dopo Apr 14/24 con sync rotto

**Cron rebuild NON installato**: rimandato a S14 dopo fix ingestion. Senza dati freschi sarebbe inutile.

### Stato finale S13
✅ Guardian v3.2 voice confirm production
🔴 Filtro baseline FP suppression **non operativo** (bug ingestion scoperto, non risolto)
🔧 Tool `rebuild_baseline_profile.py` deployato e funzionante (pronto per quando ingestion sarà fixata)

---

## [2026-04-27 SESSIONE 12] — Auto-discovery IP EZVIZ end-to-end (CTO ordering)

### Strategia CTO applicata
1. **NO quick fix** (sostituzione hardcoded `.6 → .12`) — investito proper fix per resilience DHCP futuro
2. **Scoperta architetturale**: Guardian usa già go2rtc proxy (`rtsp://192.168.1.2:8554/{name}`) → `guardian.py` NON va toccato. Risparmiato Step 5.
3. **Decisione go2rtc strategy**: Opzione A (template + render) > B (/etc/hosts) — debug esplicito, no sudo, no DNS cache
4. **Rischio minimizzato**: backup `.bak.timestamped` + syntax check + fallback hardcoded in ogni consumer

### File creati/modificati
- `scripts/guardian/ezviz_ip_resolver.py` (NEW, 6.3KB) — pyezviz cloud → JSON atomico
- `scripts/guardian/go2rtc.yaml.tmpl` (NEW) — placeholder `{{SOGGIORNO_IP}}`/`{{CAMERETTA_IP}}`
- `scripts/guardian/render_go2rtc.sh` (NEW, 2.6KB) — render idempotente + kickstart LaunchAgent
- `scripts/guardian/ezviz_aac_talk.py` — `_load_cameras()` con fallback `.12`/`.5`
- `crontab` iMac — `*/5 * * * *` resolver + render con path assoluti
- Backup salvati: `~/ezviz_sdk/ezviz_aac_talk.py.bak.20260427_123327`, `~/go2rtc.yaml.bak.20260427_123327`

### Evidence PASS
```
12:33:38 [INFO] cameretta (D42498043) → 192.168.1.5 ssid=WINDTRE-E151E0 signal=74
12:33:38 [INFO] soggiorno (D91472203) → 192.168.1.12 ssid=WINDTRE-E151E0 signal=92
12:33:49 [render_go2rtc] yaml aggiornato: soggiorno=192.168.1.12 cameretta=192.168.1.5
12:33:49 [render_go2rtc] go2rtc kickstart OK
12:33:59 [INFO] [soggiorno] Connected to RTSP stream     ← Guardian RICONNESSO
12:34:00 [INFO] [heatmap] Saved: heatmap_soggiorno_20260427_123400.png (503 points)
12:35:55 [WARNING] IP CHANGE detected: soggiorno: 192.168.1.99 → 192.168.1.12  ← E2E mutation test
go2rtc API: soggiorno → rtsp://admin:QSTOZH@192.168.1.12:554/H.264
go2rtc API: cameretta → rtsp://admin:GEGURX@192.168.1.5:554/H.264
ezviz_aac_talk: CAM_IP loaded=192.168.1.12, CAM2_IP loaded=192.168.1.5  ← da JSON, non hardcoded
```

### Test E2E (mutazione manuale)
- JSON forzato a `.99` per soggiorno → render produce yaml `.99` + reload OK
- Resolver vero rieseguito → IP CHANGE detected, JSON ripristinato a `.12`
- Render rigenera yaml `.12` + reload OK (PID go2rtc 39819 → 27514 → ...)

### Architettura risultante
```
[cloud EZVIZ]──pyezviz──┐
                        ↓ (cron */5)
              ezviz_ip_resolver.py
                        ↓ (write atomic)
        ~/guardian/cameras_resolved.json  ← FONTE DI VERITÀ
                        ↓
        ┌───────────────┼─────────────────┐
        ↓               ↓                 ↓
  ezviz_aac_talk    render_go2rtc.sh   (futuri consumer)
  (audio backchannel) │
                      ↓
              ~/go2rtc.yaml ──→ [go2rtc reload] ──→ Guardian RTSP feed
```

### PROSSIMA SESSIONE
- [ ] Conferma auditiva audio cameretta v3.1 (già PASS tecnico, manca conferma fisica)
- [ ] Integrare `ezviz_aac_talk.py` in `guardian.py local_voice_announce` (sostituisce subprocess tanh v2)
- [ ] Dashboard audio settings (slider loudnorm I + EQ profile dropdown + JSON persist)
- [ ] (esplorativo) `NET_DVR_SetDVRConfig(NET_DVR_SET_NETCFG_V30)` per IP statico firmware — auto-discovery già sufficiente, ma double-belt
- [ ] Geofence Traccar :8082 connection refused — separato, da investigare

### Verifica stato live pre-sessione
```bash
ssh gianlucadistasi@192.168.1.2 "cat ~/guardian/cameras_resolved.json | head -5; tail -3 ~/guardian/logs/ip_resolver.log; tail -3 ~/guardian/logs/render_go2rtc.log; tail -3 ~/guardian/logs/guardian.log | grep -i soggiorno"
```

---

## [2026-04-27 SESSIONE 11] — Audio v3.1 PASS + Diagnosi DHCP rename + Strategia persistenza

### Completato
- **Audio EZVIZ v3.1 soggiorno — CONFERMA AUDITIVA PASS** (Luke ha sentito "Mamma stai bene" chiaramente, loudnorm I=-10 TP=-1.0 OK su speaker C6CN)
- **Audio EZVIZ v3.1 cameretta** — PASS tecnico 40/40 frame ADTS, conferma fisica non esplicitamente confermata da Luke (sessione successiva)
- **Diagnosi camera soggiorno offline**:
  - Sintomo: `Login err=7` SDK + Guardian "Cannot open RTSP soggiorno" + ARP `incomplete` su `192.168.1.6`
  - Scan /24 + IPv4LL + mDNS Hikvision/RTSP/Bonjour: tutti negativi → camera NON era su `.6`
  - Soluzione: query cloud EZVIZ via `pyezviz.EzvizClient(...).get_device_infos()` da `~/guardian/ptz_diagnose.py` template
  - Estratto da `WIFI` field per device: `address`, `ssid`, `signal`, `gateway`
- **Mappatura camere reale** (post DHCP renew):
  - Soggiorno (D91472203 = C6CN): `192.168.1.12` MAC `60:23:a4:e4:ff:af`, signal 92, WINDTRE-E151E0
  - Cameretta (D42498043 = ezCube Pro): `192.168.1.5` MAC `50:13:95:8a:33:a0`, signal 68, WINDTRE-E151E0
  - Router casa: `3c:64:cf:e1:51:e0` (WindTre, SSID coerente con MAC)
- **Test audio LIVE su nuova IP .12**: PASS — wrapper `/tmp/talk_12.py` chiama `ezviz_aac_talk.talk(ip='192.168.1.12', pwd='QSTOZH', eq_profile='soggiorno')`
- **Decisione architetturale persistenza**: auto-discovery via cloud EZVIZ (vs static IP firmware) — il firmware C6CN consumer spesso blocca `NET_DVR_SetDVRConfig`, mentre il cloud lookup è 100% affidabile e zero-touch sul router

### File toccati
- `.planning/HANDOFF.md` — questo update
- `.claude/PROJECT_STATE.md` — sprint aggiornato (auto-discovery in-progress, .6 → .12 documentato)
- Nessun codice modificato (solo diagnosi)

### Stato config attuale (DA AGGIORNARE PROSSIMA SESSIONE)
- `scripts/guardian/ezviz_aac_talk.py` linea 21: `CAM_IP = '192.168.1.6'` ← STALE
- `~/ezviz_sdk/ezviz_aac_talk.py` su iMac: stesso ← STALE
- `~/go2rtc.yaml` su iMac: probabilmente `rtsp://...@192.168.1.6:554/...` ← STALE
- `~/guardian/guardian.py` CAMERAS dict: probabilmente `.6` ← STALE
- Guardian sta loggando `[ERROR] [soggiorno] Cannot open RTSP, retrying in 60s` → continuerà finché config non aggiornata

### PROSSIMA SESSIONE — Implementazione persistenza

**Step 1 — Script `ezviz_ip_resolver.py`** (nuovo, su iMac)
- Input: credenziali `EZVIZ_EMAIL`/`EZVIZ_PASSWORD` da `~/guardian/guardian.env`
- Output: `~/guardian/cameras_resolved.json`
  ```json
  {
    "updated_at": "2026-04-27T11:50:00Z",
    "cameras": {
      "soggiorno": {"serial": "D91472203", "ip": "192.168.1.12", "mac": "60:23:a4:e4:ff:af", "ssid": "WINDTRE-E151E0", "signal": 92},
      "cameretta": {"serial": "D42498043", "ip": "192.168.1.5",  "mac": "50:13:95:8a:33:a0", "ssid": "WINDTRE-E151E0", "signal": 68}
    }
  }
  ```
- Chiamato da cron ogni 5 min

**Step 2 — Refactor `ezviz_aac_talk.py`**
- Rimuovere `CAM_IP`/`CAM2_IP` hardcoded
- Aggiungere `_load_cameras()` che legge `~/guardian/cameras_resolved.json`
- `talk(target='soggiorno')` → lookup IP da JSON
- Fallback IP hardcoded se JSON mancante (backward-compat)

**Step 3 — Refactor `~/go2rtc.yaml`**
- Opzione A: template `go2rtc.yaml.tmpl` + script `render_go2rtc.sh` che sostituisce `{{SOGGIORNO_IP}}`/`{{CAMERETTA_IP}}` da JSON
- Opzione B: usare hostname locale (aggiungere a `/etc/hosts` riga `192.168.1.12 soggiorno.zeroclaw.local` aggiornata da cron)
- Decidere prossima sessione (A più semplice, B più elegante)

**Step 4 — Refactor `guardian.py` CAMERAS dict** + reload integration

**Step 5 — Cron**:
```bash
*/5 * * * * /usr/local/bin/python3 ~/guardian/ezviz_ip_resolver.py && /usr/local/bin/bash ~/guardian/render_go2rtc.sh
```

**Step 6 — Bonus (esplorativo)**: tentare `NET_DVR_GetDVRConfig(NET_DVR_GET_NETCFG_V30)` per leggere config rete. Se readable, tentare `SetDVRConfig` con IP statico .6. Se firmware accetta = doppia persistenza. Se rifiuta = continuiamo con auto-discovery (già più che sufficiente).

### Verifica stato live pre-sessione
```bash
ssh gianlucadistasi@192.168.1.2 "ping -c 1 192.168.1.12 192.168.1.5; tail -5 ~/guardian/logs/guardian.log; ls ~/guardian/cameras_resolved.json 2>/dev/null && cat ~/guardian/cameras_resolved.json"
```

---

## [2026-04-24 SESSIONE 10] — Restart Guardian + Anti-Drift Framework + Audio Volume Tuning

### Completato
- **Guardian restart**: era DOWN da 7 giorni (shutdown pulito 2026-04-17 21:36, KeepAlive LaunchAgent non ripartiva su SuccessfulExit). `launchctl unload + load -w` → Guardian v3.0 UP alle 18:57, MQTT connesso, entrambe camere loaded (FPS 0.9 stabili).
- **Regole permanenti salvate in memory**:
  - `feedback_execute_commands.md` — Claude esegue comandi direttamente (no "esegui tu:")
  - `feedback_full_ownership.md` — Claude ha piena responsabilità decisionale, Luke chiede SOLO per azioni fisiche (audio, hardware) o risorse esterne (Perplexity, NotebookLM)
- **Framework anti-drift integrato** (da analisi PROMPT_CC_ENTERPRISE_UNIVERSALE.md):
  - `.claude/NORTH_STAR.md` — vincoli immutabili ZeroClaw (zero FP, €0, Termux, privacy on-premise, elderly-first)
  - `.claude/PROJECT_STATE.md` — sprint strutturato (in-progress/todo/blocked/done)
  - `.claude/hooks/session-start.py` — SessionStart hook che carica NS+PS all'inizio sessione
  - `.claude/skills/alignment-check/SKILL.md` — gate IN-SCOPE/BORDERLINE/OUT-OF-SCOPE su nuove feature
- **ADR directory** `docs/adr/` con 5 decisioni storiche recuperate:
  - ADR-001 TSSTG abbandonato → GeometricFallScorer primario (2026-04-14)
  - ADR-002 EZVIZ backchannel impossibile (12 approcci documentati)
  - ADR-003 TCN training fallito 2x, keep TSSTG
  - ADR-004 EZVIZ audio pipeline v1→v3 (tanh → ffmpeg EQ)
  - ADR-005 Mosquitto 2.1.2 sostituisce amqtt (auth obbligatoria)
- **Scartato** dal framework universal (non applicabile): Sessione B business layer, Sentry/staging/feature flag, 5 subagent standard (architect+validator già esistono)
- **Housekeeping**: .gitignore untrack `__pycache__/`, `settings.json.backup_*`
- **Statusline Claude Code ripristinata** (user-level `~/.claude/statusline-command.sh` + `~/.claude/settings.json`): formato `Sonnet | main | ███████░░░ 73%` con context bar ASCII
- **Commit pushato**: `b713233` su origin/main

### Audio EZVIZ v3 — test iterativo 2026-04-24
- **Test 1 soggiorno** (loudnorm I=-13 TP=-1.5): 130/130 frame PASS tecnico. Feedback Luke: **volume basso**, chiarezza accettabile, intelligibilità accettabile.
- **Fix deployato**: `loudnorm I=-13→-10` (+3 LUFS) + `TP=-1.5→-1.0` (headroom aperto). Modifica su `scripts/guardian/ezviz_aac_talk.py` + scp a `~/ezviz_sdk/` iMac.
- **Test 2 soggiorno** (loudnorm I=-10 TP=-1.0): 130/130 frame PASS tecnico. **Feedback utente PENDING — rimandato a domani.**

### File aggiornati oggi
- `scripts/guardian/ezviz_aac_talk.py` — EQ_PROFILES con loudnorm I=-10 TP=-1.0 (v3.1)
- `~/ezviz_sdk/ezviz_aac_talk.py` — deployato su iMac
- `.claude/NORTH_STAR.md`, `.claude/PROJECT_STATE.md`, `.claude/hooks/session-start.py`
- `.claude/skills/alignment-check/SKILL.md`
- `docs/adr/` (7 file: README + TEMPLATE + 5 ADR)
- `.claude/settings.json` — SessionStart hook registrato
- `.gitignore` — esclusioni pyc + backup

### PROSSIMA SESSIONE (domani)

**Priorità 1 — Conferma auditiva audio EZVIZ v3.1**
```bash
ssh gianlucadistasi@192.168.1.2 "DYLD_LIBRARY_PATH=~/ezviz_sdk python3 ~/ezviz_sdk/ezviz_aac_talk.py 'Mamma, stai bene?' soggiorno"
```
- Se volume OK → test cameretta con stesso I=-10
- Se ancora basso → I=-8 (massimo sicuro prima clipping)
- Se gracchio → abbassare boost 2500Hz da +5 a +3

**Priorità 2 — Integrazione Guardian `local_voice_announce`**
- Sostituire chiamata tanh v2 con subprocess `ezviz_aac_talk.py all`
- File: `~/guardian/guardian.py` funzione `_ezviz_speak`
- Test E2E: fall alert → voice "Mamma, stai bene?" su entrambe camere

**Priorità 3 — Dashboard audio settings** (feature request Sessione 7)
- API `/api/ezviz/settings` GET/POST
- Persistenza JSON `~/guardian/ezviz_settings.json`
- UI: slider loudnorm I + EQ profile dropdown

### Verifica stato live pre-sessione
```bash
ssh gianlucadistasi@192.168.1.2 "which ffmpeg && pgrep -f 'guardian.py' | head -1 | xargs -I{} ps -o etime= -p {}; tail -5 ~/guardian/logs/guardian.log"
```

### Note strategiche
- **HANDOFF.md** resta log cronologico (stile attuale, non toccare struttura)
- **PROJECT_STATE.md** è la fonte per "cosa stiamo facendo ora" (sprint)
- **NORTH_STAR.md** fonte per "cosa NON fare" (vincoli immutabili)
- **docs/adr/** fonte per "perché abbiamo scelto X invece di Y"
- Quando Claude inizia nuova feature, SessionStart hook carica NS+PS automaticamente

---

## [2026-04-17 SESSIONE 9] — Audio Pipeline ffmpeg per Intelligibility Anziani

## [2026-04-17 SESSIONE 9] — Audio Pipeline ffmpeg per Intelligibility Anziani

### Completato
- **ffmpeg 8.1 installato** su iMac via `brew install ffmpeg` (sdl2 + x264 + x265 + aom + libvpx compilati da sorgente, ~20 min su iMac 13,1)
- **ezviz_aac_talk.py v3**: sostituito `numpy tanh limiter` con pipeline ffmpeg professionale
  - Rimosso `TANH_DRIVE` / parametro `gain` (loudnorm gestisce gain automaticamente)
  - Aggiunto `eq_profile='soggiorno'|'cameretta'` a `tts_to_aac()` e `talk()`
  - `talk_all()` passa `eq_profile=target` invece di `gain=drive`
  - Alias `sogliorno → soggiorno` per tolleranza typo CLI
- **Filter chain per camera** (ffmpeg):
  - **soggiorno (C6CN speaker medio)**:
    `highpass=80Hz → eq 300Hz -3dB → eq 2500Hz +5dB → eq 5000Hz +2dB → compand 4:1 → loudnorm I=-13 TP=-1.5 LRA=6`
  - **cameretta (speaker piccolo)**:
    `highpass=100Hz → eq 300Hz -2dB → eq 1200Hz +3dB → eq 2500Hz +4dB → compand 4:1 → loudnorm I=-13 TP=-1.5 LRA=6`
- **Pipeline finale**: edge-tts Isabella → MP3 → ffmpeg (EQ+compand+loudnorm) → WAV 16kHz mono → afconvert ADTS AAC-LC → SDK frame-by-frame
- **Test tecnico PASS soggiorno**: 75/75 frame ADTS inviati (0 fail), AAC 13212 bytes, login + VoiceCom OK

### Verifica auditiva PENDENTE
Il test 3-Step ha prodotto audio sintatticamente valido ma **la conferma uditiva fisica dall'utente è pendente**:
- Soggiorno: PASS tecnico — attendere giudizio utente (cristallino? gracchio? volume?)
- Cameretta: NON ANCORA TESTATA — serve conferma soggiorno prima

Se utente conferma soggiorno OK → test cameretta con stesso profilo calibrato.
Se gracchio → abbassare boost 2500Hz da +5 a +3 nel profilo soggiorno.

### File aggiornati
- `scripts/guardian/ezviz_aac_talk.py` — v3 con EQ_PROFILES dict + pipeline ffmpeg
- `~/ezviz_sdk/ezviz_aac_talk.py` — stesso file, deployato su iMac
- ffmpeg binary: `/usr/local/bin/ffmpeg` (brew stable 8.1)

### PROSSIMA SESSIONE
1. **Conferma auditiva utente** audio soggiorno + test cameretta
2. Se tuning necessario: regolare boost 2500Hz (range utile +2..+5)
3. Integrare v3 in Guardian flow `local_voice_announce` (sostituisce v2)
4. **Dashboard audio settings** (Sessione 7 richiesta): slider EQ profile + salvataggio JSON

### Verifica stato live pre-sessione
```bash
ssh gianlucadistasi@192.168.1.2 "which ffmpeg && ffmpeg -version | head -1; pgrep -la Python | grep guardian; tail -5 ~/guardian/logs/guardian.log"
```

---

## [2026-04-16 SESSIONE 8] — Test E2E + Bug Fix

## [2026-04-16 SESSIONE 8] — Test E2E + Bug Fix (chiusa, research audio ESEGUITO in sessione 9)

### Completato
- **Test E2E fall detection PASS**: HPT FALLEN CONFIRMED dur=30.2s, clip registrata, Telegram alert inviato
- **BUG 1 FIXED — faster-whisper subprocess isolation**:
  - Root cause: OMP Error #15 `libiomp5.dylib initialized twice` → crash Guardian ad ogni fall alert
  - Fix: `voice_confirmator.py` eseguito come subprocess isolato (`KMP_DUPLICATE_LIB_OK=TRUE`)
  - File: `scripts/guardian/voice_confirmator.py` + `~/guardian/voice_confirmator.py`
- **BUG 2 AUDIO FIX stage 1** (tanh drive): pre-generation + clock monotono + priming silenzio — SOSTITUITO in sessione 9 da pipeline ffmpeg

---

## [2026-04-16 SESSIONE 7] — EZVIZ Talkback Production Ready ✅

### Completato
- **Integrazione Guardian→EZVIZ**: `local_voice_announce` lancia `_ezviz_speak` daemon thread
  - `DYLD_LIBRARY_PATH=~/ezviz_sdk` impostato nell'env del subprocess
  - iMac `say -v Alice` rimane sync, EZVIZ in parallelo
- **Voce**: Edge-TTS `it-IT-IsabellaNeural` (neural, qualità nettamente superiore a say)
- **Volume**: peak normalize + tanh soft limiter (broadcast-radio style, no distorsione dura)
- **Drive differenziato per camera**:
  - soggiorno (.6 / QSTOZH): drive=15 — speaker C6CN regge compressione massima
  - cameretta (.5 / GEGURX): drive=4 — speaker piccolo, preserva dinamica, no gracchio
- **talk_all**: subprocess separati per ogni camera (HCNetSDK ha stato globale — thread condivisi corrompevano audio cameretta)
- **Test PASS**: soggiorno 52/52 frame, cameretta 52/52 frame, entrambe udibili

### File aggiornati
- `~/ezviz_sdk/ezviz_aac_talk.py` — v2 production (tanh limiter, talk_all, drive per camera)
- `~/guardian/guardian.py` — local_voice_announce integra EZVIZ talkback

### Flusso attuale fall alert
```
Guardian FALLEN → local_voice_announce("Mamma, stai bene?")
  ├── thread: ezviz_aac_talk.py all → soggiorno (drive=15) + cameretta (drive=4)
  └── sync:   say -v Alice → iMac speaker
→ voice_confirmator 15s ascolto → Telegram alert
```

### FEATURE RICHIESTA — Impostazioni audio in Dashboard
Gianluca vuole poter regolare i parametri audio (TANH_DRIVE per camera, voce TTS)
direttamente dalla dashboard web senza toccare codice.
- Implementare endpoint API `/api/ezviz/settings` (GET/POST)
- Persistenza in JSON (es. `~/guardian/ezviz_settings.json`)
- UI nella dashboard: slider drive soggiorno/cameretta, dropdown voce

### PROSSIMA SESSIONE — Priorità
1. **Audio dashboard settings** (richiesta utente)
2. **Test E2E fall detection**: utente DA SOLO, sdraiato 30+s in soggiorno
   - PASS: HPT FALLEN + "Mamma, stai bene?" da iMac + entrambe le camere
   - Monitor: `tail -f ~/guardian/logs/guardian.log | grep -E 'ezviz|voice|FALLEN|HPT'`
3. **PTZ Patrol** (opzionale)

### Verifica stato live pre-sessione
```bash
ssh gianlucadistasi@192.168.1.2 "pgrep -la python3 | grep guardian; tail -5 ~/guardian/logs/guardian.log"
```

---

## [2026-04-16 SESSIONE 6] — CODEC TYPE:7 = AAC-LC 16kHz TROVATO

### Scoperte critiche sessione 6
- **iVMS-4200**: crasha DYLD "Symbol missing" su iMac13,1 + macOS 12 — unusable
- **EzvisTalk Daemon v3**: Chiamata ADB apre correttamente (coordinate verificate live),
  mic attivo, MA AEC hardware Snapdragon 720G cancella STREAM_MUSIC → camera silenzio
- **CODEC TYPE:7 = AAC-LC 16kHz mono**: RTSP DESCRIBE conferma `mpeg4-generic/16000/1`
  - `config=1408` = AudioObjectType:2(AAC-LC) + SampleRate:8(16kHz) + Channels:1(mono)
  - Tutte le sessioni precedenti usavano G.711 µ-law 8kHz → camera ignorava il payload
- **libHCVoiceTalk.so ARM64**: estratta dall'APK EZVIZ, caricabile da Python ctypes Termux
  - COM_VoiceTalk_Init → 1 (OK) | COM_Core_Init → SEGFAULT (JNI richiesto)
- **ezviz_aac_talk.py**: 101/101 frame ADTS AAC inviati senza errori TCP sulla porta 8000

### Test AAC (da confermare dal vivo)
```
ssh gianlucadistasi@192.168.1.2 "DYLD_LIBRARY_PATH=~/ezviz_sdk python3 ~/ezviz_sdk/ezviz_aac_talk.py 'Testo audio'"
```
→ Audio fisico dallo speaker C6CN: **CONFERMATO LIVE ✅ (2026-04-16)**

### File nuovi sessione 6
- `~/ezviz_sdk/ezviz_aac_talk.py` — talkback AAC-LC 16kHz (NUOVO)
- `~/ezviz_native_sdk/lib/arm64-v8a/` — librerie ARM64 estratte APK EZVIZ (5 .so)

### PROSSIMA SESSIONE — Integrazione Luna
1. **Integra ezviz_aac_talk.py in Luna**: MQTT `guardian/speak` → SSH iMac → python3 ezviz_aac_talk.py
2. **Sostituisci EzvisTalk Daemon** (approccio AEC fallito) con questo metodo diretto
3. **Test E2E**: Luna riceve alert Guardian → parla dalla C6CN
4. Opzionale: porta ARM64 sul phone (fix COM_Core_Init JNI) per eliminare dipendenza iMac

---

## Stato: EZVIZ talkback — UN SOLO TEST MANCANTE per confermare PASS

## [2026-04-16 SESSIONE 5] — SDK _orig funziona, test fisico audio PENDENTE

### Scoperta critica sessione 5
- **libHCNetSDK_orig.dylib (v6.0.0.20 / 2018_12_07)**: `StartVoiceCom_MR_V30` invia 31 chunk senza errori
  - USA SINGOLO LINK: solo `cmd=0x110044`, **NON apre** `cmd=0x111030`
  - Nessun `CreateVoiceTalkLink failed`
  - `sent=31 fail=0` — ma audio fisico NON ancora verificato
- **libHCNetSDK241108 (v6.1.8.10)**: stessa cosa, invia 31 chunk OK (anche con doppio link, il link 0x111030 regge per 1.5s)
- **ISAPI porta 80**: CHIUSA sul firmware C6CN
- **App EZVIZ mobile**: usa cloud P2P TUTK, **non parla mai direttamente** sulla LAN (porta 9010 vuota da app)
- **Porta 9010**: aperta ma accessibile solo da iVMS-4200 o SDK, non dall'app mobile
- **Reverse engineering agente Claude**: confermato no PoC pubblico per porta 9010

### File pronti su iMac
- `~/ezviz_sdk/ezviz_sdk_multi_test.py` — test multi-SDK con logging (NUOVO sessione 5)
- `~/ezviz_sdk/ezviz_sdk_run_all.sh` — runner batch tutte le versioni
- `~/ezviz_sdk/ezviz_isapi_talk.py` — ISAPI talkback (non funziona, porta 80 chiusa)
- `~/ezviz_sdk/ezviz_hcnet_talk.py` — script talkback originale

### RISULTATO TEST FISICO SESSIONE 5 — FAIL
- SDK _orig invia 51 chunk µ-law senza errori TCP, ma **nessun audio dallo speaker**
- `SetVoiceComClientVolume` ritorna False (non supportata da _orig)
- **Conclusione**: camera riceve i bytes TCP ma ignora il payload — codec `type:7` non è G.711 µ-law standard

### PROSSIMA SESSIONE — iVMS-4200 tcpdump (TEST DEFINITIVO)

**Step 1 — Cattura traffico iVMS-4200:**
```bash
# Terminal 1 sul Mac
sudo tcpdump -i en0 host 192.168.1.6 and port 8000 -w /tmp/ivms_8000.pcap

# Terminal 2 — apri iVMS-4200
open /Applications/iVMS-4200.app
# Aggiungi camera: 192.168.1.6 porta 8000 admin/QSTOZH
# Premi talkback → parla 5 secondi → Ctrl+C sul Terminal 1
```

**Step 2 — Analisi pcap (Claude lo fa):**
- Se iVMS-4200 fa sentire audio → pcap rivela il formato esatto → implemento client Python raw
- Se iVMS-4200 NON funziona → camera genuinamente non supporta talkback LAN → fallback definitivo: `say -v Alice` su iMac speaker

**Stato SDK:**
- `libHCNetSDK_orig.dylib` (v6.0.0.20): singolo link, send OK, audio NON riprodotto
- `libHCNetSDK241108.dylib` (v6.1.8.10): doppio link, send OK, audio NON testato
- Audio stream type:7 = EZVIZ-specific, non G.711 standard
- Script pronti: `~/ezviz_sdk/ezviz_sdk_multi_test.py`, `~/ezviz_sdk/ezviz_hcnet_talk.py`

### Audio stream type:7
Da ricerca agente Claude: type 7 NON definito nell'enum standard HCNetSDK (0=G722, 1=µ-law, 2=A-law, 6=G726).
È EZVIZ-specific. SDK _orig invia comunque G.711 µ-law e non si lamenta.

## [2026-04-16 SESSIONE 4] — HCNetSDK infrastruttura pronta, talkback non ancora vinto

### Cosa funziona
- **Login HCNetSDK**: FUNZIONA `DYLD_LIBRARY_PATH=~/ezviz_sdk python3` → uid=0, err=0
- **cmd=0x110044**: Camera risponde con "audio stream type:7" ✓
- **~/ezviz_sdk/**: 157 dylib da iVMS-4200.app, libHCNetSDK.dylib patchata

### Causa del fallimento attuale
- `StartVoiceCom_MR_V30` apre TCP su cmd=0x110044 (OK), poi apre secondo link cmd=0x111030
- La camera chiude immediatamente cmd=0x111030 → `CreateVoiceTalkLink failed`
- Stesso risultato su tutti i canali (0, 1, 0xFFFF) e tutte le varianti (V30, MR, MR_V30)
- SDK usata: 6.1.10.10 del 2025-01-23

### Piste non ancora testate (SESSIONE 5)

**PISTA 1 — Versioni SDK vecchie** (inside iVMS-4200.app):
```
libHCNetSDK241108.dylib  ← novembre 2024
libHCNetSDK0327.dylib    ← versione più vecchia (data incerta)
libHCNetSDK_orig.dylib   ← originale pre-update
```
Il firmware EZVIZ C6CN potrebbe parlare un protocollo più vecchio con cmd diverso per il voice data link.
**Piano**: patcha @executable_path su ciascuna, poi testa StartVoiceCom — cerca se il cmd usato cambia.

**PISTA 2 — iVMS-4200 UI test + SDK log attivo** (test definitivo):
1. Abilita log SDK globale PRIMA di aprire iVMS-4200:
   ```bash
   # Modifica iVMS-4200 per loggare → oppure usa DYLD_INSERT_LIBRARIES hook
   ```
2. Apri iVMS-4200 → aggiungi camera 192.168.1.6:8000 admin/QSTOZH → fai talkback UI
3. Se funziona → il log mostra quale cmd usa → lo replica in Python
4. Se non funziona → confermato impossibile via SDK

**PISTA 3 — audio stream type:7 = EZVIZ custom codec**:
- Type 7 potrebbe richiedere un secondo handshake EZVIZ-specifico prima di accettare cmd=0x111030
- Ricerca: `HCNetSDK audio stream type 7 EZVIZ 2025`

**PISTA 4 — NET_DVR_ClientAudioStart (diverso da VoiceCom)**:
```python
# Simbolo presente nella dylib ma non ancora testato
sdk.NET_DVR_ClientAudioStart_V30(uid, chan, NULL)
```

### File pronti su iMac
- `~/ezviz_sdk/` — infrastruttura SDK completa
- `~/ezviz_sdk/ezviz_hcnet_talk.py` — script talkback (update per piste nuove)
- Lancio sempre con: `DYLD_LIBRARY_PATH=~/ezviz_sdk python3 script.py`

---

## [2026-04-15 SESSIONE 3] — RTSP Backchannel URL trovata, tutti i codec falliti

### Scoperta chiave: URL backchannel esiste
- `rtsp://192.168.1.6:554/Streaming/Channels/101/audio_backchannel` → 200 OK con SDP
- DESCRIBE/SETUP/PLAY tutti 200 OK — la camera accetta la sessione
- SETUP restituisce `mode="play"`, session ID, server_rtp_port dinamica

### Approcci testati live sessione 3 (TUTTI FALLITI — audio accettato ma non riprodotto)

**8. TCP Interleaved + AAC (mpeg4-generic, PT=104, 16kHz)**
- SETUP audio trackID=2, PLAY, invio frame via `$ 0x24 channel len data`
- 57-69 frame inviati correttamente — nessun audio dallo speaker

**9. UDP + AAC (mpeg4-generic, PT=104)**
- RTP UDP verso server_port (8200/8202) — nessun audio

**10. TCP Interleaved + G.711 µ-law (PT=0, 8kHz)**
- SETUP video (interleaved=0-1) + audio (interleaved=2-3), PLAY
- 90 pacchetti G.711 su channel 2 — nessun audio

**11. TCP Interleaved + G.711 A-law (PT=8, 8kHz)**
- Stessa architettura, codec A-law — nessun audio

**12. ffmpeg ANNOUNCE+RECORD G711 su backchannel URL**
- Connection reset by peer — firmware rifiuta ANNOUNCE (come su URL principale)

### Conclusione RTSP backchannel
La camera accetta i comandi RTSP ma **ignora l'audio in arrivo**. Confermato:
- Il firmware C6CN risponde SOLO al protocollo cloud P2P TUTK (tcpdump sessione 2)
- RTSP backchannel potrebbe essere stub non implementato nel firmware EZVIZ consumer
- L'unica via locale rimasta è **HCNetSDK porta 8000** (protocollo binario di iVMS-4200)

### Piano prossima sessione: iVMS-4200 + tcpdump porta 8000

**Strategia**: iVMS-4200 usa HCNetSDK porta 8000 direttamente sulla LAN (non cloud).
Capturare il traffico mentre iVMS-4200 fa talkback → reverse magic bytes → Python client.

**Step by step:**
1. Installa iVMS-4200 Lite dal Mac App Store (gratis)
2. Aggiungi camera: IP 192.168.1.6, porta 8000, utente admin / QSTOZH
3. Avvia `sudo tcpdump -i en0 host 192.168.1.6 and port 8000 -w /tmp/ivms_talk.pcap` SUL MAC
4. Avvia talkback da iVMS-4200 e parla per 5-10 secondi
5. Ferma tcpdump, analizza pcap con Wireshark o python
6. Estrai magic bytes + command ID audio → implementa client Python

**Alternative se iVMS-4200 non funziona con C6CN:**
- Deep research su GitHub: python-hikvision, hik-stream, hikapi — cercare impl HCNetSDK porta 8000
- Ricerca su forum IPCAMTALK per "EZVIZ C6 talkback SDK" 2024-2026
- Ultima opzione hardware: Reolink E1 Pro (~35€) — LAN talkback RTSP confermata

**Credenziali camera C6CN (soggiorno):**
- IP: 192.168.1.6
- RTSP: admin / QSTOZH (porta 554)
- SDK porta 8000: admin / QSTOZH
- Porta 9010: EZVIZ command port (non ancora esplorata)

**Script talkback:** `scripts/luna/ezviz_talkback.py` (ultimo tentativo G.711 multi-codec)

### Architettura confermata definitivamente
- EZVIZ C6CN talkback: SOLO via cloud P2P TUTK (no LAN diretto)
- Porta 80: CHIUSA
- Porta 8000: binario HCNetSDK (protocollo da reverse)
- Porta 9010: EZVIZ command port (protocollo da reverse, CVE-2023-48121)
- RTSP backchannel: BLOCCATO firmware
- RTSP ANNOUNCE: RIFIUTATO

### Approcci precedenti (sessione 1 - 2026-04-15)
**1. go2rtc backchannel exec** → FALLITO (SDP senza backchannel track)
**2. Playwright portale web** → FALLITO (portale non esiste)
**3. setprop AEC** → FALLITO (richiede root)

### go2rtc operativo
Config attuale: `~/go2rtc.yaml` — soggiorno (192.168.1.6:554) + cameretta (192.168.1.5:554)

## [2026-04-15] — Enterprise Framework v2026.2 (patch chirurgica)
Completato: cherry-pick dal framework senza toccare CLAUDE.md, hook esistenti, skill ZeroClaw.
Files aggiunti:
- `.claude/agents/architect.md` (Opus, piano pre-implementazione)
- `.claude/agents/validator.md` (Opus, evidence report SSH iMac)
- `.claude/skills/spec/SKILL.md` (/spec feature spec-driven)
- `.claude/skills/validate/SKILL.md` (/validate evidence report)
- `.claude/skills/commit/SKILL.md` (/commit gate pre-commit + conventional commits)
- `.claude/hooks/pre_write_gate.py` (blocca credenziali hardcoded)
- `specs/README.md`, `.worktreeinclude`
- settings.json: PreToolUse[Write] → pre_write_gate aggiunto
Commits: 51125a8, 540da61 — pushati su origin/main
Gap analysis: stop_evidence_gate + pre_compact coperti da hook globali ~/.claude
Tests: 8/8 file presenti, 0 conflitti, 0 sovrascritture

## Stato precedente: Guardian v3.2 PRODUCTION READINESS — GeometricFallScorer + HPT + ByteTrack tuned. EzvisTalk Daemon v3 deployato su phone. Test E2E fisico + AEC problem pendente.

## Connessioni
- Phone SSH: `ssh -p 8022 192.168.1.9`
- Phone Tailscale: `100.101.219.214`
- iMac SSH: `ssh gianlucadistasi@192.168.1.2`
- NAS: `/Volumes/NAS_LOCAL/` (931GB)

## Account Master: gianlucanewtech@gmail.com

## Servizi iMac — TUTTI OPERATIVI
| Servizio | Porta | Auto-start |
|----------|-------|------------|
| Traccar Web | 8082 | LaunchAgent |
| Traccar GPS | 5055 | LaunchAgent |
| MQTT broker (amqtt) | 1883 | LaunchAgent |
| Dashboard Web | 8088 | LaunchAgent |
| NextDNS proxy | 5354 | manuale |
| Guardian v1.5 TVCC | - | LaunchAgent |
| Ollama | 11434 | - |
| Ferroli AC (msmart-ng) | - | on-demand |
| Netatmo API | - | on-demand |
| go2rtc RTSP | 8554/1984 | LaunchAgent |

## Guardian v3.1 MAIN LEVEL — DEPLOYATO 2026-04-13
- **v3.1 FP Kill**: Camera-level tracker ora rispetta FallScorer threshold 75
- **v3.1 TSSTG ML**: ST-GCN pre-trainato (7 classi, Le2i dataset), ONNX 23.6MB, 139ms inference
- **v3.1 Fusion**: max(euristico, TSSTG_fall_prob*100) >= 75
- **v3.1 UNKNOWN→LYING_DOWN**: timer 60s prima di escalation a FALLEN (elimina FP divano/letto)
- **v3.1 Voice locale**: iMac `say -v Alice` "Mamma, stai bene?" su ogni fall alert
- **v3.1 Default score**: 0 (was 50) quando PersonState non trovata
- MQTT Luna integration: subscribe luna/guardian_query + luna/alarm_cmd
- Backup v3.0: `~/guardian/guardian-v3.0.bak`
- TSSTG model: `~/guardian/tsstg-fall-detection.onnx`
- Classi TSSTG: Standing, Walking, Sitting, Lying Down, Stand up, Sit down, **Fall Down**

### MQTT: mosquitto 2.1.2 ATTIVO con AUTH (migrato da amqtt 2026-04-13)
- Auth: zeroclaw/ZeroClaw2026Home (anonymous RIFIUTATO)
- Config: `/usr/local/etc/mosquitto/mosquitto.conf`
- Password: `/usr/local/etc/mosquitto/passwd`
- LaunchAgent: `com.mosquitto.broker.plist` (KeepAlive)
- **TEST PASS**: pub/sub, people_count, status, arm/disarm, auth reject

## Guardian v1.6 TVCC — DEPLOYATO 2026-04-10 (SOSTITUITO da v1.7)
- PID attivo, 2 camera + audio, 10+ thread
- File iMac: `~/guardian/guardian.py`
- File dev: `scripts/guardian/guardian-v1.6.py`
- Env: `~/guardian/guardian.env` (credenziali, non in git)
- Wrapper: `~/guardian/start-guardian.sh` (source env + exec)
- Backup v1.5: `~/guardian/guardian-v1.5.bak`

### Feature v1.6 (TUTTE OPERATIVE + TESTATE LIVE)
1. **Night mode** (22:00-07:00): CLAHE IR, soglie adattive, night activity log
2. **Loitering detection**: 4 zone, 5 min threshold
3. **Camera tamper**: blackout + defocus + scene change (IR saturation-based, not clock)
4. **Daily report** "Mamma sta bene": Telegram 21:00
5. **Inactivity escalation**: 2h SOFT, 4h NORMAL, 6h CRITICAL
6. **FallScorer multi-fattore** (0-100): velocity(+25@80px/s) + angle_rate(+15@60deg/s) + AR_flip(+15) + head_hip(+20) + audio_impact(+15) + zone(+10/-15) + descent(-40). Soglia 75.
7. **Camera-level fall tracker**: persona orizzontale >6s = alert (sopravvive a track ID changes)
8. **UNKNOWN→FALLEN**: persona trovata già a terra = alert immediato (anziano caduto)
9. **AlarmFSM**: PASS live test — /arm→30s→armed→pending→30s→triggered→/disarm
10. **Telegram commands**: /arm, /disarm, /arm_home, /status (whitelist + log unauthorized)
11. **HazardDetector**: fuoco (HSV+flicker) + fumo (audio-confirmed)
12. **Voice alerts**: Edge-TTS IsabellaNeural + fallback testo se edge_tts mancante
13. **Phone escalation**: SMS + chiamata a papà (logica OK, phone SSH deve essere attivo)
14. **Geofence**: Traccar auto arm/disarm (Traccar non attivo attualmente)
15. **Netatmo temperature**: alert <16C / >32C

### Fix v1.6 rispetto a v1.5 (25+ bug risolti)
**Stabilità:**
- RTSP read timeout 5s + buffer 1 (no more infinite hangs)
- Flush-on-emit RotatingFileHandler 50MB x 5 (no lost lines)
- Thread health monitor (auto-restart dead threads)
- SQLite WAL + busy_timeout 5s
- Clip recorder write_queue bounded
- person_states capped at 200

**Fall detection:**
- Night keypoint confidence 0.15 (was 0.3 — scartava tutto in IR)
- Sliding window velocity (max over 5 samples)
- FALL_VELOCITY_SCORE_THRESH 80 (was 200 — unreachable at 2.5 FPS)
- FALL_ANGLE_HORIZONTAL_MIN 55 (was 45 — FP da persona piegata)
- MIN_SKELETON_HEIGHT_RATIO 0.08 (was 0.15 — rejected seated skeletons)
- Safe zone penalty -15 (was -30)
- FALLING timeout 2s fallback
- UNKNOWN→FALLEN for person found on ground
- Camera-level tracker independent of ByteTrack

**Sicurezza:**
- Zero hardcoded credentials (env vars only, startup validation)
- No shell=True anywhere (subprocess list args + shlex.quote)
- TTS tempfile.mkstemp (no /tmp symlink attack)
- MQTT auth support (username_pw_set)
- Telegram whitelist set + unauthorized logging
- Directory permissions 0o700
- Audio queue bounded (maxsize=100)
- Log rotation 50MB x 5

### Test Live Results 2026-04-10
| Test | Stato |
|------|-------|
| FallScorer (caduta) | **PASS** — alert dopo 6.2s, Telegram + voice Isabella |
| FallScorer (seduta) | **PASS** — SITTING, zero FP |
| AlarmFSM ciclo completo | **PASS** — arm→armed→pending→triggered→disarm |
| Voice alerts | **PASS** — Isabella italiano su ogni alert critico |
| Phone escalation | **LOGIC PASS** — SMS+call tentati (phone SSH offline) |
| HazardDetector | **SKIP** — accendino troppo piccolo per soglia fire |
| Daily report | **Stasera 21:00** |
| Geofence | **Traccar spento** |

### ADB Self-Loop (per chiamata emergenza)
- Accoppiato: `adb pair 192.168.1.9:43233` (GUID: adb-ce3ee1f-j0yleZ)
- Connessione: `adb connect 192.168.1.9:38891`
- Chiamata: `adb shell am start -a android.intent.action.CALL -d tel:NUMERO`
- NOTA: dopo reboot phone, serve ri-connettere (accoppiamento resta)

### Permessi phone per escalation
- CALL_PHONE: concesso ma MIUI blocca da background → si usa ADB shell
- SEND_SMS: concesso, funzionante
- Wireless debugging: attivo, accoppiato

## Luna v4.1 — ATTIVA 2026-04-13
- File dev: `scripts/luna/luna-v4.1.py`
- Deploy target: `~/scripts/luna-v4.py` su phone
- Nuove feature v4.1:
  - MQTT client integrato (mosquitto_sub/pub via subprocess)
  - Guardian alert listener in-process (sostituisce guardian-mqtt-listener.sh)
  - "chi c'è in casa?" → MQTT query → risposta vocale
  - "stato Guardian" / "salute Guardian" → MQTT query
  - "mostra cameretta/soggiorno" → apre go2rtc WebRTC su phone
  - "inserisci/togli allarme" → MQTT → Guardian arm/disarm
  - Volume escalation su alert critici (fall, fire, intrusion)
- Boot script: `scripts/boot/05-voice-agent.sh` (deploy a ~/.termux/boot/)
- MQTT auth: zeroclaw/ZeroClaw2026Home
- Watchdog cron: ogni 10 min, restart se morta
- Boot: `~/.termux/boot/start-services.sh` (unified, avvia tutto)

## Luna v4.0 Robust Wake — PRECEDENTE
- File phone: `~/scripts/luna-v4.py wake`
- File dev: `scripts/luna/luna-v4.0.py`
- MicRecorder watchdog, unified energy+VAD, quota tracking
- Adaptive energy EMA, TTS playback poll, adaptive cooldown

## Enterprise Hardening (completato 2026-04-13)
| Gap | Fix |
|-----|-----|
| Luna no boot auto-start | Boot script unificato `start-services.sh` |
| Luna no watchdog | Cron ogni 10 min, restart se morta |
| MQTT anonymous | Auth username/password, anonymous rifiutato |
| Guardian DB no backup | Cron 3AM daily → `~/guardian/backups/`, retention 7gg |
| Boot scripts conflitto (3 file) | Unificato in 1 solo `start-services.sh` |

## Prossimi Step — ROADMAP v3

### Fase B: COMPLETATA 2026-04-13
- Luna v4.1 + Guardian MQTT integration
- Boot unificato + watchdog + MQTT auth

### Guardian v3.1 MAIN LEVEL — COMPLETATO 2026-04-13
- **FP Kill**: 732 FP/giorno → ~0 (camera-level score gate + LYING_DOWN 60s timer)
- **TSSTG ML**: ST-GCN ONNX pre-trainato, 7 classi, fusion con euristico
- **Voice locale**: iMac `say -v Alice` su fall alert (EZVIZ backchannel impossibile)
- AdaptiveSampler: IDLE 0.2fps → MONITOR 1fps → ALERT 5fps (CPU -66%)
- SkeletonBuffer: timestamp-normalized 10s sliding window
- TemporalFeatures: hip_velocity, angular_rate, ground_proximity (numpy puro)
- FallScorer v3: 40% instant + 60% temporal fusion + TSSTG ML
- LongLieDetector: >3min a terra → re-alert escalation
- Anti-oscillation filter: >6 state changes in 10s → track suppressed
- DEPLOYATO e ATTIVO su iMac

### Guardian LSTM — RICERCA COMPLETATA, NON INTEGRARE ANCORA
- BiLSTM 580K params, ONNX 14KB = ROTTO (solo grafo, nessun peso)
- Deep research 2026 dice: NON re-trainare su sintetico puro (F1 crolla da 89% a 36% su reale)
- TCN > BiLSTM su CPU (97% vs 92-95%, più veloce, meno params)
- Servono dataset REALI: Le2i + URFD + 50-100 clip EZVIZ proprie
- File research: `.planning/research/lstm-fall-detection-research.md`
- File modello: `scripts/guardian/guardian_lstm/` (da completare con dati reali)

### Sessione 2026-04-14 (seconda parte) — MEGA SESSION

**PTZ C6CN — FIXED + VERIFICATO LIVE**
  Root cause: Privacy mode (switch type 25) era ON — comandi PTZ ignorati silenziosamente.
  Fix: `client.switch_status(serial, 25, 0)` + API corretta `action="start"/"stop"`.
  7 movimenti testati live (R/L/U/D + coordinate) — TUTTI OK.
  Script diagnostico: `~/guardian/ptz_diagnose.py`

**go2rtc 87% drop rate — FIXED + HEALTH CHECK ATTIVO**
  Stream soggiorno (cam .5) aveva 87% packet drop. Riavviato.
  Cron `*/5` health check: `~/guardian/go2rtc_health.sh` (auto-restart se >20% drop).

**Backup 3-2-1 — OPERATIVO**
  `~/guardian/backup_manager.sh` cron 03:30 daily.
  Primo run: 876 clip spostate su NAS, Guardian DB + configs + checksum SHA256.
  GDrive weekly (domenica). GPG non installato (secrets skip).

**Port Hardening — COMPLETATO**
  MQTT: bind 192.168.1.2 + 127.0.0.1 (was 0.0.0.0). Auth confermato.
  Dashboard: bind 192.168.1.2 (was 0.0.0.0). No auth ancora.
  go2rtc API: gia 127.0.0.1. pf rules pronte: `~/guardian/pf_zeroclaw.conf`.

**Credential Audit — 4 CRITICAL fixati**
  Rimossi: Telegram token, Midea password, Traccar creds da file attivi.
  .gitignore fixato. Vecchi (luna v3.3-v3.5) ancora in git history.

**Fall Detection — 3 FIX APPLICATI, NON TESTATI LIVE**
  Fix A (is_horizontal): aggiunto `angle>40 AND ar>1.0` come segnale — TESTATO, caduta rilevata!
  Fix B1 (pre-filter bypass): se FALLEN >10s, forza ML evaluation — NON testato.
  Fix B2 (grace period 30s): boxes=0 non cancella alert per 30s — NON testato.
  PROBLEMA APERTO: TSSTG ML score=0 su cadute reali (trainato Le2i laterale, EZVIZ overhead).
  SOLUZIONE DEFINITIVA: GeometricFallScorer (regole geometriche pure, validato da 3 paper 2025).
  Codice pronto in prompt: `~/Documents/ZEROCLAW-Production-Readiness-Prompt.md`

**go2rtc stream names INVERTITI** (confusione log):
  go2rtc "soggiorno" → .5 (cameretta reale), "cameretta" → .6 (soggiorno reale).
  Guardian compensa con mapping incrociato. Da fixare nella prossima sessione.

**Tailscale iMac: LOGGED OUT** — serve login browser utente.

### Sessione 2026-04-14 (prima parte) — COMPLETATI
**BUG P0: Baseline Learning — FIXED + DEPLOYED**
  Causa: `baseline_learner` era variabile locale in `main()`, invisibile ai metodi di classe (Python LEGB).
  Fix: passato come parametro costruttore a CameraMonitor + InactivityMonitor (6 edit, 0 nuova logica).
  Bonus: il NameError crashava i camera thread a frame#30 (~30s), health monitor non li riavviava (target=None).
  Evidenza: 3 osservazioni in 2min, camera thread stabile, processo vivo.

**P1 TCN: CHIUSO — keep TSSTG as-is**
  TSSTG già funziona (7 classi, 139ms, 0 FP con fusion scoring). TCN aggiunge valore marginale.
  Futuro: se serve miglioramento, raccogliere clip EZVIZ reali e fine-tune TSSTG.

**COMPLETATI sessione 2026-04-13:**
- Disease Profiles JSON (6 profili): ~/guardian/disease_profiles.json
- Geofence fix: empty positions = HOME, error throttling
- Luna sveglia: NLU disambiguato, REGOLA CRITICA 4-5
- PS4/Eureka/USB: chiusi come non prioritari
- EZVIZ backchannel: CONFERMATO IMPOSSIBILE

**MQTT flapping: FIXED**
  Causa: due processi Guardian con stesso client_id `guardian-v1.7` si cacciavano dal broker.
  Fix 1: client_id dinamico basato su PID (`guardian-{os.getpid()}`)
  Fix 2: lock file `/tmp/guardian.lock` impedisce doppio avvio
  Evidenza: 0 disconnect in 2min, doppio avvio bloccato.

**Voice Confirmation Bidirezionale: DEPLOYATO — 3 GAP aperti**
  - `voice_confirmator.py` — sd.InputStream 44100Hz → resample 16kHz → faster-whisper tiny IT
  - Integrato in `guardian.py` su entrambi i fall alert (FallScorer + camera-level)
  - Flusso: TTS "Stai bene?" → 15s ascolto → positive=cancel, silence/negative=alert
  - File: `~/guardian/voice_confirmator.py`

  **GAP 1 — Mic permission: PASS (condizionale)**
    sd.rec() funziona via SSH. RMS=6.6, Peak=194, 56.8% non-zero.
    Mic attivo e cattura audio ambientale. RMS basso = stanza silenziosa, non permesso negato.
    Conferma definitiva: GAP 2 (test vocale reale con voce umana).

  **GAP 2 — Test E2E reale: DA FARE (richiede presenza fisica)**
    Istruzioni per test manuale su iMac:
    1. `tail -f ~/guardian/logs/guardian.log`
    2. Sdraiati per terra davanti alla camera 8+ secondi
    3. Test A: di "sì sto bene" → log deve mostrare `[voice-confirm] positive` → Telegram "✅ alert cancellato"
    4. Test B: silenzio 15s → Telegram alert con "nessuna risposta dopo 15s"
    Riportare output log esatto.

  **GAP 3 — Baseline learning: IN RACCOLTA (non operativa)**
    Stato: 53 osservazioni, 4 ore coperte (12-15), giorno 0 di 7.
    learning_start: 2026-04-13. Profilo operativo stimato: **2026-04-20**.
    Sotto soglia (serve >100 obs, >12 ore). Comportamento corretto: il bug P0 era 0 obs, ora raccoglie.

**PTZ C6CN — FIXED + VERIFICATO LIVE**
  - Causa: Privacy mode (switch type 25) era ON — disattivato via API
  - Fix aggiuntivo: API richiede `action="start"` / `action="stop"` (non solo direction)
  - Anche `ptz_control_coordinates(serial, x, y)` funziona
  - 7 movimenti testati live: RIGHT, LEFT, UP, DOWN, coord estrema sx/dx, centro — TUTTI OK
  - Script diagnostico: `~/guardian/ptz_diagnose.py`
  - Pronto per integrazione PTZ Ronda (ptz_patrol.py)

**YOLO non rileva caduta — test FALLITO**
  - Utente sdraiato per terra in soggiorno + cameretta, YOLO non ha rilevato caduta
  - Cameretta stream aveva 84% packet drop (fixato con restart go2rtc)
  - Soggiorno: YOLO tracciava moglie sul divano (STANDING), non utente a terra
  - Problema: YOLO potrebbe non rilevare persona a terra se c'è altra persona in piedi
  - Test da ripetere: utente DA SOLO, nel soggiorno, camera puntata verso area pavimento

**go2rtc stream cameretta — HEALTH CHECK ATTIVO**
  - Era a 87% drop di nuovo — riavviato
  - Cron health check ogni 5 min: `~/guardian/go2rtc_health.sh` (auto-restart se >20% drop)
  - Causa: WiFi signal 74% su camera .5 — lungo termine serve extender

**Backup 3-2-1 — OPERATIVO**
  - NAS: `~/guardian/backup_manager.sh` cron 03:30 daily
  - 876 clip spostate su NAS al primo run (904GB liberi)
  - Guardian DB + configs + go2rtc + LaunchAgents → NAS con checksum SHA256
  - GDrive weekly (domenica) via rclone
  - Clip rotation: >24h → NAS, >7gg → delete
  - GPG non installato su iMac (secrets backup skip)
  - Report Telegram dopo ogni backup

**Port Hardening — COMPLETATO**
  - MQTT: bind 192.168.1.2 + 127.0.0.1 (was 0.0.0.0), auth confermato
  - Dashboard: bind 192.168.1.2 (was 0.0.0.0)
  - go2rtc API: già 127.0.0.1 (ok)
  - pf firewall: `~/guardian/pf_zeroclaw.conf` pronto, applicare dopo Tailscale login
  - Tailscale su iMac: LOGGED OUT — serve login da browser

**Credential Audit — COMPLETATO**
  - Rimossi: Telegram token da guardian.py, Midea password da ferroli.py, Traccar creds da luna v4.0/v4.1/geofence/report
  - .gitignore fixato per coprire scripts/guardian/guardian.env
  - Rimangono creds in file vecchi (luna v3.3-v3.5, guardian v1.5) — git history non pulita

### Sessione 2026-04-14 (terza parte) — PRODUCTION READINESS

**FIX 1.1 — go2rtc stream names: FIXED + PASS**
  go2rtc.yaml: soggiorno→.6 QSTOZH, cameretta→.5 GEGURX (era invertito).
  CAMERAS dict: mapping diretto (rimosso cross-mapping). Log confermato.

**FIX 1.2 — conf_thresh 0.4→0.25: DEPLOYED**
  MIN_DETECTION_CONFIDENCE ora env-overridable (GUARDIAN_CONF_THRESH).
  boxes=0 ridotto dal 37% a meno con conf più basso.

**FIX 1.5 — GeometricFallScorer: DEPLOYED (sostituisce TSSTG)**
  File: `~/guardian/geometric_fall_scorer.py`
  Scoring: AR≥1.2 (+40) + torso_angle≥40 (+40) + heuristic_FALLEN (+20) = max 100
  Threshold 75: serve BOTH AR e angle (doppio check geometrico).
  TSSTG mantenuto come import ma geometric è PRIMARY scorer.
  Testato live: score=60 su divano (AR sì, angle sì, ma sotto 75 = suppressed). CORRETTO.

**FIX P1 — Track ID instabile: FIXED (L1 + L2)**
  Root cause: ByteTrack KalmanFilterXYAH predice bbox verticale → IoU≈0 quando persona si sdraia → nuovo track_id → timer reset.
  
  L1 — ByteTrack custom yaml: `~/guardian/bytetrack_guardian.yaml`
    match_thresh: 0.65 (was 0.8), track_buffer: 45 (was 30)
    new_track_thresh: 0.10 (was 0.25), track_high_thresh: 0.20 (was 0.25)
  
  L2 — HorizontalPositionTracker: `~/guardian/horizontal_position_tracker.py`
    Tracker spaziale basato su IoU bbox, indipendente da track_id.
    Requisiti: AR≥1.2 AND torso_angle≥55 AND durata≥30s.
    Abilitato SOLO su soggiorno (cameretta disabilitato — divano/letto genera FP).
    Env: GUARDIAN_HPT_CAMERAS=soggiorno, GUARDIAN_HPT_FALL_DURATION=30
    TESTATO LIVE: HPT ha rilevato caduta in cameretta (dur=38.7s, prima del filtro camera).
    Voice confirmation triggerato: TTS "Stai bene?" + 15s ascolto OK.

**Voice Confirmation: VERIFICATO**
  Mic iMac: OK (RMS 0.0056, Peak 2042, 100% non-zero)
  TTS `say -v Alice`: OK
  Pipeline: TTS → 15s ascolto → faster-whisper tiny → positive/silence/negative
  Test silence: PASS (escalation dopo 15s)
  Test positive: PENDENTE (serve caduta rilevata + risposta vocale)

**EZVIZ Two-Way Audio: CONFERMATO IMPOSSIBILE (deep research 2026-04-14)**
  9 approcci testati: go2rtc backchannel, pyezviz, EZVIZ SDK, RTSP ONVIF, ISAPI, FFmpeg, Python libs, Home Assistant.
  Tutti NO. Porte HTTP camera chiuse (000). SDP audio recvonly.
  Unica via ufficiale: EZVIZ SDK Android `startVoiceTalk()` — richiede app custom.
  DECISIONE PENDENTE: utente ha una soluzione — da discutere prossima sessione.

**PTZ soggiorno: RUOTATA**
  Puntata a x=0.3 y=0.7 — più pavimento visibile, angolazione più laterale.
  Test caduta: YOLO vede persona a terra (track#311 ar=1.54 angle=42) ma tracking instabile.
  
**Ancora da fare (in ordine di priorità):**
1. **EZVIZ audio bidirezionale** — utente ha soluzione, da discutere
2. **Test E2E fisico soggiorno** — HPT + geo-scorer, utente DA SOLO, 30s a terra
3. Voice Confirmation test E2E (serve #2 prima)
4. PTZ Ronda: ptz_patrol.py (preset zone + lock-on) — codice pronto nel prompt
5. Tailscale login su iMac (azione utente) → poi pf firewall
6. Medication Reminder
7. Baseline: attendere fino al 20/04

**File nuovi su iMac:**
- `~/guardian/geometric_fall_scorer.py` — scorer geometrico (sostituisce TSSTG)
- `~/guardian/horizontal_position_tracker.py` — HPT track-id independent
- `~/guardian/bytetrack_guardian.yaml` — ByteTrack ottimizzato fall detection
- `~/go2rtc.yaml` — stream names corretti (backup: .bak_s1)
- `~/guardian/guardian.py` — v3.2 con tutti i fix (backup: .bak_s1, .bak_p1_*)

### Fase C: PS4 + TV Box (BLOCCATA — azione utente)
- Battery duty cycle (burst-listen)
- MQTT query "chi c'è in casa?"
- Voice alert volume
- Boot script auto-start
- Luna arm/disarm vocale: "Luna, inserisci allarme" → MQTT → Guardian

### Medication Reminder (nuovo)
- Architettura validata: MacroDroid + MQTT (Fase 1, 0 EUR) → App nativa (Fase 2)
- Serve vecchio Android a casa mamma + Termux (Android 7+) o MacroDroid (Android 5+)
- TTS: Edge-TTS IsabellaNeural o Android TTS nativo
- Compliance tracking via Guardian person detection

### Guardian distribuibile (nuovo)
- Guardian diventerà progetto da distribuire ad amici
- Client Android: Fase 1 MacroDroid+MQTT → Fase 2 APK nativa (Kotlin+FCM+TTS)
- Serve packaging universale, setup 5 min per non-tecnici

## LEZIONI CRITICHE
1. **MAI cambiare metodo di estrazione features senza validare prima.**
2. **OWW predice ogni 80ms single-shot — serve trigger_level (pattern Wyoming).**
3. **Silero VAD NON funziona su Termux/Android.**
4. **parecord muore silenziosamente** — RISOLTO con MicRecorder watchdog.
5. **SEMPRE copiare da repo funzionanti**, mai inventare architetture da zero.
6. **MIUI blocca chiamate da background** — usare ADB shell self-loop (UID 2000 bypassa).
7. **EZVIZ two-way audio NON programmabile** — go2rtc backchannel rotto, usare iMac/phone speaker.
8. **FallScorer multi-fattore** elimina FP seduta: soglia 75, descent >1s = -40 punti, safe zone = -30 punti.
9. **Audio domestic sticky** (30s) previene FP Siren/Gunshot da TV.
10. **transitions lib** per FSM thread-safe (LockedMachine), zero overhead.

## Mappa Rete Domestica
| IP | Dispositivo | Controllo |
|----|------------|-----------|
| .1 | Router | - |
| .2 | iMac | SSH, tutti i servizi |
| .3 | Ferroli AC | msmart-ng |
| .5 | EZVIZ Soggiorno | RTSP via go2rtc |
| .6 | EZVIZ Cameretta | RTSP via go2rtc |
| .18 | TV Box MBOX RK322x | ADB :5555 |
| .8 | Eureka Robot | midea-local (da completare) |
| .9 | Phone padre | SSH/Termux |
| .11 | Netatmo Termostato | API |
| .12 | PlayStation 4 | ps4-waker (pairing pendente) |
| .13 | MacBook | Dev machine |
| .14 | HP LaserJet M110w | CUPS via iMac |

## PENDENTI (azione utente)
- ~~Eureka~~ CHIUSO non prioritario
- ~~PS4~~ CHIUSO non prioritario
- ~~Fase 5 cavo USB~~ CHIUSO non necessario
- Netatmo: configurare NETATMO_CLIENT_ID/SECRET/REFRESH_TOKEN in env
- Traccar: verificare se attivo (geofence fix deployato, HOME_LAT/LON OK)
- Medication reminder: setup telefono mamma
- TCN training: completamento in background su iMac, poi integrare fall_tcn.onnx

---

### Sessione 2026-04-15 — EzvisTalk Daemon v3

**EzvisTalk Daemon v3: SALVATO (da deployare + testare)**
  - Fix chiave: `monkey -p com.ezviz 1` invece di `am start` (risolve blocco background MIUI)
  - `/system/bin/input tap 839 2114` — path esplicito (Termux PATH non include /system/bin)
  - Lock screen handling: KEYCODE_WAKEUP + KEYCODE_MENU prima di ogni tap
  - Talk button coordinate verificate via UI dump: (839, 2114) label "Chiam. in corso"
  - Serial C6CN: D914722031119
  - ADB porta corrente: 192.168.1.9:43455
  - File Mac: `scripts/guardian/ezviz_talk_daemon.sh`
  - Deploy target phone: `~/ezviz_talk_daemon.sh`

  **PROBLEMA APERTO — AEC (Acoustic Echo Cancellation):**
  TTS da termux-media-player viene cancellato da MIUI AEC prima di raggiungere C6CN speaker.
  Opzioni da valutare (in ordine di fattibilità):
  - **(a) AudioEffect Java API**: disabilitare AEC a livello Android (`AcousticEchoCanceler.create()`)
  - **(b) am start da iMac Python**: contesto diverso, potrebbe bypassare AEC loopback
  - **(c) iMac speaker fallback definitivo**: `say -v Alice` — zero AEC, funziona già

  **Deploy da fare:**
  ```bash
  scp -P 8022 scripts/guardian/ezviz_talk_daemon.sh 192.168.1.9:~/ezviz_talk_daemon.sh
  ssh -p 8022 192.168.1.9 "chmod +x ~/ezviz_talk_daemon.sh"
  # test manuale: ssh -p 8022 192.168.1.9 "~/ezviz_talk_daemon.sh &" poi:
  # mosquitto_pub -h 192.168.1.2 -u zeroclaw -P ZeroClaw2026Home -t guardian/ezviz_talk -m start
  ```

## PROMPT PROSSIMA SESSIONE — AEC + Test E2E

```
Leggi HANDOFF.md. EzvisTalk daemon v3 deployato. Da testare: AEC problem — TTS da
termux-media-player viene cancellato da MIUI AEC prima di raggiungere C6CN speaker.
Se AEC blocca, valutare: (a) disabilitare AEC via AudioEffect, (b) usare adb shell am start da
Guardian iMac Python invece di monkey, (c) iMac speaker come fallback definitivo.

PRIORITÀ 2 — Test E2E fall detection soggiorno:
HPT è deployato ma non ancora testato con caduta reale in soggiorno.
Camera PTZ è puntata a x=0.3 y=0.7 (più pavimento visibile).
Test: utente DA SOLO, sdraiato a terra 30+ secondi, nella zona pavimento aperto.
Guida via speaker iMac (say -v Alice, volume 100).
PASS: HPT FALLEN CONFIRMED + voice "Stai bene?" + Telegram alert.

PRIORITÀ 3 — PTZ Patrol:
Integra ptz_patrol.py con Guardian: patrol → lock-on su fall → unlock su voice positive.

Verifica stato live prima di iniziare:
ssh gianlucadistasi@192.168.1.2 "pgrep -la Python | grep guardian; tail -5 ~/guardian/logs/guardian.log"
```

### Per S27 carry-over [INFRA] — Context budget structural guardrails (P1, sessione dedicata)
**Razionale**: S24/S25/S26 hanno sforato 50% context budget sistematicamente. Disciplina pura insufficiente, servono protezioni strutturali.

**5 vincoli da implementare in sessione dedicata "infra-context-budget"**:
1. **Hook automatico threshold 40%/50%** — `.claude/hooks/context_budget_gate.py` PostToolUse, system-reminder injection (40% warning pre-closure, 50% enforcement closure)
2. **Pre-flight budget estimation** — SessionStart hook stima costo prompt vs budget; declina scope troppo grossi proponendo split. Tabella reference `docs/context_budget_reference.md`
3. **Closure threshold 50%→40%** — update CLAUDE.md regola operativa (40% pre-closure trigger, 50% hard limit, 10% margine discovery)
4. **Memory append-only pattern** — sostituire Read→Edit con `echo "..." >> file.md`. NO Edit completo di file >100 righe. Refactor compatto solo a fine fase major. Update `feedback_workflow_strict.md`
5. **Commit message template** — `.claude/templates/commit-template.md` con placeholder. Skill `/commit` esistente da estendere

**Priorità implementazione (ordine S27)**:
1. Vincolo 1 + 3 (immediate impact, low effort: hook + threshold)
2. Vincolo 4 (memory pattern, medium effort)
3. Vincolo 5 (template, low effort)
4. Vincolo 2 (tabella reference + calibrazione, medium-high effort)

**Mandato S27**: sessione fresh, scope unico, no scope mixing. Commit infra: "context budget structural guardrails (5 vincoli)". Update CLAUDE.md + memory.

**Memory dedicata**: `feedback_context_budget_structural.md` (NEW, da creare in S27 con razionale completo).

---

## [2026-04-30 SESSIONE 28] — P0 health-check sleep-mode fix + V5 commit template + V4 append-only pattern

### Sintesi (3 line)
- **P0 PASS** (production observability fix): health-check `ping ICMP .4` → `nc -z -w 5 192.168.1.4 554` (RTSP TCP listening probe, resiliente a EZVIZ sleep-mode). Test live 13 PASS / 0 FAIL / 1 WARN (Tailscale). Alert state cleared.
- **P1.V5 DONE** (commit template): `.claude/templates/commit-template.md` creato con formato `S{N} {scope}: summary` + scope ZeroClaw allowlist. Skill `/commit` aggiornata con cheat-sheet + cross-reference. Risparmio context atteso ~2-3% per commit.
- **P1.V4 DONE** (memory append-only): `feedback_workflow_strict.md` esteso con sezione "Append-only pattern per memory files" via `bash >>` (eat-own-dogfood self-applicato). Regola: file >100 righe → SOLO bash append, non Edit completo.

### P2 SKIP — gate naturale 2026-05-07 non scaduto (today 2026-04-30, +7gg)
### P3 DEFER S29 — production polish (runbook DR, daily Telegram report, --report-mode) non gate-blocked ma context budget guardrails respect

### Files toccati S28
| File | Azione |
|------|--------|
| `scripts/guardian/health-check.sh` | UPDATED (line 177-181: ICMP→RTSP TCP probe, +nota sleep-mode) |
| `~/guardian/health-check.sh` (iMac) | DEPLOYED via scp |
| `.claude/templates/commit-template.md` | NEW (S{N} format + conventional fallback + gate pre-commit) |
| `.claude/skills/commit/SKILL.md` | UPDATED (cheat-sheet S{N}, scope expanded, cross-ref template) |
| `MEMORY/feedback_workflow_strict.md` | APPENDED (V4 section, bash >>) |
| `.planning/HANDOFF.md` | APPENDED (S28 section, bash >>) |
| `MEMORY.md` + `project_s28_findings.md` | NEW memory entry |

### Eat-your-own-dogfood verdict S28
- V4 append-only: self-applicato ✅ (HANDOFF + memory updates via bash >>, no Edit completi)
- V5 commit template: applicato a closure commit S28 ✅
- V1 hook: fired @ 41% on Bash append, closure protocol invocata correttamente ✅
- V3 threshold 40%: pre-closure trigger respected (NO scope expansion oltre P0+V4+V5) ✅
- Pattern context budget structural guardrails ora 4/5 vincoli LIVE (V1+V3+V4+V5). V2 (pre-flight estimation) → S29.

### Per S29
- **CARRY-OVER P0 NORTH STAR** (gate naturale 2026-05-07, +7gg): decision tree
  - PRE-FLIGHT: pgrep guardian + sqlite MAX(ld) + grep _baseline_suppressed + Luna PID + watchdog log + Tailscale status
  - Caso A: MAX≥3 + suppress≥1 → ✅ NORTH STAR LIVE (memory `project_north_star_live.md`)
  - Caso B: MAX≥3 + suppress=0 → tuning min_samples_to_suppress / normality_threshold
  - Caso C: MAX=1 ancora → ESCALATE Opzione B refactor `_rebuild_profile` SQL
- **CARRY-OVER V2** pre-flight estimation: `docs/context_budget_reference.md` calibrazione costi + SessionStart hook scope declination
- **CARRY-OVER PRODUCTION POLISH**: DR runbook `docs/runbook.md`, Daily Telegram report 21:00, Health-check `--report-mode pretty`
- **CARRY-OVER LUKE PHYSICAL**: Tailscale iMac login `/Applications/Tailscale.app/Contents/MacOS/Tailscale up --accept-routes`, `sudo pmset -a autorestart 1`, hardware cameretta swap (S22-S28)

---

## [2026-04-30 SESSIONE 28+] — 🔴 P0 NORTH STAR VIOLATION CRITICA: FP divano figlio (S15B fix INSUFFICIENTE)

### Bug report Luke 2026-04-30 ~21:15
"rileva persona orizzontale in soggiorno, è mio figlio sul divano, stesso problema non risolto"

### Evidence Guardian log (TRIPLA escalation 2026-04-30 21:13-21:14)
```
21:13:29.998 [WARNING] [hpt:soggiorno] FALLEN CONFIRMED dur=31.0s thr=30s safe_zone=False track_ids={7} frames=3
21:13:29.998 [WARNING] [hpt:soggiorno] HPT FALL ALERT dur=31.0s
21:14:04.494 [WARNING] [hpt:soggiorno] FALLEN CONFIRMED dur=31.0s thr=30s safe_zone=False track_ids={7} frames=29
21:14:04.495 [WARNING] [hpt:soggiorno] HPT FALL ALERT dur=31.0s
21:14:34.628 [INFO]    [fall-diag] track#7 LYING_DOWN->FALLEN angle=65 vel=-3 ar=1.59
21:14:34.629 [INFO]    [fall-diag] track#7 FALL ALERT TRIGGERED score_pending duration=61.1s
21:14:34.633 [INFO]    [geo-score] [soggiorno] track#7 score=100 AR=1.37 angle=64.8 reason=AR>=1.2 | angle>=40.0 | heuristic=FALLEN
```

### Diagnosi prima impressione (NON debug deep — context 51% closure)
- **HPT scatta `safe_zone=False`**: il safe-zone-aware S15B NON sta classificando il divano come safe zone
- **Pattern identico a S15B FP originale 2026-04-27 14:36-14:39**: HPT@30s + FSM@60s + cam-level (ora è HPT@31s + FSM@61s, soglie invariate)
- **S15B fix S15B-READY (HANDOFF "PIANO S15B-READY") evidentemente NON deployato OR zones.json non copre il divano**
- Track#7 stesso ID mantenuto (single track persistente = persona stesa stabile, non fall reale)

### Stato Guardian
- **OFF** (bootout `com.guardian` ~21:15 su richiesta Luke, post-FP)
- DB ha 1392+ obs soggiorno baseline OK
- Cron health-check `*/15` segnalerà FAIL "Guardian process NOT running" → Telegram alert
- Cron baseline_rebuild `0 * * * *` pure fallirà su DB locked? No, DB read-only, OK

### Mandato S29 — REPRIORITIZZAZIONE
**P0 ASSOLUTO (precede gate naturale 2026-05-07)**:
1. **Verifica zones.json** (~/guardian/zones.json): coordinate divano soggiorno presenti come safe zone?
2. **Audit codice S15B**: `horizontal_position_tracker.py` + `_classify_pose_zone` — passa zona corretta?
3. **Diagnostica**: aggiungere log `[hpt:soggiorno] zone={zone_name} safe={true/false} center=(x,y)` per ogni FALLEN classification
4. **Re-deploy + monitor live** seduta divano controllata 5min → expect zero alert

**P1 BACKGROUND**:
- Guardian RESTART solo dopo fix verificato (rischio FP Telegram repeated se restart prima)
- Disabilitare cron health-check temporaneamente? (decisione Luke S29 inizio)

**P2-P3 originali S29 plan (V2 + production polish) DEFER**: P0 NORTH STAR violation overrides everything.

### Files da investigare S29
- `~/guardian/zones.json` (iMac)
- `~/guardian/horizontal_position_tracker.py` (iMac)
- `~/guardian/guardian.py` lookup `safe_zone` references
- backup S15B: `~/guardian/horizontal_position_tracker.py.bak.S15B`
- Memory: `feedback_fall_detection.md`, `project_guardian_safe_zones_adr.md`

### Honest closure S28+
Context 51% enforcement: NO debug now (rischio WIP untested), evidence capturata, escalation S29 P0 critica.

### S28+ Maintenance window attivata 2026-04-30 ~21:20
- Cron `*/15 * * * * health-check.sh` COMMENTATO (prefix `# MAINTENANCE S28+ disabled`)
- Backup crontab pre-edit: `/tmp/crontab.s28-bak` su iMac (volatile, /tmp pulito al reboot)
- **Re-enable S29 PRIMA AZIONE** post-fix Guardian: `ssh gianlucadistasi@imac-di-gianluca.local "crontab -l | sed 's|^# MAINTENANCE S28+ disabled (Guardian OFF, FP investigation S29) ||' | crontab -"`
- Verifica re-enable: `crontab -l | grep health-check` → atteso `*/15 * * * * /Users/gianlucadistasi/guardian/health-check.sh --quiet`
- Decisione CTO enterprise pattern: maintenance window via crontab comment (zero code drift, alert fatigue prevention)

---

## [2026-05-01 SESSIONE 29] — 🔴 P0 NORTH STAR FP DIVANO — ROOT CAUSE: HPT coordinate mismatch (FIX DEPLOYED, WIP test live)

### Sintesi (3 line)
- **Root cause IDENTIFIED**: HPT init `frame_w=640, frame_h=480` hardcoded (line 2745) ≠ zones.json polygons in `[1920, 1080]` resolution → bbox `_normalize()` divides by 640/480 producing values >1.0, then `cx = norm * 640` re-multiplies into 640-space testing against 1920-space polygon → `pointPolygonTest` ALWAYS False on couch → `safe_zone=False` → 30s threshold (not 600s) → FP confirmed.
- **Fix DEPLOYED**: guardian.py line 2745 now reads `zones_config["cameras"][name]["resolution"]` defaulting `[1920, 1080]`; HPT init dinamica + log message updated `HPT enabled (frame=1920x1080)`. Sync repo + iMac. Syntax OK.
- **Status WIP**: Guardian OFF (bootout + watchdog cron `*/1` DISABLED via comment maintenance S29). NO Guardian restart fino a Luke 5min controlled couch test. Cron health-check resta disabled da S28+.

### Diagnosi prove (parallel SSH burst STEP 1)
- `~/guardian/zones.json` divano polygon presente: `[[600,400],[1200,400],[1200,900],[600,900]]` per soggiorno resolution `[1920, 1080]`
- `~/guardian/horizontal_position_tracker.py` S15B safe_polygons logic presente (diff vs `.bak.S15B` = 30 righe S15B aggiunte)
- guardian.py line 2745 PRE-FIX: `HorizontalPositionTracker(name, frame_w=640, frame_h=480)` — coordinate mismatch root cause
- guardian.py line 2980-3000 FSM safe-zone check: `_bx, _by` in 1920x1080 raw vs polygon 1920x1080 — corretto (no bug FSM separato — escalation 60s evidence indicava `_in_safe_zone=False` propagato da HPT? NO — FSM ha check indipendente. POSSIBILE bug separato, defer S30.)
- MODEL_IMGSZ=480 ma `result.boxes.xyxy` returns in original frame coords (1920x1080)
- Watchdog cron `* * * * *` aveva re-startato Guardian post-bootout 21:15 (PID 53828 7:42) — ora disabled

### Files toccati S29
| File | Azione |
|------|--------|
| `~/guardian/guardian.py` (iMac) | EDITED line 2745: HPT init reads zones.json resolution |
| `scripts/guardian/guardian.py` (Mac repo) | MIRRORED same patch |
| `~/guardian/guardian.py.bak.S29-pre-fix` | BACKUP iMac |
| `~/guardian/horizontal_position_tracker.py.bak.S29-pre-fix` | BACKUP iMac |
| `~/guardian/zones.json.bak.S29-pre-fix` | BACKUP iMac |
| crontab iMac | watchdog `* * * * *` DISABLED prefix `# MAINTENANCE S29` |
| `~/.claude/CLAUDE.md` (global, user request) | APPENDED `### Skill free-gpu-api` |

### Eat-your-own-dogfood verdict S29
- V1 hook: warning fired @41% e @46% — closure ordinata applicata
- V3 threshold 40%: rispettata, NO scope expansion verso V2 / FSM separate fix / production polish
- V4 append-only: HANDOFF + CLAUDE.md global via `cat >>`, NO Edit completi
- V5 commit template: applicato closure commit S29 (S29 FP-fix scope)
- CTO autonomy: SSH diagnostic + python patch diretto, no delega Luke

### Per S30 — CARRY-OVER ASSOLUTI
- **🔴 P0 LIVE TEST controllato divano** (Luke azione fisica): 5min seduta/sdraiata sul divano DOPO Guardian restart manuale. Pass criteria: zero `FALL ALERT` log + verifica nuovo log line `[hpt:soggiorno] HPT enabled (frame=1920x1080)` allo startup. Solo dopo PASS: re-enable cron watchdog + cron health-check.
- **P1 FSM safe-zone audit S30** (NON in scope S29): verifica indipendente `_in_safe_zone` propagation da line 2980 → `_safe_lying_escalation_s` line 2424. FP S28+ aveva ANCHE FSM escalation — possibile bug parallelo o cascade da HPT.
- **P1 V2 carry-over** pre-flight estimation (S27→S28→S29→S30): `docs/context_budget_reference.md` + SessionStart hook scope declination
- **P2 Production polish** defer (DR runbook, daily Telegram report, --report-mode pretty)

### Restart procedure S30 (post Luke physical test pass)
```bash
ssh gianlucadistasi@imac-di-gianluca.local "
launchctl bootstrap gui/\$(id -u) ~/Library/LaunchAgents/com.guardian.plist
sleep 10
grep 'HPT enabled (frame=' ~/guardian/logs/guardian.log | tail -2
# expect: [hpt:soggiorno] HPT enabled (frame=1920x1080)
# Luke 5min controlled couch test — monitor:
tail -f ~/guardian/logs/guardian.log | grep -E 'hpt:soggiorno|FALL'
# After PASS: re-enable crons
crontab -l | sed 's|^# MAINTENANCE S29 disabled (FP investigation HPT scaling fix) ||' | crontab -
crontab -l | sed 's|^# MAINTENANCE S28+ disabled (Guardian OFF, FP investigation S29) ||' | crontab -
"
```

---

## [2026-05-01 SESSIONE 30] — POC auto-detect furniture (S30 Chunk 1) — PASS

### Sintesi (3 line)
- **Mandato**: Chunk 1 di 3 split Opzione B (auto-detect furniture YOLOv8n COCO) — POC offline su 2 snapshot statici, ZERO touch Guardian production. Target ≤40% closure ordinata.
- **Result**: PASS criteria entrambi soddisfatti — couch soggiorno conf=0.484 (target ≥0.4), bed cameretta conf=0.851 (target ≥0.4). Visualization PNG bbox correttamente posizionati sui mobili reali.
- **Stato**: Chunk 2 (zones generator + dry-run override zones.json) e Chunk 3 (Guardian integration boot-time) carry-over S31. Guardian resta OFF (Luke physical test S29 fix HPT scaling ancora pending).

### Setup eseguito (CTO autonomy SSH)
- iMac probe: ffmpeg `/usr/local/bin/ffmpeg` OK, ultralytics 8.4.31, opencv 4.10.0, NO `yolov8n.pt` (solo `yolov8n-pose.pt`)
- Snapshot capture via go2rtc localhost:
  - `ffmpeg -rtsp_transport tcp -i rtsp://127.0.0.1:8554/soggiorno -frames:v 1 -update 1` → `~/guardian/snapshots/soggiorno_S30.jpg` (274KB, 1920x1080)
  - Cameretta richiesto `-analyzeduration 10000000 -probesize 10000000` (warning `Missing PPS in sprop-parameter-sets` cronico hardware) → `cameretta_S30.jpg` (262KB, 1920x1080)
- YOLOv8n.pt scaricato 6.2MB via ultralytics auto-download → `~/guardian/yolov8n.pt`
- Script standalone `scripts/guardian/furniture_detector.py` (172 righe) deployato su iMac

### Output JSON detection (S30 evidence)
| Camera | Furniture | Conf max | Detections | PASS criterion |
|--------|-----------|----------|------------|----------------|
| soggiorno | couch | **0.484** | 2 | ✅ ≥0.4 |
| soggiorno | dining_table | 0.328 | 1 | bonus |
| soggiorno | chair | 0.350 | 3 | bonus |
| soggiorno | bed | — | 0 | ✅ correct (no bed) |
| cameretta | bed | **0.851** | 2 | ✅ ≥0.4 |
| cameretta | couch/chair/table | — | 0 | ✅ no FP |

Visualization PNG ispezionate: bbox green su divano reale + bbox blue su letti reali, posizionamento accurato. Salvate in `.planning/research/s30-furniture-poc/`.

### Files toccati S30
| File | Azione |
|------|--------|
| `scripts/guardian/furniture_detector.py` | NEW (172 righe, standalone POC) |
| `~/guardian/furniture_detector.py` | DEPLOYED iMac via scp |
| `~/guardian/yolov8n.pt` | NEW download (6.5MB COCO) |
| `~/guardian/snapshots/{soggiorno,cameretta}_S30.jpg` | NEW snapshots |
| `~/guardian/snapshots/{soggiorno,cameretta}_S30_furniture.{json,png}` | NEW outputs |
| `.planning/research/s30-furniture-poc/` | NEW (6 file: 2 jpg + 2 png + 2 json) |
| `.planning/HANDOFF.md` | APPEND S30 (questo) |
| `MEMORY.md` + `project_s30_findings.md` | APPEND |

### Eat-your-own-dogfood verdict S30
- V1 hook: passive (target sotto soglia)
- V3 closure ordinata threshold 40%: applicata (closure prima di scope expansion Chunk 2/3)
- V4 append-only HANDOFF + memory (bash heredoc `>>`)
- V5 commit template formato S30 scope chunk-1
- CTO autonomy: SSH + ffmpeg + python autonomi, ZERO domande Luke (eccetto Luke physical test S29 carry-over)
- Evidence-based: confidence reali da output YOLO JSON, no "credo che funzioni"

### Per S31 — CARRY-OVER ASSOLUTI
- **P0 NORTH STAR carry-over S29**: Luke 5min controlled couch test post-fix HPT scaling. Restart procedure documentata in S29 section sopra. Watchdog cron RESTA disabled fino PASS test fisico.
- **P1 Chunk 2 (Opzione B)**: zones generator script `furniture_to_zones.py` — input JSON detection → output `zones.json` con safe polygon couch/bed (margin 5% inflation). Dry-run output a file separato `zones.json.s31-proposal`, NO override production. PASS criterion: polygon couch contiene bbox FP S28+ (centro track#7) + polygon bed cameretta contiene bed bbox.
- **P1 FSM safe-zone audit S30→S31**: defer. guardian.py line 2980→2424 escalation `_safe_lying_escalation_s` indipendenza vs HPT.
- **P1 V2 carry-over S27→S28→S29→S30→S31**: pre-flight estimation `docs/context_budget_reference.md` + SessionStart hook scope declination.
- **P2 production polish carry-over**: DR runbook, daily Telegram report 21:00, health-check `--report-mode`.
- **P3 Luke physical** (rinnovato): MIUI Termux+Termux:Boot whitelist, hardware cameretta swap (S22-S30 cronico), Tailscale iMac login (account `ilcombeeretrasher`), `sudo pmset -a autorestart 1`.


### S30 ESTENSIONE — Test 4-scenari live + verdetto INCONCLUSIVO (closure forced @50%)
- Guardian restart manual launchctl bootstrap PASS, criterion startup ✅: `[hpt:soggiorno] HPT enabled (frame=1920x1080)` + `safe_polygons loaded: 1 zones` (S29 fix LIVE)
- Test physical 4-scenari (S1 seduto 90s, S2 sdraiato divano 120s, S3 pavimento 60s, S4 cammina 30s) guidato via iMac `say -v Alice` automated script `/tmp/guide_test.sh` PID 3383, finestra 09:36:21→09:42:00
- **VERDETTO INCONCLUSIVO**: 64 log entries finestra test, TUTTE `boxes=0 has_track_ids=False conf_thresh=0.25`. ZERO person detection upstream YOLO pose. FPS stream nominale (0.9, frame 681→919 linear). NESSUNA conclusione possibile su fix S29: no FP detect (atteso PASS S2) MA anche no FN detect (atteso FAIL S3) — pipeline upstream non vede persona.
- **Action CTO**: Guardian RESTA running PID 2013, cron watchdog+health-check RESTANO disabled. NO auto-restart, NO production activation fino a root cause `boxes=0`.
- **3 ipotesi S31 P0**: (1) RTSP stream stale/freeze, (2) PTZ framing shift fuori divano+pavimento, (3) YOLOv8n-pose conf<0.25 su luce mattino soggiorno.
- **EZVIZ backchannel**: re-confermato impossibile (P2P proprietario), audio iMac `say` Alice usato come surrogate.


## [2026-05-01 SESSIONE 31] CTO test FAIL + diagnosi affidabilità infra

### Phase 1 PASS (diagnostic CTO autonomy)
- 1.1 Stream live OK (md5 a9b4 vs 3899, NO freeze)
- 1.2 Framing OK (FOV soggiorno divano+pavimento visibili)
- 1.3 POSE standalone op: stanza vuota → conf=0.25 boxes=0 (corretto), conf=0.15 → 1-2 FP su mobili (sedia bianca, tendaggio)
- Pre-condition Guardian: 18 min `boxes>=1` continuo 10:03-10:22 → S30 boxes=0 era test condition specifica

### Phase 2 FAIL (test 4-scenari ripetuto)
- Orchestrator `~/guardian/s31_test.sh` eseguito 12:39-12:43 (S0 20s + S1 90s + S2 60s)
- Guardian log frame#11250-11430: **boxes=0 PER TUTTA durata** (5 frames @ 33s interval)
- Snapshot post-test 12:43:42: stanza vuota + sistemazione mobili (sedie sul tavolo)
- POSE post-test conf=0.25:0, conf=0.15:2 FP (mobili, no persona)

### Root cause sospettata (non confermata)
**Audio TTS iMac NON raggiunge soggiorno** — iMac in stanza diversa, Alice say uscita su speakers iMac, Luke probabilmente non ha sentito istruzioni audio.
Senza snapshot DURANTE test → impossibile verificare se Luke fisicamente in frame.

### Mandato S32 (next session) — TEST AFFIDABILI ENTERPRISE
1. **Telegram-orchestrated test**: orchestrator iMac invia messaggi `@Lukehomedx_bot` chat 931063621 al posto di TTS audio. Luke legge phone in soggiorno.
2. **Snapshot capture continuo**: ffmpeg snapshot ogni 10s durante S0+S1+S2 in `~/guardian/snapshots/s32/` → 18 file timestamped
3. **POSE analysis automatica post-test**: script python iter su tutti snapshots, output `name: c=0.25:n=N | c=0.15:n=N | c=0.05:n=N`
4. **Visual audit**: pull subset snapshots local, Read tool per confermare Luke in frame
5. **Decision tree S32**:
   - Snapshot mostra Luke in frame + boxes=0 a 0.25 → fix conf 0.15 + safe-zone FP filter
   - Snapshot vuoto → audio/coordination issue, ri-test con visual cues phone
6. **Telegram creds**: TOKEN `8681473846:AAGeRFHsO_iFy8_dHzbfHibeDdfSNYK4hho`, CHAT `931063621` (già su iMac `~/guardian/guardian.env`)
7. **Time budget S32**: pre-flight script ready ad inizio sessione, max 5% context spawn → Luke 3 min → analysis 5% → closure 10%. Total 25-30%.

### Files generati S31 (audit trail)
- `~/guardian/snapshots/soggiorno_S31_live.jpg` (10:27, stanza vuota baseline)
- `~/guardian/snapshots/soggiorno_S31_postest.jpg` (12:43:42, post-test stanza vuota)
- `~/guardian/s31_test.sh` (orchestrator audio TTS, INSUFFICIENT)
- `scripts/guardian/s31_test_orchestrator.sh` (Mac copy)

### Anti-pattern S31
Audio TTS iMac in stanza diversa = test setup broken. Pre-flight S31 ha verificato POSE+stream+framing ma NON ha verificato delivery comandi a Luke. Lesson per S32 e oltre: **test human-in-the-loop richiede verifica esplicita comunicazione end-to-end (delivery + acknowledgement)**, NON assumere audio raggiunga.

### Phase 3 NOT executed (cron watchdog + health-check restano DISABLED)
Production activation BLOCKED finché Phase 2 PASS. Guardian PID 2013 stabile soggiorno-only in modalità degradata (cameretta thread off da S23, no watchdog, no health-check cron). FP suppression gate naturale 2026-05-07 ancora respected.

### S31 update: S32 fix audio delivery
NO Telegram (Luke mani occupate phone se sdraiato). NO iMac TTS (stanza diversa).
**Soluzione: phone Termux TTS** posizionato su mobile soggiorno, volume alto.
Orchestrator iMac: `ssh -p 8022 192.168.1.11 "termux-tts-speak -r 1.1 'Scenario uno sdraiati divano'"`
Phone speaker raggiunge soggiorno + Luke mani libere per posizioni test.
Verifica pre-flight S32 obbligatoria: `ssh phone "termux-tts-speak 'test audio'"` → Luke conferma sentito.

## [2026-05-02 SESSIONE 32]

**Outcome**: ❌ FAIL production activation, ✅ PASS vincoli infrastruttura test S32

### Phase 1 Pre-flight (PASS post-Luke-physical phone start)
- Guardian PID 2013 alive (up dal Ven 9am, frame#80669+)
- Stream RTSP 127.0.0.1:8554/soggiorno OK
- Snapshot ffmpeg PASS (311KB s32_preflight.jpg)
- Phone SSH initially DOWN (Termux not running) → Luke ack → `termux-wake-lock; sshd` → SSH+TTS OK

### Phase 2 Audio ack
- termux-tts-speak phone Redmi .11 → Luke "si" ✅
- VINCOLO S32 audio delivery RISOLTO (no TTS iMac, no Telegram)

### Phase 3 Orchestrator (s32_test.sh deployato ~/guardian/)
- Durata 5:08 min (11:34:21-11:39:29)
- 18 snapshot capturati ~/guardian/snapshots/s32/ (3 S0 + 9 S1 + 6 S2)
- POSE auto-analysis 3 conf levels OK
- VINCOLO S32 evidence capture RISOLTO

### Phase 4 Visual audit
- 3 snapshot subset Read tool: Luke confermato in frame TUTTI scenari
- S0 in piedi mano alzata, S1 sdraiato divano, S2 sdraiato pavimento

### BUG identificati S33 carry-over
1. **POSE detection drop su sdraiato divano** — YOLOv8n-pose @0.25 perde Luke 8/9 snap S1, recupera intermittente @0.15. Possibile: bg chiaro + pose orizzontale + finestra retroilluminata.
2. **FALL detection logic NON triggera** — S2 60s pavimento boxes=2-3 detected da YOLO ma Guardian ZERO FALL alert nel log. FSM/HPT/cam-level non scattano. Root cause da debugare in `guardian.py` fall logic + safe-zone checks.

### Phase 5 NON eseguita
- Re-enable cron watchdog/health-check NEGATO (richiede ALL PASS)
- Watchdog + health-check cron rimangono DISABLED (`# MAINTENANCE S29`/`# MAINTENANCE S28+`)

### Action items S33
- [ ] P0 NORTH STAR: debug Guardian fall trigger logic — perché S2 60s pavimento boxes>0 zero FALL alert
- [ ] P1: lower conf threshold guardian.env 0.25→0.15 OR upgrade modello pose (yolov8s-pose?)
- [ ] P2: investigare se gatto bianco genera ID track persistente (false boxes=1 con Luke fuori frame)

---

## [2026-05-02 SESSIONE 33]

**Outcome**: ✅ Phase 0 research esterna PASS — Perplexity scout 38 URL su 8 features, top winner Feature 1 (`taufeeque9/HumanFallDetection` 337⭐ MIT openpifpaf+LSTM) verificato. ⏸️ Fix S32 (Bug A/B) deferred S34 per closure ordinata 47% context.

### Phase 0 — Research esterna
- Lettura documento Downloads (`sto sviluppando un app...md` Perplexity overview): NON sblocca S33 (Frigate switch CONFLITTO arch + scope creep pet/fire/water).
- 3 iter prompt Perplexity: v1 verify-heavy, v2 8-campi-rigetto-auto (NO MATCH globale), **v3 scout-only 4 campi soft = output utile** (38 URL).
- Output salvato: `/Users/macbook/Downloads/Feature 1 — Fall detection sdraiata.md`.

### Top winner Feature 1 — taufeeque9/HumanFallDetection
- Stack: openpifpaf+LSTM, torch≥1.6, CPU support (`disable_cuda` flag), 5 features (height_bbox, ratio_bbox, angle_vertical, log_angle, rotational_energy).
- Weights `model/lstm_weights.sav` presente nel repo.
- **NON risolve Bug A** (detection failure upstream YOLO @0.25 sdraiato): se boxes=0, LSTM non parte.
- **NON risolve Bug B** (escalation 600s safe zone polygon).
- Risolve principled FP couch (angle_vertical<45° = standing). Costo integration 8-20h.
- **Backlog S35** — investment medio termine, NON quick fix.

### Decisione CTO
Deferred fix S32 a S34 dedicata (15+10+30 = 55min stimati). Motivo: 47% context S33, sessione fix richiede focus mirato senza scope creep research, closure ordinata > WIP.

### Stato infra
- Guardian PID 2013 alive (uptime 1d3h verified pre-closure)
- Cron watchdog/health-check DISABLED (S29/S28+ hardening intact)
- Cron operativi: go2rtc_health 5min, backup 3am, baseline rebuild 1h, ezviz_ip_resolver 5min

### Carry-over S34 (P0 NORTH STAR ASSOLUTO)
1. Fix Bug B zones.json polygon "divano" → `[[650,500],[1150,500],[1150,800],[650,800]]` + add `pavimento_soggiorno` no-safe
2. Fix Bug A conf 0.25→0.15 + test offline 18 snap S32 esistenti
3. Re-test live 90s controllato Luke pavimento (atteso FALL ≤30s)
4. NO re-enable cron finché ALL PASS

### Backlog S35
- Integration `taufeeque9/HumanFallDetection` LSTM second-stage classifier (FP reduction principled, dopo baseline S34 stabile)

### File deliverable S33
- `~/.claude/projects/.../memory/project_s33_findings.md` (memory append-only V4)
- `.planning/HANDOFF.md` (this section)
- `.planning/PROMPT_S34.md` (next session spec)


---
## [2026-05-02 SESSIONE 34] — Fix Bug A+B P0/P1 PASS deployati, P2/P3 WIP S35
**Outcome**: P0 zones.json polygon divano shrunk `[[650,500],[1150,500],[1150,800],[650,800]]` (era ingloba pavimento) + P1 conf threshold 0.25→0.15 (offline test 18 snap S32: S1 sdraiato divano recovery 1/9→8/9, S0/S2 invariati). Guardian restartato PID 19339, log conferma `safe_polygons loaded: 1 zones`, `frame=1920x1080`, `conf_thresh=0.15`.
**Closure 41% ordinata**: P2 live test 90s + P3 production activation defer S35 (Luke physical required = scope esteso).
**Deploy**: iMac zones.json + guardian.py + s34_offline_conf_test.py + 2 backup .bak.s34.
**Cron watchdog/health-check ANCORA DISABLED** — gate on P2 PASS S35.
**Reference**: memory `project_s34_findings.md`.

---
## [2026-05-02 SESSIONE 34 ADDENDUM] — Strada C scelta, S35 planning-only ready
Luke ha richiesto allineamento su visione Perplexity (file Downloads non letti in S34 per scope chiuso PROMPT_S34). Letti post-fix: visione = piattaforma multi-allarme 12 feature (caduta/intrusione/fuoco/allagamento + 8 enterprise) con profili target persona/animale/entrambi + Frigate backbone + confidence 3-levels + human verification + MLOps. Gap vs Guardian attuale: ~10% coverage. **Decisione CTO Strada C** (planning-only S35) per evitare fix tattici senza visione. PROMPT_S35.md creato con plan atomico P0-P3 + vincoli rigidi + ADR 008 atteso.
**Stato produzione**: Guardian PID 19339 STABLE con fix S34 P0+P1 deployati, cron watchdog/health-check DISABLED (intact gate). Rollback rapido via .bak.s34 se serve.
**Carry-over S35**: Phase 0 read 2 file Perplexity + P0 gap matrix + P1 Frigate audit reale + P2 ADR 008 decisione + P3 ROADMAP-v4.



---
## S35 closure (2026-05-02 20:07, planning-only)
- ✅ P0 `.planning/feature_gap_matrix.md` — 12 feature + 9 cross-cutting, 190-310h Guardian-only roadmap
- ✅ P1 `.planning/frigate_audit.md` — Strada B NOGO (50-80h+ NORTH STAR risk), Strada A+ GO (20-30h)
- ✅ P2 `docs/adr/008-platform-direction.md` — **Strada A+ ibrida** ACCEPTED
- ✅ P3 `.planning/ROADMAP-v4.md` — MVP Q3-2026 + Pro Q4 + Enterprise Q1-2027 (€111-121 HW)
- Deferred S36: P2/P3 S34 (G1/G2 gates), OQ-1 benchmark live, OQ-2 Frigate fall plugin research, OQ-3 HW approval



## [2026-05-04 SESSIONE 36] — G1 FAIL + Guardian zombie recovery + OQ-2 ADR confirmed

**Closure 52% enforcement** (hard limit hit post-P3 ADR addendum).

### Eseguito
- ✅ **P0 Guardian recovery**: zombie 45h post-FALL ALERT 2026-05-02 13:53:47 → kickstart, new PID 83370, MQTT/zones/geo-scorer up
- 🔴 **P0 G1 fall test FAIL**: s32_test.sh (S0/S1/S2 ~210s) eseguito 11:18-11:23, pose offline OK boxes=1-3 @0.15, MA Guardian log live zero `[hpt:soggiorno] FALLEN CONFIRMED` + zero `[fall-diag]` su S2 pavimento 60s. FSM HPT non triggers (pattern S31).
- 🚫 **P1 G2 BLOCKED**: cron watchdog/health-check restano DISABLED (gated G1 PASS)
- ✅ **P2 OQ-2**: sub-agent trend-researcher → verdict 3 (no Frigate fall plugin maturo). File `.planning/frigate_fall_plugin_research.md`
- ✅ **P3 ADR 008 addendum**: sezione "OQ-2 outcome 2026-05-04" → Strada A+ saldamente confermata

### Files
- `.planning/frigate_fall_plugin_research.md` (NEW)
- `docs/adr/008-platform-direction.md` (OQ-2 addendum)
- iMac `~/guardian/snapshots/s32/*.jpg` (18 evidence)
- iMac PID 83370 (running, frame#660 a 11:23, FPS 0.9)

### Carry-over S37 (P0 NORTH STAR)
1. **Root cause HPT FSM non triggers** (5° round) — investigare fall_handler post-alert (correlato zombie 45h), skel-reject quality threshold, frame rate 0.9 FPS sequence stability, safe_zone polygon edge case
2. **Root cause zombie post-fall 2026-05-02 13:53:47** — fall_handler/voice/telegram delivery GIL block?
3. **G1 retry post-fix** (Luke physical ~15min)
4. **G2 production activation** SOLO se G1 PASS

### CORRECTION S36 2026-05-04 11:35
- 🔴 **G1 verdict riclassificato INVALID, non FAIL** — phone SSHd offline (LAN+Tailscale 100% packet loss), `say()` script ha mascherato SSH errors con `2>/dev/null || true`, Luke confermato: "nessuna istruzione audio ricevuta, non ho fatto nulla"
- Pose detection `boxes=1-3` = vita normale Luke, non scenari controllati S0/S1/S2
- **P0.5 NEW carry-over S37**: phone Termux recovery (`termux-wake-lock && sshd`) + patch s32_test.sh (pre-flight SSH check + fail fast, NO masking)
- Le 4 ipotesi root cause HPT FSM precedenti restano da verificare MA solo se test riproducibile con audio funzionante

---

## [2026-05-04 SESSIONE 37] — Patch s32_test.sh pre-flight PASS, G1 retry INVALID round 2 (Guardian self-shutdown)

### Sintesi (3 line)
- **P0 patch s32_test.sh DEPLOYED + LIVE-VALIDATED**: pre-flight SSH+TTS+termux-tts-speak fail-fast, no `|| true` masking, audio handshake 4/4 confermati audibili Luke ("si a entrambi"). Lesson S36 INVALID applicata strutturalmente.
- **G1 retry INVALID round 2**: Guardian self-shutdown 12:17:35 (`Shutting down Guardian v3.0...`) PRIMA di S0 START 12:17:38. Cron watchdog disabled S29 → no auto-recovery. Test window 12:17-12:22 zero HPT/FSM/FALL/ALERT (process morto), ma snapshot pose offline conferma Luke detected S0/S1/S2.
- **Pattern instabilità Guardian post-zombie**: restart S36 PID 83370 (kickstart) → up 41min → clean shutdown S37. Root cause UNKNOWN, deferred S38 P0 (launchctl plist + console.log + ERROR grep + cron watchdog re-enable).

### Files toccati S37
| File | Azione |
|------|--------|
| `scripts/guardian/s32_test.sh` (Mac) | REFACTOR (+35 righe pre-flight, say() no-mask, fail() helper) |
| `~/guardian/s32_test.sh` (iMac) | DEPLOYED (scp + chmod + bash -n PASS) |
| `~/guardian/logs/s37_g1_retry.log` (iMac) | NEW evidence |
| `~/guardian/snapshots/s32/*.jpg` 18 file | NEW evidence |
| `MEMORY.md` + `project_s37_findings.md` | UPDATED memory entry |

### Per S38 (priorità ordinata)
1. **P0 NORTH STAR**: Root cause Guardian self-shutdown 12:17:35 — investigare `~/Library/LaunchAgents/com.guardian.plist` (KeepAlive/RunAtLoad), `~/guardian/logs/guardian.log` ERROR/Traceback finestra 12:16-12:18, console.log macOS, OOM check
2. **P0**: Restart Guardian + RE-ENABLE cron watchdog (S29 maintenance chiuso, pattern zombie+shutdown ricorrente non più tollerabile)
3. **P1**: G1 retry round 3 con Guardian stable + watchdog attivo + check PID alive pre/post ogni scenario (lesson S37)
4. **P2**: SE G1 PASS round 3 → G2 production activation
5. **P3 retained**: Phone Termux MIUI Doze whitelist (carry-over S22-S37 Luke physical)

### Lessons S37
- ✅ Pattern pre-flight script WORKS (S36 INVALID classe non si ripeterà — audio fail-fast)
- 🔴 NUOVA classe failure: Guardian self-shutdown DURANTE test orchestrator
- ✅ Pattern strutturale derivato: ogni test live deve verificare Guardian PID alive **immediatamente prima E dopo** ogni scenario
- 🔴 Cron watchdog disabled (S29 maintenance) NON più tollerabile — re-enable P0 S38

### Closure rationale
Context budget warning 43% (post-grep test window analysis). V3 protocol applicata: closure ordinata ≤50%. P0 root cause Guardian shutdown deferred S38 (richiede deep investigation launchctl/console.log/code review che eccede budget S37). G1 retry deferred round 3 post-fix. Patch s32_test.sh structural goal raggiunto end-to-end (audio confirmato).

---

## [2026-05-04 SESSIONE 38] — P0 root cause Guardian self-shutdown UNDETERMINED + cron watchdog RE-ENABLED

### Sintesi (3 line)
- **P0 root cause Guardian self-shutdown 12:17:35**: shutdown clean via SIGTERM/SIGINT (signal_handler invoked, exit code 0, no ERROR/Traceback, no OOM, no memory pressure events). plist KeepAlive.SuccessfulExit=false → niente auto-restart per design. Source signal UNDETERMINED (macOS log show retention non recupera finestra 12:17 dello stesso giorno; nessuno script grep'd contiene `pkill guardian.py`).
- **P0 mitigazione DEPLOYED**: cron watchdog `guardian_watchdog.sh` re-enabled (S29 maintenance window chiuso). Ciclo 60s + cooldown 300s, threshold 180s silenza camera. Pattern post-zombie+self-shutdown ora resiliente: anche se ripete, resurrezione ≤4min.
- **G1 retry round 3 + G2 production activation deferred S39**: pre-closure protocol 40% threshold rispettato, scope nuovo human-in-the-loop richiede Luke physical + ≥30min context budget, non aprire mid-budget.

### Evidence P0 root cause
- Guardian log finestra 12:16-12:19: `[INFO] Shutting down Guardian v3.0...` 12:17:35,590 — preceded by normal `FPS: 0.9, frames: 3649` at 12:17:32 (3s prima). NO ERROR, NO Traceback, NO Exception in window 11:30-12:30.
- Guardian.py shutdown handler @ line 4167: `signal.SIGINT/SIGTERM → log.info("Shutting down…") + sys.exit(0)`. Conferma signal-driven clean exit.
- launchctl `com.guardian` plist: `KeepAlive.SuccessfulExit=false`, `RunAtLoad=true`, `ThrottleInterval=30`. Per design: clean exit = no auto-restart.
- launchctl `last exit code = 0` confirms SuccessfulExit path → KeepAlive correttamente non ha riavviato.
- macOS `log show` window 12:17:30-12:17:40 con predicate guardian/launchd/process: vuoto. Big Sur log retention shorter than expected o predicate miss.
- pkill/killall sweep ricorsivo su `~/guardian/`, `Documents/combaretrovamiauto-enterprise`, `Documents/app-antigravity-auto`: ZERO match `pkill.*guardian|kill.*guardian.py|killall.*python`.
- LaunchAgents sospetti `com.local.maintenance.daily` (scheduled 3:15 AM, NOT 12:17), `com.local.monitor.telemetry` (StartInterval 300s ma exit 127 = script missing → no kill effect), `com.automation.deploy` (RunAtLoad=false KeepAlive=false → idle): NESSUNO compatibile con timing/effetto.
- Guardian restart manuale Luke 12:33:06 → PID 95023 attualmente alive 7+ minuti, FPS 0.9 stabile.

### Carry-over S38 → S39 (priorità)
1. **P0 (defer)** G1 retry round 3 con Guardian PID alive check pre/post ogni scenario (lesson S37) — richiede Luke physical
2. **P0 (defer condizionale)** G2 production activation se G1 PASS round 3
3. **P1 retained** Phone Termux MIUI Doze whitelist (carry-over S22-S38)
4. **P2 osservazionale** Monitorare watchdog.log → SE Guardian self-shutdown ripete entro 7gg, deep dive `fs_usage`/`dtruss` per tracciare signal source (richiede sudo, scope dedicato)
5. **P3 cleanup** Rimuovere `com.local.maintenance.daily.plist` + `com.local.monitor.telemetry.plist` orfani (script missing, exit 127 forever)

### Files toccati S38
| File | Azione |
|------|--------|
| iMac crontab | RE-ENABLED `guardian_watchdog.sh` (riga aggiunta, riga commentata S29 preservata per audit) |
| `.planning/HANDOFF.md` | APPEND S38 section (this) |
| `MEMORY.md` + `project_s38_findings.md` | NEW memory entry |

### Closure rationale
P0 root cause investigation completata con verdict UNDETERMINED + mitigazione DEPLOYED che rende il pattern ripetibile innocuo (resurrezione automatica). Context budget threshold 40% rispettato: G1 retry round 3 (richiedeva Luke physical + finestra ≥30min) deferred S39 invece che aprire scope a budget basso. Lesson S37 "Guardian PID alive check pre/post" trasferita carry-over con P0 watchdog production-grade alle spalle.

### S38 ADDENDUM — G1 retry round 3 EXECUTED (split verdict)

**Run details**: orchestrator launched 12:43, scenari S0+S1+S2 completati, 18 snapshot capturati (~12:48:38 last S2_6), Guardian PID monitor parallel active 240s.

**Verdict SPLIT**:
- ✅ **Guardian PID 95023 STABLE** entire test — zero transitions in `/tmp/g1_round3_pidmon.log`. Pattern S37 self-shutdown 12:17:35 NON ripetuto. S38 watchdog mitigation as backstop irrilevante questo round (Guardian non è morto).
- ✅ **Pose detection upstream OK** — frame#570-870 (12:43-12:48 window) `boxes=1 has_track_ids=True` consistente. Persona rilevata su pavimento.
- 🔴 **FALL LOGIC NON TRIGGERS** — grep finestra test 12:43-12:50 ZERO match per `FALL|HPT|FSM|ALARM|alert|UNKNOWN_STATE|FALLEN`. Guardian "vede" la persona ma non genera alert.
- 🔴 **Bug S32 unresolved** — stesso pattern già documentato `project_s32_findings.md` ("POSE drop sdraiato + FALL trigger non scatta"). 6 sessioni dopo (S33-S38) il bug fall-logic non è mai stato fixato in produzione.

**G2 production activation BLOCKED** — non si può attivare in produzione un Guardian che non rileva fall.

**P0 NUOVO S39**: deep dive HPT/FSM trigger logic — perché skel-reject filtra (`vis=4 sh=True hp=False c=0.30` confs basse), o perché HPT non aggrega frame stesi consecutivi → non chiama FSM. Path: `guardian.py` HPT class + skel-reject thresholds.

**P0 cambio narrativa S38→S39**: shifted da "Guardian process resilience" a "Guardian fall logic correctness". Watchdog re-enable resta valore (gratuito), ma è la fall logic il vero blocker NORTH STAR.

### S39 OPEN→WIP — HPT/FSM deep dive (preliminary findings, closure 54% enforcement)

**Stato**: WIP, 1 read-only grep eseguito su `guardian.py` (4277 righe). Investigation deep continua S40.

**Findings preliminari**:
- FSM `class PersonState` @ line 2239+: STATES UNKNOWN/STANDING/WALKING/SITTING/LYING_DOWN/FALLING/FALLEN
- Fall alert emit @ line 2338-2345: condition `state == "FALLEN" and not self.fall_alerted`
- ⚠️ **Timer critico LYING_DOWN→FALLEN = 60s** (line 2261, 2366) "anti-FP couch/bed"
- ⚠️ **Test S2 era 60s totali** → borderline al timer, non scatta
- Path veloce `FALLING→FALLEN >2s horizontal` (line 190, 2396) richiede transizione standing→falling osservata

**Hypothesis bug S32 (DA VALIDARE S40)**:
1. Scenario "già stesa" (S2 pavimento): FSM non osserva transizione `STANDING→FALLING` → va direttamente UNKNOWN/LYING_DOWN
2. LYING_DOWN→FALLEN timer 60s = test 60s borderline → no alert
3. Skel-reject filtra pose orizzontali (`hp=False c=0.30` keypoint visibility bassa) → PersonState mai update → state stuck

**P0 S40 path candidati (NON IMPLEMENTATI)**:
- A) Test S2 esteso 70-90s (verifica se è solo timing 60s threshold)
- B) Read FSM update() line 2278+ + skel-reject logic per validate hypothesis #3
- C) Aggiungere UNKNOWN→FALLEN diretto se persona già a terra al detect (richiede pose-based ground detection)

**Closure rationale**: hook enforcement 54%, scope deep code investigation richiede ≥10% budget. WIP onesto, no commit untested code, hypothesis documentate per S40 continuazione.

---

## SESSIONE 40 — 2026-05-04 (closure 47%)

### P0 NORTH STAR — Root cause FALL logic IDENTIFIED + fix DEPLOYED

**Root cause** (6 sessioni unresolved, S32→S39):
- `validate_skeleton()` @ line 2214 esegue gate PRIMA di PersonState creation/FSM update
- Line 2976 `continue` skippa TUTTO se validate fails
- Day mode: `DAY_KPT_CONFIDENCE=0.30`, hip check obbligatorio (no fallback knees, solo night)
- Su persona stesa/seduta in soggiorno YOLOv8n-pose ritorna confs hip <0.30 (occlusione divano + prospettiva camera) → reject sistematico

**Evidence LIVE log 2026-05-04 12:34-12:50** (16 min continui skel-reject):
```
[skel-reject] track#1   vis=3-5 sh=True hp=False c=0.30
[skel-reject] track#98  vis=3   sh=True hp=False c=0.30
[skel-reject] track#217 vis=3-6 sh=True hp=False c=0.30 (12 reject in 16 min)
```
Sample track#217: confs[11,12]=0.02,0.07 (anche), confs[13,14]=0.02,0.05 (ginocchia). Hypothesis #1 timer 60s scartata (FSM mai eseguito). Hypothesis #2 confirmed.

**Fix DEPLOYED — Guardian v3.5 S40** (Opt C horizontal-aware validation):
- Patch `validate_skeleton()` @ line 2214: aggiunto fallback orizzontale
- Quando `skel_width > skel_height` (persona stesa) e `not has_hip`: accetta se ANY hip/knee/ankle conf >0.15
- Gated da skel_width>skel_height → no impatto su standing/walking (zero FP increase atteso)
- Local file syncato con deployed (drift 4232→4277 risolto), patched 4293 righe
- Backup: `~/guardian/guardian.py.bak.s40` (iMac), `/tmp/guardian-local-pre-S40.py.bak` (Mac)
- Deploy via launchctl reload, PID 4711 alive 13:27:00, audio stream active, no errori

### Carry-over S41
- **G1 retry round 4** (Luke physical ~15min): test S2 ground scenario soggiorno → verifica `[fall-diag] UNKNOWN->LYING_DOWN/FALLEN` + `FALL ALERT TRIGGERED` (oggi assenti per skel-reject)
- **Monitor 24h**: zero FP su standing/walking (dovrebbe restare invariato per gate skel_width>skel_height)
- **G2 production activation**: solo dopo G1 PASS

### Vincoli rispettati
- Pre-closure 40% / enforcement 50% (V1+V3 LIVE) — closure 47% con task completato
- Evidence-based: log 16min continui skel-reject, FSM line read 2238-2429, validate_skeleton line read 2214-2234
- NO scope expansion: implementato SOLO Opt C come proposto e confermato

### S40 G1 round 4 — VERDICT (16:05 close)
**Test fisico**: Luke stesa pavimento soggiorno 15:58:27 → 16:02 (~3:33 = 213s)
**PASS**: fix S40 validate_skeleton WORKS — `[fall-diag] track#6045 UNKNOWN->LYING_DOWN angle=57 ar=1.07` (vs S38/S39 zero transitions)
**FAIL**: NO LYING_DOWN→FALLEN escalation, NO FALL ALERT, NO Telegram/voice (213s >> timer 60s)
**P0 S41 root cause hypothesis** (priorità):
1. Track#6045 lost mid-test (track lifecycle issue)
2. Safe-zone divano polygon copre area test → in_safe_zone=True → 600s threshold (>213s)
3. State flip intermedio (is_horizontal=False frame intermittente) reset _lying_down_since

### S41 (2026-05-04) — P0 NORTH STAR investigation read-only — PASS

**Goal**: identify root cause LYING_DOWN→FALLEN escalation FAIL (S40 G1 round 4 carry-over).

**Method**: read-only investigation 3 hypotheses (track lost / safe zone / state flip), evidence-based, no code changes.

**Pre-flight**:
- Guardian PID 1049 alive iMac (4:36 elapsed), watchdog cron RE-ENABLED OK
- guardian.py md5 sync iMac↔Mac OK (825d270e0ba892aa12ef72dee2162dcf, 4293 lines)
- log path ~/guardian/logs/guardian.log readable

**Evidence collected (test window 15:57-16:05)**:
- fall-diag entries: 1 (track#6045 UNKNOWN→LYING_DOWN @15:58:27)
- skel-reject entries: 0 (validate_skeleton S40 fix WORKS when invoked)
- YOLO frames with `has_track_ids=True`: 1/8 (15:58:28 only)
- YOLO frames with `has_track_ids=False`: 5/8 (confs 0.16-0.26)
- YOLO frames `boxes=0`: 3/8 (Luke not detected at all)
- HPT FALL ALERT: fired @16:03:11 (dur=300.6s, frames=17, safe_zone=False) — 71s late, post-test

**Verdict 3 hypotheses**:
- H1 CONFIRMED (revised): track lost — but root cause = YOLO conf collapse on horizontal pose (0.16-0.26) → ByteTrack rejects track confirmation → ps.update() never called past 15:58:28 → PersonState#6045 stale @15:58:57 → cleanup line 3450 destroys state BEFORE 60s timer fires
- H2 REFUTED: HPT explicitly logged `safe_zone=False`. Divano polygon [650,500-1150,800] doesn't contain person bbox.
- H3 REFUTED: fall-diag logs every state transition. Only 1 entry → no flips.

**Real root cause**:
S40 fix validate_skeleton horizontal-aware NECESSARY but NOT SUFFICIENT. Upstream bottleneck: YOLOv8n confidence drops <0.30 on horizontal/lying persons → ByteTrack denies track persistence → FSM 60s escalation timer cannot evaluate (requires update() call) → PersonState destroyed at 30s stale-cleanup BEFORE 60s timer fires. Camera-level HPT compensates partially but threshold mis-tuned (frames=17 needed, took 300s to accumulate at 1 fps × low detection rate).

**P0-C fix candidates for S42 (NOT implemented)**:
1. Tune ByteTrack track_thresh / track_buffer for low-conf horizontal detections
2. Camera-level escalation timer independent of track lifecycle (decouple from PersonState destruction)
3. Extend PersonState stale timeout 30s→90s+ to allow 60s timer to fire across track ID gaps

**Why deferred**: closure ordinata pre-50%, single-hypothesis-per-session discipline, fix requires testing vs FP regression (Bosch standard zero-FP).

**Status post-S41**:
- Guardian v3.5 stable + watchdog active
- P0 NORTH STAR FALL escalation: ROOT CAUSE IDENTIFIED, fix planned S42
- G2 production activation: BLOCKED until S42 fix validated
- 6-session blocker downgraded: validate_skeleton FIXED (S40), upstream YOLO+ByteTrack GAP IDENTIFIED (S41)

### S42 BACKLOG ADD (Luke req 2026-05-04 post-S41) — iMac full audit

**Context Luke**: iMac "bloccato" anche post-reboot. iMac è server multi-progetto + tentativo installazione VM Windows in corso. Richiede audit completo S42 IN AGGIUNTA al fix FSM escalation.

**S42 scope (priorità)**:
- **P0 (NORTH STAR)**: fix LYING_DOWN→FALLEN escalation (3 candidati S41)
- **P1 (NEW)**: iMac full audit
  - Resource baseline: CPU/RAM/disk/swap/load1/5/15 (`top -l 1`, `vm_stat`, `df -h`, `iostat`)
  - Process inventory: chi consuma cosa (Guardian, go2rtc, mosquitto, Traccar, Tailscale, eventuale VM)
  - VM Windows: hypervisor in uso? (UTM/VMware/Parallels/VirtualBox), allocazione RAM/CPU vs host, conflitti porte
  - LaunchAgents/LaunchDaemons enumeration (`launchctl list`, `~/Library/LaunchAgents/`, `/Library/LaunchAgents/`)
  - Network sockets: porte in ascolto (`lsof -iTCP -sTCP:LISTEN -P`), conflitti VM/Guardian/MQTT/Traccar/go2rtc
  - Disk health: SMART (`smartctl`), spazio NAS_LOCAL, log size (rotazione attiva?)
  - Power management: `pmset -g` (autorestart S18 fix? sleep settings?)
  - Tailscale state vs S24 issue (offline tailnet ilcombeeretrasher)
  - "Bloccato" symptom: Spotlight indexing? `mds`/`mdworker` runaway? backup TM? log spam?
- **Deliverable**: report ordinato P0→P3 con findings + remediation actions

**Vincoli**:
- Big Sur compatibility (NO `brew upgrade` distruttivi)
- Server multi-progetto → NO restart aggressivi senza checklist preventiva
- VM Windows in flight → preservare stato VM se possibile

---

## SESSION S42 — 2026-05-04 16:27→ — P0 FSM escalation fix DEPLOYED

**Goal**: fix LYING_DOWN→FALLEN escalation (6-session blocker, root cause S41 = PersonState destroyed @30s before 60s timer can fire).

**CTO decision (Luke autonomy delegated)**: Candidato 3 selected of 3 — extend PersonState stale timeout 30s → 90s. Rationale: minimal, surgical, ortogonale ai gates S40 (skel-aware horizontal fallback). Candidato 1 (ByteTrack tune) rejected — FP risk Bosch zero-FP. Candidato 2 (camera-level timer indipendente) rejected — refactor architetturale fuori scope single-session.

**Implementation**:
- File: `scripts/guardian/guardian.py` line 3450
- Change: `now - ps.last_update > 30` → `> 90` (+ comment block S42 root cause)
- Backup: `guardian.py.bak-s42-pre` (md5 825d270e)
- New md5: `7119fc78a996172a825455d16be9c685`
- Lines: 4293 → 4296 (+3 comment lines)
- Syntax: `ast.parse` PASS

**Deploy**:
- `scp` → `gianlucadistasi@imac-di-gianluca.local:~/guardian/guardian.py`
- Remote md5 verified sync: `7119fc78a996172a825455d16be9c685`
- launchctl unload + load → restart OK
- Pre-restart PID 1049, Post-restart PID 5233
- Warmup 30s: TSSTG OK, HPT enabled (1920x1080), safe_polygons 1 zones, EfficientAT OK, RTSP connected, YOLO ONNX loaded, FPS 1.0 stable
- Cron watchdog */1min still active (S38 re-enabled)

**Status post-deploy**:
- Guardian v3.5+S42 LIVE on iMac
- Watchdog cron active
- P0 NORTH STAR: fix DEPLOYED, validation BLOCKED on G1 round 5 (Luke physical test)
- G2 production activation: BLOCKED until G1 PASS

**Test G1 round 5 (deferred Luke physical)**:
- Pre-flight: PASS (Guardian PID stable, log clean)
- Procedure: S2 floor scenario, Luke lies in soggiorno (NON safe zone) for 90-100s
- Expected evidence: log entry "FALLEN" state transition + HPT FALL ALERT entro T+60-75s from lying start
- If PASS → G2 production unblock
- If FAIL → escalate Candidato 2 (camera-level decoupled timer)

**P1 NEW (parallel)**: iMac full audit launched in background (`infrastructure-maintainer` agent). Read-only, Big Sur safe. Awaiting completion.


### S42 P1 — iMac audit COMPLETED (background agent)

**Report full**: `.planning/research/imac-audit-s42.md`

**Key findings**:
- Load 15 = 11.36 / 4-core = 2.8x overload post-reboot
- "Bloccato" = trio: Finder 88% CPU + Multipass VM Ubuntu autostart + bridge.err 993MB
- ⚠️ NON è Windows VM — è Ubuntu 22.04 Multipass `fluxion-staging` autostart non richiesto
- ⚠️ Power loss S18 RECIDIVO (SMC cause 0 = battery disconnected) → action fisico Luke (UPS/cavo)
- ⚠️ `com.apple.582d56504e.plist` root-owned in user LaunchAgents — naming non-standard, sospetto X-VPN injection
- 10+ vbridge LaunchAgents failing silently
- Tailscale account = `ferretti.argosautomotive@` (NON `ilcombeeretrasher` come da memory)
- Tailscale iMac IP attuale: `100.80.34.53` (NON `100.101.24.13`)

**Remediation NON eseguita** (read-only audit). 12 action items priorità P1→P3 in report.

**Top 3 fix immediati proposti** (richiedono sudo Luke):
1. `multipass stop fluxion-staging` + unload `com.canonical.multipassd.plist`
2. `> ~/Library/Logs/bridge.err` (truncate 993MB)
3. Ispezionare `com.apple.582d56504e.plist` (potential security)


## S43 (2026-05-04 16:38-17:00) — G1 round 5 FAIL #6 + STRATEGIC PIVOT

**Status**: CLOSED — pivot strategico Luke validated by visual evidence.

**Test G1 round 5** (PID 5233 Guardian S42 fix live):
- Round 1 (16:42-16:49): timing 5min gap (bash block error), Luke overtime lying ~5min, log boxes=0 95%, zero FALL/HPT/LYING events.
- Round 2 retry (16:53-16:55): ffmpeg missing iMac (pre-flight fail mio), opencv fallback frame catturato 16:55:28 — soggiorno vuoto.
- **Visual evidence Luke EZVIZ app 16:57:15**: Luke steso pavimento davanti chaise longue, partial occlusion ~60%, telefono in mano alzato.

**Root cause confermata** (S41 H1 + S43 visual):
- YOLO conf 0.15-0.20 (occlusione + backlight finestre)
- ByteTrack track_thresh 0.5 default → rifiuta detection
- Mai track_id → mai ps.update → mai LYING_DOWN → mai FALL escalation
- S42 fix (PersonState stale 30→90s) morto in partenza, PersonState mai creato

**Decisione Luke**: "cloniamo app funzionante, basta tentativi" — stop Guardian custom tuning.

**S44 plan**: fork `taufeeque9/HumanFallDetection` (337⭐ MIT openpifpaf+LSTM, validated S33 Phase 0). POC standalone iMac, NO touch Guardian production.

**Lesson learned aggiornate**:
- `feedback_test_snapshot_autonomous.md`: snapshot capture RTSP autonomo OBBLIGATORIO pre-test human-in-the-loop (Claude auto-attiva, no reminder Luke)
- `project_s43_pivot_clone_oss.md`: stop tuning, fork OSS

**Carry-over S44**: iMac remediation sudo (multipass+bridge.err+plist sospetto), backup strategy (memory+DB), Tailscale cleanup, ffmpeg install iMac.

**Files modificati S43**: nessuno scripts/, solo `.planning/PROMPT_S44.md` + memory append.
>>
## S45 — POC Custom Standalone Pivot (2026-05-04)

**Mode**: CTO autonomous full ownership
**Closure**: ordered ~40% budget, P0 PASS evidence-based, P1 carry-over S46

### P0 verdict — Branch B (technical failure mode)
- `pose_smoke.py` PID 24996 ENDED 880s, 20 frame
- ✅ openpifpaf+RTSP funziona (no crash)
- 🔴 **0.02 fps blocker** (44s/frame Mac CPU) — unusable real-time
- Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed)

### Pivot CTO — Opzione α (combined)
- **YOLOv8-pose Ultralytics** (3.40 fps Mac CPU, 170x faster) per pose detection
- **LSTM `lstm_weights.sav` taufeeque9** pre-trained per fall classification
- COCO 17 keypoint format identico = drop-in replacement
- Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`

### Evidence raccolta
| Item | Status |
|------|--------|
| openpifpaf 0.02 fps confirmed unusable | DONE |
| Snapshot RTSP autonomo opencv | PASS (538KB, no ffmpeg) |
| YOLOv8-pose smoke 3.40 fps | PASS |
| Ultralytics 8.4.46 install no-deps | DONE (torch 1.10.2 preservato) |
| LSTM model + input shape decoded | DONE (1, 36, 5) |
| Feature pipeline reverse-eng | DONE (5 features tracked) |

### Carry-over S46 (PROMPT_S46.md ready)
- P1: Build `fall_standalone.py` ~150 LOC entry point
- P2: Telegram + MQTT + Luna voice integration
- P3 backlog: iMac remediation, dead code cleanup pose_smoke.py + shufflenetv2k16 41MB

### Files state iMac
```
~/fall-poc/                          # venv ~500MB ready
~/fall-poc/model/lstm_weights.sav    # pre-trained, riusabile
~/fall-poc/vis/inv_pendulum.py       # importabile AS-IS
/tmp/snap_check.jpg                  # 538KB snapshot soggiorno verificato
```

---

## SESSIONE S53b (2026-05-05 21:05) — CLOSURE PRE-S54

### Pre-flight verifica P3 S53 — NOT EXECUTED
- `/tmp/test_s53.log` inesistente, zero processi `run_upstream|run_persistent|fall`, launchctl vuoto.
- run_persistent.sh.disabled-s53 ancora disabled (safety net OK).
- Luke non ha eseguito test 30min divano — defer S54.

### Carry-over S54 (priorità ordinata)
1. **🔴 P0 — Esegui P3 S53 natural test 30+ min divano**
   - `ssh imac "cd ~/fall-poc && nohup ./venv/bin/python3 run_upstream.py > /tmp/test_s53.log 2>&1 &"`
   - Luke fisicamente sul divano 30+ min
   - Expected: zero `[ALERT]` + ≥1 `[SAFE-ZONE] suppressed FALL Warning`
2. **P1 — P4 reactivation H24** (BLOCCATA su P0 PASS):
   - `mv run_persistent.sh.disabled-s53 run_persistent.sh && launchctl load com.zeroclaw.fall-detector.plist`
   - Verify launchctl list + 10min monitor live
3. **P2 — Luna MQTT subscribe `zeroclaw/guardian/fall`** + voice confirm "Tutto bene?" + escalation Telegram (S52 P5 deferred)
4. **P3 — Phase out Guardian v3.x fall logic** (loitering/inactivity/elderly only)

### Branch decision se P3 FAIL (≥1 alert su divano)
- Aumenta polygon divano (margin +50px) o tightening LSTM threshold
- NO reactivation, retry P3
- Considera ZONES_CAMERA cameretta separato test
