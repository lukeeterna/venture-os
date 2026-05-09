# PROMPT S32 — CTO ENTERPRISE: Guardian production activation con test audio-affidabili + snapshot industriale

## Brief
Sei il CTO di ZeroClaw. €220/mese, lavoro enterprise atteso. **S30 e S31 entrambi falliti** per test condition broken (S30 boxes=0 upstream, S31 audio TTS iMac non raggiunge soggiorno + zero snapshot capture). Lessons in `feedback_pre_flight_human_test.md` + `feedback_test_human_loop_delivery.md`. **NON ripetere**.

## Stato esatto post-S31 (commit `034c971`)
- Guardian PID 2013 RUNNING su iMac (verificare alive a inizio S32, può essere riavviato)
- HPT fix S29 LIVE: `[hpt:soggiorno] HPT enabled (frame=1920x1080)` startup confermato
- Watchdog cron + health-check cron DISABLED (`# MAINTENANCE S29` / `# MAINTENANCE S28+`)
- Phase 1 diagnostic S31 PASS: stream live, framing OK, POSE pipeline operational
- Phase 2 test FAIL: Guardian boxes=0 per 5 min test 12:39-12:43, root cause sospettata audio TTS iMac → soggiorno (stanze diverse)
- Snapshots baseline: `~/guardian/snapshots/soggiorno_S31_live.jpg` (10:27), `soggiorno_S31_postest.jpg` (12:43:42)
- Telegram bot `8681473846:AAGeRFHsO_iFy8_dHzbfHibeDdfSNYK4hho` chat `931063621` attivo (per ack/alert, NON per orchestrator)

## Vincoli non negoziabili S32

### Vincolo audio delivery (lezione S31)
- ❌ **NO TTS iMac** (`say -v Alice`) — speaker iMac in stanza diversa, non raggiunge soggiorno
- ❌ **NO Telegram orchestrator** — Luke mani occupate phone se sdraiato, vincolo fisico
- ✅ **SI phone Termux TTS** — phone posizionato su mobile soggiorno, volume alto, mani libere Luke
- Comando: `ssh -p 8022 192.168.1.11 "termux-tts-speak -r 1.1 'frase'"`

### Vincolo evidence capture (lezione S31)
- ❌ **NO test senza snapshot capture** durante scenari
- ✅ **SI ffmpeg snapshot ogni 10s** in `~/guardian/snapshots/s32/` (18 file timestamped)
- ✅ **SI POSE auto-analysis** post-test su tutti snapshot (3 conf levels: 0.25/0.15/0.05)
- ✅ **SI visual audit** Read tool su subset snapshot prima decision PASS/FAIL

### Vincolo pre-flight delivery
- ✅ **Pre-flight ack obbligatorio**: prima di lanciare orchestrator, eseguire test audio singolo `ssh phone "termux-tts-speak 'Luke conferma audio sentito rispondi vai'"` → Luke risponde "vai" → solo allora orchestrator.

## Mandato S32 — ZERO COMPROMESSI

### Phase 1 — Pre-flight (max 10% context, ZERO Luke physical)
1.1 **Verify Guardian alive**: `ssh imac "ps -p $(cat ~/guardian/guardian.pid 2>/dev/null || echo 0) -o pid,etime"` → se dead, restart `~/guardian/start-guardian.sh`
1.2 **Verify phone reachable**: `ssh -p 8022 -o ConnectTimeout=5 192.168.1.11 "echo phone_ok"` → se fail, fallback Tailscale `100.100.104.104:8022`
1.3 **Verify termux-tts-speak available**: `ssh phone "which termux-tts-speak && termux-tts-engines"` → conferma installato
1.4 **Snapshot pre-test**: `ffmpeg -i rtsp://127.0.0.1:8554/soggiorno -frames:v 1` → diff vs `soggiorno_S31_postest.jpg` md5

### Phase 2 — Audio delivery test (max 5% context, 30s Luke physical)
2.1 Execute: `ssh phone "termux-tts-speak -r 1.1 'Test audio S 32. Se mi senti rispondi vai a Claude.'"` 
2.2 STOP, attendi risposta Luke "vai" o "non sento" o volume issue
2.3 Se "non sento" → STOP, escalate Luke physical (alza volume phone, riposiziona, ri-test)
2.4 Se "vai" → Phase 3

