# HANDOFF S180 — Oracle Free Tier interactive signup + Firebase + V2 pulizia smartphone discovery

> Generato S179 (2026-05-15) post chiusura VERDE OQ-02.3 iMac stand-in path.
> NEXT_SESSION_PROMPT.md è managed dal hook auto-close, NON usare per handoff manuali (S179 lesson learned).

## CONTESTO

S179 chiusa VERDE — OQ-02.3 E2E architettura D-06 validato su iMac stand-in:
- Camera-agnostic ingest go2rtc (EZVIZ → localhost:8554/<name>) OK
- Backend inference `run_upstream.py` 789 LOC (YOLO11n-pose ONNX + LSTM + MOG2 + S89 temporal) OK 90s smoke f=1290 zero crash
- Bug regressione fixato: variable shadowing `t0` (line 714 → `track0`) post-S102.2, backup `~/fall-poc/run_upstream.py.bak-s179-pre-fix`
- Bridge MQTT→FCM stub E2E 3/3 (file NEW `~/fall-poc/mqtt_fcm_bridge.py` 86 LOC, FCM HTTP v1 API body format ready)
- Bandwidth baseline 706 Kbps en0 LAN → OQ-02.5 aperto (frame-sampling source-side per <500 Kbps target)

Oracle Free Tier ARM A1 setup DEFERRED S180 (signup interactive Luke).

## OBIETTIVI S180

### P0 — Oracle Cloud Free Tier signup interattivo (Luke disponibile)

1. Luke esegue: https://signup.cloud.oracle.com/ (carta credito per verifica, no charge ARM A1)
2. Region: Frankfurt (latency Italia ~25ms) o Milan se disponibile
3. ARM A1 Flex compute: shape `VM.Standard.A1.Flex`, OCPU 4, RAM 24GB, Ubuntu 22.04 LTS
4. SSH key MacBook upload, security list port 22 + outbound TLS
5. Verifica `ssh ubuntu@<oracle_ip>` connect → record IP in `~/venture-os/state/guardian-infra.jsonl`

**Rischio noto** (verifica fattuale S179): Oracle ARM A1 EU region cronicamente "Out of Capacity" post-2024. Se OOC ripetuto: fallback Frankfurt → AMS (Amsterdam) → US-Phoenix (latency 150ms ma capacity stabile, accettabile per fall-alert con cooldown 30s).

### P1 — Deploy stack iMac → Oracle migration

1. Ubuntu 22.04 ARM deps: `apt install python3.11-venv ffmpeg libgl1` + `pip install ultralytics opencv-python paho-mqtt requests onnxruntime` (ARM wheels native, no Big Sur issue)
2. rsync `~/fall-poc/run_upstream.py` + `mqtt_fcm_bridge.py` + `yolo11n-pose.onnx` + `model/` + `vis/` + `algorithms.py` + `default_params.py` + `helpers.py` + `processor_yolo.py` + `zones.json` (path adapt `/home/ubuntu/guardian/zones.json`)
3. Install mosquitto broker su Oracle (`apt install mosquitto mosquitto-clients`, config user/pass identici iMac)
4. NAT traversal RTSP cam → Oracle: raccomandazione **Tailscale mesh** (b)
   - (a) reverse SSH tunnel autossh MacBook → Oracle expose go2rtc 8554 — fragile, single point of failure
   - (b) **Tailscale exit-node iMac (S16a già installato)** Oracle entra in mesh, RTSP raggiungibile via Tailscale IP — zero-cost forever-free 100 device, no port-forward router casa Luke

### P2 — Firebase project + FCM HTTP v1 production

1. Luke esegue: https://console.firebase.google.com/ → new project "guardian-alerts"
2. Cloud Messaging → service account JSON download (key per OAuth2 bearer token)
3. Genera bearer token: `gcloud auth application-default print-access-token` o firebase-admin SDK
4. Swap `FCM_ENDPOINT` env in `mqtt_fcm_bridge.py`: `https://fcm.googleapis.com/v1/projects/<PROJECT_ID>/messages:send`
5. Test token: register dummy Android device → verify push notification ricevuta

### P3 — V2 pulizia smartphone discovery (D-04 OPEN closure)

