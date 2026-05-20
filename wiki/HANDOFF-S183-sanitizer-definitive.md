# HANDOFF S183 — Sanitizer ARGOS definitivo (BLOCKER Day 1 Stile Car)

**Created**: 2026-05-20 ~18:30 (fine sessione S179b NO-GO)
**Project**: ARGOS (`~/Documents/combaretrovamiauto-enterprise`)
**Blocker level**: HARD — D-32 sanitizer non chiude Day 1 dealer reale (founder vincolo)
**Stack constraint**: Big Sur AVX1 MacBook + iMac (no AVX2, no GPU), Python 3.11 venv `~/.argos-sanitizer-venv/bin/python` (cv2 4.7 + pyobjc Vision + Pillow 11), zero capex
**Previous sessions**: S111 (PaddleOCR setup) → S158 (PaddleOCR rotto deferred) → S159–S162 (paddle dylib hell) → S163 (Apple Vision migration) → S176 (LaMa regression X1) → S179 (Pillow refactor) → S179b (NO-GO UAT visual)

---

## Stato verificato 2026-05-20

### Sanitizer attuale (commit `0e92e74` master pushed)
- `src/cove/image_sanitizer.py` 929 righe — pipeline Stage 0→4
- `src/cove/vision_ocr.py` 230 righe — Apple Vision Framework wrapper
- Stage 3 = `_apply_solid_fills()` Pillow rectangle color-matched (LaMa+TELEA rimossi, D-32)
- KEEP_WORDS estesi BMW/Mercedes/Audi trim numerici (25e/30d/m340i/45tdi…)
- TRIM_PATTERN regex catch-all `^[a-z]?\d{2,3}[a-z]{1,5}$`

### UAT visual Luke 2026-05-20 (verified ~18:00)
**FAIL 3/3** su sample reali dealer-grade `/tmp/s179b_uat/` (BMW iX3 "Autohaus Isernhagen"):
- smoke_00: watermark "Autohaus Isernhagen" su zona targa + footer 6 brand loghi + tagline = TUTTI VISIBILI
- smoke_01: watermark venditore sopra targa frontale NON coperto
- smoke_02: stesso pattern watermark plate area

**Caveat**: re-run S179b con venv corretto + seller_name reale su immagine 01 ha mostrato cartello "Autohaus Isernhagen" coperto bene. Discrepanza tra mio test e UAT Luke fisico = da chiarire (verosimile: footer brand row + watermark sovra-targa sono i 3 fail mode REALI, non testati nel mio mini-run).

### 3 fail mode strutturali identificati Luke

1. **Watermark sovra-targa**: Apple Vision detecta il testo ma bbox copre solo le glifi, non la zona PLATE sotto. Targa rimane visibile.
2. **Footer brand row**: 6 loghi marche (BMW/MB/Audi/Porsche/VW/Mini) + tagline dealer. Vision detecta i loghi come OGGETTI non testo → 0 detections. Tagline troppo small, sotto confidence threshold 0.25.
3. **Tagline small text**: confidence sotto threshold → escluso da detect_text_regions.

---

## Soluzione hybrid proposta (NON implementata, da validare)

### Layer 1 — Footer deterministic mask
Bottom 12-15% immagine SEMPRE coperto con rectangle color-matched.
- **Pro**: zero ML, zero OCR dipendenza, copre brand row + tagline + watermark inferiori
- **Contro**: rischio cut feature auto (alloy detail laterale basso, badge "AMG Line" o "iX3" bottom, dettaglio paraurti, dashboard interni)
- **Mitigation richiesta**: Stage 0 interior/exterior classifier deve essere robusto. Audit fattuale su 20 raw photo DB = cosa sta nel bottom 12-15%

### Layer 2 — Plate area smart extension
Vision detect targa text → estendi bbox UPWARD 1.5× altezza plate per coprire watermark sovra-imposto.
- **Pro**: copre il pattern modale tedesco "Autohaus X sopra targa"
- **Contro**: edge case BE/NL/AT/FR/EE non testati (watermark laterale o sotto, banner 3×h sopra)
- **Mitigation richiesta**: sample audit territoriale prima di hardcoding 1.5×

### Layer 3 — Dense text bottom 25% → fascia mask
Se Vision detecta >3 text regions in bottom 25% → mask intera fascia bottom.
- **Pro**: cattura case dense (footer multi-line)
- **Contro**: false positive su interni (dashboard, infotainment, odometer = 5+ text legittimi)
- **Mitigation richiesta**: Stage 0 classifier affidabilità verificata

---

## Domande aperte (research VOS richiesta)

