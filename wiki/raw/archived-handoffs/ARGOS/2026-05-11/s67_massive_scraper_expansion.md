# PROMPT S67 — SCRAPER TOTALE: OGNI FONTE EU + PDF DOSSIER

## VISIONE FOUNDER (non negoziabile)
"DOBBIAMO AVERE IL MAGGIOR NUMERO DI INFORMAZIONI DI SCRAPING POSSIBILI PER DARE DAVVERO LA SOLUZIONE MIGLIORE AL CLIENTE"
→ Non top 16, non top 25. TUTTI. 60+ scraper. Copertura TOTALE.
→ Il vantaggio competitivo ARGOS è nella QUANTITÀ di fonti inaccessibili al dealer.
→ Meglio 60 scraper base (titolo+prezzo+URL+1 immagine) che 5 perfetti.

## CONTESTO S66
- AutoScout24 E2E funzionante: 7 paesi, __NEXT_DATA__ parsing, mmmv IDs, HD images
- Mobile.de: compilato, NON testato live
- BaseScraper: interfaccia pulita, pronta per estensione rapida
- DB: SQLite market_listings, upsert, price tracking
- 4 ricerche deep completate (vedi sotto)

## LEGGERE PRIMA DI TUTTO
```
research/s66_DATI_REALI_dealer_needs.md          ← NUMERI VERI con fonti (0.93% margine, 78% shortage, 74% lost sales)
research/s66_all_eu_portals_2026.md              ← 196 portali in 24 paesi EU (676 righe)
research/s66_auction_b2b_portals_eu.md           ← aste/fleet con score e requisiti
research/s66_dealer_communities_intelligence.md  ← community dealer + pain points
```

## PRIORITÀ 1: IMPLEMENTARE TUTTI GLI SCRAPER (lista completa)

### CLASSIFIEDS — 30+ portali (1 scraper per portale)

**Germania (DE)**
1. Kleinanzeigen.de — 800K+, private gems
2. Pkw.de — 150K+, portale "dimenticato"
3. Auto.de — 200K+

**Olanda (NL)**
4. Marktplaats.nl — 200K+, privati NL
5. AutoTrack.nl — 150K+

**Belgio (BE)**
6. 2dehands.be — 80K+

**Austria (AT)**
7. Willhaben.at — 150K+
8. Gebrauchtwagen.at
9. Autorevue.at

**Francia (FR)**
10. Leboncoin.fr — 500K+
11. L'Argus.fr — quotazioni + classifieds
12. Lacentrale.fr

**Svezia (SE)**
13. Blocket.se
14. Bytbil.com

**Rep. Ceca (CZ)**
15. Sauto.cz
16. Bazos.cz
17. Inzerce.auto.cz

**Polonia (PL)**
18. Otomoto.pl — enorme
19. OLX.pl

**Ungheria (HU)**
20. Hasznaltauto.hu — ungherese = barriera totale

**Romania (RO)**
21. Autovit.ro
22. OLX.ro

**Danimarca (DK)**
23. DBA.dk
24. Bilbasen.dk

**Spagna (ES)**
25. Coches.net
26. Milanuncios.com

**Portogallo (PT)**
27. Standvirtual.com

**Irlanda (IE)**
28. DoneDeal.ie
29. CarsIreland.ie

**Grecia (GR)**
30. Car.gr
31. Xe.gr

**Slovenia (SI)**
32. Avto.net — confine Trieste, logistica minima
33. Bolha.com

**Slovacchia (SK)**
34. Autobazar.eu

**Baltici (EE/LV/LT)**
35. Auto24.ee
36. SS.lv (Lettonia)
37. Autoplius.lt

**Bulgaria (BG)**
38. Mobile.bg
39. Cars.bg

**Croazia (HR)**
40. Njuskalo.hr

**Finlandia (FI)**
41. Nettiauto.com

**Lussemburgo (LU)**
42. Autoscout24.lu (già coperto)
43. Anzeiger.lu — ex-diplomatici EU

**Norvegia (NO, non EU ma rilevante)**
44. Finn.no

### ASTE B2B + FLEET — TUTTE (scraper o monitor)

**Aste pan-EU**
45. OPENLANE (openlane.eu) — 4.000 veicoli/giorno, 50+ paesi
46. BCA (bca.com) — 12+ paesi
47. Autorola (autorola.eu) — 70K buyer, 24 paesi
48. Manheim Express (manheim-express.eu)

**Aste nazionali**
49. CarOnSale (caronsale.com) — DE, fee €99+
50. Autobid.de — 4.500/settimana
51. eCarsTrade (ecarstrade.com) — 18K/settimana, partnership Arval
52. AutoProff (autoproff.com) — Scandinavia
53. KvdAuctions/KvdCars (kvdcars.com) — Svezia
54. VPauto (vpauto.fr) — Francia
55. Alcopa Auction (alcopa-auction.fr) — 145K/anno FR/BE
56. Vwe.nl — aste export NL

**Fleet remarketing**
57. Ayvens Carmarket (carmarket.ayvens.com) — 3.4M veicoli, 38 mercati
58. Arval MotorTrade (arvaltrading.com) — 1.8M veicoli, 28 paesi
59. Athlon CarPlaza (athloncarplaza.com)
60. Exleasingcar.com — aggregatore BCA 14 paesi

