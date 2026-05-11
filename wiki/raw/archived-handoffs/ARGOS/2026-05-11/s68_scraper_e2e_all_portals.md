# PROMPT S68 — TUTTI I 73 PORTALI SCRAPABILI E2E + PDF DOSSIER

## VISIONE FOUNDER (non negoziabile)
"TUTTI i portali automotive europei scrapabili in maniera PERSISTENTE. Non 7 su 73. TUTTI."

## CONTESTO S67
- **73 portali configurati** in `config.py` + `portal_profiles.py`
- **70/73 raggiungibili** (connection test OK)
- **Solo 7/73 E2E verificati** con listing reali (Otomoto, Standvirtual, Autovit, Willhaben, 3x AutoScout24)
- **63 portali** raggiungibili ma parsing 0 listing — URL template o parsing da fixare
- **3 portali** bloccati da WAF (DoneDeal.ie, Hasznaltauto.hu, Anzeiger.lu)
- `GenericClassifiedScraper` con 6-layer parsing (GraphQL → NEXT_DATA → JSON-LD → regex → aggressive)
- `ResilientFetcher` multi-backend (curl_cffi → cloudscraper → Selenium Chrome)
- Cache backend + cookie persistence su disco

## LEGGERE PRIMA DI TUTTO
```
tools/scrapers/generic_scraper.py          ← GenericClassifiedScraper (engine parsing)
tools/scrapers/portal_profiles.py          ← 65 SearchProfile (URL templates)
tools/scrapers/resilient_fetcher.py        ← ResilientFetcher (anti-bot)
tools/scrapers/config.py                   ← 73 PortalConfig
tools/scrapers/market_intelligence.py      ← Orchestratore + get_scraper() factory
tools/scrapers/autoscout_scraper.py        ← ESEMPIO scraper specializzato funzionante
tools/scrapers/models.py                   ← Listing dataclass
```

## PRIORITA' 1: PORTARE TUTTI I 73 PORTALI A E2E FUNZIONANTE

### Metodo per ogni portale:
1. `python3 -c "from tools.scrapers.market_intelligence import get_scraper; s = get_scraper('PORTAL_KEY'); url = s.build_search_url('BMW', 'X3', page=1); print(url)"`
2. Fetch la pagina e verifica che arrivi HTML (non 404)
3. Se 404: trovare l'URL di ricerca corretto del portale (web search se necessario)
4. Analizzare struttura HTML: ha __NEXT_DATA__? JSON-LD? Quale struttura?
5. Aggiornare `SearchProfile` in `portal_profiles.py` con URL e parsing corretti
6. Verificare: `scraper.scrape("BMW", "X3", max_pages=1)` → listing > 0?
7. Se parsing 0: aggiungere handler specifico nel `GenericClassifiedScraper` o creare scraper dedicato

### Portali da fixare (in ordine di importanza per il business):
**TIER 1 — Mercati principali (DE/NL/BE/AT/FR):**
- [ ] `kleinanzeigen_de` — DE, 800K+ annunci, privati gems
- [ ] `pkw_de` — DE, 150K+
- [ ] `auto_de` — DE, 200K+
- [ ] `marktplaats_nl` — NL, 200K+, privati
- [ ] `autotrack_nl` — NL, 150K+
- [ ] `2dehands_be` — BE, 80K+
- [ ] `gebrauchtwagen_at` — AT
- [ ] `autorevue_at` — AT
- [ ] `leboncoin_fr` — FR, 500K+
- [ ] `largus_fr` — FR
- [ ] `lacentrale_fr` — FR

**TIER 2 — Mercati secondari (SE/CZ/PL/DK/ES):**
- [ ] `blocket_se` — SE
- [ ] `bytbil_se` — SE
- [ ] `sauto_cz` — CZ
- [ ] `bazos_cz` — CZ
- [ ] `inzerce_auto_cz` — CZ
- [ ] `olx_pl` — PL (HTML puro, no NEXT_DATA)
- [ ] `bilbasen_dk` — DK
- [ ] `dba_dk` — DK
- [ ] `coches_net` — ES (parsing da migliorare, trova solo 1 listing)
- [ ] `milanuncios_es` — ES

