---
project: Guardian
date: 2026-05-12
compiled_at: 2026-05-12T16:38:52Z
model: gemini-2.5-flash
source_files: 2
compiler: karpathy-compiler v2 (multi-pass capable)
status: PAUSED_SINE_DIE
paused_at: 2026-05-21
paused_by: founder CTO decision (memory feedback_guardian_pause_sine_die.md)
reopen_trigger: ARGOS first €800 revenue OR FLUXION first Stripe sale
---

## ⏸️ STATUS: PAUSED SINE DIE (2026-05-21)

**Trigger riapertura (OR-condition, primo che scatta)**:
1. ARGOS chiude primo €800 revenue reale (payment evidence)
2. FLUXION chiude B-4 Stripe E2E + primo customer sale confermato

**Decisione architetturale preservata** (D-06 ready per riapertura):
- IP cam wifi (Tapo C100/C200/C210 wired RTSP commodity €20-40)
- Oracle Free Tier ARM A1 backend Luke (run_upstream.py D-02 PRESERVED)
- FCM gratis unlimited per push notify caregiver
- V1 stack yolov8n+LSTM cliente sunsetted, mantenuto solo iMac casa Luke dev/dogfooding
- V2 pulizia smartphone scope OPEN, business model DEFERRED

**File on-disk preservati** (non cancellare): `~/fall-poc/`, `~/Documents/pulizia-smartphone/`

**Razionale pausa**: V1 mercato commodity smartwatch saturato 2026 (Apple Watch, Galaxy Watch 8, Bay Alarm), V2 0 progresso 6gg, bandwidth Luke saturato ARGOS+FLUXION, vincolo S173 max 3 attivi violato de facto. Vedi memory `feedback_guardian_pause_sine_die.md`.

---

## Stato attuale verificato (snapshot pre-pausa, 2026-05-12)

*   Il goal di S58 era risolvere il FP multi-person strutturale (S57) causato dal calcolo della prediction LSTM solo per `ip_set[0]` e dal controllo `all_persons_in_safe_zone` su ogni bbox. (S58)
*   Il fix per S58 è stato deployato in `~/fall-poc/run_upstream.py` (323 LOC). (S58)
*   La funzione `all_persons_in_safe_zone(bbox_list, safe_zones)` è stata rimossa. (S58)
*   È stata aggiunta la funzione `falling_person_in_safe_zone(ip_set, safe_zones)` che testa solo il centroide di `ip_set[0][-1]["box"]` contro i poligoni. (S58)
*   Il sistema fail-open conservativamente se la track 0 è vuota o None. (S58)
*   È stato creato un backup `run_upstream.py.bak-s58`. (S58)
*   Lo smoke test di S58 è passato: 30s idle, 90 frame @ 2.77 fps, persons 0→1, pred=15 label=None, zero ALERT/FALL Warning/SAFE-ZONE. Non ci sono state regressioni. (S58)
*   Il `launchctl` resta UNLOADED. (S58, S59, S60, S64)
*   Il goal di S60 era risolvere i FP da stale-track e cold-start (S59) e superare uno smoke test idle di 60s. (S60)
*   Il fix P0 per S60 è stato deployato in `~/fall-poc/run_upstream.py` (~5 LOC). (S60)
*   È stato implementato un warmup di 60 frame tra `match_ip` e `get_all_features` per saltare l'inferenza LSTM cold-start. (S60)
*   È stato implementato un gate per stale-track: `if label in ("FALL","FALL Warning") and len(keypoint_sets) > 0`. (S60)
*   È stato creato un backup `run_upstream.py.bak.s60`. (S60)
*   Lo smoke test di S60 (60s idle) è passato: 210 frame @ 3.05 fps, persons=0, pred=15 label=None, 0 ALERT, 0 snap. (S60)
*   La prima [STAT] a f=60 conferma che il warmup blocca l'inferenza cold-start. (S60)
*   Il `run_upstream` è stato killato e il `launchctl` UNLOADED è stato preservato, con ZERO attivazioni in produzione. (S60)
*   I pesi di produzione restano `yolov8n-pose`. (S60 addendum)
*   Il file `yolov8s-pose.pt` è stato scaricato nel repository. (S60 addendum)
*   Il goal di S64 era implementare il class gate person-only (Task 1) e il pre-filtro di movimento MOG2 (Task 2). (S64)
*   Il Task 1 (class gate person-only) è stato deployato (~3 LOC). (S64)
*   `processor_yolo.py:31` usa già `classes=[0]` (COCO person) nativamente. (S64)
*   È stato aggiunto un log esplicito `[INIT]` "class gate: COCO person-only". (S64)
*   È stato aggiunto un commento docstring e inline prima di `processor.single_image()`. (S64)
*   Il Task 2 (MOG2 motion pre-filter) è stato deployato (~30 LOC). (S64)
*   È stato creato un `cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=16, detectShadows=False)`. (S64)
*   È obbligatorio un warmup di 100 frame per la convergenza del modello BG. (S64)
*   Dopo il warmup, se `motion_pixels < 0.5%` dell'area del frame, `get_all_features` (LSTM) viene saltato. (S64)
*   `bg_subtractor.apply(img)` viene sempre eseguito per mantenere il modello BG fresco. (S64)
*   I contatori `motion_skipped` e `lstm_called` sono presenti in `[STAT]` ogni 30 frame. (S64)
*   Cooldown/safe-zone/stale-gate (S53/S58/S60) sono preservati invariati. (S64)
*   Il file `~/fall-poc/run_upstream.py` ha 369 LOC. (S64)
*   È stato creato un backup `run_upstream.py.bak.s64` (baseline S58+S60). (S64)
*   Il syntax check è passato su Mac e iMac. (S64)
*   Il `launchctl com.zeroclaw.fall-detector` UNLOADED è preservato. (S64)
*   Lo smoke test idle di S65 è passato (`/tmp/s64-smoke.log` iMac, 0 ALERT in 80s, con evidenza MOG2+class gate). (S65)
*   MQTT `zeroclaw/guardian/fall` publish è operativo (validato 2 volte in test S57 FP). (PROMPT S58)
*   Esistono 3 snapshot FP `/tmp/fall-poc/alert_*.jpg` su iMac per audit visivo. (PROMPT S58)
*   Il repository `origin/main` è clean. (PROMPT S58)
*   Il file `~/guardian/zones.json` contiene i safe-zone polygons e non ha subito modifiche. (PROMPT S58)
*   Esistono file di evidenza per FP1 e FP2: `/tmp/fall-poc/alert_1778589726_*.jpg` e `/tmp/fall-poc/alert_1778589758_*.jpg`. (PROMPT S58)

