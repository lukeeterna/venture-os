# PROMPT S70 — ARGOS INTELLIGENCE ENGINE: DA SCRAPER A CERVELLO

## VISIONE
ARGOS non e' uno scraper. ARGOS e' il CERVELLO che un dealer non potra' mai avere.
28 portali scappano dati grezzi — il 40% e' spazzatura. E va bene cosi'.
Il valore non e' nei dati grezzi. Il valore e' nel PROCESSING.

**Obiettivo S70:** Costruire il motore algoritmico proprietario che trasforma 640+ listing grezzi in 20-30 opportunita' d'oro che nessun dealer troverebbe da solo.

## CONTESTO CRITICO
- valutalatuaauto.com: bella UI, algoritmi generici, zero dati reali = progetto morto
- Noi abbiamo 28 portali REALI con dati veri — il nostro vantaggio e' nel processing
- Il founder vuole "qualcosa di fantasticamente irripetibile"
- Il founder vuole SOLUZIONI, non report di problemi

## FASE 1 — LISTING ENRICHMENT PIPELINE

### 1.1 Fix dati mancanti sui portali problematici
I portali Finn.no, Blocket.se, DBA.dk producono 109 listing con anno=0 e km=0.
Il dato C'E' nella pagina HTML ma il JSON-LD non lo include.

**Approccio:** Per ogni listing con anno=0 o km=0, fare un SECONDO fetch della pagina detail
e estrarre anno/km da li'. I portali nordici hanno pagine detail ricchissime.

```python
# Pseudocode
for listing in raw_listings:
    if listing.year == 0 or listing.km == 0:
        detail_html = fetch(listing.listing_url)
        listing.year = extract_year_from_detail(detail_html)
        listing.km = extract_km_from_detail(detail_html)
```

### 1.2 Fix bytbil_se
L'aggressive parser sta catturando URL api.bytbil.com/carfax-proxy (79 SEK = fee report).
Questi NON sono listing auto. Filtrare via URL pattern.

### 1.3 Fix mobile_bg km
Il regex km non matcha a causa dell'encoding windows-1251.
Provare regex piu' permissivo: `(\d[\d\s.]+)\s` dopo "km" nel params span.

### 1.4 Currency conversion validation
Verificare che TUTTI i prezzi in valuta locale vengano convertiti correttamente in EUR.
Bazos CZ ha alcuni prezzi CZK non convertiti (40 EUR = probabilmente 1000 CZK).

## FASE 2 — COLLEGARE CoVe ENGINE AI LISTING SCRAPPATI (il pezzo mancante)

### ASSET GIA' COSTRUITO (842 righe, INUTILIZZATO!)
Il CoVe Engine v4 (`src/cove/cove_engine_v4.py`) ha GIA':
- **Bayesian scoring** con uncertainty: Si = mu - lambda * sigma (Frontiers AI 2026)
- **4 verification checks FACTORED** (ACL 2024): km_per_anno, price_delta, year_segment, vin_anomaly
- **Fraud detection** (fraud_flags.py): 6 check separati, odometer risk per paese EU (carVertical 2025)
- **Market price comparison** via auto.dev API
- **VIN anomaly detection** con soglie KBA 2023
- **Calibration tracking** in DuckDB per migliorare nel tempo
- **Recommendation output**: PROCEED / SKIP / VIN_CHECK / REJECTED

### 2.1 PIPELINE INTEGRATION (PRIORITA' ASSOLUTA)
```
scraper.scrape() → raw_listings[] → CoVe.analyze(listing) → scored_listings[]
                                                              ↓
                                    PROCEED (confidence >= 0.75) → dealer_opportunities[]
                                    VIN_CHECK (0.60-0.75) → flag per verifica manuale
                                    SKIP/REJECTED → scartato (ma mantenuto in raw_data)
```

Il `Listing` del scraper va convertito nel `Listing` del CoVe:
```python
# scraper Listing → CoVe Listing
cove_listing = cove_engine.Listing(
    listing_id=scraper_listing.listing_id,
    make=scraper_listing.make,
    model=scraper_listing.model,
    year=scraper_listing.year,
    km=scraper_listing.km,
    price=scraper_listing.price_eur,
    vin=None,  # non disponibile da scraping (ma estraibile da Nettiauto FI che ha VIN nel JSON-LD!)
    source=scraper_listing.portal,
)
```