**TIER 3 — Nicchia (massimo valore ARGOS):**
- [ ] `avtonet_si` — SI, confine Trieste
- [ ] `bolha_si` — SI
- [ ] `njuskalo_hr` — HR
- [ ] `nettiauto_fi` — FI
- [ ] `car_gr` — GR
- [ ] `xe_gr` — GR
- [ ] `autobazar_sk` — SK
- [ ] `auto24_ee` — EE
- [ ] `ss_lv` — LV
- [ ] `autoplius_lt` — LT
- [ ] `mobile_bg` — BG
- [ ] `cars_bg` — BG
- [ ] `finn_no` — NO
- [ ] `standvirtual_pt` — PT (GIA' FUNZIONANTE ✓)
- [ ] `autovit_ro` — RO (GIA' FUNZIONANTE ✓)
- [ ] `olx_ro` — RO

**TIER 4 — Aste B2B + Fleet (valore enterprise):**
- [ ] `openlane_eu` — OPENLANE (4K veicoli/giorno)
- [ ] `bca_eu` — BCA (12+ paesi)
- [ ] `autorola_eu` — Autorola (70K buyer)
- [ ] `manheim_express_eu` — Manheim
- [ ] `caronsale_de` — CarOnSale
- [ ] `autobid_de` — Autobid (4.5K/settimana)
- [ ] `ecarstrade_eu` — eCarsTrade (18K/settimana)
- [ ] `autoproff_eu` — AutoProff (Scandinavia)
- [ ] `kvdcars_se` — KVD
- [ ] `vpauto_fr` — VP Auto
- [ ] `alcopa_fr` — Alcopa (145K/anno)
- [ ] `vwe_nl` — VWE
- [ ] `ayvens_carmarket` — Ayvens (3.4M veicoli)
- [ ] `arval_motortrade` — Arval (1.8M veicoli)
- [ ] `athlon_carplaza` — Athlon
- [ ] `exleasingcar_eu` — ExLeasingCar

**TIER 5 — Premium + Aggregatori:**
- [ ] `elferspot_eu` — solo Porsche
- [ ] `jamesedition_eu` — luxury
- [ ] `collecting_cars_eu` — aste premium
- [ ] `classic_driver_eu` — classic/premium
- [ ] `bat_eu` — Bring a Trailer
- [ ] `autouncle_eu` — aggregatore 1900+ siti

**BLOCCATI — WAF aggressivo:**
- [ ] `donedeal_ie` — Cloudflare JS challenge → Flaresolverr o proxy residenziale
- [ ] `hasznaltauto_hu` — Cloudflare strict → Flaresolverr
- [ ] `anzeiger_lu` — DNS fallito → verificare dominio corretto

## PRIORITA' 2: SBLOCCARE I 3 PORTALI BLOCCATI

### Approcci:
1. **Flaresolverr** (Docker): risolve Cloudflare challenges via browser reale
   - `docker run -p 8191:8191 flaresolverr/flaresolverr`
   - API: POST `http://localhost:8191/v1` con `{cmd: "request.get", url: "..."}`
2. **Proxy residenziale**: Bright Data, Oxylabs, o ScraperAPI
3. **API ufficiale** (se esiste): DoneDeal ha API? Hasznaltauto?
4. **Selenium NON-headless** su iMac (ha display): risolve challenge interattivamente

## PRIORITA' 3: PDF DOSSIER ENTERPRISE

Quando dealer chiede veicolo, ARGOS genera PDF enterprise:
- Logo ARGOS + watermark "CONFIDENZIALE"
- 4-6 foto HD (1080x720) scaricate durante scraping
- Dati: anno, km, prezzo, fuel, transmission, seller location
- Price comparison vs media mercato da TUTTI i portali scrappati
- **MAI fonte (URL) prima del pagamento**
- Dopo pagamento: rivela fonte + contatto

## PRIORITA' 4: DEPLOY SU iMAC

1. Copia tutti i file scraper su iMac via SSH
2. Installa dipendenze: `pip3 install cloudscraper selenium`
3. Installa chromedriver compatibile su iMac
4. PM2 schedule: `0 5 * * 1-5` (05:00 lun-ven)
5. Telegram digest automatico post-scraping

## APPROCCIO TECNICO

**Per ogni portale:**
1. Fetch pagina di ricerca → scopri struttura
2. Se __NEXT_DATA__: analizza JSON, trova array listing, mappa campi
3. Se JSON-LD: analizza struttura, mappa su Listing
4. Se HTML puro: crea regex specifico o usa aggressive parser
5. Se URL sbagliato: web search per trovare URL corretto
6. Test: `BMW X3 2020-2025 km<80000` → almeno 5 listing

**NON fixare tutti nello stesso modo — ogni portale e' diverso:**
- OLX Group (PL, PT, RO): GraphQL urqlState ✓
- Willhaben (AT): advertSummaryList ✓
- Kleinanzeigen (DE): probabilmente HTML classico
- Leboncoin (FR): probabilmente React/NEXT
- Bilbasen (DK): probabilmente HTML classico
- Finn (NO): probabilmente React

## REGOLE IMMUTABILI
- MAI toccare cove_engine_v4.py
- MAI credenziali hardcoded → solo .env
- Scraper PERSISTENTI — MAI CSS selectors, SOLO dati strutturati
- TUTTI i portali, TUTTE le aste, TUTTE le fonti — copertura TOTALE
- Se un portale e' bloccato, TROVARE un modo — "tutto si puo' fare"
- Multi-backend anti-bot SEMPRE: curl_cffi → cloudscraper → Selenium → Flaresolverr
- Cache backend persistente per dominio
- Test E2E: `BMW X3` deve restituire listing su OGNI portale

## DATI CHIAVE (S66 research)
- **0.93%** margine dealer IT — 26.6% in perdita
- **78%** dealer teme shortage stock 2026
- **74%** ha perso vendite per mancanza stock
- **50%** dealer IT compra usato dall'estero
- **92%** dice sourcing digitale essenziale
- Solo **33%** ha team usato dedicato

## PITCH AGGIORNATO S68
> "Cerchiamo in 73 portali, in 27 paesi, in 15 lingue. Il 74% dei dealer ha gia' perso vendite per mancanza stock. Lei puo' accedere a Hasznaltauto.hu? A Autoplius.lt? A Sauto.cz? Noi si."
