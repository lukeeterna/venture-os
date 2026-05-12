# PROMPT S58 — Multi-Person Safe-Zone Filter (per-track_id)

> Generato da S57 closure (2026-05-12, closure ~45%). Copia/incolla all'inizio della prossima sessione.

## Stato post-S57

- `run_upstream.py` STOPPED su iMac (PID 56848 killed)
- `launchctl com.zeroclaw.fall-detector` UNLOADED (gating respected, FP H24 prevented)
- MQTT `zeroclaw/guardian/fall` publish operativo (validato 2× in test S57 FP)
- 3 snapshot FP `/tmp/fall-poc/alert_*.jpg` su iMac (audit visivo)
- Repo `origin/main` clean (S57 read-only investigation, no commit)

## P0 — Root cause S57 FAIL (carry-over critico)

S57 test naturale FAIL: 2× `[ALERT] FALL Warning` in 90s con Luke su divano + altre persone in casa.

**Evidence**:
- FP1 snapshot: persona terza in piedi vicino finestra tiene gatto in braccio. Luke NON nel frame al momento trigger. LSTM upstream taufeeque9 misclassifica pose verticale ambigua.
- FP2 snapshot: scena simile, `persons=0` post-trigger (pose lost upstream, bug S40-S42 unresolved residuo).

**Root cause STRUTTURALE** (non bug codice):
- `run_upstream.py:103-119` `all_persons_in_safe_zone`: ritorna True solo se TUTTI i centroid dentro safe-zone polygon
- Commento linea 119 esplicito: "at least one person outside any safe zone → alerts fire"
- Multi-person scenario reale (famiglia in casa): almeno 1 persona fuori divano → filter ritorna False → LSTM verdict passa → FP
- Safe-zone S53 P1 corretto come codice MA semantica "all-inside" inadatta a famiglia

## Obiettivo S58 (priorità ordinata)

### P0 — Per-track_id safe-zone filter (Opzione B)

**Lettura preliminare**:
- `~/fall-poc/algorithms.py` — capire mapping LSTM output → bbox/track_id
- `~/fall-poc/run_upstream.py:286-300` — area attuale safe-zone check post-LSTM verdict

**Design**:
- Identificare quale persona ha generato FALL verdict (track_id dell'LSTM)
- Check safe-zone SOLO su track_id falling: se il centroid del falling-person è dentro safe-zone divano → sopprimi alert
- Altre persone outside diventano irrilevanti (semantica corretta single-fall-multi-bystander)

**Implementation**:
- Refactor `all_persons_in_safe_zone(bbox_list, safe_zones)` → `falling_person_in_safe_zone(falling_bbox, safe_zones)`
- Update call site con bbox specifico della persona classificata FALL (richiede tracking LSTM verdict → bbox mapping)

### P1 — Validation multi-person controllato (gated su P0 PASS)

Pre-flight OBBLIGATORIO (lesson S31/S37/S43/S54 recidiva 4×):
- snapshot RTSP soggiorno via go2rtc 127.0.0.1:8554
- smoke run_upstream.py 30s idle SCENA REALE (con altre persone presenti) → expect zero `[ALERT]`
- talkback EZVIZ aac_talk standalone test

Test naturale:
- **S0 multi**: Luke + 1-2 altri tutti in piedi 60s → expect NO `[ALERT]`
- **S1 multi**: Luke sul divano + altri in piedi 60s → expect NO `[ALERT]` (safe-zone Luke applica)
- **S2 multi**: Luke pavimento + altri in piedi 60s → expect `[ALERT] FALL Warning` entro ~18s (consec_frames=60 @ 3.3fps)

### P2 — Luna MQTT subscribe (deferred S57 P1)

Gated su P1 PASS multi-person. Phone Luna v4.1 subscribe `zeroclaw/guardian/fall` con voice confirm Edge-TTS Isabella.

### P3 — Production activation LaunchAgent

Gated su zero-FP guard ≥30min multi-person validato. Reference: `feedback_production_activation_gating.md`.

## Vincoli sessione S58

- **Budget closure ordinata ≤50%** (V1 hook 40/50% LIVE production)
- **Pre-flight upstream sanity check OBBLIGATORIO** prima human test (lesson S54 recidiva 2×)
- **Snapshot capture autonomo OBBLIGATORIO** pre-test (lesson S43)
- **Multi-person scenario realistico** — single-occupant test non rappresentativo della casa Luke
- **Honest closure** se task >10% restante budget: WIP esplicito, no inerzia (anti-pattern S54)

## File chiave

| Path | Ruolo |
|------|-------|
| `~/fall-poc/run_upstream.py` (iMac) | Pipeline + safe-zone filter (refactor P0) |
| `~/fall-poc/algorithms.py` (iMac, taufeeque9 upstream) | LSTM verdict + bbox mapping (read P0) |
| `scripts/fall-poc/run_upstream.py` (Mac) | Source of truth pre-deploy |
| `~/guardian/zones.json` (iMac) | safe-zone polygons (no modifiche) |
| `~/Library/LaunchAgents/com.zeroclaw.fall-detector.plist` (iMac) | Gated, riattiva P3 |
| `/tmp/fall-poc/alert_1778589726_*.jpg` (iMac) | FP1 evidence audit visivo |
| `/tmp/fall-poc/alert_1778589758_*.jpg` (iMac) | FP2 evidence audit visivo |

## Leggi sempre prima di partire

1. `.planning/HANDOFF.md` (stato progetto)
2. MEMORY entries `project_s51_findings.md` → `project_s57_findings.md` (last 7 sessioni)
3. `feedback_pre_flight_human_test.md`
4. `feedback_production_activation_gating.md`
5. `feedback_test_human_orchestration_audio.md`

---

**Note operative**:
- P0 richiede design + refactor, non solo bugfix. Budget realistico ~25-35%.
- P1 multi-person test richiede 2-3 persone in casa simultaneamente (Luke + Ida + bambini) — coordinare con Luke prima
- Pattern Karpathy: sessione chiude verde o handoff esplicito, no PARTIAL/ARANCIONE
- Anti-pattern S54: scope expansion mid-session vietato. Se P1 non fattibile (no persone in casa), chiudi su P0 verde senza forzare physical test