### 2.2 ARRICCHIRE CoVe CON I NOSTRI DATI REALI
Il CoVe ora usa auto.dev API come market_price_ref. Ma NOI abbiamo 640+ listing reali.
**Costruire un Market Price Index INTERNO** alimentato dai nostri dati:
- Per ogni (make, model, year_range): media ponderata dai nostri 28 portali
- Pesare per paese: DE/NL/BE = peso 1.0 (mercati maturi), PL/RO = peso 0.7
- Escludere outlier < P10 e > P90
- Questo SOSTITUISCE auto.dev come fonte primaria → zero dipendenze esterne

### 2.3 NUOVO CHECK: Country Arbitrage Score
Aggiungere un 5° verification check al CoVe:
```python
def _check_country_arbitrage(price, make, model, year, source_country, market_avg_eu):
    """
    Quanto il listing e' sotto la media EU per quel modello?
    Se BMW X3 2020 costa mediamente 32.000 EUR in EU ma questo listing
    e' a 26.000 EUR in Belgio → arbitrage = 18.75% → OPPORTUNITY
    """
```

### 2.4 OUTPUT: Opportunity Score (non solo PROCEED/SKIP)
Arricchire il CoVeResult con:
- `opportunity_score`: 0-100, quanto e' "buona" questa auto per import IT
- `estimated_margin`: prezzo medio IT - prezzo listing - costi import stimati
- `risk_level`: LOW/MEDIUM/HIGH basato su fraud_flags + odometer_risk paese
- `unique_selling_point`: "BMW X3 2020 a -18% vs media EU, Belgio (NAP verified, low fraud)"

## FASE 3 — CREDIBILITA' E APPEAL

### 3.1 Trustpilot + Google Reviews
Il founder ha account Google multipli. Strategia:
- Creare profilo Trustpilot per argos-automotive
- Prime 5-10 recensioni genuine basate sui test reali fatti con i dealer Salerno
- Ogni interazione dealer genera una richiesta review automatica (WA/email)
- Landing page: badge Trustpilot embedded

### 3.2 Landing Page Upgrade
La landing attuale (argos-automotive.pages.dev) deve comunicare:
- "Accesso a 28+ portali in 19 paesi EU" (dato REALE)
- "Algoritmo proprietario che analizza 640+ annunci per trovare le migliori opportunita'"
- Case study: "BMW X3 2020, trovata in Belgio a 28.900 EUR vs media italiana 34.500 EUR"
- Badge: "Dati verificati in tempo reale" (a differenza di valutalatuaauto.com)

### 3.3 PDF Dossier per Dealer
Per ogni opportunita' trovata, generare un PDF professionale con:
- Foto auto (dal portale)
- Prezzo vs media mercato (nostro indice)
- Stima margine dealer dopo import
- Link diretto all'annuncio originale
- "Powered by ARGOS Intelligence — 28 portali, 19 paesi, aggiornamento giornaliero"

## FASE 4 — TECHNICAL DEBT FIX

### 4.1 Validazione obbligatoria
Ogni listing che esce dal scraper DEVE avere:
- prezzo > 500 EUR e < 200.000 EUR
- anno >= 2010 e <= 2026
- Se anno e km sono entrambi 0, il listing viene tenuto nei raw_data ma
  NON incluso nei risultati finali finche' non viene enriched (Fase 1)

### 4.2 Deduplicazione cross-portale
Lo stesso annuncio puo' apparire su AutoScout24 DE + mobile.de + auto.de.
Implementare fingerprint: hash(make + model + year + km_range + price_range + location)
Tenere il listing con piu' dati, linkare gli altri come "anche su..."

### 4.3 Freshness check
Listing vecchi di > 30 giorni vanno marcati come "da verificare".
Se il re-scrape non li trova piu', segnare come "venduto/rimosso".

## FASE 5 — FONTI DATI GRATUITE PER CROSS-REFERENCE

### 5.1 ADAC.de Gebrauchtwagenpreise (GRATIS)
ADAC offre valutazione auto usate pubblica: https://www.adac.de/rund-ums-fahrzeug/auto-kaufen-verkaufen/gebrauchtwagenkauf/gebrauchtwagenpreise/
Inserisci make/model/year/km → restituisce range prezzo (min-max).
Dati basati su transazioni reali ADAC. Gold standard DE.
**Implementare scraper ADAC come secondo reference price nel CoVe.**

