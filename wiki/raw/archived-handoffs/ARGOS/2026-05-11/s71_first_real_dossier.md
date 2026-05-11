# PROMPT S71 — DEEP RESEARCH + PRIMO DOSSIER REALE

## REGOLA D'ORO (CLAUDE.md)
> ZERO COSTI — tutto deve essere gratuito o gia' pagato.
> Se serve un dato, SCRAPPALO. Se serve un servizio, trovalo FREE o costruiscilo.
> ENTERPRISE GRADE — tutto il resto e' consentito.

## CONTESTO S70
- Pipeline E2E COSTRUITA: Scraper→Enrichment→Dedup→MarketPriceIndex→ADAC→CoVe→Score→PDF
- 5 moduli operativi COSTRUITI ma NON VALIDATI su dati reali:
  1. Image Downloader (upgrade URL full-res, download locale)
  2. Transport Estimator (stime generiche, NON calibrato)
  3. Import Checklist (16 step per paese, documenti export specifici)
  4. Portali premium/supercar (config + profile OK, JS SPA da sbloccare)
  5. PDF Dossier (con Opportunity Score + trasporto + import)
- Trip Calculator era PREVISTO in S37, il transport_estimator e' il primo tentativo

## PRIORITA' S71 — APPROVATE CON RISERVA FOUNDER

### 1. DEEP RESEARCH: IMMAGINI HD — GRATIS
**Problema:** L'aggressive parser (6 portali) non estrae immagini. AutoScout24 gia' upgrade a 1080x720.
**Ricerca:**
- Testare image_downloader.py su 10 listing REALI scrappati
- Verificare che upgrade URL funzioni per: AutoScout24 (2560x1920), OLX (2048x1360), Finn (1600w)
- Fixare aggressive parser per estrarre almeno 1 immagine
- Verificare anti-hotlinking con Referer header
**Zero costi:** Download diretto dai CDN dei portali. Nessuna API.
**Valutazione founder+CTO dopo test.**

### 2. DEEP RESEARCH: TRASPORTO — GRATIS
**Problema:** transport_estimator.py usa stime generiche. Trip Calculator era previsto in S37.
**Ricerca fonti GRATUITE:**
- Via Michelin / ADAC Routenplaner → distanze reali + pedaggi
- Macingo.com → scrape preventivi per 5 rotte campione (DE/NL/BE/AT/SE→Eboli)
- Clicktrans.com → aste completate, prezzi reali
- Google Maps Distance Matrix → free tier 100 req/giorno? O scrape?
- ADAC: endpoint pedaggi + carburante (gia' scoperto apim.adac.de)
**Zero costi:** Tutto scraping o API free tier.
**Valutazione founder+CTO dopo calibrazione.**

### 3. DEEP RESEARCH: CHECKLIST IMPORT — VALIDAZIONE
**Problema:** import_checklist.py ha basi solide per DE/NL/BE/AT ma non validato.
**Azioni:**
- Aggiungere documenti per: RO, BG, LT, LV, EE, HR, SI, SK, HU
- Verificare costi IPT 2026 per provincia Salerno
- Verificare tempi reali Motorizzazione Civile Sud Italia
- Integrare info da normative_eu_it.md (gia' nel progetto)
**Zero costi:** Informazioni pubbliche ACI, Motorizzazione, agenziepraticheauto.it
**Valutazione founder: "conosci agenzie pratiche auto a Eboli/Salerno?"**

### 4. PORTALI SUPERCAR + VOLUME — GRATIS
**Problema:** 28 portali E2E, ma TUTTI i premium/supercar sono JS SPA broken.
**Gia' nel progetto:**
- Config: elferspot_eu, jamesedition_eu, collecting_cars_eu, classic_driver_eu, bat_eu
- SearchProfile per tutti e 5
- Selenium + chromedriver installato
- ResilientFetcher ha backend Selenium
**Azioni:**
- Testare Selenium su ClassicDriver (piu' probabile successo — server-side rendering?)
- Testare Selenium su Elferspot (Porsche-only, valore altissimo per dealer)
- Testare mobile.de (scraper dedicato esiste, non testato)
- Target: da 28 a 35+ portali funzionanti
**Zero costi:** Selenium gia' installato, chromedriver gia' presente.

### 5. PRIMO DOSSIER REALE
**Prerequisiti:** Almeno punti 1+4 completati.
**Azioni:**
- Run ScraperCovePipeline.run("BMW", "X3") — scraping REALE
- Run pipeline anche per "Porsche", "Macan" (test supercar per dealer che trattano premium)
- Generare PDF per Autovanny Group con TOP 5 opportunita'
- Verificare che il dossier contenga: foto, prezzo, margine, trasporto, checklist
**Il test:** "Autovanny apre il PDF e dice: questo non lo trovo da nessun'altra parte"

## FILE DA LEGGERE (OBBLIGATORIO)
```
tools/scrapers/image_downloader.py         ← Image HD downloader (S70)
tools/transport_estimator.py               ← Transport estimator (S70, DA CALIBRARE)
tools/import_checklist.py                  ← Import checklist (S70, DA VALIDARE)
tools/fee_calculator.py                    ← Fee calculator (ESISTENTE)
src/marketing/knowledge_base/normative_eu_it.md ← Normative (ESISTENTE)
src/cove/scraper_cove_pipeline.py          ← Pipeline E2E (S70)
src/cove/market_verifier_enterprise.py     ← Dual-source verifier (S70)
src/cove/adac_price_reference.py           ← ADAC (S70)
tools/scrapers/generic_scraper.py          ← 8 layer parsing (fix aggressive imgs)
tools/scrapers/portal_profiles.py          ← 65 profili (5 premium da sbloccare)
tools/scrapers/resilient_fetcher.py        ← Multi-backend incl. Selenium
tools/scripts/pdf_generator_enterprise.py  ← PDF dossier (S70 upgrade)
docs/dev/BUSINESS_MODEL_CORE.md            ← Trip Calculation previsto S37
```

## NON FARE IN S71
- NON costruire cose nuove prima di validare quelle esistenti
- NON presentare stime non calibrate come dati reali
- NON dichiarare portali "funzionanti" senza test E2E
- NON generare dossier con dati sintetici — SOLO dati reali
