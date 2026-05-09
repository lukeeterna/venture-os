# PROMPT S35 — Strada C: planning architetturale Guardian → piattaforma Perplexity

## Brief
S34 ha chiuso fix tattici Bug A+B (zones polygon + conf 0.15) ma ha rivelato gap enorme tra Guardian attuale (mono-feature fall) e visione Luke da `/Users/macbook/Downloads/sto sviluppando un app che rileva tramite le telec.md` (piattaforma multi-allarme top-di-gamma con profili target persona/animale/entrambi). S35 = sessione **planning-only** per allineare roadmap.

## Vincoli S35 (rigidi)
- **NO codice prodotto**, NO deploy, NO fix tattici. Solo analisi + decisione + roadmap.
- Budget context 50% target. Se >40% pre-decisione → split in S35a/S35b.
- Output **deve** essere una decisione binaria Frigate sì/no con dati, non opinioni.

## Phase 0 — Read obbligatori (no skip)
1. `/Users/macbook/Downloads/sto sviluppando un app che rileva tramite le telec.md` (visione 12 feature)
2. `/Users/macbook/Downloads/Feature 1 — Fall detection sdraiata.md` (8 feature scout repo)
3. `memory/project_s34_findings.md` (stato fix tattici)
4. `memory/project_s33_findings.md` (taufeeque9 LSTM scout)
5. `.planning/ROADMAP-v3.md` (roadmap attuale Guardian-centric)

## Plan atomico

### P0 — Feature gap matrix (45min)
Tabella 12 colonne con per ogni feature Perplexity:
- Stato Guardian attuale (DONE / PARTIAL / MISSING)
- Repo winner (S33 scout)
- Cost estimate ore (8-16-32)
- Dipendenze hardware (sensor multimodale? cam aggiuntiva?)
- Priority (P0/P1/P2/P3)

Output: `.planning/feature_gap_matrix.md`

### P1 — Frigate compatibility audit (45min)
Verifiche FATTUALI (no opinioni):
1. Frigate runs su macOS 12 Big Sur? (docs check + test docker pull)
2. CPU load Frigate vs Guardian custom su 2 RTSP EZVIZ 1920x1080? (benchmark 10min)
3. Frigate MQTT compat con Luna NLU pipeline esistente?
4. Privacy: Frigate inference 100% local? Audit config default
5. Migration cost: zones.json/lines/loitering Frigate native vs custom Guardian?

Output: `.planning/frigate_audit.md` con verdict GO/NOGO + numeri.

### P2 — Decisione architetturale (30min)
Sulla base P0+P1:
- **Strada A** se Frigate NOGO o cost migration > 40h
- **Strada B** se Frigate GO + cost migration < 40h + benefit chiaro
- **Strada A+** ibrida: mantiene Guardian + estrae solo subset Frigate (es. solo recording/clip)

Output: ADR 008 in `docs/adr/008-platform-direction.md` con rationale.

### P3 — Roadmap MVP→Pro→Enterprise (30min)
Solo se P2 deciso. 3 milestone:
- **MVP** (2026-Q3): Strada scelta + F1 fall enterprise (taufeeque9 LSTM) + F2 inactivity zone-based
- **Pro** (2026-Q4): F3 fire + F5 intrusion armed-state + confidence 3-levels + human verification loop
- **Enterprise** (2027-Q1): F6 wandering + F7 pet target selector + F8 event fusion + MLOps active learning

Output: `.planning/ROADMAP-v4.md` (sostituisce v3 Guardian-centric).

## Anti-pattern proibiti S35
- ❌ Scrivere codice "tanto è solo un'idea"
- ❌ Toccare Guardian production (PID 19339 stable post-S34)
- ❌ Decidere Frigate senza benchmark CPU reale
- ❌ Roadmap senza cost estimate (8h/16h/32h granularity minima)
- ❌ Saltare Phase 0 read perché "già letto in S34" (Luke ha sottolineato ALLINEAMENTO sulla SUA visione)

## P2-P3 sblocco S34 deferred
Solo dopo P2 decision in S35:
- Re-test live 90s Luke pavimento (P2 S34 originale) → SE Strada A scelta
- SE Strada B scelta: skip P2 S34 (Guardian custom verrà dismesso/refactored)

## Reference S35
- Visione Luke: `/Users/macbook/Downloads/sto sviluppando un app che rileva tramite le telec.md`
- Scout repo: `/Users/macbook/Downloads/Feature 1 — Fall detection sdraiata.md`
- Stato attuale: `memory/project_s34_findings.md`
- ADR esistenti: `docs/adr/006-hostname-resolution-strategy.md`, `docs/adr/007-distributable-addressing.md`

---
**Inizio S35**: Phase 0 read (5 file) → P0 feature gap matrix → P1 Frigate audit reale → P2 decisione ADR 008 → P3 ROADMAP-v4. NO CODICE.
