# PROMPT S69 — PORTARE I RESTANTI 51 PORTALI A E2E

## CONTESTO S68
- **22/73 portali E2E** funzionanti con listing reali (488 listing con BMW X3 1 pagina)
- Parser generico ha 7 layer di parsing (urqlState, dehydratedState, __NEXT_DATA__, JSON-LD, regex, aggressive)
- **51 portali** ancora broken — categorizzati per tipo di problema

## LEGGERE PRIMA DI TUTTO
```
tools/scrapers/generic_scraper.py          ← GenericClassifiedScraper (7 layer)
tools/scrapers/portal_profiles.py          ← SearchProfile per ogni portale
tools/scrapers/resilient_fetcher.py        ← ResilientFetcher multi-backend
tools/scrapers/config.py                   ← 73 PortalConfig
tools/scrapers/market_intelligence.py      ← Orchestratore + get_scraper() factory
memory/project_s68_scraper_e2e_expansion.md ← DETTAGLIO fix S68 e diagnostica
```

## VERIFICA INIZIALE
Prima di tutto, runnare il test E2E di tutti i portali per verificare lo stato corrente:
```python
python3 -c "
import sys, logging; sys.path.insert(0, '.'); logging.basicConfig(level=logging.ERROR)
from tools.scrapers.market_intelligence import get_scraper
from tools.scrapers.config import PORTALS
results = []
for pk in sorted(PORTALS.keys()):
    s = get_scraper(pk)
    if not s: results.append((pk, 0, 'NO_SCRAPER')); continue
    try:
        listings, run = s.scrape('BMW', 'X3', max_pages=1)
        results.append((pk, len(listings), 'OK' if listings else 'EMPTY'))
    except Exception as e:
        results.append((pk, 0, f'ERROR'))
working = [r for r in results if r[1] > 0]
broken = [r for r in results if r[1] == 0]
print(f'WORKING: {len(working)}/{len(results)}')
for pk, count, status in sorted(working, key=lambda x: -x[1]):
    print(f'  + {pk}: {count}')
print(f'BROKEN: {len(broken)}/{len(results)}')
for pk, count, status in sorted(broken):
    print(f'  - {pk}: {status}')
"
```

## PRIORITA' 1: URL FIX RAPIDI (portali con HTML ma parsing 0)

Questi portali restituiscono HTML ma il parser non trova listing. Fix tipico: URL template sbagliato.

**Metodo per ognuno:**
1. Web search per trovare la URL di ricerca corretta del portale
2. Fetch la pagina con `ResilientFetcher`
3. Analizzare HTML: ha __NEXT_DATA__? JSON-LD? dehydratedState? Quale struttura?
4. Aggiornare `SearchProfile` in `portal_profiles.py`
5. Test: `scraper.scrape("BMW", "X3", max_pages=1)` → listing > 0?

### TIER 1 — Alto valore business:
- [ ] `auto_de` — DE, 200K+ annunci. URL `/suche/bmw/x3` o diverso?
- [ ] `pkw_de` — DE, 150K+. URL `/suche?marke=Bmw&modell=X3` o diverso?
- [ ] `mobile_de` — DE, il piu' grande. Scraper dedicato esiste ma non testato S68
- [ ] `leboncoin_fr` — FR, 500K+. **JS SPA** — serve API endpoint o Selenium
- [ ] `lacentrale_fr` — FR. URL confermata corretta ma anti-bot aggressivo

### TIER 2 — Mercati secondari:
- [ ] `sauto_cz` — CZ. Cookie consent wall (20K bytes, 0 listing)
- [ ] `bazos_cz` — CZ. URL probabilmente sbagliato (0 bytes)
- [ ] `auto24_ee` — EE. HTML 440K bytes con 5 EUR prices ma parsing fallisce
- [ ] `autoplius_lt` — LT. HTML 218K bytes con link `/skelbimai/` ma prezzi non visibili
- [ ] `mobile_bg` — BG. HTML 170K bytes ma encoding rotto (Cyrillic non decodificato)
- [ ] `olx_ro` — RO. 3.5M HTML, `__PRERENDERED_STATE__` double-encoded JSON

### TIER 3 — Nicchia (massimo valore ARGOS):
- [ ] `avtonet_si` — SI. HTML 26K bytes ma 0 prices (struttura sconosciuta)
- [ ] `bolha_si` — SI. 0 bytes — bloccato o URL sbagliato
- [ ] `autobazar_sk` — SK. 0 bytes — URL sbagliato
- [ ] `car_gr` — GR. URL fixato S68 ma SPA (contenuto caricato client-side)
- [ ] `xe_gr` — GR. URL probabilmente sbagliato
- [ ] `nettiauto_fi` — FI. HTML ricevuto ma Brotli encoding non decodificato
- [ ] `njuskalo_hr` — HR. Funziona ma rate-limited (aspettare cooldown)
- [ ] `cars_bg` — BG. 0 bytes

