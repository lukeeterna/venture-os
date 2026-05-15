# Guardian OQ-02 — Research deep architettura zero-cost cliente

**Sessione**: S177 (v1) + S178 (v2 revised)
**Data**: 2026-05-15
**Trigger**: D-05 founder S173 raw "deep research necessaria con dati"
**Vincolo dominante**: ZERO-COST CLIENTE + vincolo #5 CLAUDE.md (zero-cost Luke)
**Output**: raccomandazione singola CTO per D-05 update + preservation D-02 stack

> **AMENDMENT S178 (2026-05-15)**: la raccomandazione iniziale S177 era basata su assunzione FALSIFICATA in S178 (vendor expose AI fall events a terze parti via API). Verifica fattuale ha invalidato (d) "pure". Revised raccomandazione: hybrid (e+d-lite) — camera commodity RTSP (€20-€40) + Oracle Free Tier inference backend Luke (run_upstream.py PRESERVED). Sezione "Decisione CTO singola" REVISED sotto. Sezione "TL;DR" e tabella decisione mantenute v1 per audit trail, marcate SUPERSEDED.

---

## TL;DR v1 [SUPERSEDED-by-S178-amendment]

**Raccomandazione iniziale S177**: pivot a **IP camera AI on-device commodity (Tapo C460 / KamiHome) + Guardian app caregiver (FCM notify + management UX) + Luke backend = solo orchestration alert routing (zero inference)**.

Motivo principale dichiarato S177: scala N clienti senza costo infra Luke + privacy on-device + latenza ottimale, al prezzo di pivot da stack custom yolov8n+LSTM (D-02) a service-layer sopra camera commodity.

**INVALIDATA S178**: vendor AI consumer (Tapo, KamiHome, eufy) **NON espongono fall-detected event** via MQTT/webhook a terze parti. Espongono solo "motion" e "person detected" via ONVIF. Fall-event proprietario all'app vendor → Guardian non può consumarlo. Inoltre Tapo C460 battery-powered = NO RTSP NO ONVIF (architettura cieca a Guardian).

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

## Decisione CTO singola REVISED S178 (vincolo #3)

> Sezione v1 (pivot pure (d)) preservata sotto come SUPERSEDED per audit trail Pattern S159 mitigation. Decisione operativa = REVISED qui sotto.

### Verifica fattuale S178 — findings che invalidano v1

| Vendor | RTSP/ONVIF | Motion event API | Fall-event API | Verdetto |
|--------|------------|------------------|----------------|----------|
| Tapo C460 (battery) | **NO** (battery-design limit) | NO | NO | KILLED |
| Tapo C100/C200/C210 (wired) | **SÌ** | sì via ONVIF/HA integration | NO (proprietary app only) | RTSP-source only |
| KamiHome/KamiCare | n/a | NO (SaaS app-only) | NO (SaaS app-only) | KILLED (no public API) |
| eufy Security | sì (con MQTT bridge community) | sì (motion+person via MQTT) | NO (proprietary app) | RTSP-source only |
| Hikvision DS-2xx (B2B) | sì | sì + AI analytics SDK | sì (B2B SDK paid) | B2B too expensive |

**Pattern S159 corollario S178**: assunzione "vendor X has feature Y" richiede TRE verifiche: (1) feature esiste, (2) feature è esposta via API/MQTT, (3) API è free/non-paid. v1 OQ-02 saltato step (2)+(3) per vendor consumer. Regola: prima di raccomandazione "use vendor X feature", validate 3-tier.

### Revised raccomandazione (e+d-lite hybrid)

**Architettura WINNER S178**:

```
[Casa anziano]                          [Cloud Luke]                  [Caregiver]
Tapo C200/C210/C100  --RTSP-->  Oracle Free Tier ARM A1  --FCM-->  Smartphone app
(€20-€40, wired)                  (forever-free, 4 vCPU)           (Android+iOS)
                                  run_upstream.py YOLO+LSTM
                                  motion-gated frame sampling
                                  fall event → FCM publish
```

**Componenti**:
- **Hardware cliente**: Tapo C200/C210/C100 (~€20-€40 Italia retail, wired-power, RTSP+ONVIF). Cliente lo acquista o usa cam esistente compatibile RTSP.
- **Backend inference Luke**: Oracle Cloud ARM A1 Free Tier (forever-free, no expiry, 4 vCPU + 24GB RAM, fino a 2 istanze). Esegue `run_upstream.py` (D-02 stack PRESERVED, NO sunset). 1 istanza stimata 10-20 stream concurrent a low-res 480p motion-gated.
- **Notifica caregiver**: FCM Firebase free unlimited (verificato S177).
- **Caregiver app**: PWA o React Native (decisione OQ-02.4 next session) — alert receiver, multi-anziano dashboard, medical context.

