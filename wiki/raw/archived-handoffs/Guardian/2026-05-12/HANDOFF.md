
---
## S58 — 2026-05-12 closure ~45%

**Goal**: Fix S57 P0 multi-person FP strutturale (persona terza in piedi fa scattare ALERT su lying sul divano).

**Root cause confermato**: `algorithms.get_all_features:466` (`if i == 0:`) calcola prediction LSTM solo per `ip_set[0]`. Tutte altre persone restano predictions[i]=15. Vecchia `all_persons_in_safe_zone` controllava OGNI bbox e fail-opened se una qualunque era fuori dal poligono → FP garantito multi-person.

**Fix deployato** `~/fall-poc/run_upstream.py` (323 LOC):
- Rimossa `all_persons_in_safe_zone(bbox_list, safe_zones)`.
- Aggiunta `falling_person_in_safe_zone(ip_set, safe_zones)`: testa solo `ip_set[0][-1]["box"]` centroide vs poligoni.
- Fail-open conservativo se track 0 vuota/None.
- Backup: `run_upstream.py.bak-s58`.

**Smoke PASS**: 30s idle, 90 frame @ 2.77 fps, persons 0→1, pred=15 label=None, zero ALERT/FALL Warning/SAFE-ZONE. No regression.

**Carry-over S59**:
- P1 test naturale multi-person Luke (richiede fisico + 3a persona)
- P2 Luna MQTT subscribe `zeroclaw/guardian/fall`
- P3 production activation `launchctl load fall-detector` (gating: P1 zero-FP ≥30min)

launchctl resta UNLOADED.

---
## S59 — 2026-05-12 closure ~42% (pre-closure budget)

**Goal**: test naturale multi-person, verificare S58 safe-zone elimina FP S57.

**Pre-flight PASS**: RTSP 1920x1080, zones.json divano polygon, MQTT auth, launchctl UNLOADED, no zombie.

**Result**: 🔴 FAIL — 2 FP in 150s
- ALERT 1 @ ts=1778596726 (cold-start, persons=1 hallucination su sedia+coperta, snap divano vuoto)
- ALERT 2 @ ts=1778596820 (stale-track, `persons=0` da f=90, LSTM emette FALL Warning su ip_set[0] storico, snap divano vuoto)

**Nuovo root cause S59 (oltre S57/S58)**: `algorithms.get_all_features` opera su `ip_set[0]` storico senza richiedere detection fresca. YOLO perde Luke sdraiato (replica S40 horizontal blind spot YOLOv8n-pose) → track stale → LSTM emette FALL Warning → safe-zone S58 inefficace (centroide stale fuori polygon, fail-open).

**S58 fix valutazione**: semanticamente corretto, insufficiente contro stale-track + cold-start.

**Carry-over S60** (raccomandazione minimal ~3 LOC):
1. P0 gate alert su `len(keypoint_sets) > 0` in run_upstream.py:304 (skip se YOLO non vede nessuno frame corrente)
2. P0 warmup 60f cold-start skip
3. P1 retry test multi-person dopo P0 PASS
4. P2 Luna MQTT subscribe deferred
5. P3 production activation gated su zero-FP 30min PASS

launchctl resta UNLOADED. run_upstream killed PID 75068.

---
## S60 — 2026-05-12 closure (post-smoke PASS)

**Goal**: fix S59 stale-track + cold-start FP, smoke idle 60s PASS.

**P0 fix deployato** `~/fall-poc/run_upstream.py` (~5 LOC):
- Warmup 60f tra match_ip e get_all_features (skip LSTM cold-start)
- Stale-track gate: `if label in ("FALL","FALL Warning") and len(keypoint_sets) > 0`
- Backup: `run_upstream.py.bak.s60`

**Smoke 60s idle PASS**: 210 frame @ 3.05 fps, persons=0 throughout, pred=15 label=None, **0 ALERT** (vs S59 2 FP/150s), 0 snap. Prima [STAT] a f=60 conferma warmup blocca inference cold-start.

**Stato sistema**: run_upstream killed, launchctl UNLOADED preservato, ZERO production activation.

**Carry-over S61**:
- P1 test naturale multi-person Luke ≥30min (richiede fisico, S57 scenario divano + persona terza in piedi che tiene gatto)
- P2 Luna MQTT subscribe `zeroclaw/guardian/fall` gated P1 PASS
- P3 `launchctl load fall-detector` gated P1 zero-FP ≥30min
- Ricerca opzionale: upgrade YOLOv8n-pose → YOLOv8s-pose o YOLOv11n-pose per lying-person detection (root cause downstream persistente)

**File chiave**:
- `~/fall-poc/run_upstream.py:295-302` (warmup)
- `~/fall-poc/run_upstream.py:311` (stale-track gate)
- `/tmp/s60-smoke.log` (smoke evidence)

---
## S60 addendum — research-driven pivot + s-pose smoke