## PRIORITA' 2: PARSER PER OLX __PRERENDERED_STATE__

`olx_pl` e `olx_ro` usano `window.__PRERENDERED_STATE__` (JSON double-encoded).
Struttura: `listing.listing.ads[]` — array di ad objects ricchissimi.
Implementare parser dedicato in `generic_scraper.py`:
1. Cercare `window.__PRERENDERED_STATE__` nel HTML
2. Decode: `json.loads(json.loads(raw))` (double-encoded)
3. Estrarre `listing.listing.ads[]`
4. Ogni ad ha: `id`, `title`, `price.regularPrice.value`, `url`, `photos[]`, ecc.

## PRIORITA' 3: B2B ASTE (login required)

Questi portali richiedono registrazione/login business:
- `openlane_eu`, `bca_eu`, `autorola_eu`, `manheim_express_eu`
- `caronsale_de`, `autobid_de`, `ecarstrade_eu`, `autoproff_eu`
- `kvdcars_se`, `vpauto_fr`, `alcopa_fr`, `vwe_nl`
- `ayvens_carmarket`, `arval_motortrade`, `athlon_carplaza`, `exleasingcar_eu`

**Approccio:**
1. Verificare quali hanno API pubblica (eCarsTrade ha API documentata)
2. Per quelli con login: creare account test ARGOS
3. Salvare sessione in cookie jar persistente
4. Eventuale Selenium con login automatico

## PRIORITA' 4: PORTALI PREMIUM (test con veicoli adatti)

BMW X3 non e' il veicolo giusto per portali premium/classic:
- `elferspot_eu` — testare con **Porsche 911**
- `jamesedition_eu` — testare con **Ferrari Roma** o **Lamborghini Urus**
- `collecting_cars_eu` — testare con **Porsche 911**
- `classic_driver_eu` — testare con **Porsche 911** o **Mercedes AMG GT**
- `bat_eu` — testare con **Porsche 911**

## PRIORITA' 5: DEPLOY SU iMAC

Quando >= 35 portali funzionanti:
1. `scp -r tools/scrapers/ gianlucadistasi@192.168.1.2:~/Documents/combaretrovamiauto-enterprise/tools/scrapers/`
2. Installa dipendenze su iMac: `pip3 install cloudscraper selenium`
3. PM2 schedule: `0 5 * * 1-5` (05:00 lun-ven)
4. Telegram digest automatico post-scraping
5. Primo run completo con TUTTI i veicoli target

## RESEARCH AGENT (da S68)

Risultati ricerca URL corretti per 8 portali (file: `memory/project_s68_scraper_e2e_expansion.md`):
- **Marktplaats**: URL fix gia' applicato S68 (OK)
- **Finn.no**: `make=0.744` (numeric ID) — model ID mancante, filtrare in-memory
- **Blocket.se**: Params `cg_m`/`cg_x` non verificati ma funziona senza (OK via JSON-LD)
- **LaCentrale**: URL confermata ma anti-bot serve fake data ai bot
- **Car.gr**: URL fixata `/used-cars/bmw/x3.html` ma SPA (serve Selenium)
- **Nettiauto**: Path `/{make}/{model}` corretto ma encoding Brotli
- **Njuskalo**: URL fixata, funziona ma rate-limited
- **AutoTrack**: URL fixata `/aanbod/` (OK)

## APPROCCIO TECNICO

**Per ogni portale broken:**
1. `python3 -c "from tools.scrapers.resilient_fetcher import ResilientFetcher; f = ResilientFetcher(); html = f.fetch('URL'); print(len(html))"`
2. Se 0 bytes: URL sbagliato o bloccato → web search per URL corretto
3. Se HTML presente: analizzare struttura (__NEXT_DATA__? JSON-LD? dehydratedState?)
4. Se SPA (no data in HTML): serve Selenium o API endpoint
5. Se cookie/consent wall: aggiungere accept-cookie header o redirect handling

**NON fixare tutti con lo stesso approccio — ogni portale e' diverso.**

## REGOLE IMMUTABILI
- MAI toccare cove_engine_v4.py
- MAI credenziali hardcoded → solo .env
- Scraper PERSISTENTI — MAI CSS selectors, SOLO dati strutturati
- TUTTI i portali, TUTTE le aste, TUTTE le fonti — copertura TOTALE
- Se un portale e' bloccato, TROVARE un modo — "tutto si puo' fare"
- Multi-backend anti-bot SEMPRE: curl_cffi → cloudscraper → Selenium
- Cache backend persistente per dominio
- Test E2E: `BMW X3` deve restituire listing su OGNI portale

## TARGET S69
**Portare almeno 35/73 portali a E2E** (da 22 a 35 = +13 portali nuovi).
Focus su: TIER 1-2 classifieds + OLX parser + almeno 2 portali premium.
