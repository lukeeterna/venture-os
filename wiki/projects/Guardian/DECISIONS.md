# Guardian — DECISIONS.md

> Architecture Decision Records lean (5-field schema). Append-only.
> Mai cancellare entry SUPERSEDED — sostituirne lo Status e linkare alla nuova D-NN.
> Cross-reference ARGOS/FLUXION DECISIONS.md per decisioni cross-progetto.
>
> **Schema entry**:
> ```
> ## D-NN — Titolo (YYYY-MM-DD, sessione)
> **Status**: OPEN | DECIDED | SUPERSEDED-by-D-MM
> **Contesto**: 2-3 righe
> **Opzioni considerate**: 2-4 bullet
> **Decisione**: 1-2 righe + chi
> **Conseguenze**: 2-4 bullet operativi
> ```
>
> **Drift note** (S173-VOS-coord 2026-05-15): CLAUDE.md user-level riga 47 dichiara Guardian = "pulizia smartphone, stack TBD, in costruzione". Verifica `wiki/projects/Guardian/COMPILED-STATE.md` (12 mag) rivela invece fall-detection production-grade su iMac (run_upstream.py 369 LOC, YOLOv8n-pose + LSTM, MQTT topic operativo). Founder S173 ha chiarito: Guardian = **2 verticali separati** (fall-detection + pulizia smartphone), DECISIONS.md riflette questa realtà. Update CLAUDE.md riga 47 = TODO out-of-scope S173 (flag handoff S174).

---

## D-01 — Scope Guardian: 2 verticali separati (fall-detection + pulizia smartphone) (2026-05-15, S173-VOS-coord)

**Status**: DECIDED (founder S173 raw "Entrambi (2 verticali)")
**Contesto**: Drift documentazione CLAUDE.md vs realtà filesystem. CLAUDE.md riga 47 dice "Guardian = pulizia smartphone, stack TBD". COMPILED-STATE Guardian 12 mag mostra fall-detection production-stage (S58→S60→S64→S65, MQTT operativo, smoke test PASS, launchctl UNLOADED pre-attivazione). Founder S173 conferma scope multi-modulo.
**Opzioni considerate**:
- (a) Guardian = solo fall-detection (pulizia smartphone = side-POC personal)
- (b) Guardian = solo pulizia smartphone (fall-poc = esperimento separato)
- (c) Guardian = suite 2 verticali (fall-detection anziani + pulizia smartphone)
**Decisione**: Opzione (c). Guardian è suite multi-modulo. Verticale 1 = fall-detection (mature, production-grade, gated su zero-FP test naturale ≥30min). Verticale 2 = pulizia smartphone (TBD scope dettagliato, vedi D-04 OPEN).
**Conseguenze**:
- DECISIONS.md Guardian riflette entrambi i verticali separatamente (D-NN dedicate per ogni verticale).
- CLAUDE.md riga 47 da aggiornare: "Guardian = suite 2 verticali (fall-detection + pulizia smartphone)" — out-of-scope S173, flag handoff S174.
- Compilation Karpathy futura aggrega COMPILED-STATE per verticale (sub-section fall-detection vs sub-section pulizia smartphone).
- Pre-action-check skill ora attiva per Guardian (DECISIONS.md presente).

**Ref**: CLAUDE.md riga 47 (drift), wiki/projects/Guardian/COMPILED-STATE.md (12 mag 2026), founder S173-VOS-coord
<!-- last_reviewed: 2026-05-15 -->

---

## D-02 — Verticale fall-detection: stack production yolov8n-pose + LSTM + MQTT (2026-05-15, S173-VOS-coord)

**Status**: DECIDED (formalizzazione retroattiva decisioni S60+S64, founder validato S173)
**Contesto**: Verticale 1 (fall-detection). Decisioni tecniche prese de facto durante S58→S65 fall-poc development. Formalizzate qui per ancoraggio pre-action-check skill e prevenzione drift futuro.
**Opzioni considerate** (revisitate post-S60 addendum):
- (a) yolov8s-pose (più accurato, ma performance insufficienti su iMac 2012 no AVX2)
- (b) yolov8n-pose (production, performance ok, accuracy sufficiente)
- (c) yolov11n-pose (deferred, futuro upgrade condizionato a ricerca)
**Decisione**: Opzione (b) per production. Stack canonico: YOLOv8n-pose (class gate COCO person-only) → MOG2 motion pre-filter (warmup 100, skip LSTM se motion <0.5%) → LSTM `get_all_features` (warmup 60 frame) → safe-zone check `falling_person_in_safe_zone(ip_set[0][-1]["box"])` → MQTT publish `zeroclaw/guardian/fall`.
**Conseguenze**:
- File canonico: `~/fall-poc/run_upstream.py` (369 LOC S64).
- Pesi production: `yolov8n-pose.pt` (escluso `yolov8s-pose.pt` per perf hardware Luke).
- Backup chain preservato: `.bak-s58`, `.bak.s60`, `.bak.s64`.
- Upgrade futuro a yolov8s o yolov11n condizionato a ONNX export benchmark (target ≥2.2 fps) + ricerca dataset GMDCSA-24.