**Ricerca tool-evaluator** (dati 5 sessioni S40-S59): root cause downstream YOLOv8n-pose horizontal blind spot, fix sintomatici insufficienti. Raccomandazione swap → yolov8s-pose ONNX.

**S60b bug discovery**: warmup `continue` PRIMA di get_all_features → `KeyError: 'features'` (ip_set entries non inizializzate). Emerso solo con s-pose conf 0.15 detection più aggressiva (idle smoke S60 mascherato da persons=0).

**S60c fix**: warmup come AND nella gate alert (`frame_idx >= 60`), get_all_features chiamato sempre. Syntax OK.

**S60c smoke s-pose PT**: fps=1.22 (vs 3.05 con n) — sotto target ≥2.0, conferma penalty no-AVX2 iMac 2012 peggio della stima ricerca. **s-pose PT inutilizzabile production**.

**Decisione**: weights production restano yolov8n-pose. yolov8s-pose.pt scaricato in repo ma deferred ONNX S61.

**Carry-over S61 priorità**:
1. ONNX export yolov8s-pose (target 2.2-2.5 fps)
2. Pre-flight pip --dry-run onnxruntime CPU (NOT -gpu blacklist)
3. Fallback YOLO11n-pose se ONNX <1.5 fps
4. Watchdog fps run_upstream.py auto-fallback a n
5. Test multi-person Luke deferred fino weights production-ready

---
## S64 — 2026-05-12 closure ~50% (hard limit reached)

**Goal**: S63 P0 Opt 3 precondizioni — Task 1 class gate person-only + Task 2 MOG2 motion pre-filter (Task 3 horizontal blind spot DEFERRED S65+ per S63 prompt).

**Task 1 deployato** (class gate person-only, ~3 LOC):
- Verifica: `processor_yolo.py:31` già usa `classes=[0]` (COCO person) nativamente
- Aggiunto `[INIT]` log esplicito "class gate: COCO person-only" per evidence trail
- Aggiunto commento docstring + inline pre `processor.single_image()`
- Nessun cambio comportamentale (filtro già upstream), defensive logging only

**Task 2 deployato** (MOG2 motion pre-filter, ~30 LOC):
- `cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=16, detectShadows=False)`
- Warmup 100f obbligatorio (BG model convergence) — pipeline completa attiva
- Post-warmup: motion_pixels < 0.5% frame area (=~1500px @640x480) → skip get_all_features (LSTM)
- `bg_subtractor.apply(img)` sempre eseguito (BG model fresco anche durante skip)
- Counters: `motion_skipped` + `lstm_called` in `[STAT]` ogni 30f per evidence
- Cooldown/safe-zone/stale-gate (S53/S58/S60) preservati invariati

**Stato deploy**:
- `~/fall-poc/run_upstream.py` 369 LOC (vs S60 323 LOC, +46)
- Backup: `run_upstream.py.bak.s64` (S58+S60 baseline)
- Syntax check PASS Mac + iMac
- launchctl `com.zeroclaw.fall-detector` UNLOADED preservato (S52 gating)

**Carry-over S65 (WIP, P0)**:
1. **Smoke 60s idle iMac post-deploy** (skipped per S64 hard budget 50% limit)
   - Expected: `[INIT] MOG2 ready` log, warmup 100f con pipeline completa, post-warmup `MOTION=OFF` su scena statica
   - Expected: `lstm_calls << motion_skipped` ratio dopo warmup
   - Comando: `cd ~/fall-poc && source venv/bin/activate && timeout 80 python3 run_upstream.py > /tmp/s64-smoke.log 2>&1; grep -E "(INIT|STAT|ALERT|ERROR)" /tmp/s64-smoke.log`
2. **Luke physical multi-person ≥30min** (gated su smoke PASS) — S57 scenario divano + persona terza
3. **Task 3 deferred S65+ sprint dedicato** (GMDCSA-24 + fine-tuning) per S63 prompt
4. **Production activation `launchctl load`** gated su zero-FP 30min PASS

**File chiave**:
- `scripts/fall-poc/run_upstream.py` (source of truth, deployato iMac)
- `~/fall-poc/run_upstream.py.bak.s64` (rollback baseline S58+S60)

**Budget**: closure ordinata 50% hard limit raggiunto post-deploy + syntax, smoke escluso per onestà (V6 mai PARTIAL).

## S65 (2026-05-12) closure 51%
- P0 smoke idle PASS (`/tmp/s64-smoke.log` iMac, 0 ALERT 80s, MOG2+class gate evidenza)
- P1 replay Variety panel FAIL: **9 ALERT/10min multi-person broadcast** (`/tmp/s65-replay.log` iMac)
- Falsificazione fix S58/S60/S64: valida solo overfit EZVIZ, falla cross-domain prospettiva non-EZVIZ
- Pivot strategico: physical-driven → dataset-driven (OmniFall/Le2i/Simuletic) + physical-confirm finale
- Luke direttiva S65: NO decisioni senza analisi, VOS log obbligatorio decisioni strategiche
- Carry S66: ADR 009 dataset selection analysis-first, no download pre-ADR
