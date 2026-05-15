# Guardian OQ-02 — Research deep architettura zero-cost cliente

**Sessione**: S177 VOS coordinator
**Data**: 2026-05-15
**Trigger**: D-05 founder S173 raw "deep research necessaria con dati"
**Vincolo dominante**: ZERO-COST CLIENTE + vincolo #5 CLAUDE.md (zero-cost Luke)
**Output**: raccomandazione singola CTO per D-05 update + revisione D-02 stack

---

## TL;DR (CTO call, vincolo #3)

**Raccomandazione**: pivot architetturale a **IP camera AI on-device commodity (Tapo C460 / KamiHome) + Guardian app caregiver (FCM notify + management UX) + Luke backend = solo orchestration alert routing (zero inference)**.

Motivo principale: scala N clienti senza costo infra Luke + privacy on-device + latenza ottimale, al prezzo di pivot da stack custom yolov8n+LSTM (D-02) a service-layer sopra camera commodity.

Trade-off accettato: sunset 369 LOC `run_upstream.py` come algoritmo cliente (resta come reference iMac casa Luke per dev/test). Business model Guardian shifts da "tech stack proprietaria" a "service + UX caregiver".

---

## Variabili D-05 e dati raccolti

### Opzione (a) — Inference on-device smartphone caregiver

**Tecnico**: YOLOv8n via TFLite/CoreML ~30fps achievable su modern smartphone (33ms/frame). INT8 quantizzato può scendere a 8.9ms ref MobileNetV3.

**Architettura problema**: smartphone caregiver NON è always-on monitor in casa anziano. Lo stream RTSP camera casa anziano deve viaggiare verso smartphone caregiver via WAN.
- A1 (router NAS economy): home server iMac/Pi locale, smartphone pull notify. **Viola zero-cost cliente** (server casa anziano).
- A2 (cloud relay free): video stream cloud → smartphone. Privacy issue + bandwidth.

**Verdetto**: tecnicamente fattibile ma blocker architetturale (anziano in casa, caregiver fuori).

### Opzione (b) — Free-tier cloud (Colab T4 via VOS skill free-gpu-api)

**Tecnico**: T4 GPU ottima per inference YOLOv8n. Skill `free-gpu-api` VOS pronto + ngrok tunnel.

**Killer constraint**: Colab free **90min idle disconnect + 30 GPU hours/settimana**. Fall detection è **always-on 24/7**. 30h/week = 4h/giorno = **non copre nemmeno 1/6 del tempo**.

**Verdetto**: **NON FATTIBILE**. Eliminata.

### Opzione (c) — Google Drive sync clip + FCM notify

**Tecnico**: FCM **gratis unlimited** (600k msg/min default quota, 4KB data). Drive 15GB free.

**Killer constraint latenza**: per fall-alert serve response <30s. Upload Drive da casa anziano = minuti su connessione media italiana. FCM da solo è OK come trasporto notifica, ma il "punto di inference" resta indefinito.

**Verdetto**: FCM è layer notifica vincente, **NON è architettura inference**. FCM va combinato con altra opzione.

### Opzione (d) — IP camera con AI on-device built-in

**Tecnico**: 2026 trend documentato — camere commodity AI on-device:
- Tapo C460: $99.98 (~€90), AI on-device fall detection
- KamiHome: 24/7 fall detection 99% accuracy, no wearable
- eufyCam S3 Pro / Reolink Argus 4 Pro: AI on-device
- Hikvision AI Analytics fall detection (B2B segment)

**Architettura**: camera fa inference on-board → publish event MQTT/HTTP webhook → Guardian backend Luke (orchestration only) → FCM notify caregiver smartphone.

**Costo cliente**: €90 one-time camera (sub-€100 acceptable per anziano/caregiver). Anziché abbonamento mensile cliente paga prodotto.

**Costo Luke**: zero infra (Guardian backend = trivial webhook router + FCM gateway, hostabile Oracle Free Tier o anche Termux iMac).

**Privacy**: top — video non lascia camera, solo evento "fall detected at timestamp".

**Verdetto**: **WINNER** condizionato a:
1. Camera supporta export evento via MQTT/RTSP/HTTP webhook (NOT proprietary-app-only)
2. Tapo C460 ha API/Home Assistant integration verificata
3. Falso positivo cliente-accepted (vendor claim 99% acc, da validare in field)

