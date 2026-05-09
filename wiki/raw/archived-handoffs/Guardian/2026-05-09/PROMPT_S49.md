# PROMPT_S49 — Fix POC fall_standalone features pipeline

## CONTEXT
S48 smoke test 2026-05-05 19:30: fix S47 `is_valid` (line 257) ha sbloccato primo crash, ma SECONDO bug strutturale emerso → `vis/inv_pendulum.py:295 KeyError: 'features'`. POC `fall_standalone.py:282` chiama `build_features(t.ip_set)` ma gli `ip_dict` push'ati in `tracks[pid].push(ip_dict)` (line 272) NON hanno chiave `features` precomputata. Upstream taufeeque9 ha `get_all_features` (vis/inv_pendulum.py:406) che popola features ma POC non la chiama.

## P0 — Decisione strategica (10 min)
3 opzioni:
- **A. Fix POC custom**: integra feature extraction (~50-80 LOC) prima di `push(ip_dict)` — popola `features` con `ratio_bbox`, `height_bbox`, `angle_vertical`, `re_matrix`, `gf_matrix`
- **B. Adapt taufeeque9 upstream**: usa direttamente `vis/inv_pendulum.get_all_features(ip_set, lstm_set, model)` invece di build_features POC
- **C. Pivot**: stop fall_standalone POC, valuta altro fork (Frigate fall plugin? altro repo?) o Guardian custom S40 fix più surgical

Confronto vs Opzione α S45 (YOLOv8-pose + LSTM taufeeque9 pre-trained, 3.4 fps): A/B mantengono path α, C cambia path.

## P1 — Implementazione opzione A o B (se scelta)
- Read `~/fall-poc/vis/inv_pendulum.py:406-500` `get_all_features` signature/dependencies
- Read `~/fall-poc/algorithms.py` per pipeline upstream features ordering
- Patch `~/fall-poc/fall_standalone.py:265-275` (post `ip_dict` build pre `push`) — popola `ip_dict["features"]`
- Smoke test 10s con persona davanti camera → expect `pred=` popolato, NO traceback
- Se PASS → physical FALL test orchestrator (P2 S48)

## P2 — Physical retry (se P1 PASS)
- Riusa `~/fall-poc/s47_orchestrator.sh` (audio iMac say speaker validato S47)
- Sequenza: brief 30s prep → P1 idle 30s divano → P2 fall 90s pavimento
- Expect: entro 7-15s posizione orizzontale → `🚨 FALL` + snapshot + Telegram alert

## Backlog deferred
- Tuning candidates (relax is_valid, TRACK_DIST_PX, FALL_STREAK, conf threshold) — solo se P2 FAIL ML
- Safe-zone polygon import zones.json
- MQTT publish zeroclaw/guardian/fall (Luna integration)
- LaunchAgent autostart
- iMac Multipass stop, bridge.err, ffmpeg, dead code cleanup pose_smoke.py + shufflenetv2k16

## Memory ref
- `project_s47_findings.md` — bug is_valid + features (2 bug strutturali POC)
- `project_s46_findings.md` — POC build evidence (idle smoke insufficiente)
- `feedback_test_human_orchestration_audio.md` — fully autonomous audio iMac

## Entry command S49
```bash
ssh gianlucadistasi@imac-di-gianluca.local 'lsof -iTCP:8554 -sTCP:LISTEN | head -2; tail -15 /tmp/fall-poc/smoke-s48.log; sed -n "405,430p" ~/fall-poc/vis/inv_pendulum.py'
```