### PREMIUM + LUXURY
61. Elferspot (elferspot.com) — solo Porsche, 13K/anno, zero fee
62. JamesEdition (jamesedition.com) — 15K+ luxury
63. Collecting Cars (collectingcars.com) — aste premium
64. Classic Driver (classicdriver.com)
65. Bring a Trailer EU partner

### AGGREGATORI + INTELLIGENCE
66. Carapis API (docs.carapis.com) — 25+ mercati
67. AutoUncle (autouncle.com) — aggrega 1.900+ siti
68. AUTO1 Price Index — GRATUITO, benchmark mensile
69. Indicata (indicata.com) — 18 paesi, 5 anni storico

### COMMUNITY DEALER (scraping intelligence)
70. DealerLink.it — articoli + dati survey
71. forum.quattroruote.it — sezioni import/usato
72. eCarsTrade blog — pain points EU
73. kfz-betrieb.vogel.de — trade media DE

**= 73 FONTI TOTALI da implementare**

## APPROCCIO TECNICO

**Pattern per ogni nuovo scraper:**
1. `python3 -c "from tools.scrapers.X_scraper import XScraper; s = XScraper(); s.test_connection()"` — funziona?
2. Fetch 1 pagina → scopri struttura (JSON API? __NEXT_DATA__? HTML puro?)
3. Implementa `build_search_url()` + `parse_listings()` base
4. Test: `--test BMW "Serie 3"` → almeno titolo+prezzo+URL
5. Aggiungi a config.py PORTALS + orchestrator get_scraper()

**Velocità > perfezione:**
- Scraper base: titolo, prezzo, URL, 1 immagine = SUFFICIENTE per v1
- Upgrade parsing (km, anno, fuel, seller) = v2
- L'obiettivo è COPERTURA, non perfezione

**File da estendere:**
```
tools/scrapers/base_scraper.py              ← BaseScraper da cui ereditare
tools/scrapers/autoscout_scraper.py         ← ESEMPIO FUNZIONANTE da copiare
tools/scrapers/config.py                    ← aggiungere PortalConfig per ogni nuovo portale
tools/scrapers/market_intelligence.py       ← aggiungere a get_scraper() factory
```

## PRIORITÀ 2: PDF DOSSIER CON IMMAGINI HD

Quando dealer chiede veicolo, ARGOS genera PDF enterprise:
- Logo ARGOS + watermark "CONFIDENZIALE"
- 4-6 foto HD (1080x720)
- Dati: anno, km, prezzo, fuel, transmission, seller location
- Price comparison vs media mercato da TUTTI i portali scrappati
- **MAI fonte (URL) prima del pagamento**
- Dopo pagamento: rivela fonte + contatto

## PRIORITÀ 3: MOBILE.DE LIVE TEST + DEPLOY

- Mobile.de: test E2E come AutoScout24
- Deploy tutti gli scraper su iMac via SSH
- PM2 schedule (05:00 lun-ven)
- Telegram digest automatico

## REGOLE IMMUTABILI
- MAI toccare cove_engine_v4.py
- MAI credenziali hardcoded → solo .env
- Dati reali o niente — mai placeholder
- TUTTI i portali, TUTTE le aste, TUTTE le fonti — copertura TOTALE
- TUTTI i mercati, TUTTE le lingue, senza paura
- "TUTTO SI PUÒ FARE, BISOGNA SOLO TROVARE IL MODO"

## NOTE TECNICHE S66
- AutoScout24 mmmv: `{makeId}|{modelGroupId}||` o `{makeId}||{modelLineId}|`
- IDs >= 100000 NON funzionano in mmmv — make-only + post-filter
- __NEXT_DATA__: `props.pageProps.listings[]`
- Immagini HD: `/250x188.webp` → `/1080x720.webp`
- curl_cffi + impersonate chrome120 bypassa anti-bot
- Per Lambo/Ferrari/McLaren/Land Rover: make-only, post-filter in code

## DATI REALI MERCATO
- **0.93%** margine dealer IT (Snap-on 2025) — 26.6% in perdita
- **78%** dealer teme shortage stock (Motorway UK, 500 dealer)
- **74%** ha GIÀ PERSO vendite per mancanza stock
- **50%** dealer IT compra usato dall'estero, 43% via aste
- **92%** dice sourcing digitale essenziale 2026
- Solo **33%** ha team usato dedicato
- Ayvens: 3.4M veicoli | Arval: 1.8M | OPENLANE: 4K/giorno

## INTELLIGENCE GRATUITA DA INTEGRARE
- AUTO1 Price Index (auto1-group.com/press) — benchmark mensile GRATUITO
- Indicata Market Tracker — 18 paesi, 5 anni storico
- Carapis API — 25+ mercati
- Exleasingcar.com — aggregatore BCA 14 paesi, 7K/settimana

## EVENTI
- Automotive Dealer Day Verona: 19-21 MAGGIO 2026 (4.500 dealer)
- Internationales GW-Forum: meeting TORINO (welcome@internationales-gw-forum.com)
- Podcast Automotive Forum LIVE (Quintegia, Spotify)