### Opzione (e) — Self-host inference Oracle Free Tier (alternativa emergent)

**Tecnico**: Oracle Cloud Free Tier ARM A1 4 vCPU + 24GB RAM **forever-free** (no expiry). YOLOv8n CPU desktop = 80ms/frame, su ARM A1 stimato 150-200ms = 5-7fps (sufficient per fall detection a 2fps gating). 1 istanza può gestire 10-20 stream concurrent.

**Architettura**: cam casa anziano upload frames via WebRTC/MQTT → Oracle relay inference → FCM notify caregiver.

**Costo Luke**: zero (Oracle Free Tier forever).

**Privacy**: video frame attraversa Oracle (mitigabile: solo low-res frame su trigger motion, no storage).

**Verdetto**: alternativa fallback se (d) bloccato (e.g. vendor lock-in). LOC investment esistente `run_upstream.py` riutilizzabile.

---

## Tabella decisione

| Criterio | (a) on-device phone | (b) Colab free | (c) Drive+FCM | (d) cam AI on-device | (e) Oracle Free + Luke stack |
|----------|---------------------|----------------|---------------|----------------------|------------------------------|
| Always-on 24/7 | NO (phone fuori casa) | NO (90min disconnect) | N/A | **SÌ** | SÌ |
| Latenza fall-alert <30s | partial | killed | NO | **<5s** | ~5-10s |
| Costo cliente | €0 | €0 | €0 | €90 one-time | €0 |
| Costo Luke scala N clienti | €0 | killed | €0 | **€0** | €0 (Oracle limit) |
| Privacy | medium | medium | high | **TOP** | medium |
| Algoritmo controllato Luke | sì | sì | n/a | **NO** | sì |
| LOC investment riuso (`run_upstream.py`) | partial | sì | n/a | **NO** | sì |
| Scala (N clienti) | N/A | N/A | N/A | **infinito** | ~20/istanza |
| Vendor lock-in | no | Google | Google | **TAPO/Kami** | Oracle |
| Verdetto | blocked arch | killed quota | layer only | **WINNER** | fallback |

---

## Decisione CTO singola (vincolo #3)

**Pivot a (d) IP camera AI on-device commodity + Guardian service-layer**.

Razionale dati:
1. Solo (d) e (e) sopravvivono il filtro always-on + scala
2. (d) batte (e) su privacy (TOP vs medium) + latenza (<5s vs ~10s) + Luke maintenance (zero algoritmo vs YOLO updates)
3. (e) preservato come fallback se (d) blocca su vendor verification (next session task)

Costo trade-off (d):
- **Sunset architetturale** dello stack D-02 (yolov8n+LSTM+MQTT custom) lato cliente. Resta valido come iMac casa Luke dev/test.
- **Vendor lock-in** mitigato richiedendo camera con export MQTT/HTTP webhook (NOT app-only).
- **Algoritmo non controllato**: accettato perché vendor claim 99% accuracy + Guardian aggiunge value sopra (multi-cam aggregation, caregiver UX, medical context, alert routing intelligence).

Business model shift implicito:
- DA: "Guardian = stack proprietaria fall-detection (vendiamo software)"
- A: "Guardian = service layer (caregiver app + alert orchestration + medical context) sopra camera commodity"
- Pricing model: app caregiver freemium → premium subscription (€5-10/mese caregiver) per multi-anziano / multi-cam / medical context / scheduled check-in. Camera = customer-purchased commodity esterno al modello revenue Luke.

---

## Autocritica strutturale (vincolo #4)

1. **Assunzione nascosta**: cliente accetta acquisto camera €90 una-tantum. Founder S173 raw dice "telecamere ip wifi" (plurale) — implica cliente già ha camere. Se cliente ha cam senza AI on-device (cam vecchia Hikvision basic), proposta (d) impone upgrade hardware = costo cliente. Mitigazione: Guardian app supporta DUE modes — (d) con cam AI on-device per nuovi, (e) Oracle relay per legacy cam senza AI (premium plan covers Oracle limit). Hybrid model regge.

