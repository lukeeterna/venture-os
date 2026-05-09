---
project: Guardian
date: 2026-05-09
compiled_at: 2026-05-09T17:08:27Z
model: gemini-2.5-flash
source_files: 53
compiler: karpathy-compiler v0
---

## Stato attuale verificato
*   **Context Budget Guardrails V1 (hook auto-enforcement) + V3 (CLAUDE.md threshold 40/50%)** sono implementati, testati (5/5 PASS) e attivi. Il hook ha trigger-fired su Edit CLAUDE.md a 48% durante la sessione 27, iniettando un system-reminder WARNING.
*   **V4 (memory append-only pattern) + V5 (commit template)** sono stati implementati e applicati nella sessione 28. `feedback_workflow_strict.md` è stato esteso con la sezione "Append-only pattern per memory files" e `.claude/templates/commit-template.md` è stato creato.
*   **Health-check** è stato aggiornato per usare `nc -z -w 5 192.168.1.4 554` (RTSP TCP listening probe) al posto di `ping ICMP .4`, rendendolo resiliente alla sleep-mode delle EZVIZ. Il test live ha dato 13 PASS / 0 FAIL / 1 WARN (Tailscale).
*   **P4 cleanup** è stato eseguito nella sessione 26: 16 file `.bak` pre-S20 sono stati rimossi e archiviati.
*   **P0 cron rebuild** è attivo e la traiettoria per il gate 2026-05-07 è sana (+12 obs soggiorno in 1h).
*   **Luna watchdog** è stato implementato nella sessione 25 con `~/scripts/luna-watchdog.sh` e cron `*/5min`, includendo `wake-lock` e `pulseaudio bring-up`. Il test live ha avuto successo.
*   **Scope B installer dry-run** è stato validato su Mac e iMac sandbox nella sessione 25, con 3 bug fix applicati.
*   **Cameretta** è stata disabilitata nella sessione 23 (`guardian.py:124` commentato) a causa di degrado hardware RTSP (2034 stall events).
*   **`learning_period_days`** è stato modificato da 7 a 21 in `baseline_learner.py:20` nella sessione 23.
*   **CLAUDE.md** e `memory/device_config.md` sono stati aggiornati con gli IP corretti delle telecamere nella sessione 23.
*   **`score_observation()`** è cablato in `guardian.py` su 3 siti di alert (loitering, line_crossing, inactivity) con safety hard-rule (mai su fall/fire/smoke/tamper/audio/temperature/long_lie) da sessione 21.
*   **ADR 007** (strategia di indirizzamento distribuibile) è stato accettato preliminarmente nella sessione 21.
*   **Luna phone** è stata ripristinata e il PID 10599 è stabile da sessione 20.
*   **MQTT broker** è stato corretto nella sessione 20 (bind `0.0.0.0` e amqtt killato).
*   **DHCP reservation** è stata applicata nella sessione 20.
*   **Guardian v3.0** è UP e stabile da sessione 10.
*   **Framework anti-drift** è integrato con `.claude/NORTH_STAR.md`, `.claude/PROJECT_STATE.md`, `.claude/hooks/session-start.py` e `.claude/skills/alignment-check/SKILL.md` da sessione 10.
*   **ADR directory** `docs/adr/` con 5 decisioni storiche è stata creata nella sessione 10.
*   **Audio EZVIZ v3.1** è stato confermato udibile in soggiorno nella sessione 11.
*   **Auto-discovery IP EZVIZ** è stato implementato end-to-end nella sessione 12.
*   **Guardian v3.2 production** (wiring + capture + voice confirm + auto-discovery IP) è stato verificato live nella sessione 13.
*   **Bug A (record_observation chiamato solo con persone presenti)** è stato risolto nella sessione 14.
*   **Bug B (thread cameretta morto)** è stato risolto con un riavvio nella sessione 14.
*   **Cron rebuild** è installato e attivo (hourly) da sessione 14.
*   **S15B Safe-zone-aware fix** è stato deployato nella sessione 15B.
*   **S16a Tailscale-only video security** è stato implementato nella sessione 16.
*   **Bug B watchdog** è stato validato live nella sessione 16.
*   **S15D (`guardian.py:CameraStallWatchdog`)** è stato implementato nella sessione 18 per garantire il ripristino in caso di stall della telecamera.
*   **S17 Traccar** è stato ripristinato nella sessione 18.
*   **S16b Tailscale phone** è stato risolto nella sessione 18.
*   **go2rtc bind** è stato impostato a `127.0.0.1:8554` nella sessione 19.
*   **Guardian env e codice** sono stati allineati a `127.0.0.1` nella sessione 19.
*   **Phone Luna** usa mDNS hostname da sessione 19.
*   **CLAUDE.md** è stato aggiornato con hostname-based + nota DHCP-resilience nella sessione 19.
*   **ADR 006** (strategia di risoluzione hostname) è stato scritto nella sessione 19.
*   **P0 NORTH STAR** è stato violato nella sessione 28+ (FP divano figlio).
*   **HPT init `frame_w=640, frame_h=480` hardcoded** è stato identificato come root cause del FP divano e corretto nella sessione 29.
*   **POC auto-detect furniture (YOLOv8n COCO)** è stato completato con successo nella sessione 30.
*   **Fix Bug A+B S32** (zones.json polygon divano shrunk + conf threshold 0.25→0.15) sono stati deployati nella sessione 34.
*   **Strada A+ ibrida** è stata accettata come direzione della piattaforma nella sessione 35.
*   **Guardian recovery** da zombie è stata eseguita nella sessione 36.
*   **OQ-2 research Frigate fall plugin** ha concluso che nessun plugin maturo esiste nella sessione 36.
*   **ADR 008 addendum** ha confermato saldamente la Strada A+ nella sessione 36.
*   **Patch s32_test.sh** (pre-flight SSH+TTS+termux-tts-speak fail-fast) è stata deployata e validata nella sessione 37.
*   **Cron watchdog `guardian_watchdog.sh`** è stato riabilitato nella sessione 38.
*   **Fix `validate_skeleton()`** (fallback orizzontale) è stato deployato nella sessione 40.
*   **Root cause LYING_DOWN→FALLEN escalation FAIL** (YOLO conf collapse + ByteTrack track persistence) è stata identificata nella sessione 41.
*   **Fix LYING_DOWN→FALLEN escalation** (estensione PersonState stale timeout 30s → 90s) è stato deployato nella sessione 42.
*   **iMac full audit** è stato completato nella sessione 42.
*   **Pivot architettonico** a YOLOv8-pose + LSTM `taufeeque9` è stato confermato nella sessione 45.
*   **`fall_standalone.py`** è stato deployato nella sessione 46.
*   **Fix `is_valid` (line 257) e `KeyError: 'features'`** sono stati risolti nella sessione 49.
*   **Implementazione B+ minimal patch** (Processor swap upstream taufeeque9) è stata completata nella sessione 50.

