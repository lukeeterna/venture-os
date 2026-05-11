# S114 — Completare Sanitizer v3 Integration + Soft Launch Gate

## Stato da S113

### Cosa funziona
- Pipeline E2E: scrape → enrich (price+fuel+color+images HD) → CoVe score → PDF → WA send
- A0 completeness gate, A1 enricher, A2 image download HD, A3 PDF dati reali, A4 quality gate
- PDF: 375KB, dati reali (prezzo EU, 84/100, Benzina, foto HD 1280x960)
- `/send-doc` endpoint su wa-daemon.js
- Dashboard password forte, db_utils.py con WAL+busy_timeout

### Cosa NON funziona (bloccante)
**Il sanitizer non rimuove testo dealer dalle foto.**
Le foto nel PDF mostrano "Autohaus Isernhagen" + "BMW Service Partner" + loghi brand.
Se il dealer italiano vede la fonte, bypassa ARGOS → business model distrutto.

### Root causes trovati e fix applicati (da testare)

1. **Bug 1 INDENTATION** — FIXATO, deployato su iMac
   - `_detect_text_regions()` linee 341-374: erano fuori dal `for text, conf, poly` loop
   - Solo l'ultima OCR detection veniva processata
   - Fix: re-indentato +4 spazi, verificato con `ast.parse()` e `grep`

2. **Python version mismatch** — FIXATO, deployato su iMac
   - PaddleOCR non disponibile su Python 3.14 (`/usr/local/bin/python3` — usato dalla pipeline)
   - PaddleOCR installato su Python 3.12 (`/usr/local/bin/python3.12`)
   - `_sanitize_photo()` riscritto come subprocess call a Python 3.12
   - `_find_sanitizer_python()` cerca python con paddleocr

3. **Bug 2 BANNER BOTTOM** — NON ancora fixato
   - `_detect_banner_crop()` guarda solo top 3-25% dell'immagine
   - Banner AS24 con dealer name + loghi è nel bottom 15%
   - Fix: aggiungere scansione bottom zone

4. **Bug 3 TARGA** — da verificare dopo Bug 1+2
   - Testo "Autohaus Isernhagen" sulla targa/bumper
   - Potenzialmente risolto dal fix Bug 1 (PaddleOCR ora processa TUTTE le detection)

## Esecuzione S114

### Step 1: Test Bug 1 fix con subprocess Python 3.12
```bash
ssh gianlucadistasi@192.168.1.2
cd ~/Documents/app-antigravity-auto

# Test text detection (deve trovare >0 regions ora)
PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK=True /usr/local/bin/python3.12 -c "
import sys, os
sys.path.insert(0, '.')
os.environ['PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK'] = 'True'
from src.cove.image_sanitizer import _detect_text_regions
# Foto raw gia' scaricata o scaricala di nuovo
regions = _detect_text_regions('/tmp/raw_photo.jpg', seller_name='Autohaus Isernhagen')
for r in regions:
    print(f'[{r[\"conf\"]:.2f}] \"{r[\"text\"]}\" seller={r[\"is_seller\"]} mask={r[\"should_mask\"]}')
"
```
**Criterio PASS**: >0 regions rilevate, "Autohaus" marcato `is_seller=True` e `should_mask=True`

### Step 2: Test sanitizzazione completa
```bash
# Scarica foto raw se non in /tmp/
# Poi:
PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK=True /usr/local/bin/python3.12 -c "
import sys, os, time
sys.path.insert(0, '.')
os.environ['PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK'] = 'True'
from src.cove.image_sanitizer import sanitize_image
t0 = time.time()
result = sanitize_image('/tmp/raw_photo.jpg', '/tmp/sanitized_v2/', 'test', 0, 'Autohaus Isernhagen')
print(f'Result: {result} ({os.path.getsize(result)} bytes) in {time.time()-t0:.1f}s')
"
```
**Criterio PASS**: foto con testo rimosso, tempo <60s, confronto visivo raw vs sanitized

### Step 3: Se Bug 1 fix funziona → test pipeline completa
```bash
python3 tools/on_demand_runner.py --marca BMW --modello X3 --budget 40000 --dealer SANITIZER_FINAL
```
Verificare output PDF: zero "Autohaus Isernhagen" visibile.

### Step 4: Se testo banner bottom ancora visibile → Fix Bug 2
Aggiungere bottom banner crop in `_detect_banner_crop()`:
```python
# BOTTOM zone: look for edge at 75-97% height
for row in range(int(h * 0.97), int(h * 0.75), -1):
    diff = abs(float(np.mean(gray[row])) - float(np.mean(gray[row - 1])))
    if diff > 15:
        crop_bottom = h - row + int(h * 0.02)
        break
# Poi: cv_img = cv_img[:h-crop_bottom, :]
```

### Step 5: Test regressione KORDICK
```bash
# Usa le foto KORDICK salvate in dossiers/safe_images/
PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK=True /usr/local/bin/python3.12 -c "
from src.cove.image_sanitizer import sanitize_image
result = sanitize_image('dossiers/safe_images/kordick_test.jpg', '/tmp/kordick_regression/', 'kordick', 0, 'KORDICK')
"
```

### Step 6: Soft launch (dopo tutti i test green)
1. Recovery Car Plus AV (manuale da telefono)
2. Warm-up WA: 5-10 messaggi organici
3. Soft launch Stefano Auto FG con veicolo reale da pipeline

## File chiave
```
Sanitizer:        src/cove/image_sanitizer.py (Bug 1 fixato, Bug 2 da fare)
PDF generator:    tools/scripts/pdf_generator_enterprise.py (subprocess sanitizer)
Pipeline:         tools/on_demand_runner.py (A0-A4 completi)
Enricher:         tools/scrapers/detail_enricher.py (price+fuel+color+images HD)
WA daemon:        wa-intelligence/wa-daemon.js (/send-doc endpoint)
```

## Contesto tecnico
```
iMac: ssh gianlucadistasi@192.168.1.2
Python principale: /usr/local/bin/python3 (3.14) — NO paddleocr
Python sanitizer:  /usr/local/bin/python3.12 — paddleocr 3.4.1 + paddlepaddle 3.0.0 + simple-lama
WA daemon: PM2 argos-wa-daemon (online, connected)
Dashboard: PM2 argos-dashboard (python3.13 + uvicorn, password forte)
DB: ~/Documents/app-antigravity-auto/dealer_network.sqlite
PM2 PATH: export PATH=$HOME/.npm-global/bin:/usr/local/bin:$PATH
```

## Token da revocare (azione manuale founder)
- GitHub PAT `ghp_zgws...` — ancora ATTIVO su github.com/settings/tokens
- TG bot token — ancora ATTIVO, serve BotFather /revoke + rigenera
