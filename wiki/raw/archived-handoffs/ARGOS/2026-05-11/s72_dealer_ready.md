# PROMPT S72 — DEALER-READY MACHINE: Mobile.de + Batch Runner + Autovanny Delivery

## REGOLA D'ORO (CLAUDE.md)
> ZERO COSTI — tutto deve essere gratuito o gia' pagato.
> ENTERPRISE GRADE — tutto il resto e' consentito.
> ZERO source/location nei materiali dealer — REGOLA IMMUTABILE S71.
> Watermark ARGOS su TUTTE le immagini dealer — REGOLA IMMUTABILE S71.

## CONTESTO S71 — COSA ABBIAMO

Pipeline E2E VALIDATA su dati reali:
```
Scraper (16 fast) → 535 listing → 62 opp PROCEED → PDF con foto HD + watermark
BMW X3:       366 listing → 48 PROCEED → 5 PDF (top: score 93, margine +EUR 8.645)
Porsche Macan: 169 listing → 14 PROCEED → 3 PDF (top: score 91, margine +EUR 27.980)
```

Cosa FUNZIONA:
- CoVe + ADAC dual-source su ogni listing
- ImageDownloader HD + watermark ARGOS (Pillow)
- PDF enterprise con foto + intelligence + trasporto + import (ZERO source leak)
- Transport estimator 22 paesi
- Import checklist 22 paesi con docs export
- 5 backend anti-bot (curl_cffi, cloudscraper, selenium, undetected, requests)

Cosa NON funziona:
- **mobile_de**: zero listing (parser broken — portale DE piu' importante)
- **autotrack_nl**: fix applicato (uses_next_data=True) ma NON testato E2E
- **Pipeline 73 portali**: troppo lenta per interattivo (Selenium fallback)

## PRIORITA' S72 — IN ORDINE DI ESECUZIONE

### 1. FIX MOBILE.DE — CRITICO (30 min)
**Perche':** Mobile.de e' il portale DE piu' grande. Senza di lui, perdiamo il mercato tedesco.
**Diagnosi:**
- Il fetch funziona (HTTP 200 via curl_cffi)
- Il parser fallisce: zero listing estratti
- Causa: mobile.de ha cambiato struttura HTML/JSON
**Azioni:**
1. Scaricare HTML reale di una ricerca BMW X3 su mobile.de
2. Cercare: `__NEXT_DATA__`, `__INITIAL_STATE__`, JSON-LD, strutture dati embedded
3. Aggiornare `mobile_de_scraper.py` parse_listings() di conseguenza
4. Test: `python3 -c "from tools.scrapers.mobile_de_scraper import MobileDeScraper; s=MobileDeScraper(); l,r=s.scrape('BMW','X3',max_pages=1); print(f'{len(l)} listing')"`
**File:** `tools/scrapers/mobile_de_scraper.py` (linee 349-509 — parsing)

### 2. VERIFICA FIX AUTOTRACK.NL (10 min)
**Azioni:**
- Run test: `python3 -c "from tools.scrapers.market_intelligence import get_scraper; s=get_scraper('autotrack_nl'); l,r=s.scrape('BMW','X3',max_pages=1); [print(f'{l.listing_url[:60]}') for l in l[:5]]"`
- Verificare che URL contengano "bmw" e "x3"
- Se ancora broken, analizzare l'HTML __NEXT_DATA__ di autotrack.nl
**File:** `tools/scrapers/portal_profiles.py` (linea 98-109)

### 3. BATCH RUNNER — Pipeline notturna (45 min)
**Problema:** 73 portali = troppi per uso interattivo. Serve batch runner.
**Soluzione:**
```python
# tools/batch_runner.py
# 1. Scrape TUTTI i portali (con timeout 30s per portale)
# 2. Salva risultati in data/batch_results/{date}_{make}_{model}.json
# 3. Run CoVe scoring su tutti i listing
# 4. Genera dossier per dealer specifici
# 5. Opzionale: invia via WA daemon
```
**Requisiti:**
- `FAST_PORTALS` (16) per demo interattive (< 3 min)
- `ALL_PORTALS` (73) per batch notturni su iMac (< 30 min con timeout)
- Salvataggio risultati in JSON persistente
- Skip portali che hanno dato errore > 3 volte consecutive
- Log: quanti listing, quanti PROCEED, quanti PDF generati
**Deploy:** PM2 cron su iMac, esecuzione alle 03:00 ogni notte

### 4. DOSSIER MULTI-VEICOLO COMBINATO (30 min)
**Problema:** 1 PDF per veicolo = scomodo. Serve 1 PDF con tutti i migliori deal.
**Soluzione:**
- Cover page ARGOS con data e dealer
- Indice: "5 Migliori Opportunita' della Settimana"
- 1 pagina per veicolo: foto + pricing + intelligence + margine
- Pagina finale: confronto side-by-side dei top 5
- Footer: "ARGOS Automotive | Luca Ferretti | Scouting EU esclusivo"
**Implementazione:** Aggiungere `generate_combined_dossier()` in `pdf_generator_enterprise.py`

### 5. DELIVERY AUTOVANNY — PRIMO INVIO REALE (20 min)
**Prerequisiti:** Punti 1-4 completati.
**Azioni:**
1. Run batch per 5 modelli: BMW X3, BMW X5, Mercedes GLC, Audi Q5, Porsche Macan
2. Generare dossier combinato per Autovanny Group (Giovanni Vannicola, Eboli)
3. Top 3 per modello = 15 opportunita' nel dossier
4. Copiare PDF su iMac per invio
5. **NON inviare via WA autonomamente** — attendere OK founder
**Test:** "Autovanny apre il PDF e dice: questa roba non la trovo da nessun'altra parte"

## FILE DA LEGGERE (OBBLIGATORIO)
```
tools/scrapers/mobile_de_scraper.py         ← Parser da fixare (CRITICO)
tools/scrapers/portal_profiles.py           ← autotrack_nl fix da verificare
tools/scrapers/generic_scraper.py           ← Layer di parsing
tools/scrapers/resilient_fetcher.py         ← Backend anti-bot
src/cove/scraper_cove_pipeline.py           ← Pipeline E2E
tools/scrapers/image_downloader.py          ← HD + watermark ARGOS (S71)
tools/scripts/pdf_generator_enterprise.py   ← PDF con foto (S71)
tools/transport_estimator.py                ← Stime trasporto
tools/import_checklist.py                   ← 22 paesi (S71)
```

## NON FARE IN S72
- NON esporre source/location nei PDF (E23)
- NON rimuovere watermark dalle immagini (E24)
- NON costruire nuovi scraper prima di fixare mobile.de
- NON inviare nulla ad Autovanny senza OK del founder
- NON toccare cove_engine_v4.py
- NON aggiungere costi (API, subscription, servizi)
