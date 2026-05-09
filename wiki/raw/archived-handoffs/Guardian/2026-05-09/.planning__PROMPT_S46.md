# PROMPT_S46 — Build fall_standalone.py (post-pivot Opzione α)

## CONTEXT
S45 closure ~40%: pivot architettonico CONFIRMED — openpifpaf 0.02 fps blocker → YOLOv8-pose 3.4 fps validato. LSTM `lstm_weights.sav` taufeeque9 pre-trained presente. COCO 17 keypoint format identico = drop-in replacement.

**Stack risolto S44+S45** (NON cambiare): `torch==1.10.2`, `torchvision==0.11.3`, `numpy==1.26.4`, `opencv-python==4.10.0`, `ultralytics==8.4.46` (no-deps install), Python 3.9.6, venv `~/fall-poc/venv/`.

**Evidence baseline**:
- YOLOv8-pose smoke: 3.40 fps avg, 20 frame, RTSP 1920x1080 OK
- Snapshot autonomo opencv: PASS, 538KB JPG soggiorno verificato
- LSTM input: shape `(1, 36, 5)`, features `[ratio_bbox, log_angle, re, ratio_derivative, gf]`

## P0 — Smoke test re-run breve (2 min, sanity check)

```bash
ssh gianlucadistasi@imac-di-gianluca.local '~/fall-poc/venv/bin/python3 -c "
from ultralytics import YOLO
import cv2, time
m = YOLO(\"yolov8n-pose.pt\")
cap = cv2.VideoCapture(\"rtsp://127.0.0.1:8554/soggiorno\")
t0=time.time()
for i in range(10):
    ok,f = cap.read()
    if ok:
        r = m(f, verbose=False)[0]
        print(f\"frame {i} persons={len(r.boxes) if r.boxes is not None else 0}\")
print(f\"fps={10/(time.time()-t0):.2f}\")
cap.release()
"'
```

Expected: fps ≥3.0, persons=0 (se Luke non in stanza) o persons=1 (se presente). Se FAIL → riapri P0 S45.

## P1 — Build fall_standalone.py (~150 LOC, target ~30-40% budget)

**File**: `~/fall-poc/fall_standalone.py`

### Architecture

```
RTSP cv2.VideoCapture (1920x1080)
  ↓
YOLOv8-pose inference per frame
  ↓
Per ogni persona detected (boxes.xyxy, keypoints.data shape (N,17,3)):
  → tracking ID via simple IoU match (no ByteTrack iniziale)
  → kp_list = result.keypoints.data[i].cpu().numpy().tolist()
  → from vis.inv_pendulum import get_kp → inv_pend, ubbox, lbbox
  → wrap in dict: {"keypoints": inv_pend, "box": np.array([x1y1, x2y2]), "time": time.time()}
  → append to ip_set[person_id] (deque maxlen=36)
  ↓
Quando ip_set[id] full (36 frame):
  → estrai feature window:
     - ratio_bbox: get_height_bbox / get_width_bbox per frame
     - log_angle: log(abs(get_angle_vertical(N-B)) + eps)
     - re: get_rot_energy(ip[t-1], ip[t])
     - ratio_derivative: diff(ratio_bbox) / dt
     - gf: get_gf(ip[t-2], ip[t-1], ip[t])
  → window_tensor = torch.Tensor(window).reshape(1, 36, 5)
  → output, _ = lstm_model(window_tensor)
  → predicted = torch.sigmoid(output) > 0.5 → "FALL" if True
  ↓
Se 3 frame consec FALL → trigger:
  → log timestamp + bbox + features
  → subprocess Telegram alert
  → (P2) MQTT publish zeroclaw/guardian/fall
```

### Imports da riusare AS-IS

```python
sys.path.insert(0, '/Users/gianlucadistasi/fall-poc')
from vis.inv_pendulum import get_kp, get_rot_energy, get_gf, get_angle_vertical, get_height_bbox
from vis.visual import CocoPart
from helpers import dist, last_ip, pop_and_add
from default_params import DEFAULT_CONSEC_FRAMES, FEATURE_LIST, MIN_THRESH
from model.model import LSTMModel
```

### LSTM load (riferimento algorithms.py:243)

```python
model = LSTMModel(input_dim=5, h_RNN_layers=2, h_RNN=256, num_classes=1)
model.load_state_dict(torch.load('/Users/gianlucadistasi/fall-poc/model/lstm_weights.sav', map_location='cpu'))
model.eval()
```

### YOLOv8 → taufeeque9 keypoint format adapter

```python
def yolo_to_taufeeque(kp_tensor):
    """Convert YOLOv8 keypoint (17, 3) → list di 17 [x, y, conf] per get_kp()"""
    return kp_tensor.cpu().numpy().tolist()  # già compatibile
```

### Tracking semplice (no ByteTrack iniziale)

```python
def match_person_id(prev_centroids, new_box, max_dist=100):
    """IoU/centroid distance match. Return existing ID o None per new person."""
    cx, cy = (new_box[0]+new_box[2])/2, (new_box[1]+new_box[3])/2
    best_id, best_d = None, max_dist
    for pid, (px, py) in prev_centroids.items():
        d = ((cx-px)**2 + (cy-py)**2)**0.5
        if d < best_d:
            best_d, best_id = d, pid
    return best_id
```

### Skeleton main loop

