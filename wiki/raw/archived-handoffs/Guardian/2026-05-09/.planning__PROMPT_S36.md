# PROMPT S36 — Gates pre-MVP execution (G1+G2 fall validation + OQ-2 research)

## Brief
S35 chiusa con ROADMAP-v4 + ADR 008 Strada A+ ibrida ACCEPTED. S36 = **execution gates G1+G2 + research OQ-2** prima di committare M1.3 Frigate sidecar setup.

## Phase 0 — Read obbligatori
1. `memory/project_s35_findings.md` (decisione architetturale)
2. `docs/adr/008-platform-direction.md` (governance)
3. `.planning/ROADMAP-v4.md` (milestone MVP)
4. `memory/project_s34_findings.md` (P0/P1 deployati, P2/P3 deferred)
5. `.planning/HANDOFF.md`

## Plan atomico

### P0 — G1 P2 S34 fall live test (priority assoluto, NORTH STAR)
- Luke fisico sdraiato pavimento davanti divano soggiorno, 90s controllati
- Atteso: Guardian PID `cap_level→LYING_DOWN→FALLEN` + voice confirm Luna + Telegram alert ≤30s
- Audit: snapshot capture continuo + tail guardian.log
- PASS criterion: ≥1 alert FALLEN entro 30s, no FP cascade
- ETA: 20-30min orchestrator + 5min Luke physical
- Tools: `~/guardian/s32_test.sh` orchestrator (S32 reusable), Telegram bot per delivery comandi a Luke (no audio TTS iMac stanza diversa, lesson S31)

### P1 — G2 P3 S34 production activation (SOLO se G1 PASS)
- Re-enable cron watchdog (`# MAINTENANCE S29` uncomment)
- Re-enable cron health-check (`# MAINTENANCE S28+` uncomment)
- Telegram ping production "Guardian fall detection active S34/S36"
- Monitoring 24h zero FP
- ETA: 10-15min

### P2 — OQ-2 research Frigate fall plugin (parallelo a G1/G2 monitoring)
- WebSearch + WebFetch su:
  - "frigate fall detection plugin"
  - "frigate custom event detector posture"
  - "frigate add-on community fall"
- Verificare se esiste plugin Frigate maturo per fall postura sdraiato (NO solo "object stationary")
- Output: `.planning/frigate_fall_plugin_research.md` con verdict (esiste maturo / esiste WIP / nessuno → mantieni Guardian custom fall)
- ETA: 30-45min

### P3 — Decisione M1.3 commit (su base OQ-2)
- Se plugin Frigate fall maturo esiste: revise ADR 008 (forse Strada B non così NOGO?)
- Se WIP/nessuno: confirm Strada A+ ADR 008, planning M1.3 Frigate sidecar setup S37
- Output: addendum `docs/adr/008-platform-direction.md` (sezione "OQ-2 outcome 2026-XX-XX")

## Anti-pattern proibiti S36
- ❌ Saltare G1 fall test "tanto è già stato testato S31/S32" (è il quinto round, è il NORTH STAR)
- ❌ Procedere a M1.3 Frigate setup senza OQ-2 outcome (rischio scope creep)
- ❌ Re-enable cron watchdog senza G1 PASS (cascata FP S29 violation)
- ❌ Modificare Guardian production prima di G1 outcome
- ❌ OQ-1 benchmark live (deferred S35b/S37, NON urgente)

## Vincoli context S36
- Budget 50%, hook enforcement attivo
- G1 fall test = ~10-15% context (orchestrator + audit log + sintesi)
- P2 OQ-2 research = ~10% context (WebSearch + sintesi)
- Riserva closure 5-10%
- Se G1 FAIL: STOP S36, mark P0 NORTH STAR violation, plan recovery S37

## Deferred S37+
- M1.3 Frigate sidecar setup (12-16h, dipende OQ-2 outcome)
- M1.4 F4 fire/smoke YOLOv8 D-Fire (12-16h)
- M1.5 F5 inactivity refinement post baseline learning_days≥3
- M1.6 E2 human verification clip
- OQ-1 Frigate CPU benchmark live (richiede docker pull)
- OQ-3 approval HW Luke €41 Zigbee

## Reference
- ADR 008: `docs/adr/008-platform-direction.md`
- ROADMAP: `.planning/ROADMAP-v4.md`
- Gap matrix: `.planning/feature_gap_matrix.md`
- Frigate desk audit: `.planning/frigate_audit.md`

---
**Inizio S36**: Phase 0 read → G1 fall test live (Luke physical) → G2 production activation → OQ-2 research parallelo → ADR 008 addendum.