OQ-01 ancora OPEN: scope dettagliato V2. Founder Q1-Q5 dedicato:
- Q1: target user (anziani con smartphone vecchi? caregiver che ripulisce device padre/madre per evitare crash/storage full?)
- Q2: stack (Android-only? iOS? cross-platform Tauri mobile? automation cloud Tailscale-based?)
- Q3: scope operazioni (cache pulizia app, foto/video dedup, app obsolete uninstall, storage report?)
- Q4: modalità interazione (app wizard una-tantum? subscription mensile? webhook automation MCP?)
- Q5: business model (one-time €X? freemium? bundled con Guardian V1 fall-detection?)

**Vincolo founder S178 Q4**: V2 "deve essere completo" parallelo a V1 → discovery NON blocker MVP V1 ma deve essere planning entro stesso ciclo Guardian.

### P4 — OQ-02.5 motion-gated frame sampling (bandwidth optimization)

Current `run_upstream.py`: decode-all-frames + LSTM skip se motion=OFF. Bandwidth proxy go2rtc → Oracle = full stream sempre (~500-700 Kbps continuous). Target D-06 <500 Kbps requires source-side frame-skip.

Approccio candidato: configurazione go2rtc downscale 480p + 5fps quando MOG2 motion=OFF (signal via MQTT control topic), o implement skip pre-decode in `run_upstream.py`. Sub-task discovery vs implementation S181.

### P5 — Closure HANDOFF S181

Tabella S180 results (Oracle OK/NO, Firebase OK/NO, V2 discovery OK/PARTIAL, OQ-02.5 scope/defer). Update DECISIONS.md (nuove D-07/D-08 se V2 scope deciso, nuova D-09 se OQ-02.5 architettura risolta).

## VINCOLI HARD

- EUR 0 spend (Oracle Free Tier + Firebase free tier + Tailscale free tier)
- Camera-agnostic invariato (D-06)
- D-02 NON sunset (mantenere stack run_upstream.py rinominato `track0`)
- Context budget: chiusura ≤60%, gate 50%
- Vincolo #3 CTO: NO domande binarie a fine task
- Pattern S159 corollari: pre-action-check D-XX rif per ogni proposta tecnica Guardian

## STATO CORRENTE S179 → S180

- 5 D-XX DECIDED + 1 OPEN (D-04) + 1 SUPERSEDED (D-05) in Guardian DECISIONS
- OQ-02.3 closure VERDE iMac stand-in, Oracle = OQ-02.3-production pending S180
- OQ-02.5 NEW (frame sampling bandwidth)
- Bug strutturale `t0` shadowing run_upstream.py logged `state/blueprint-deviations.jsonl` 2026-05-15
- Componenti VOS attivi: invariati (+ bridge S179 NEW su iMac, NOT yet committed su iMac git)

## NON FARE

- Acquisti hardware
- Sunset run_upstream.py (D-06 PRESERVED clause)
- V2 implementazione PRIMA di discovery Q1-Q5 founder (D-04 OPEN gating)
- Decisioni business model V1 o V2 pricing (defer post-revenue)
- Scrivere handoff in `.claude/NEXT_SESSION_PROMPT.md` (auto-close hook lo sovrascrive — S179 lesson)

## QUICK REF

- DECISIONS.md D-06 S179 validation update: `wiki/projects/Guardian/DECISIONS.md` linee 117-148
- Backend iMac: `ssh imac` → `~/fall-poc/run_upstream.py` (789 LOC fixed, S179 backup `.bak-s179-pre-fix`)
- Bridge: `~/fall-poc/mqtt_fcm_bridge.py` (86 LOC NEW S179, FCM v1 API ready, env-driven endpoint)
- EZVIZ test bench: `rtsp://admin:QSTOZH@192.168.1.4:554/H.264` (soggiorno) + `rtsp://admin:GEGURX@192.168.1.3:554/H.264` (cameretta)
- MQTT broker iMac: localhost:1883 user=zeroclaw pass=ZeroClaw2026Home topic=zeroclaw/guardian/fall
- go2rtc config: `~/go2rtc.yaml` (iMac) — 2 EZVIZ stream restream localhost:8554

## DOMANDE OPEN

- OQ-01 D-04: V2 pulizia smartphone scope (target/stack/business)
- OQ-02.4: caregiver app/PWA UX
- OQ-02.5: motion-gated frame sampling source-side (NEW S179)
- OQ-03: P1 test naturale Luke ≥30min multi-person (D-03 gating P3 production launchctl)
- OQ-04: ADR 009 dataset GMDCSA-24 fine-tuning
- OQ-06: business model pricing (defer post-revenue)