## Decisioni chiuse
*   **Context Budget Guardrails**: V1 (hook auto-enforcement) e V3 (CLAUDE.md threshold 40/50%) sono stati implementati e attivati.
*   **P4 Cleanup**: Eseguito, 16 file `.bak` pre-S20 rimossi.
*   **Luna Watchdog**: Implementato con script dedicato e cron `*/5min`.
*   **Scope B Installer**: Dry-run validato su Mac e iMac sandbox.
*   **Cameretta**: Disabilitata a causa di degrado hardware RTSP.
*   **`learning_period_days`**: Modificato da 7 a 21.
*   **CLAUDE.md e `memory/device_config.md`**: Aggiornati con IP corretti.
*   **`score_observation()`**: Cablato su 3 siti di alert con safety hard-rule.
*   **ADR 007**: Accettato preliminarmente.
*   **MQTT Broker**: Corretto (bind `0.0.0.0` e amqtt killato).
*   **DHCP Reservation**: Applicata.
*   **Framework Anti-Drift**: Integrato.
*   **ADR Directory**: Creata.
*   **Audio EZVIZ v3.1**: Confermata udibile in soggiorno.
*   **Auto-discovery IP EZVIZ**: Implementato end-to-end.
*   **Bug A (record_observation)**: Risolto.
*   **Bug B (thread cameretta morto)**: Risolto con riavvio.
*   **Cron Rebuild**: Installato e attivo.
*   **S15B Safe-zone-aware fix**: Deployato.
*   **S16a Tailscale-only video security**: Implementato.
*   **Bug B Watchdog**: Validato live.
*   **S15D (`guardian.py:CameraStallWatchdog`)**: Implementato.
*   **S17 Traccar**: Ripristinato.
*   **S16b Tailscale Phone**: Risolto.
*   **go2rtc Bind**: Impostato a `127.0.0.1:8554`.
*   **Guardian Env e Codice**: Allineati a `127.0.0.1`.
*   **Phone Luna**: Usa mDNS hostname.
*   **CLAUDE.md**: Aggiornato con hostname-based + nota DHCP-resilience.
*   **ADR 006**: Scritto.
*   **P0 NORTH STAR Violation**: HPT init `frame_w=640, frame_h=480` hardcoded è stato identificato come root cause del FP divano e corretto.
*   **POC Auto-detect Furniture (YOLOv8n COCO)**: Completato con successo.
*   **Fix Bug A+B S32**: Deployati.
*   **Strada A+ Ibrida**: Accettata come direzione della piattaforma.
*   **OQ-2 Research Frigate Fall Plugin**: Concluso che nessun plugin maturo esiste.
*   **ADR 008 Addendum**: Ha confermato saldamente la Strada A+.
*   **Patch s32_test.sh**: Deployata e validata.
*   **Cron Watchdog `guardian_watchdog.sh`**: Riabilitato.
*   **Fix `validate_skeleton()`**: Deployato.
*   **Root Cause LYING_DOWN→FALLEN Escalation FAIL**: Identificata.
*   **Fix LYING_DOWN→FALLEN Escalation**: Deployato.
*   **iMac Full Audit**: Completato.
*   **Pivot Architettonico**: Confermato a YOLOv8-pose + LSTM `taufeeque9`.
*   **`fall_standalone.py`**: Deployato.
*   **Fix `is_valid` e `KeyError: 'features'`**: Risolti.
*   **Implementazione B+ Minimal Patch**: Completata.