### OQ-S183-1: Approccio "deterministic footer mask" è risk-acceptable?
Audit fattuale su 50 raw photo (dossiers/safe_images/raw/) → quante hanno feature commerciale rilevante in bottom 12-15%? Se >5/50 = layer 1 inaccettabile come default, serve scelta condizionale.

### OQ-S183-2: Apple Vision confidence threshold troppo conservativo?
Test ablation `PADDLE_CONF_MIN` da 0.25 → 0.10 su dataset 50 photo: quante tagline + brand row diventano detected? Quanti false positive interni?

### OQ-S183-3: Object detection lightweight per loghi brand row?
Vision Framework ha `VNDetectRectanglesRequest` + `VNCoreMLRequest`. Esiste CoreML model OSS Apache/MIT per logo detection multi-brand auto Big Sur compatible? (no torch, no onnx GPU)

### OQ-S183-4: Pattern alternativi state-of-art 2026 zero-cost?
Tool-scout su:
- `florence-2-base` MIT (230M params, prompt open-vocab "watermark. dealer logo. license plate.") — gira CPU Big Sur?
- `yolov8n-text` — open-vocab text detection, ONNX runtime CPU
- `clip-text-recognition` — zero-shot
- Apple Vision `VNRecognizeAnimalsRequest` esiste, esiste analogo per logo?

### OQ-S183-5: Path PDF pre-esistente sblocca Day 1?
PDF marzo `ARGOS_BMW_X3_2022_Stile_Car_ee60eed0.pdf` (5.3MB, 30 Mar) usa sanitizer PaddleOCR S111/S158 (documentato "rotto" in memory `s158_pdf_fix.md`). UAT visual Luke su tutte le foto del PDF: targa + watermark accettabili o leak?

---

## Path €800 in parallelo (de-risking)

**Hypothesis**: se PDF marzo Stile Car ha watermark/targa coperti "accettabili" (giudizio Luke), può essere usato per Day 1 invio in parallelo allo sviluppo sanitizer S180 hybrid.

**Pro**: sblocca revenue €800 senza dipendere da S180 completion
**Contro**: PDF marzo è 2 mesi vecchio (prezzi/disponibilità potenzialmente stale), foto del veicolo S176 dataset non test sample S179b

**Decision gate**: Luke apre PDF marzo + giudica visivamente. NO auto-decision.

---

## Vincoli per VOS

- Big Sur AVX1 — preflight check obbligatorio su ogni dipendenza nuova (`pip install --dry-run --report -.json`)
- Zero capex (no GPU, no cloud paid, no API a pagamento)
- Free-tier first (HF Spaces hosted ok come MVP, no production)
- Verifica fattuale ogni claim tecnico (versione, capability, latency)
- Critica strutturale 4 punti su ogni proposta
- Mai liste A/B/C/D su decisioni tecniche → raccomandazione singola motivata + trade-off in 2 righe

## Output atteso S183

1. Audit fattuale 50 raw photo bottom 12-15% (Layer 1 viable check)
2. Test ablation conf_min Apple Vision su dataset 50 (Layer dense text viability)
3. Tool-scout 2-3 alternative object detection logo Big Sur compatible (Layer 4 alternativo)
4. Decision PDF marzo Day 1 path (gated su UAT Luke visual)
5. Implementation plan S180 con scope NETTO + critica 4 punti + audit deviazioni

## Non-goals S183

- NON implementare codice senza Luke approval esplicito
- NON committare/pushare patch sanitizer senza UAT visual approval 5/5
- NON scope-creep su altri blocker (HITL bypass P4-bis, Worker 401)
- NON proporre Telegram alert/SMS/escalation hardware

## File rilevanti

- `src/cove/image_sanitizer.py` (929 righe, commit `0e92e74`)
- `src/cove/vision_ocr.py` (230 righe)
- `tools/scripts/pdf_generator_enterprise.py:1555-1582` (`_find_sanitizer_python()`)
- `dossiers/safe_images/raw/` (raw photo dataset 50+ photo)
- `dossiers/ARGOS_BMW_X3_2022_Stile_Car_ee60eed0.pdf` (PDF marzo pre-S163)
- Memory `~/.claude/projects/.../memory/feedback_smoke_test_not_uat_gate.md` (gate UAT visual)
- Memory `~/.claude/projects/.../memory/s176_partial_step4_6_green_d32_sanitizer_blocker.md` (regression X1)
- Memory `~/.claude/projects/.../memory/s179_implementer_done_uat_pending.md` (refactor S179)

---

# PROMPT VOS (paste in next session)

