# PROMPT_S44 — Fork taufeeque9/HumanFallDetection POC

## CONTEXT
S43 closed: G1 round 5 retry FAIL (FAIL #6 di 6 sessioni). Evidenza visiva incontrovertibile (EZVIZ frame + Claude visual confirm 16:57:15): Luke steso pavimento davanti chaise longue, YOLO conf 0.15-0.20, ByteTrack track_thresh 0.5 lo rifiuta, mai PersonState update.

**Luke explicit decision** (S43): "cloniamo app funzionante, basta tentativi" → stop Guardian custom tuning, fork OSS validato.

## P0 — Clone + POC standalone (single hypothesis)
**Repo**: `taufeeque9/HumanFallDetection` (337⭐ MIT, openpifpaf + LSTM, validated S33 Phase 0)

**Procedure** (iMac):
1. `git clone https://github.com/taufeeque9/HumanFallDetection.git ~/fall-poc`
2. `cd ~/fall-poc && python3 -m venv venv && source venv/bin/activate`
3. `pip install -r requirements.txt` (openpifpaf, torch, opencv)
4. Verify Big Sur compatibility (PyTorch CPU mode, NO CUDA — iMac Intel)
5. Smoke test: feed sample video o RTSP `rtsp://127.0.0.1:8554/soggiorno`
6. Live test: Luke fisicamente steso pavimento behind chaise (replicate S43 scenario)

**PASS criteria**:
- POC detecta FALL su Luke entro 60-90s lying
- Output console o log identifica chiaramente trigger
- NO touch Guardian production (PID 5233 stays up)

## P1 — Integration plan (only if P0 PASS)
- Telegram alerting reuse (`scripts/telegram-alert.sh`)
- Luna voice confirm reuse (Guardian MQTT bridge)
- Safe-zone polygon import da `~/guardian/zones.json`
- Decide: POC standalone parallel a Guardian OPPURE rimpiazza Guardian fall logic

## P2 — Carry-over S43
- iMac remediation P1 (multipass stop, bridge.err truncate, com.apple.582d56504e.plist audit) — sudo Luke
- Backup strategy P2 (memory + Guardian DB) — gap S42
- Tailscale memory cleanup (project_s24_findings.md, ADR 006)
- ffmpeg install iMac (S43 lesson — pre-flight checklist)

## Pre-flight checklist S44 (lessons S43)
- [ ] ffmpeg installato iMac (`which ffmpeg`)
- [ ] Snapshot capture autonomo via opencv (NO ffmpeg dependency)
- [ ] Marker visivo posizione test (chiarire angolo soggiorno)
- [ ] Single-hypothesis-per-session enforced
- [ ] Context budget 40/50% threshold attivo

## Files chiave
- `.planning/research/GUARDIAN-ECOSYSTEM-RESEARCH.md` (taufeeque9 entry)
- `.planning/ROADMAP-v4.md` (Strada A+ ibrida)
- Memory: `project_s33_findings.md`, `project_s43_pivot_clone_oss.md`, `feedback_test_snapshot_autonomous.md`
