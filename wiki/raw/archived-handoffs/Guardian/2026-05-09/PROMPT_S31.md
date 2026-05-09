# PROMPT S31 — CTO ENTERPRISE: Guardian production activation con zero tolleranza errori

## Brief
Sei il CTO di ZeroClaw. Costi €220/mese, lavoro enterprise atteso. **S30 ha fallito**: 5 minuti del tempo di Luke bruciati su test inconcludente (boxes=0 upstream YOLO) per pre-flight diagnostic mancato. Lessons in `feedback_pre_flight_human_test.md`. NON ripetere.

## Stato esatto post-S30 (commit `a8c8432`)
- Guardian PID 2013 RUNNING su iMac (verificare ancora alive a inizio S31)
- `[hpt:soggiorno] HPT enabled (frame=1920x1080)` confermato startup → fix S29 LIVE
- Watchdog cron + health-check cron DISABLED (`# MAINTENANCE S29` / `# MAINTENANCE S28+`)
- 6 min log finestra 09:36-09:42 con TUTTE 64 entries `boxes=0 has_track_ids=False conf_thresh=0.25`
- Snapshot baseline `~/guardian/snapshots/soggiorno_S30.jpg` (08:25 1920×1080) → camera vede couch+tavolo correttamente all'08:25
- YOLO general (`yolov8n.pt` COCO) detecta couch 0.484 sul baseline → camera+frame OK
- POSE model (`yolov8n-pose.pt`) NON testato standalone su baseline → buco diagnostic

## Mandato S31 — ZERO COMPROMESSI

### Phase 1 — Pre-flight diagnostic (max 15% context, ZERO Luke physical)
Eseguire SEQUENZIALMENTE, fail-fast su ogni step:

**1.1 Snapshot live + diff baseline**
```bash
ssh imac 'ffmpeg -y -loglevel warning -rtsp_transport tcp \
  -i rtsp://127.0.0.1:8554/soggiorno -frames:v 1 -q:v 2 -update 1 \
  ~/guardian/snapshots/soggiorno_S31_live.jpg'
ssh imac 'md5 ~/guardian/snapshots/soggiorno_S30.jpg ~/guardian/snapshots/soggiorno_S31_live.jpg'
```
- Se hash IDENTICI → **Ipotesi 1 CONFERMATA: stream stale/freeze**. Fix: `launchctl kickstart -k gui/$UID/com.go2rtc` o restart go2rtc, ri-test.
- Se hash DIVERSI → Ipotesi 1 esclusa. Procedi 1.2.

**1.2 Visual inspection framing**
- Pull `soggiorno_S31_live.jpg` locally → Read tool image
- Confronto FOV vs `soggiorno_S30.jpg`: divano + pavimento davanti divano visibili?
- Se PTZ shift confermato → **Ipotesi 2 CONFERMATA**. STOP, escalate Luke physical (preset restore via app EZVIZ).
- Se framing OK → procedi 1.3.

**1.3 POSE model standalone su frame live**
```bash
ssh imac 'cd ~/guardian && python3 -c "
from ultralytics import YOLO
import cv2
model = YOLO(\"yolov8n-pose.pt\")
img = cv2.imread(\"snapshots/soggiorno_S31_live.jpg\")
# Test 3 conf thresholds
for c in [0.25, 0.15, 0.05]:
    r = model.predict(img, conf=c, verbose=False)[0]
    n = len(r.boxes) if r.boxes is not None else 0
    print(f\"conf={c}: boxes={n}\")
"'
```
- conf=0.25 → boxes>0: pipeline POSE OK. Problema NON è conf.
- conf=0.25 → 0 box, conf=0.15 → boxes>0: **Ipotesi 3 CONFERMATA**. Lower conf threshold soggiorno-only in `~/guardian/guardian.env` → Guardian reload. Procedi Phase 2.
- conf=0.05 → 0 box: persona non in frame OR POSE model broken. Verificare con frame test che sia attesa persona (Luke deve essere visibile durante 1.1 OPPURE asset alternativo con persona nota).

**Decision gate Phase 1**: senza diagnostic chiaro → STOP, NO Luke physical. Carry-over con ipotesi documentate.

### Phase 2 — Validated test 4-scenari (solo se Phase 1 PASS)
**Pre-condition obbligatorio**: 1 frame live con boxes>0 confermato in log Guardian (`grep "boxes=[1-9]" ~/guardian/logs/guardian.log | tail -3`).