```
Leggi ~/venture-os/wiki/HANDOFF-S183-sanitizer-definitive.md PRIMA di qualsiasi azione.

Sessione S183 = identificare soluzione DEFINITIVA per ARGOS sanitizer D-32 (blocker
Day 1 Stile Car). Stato: S179b UAT NO-GO 3/3, watermark plate area + footer brand row
non coperti. Refactor Pillow committato (0e92e74) ma fail mode strutturale persiste.

Vincoli HARD (vincoli founder Luke):
- Big Sur AVX1 compatible (no GPU, no AVX2)
- Zero capex (free-tier solo)
- Venv ~/.argos-sanitizer-venv/bin/python (Python 3.11 + cv2 4.7 + pyobjc + Pillow)
- Critica strutturale 4 punti su ogni proposta
- UAT visual Luke approval su 5 sample reali = gate non-negoziabile (NO smoke auto)
- NO commit/push senza UAT approved
- Vincolo #1 verifica fattuale, #3 no liste A/B/C/D, #4 critica 4 punti, #5 zero-cost,
  #11 pattern recognition strutturale, #13 pre-action-check D-32 reference

Step ordinati (gating sequenziale):

STEP 0 — Pre-flight check (~5min)
- Verifica venv ~/.argos-sanitizer-venv/bin/python funzionante (import cv2 + Vision + PIL)
- Verifica commit 0e92e74 head master
- Verifica /tmp/s179b_uat/output_v4_correct/ esistente o ri-run con venv corretto

STEP 1 — Audit fattuale bottom 12-15% (~20min)
Su 50 raw photo da dossiers/safe_images/raw/ (random sampling):
- Quante hanno feature commerciale rilevante nei pixel bottom 12-15%?
- Categorize: feature_present | dealer_branding_only | asphalt_only
- Decision: Layer 1 footer deterministic mask VIABLE (<10% feature) o NO

STEP 2 — Test ablation Vision confidence threshold (~20min)
Sul dataset 50 photo:
- Run Vision OCR con conf_min 0.25 (default) → count regions detected
- Run conf_min 0.10 → count + diff (recall gain)
- Run conf_min 0.05 → count + diff
- Identifica sweet spot: max recall su tagline+brand row, min false positive interni

STEP 3 — Tool-scout alternative (~30min, parallelo via vos-scout)
Ricerca object detection lightweight logo brand auto:
- florence-2-base CPU latency Big Sur (model card HF, paper)
- yolov8n-text ONNX CPU latency
- Apple Vision VNCoreMLRequest + free CoreML model logo (HF/Apple model gallery)
- Tessst Vision Framework VNGenerateAttentionBasedSaliencyImageRequest
  (heatmap automatico zone "diverse" da contesto = watermark/banner detection?)

STEP 4 — UAT visual PDF marzo Stile Car (~5min Luke fisico)
Apri dossiers/ARGOS_BMW_X3_2022_Stile_Car_ee60eed0.pdf, mostra Luke:
- Targa coperta in TUTTE le foto del PDF?
- Watermark venditore coperto in TUTTE?
- Decision Luke: PDF marzo sblocca Day 1 (revenue €800 in parallelo) o NO

STEP 5 — Implementation plan S180 hybrid (~15min)
Sintesi findings step 1-3 + critica 4 punti:
- Layer 1 viable yes/no + threshold pixel
- Layer 2 plate extension factor calibrato (1.0×/1.5×/2.0× upward, sample-driven)
- Layer 3 dense text fascia bottom yes/no + dependency Stage 0 classifier
- Layer 4 object detection brand logo + tool selezionato + integration plan
- Audit deviazioni candidates: cosa rompe a 30/60/90gg, pattern errore noti

Output finale S183: 
- Documento markdown wiki/projects/ARGOS/S183-sanitizer-implementation-plan.md
- Decision PDF marzo Day 1 (gated UAT Luke)
- NO codice committato. Implementation = sessione S180 successiva con approval Luke.

Gate context budget: se >50% al termine STEP 3 → handoff S183-bis con stato preciso,
NON forzare conclusione. Vincolo #6 NO PARTIAL.
```

---

## Note operative finali sessione S179b

- **NO commit prodotti S179b** (oltre handoff doc che è prossimo)
- **NO modifiche al codice sanitizer** dopo NO-GO Luke
- Commit `0e92e74` (S179 refactor implementer) **rimane master pushed** ma NON è considerato VERDE — è stato di WIP che richiede S180 hybrid 3-layer per chiudere D-32
- Memory aggiornata: `feedback_smoke_test_not_uat_gate.md` (gate UAT visual, no auto-smoke)
- Memory PROJECT da aggiornare con outcome S179b (action separata, vincolo #6 closure pulita)