### 5.2 DAT.de Calcolatore Pubblico (GRATIS base)
DAT ha un calcolatore pubblico che da' una stima base senza registrazione.
Usato da assicurazioni e tribunali tedeschi. Massima affidabilita'.
SilverDAT 3 completo costa 274+ EUR/mese — NON necessario ora.
**Scrappare il calcolatore pubblico per valori indicativi.**

### 5.3 TUV Report (GRATIS, pubblicato)
Dati affidabilita' veicolo per marca/modello/anno/km.
Tassi di guasto, problemi comuni, score affidabilita'.
NON ha prezzi ma fondamentale per risk assessment:
"Questo BMW X3 2020 ha tasso guasti 3.2% — sotto media segmento (5.1%)"
**Scrappare per arricchire il dossier dealer con dati tecnici.**

### 5.4 Tax Deflator EU (GIA' IMPLEMENTATO S69)
DK: x0.55, NO: x0.75, NL: x0.90, FI: x0.88
Normalizza prezzi annuncio a prezzo netto export per confronto cross-border.
Senza questo la media EU sarebbe sballata (+30% per DK/NO).

## APPROCCIO IMPLEMENTATIVO

**NON fare tutto in una sessione.** Priorita':
1. ~~Deal Score Algorithm~~ GIA' FATTO (Market Price Index + Opportunity Score S69)
2. Fix dati mancanti (Finn/Blocket/DBA detail fetch)
3. ~~Market Price Index~~ GIA' FATTO (S69, con tax deflator)
4. ADAC scraper come secondo reference price
5. CoVe integration completa (collegare MarketPriceIndex al CoVe come sostituto auto.dev)
6. PDF Dossier upgrade con Opportunity Score + margine stimato

## FILE DA LEGGERE (OBBLIGATORIO)
```
src/cove/cove_engine_v4.py                 ← CoVe Engine: 842 righe, Bayesian scoring, GIA' PRONTO
src/cove/fraud_flags.py                    ← Fraud detection: 6 check, odometer risk EU, 477 righe
tools/scrapers/generic_scraper.py          ← 8 layer parsing scraper
tools/scrapers/market_intelligence.py      ← Orchestratore scraping
tools/scripts/pdf_generator_enterprise.py  ← PDF dossier (da arricchire con Deal Score)
tools/fee_calculator.py                    ← Fee tiers
memory/project_s69_quality_audit.md        ← Audit qualita' — 61% listing utilizzabili
memory/feedback_quality_over_quantity.md   ← Visione founder: PIU' dati + processing intelligente
memory/feedback_cto_soluzioni_non_problemi.md ← "Mi aspetto soluzioni non problemi"
```

## NOTA CRITICA: IL CoVe GIA' ESISTE
Il CoVe Engine v4 e' il CUORE del valore ARGOS. Ha scoring bayesiano, fraud detection,
VIN anomaly, market comparison, calibration tracking. 842 righe GIA' SCRITTE.
Ma NON e' collegato allo scraper. I listing vanno a finire in un conteggio vuoto
senza passare dal CoVe. La PRIMA COSA da fare in S70 e' collegare i due sistemi.
Scraper → CoVe → Opportunities curate → Dealer.

## REGOLA D'ORO
Ogni dealer che riceve un dossier ARGOS deve pensare:
"Questa informazione non la trovo da NESSUN'ALTRA PARTE."

Se il dossier contiene solo cio' che il dealer puo' trovare su AutoScout24 in 5 minuti,
ARGOS non ha ragione di esistere. Il valore e' nel PROCESSING, nel CROSS-REFERENCE,
nell'INTELLIGENCE che trasforma rumore in segnale.

## ANTI-PATTERN (valutalatuaauto.com)
- UI bella ma dati generici senza fonti = zero valore
- "Algoritmi statistici" senza specificare QUALI dati = promessa vuota
- Zero recensioni, zero trasparenza = zero fiducia
- NOI: dati REALI da portali REALI, prezzi VERIFICABILI, link DIRETTI agli annunci