**Ref**: COMPILED-STATE.md S58/S60/S64 sections, `~/fall-poc/run_upstream.py`, `~/guardian/zones.json`
<!-- last_reviewed: 2026-05-15 -->

---

## D-03 — Activation production gating: zero-FP test naturale Luke ≥30min (2026-05-15, S173-VOS-coord)

**Status**: DECIDED (formalizzazione retroattiva S58/S60/S64 gating policy, founder validato S173)
**Contesto**: `launchctl com.zeroclaw.fall-detector` rimane UNLOADED in production. Gating gerarchico richiesto da Luke per evitare attivazione production con FP residui (caso S57 multi-person FP strutturale).
**Opzioni considerate**:
- (a) Activation post-smoke test idle ok (60s, 0 ALERT)
- (b) Activation post-test naturale Luke fisico multi-person ≥30min zero-FP (scenario S57: divano + persona terza in piedi con gatto)
- (c) Activation con bayesian threshold runtime (deferred sprint dedicato)
**Decisione**: Opzione (b). Gate P3 (`launchctl load`) condizionato a P1 (test naturale Luke) PASS. P2 (Luna MQTT subscribe `zeroclaw/guardian/fall`) condizionato a P1 PASS.
**Conseguenze**:
- Production activation pipeline: P0 (smoke idle) → P1 (Luke fisico multi-person ≥30min) → P2 (Luna MQTT subscribe) → P3 (`launchctl load`).
- Blocker corrente: P1 richiede tempo fisico Luke + presenza 3a persona (gatto opzionale). Stato attuale = pre-P1.
- ADR 009 (dataset selection analysis-first GMDCSA-24) deferred S65+ sprint dedicato.

**Ref**: COMPILED-STATE.md Blocker aperti L62-74, S58 PROMPT (3 snapshot FP `/tmp/fall-poc/alert_*.jpg` audit visivo)
<!-- last_reviewed: 2026-05-15 -->

---

## D-04 — Verticale pulizia smartphone: scope dettagliato OPEN (2026-05-15, S173-VOS-coord)

**Status**: OPEN
**Contesto**: Verticale 2 (pulizia smartphone) menzionato CLAUDE.md riga 47 ma stack/target user/scope operativo TBD. Founder S173 conferma esistenza del verticale ma non ha definito perimetro implementativo.
**Opzioni considerate**: TBD (richiede sessione discovery dedicata)
**Decisione**: NESSUNA. Apre Open Question OQ-01 (vedi sezione "Open questions / Risks" sotto).
**Conseguenze**:
- Nessuna implementazione né research finché founder definisce scope.
- Pre-action-check skill applica nudge ma con flag `[no-D-ref]` su proposte tecniche pulizia smartphone (D-XX dedicata mancante).
- Out-of-scope S173: scope discovery pulizia smartphone è materiale per sessione separata.

**Ref**: CLAUDE.md riga 47 (origine menzione), founder S173 raw (scope TBD)
<!-- last_reviewed: 2026-05-15 -->

---

## D-05 — Architettura distribuzione clienti zero-cost: telecamere IP + smartphone notification (research-pending) (2026-05-15, S173-VOS-coord)