## Decisioni chiuse
*   Rimossa `all_persons_in_safe_zone(bbox_list, safe_zones)` e aggiunta `falling_person_in_safe_zone(ip_set, safe_zones)` che testa solo il centroide di `ip_set[0][-1]["box"]` contro i poligoni per la safe-zone. (S58)
*   Implementato un fail-open conservativo se la track 0 è vuota o None. (S58)
*   Aggiunto un warmup di 60 frame tra `match_ip` e `get_all_features` per saltare l'inferenza LSTM al cold-start. (S60)
*   Implementato un gate per lo stale-track: l'alert viene generato solo se `label in ("FALL","FALL Warning") and len(keypoint_sets) > 0`. (S60)
*   La decisione è che i pesi di produzione restano `yolov8n-pose` a causa delle performance insufficienti di `yolov8s-pose.pt` su hardware esistente. (S60 addendum)
*   Implementata una class gate per processare solo le persone (COCO class 0) in `processor_yolo.py:31`, con logging esplicito. (S64)
*   Implementato un pre-filtro di movimento MOG2 (`cv2.createBackgroundSubtractorMOG2`) con warmup di 100 frame e skip dell'inferenza LSTM se i `motion_pixels` sono inferiori allo 0.5% dell'area del frame. (S64)

## Blocker aperti

*   P1 test naturale multi-person Luke ≥30min (richiede fisico, S57 scenario divano + persona terza che tiene gatto) (S64)
*   P2 Luna MQTT subscribe `zeroclaw/guardian/fall` gated P1 PASS (S64)
*   P3 `launchctl load fall-detector` gated su zero-FP 30min PASS (S64)
*   Task 3 deferred S65+ sprint dedicato (GMDCSA-24 + fine-tuning) per S63 prompt (S64)
*   Ricerca opzionale: upgrade YOLOv8n-pose → YOLOv8s-pose o YOLOv11n-pose per lying-person detection (root cause downstream persistente) (S60)
*   ONNX export yolov8s-pose (target 2.2-2.5 fps) (S60 addendum)
*   Pre-flight pip --dry-run onnxruntime CPU (NOT -gpu blacklist) (S60 addendum)
*   Fallback YOLO11n-pose se ONNX <1.5 fps (S60 addendum)
*   Watchdog fps run_upstream.py auto-fallback a n (S60 addendum)
*   Test multi-person Luke deferred fino weights production-ready (S60 addendum)
*   ADR 009 dataset selection analysis-first, no download pre-ADR (S65)

## Prossimi passi

*   P1 test naturale multi-person Luke (richiede fisico + 3a persona) (S58)
*   P2 Luna MQTT subscribe `zeroclaw/guardian/fall` (S58)
*   P3 production activation `launchctl load fall-detector` (gating: P1 zero-FP ≥30min) (S58)
*   P1 retry test multi-person dopo P0 PASS (S59)
*   P2 Luna MQTT subscribe deferred (S59)
*   P3 production activation gated su zero-FP 30min PASS (S59)
*   P1 test naturale multi-person Luke ≥30min (richiede fisico, S57 scenario divano + persona terza in piedi che tiene gatto) (S60)
*   P2 Luna MQTT subscribe `zeroclaw/guardian/fall` gated P1 PASS (S60)
*   P3 `launchctl load fall-detector` gated P1 zero-FP ≥30min (S60)
*   Ricerca opzionale: upgrade YOLOv8n-pose → YOLOv8s-pose o YOLOv11n-pose per lying-person detection (root cause downstream persistente) (S60)
*   ONNX export yolov8s-pose (target 2.2-2.5 fps) (S60 addendum)
*   Pre-flight pip --dry-run onnxruntime CPU (NOT -gpu blacklist) (S60 addendum)
*   Fallback YOLO11n-pose se ONNX <1.5 fps (S60 addendum)
*   Watchdog fps run_upstream.py auto-fallback a n (S60 addendum)
*   Test multi-person Luke deferred fino weights production-ready (S60 addendum)
*   Smoke 60s idle iMac post-deploy (skipped per S64 hard budget 50% limit) (S64)
*   Luke physical multi-person ≥30min (gated su smoke PASS) — S57 scenario divano + persona terza (S64)
*   Task 3 deferred S65+ sprint dedicato (GMDCSA-24 + fine-tuning) per S63 prompt (S64)
*   Production activation `launchctl load` gated su zero-FP 30min PASS (S64)
*   ADR 009 dataset selection analysis-first, no download pre-ADR (S65)