**Costo cliente**: €20-€40 one-time (cam, riusa esistente se ha) + €0 service Guardian basic. Premium €5-10/mese opzionale (multi-cam, medical context, alert routing intelligence).

**Costo Luke per N clienti**:
- 1-10 clienti: €0 (1 istanza Oracle Free Tier)
- 10-30 clienti: €0 (2 istanze Oracle Free Tier max)
- 30+ clienti: €4-10/mese istanza cloud aggiuntiva (paid tier post-revenue, vincolo #5 rispettato pre-revenue)

**Algoritmo controllato Luke**: yolov8n+LSTM `run_upstream.py` (D-02 PRESERVED come backend cliente, non solo dev/test).

**Privacy mitigation**: stream RTSP cifrato (SRTP o WireGuard tunnel cam→Oracle), frame-only no storage, low-res 480p (face non-identificabile chiaramente), motion-gated upload (skip frame statici 95% bandwidth saving).

**Latenza fall-alert**: RTSP stream ~200ms + inference ~150-200ms ARM A1 + FCM ~1s = totale ~2s. Ben sotto SLA 30s.

**Pro hybrid vs v1**:
- D-02 stack PRESERVED → no sunset 369 LOC `run_upstream.py` → S58-S65 investment retained
- Algoritmo Luke-controlled → no vendor lock-in AI (escape strategy semplice: swap camera commodity)
- Camera €20-€40 vs €90 (più cheap per cliente)
- Privacy attiva (Luke mitigation tooling), no dipendenza vendor privacy policy

**Contro vs v1**:
- Bandwidth cliente: 1-2 Mbps upload sostenuto per stream low-res. Border line ADSL italiana media (1-3 Mbps upload). Mitigation: motion-gated reduce a ~200-400 Kbps medio. Verificare con primo cliente reale.
- Oracle Free Tier "forever-free" non garantito 100% policy futura. Mitigation: dual-deploy iMac casa Luke come backup, exit migration AWS/Hetzner low-cost se Oracle rinega.
- Scala limit Oracle 2 istanze free → ~30-50 clienti max free-tier. Mitigation: 30+ clienti = post-revenue, paid tier €4-10/mese accettabile.

[CONTENUTO v1 SUPERSEDED — preservato sotto sezione "## Decisione v1 SUPERSEDED" come audit trail Pattern S159 mitigation]

---

## Decisione v1 SUPERSEDED (audit trail)

Razionale dati S177 (INVALIDATO S178):
1. Solo (d) e (e) sopravvivono il filtro always-on + scala
2. (d) batte (e) su privacy (TOP vs medium) + latenza (<5s vs ~10s) + Luke maintenance (zero algoritmo vs YOLO updates)
3. (e) preservato come fallback se (d) blocca su vendor verification (next session task) ← **(e) ATTIVATO S178**

Costo trade-off (d) v1:
- **Sunset architetturale** dello stack D-02 ← **REJECTED S178**: D-02 PRESERVED come backend Luke
- **Vendor lock-in** mitigato richiedendo MQTT/webhook export ← **REJECTED S178**: vendor consumer non espongono fall-event API
- **Algoritmo non controllato** ← **REJECTED S178**: Luke controlla via run_upstream.py backend

Business model shift v1:
- DA: "Guardian = stack proprietaria fall-detection"
- A: "Guardian = service layer sopra camera commodity"
- ← **PARTIAL S178**: Guardian RESTA stack proprietaria (algoritmo Luke su Oracle backend) + service layer caregiver UX. Camera è commodity ma algoritmo non delegated.

## Autocritica strutturale S178 (vincolo #4)

1. **Assunzione nascosta v1 INVALIDATA**: "vendor camera AI consumer espongono fall event via API". FALSA per Tapo/KamiHome (battery model no RTSP, KamiHome SaaS-only). Parziale per eufy (motion sì, fall no). Lezione: 3-tier verification (feature exists → exposed via API → free/non-paid) **PRIMA** di raccomandazione architetturale dependente da vendor feature. Pattern S159 corollario S178 aggiunto sopra.

2. **Cosa rompe a 30/60/90gg (revised hybrid e+d-lite)**:
   - 30gg: Oracle Free Tier policy change (limit aumentato in passato, mai diminuito significativamente, ma rischio non-zero). Mitigation: dual-deploy iMac casa Luke come fallback inference, exit migration to AWS Lightsail $5/mese accettabile post-1° revenue.
   - 60gg: bandwidth ADSL cliente insufficiente per stream RTSP continuo (italian average 1-3 Mbps upload). Mitigation: motion-gated frame sampling riduce a ~200-400 Kbps medio. Validare con primo cliente reale field test (P1 production gating D-03).
   - 90gg: cliente vede video frame attraversare Oracle US/EU server → privacy concern + GDPR DPA chain (Luke processor → Oracle sub-processor). Mitigation: Oracle EU regions disponibili (Frankfurt, Milan), DPA Oracle GDPR-compliant disponibile, frame-only no-storage architettura attestabile. Legal-compliance-checker S179 task validate.

3. **Pattern errori noti**: pattern "investment bias" che S177 aveva flaggato come gestito ("sunset accepted") era in realtà **soluzione errata al pattern**. La risposta corretta NON era "accetta sunset" ma "verifica se sunset è davvero necessario via verifica fattuale (vincolo #1)". S178 amend prova: investment NON è sunk, cambia layer (cliente → backend Luke). Pattern lezione: sunk-cost fallacy bias è REALE ma non sempre triggera; verifica fattuale prima di accept-sunset, sennò sunk-good-by-mistake (caso simmetrico).

4. **Dove sovradimensiono**: amendment S178 ha tentazione di rewrite full doc. Tagliato a sezione "REVISED" inline + sezione "v1 SUPERSEDED" preservata audit trail. Pattern Pattern S159 mitigation richiede SUPERSEDED visibili, non cancellati. Compressione: ~100 righe aggiunte vs rewrite 200+ righe. Audit trail Pattern S159 preserved.

---

## Punti aperti REVISED S178 (next session candidato)

OQ-02.1, OQ-02.2 v1 CLOSED da S178 verifica fattuale (vendor AI consumer non espongono fall-event API).

| # | Punto | Tipo | Stima |
|---|-------|------|-------|
| OQ-02.3 (revised) | Guardian backend Oracle Free Tier setup: account creation + ARM A1 instance + run_upstream.py deploy + RTSP intake test | DevOps + arch validation | ~1h |
| OQ-02.4 | Caregiver app stack: PWA vs React Native vs Tauri mobile (vincolo zero-cost dev Luke) | tool-evaluator agent | ~30min |
| OQ-02.5 | Verify FCM free Italia 2026 + GDPR DPA chain (Luke processor → Oracle sub-processor) push notification + Frankfurt/Milan EU region selection | legal-compliance-checker | ~30min |
| OQ-02.6 (new) | Bandwidth field test: stream RTSP motion-gated da connessione ADSL italiana media (cliente test reale) → verify <500 Kbps sostenuto | Field test 1° cliente | ~2h presence required |
| OQ-02.7 (new) | Privacy mitigation tooling: SRTP/WireGuard tunnel cam→Oracle, frame-only no-storage attestation, GDPR processor agreement template | DevOps + legal | ~1h |

---

## D-05 update proposto REVISED S178

**Status**: DECIDED → SUPERSEDED-by-D-06 (questo doc + sessione founder validation S179)

Propongo a Luke S179 review e creazione **D-06** con architettura WINNER hybrid **(e+d-lite)**:
- Camera commodity RTSP-capable (Tapo C100/C200/C210 €20-€40 wired-power) come hardware cliente
- Backend inference Luke su Oracle Cloud ARM A1 Free Tier (run_upstream.py D-02 stack PRESERVED)
- FCM notify caregiver smartphone (free unlimited)
- Bandwidth motion-gated low-res 480p RTSP stream

**D-02 (stack yolov8n+LSTM+MQTT) PRESERVED** — non SUPERSEDED, scope EXTEND: da "stack iMac casa Luke" a "stack backend Luke cliente production + iMac casa Luke dev/dogfooding". Investment S58-S65 = asset attivo, not sunk cost.

**Pattern S159 mitigation S178 (audit-completion-bias + verification-bias)**: la sequenza S177→S178 dimostra che verifica fattuale (vincolo #1) può invalidare raccomandazione CTO singola dopo 1 query mirata. Lezione applicata: amendment + audit trail visibile + corollario 3-tier vendor verification aggiunto a Pattern S159 in `feedback_pattern_S159_mitigation.md` (TODO S179).

---

## Sources

S177 (v1):
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

S178 (v2 verification):
- [Tapo C420 battery model no RTSP — TP-Link community](https://community.tp-link.com/en/smart-home/forum/topic/600676)
- [HomeAssistant Tapo Control — JurajNyiri GitHub](https://github.com/JurajNyiri/HomeAssistant-Tapo-Control)
- [Tapo C100/C200/C210 RTSP/ONVIF support — TP-Link FAQ](https://www.tp-link.com/us/support/faq/2680/)
- [eufy security HA integration — fuatakgun GitHub](https://github.com/fuatakgun/eufy_security)
- [eufy-ha-mqtt-bridge — matijse GitHub](https://github.com/matijse/eufy-ha-mqtt-bridge)
- [KamiHome dev portal (SaaS-only no public API)](https://dev.kamihome.com/)