**Status**: DECIDED (founder S173 raw "l'obiettivo per guardian è avere solo le telecamere ip wifi e ai figli lo smartphone da trovare metodo per far 'girare' il sistema no cost per i clienti")
**Contesto**: Vincolo founder #5 (zero-cost) esteso lato cliente Guardian: nessun hardware dedicato venduto al cliente, sfruttare device esistenti (router casa con IP cam wifi già installate, smartphone caregiver/figli). "Far girare" sistema su infra cliente esistente = sfida aperta (dove gira inference? Google Drive sync? edge mobile? cloud free-tier?).
**Opzioni considerate**:
- (a) Inference su edge device cliente (Raspberry Pi €40, viola zero-cost cliente)
- (b) Inference su iMac casa Luke centrale (cliente N → 1 Luke iMac, non scala)
- (c) Inference su smartphone caregiver via on-device model (yolov8n converted Core ML / TFLite, no costo)
- (d) Inference su free-tier cloud (Colab T4 ngrok stack VOS — esistente skill `free-gpu-api`, ma latenza fall-alert critica)
**Decisione**: Architettura target = telecamere IP wifi cliente + smartphone caregiver come endpoint notifica. Inference location/method = **deep research richiesta** (founder S173 esplicito "deep research necessaria con dati"). Vincolo: ZERO-COST CLIENTE.
**Conseguenze**:
- Nessuna implementazione production lato cliente finché research completata.
- Research scope OQ-02 (vedi Open questions): benchmark on-device vs free cloud vs edge piccolo costo cliente acettabile.
- Possibile dependency Google account cliente (Drive sync video clip / Firebase notifica) — da validare zero-cost realtà free-tier Google.
- Skill VOS `free-gpu-api` candidato evaluation per inference layer.

**Ref**: founder S173 raw, CLAUDE.md vincolo #5 (zero-cost), skill `free-gpu-api` ~/.claude/skills/, COMPILED-STATE.md (architettura attuale = iMac Luke only)
<!-- last_reviewed: 2026-05-15 -->

---

# Indice cronologico

| # | Titolo | Status | Data | Sessione |
|---|--------|--------|------|----------|
| D-01 | Scope Guardian = 2 verticali (fall-detection + pulizia smartphone) | DECIDED | 2026-05-15 | S173-VOS-coord |
| D-02 | Fall-detection stack production yolov8n-pose + LSTM + MQTT | DECIDED | 2026-05-15 | S173-VOS-coord |
| D-03 | Activation gating zero-FP test naturale Luke ≥30min | DECIDED | 2026-05-15 | S173-VOS-coord |
| D-04 | Verticale pulizia smartphone scope dettagliato | OPEN | 2026-05-15 | S173-VOS-coord |
| D-05 | Architettura clienti zero-cost IP cam + smartphone (research-pending) | DECIDED | 2026-05-15 | S173-VOS-coord |

**Totale**: 4 DECIDED + 1 OPEN. File iniziato S173-VOS-coord post-resolution drift CLAUDE.md vs COMPILED-STATE.

---

# Open questions / Risks

1. **OQ-01 (D-04 dep)**: Pulizia smartphone scope dettagliato. Founder TBD: stack, target user (anziani con smartphone vecchi? caregiver che ripulisce device padre/madre?), business model (€/intervento? SaaS? gratuito acquisition?), modalità interazione (app dedicata? wizard? automation cloud?). Sessione discovery richiesta pre-implementazione.
2. **OQ-02 (D-05 dep)**: Inference location/method zero-cost cliente. Deep research richiesta (founder S173 esplicito "con dati"). Variabili: (a) on-device smartphone (Core ML/TFLite yolov8n latency benchmark), (b) free-tier cloud (Colab T4 ngrok via VOS skill `free-gpu-api`, latenza accettabile per fall-alert?), (c) Google ecosystem free (Drive sync video clip + Firebase Cloud Messaging notifica, quota free-tier reale 2026). Scope research: latenza, costo cliente, privacy (video face stream), affidabilità connessione casa anziano.
3. **OQ-03**: P1 test naturale Luke ≥30min multi-person. Blocker P2+P3 production activation. Richiede tempo fisico + 3a persona (scenario S57).
4. **OQ-04**: ADR 009 dataset selection (GMDCSA-24 + fine-tuning). Deferred S65+ sprint dedicato.
5. **OQ-05**: CLAUDE.md riga 47 update da "pulizia smartphone, stack TBD, in costruzione" a "suite 2 verticali (fall-detection + pulizia smartphone)". Out-of-scope S173, flag handoff S174.
6. **OQ-06**: Pacchettizzazione pricing Guardian "in base esigenze clienti" (founder S173). Business model TBD pre-revenue: lock-in B2C anziani, B2B RSA/case riposo, freemium con upgrade verticali, partnership ASL/comuni. Defer fino primo revenue ARGOS/FLUXION (CLAUDE.md vincolo #5).