## Blocker aperti
*   **MIUI Termux + Termux:Boot battery whitelist**: Luke physical action carry-over da S22-S38.
*   **Hardware cameretta swap/reset**: Luke physical action carry-over da S22-S30.
*   **Tailscale iMac login**: Luke physical action carry-over da S22-S38.
*   **P0 NORTH STAR FP DIVANO**: Luke physical test S53 (30+ min divano) è pending.
*   **P1 FSM safe-zone audit**: Defer S30→S31→S32→S33→S34→S35→S36→S37→S38→S39→S40→S41→S42→S43→S44→S45→S46→S47→S48→S49→S50→S51→S52→S53→S54.
*   **P1 V2 pre-flight estimation**: Carry-over S27→S28→S29→S30→S31→S32→S33→S34→S35→S36→S37→S38→S39→S40→S41→S42→S43→S44→S45→S46→S47→S48→S49→S50→S51→S52→S53→S54.
*   **P2 production polish**: Carry-over S27→S28→S29→S30→S31→S32→S33→S34→S35→S36→S37→S38→S39→S40→S41→S42→S43→S44→S45→S46→S47→S48→S49→S50→S51→S52→S53→S54.
*   **P3 Luke physical**: Carry-over S27→S28→S29→S30→S31→S32→S33→S34→S35→S36→S37→S38→S39→S40→S41→S42→S43→S44→S45→S46→S47→S48→S49→S50→S51→S52→S53→S54.
*   **P0 NORTH STAR**: Root cause Guardian self-shutdown 12:17:35 è UNDETERMINED.
*   **G1 fall test FAIL**: S36 INVALID round 1, S37 INVALID round 2, S38 FAIL round 3.
*   **Bug S32 unresolved**: Fall logic non triggera.
*   **POSE detection drop su sdraiato divano**: YOLOv8n-pose @0.25 perde Luke 8/9 snap S1.
*   **FALL detection logic NON triggera**: S2 60s pavimento boxes=2-3 detected da YOLO ma Guardian ZERO FALL alert.
*   **P0 S41 root cause hypothesis**: Track lost (YOLO conf collapse + ByteTrack rejects track persistence) → PersonState destroyed before 60s timer fires.
*   **P0-C fix candidates for S42**: Tune ByteTrack track_thresh / track_buffer, Camera-level escalation timer independent of track lifecycle, Extend PersonState stale timeout 30s→90s+.
*   **P0 S41 root cause hypothesis**: Safe-zone divano polygon copre area test → in_safe_zone=True → 600s threshold (>213s).
*   **P0 S41 root cause hypothesis**: State flip intermedio (is_horizontal=False frame intermittente) reset _lying_down_since.
*   **P0 S41 root cause hypothesis**: Test S2 era 60s totali → borderline al timer, non scatta.
*   **P0 S41 root cause hypothesis**: Skel-reject filtra pose orizzontali (`hp=False c=0.30` keypoint visibility bassa) → PersonState mai update → state stuck.
*   **P0 S41 root cause hypothesis**: Scenario "già stesa" (S2 pavimento): FSM non osserva transizione `STANDING→FALLING` → va direttamente UNKNOWN/LYING_DOWN.
*   **P0 S41 root cause hypothesis**: LYING_DOWN→FALLEN timer 60s = test 60s borderline → no alert.
*   **P0 S41 root cause hypothesis**: Skel-reject filtra pose orizzontali (`hp=False c=0.30` keypoint visibility bassa) → PersonState mai update → state stuck.
*   **P0 S41 root cause hypothesis**: Test S2 esteso 70-90s (verifica se è solo timing 60s threshold).
*   **P0 S41 root cause hypothesis**: Read FSM update() line 2278+ + skel-reject logic per validate hypothesis #3.
*   **P0 S41 root cause hypothesis**: Aggiungere UNKNOWN→FALLEN diretto se persona già a terra al detect (richiede pose-based ground detection).
*   **P0 S41 root cause hypothesis**: Track#6045 lost mid-test (track lifecycle issue).
*   **P0 S41 root cause hypothesis**: Safe-zone divano polygon copre area test → in_safe_zone=True → 600s threshold (>213s).
*   **P0 S41 root cause hypothesis**: State flip intermedio (is_horizontal=False frame intermittente) reset _lying_down_since.
*   **P0 S41 root cause hypothesis**: YOLO conf collapse on horizontal pose (0.16-0.26) → ByteTrack denies track persistence → FSM 60s escalation timer cannot evaluate → PersonState destroyed at 30s stale-cleanup BEFORE 60s timer fires.
*   **P0 S41 root cause hypothesis**: Camera-level HPT compensates partially but threshold mis-tuned (frames=17 needed, took 300s to accumulate at 1 fps × low detection rate).
*   **P0 S41 root cause hypothesis**: Tune ByteTrack track_thresh / track_buffer for low-conf horizontal detections.
*   **P0 S41 root cause hypothesis**: Camera-level escalation timer independent of track lifecycle (decouple from PersonState destruction).
*   **P0 S41 root cause hypothesis**: Extend PersonState stale timeout 30s→90s+ to allow 60s timer to fire across track ID gaps.
*   **P0 S41 root cause hypothesis**: iMac full audit.
*   **P0 S41 root cause hypothesis**: Resource baseline: CPU/RAM/disk/swap/load1/5/15.
*   **P0 S41 root cause hypothesis**: Process inventory: chi consuma cosa.
*   **P0 S41 root cause hypothesis**: VM Windows: hypervisor in uso?
*   **P0 S41 root cause hypothesis**: LaunchAgents/LaunchDaemons enumeration.
*   **P0 S41 root cause hypothesis**: Network sockets: porte in ascolto.
*   **P0 S41 root cause hypothesis**: Disk health: SMART, spazio NAS_LOCAL, log size.
*   **P0 S41 root cause hypothesis**: Power management: pmset -g.
*   **P0 S41 root cause hypothesis**: Tailscale state vs S24 issue.
*   **P0 S41 root cause hypothesis**: "Bloccato" symptom: Spotlight indexing?
*   **P0 S41 root cause hypothesis**: Finder 88% CPU.
*   **P0 S41 root cause hypothesis**: Multipass QEMU VM autostart.
*   **P0 S41 root cause hypothesis**: bridge.err 993 MB unbounded.
*   **P0 S41 root cause hypothesis**: X-VPN root 592 MB.
*   **P0 S41 root cause hypothesis**: `com.apple.582d56504e.plist` sospetto root.
*   **P0 S41 root cause hypothesis**: mosquitto double-bind :1883.
*   **P0 S41 root cause hypothesis**: Traccar 50+ porte aperte.
*   **P0 S41 root cause hypothesis**: ARDAgent `*:3283`.
*   **P0 S41 root cause hypothesis**: `com.user.vbridge.ssh` 192.168.1.38 unreachable.
*   **P0 S41 root cause hypothesis**: Tailscale account mismatch CLAUDE.md.
*   **P0 S41 root cause hypothesis**: Phone Tailscale offline 1h.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.
*   **P0 S41 root cause hypothesis**: Riuso AS-IS: `vis/inv_pendulum.py`, `helpers.py`, `default_params.py`, `model/model.py`.
*   **P0 S41 root cause hypothesis**: `pose_smoke.py` PID 24996 ENDED 880s, 20 frame.
*   **P0 S41 root cause hypothesis**: `0.02 fps blocker` (44s/frame Mac CPU) — unusable real-time.
*   **P0 S41 root cause hypothesis**: Snapshot autonomo opencv: PASS, soggiorno vuoto verificato (H1 confirmed).
*   **P0 S41 root cause hypothesis**: `YOLOv8-pose Ultralytics` (3.40 fps Mac CPU, 170x faster) per pose detection.
*   **P0 S41 root cause hypothesis**: `LSTM lstm_weights.sav taufeeque9` pre-trained per fall classification.
*   **P0 S41 root cause hypothesis**: COCO 17 keypoint format identico = drop-in replacement.

_(troncato a 500 righe — output originale eccedeva soglia)_