Test design CTO:
- **S0 WARMUP 30s**: Luke in piedi center frame, agita mano. Conferma `boxes>0` in log live → solo allora procedi.
- **S1 SDRAIATO DIVANO 90s** (test FP S28+ critico): Guardian deve TACERE. Safe zone divano 1920×1080 polygon `[600,400]→[1200,900]`.
- **S2 PAVIMENTO 60s** (test FN critico): immobile davanti divano fuori safe zone. Guardian DEVE FALL ALERT entro 30s.
- Audio guidance via iMac `say -v Alice` script automated come S30, MA con marker log esplicito `[S31-TEST] scenario X start` via `logger -t guardian "..."` per timestamp deterministici.
- Total Luke physical: **MAX 3 min, 1 round**. Se serve ri-test → S32 fresh.

### Phase 3 — Production activation (solo se Phase 2 ALL PASS)
1. Re-enable cron watchdog: `crontab -l | sed 's|^# MAINTENANCE S29 disabled.*||' | crontab -`
2. Re-enable health-check: `crontab -l | sed 's|^# MAINTENANCE S28+ disabled.*||' | crontab -`
3. Verify launchctl com.guardian persistence (auto-restart on iMac reboot)
4. Telegram bot ping di conferma "Guardian production live S31"
5. Health-check 24h via cron `*/15` → verify zero alert spurious

### Acceptance criteria (production-ready)
- [ ] Pre-flight diagnostic root cause boxes=0 documentato + fix applicato
- [ ] Live frame con `boxes>0` in log Guardian (warmup conferma)
- [ ] S1 sdraiato divano 90s → 0 FALL ALERT (test FP S28+)
- [ ] S2 pavimento 60s → ≥1 FALL ALERT entro 30s (test FN)
- [ ] Cron watchdog + health-check RE-ENABLED post-PASS
- [ ] Commit format S31 production activation con evidence log paste

### Anti-pattern proibiti S31
- ❌ Test Luke physical senza Phase 1 PASS
- ❌ "Carry-over" su problema diagnosticabile in <10% context (S30 anti-pattern)
- ❌ Forzare PASS senza positive trigger (S2 pavimento DEVE scattare)
- ❌ Re-enable cron senza ALL Phase 2 PASS
- ❌ Scope creep verso Chunk 2 furniture (BLOCKED finché production not stable)

## Time budget S31
- Phase 1 (diagnostic): max 15% context, 0 Luke physical
- Phase 2 (test): max 15% context, max 3 min Luke physical
- Phase 3 (activation): max 10% context
- Closure: 10% context (HANDOFF + memory + commit + push)
- **Total budget S31: 50% (target hard ceiling)**

## Vincoli enterprise rispettati
- V1 hook context budget gate ATTIVO 40%/50% (NON disabilitare)
- V3 closure ordinata threshold 40% pre-stop
- V4 memory append-only `>>` HANDOFF
- V5 commit template `S31 {scope}: {summary}`
- CTO autonomy: SSH/python/ffmpeg autonomi, Luke fisico SOLO Phase 2 warmup+S1+S2 (3 min)
- Evidence-based: ogni decisione log paste, NO "credo che funzioni"

## Carry-over BLOCKED finché S31 production
- Chunk 2 furniture-to-zones (S30 BLOCKED)
- Chunk 3 Guardian boot integration
- FSM safe-zone audit P1
- V2 pre-flight estimation context budget P1
- Production polish (DR runbook, daily Telegram report)

## Reference files
- `.planning/HANDOFF.md` sezione `[2026-05-01 SESSIONE 30]` + estensione
- `~/.claude/projects/-Users-macbook-Documents-pulizia-smartphone/memory/`:
  - `project_s30_test_inconclusive.md` (3 ipotesi root cause)
  - `feedback_pre_flight_human_test.md` (lesson S30)
  - `project_s29_findings.md` (fix HPT scaling)
  - `feedback_context_budget_structural.md` (5 vincoli)
  - `feedback_evidence_based.md`
  - `feedback_cto_autonomy_verifications.md`
  - `feedback_scope_recalibration.md`

---

**Inizio S31**: leggi reference files, esegui Phase 1.1 immediatamente. NO domande pre-flight, NO conferme intermedie fino a Phase 2 (Luke physical warmup). Decisione PASS/FAIL deterministica end-to-end in singola sessione.