2. **Cosa rompe a 30/60/90gg**:
   - 30gg: Tapo cambia firmware, blocca webhook MQTT → Guardian app cieca su quella cam. Mitigation: certifica al lancio una shortlist 3-5 vendor con MQTT/Home Assistant verified.
   - 60gg: vendor introduce subscription cloud obbligatoria per AI feature → cliente disabilita → Guardian alert silent. Mitigation: requisito hardware = "AI feature local, no cloud dependency required".
   - 90gg: competitor lancia "Tapo Care" app caregiver bundle → Guardian USP eroded. Mitigation: USP Guardian = (a) multi-vendor aggregation (Guardian funziona su Tapo + Kami + eufy concurrent, vendor app no), (b) medical context (allergie, contatti emergenza, scheduled check-in), (c) caregiver UX italiana mercato locale.

3. **Pattern errori noti**: pattern "investment bias" — Luke ha investito S58-S65 su `run_upstream.py` (369 LOC, YOLO+LSTM, MQTT operativo). Raccomandare (d) = sunset di quel codice come prodotto cliente. **Pattern**: codice esistente NON è asset se architettura cliente diversa — sunk cost. `run_upstream.py` resta valido come iMac casa Luke (Guardian-self-dogfooding, parents/grandparents real-world test bench, dataset gathering D-04 OQ-04). NON è waste, cambia ruolo.

4. **Dove sovradimensiono**: stavo per scrivere 1500 righe pro/contro tutte le 5 opzioni con benchmark code. Tagliato a doc strutturato (~200 righe) + raccomandazione singola con dati comparativi tabella. Compressione 85%.

---

## Punti aperti (next session candidato)

| # | Punto | Tipo | Stima |
|---|-------|------|-------|
| OQ-02.1 | Verifica vendor shortlist: Tapo C460 + KamiHome + eufyCam S3 Pro supportano MQTT/HTTP webhook + Home Assistant integration | Research + test fisico | ~1h |
| OQ-02.2 | Tapo C460 specifically: API documentation deep-dive, RTSP+ONVIF support, fall detection sensitivity tuning | Research | ~30min |
| OQ-02.3 | Guardian backend service layer scope: webhook router + FCM gateway + caregiver app skeleton | Architecture + LOC estimate | ~45min |
| OQ-02.4 | Caregiver app stack: Tauri mobile vs React Native vs PWA (vincolo zero-cost dev Luke) | tool-evaluator agent | ~30min |
| OQ-02.5 | Verify FCM still free for Italian market 2026 + GDPR compliance push notification | legal-compliance-checker | ~20min |

---

## D-05 update proposto

**Status**: DECIDED → SUPERSEDED-by-D-06 (questo doc + sessione founder validation)

Propongo a Luke S178 review e creazione **D-06** con architettura WINNER (d) hybrid (b/d) post-OQ-02.1 vendor shortlist verifica.

D-02 (stack yolov8n+LSTM+MQTT) NON viene SUPERSEDED, cambia scope: da "stack cliente production" a "stack iMac casa Luke dev/dogfooding + dataset gathering per training futuro algoritmi proprietary se vendor lock-in escape strategy attivato".

---

## Sources

- [Best Indoor Cameras Elderly 2026 — eufy](https://www.eufy.com/blogs/security-camera/best-indoor-camera-for-elderly)
- [KamiHome Fall Detection Aging in Place](https://kamivision.com/en-us/fall-detection/aging-in-place-kamihome)
- [Best AI Security Cameras 2026 — the-gadgeteer](https://the-gadgeteer.com/2026/05/11/best-ai-security-cameras-2026/)
- [FCM Throttling and Quotas — Firebase](https://firebase.google.com/docs/cloud-messaging/throttling-and-quotas)
- [Firebase Pricing 2026 — Google](https://firebase.google.com/pricing)
- [Google Colab FAQ — research.google](https://research.google.com/colaboratory/faq.html)
- [Colab GPU limits 2026 — Hivenet](https://www.hivenet.com/post/google-colaboratory-gpu-complete-guide-to-free-cloud-gpu-access-and-limitations)
- [TFLite vs CoreML iOS latency benchmark — TildAlice](https://tildalice.io/tflite-vs-coreml-ios-latency-benchmark/)
- [Mobile object detection models — Roboflow](https://blog.roboflow.com/mobile-object-detection-models/)
- [ML Inference Latency mobile benchmark — USC paper](https://qed.usc.edu/paolieri/papers/2024_edgesys_mobile_inference_benchmark.pdf)
