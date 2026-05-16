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

**Status**: SUPERSEDED-by-D-06 (S178 — deep research + founder Q1-Q5 validation)
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

## D-06 — Architettura cliente: camera-agnostic RTSP + Oracle Free Tier backend Luke (2026-05-15, S178-VOS-coord)

**Status**: DECIDED (founder S178 raw Q1=a+camera-agnostic, Q3=a-implicito, Q5=a-casa-Luke; SUPERSEDES D-05)
**Contesto**: D-05 OQ-02 deep research S177→S178 ha invalidato pattern "AI on-device camera vendor-specific" (Tapo C460 battery no-RTSP, KamiHome SaaS-only, eufy fall-event proprietary app). Founder S178 specifica vincolo: "il sistema deve funzionare con TUTTI i modelli di cam wifi". Test bench: 2 EZVIZ wifi già operative casa Luke (RTSP-verified: `rtsp://admin:QSTOZH@192.168.1.4:554/h264_stream`).
**Opzioni considerate**: vedi `wiki/projects/Guardian/RESEARCH-OQ02-zero-cost-client.md` (5 opzioni analizzate, tabella decisione, autocritica v1+v2).
**Decisione**: Architettura cliente **hybrid (e+d-lite) CAMERA-AGNOSTIC**:
- **Input layer**: qualunque IP camera wifi con RTSP/ONVIF standard (Tapo C200/C210, EZVIZ, Reolink, Hikvision, generic ONVIF) — cliente porta sua cam o acquista commodity €20-€40 retail Italia.
- **Inference backend**: Oracle Cloud ARM A1 Free Tier (forever-free, EU region Frankfurt/Milan), esegue `run_upstream.py` (D-02 stack PRESERVED) con motion-gated frame sampling low-res 480p.
- **Notify layer**: FCM Firebase (free unlimited).
- **Caregiver UX**: app/PWA TBD (OQ-02.4 next session).
- **Test bench**: 2 EZVIZ casa Luke (self-dogfooding diretto Q5).
**Conseguenze**:
- D-02 NON sunset, scope EXTEND: backend cliente production + iMac casa Luke dev/test.
- Camera-agnostic = no vendor shortlist required, sistema ingest RTSP-standard universale. Lavoro extra: tolleranza variazioni codec (h264/h265), risoluzioni (480p-4K), fps (15-30).
- Privacy mitigation accettata pragmatica (Q3 founder "funzioni prima"): TLS RTSP + frame-only no-storage attestazione + Oracle EU. GDPR DPA chain documentato ma NON blocker MVP.
- Business model DEFERRED (Q2): no pricing decision pre-revenue (vincolo #5 + memory `feedback_premature_optimization.md`).
- V2 pulizia smartphone IN SCOPE (Q4 founder "deve essere completo"): D-04 resta OPEN ma scope-included nel roadmap Guardian. Discovery V2 NON blocker V1 MVP, ma deve essere planning entro lo stesso ciclo (parallelo dopo OQ-02.3 backend setup).
- Founder S178 self-dogfooding: test casa Luke con 2 EZVIZ → P1 production gating (D-03) accelerato (Luke disponibile fisicamente).
**Ref**: RESEARCH-OQ02-zero-cost-client.md (S177 v1 + S178 v2 amendment), founder S178 raw Q1-Q5, `~/fall-poc/run_upstream.py` (D-02), EZVIZ RTSP url in NEXT_SESSION_PROMPT.md S93 riga 80

**S179 validation update (2026-05-15)**: deploy Oracle Free Tier POSPOSTO S180 (signup interattivo Luke + carta credito non disponibile real-time). Fallback PRE-EMPTIVE attivato: stand-in backend iMac Luke (già operativo: mosquitto:1883 + go2rtc:8554 RTSP-proxy 2 EZVIZ + run_upstream.py 789 LOC ONNX YOLO11n-pose). E2E architettura D-06 validata su iMac:
- (i) Camera-agnostic ingest verified: go2rtc proxy `rtsp://admin:QSTOZH@192.168.1.4:554/H.264` → `localhost:8554/soggiorno` consumed by `run_upstream.py` (15 fps steady).
- (ii) Backend inference live: YOLO11n-pose ONNX + LSTM + MOG2 motion-gate + S89 temporal verification — 90s smoke f=1290 zero crash post-fix, PENDING→CANCELED (lost_subject) cycle working.
- (iii) Bug regressione critica trovato + fixed: variable shadowing `t0` (timestamp init line 531 vs ip_set[0] list line 714, post-S102.2 introduction) → rename `track0` (file `~/fall-poc/run_upstream.py.bak-s179-pre-fix` preserved). Bug bloccava chain `time.time() - t0` (TypeError float-list) prima di MQTT publish ALERT.
- (iv) Notify layer chain E2E verified: bridge `~/fall-poc/mqtt_fcm_bridge.py` (86 LOC, NEW S179) subscriber MQTT `zeroclaw/guardian/fall` → POST FCM HTTP v1 body format → endpoint stub `127.0.0.1:9999`. 3/3 ALERT simulated forwarded status=200. Production swap: set env `FCM_ENDPOINT=https://fcm.googleapis.com/v1/projects/<PROJECT_ID>/messages:send` + `FCM_AUTH=<bearer>` (Firebase signup S180).
- (v) Bandwidth measured 706 Kbps en0 LAN sostenuto (RTSP EZVIZ + background noise) su 60s window. Target D-06 "<500 Kbps motion-gated" NON centrato perché frame-sampling source-side non implementato — apre **OQ-02.5** (frame-skip logic upstream del decode quando MOG2 motion=OFF, current code decode-all-then-skip-LSTM). Non blocker MVP, ottimizzazione bandwidth client.
- (vi) D-02 stack PRESERVED come da decisione (rename `t0`→`track0` interno, semantica invariata, zero modifica MQTT topic/payload schema).
**OQ-02.3 closure**: VERDE su path iMac stand-in. Oracle ARM A1 = S180 P0 (Luke interactive signup).

<!-- last_reviewed: 2026-05-15 -->

---

## D-07 — Scope distribuzione = prodotto commerciale, no overhead legale pre-revenue (2026-05-16, S180-oracle-bootstrap)

**Status**: DECIDED (founder S180 raw "B, ma senza ansie, per ora dobbiamo farlo funzionare, niente p.iva, niente stress oneri")
**Contesto**: NORTH_STAR pulizia-smartphone (24 apr) dichiara progetto "personale non commerciale, €0 revenue, NO multi-tenant/SaaS, NO iOS, cliente=famiglia Luke". Founder S180 evolve scope: distribuibile a clienti terzi pagati ("il sistema verrà distribuito", "il cliente non è in grado"). NORTH_STAR obsoleto su 3 punti (commerciale/iOS/multi-tenant).
**Opzioni considerate**:
- (a) Mantenere personale famiglia + amici (status NORTH_STAR aprile)
- (b) Commerciale full con P.IVA + GDPR DPA + contratti pre-MVP (overhead pre-revenue)
- (c) **Commerciale lean: funzionalità prima, overhead legale/fiscale defer fino payment evidence reale** (founder S180 explicit)
**Decisione**: Opzione (c). Guardian = prodotto commerciale distribuibile a terzi. **Overhead legale/fiscale (P.IVA, GDPR formale DPA, contratti, T&C, privacy policy, responsabilità civile)** = DEFERRED fino primo cliente pagante (allineato memory `feedback_premature_optimization.md`).
**Conseguenze**:
- NORTH_STAR pulizia-smartphone OBSOLETO sui 3 punti (commerciale OK, iOS TBD Q4, multi-tenant TBD). Da rivedere in S181 post Q1-Q8 closure.
- Discovery V2 (D-04 OPEN) e scope dettagliato V1 continuano (Q2-Q8 next).
- Vincolo founder #5 zero-cost reinterpretato: zero-cost LUKE (no spese da te), cliente paga sua infra (vedi Q3 next).
- Sales/marketing/business model decisions ALL defer post-funzionalità validata su 2-3 cliente test.
- Pattern S159 mitigation: ogni proposta tecnica successiva rif D-07 + memory `feedback_premature_optimization` per evitare drift "ottimizziamo legale ora".

**Ref**: founder S180 raw "per ora facciamolo funzionare", NORTH_STAR ~/Documents/pulizia-smartphone/.claude/NORTH_STAR.md (obsoleto post-S180), memory `feedback_premature_optimization.md`
<!-- last_reviewed: 2026-05-16 -->

---

# Indice cronologico

| # | Titolo | Status | Data | Sessione |
|---|--------|--------|------|----------|
| D-01 | Scope Guardian = 2 verticali (fall-detection + pulizia smartphone) | DECIDED | 2026-05-15 | S173-VOS-coord |
| D-02 | Fall-detection stack production yolov8n-pose + LSTM + MQTT | DECIDED | 2026-05-15 | S173-VOS-coord |
| D-03 | Activation gating zero-FP test naturale Luke ≥30min | DECIDED | 2026-05-15 | S173-VOS-coord |
| D-04 | Verticale pulizia smartphone scope dettagliato | OPEN | 2026-05-15 | S173-VOS-coord |
| D-05 | Architettura clienti zero-cost IP cam + smartphone (research-pending) | SUPERSEDED-by-D-06 | 2026-05-15 | S173-VOS-coord |
| D-06 | Architettura cliente camera-agnostic RTSP + Oracle Free Tier backend Luke | DECIDED | 2026-05-15 | S178-VOS-coord |
| D-07 | Scope distribuzione = prodotto commerciale, no overhead legale pre-revenue | DECIDED | 2026-05-16 | S180-oracle-bootstrap |

**Totale**: 6 DECIDED + 1 OPEN + 1 SUPERSEDED. D-07 evolve NORTH_STAR aprile (obsoleto), allinea con memory premature_optimization.

---

# Open questions / Risks

1. **OQ-01 (D-04 dep)**: Pulizia smartphone scope dettagliato. Founder TBD: stack, target user (anziani con smartphone vecchi? caregiver che ripulisce device padre/madre?), business model (€/intervento? SaaS? gratuito acquisition?), modalità interazione (app dedicata? wizard? automation cloud?). Sessione discovery richiesta pre-implementazione.
2. **OQ-02 (D-05 dep)**: Inference location/method zero-cost cliente. Deep research richiesta (founder S173 esplicito "con dati"). Variabili: (a) on-device smartphone (Core ML/TFLite yolov8n latency benchmark), (b) free-tier cloud (Colab T4 ngrok via VOS skill `free-gpu-api`, latenza accettabile per fall-alert?), (c) Google ecosystem free (Drive sync video clip + Firebase Cloud Messaging notifica, quota free-tier reale 2026). Scope research: latenza, costo cliente, privacy (video face stream), affidabilità connessione casa anziano.
3. **OQ-03**: P1 test naturale Luke ≥30min multi-person. Blocker P2+P3 production activation. Richiede tempo fisico + 3a persona (scenario S57).
4. **OQ-04**: ADR 009 dataset selection (GMDCSA-24 + fine-tuning). Deferred S65+ sprint dedicato.
5. **OQ-05**: CLAUDE.md riga 47 update da "pulizia smartphone, stack TBD, in costruzione" a "suite 2 verticali (fall-detection + pulizia smartphone)". Out-of-scope S173, flag handoff S174.
6. **OQ-06**: Pacchettizzazione pricing Guardian "in base esigenze clienti" (founder S173). Business model TBD pre-revenue: lock-in B2C anziani, B2B RSA/case riposo, freemium con upgrade verticali, partnership ASL/comuni. Defer fino primo revenue ARGOS/FLUXION (CLAUDE.md vincolo #5).