### Phase 3 — Validated test 4-scenari con evidence capture (max 20% context, 3 min Luke physical)
Deploy orchestrator `~/guardian/s32_test.sh`:

```bash
#!/bin/bash
set -euo pipefail
SNAP_DIR="$HOME/guardian/snapshots/s32"
mkdir -p "$SNAP_DIR" && rm -f "$SNAP_DIR"/*.jpg
PHONE="ssh -p 8022 -o StrictHostKeyChecking=no 192.168.1.11"
mark() { logger -t guardian "[S32-TEST] $1"; echo "[$(date '+%H:%M:%S')] [S32] $1"; }
snap() { /usr/local/bin/ffmpeg -y -loglevel error -rtsp_transport tcp \
    -i rtsp://127.0.0.1:8554/soggiorno -frames:v 1 -q:v 2 -update 1 \
    "$SNAP_DIR/$(date '+%H%M%S')_$1.jpg" 2>/dev/null || true; }
say() { $PHONE "termux-tts-speak -r 1.1 -- '$1'"; }

mark "ORCHESTRATOR START"
say "Test S 32. Inizia tra otto secondi."
sleep 8

# === S0 WARMUP 30s (3 snap @10s) ===
say "Scenario zero. Vai al centro soggiorno e agita la mano per trenta secondi."
mark "S0 START"
for i in 1 2 3; do sleep 10; snap "S0_$i"; mark "S0 snap $i"; done
mark "S0 END"
say "Scenario zero terminato. Resta in piedi."
sleep 3

# === S1 SDRAIATO DIVANO 90s (9 snap @10s) — FP test critical ===
say "Scenario uno. Sdraiati sul divano per novanta secondi. Guardian deve restare in silenzio."
mark "S1 START FP_TEST"
for i in 1 2 3 4 5 6 7 8 9; do sleep 10; snap "S1_$i"; mark "S1 snap $i"; done
mark "S1 END"
say "Scenario uno terminato. Alzati lentamente."
sleep 5

# === S2 PAVIMENTO 60s (6 snap @10s) — FN test critical ===
say "Scenario due. Sdraiati sul pavimento davanti al divano. Guardian deve scattare allarme caduta."
mark "S2 START FN_TEST"
for i in 1 2 3 4 5 6; do sleep 10; snap "S2_$i"; mark "S2 snap $i"; done
mark "S2 END"
say "Test completato. Puoi alzarti."
mark "ORCHESTRATOR END"

# === Auto POSE analysis ===
echo "=== POSE ANALYSIS ==="
cd ~/guardian
python3 <<'PYEOF'
from ultralytics import YOLO; import cv2, glob, os
m = YOLO('yolov8n-pose.pt')
for f in sorted(glob.glob(os.path.expanduser('~/guardian/snapshots/s32/*.jpg'))):
    img = cv2.imread(f)
    if img is None: continue
    res = []
    for c in [0.25, 0.15, 0.05]:
        r = m.predict(img, conf=c, verbose=False)[0]
        n = len(r.boxes) if r.boxes is not None else 0
        res.append(f"c={c}:n={n}")
    print(f"{os.path.basename(f)}: {' | '.join(res)}")
PYEOF

echo "=== GUARDIAN LOG ==="
grep -E "S32|FALL|HPT|FSM|boxes=" ~/guardian/logs/guardian.log | tail -50
```

### Phase 4 — Visual audit + decision (max 10% context, ZERO Luke physical)
4.1 Pull subset (S0_2, S1_5, S2_3) snapshot Mac local
4.2 Read tool su 3 snapshot → confermare Luke fisicamente in frame in posizioni attese
4.3 **Decision tree deterministica**:
- **Luke in frame TUTTI snapshot + S0/S1/S2 boxes>0 @ conf=0.25 + S1 zero FALL alert + S2 FALL alert ≤30s** → ALL PASS, procedi Phase 5
- **Luke in frame + S0 boxes=0 @ 0.25 ma boxes>0 @ 0.15** → conf threshold issue confermato, fix `~/guardian/guardian.env` lower conf 0.15 + safe-zone FP filter, ri-test S33
- **Luke NON in frame qualche snapshot** → audio/coordination issue residuo, escalate Luke setup phone position, ri-test S33
- **S2 NO FALL alert anche con Luke in frame** → FSM/HPT/cam-level threshold issue, debug fall detection logic S33

