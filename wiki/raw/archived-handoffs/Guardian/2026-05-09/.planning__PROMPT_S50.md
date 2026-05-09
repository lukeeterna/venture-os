# PROMPT_S50 — Implementazione B+ minimal patch (Processor swap upstream taufeeque9)

## CONTEXT (1 frase)
S49 chiusa 40% closure ordinata: direzione B+ scelta dopo Luke "basta perdite tempo, copia progetto funzionante". Drop POC custom + Guardian custom. Use `taufeeque9/algorithms.py` upstream as-is, replace ONLY `vis/processor.py:Processor` con YOLOv8-pose wrapper. Contract upstream completamente mappato S49 read-only — S50 parte da implementazione, zero ricerca.

## P0 — Fill last gap (2 min)
```bash
ssh gianlucadistasi@imac-di-gianluca.local 'grep -B2 -A 22 "class CocoPart\|^CocoPart" ~/fall-poc/helpers.py | head -30; head -30 ~/fall-poc/helpers.py; ls -la ~/fall-poc/yolov8n-pose.pt ~/fall-poc/model/lstm_weights.sav'
```

## P1 — Write `vis/processor_yolo.py` (~70 LOC, 15 min)

Contract da rispettare (mapped S49):
- Class `YoloProcessor(width_height, args)` — args.device per torch device
- Method `single_image(image: np.ndarray) → (keypoint_sets, bb_list, width_height)`
  - `keypoint_sets`: numpy array shape `(n_persons, 17, 3)` → x_norm [0-1], y_norm [0-1], conf [0-1]
  - COCO 17 keypoint order: nose, leye, reye, lear, rear, lshoulder, rshoulder, lelbow, relbow, lwrist, rwrist, lhip, rhip, lknee, rknee, lankle, rankle (identico a YOLOv8-pose `keypoints.xyn`)
  - `bb_list`: lista tuple `((x1_norm, y1_norm), (x2_norm, y2_norm))` da `boxes.xyxyn`
  - `width_height`: tuple PIL size (post-resize)
- Backend: `from ultralytics import YOLO; self.model = YOLO("yolov8n-pose.pt")`
- Confidence threshold: 0.15 (S40 lesson — horizontal pose conf bassa)

## P2 — Write `run_upstream.py` (~80 LOC, 20 min)

Single-thread variant (skip mp/queue per semplicità):
```python
# Pseudocode
import cv2, time, numpy as np, torch
from default_params import DEFAULT_CONSEC_FRAMES
from vis.processor_yolo import YoloProcessor
from vis.inv_pendulum import match_ip, get_kp
from vis.visual import activity_dict
from algorithms import get_all_features, get_hist
from model.model import LSTMModel
from helpers import CocoPart  # confirm path P0

# Load LSTM
model = LSTMModel(h_RNN=48, h_RNN_layers=2, drop_p=0.1, num_classes=7)
model.load_state_dict(torch.load('/Users/gianlucadistasi/fall-poc/model/lstm_weights.sav', map_location='cpu'))
model.eval()

# RTSP source
cap = cv2.VideoCapture("rtsp://localhost:8554/soggiorno")
processor = YoloProcessor((640, 480), args_namespace)
ip_set, lstm_set, num_matched = [], [], 0

while True:
    ret, frame = cap.read()
    if not ret: continue
    keypoint_sets_raw, bb_list, wh = processor.single_image(frame)
    # Build dict format come extract_keypoints_parallel:91-115
    anns = [get_kp(keypoints.tolist()) for keypoints in keypoint_sets_raw]
    # ... ubboxes/lbboxes/uhist/lhist
    keypoint_sets = [{"keypoints": keyp[0], "up_hist":uh, "lo_hist":lh, "time":time.time(), "box":box}
                     for keyp, uh, lh, box in zip(anns, uhist_list, lhist_list, bbox_list)]
    # Pipeline upstream
    num_matched, _, _ = match_ip(ip_set, keypoint_sets, lstm_set, num_matched, DEFAULT_CONSEC_FRAMES)
    valid_idxs, prediction = get_all_features(ip_set, lstm_set, model)
    label = activity_dict.get(prediction+5, "?")
    if label == "FALL" or label == "FALL Warning":
        # Trigger alert: Telegram + iMac say + snapshot save
        ...
```

## P3 — Smoke test (5 min)
```bash
ssh gianlucadistasi@imac-di-gianluca.local 'cd ~/fall-poc && source venv/bin/activate && timeout 30 python3 run_upstream.py 2>&1 | tee /tmp/fall-poc/smoke-s50.log'
```
Expect: zero traceback, `pred=` populated, FPS >2

## P4 — Physical FALL test (15 min, se P3 PASS)
Riusa `~/fall-poc/s47_orchestrator.sh` (audio iMac say validato S47):
- Brief 30s prep
- P1 idle 30s divano
- P2 fall 90s pavimento
- Expect: entro 7-15s posizione orizzontale → label="FALL" → Telegram alert + snapshot

## Stop condition assoluta
**Una volta che FALL ALERT scatta su persona stesa pavimento → STOP.** NO further tuning, NO refactor. Production hardening (LaunchAgent autostart, MQTT publish `zeroclaw/guardian/fall`, safe-zone polygon import zones.json, Luna integration) → S51+.

## Cosa NON fare
- ❌ Tornare a Guardian custom (sunk cost, 6 sessioni zero working confermato Luke S49)
- ❌ Toccare `fall_standalone.py` (DEAD CODE, scartato)
- ❌ Rebuild da zero match_ip / get_all_features / get_kp / get_hist / IPSet (TUTTO upstream as-is)
- ❌ Testare openpifpaf (0.02 fps S45 confermato unusable)
- ❌ Scope expansion fuori P0-P4

## Memory critiche
- `project_s49_findings.md` — contract mappato, decisione B+ minimal patch
- `feedback_copy_improve.md` — MAI creare da zero, copiare codice esistente
- `feedback_test_human_orchestration_audio.md` — audio iMac say validato S47
- `feedback_context_budget_structural.md` — soglia 40% warning, 50% closure forzata

## Budget atteso
- P0: 2 min, ~3% context
- P1: 15 min, ~10% context
- P2: 20 min, ~12% context
- P3: 5 min, ~5% context
- P4: 15 min, ~10% context
- **Totale: ~57 min, 40% context** → closure ordinata sotto 50%

## Entry command S50
```bash
ssh gianlucadistasi@imac-di-gianluca.local 'grep -B2 -A 22 "class CocoPart\|^CocoPart" ~/fall-poc/helpers.py | head -30; head -30 ~/fall-poc/helpers.py; ls -la ~/fall-poc/yolov8n-pose.pt ~/fall-poc/model/lstm_weights.sav'
```
