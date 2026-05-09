# PROMPT_S47 — Luke physical test fall_standalone.py

## CONTEXT
S46 closure 43%: fall_standalone.py deployato `~/fall-poc/fall_standalone.py`, idle smoke 30s PASS (100 frame 3.31 fps, zero FP, stanza vuota). Stack YOLOv8n-pose + LSTM stateful taufeeque9 (h_RNN=48, num_classes=7) operativo.

## P0 — Pre-flight (5 min, lessons S43+S46)
- [ ] Telegram creds iMac: `cat ~/envs/telegram.env` → se assente, deploy con `BOT_TOKEN`/`CHAT_ID=931063621` da phone Luke
- [ ] Snapshot autonomo OK già integrato (ogni 5s in `/tmp/fall-poc/snap-*.jpg`)
- [ ] Marker visivo angolo soggiorno (Luke conferma fisico)
- [ ] Verifica RTSP go2rtc up: `lsof -iTCP:8554 -sTCP:LISTEN | head -3`

## P1 — Test idle persona seduta divano (30s, FP suppression)
```bash
ssh gianlucadistasi@imac-di-gianluca.local 'cd ~/fall-poc && \
  TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=931063621 \
  ~/fall-poc/venv/bin/python3 fall_standalone.py \
  --rtsp rtsp://127.0.0.1:8554/soggiorno --duration 30 2>&1 | tee /tmp/fall-poc/test-divano.log'
```
- Luke seduto divano statico 30s
- Expect: tracking ID stabile (no churn), NO FALL trigger, log `pred=` ∈ {1,2,3,5,7}

## P2 — Luke physical FALL test pavimento (90s)
- Luke entra soggiorno → stendersi pavimento (NON divano) → resta a terra 60s
- Expect: entro 7-15s da posizione orizzontale → log `🚨 FALL pid=X` + snapshot `FALL-*.jpg` + Telegram alert
- Verifica post: `ls -lh /tmp/fall-poc/FALL-*.jpg` + `cat /tmp/fall-poc/alerts.jsonl`

## P3 — Hardening (se P2 PASS)
- [ ] Safe-zone polygon import `~/guardian/zones.json` (chaise/divano = NO_FALL)
- [ ] MQTT publish `zeroclaw/guardian/fall` (Luna alert handler integration)
- [ ] Decisione architetturale: POC parallel a Guardian (OR logic) o replace fall_logic Guardian
- [ ] Service plist `~/Library/LaunchAgents/com.fall-poc.plist` per autostart

## P3.5 — Tuning candidates (se P2 FAIL)
- Relax `is_valid` da (H+N+B) a (N or B) — head occluso pose orizzontale
- TRACK_DIST_PX 150 → 200/250 (Luke fast movement)
- FALL_STREAK_TRIGGER 9 → 6 (più sensibile)
- Conf threshold 0.4 → 0.3
- Logging extra: dump per-frame keypoint conf vector

## Carry-over backlog (P4)
- iMac Multipass stop, bridge.err truncate, com.apple.582d56504e.plist audit (sudo Luke)
- ffmpeg install iMac
- Dead code cleanup: pose_smoke.py + shufflenetv2k16 41MB
- Tailscale memory cleanup (ADR 006)
- Cron watchdog Guardian re-enabled S38, monitorare 7gg

## Memory reference
- `project_s46_findings.md` — POC build evidence
- `project_s45_findings.md` — pivot rationale Opzione α
- `feedback_test_human_loop_delivery.md` — Telegram visivo, snapshot capture
- `feedback_pre_flight_human_test.md` — upstream sanity check obbligatorio

## Entry command S47
```bash
cat ~/envs/telegram.env 2>/dev/null && echo "---" && lsof -iTCP:8554 -sTCP:LISTEN | head -3 && ls -la /tmp/fall-poc/
```