### Phase 5 — Production activation (solo se Phase 4 ALL PASS, max 5% context)
5.1 Re-enable cron watchdog: editare crontab rimuovere `# MAINTENANCE S29`
5.2 Re-enable cron health-check: editare crontab rimuovere `# MAINTENANCE S28+`
5.3 Verify launchctl `com.guardian` persistence (auto-restart iMac reboot)
5.4 Telegram ping conferma: `curl -s "https://api.telegram.org/bot${TOKEN}/sendMessage" -d "chat_id=931063621&text=Guardian production live S32 PASS"`
5.5 Health-check 24h via cron `*/15` → verify zero alert spurious

### Acceptance criteria S32 (production-ready)
- [ ] Phase 1 pre-flight ALL PASS (Guardian alive, phone reachable, TTS available, stream live)
- [ ] Phase 2 audio ack Luke "vai" ricevuto
- [ ] Phase 3 orchestrator eseguito 18 snapshot capturati + POSE analysis output
- [ ] Phase 4 visual audit Luke in frame ≥80% snapshot
- [ ] S0 warmup boxes>0 in Guardian log
- [ ] S1 sdraiato divano 90s → 0 FALL alert (test FP)
- [ ] S2 pavimento 60s → ≥1 FALL alert ≤30s (test FN)
- [ ] Cron watchdog + health-check RE-ENABLED
- [ ] Commit `S32 production: {summary}` + evidence log paste

### Anti-pattern proibiti S32
- ❌ Test senza Phase 2 audio ack Luke esplicito
- ❌ Test senza snapshot capture continuo durante scenari
- ❌ Decision PASS/FAIL senza visual audit Read tool su subset snapshot
- ❌ Re-enable cron senza Phase 4 ALL PASS
- ❌ Audio delivery via TTS iMac o Telegram (vincolo fisico Luke mani)
- ❌ Scope creep verso Chunk 2 furniture (BLOCKED finché production stable)

## Time budget S32 (target hard ceiling 50%)
- Phase 1 (pre-flight): max 10%
- Phase 2 (audio ack): max 5%
- Phase 3 (test orchestrator): max 20%
- Phase 4 (visual audit + decision): max 10%
- Phase 5 (activation OR closure WIP): max 5%
- **Total budget S32: 50%**

## Vincoli enterprise rispettati
- V1 hook context budget gate ATTIVO 40%/50% (NON disabilitare)
- V3 closure ordinata threshold 40% pre-stop
- V4 memory append-only `>>` HANDOFF
- V5 commit template `S32 {scope}: {summary}`
- CTO autonomy: SSH/python/ffmpeg autonomi, Luke fisico SOLO Phase 2 (30s ack) + Phase 3 (3 min posizioni)
- Evidence-based: ogni decisione log paste + snapshot path + POSE numbers, NO "credo che funzioni"
- Mani libere Luke: vincolo non negoziabile per scenari sdraiato

## Carry-over BLOCKED finché S32 production
- Chunk 2 furniture-to-zones (S30 BLOCKED)
- Chunk 3 Guardian boot integration
- FSM safe-zone audit P1
- V2 pre-flight estimation context budget P1
- Production polish (DR runbook, daily Telegram report)

## Reference files
- `.planning/HANDOFF.md` sezione `[2026-05-01 SESSIONE 31]`
- `~/.claude/projects/-Users-macbook-Documents-pulizia-smartphone/memory/`:
  - `project_s31_findings.md` (Phase 1 PASS, Phase 2 FAIL audio, S32 spec)
  - `feedback_test_human_loop_delivery.md` (delivery + capture evidence mandatory)
  - `feedback_pre_flight_human_test.md` (S30 lesson)
  - `project_s30_test_inconclusive.md` (boxes=0 S30 root cause)
  - `project_s29_findings.md` (HPT scaling fix)
  - `feedback_context_budget_structural.md` (5 vincoli)
  - `feedback_evidence_based.md`
  - `feedback_cto_autonomy_verifications.md`
  - `feedback_isabella.md` (Luna TTS termux-media-player)

---

**Inizio S32**: leggi reference files, esegui Phase 1 immediatamente. Phase 2 audio ack Luke = unica conferma intermedia. Phase 3 orchestrator deploy + run automatico. Phase 4 decision deterministica. Decision PASS/FAIL end-to-end in singola sessione.