```python
ip_sets = {}  # {person_id: deque(maxlen=36)}
prev_centroids = {}
fall_consec = {}  # {person_id: consec_fall_frames}
next_id = 0

while cap.isOpened():
    ok, frame = cap.read()
    if not ok: continue
    
    results = yolo_model(frame, verbose=False)[0]
    if results.boxes is None: continue
    
    new_centroids = {}
    for i, box in enumerate(results.boxes.xyxy.cpu().numpy()):
        kp = results.keypoints.data[i]
        pid = match_person_id(prev_centroids, box) or next_id
        if pid == next_id: next_id += 1
        
        kp_list = yolo_to_taufeeque(kp)
        inv_pend, ubbox, lbbox = get_kp(kp_list)
        if inv_pend.get('B') is None or inv_pend.get('N') is None: continue
        
        ip_dict = {"keypoints": inv_pend, "box": np.array([[box[0],box[1]],[box[2],box[3]]]), "time": time.time()}
        ip_sets.setdefault(pid, deque(maxlen=36)).append(ip_dict)
        new_centroids[pid] = ((box[0]+box[2])/2, (box[1]+box[3])/2)
        
        if len(ip_sets[pid]) == 36:
            window = extract_features(list(ip_sets[pid]))  # → (36, 5) numpy
            x = torch.Tensor(window.reshape(1, 36, 5))
            with torch.no_grad():
                out, _ = model(x)
            pred = torch.sigmoid(out).item() > 0.5
            
            if pred:
                fall_consec[pid] = fall_consec.get(pid, 0) + 1
                if fall_consec[pid] >= 3:
                    trigger_fall_alert(pid, box, ip_dict)
                    fall_consec[pid] = 0  # reset post-trigger
            else:
                fall_consec[pid] = 0
    
    prev_centroids = new_centroids
```

### `extract_features()` — TODO careful

5 feature per frame:
```python
def extract_features(ip_list):
    """Return numpy array shape (36, 5)"""
    feats = []
    for t in range(len(ip_list)):
        ratio_bbox = get_height_bbox(ip_list[t]) / max(get_width_bbox(ip_list[t]), 1)
        N = ip_list[t]["keypoints"]["N"]
        B = ip_list[t]["keypoints"]["B"]
        log_angle = np.log(abs(get_angle_vertical(N - B)) + 1e-6)
        re = get_rot_energy(ip_list[t-1], ip_list[t]) if t >= 1 else 0
        ratio_derivative = (ratio_bbox - prev_ratio) / dt if t >= 1 else 0
        gf = get_gf(ip_list[t-2], ip_list[t-1], ip_list[t]) if t >= 2 else 0
        feats.append([ratio_bbox, log_angle, re, ratio_derivative, gf])
    return np.array(feats)
```

⚠️ **Verifica**: `get_width_bbox` esiste? Se no, calcola `box[1][0] - box[0][0]`.

## P1 PASS criteria

1. Smoke run idle 30s (stanza vuota) → no crash, no FALL trigger spurious
2. Smoke run idle con persona seduta divano 30s → tracking ID stabile, NO_FALL persistente
3. **Luke physical test**: stendersi pavimento 60s → entro 7-15s output `FALL` per ≥3 frame consec → Telegram alert ricevuto

## P2 — Integration production (deferred S47 se P1 budget tight)

1. Telegram via `subprocess.run(["bash", "/path/scripts/telegram-alert.sh", "FALL", str(pid)])`
2. MQTT publish `zeroclaw/guardian/fall` (Luna alert handler)
3. Safe-zone polygon: import `~/guardian/zones.json` soggiorno, filter detection in chaise/divano = NO_FALL
4. Architectural decision: POC parallel a Guardian (OR boolean) OPPURE replace Guardian fall logic

## Pre-flight S46 (lessons S43+S44+S45)

- [ ] **P0 sanity check 10 frame** prima di P1 implement (no 880s surprise)
- [ ] **Snapshot capture autonomo opencv** ogni 5s in `/tmp/test-snap-N.jpg` durante Luke physical
- [ ] **Telegram delivery test** prima di S2 (no audio TTS iMac stanza diversa)
- [ ] **Marker visivo** angolo soggiorno chiaramente identificato
- [ ] **Single-hypothesis**: solo Opzione α, NO ritorno openpifpaf
- [ ] **Context budget 40/50%**: P1 stima 30-40%, P2 split S47 se necessario

## Carry-over backlog (P3 non bloccante)

- iMac remediation: Multipass stop, bridge.err truncate, `com.apple.582d56504e.plist` audit (sudo Luke)
- Backup strategy: memory + Guardian DB rclone offsite
- Tailscale memory cleanup (project_s24_findings.md, ADR 006)
- ffmpeg install iMac (workaround attivo: opencv autonomo)
- Cron watchdog Guardian: re-enabled S38, monitorare 7gg
- pose_smoke.py + shufflenetv2k16 41MB cleanup (dead code post-pivot)

## Memory reference

- `project_s45_findings.md` — closure S45 + pivot rationale + evidence
- `project_s44_findings.md` — clone fork + venv + deps base
- `project_s43_pivot_clone_oss.md` — strategic pivot rationale
- `project_s33_findings.md` — taufeeque9 winner verification (337⭐ MIT)
- `feedback_test_snapshot_autonomous.md` — pre-flight rule
- `feedback_pre_flight_human_test.md` — upstream sanity check obbligatorio

## Entry command S46 (literal first action)

```bash
ssh gianlucadistasi@imac-di-gianluca.local '~/fall-poc/venv/bin/python3 -c "
from ultralytics import YOLO; import cv2, time
m = YOLO(\"yolov8n-pose.pt\")
cap = cv2.VideoCapture(\"rtsp://127.0.0.1:8554/soggiorno\"); t0=time.time()
for i in range(10):
    ok,f = cap.read()
    if ok:
        r = m(f, verbose=False)[0]
        print(f\"frame {i} persons={len(r.boxes) if r.boxes is not None else 0}\")
print(f\"fps={10/(time.time()-t0):.2f}\"); cap.release()
"'
```
