# Prompt Claude.ai — ARGOS scheduler design collaborativo (VOS has codebase access)

**Context flow**: tu (claude.ai web) avevi raccomandato Patchright per ARGOS. VOS
ha verificato empirico → scraper usa curl_cffi non Playwright, vero problema è
NO scheduler. Hai poi raccomandato 3 fix tecnici al mio prompt setup scheduler
(argparse check, launchctl print next-fire, volume calc).

**Asymmetry confessata**: io (VOS) ho codebase access live, tu no. Round precedenti
hanno generato raccomandazioni che ho dovuto rivedere su dati reali. Questo turno
ti passo TUTTI i dati codebase verificati, tu mi rispondi con:
(a) prompt finale paste-ready per CC ARGOS, OPPURE
(b) "stop, c'è problema strutturale X, chiedimi verifica Y/Z prima"

**Slot collaborazione esplicito**: se ti serve verifica codebase su qualunque
punto (contenuto file, schema DB, output comando, config), chiedi e te lo passo.
Niente assunzioni speculative.

---

## STATO EMPIRICO ARGOS verificato 2026-05-26

### Goal
Sbloccare `market_price_changes=0` (revenue gate €800 vincolo founder S173)
mediante scheduler periodico scraper esistente. ZERO change al codice scraper
in questo task (deferred a successivo). Solo orchestrazione.

### Stack scraper
- `tools/scrapers/autoscout_scraper.py` (58KB) — usa `curl_cffi impersonate
  chrome120` (HTTP TLS stealth, **NON Playwright**)
- `tools/scrapers/mobile_de_scraper.py` (47KB) — stesso pattern curl_cffi
- `tools/scrapers/base_scraper.py` — base class, chiama `upsert_listing` riga 419
- `tools/scrapers/quick_scrape.py` — entry point alternativo CLI che persiste
  (`upsert_listing` riga 89)
- `tools/scrapers/db.py:171 def upsert_listing` — funzione persistenza
- `tools/scrapers/config.py` → `PORTALS` dict + `TARGET_VEHICLES` + rate limits

### argparse REALE `autoscout_scraper.py` (riga 1456-1467)
```python
parser.add_argument("--make", default="BMW", help="Make (default: BMW)")
parser.add_argument("--model", default="Serie 3", help="Model (default: Serie 3)")
parser.add_argument("--country", default="DE", help="Country code (default: DE)")
parser.add_argument("--pages", type=int, default=2, help="Max pages (default: 2)")
parser.add_argument("--year-min", type=int, default=YEAR_MIN, ...)
parser.add_argument("--year-max", type=int, default=YEAR_MAX, ...)
parser.add_argument("--km-max", type=int, default=None, help="Max km (default: auto)")
parser.add_argument("--all-countries", action="store_true", help="Scrape all countries")
parser.add_argument("--url-only", action="store_true", help="Only print search URL, no scraping")
```
**NESSUN** `--test --portal --limit` come avevamo presunto round precedente.

### Contraddizione codebase su persistenza CLI
- Commento `autoscout_scraper.py` riga ~1481 (paraphrase): "CLI scrape() non lo
  fa, solo run_all"
- MA `upsert_listing` viene chiamato in `__main__` riga 1540
- E `run_all` **NON ESISTE** (grep `def run_all|run_all(` → 0 match)
- Quindi: commento stale OR `__main__` persiste effettivamente OR codice doppio.
  **Da verificare con scrape reale** (volume basso, country isolata, conta
  market_listings prima/dopo).

### Volume calcolo
- PORTALS verificati: `autoscout24_de`, `autoscout24_nl`, `autoscout24_be`,
  `autoscout24_at`, `autoscout24_fr`, `autoscout24_se`, `autoscout24_it`
  (visibili 3, totale stimato 7 — verifica disponibile)
- Per portale: `results_per_page=20`, `max_pages=10` → max 200 listing/run
- Rate limit per portale: 4-10s tra richieste + burst pause 30s ogni 5 pagine
- **`daily_request_cap=2000` per portale** (config esplicito)
- Dealers in DB: 18 (schema senza colonna country, da capire come filtrare per
  paese se rilevante)
- TARGET_VEHICLES: dinamico da MODEL_CATEGORIES (multi-make/model, count exact
  da verificare)

Volume teorico per 1 run completa multi-portale multi-make:
- 7 portali × 200 listing/run = 1400 hit/run, ma rate-limited a ~10s × pages =
  ~10min wallclock per portale, ~70min totale sequenziale
- 4 run/giorno staggered = 4 × 70min = ~5h occupazione MacBook/iMac/giorno
- Hit/giorno ~ 5600 (ben sotto daily_request_cap×portali = 14000)

### launchctl Big Sur 11.7.10 verificato live
- `launchctl print --help` → richiede `<domain-target>/<service-id>`
- Test su mio LaunchAgent VOS: `launchctl print gui/$(id -u)/com.luke.vos.task-fit-monitor`
- Output mostra: `state = waiting`, `runs = N`, `stdout/stderr path`, MA non
  mostra esplicitamente "next fire" timestamp in modo facilmente grep-able.
  Bisogna ispezionare manualmente o usare `launchctl list <label>` per
  `LastExitStatus`.
- Mio LaunchAgent task-fit-monitor: schedulato daily 08:00, deploy 2026-05-26
  sera → ancora `runs = 0` (corretto, prossimo fire domani 08:00)

### LaunchAgent VOS template esistente (riusabile)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.luke.vos.task-fit-monitor</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/opt/python@3.13/bin/python3</string>
        <string>/Users/macbook/venture-os/components/task-fit-monitor/monitor.py</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>8</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>RunAtLoad</key>
    <false/>
    <key>StandardOutPath</key>
    <string>/Users/macbook/venture-os/state/logs/task-fit-monitor.out</string>
    <key>StandardErrorPath</key>
    <string>/Users/macbook/venture-os/state/logs/task-fit-monitor.err</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
```

### ToS exposure (da risolvere PRIMA del deploy, audit deviation HIGH)
- Mobile.de + AutoScout24 sono target commerciali. Scraping sistematico
  schedulato = qualitativamente diverso da occasionale. ToS 2026 da reviewable.
- Mitigation tecnica nel codice già attiva: rate limit 4-10s, burst pause 30s,
  daily_cap 2000/portale.
- Mitigation business: scope dataset = solo aggregati statistici per
  micro-dealer commissione (no riproduzione integrale listings → no copyright
  exposure).

---

## Le tue 3 raccomandazioni precedenti (su cui devi pronunciarti definitivamente)

### R1 — Argparse check
Tuo punto: verificare che `--test --portal --country --limit` esistano prima
del prompt. **Confermato**: NON esistono. Reali sono `--make --model --country
--pages --all-countries --url-only`. Quindi STEP 1 del prompt va riscritto con
flag che ESISTONO + decisione su quale entry point usare (autoscout_scraper.py
diretto o quick_scrape.py).

### R2 — launchctl print "next fire"
Tuo punto: `launchctl start` testa invocation, non scheduling. Aggiungere
`launchctl print gui/$(id -u)/<label>` per verificare next fire schedulato.
**Confermato parzialmente**: il print Big Sur 11.7.10 NON mostra "next fire"
ovvio in output (testato live). Mostra `state = waiting + runs = N`.
Per validare scheduling reale: aspettare effettivamente il prossimo slot
(test E2E reale) o ispezione manuale del plist parsing da macOS.

### R3 — Volume calcolo pre-deploy
Tuo punto: 4×/giorno × portali × dealer × listing va quantificato vs ToS.
**Confermato**: 5600 hit/giorno stimati (sotto cap tecnico 14000, ma sopra
soglia "occasional manual run" precedente). Aggiungerei: ROI test 1 portale 1
make/model PRIMA del rollout multi-portale per misurare hit-rate reale (200
hit potenziali ≠ 200 actual se rate-limit + burst pause aggressive).

---

## Quello che ti chiedo

Genera prompt finale paste-ready per CC ARGOS che includa:

1. **STEP 0 — verifica pre-scheduler (5 min CC)**:
   - Risolvere contraddizione `__main__` autoscout_scraper.py persiste o no
   - Decidere entry point canonico: `autoscout_scraper.py` diretto vs
     `quick_scrape.py` vs nuovo wrapper
   - Output: 1 comando shell verificato che produce N inserts in
     market_listings reali

2. **STEP 1 — wrapper script**:
   - Path: `tools/scrapers/scheduled_run.sh`
   - Cosa fa: attiva venv (path da verificare), chiama entry point STEP 0 con
     parametri produzione (multi-portale staggered? o singolo run per slot?)
   - Logging: `logs/scheduler/run-YYYYMMDD-HHMM.log` + exit code
   - Idempotenza: lock file prevenire overlap se run precedente non finito

3. **STEP 2 — LaunchAgent plist**:
   - Riusa template VOS sopra, adatta paths
   - StartCalendarInterval: 4 slot/giorno staggered. **Tu decidi orari**
     considerando: macOS Big Sur sleep cycle, target portali in zone EU
     (peak vs off-peak), volume daily_cap 2000
   - RunAtLoad false (no scrape immediato all'avvio)

4. **STEP 3 — validation E2E**:
   - `plutil -lint` plist
   - `launchctl load` + check no errors
   - `launchctl print gui/$(id -u)/com.luke.argos.scraper` cosa cercare
     esattamente nell'output dato che Big Sur non mostra "next fire" obvious
   - Trigger manuale `launchctl start` (testa invocation)
   - Wait N minutes + verifica market_listings COUNT(*) aumentato + log
     scheduler scritto

5. **STEP 4 — health check VOS integration**:
   - Estensione task-fit-monitor: heartbeat scheduler ARGOS silente >12h →
     anomaly HIGH (consumer brief mattutino)
   - Path: `~/venture-os/components/task-fit-monitor/monitor.py` (CC modifica
     mio file). Pattern già implementato per task_context_logger
     heartbeat — replica.

6. **CONSTRAINT EXPLICIT**:
   - ToS Mobile.de + AutoScout24 versione 2026 (audit
     argos-tos-legal-exposure HIGH) → CC deve eseguire `WebFetch` su ToS URL
     attuali + flag conflitti PRIMA di abilitare LaunchAgent
   - Vincolo founder S173: scope dataset = solo aggregati per micro-dealer
     commissione, no riproduzione integrale (no salvataggio immagini, no
     listing-by-listing redistribution)
   - Vincolo Big Sur 11.7.10: nessuna lib che richiede macOS 12+
   - VOS task-fit-monitor è cwd venture-os, scope cross-progetto ok per
     monitoring ARGOS scheduler

7. **STOP condition**:
   - Se STEP 0 dimostra che CLI non persiste in market_listings → STOP, escalation
     Luke per refactor entry point (scope diverso, sessione separata)
   - Se ToS review (WebFetch) mostra divieto esplicito scraping → STOP,
     escalation Luke decisione legale
   - Se launch slot test non insert listings dopo 30 min → STOP, debug pre
     rollout produzione

---

## Output che voglio da te

- **Prompt finale** (paste-ready, sezioni numerate, max 200 righe)
- **Risk top 3** del design proposto
- **2-3 verifiche codebase ulteriori che vorresti** prima di pronunciarti
  (es. "voglio vedere contenuto db.py upsert_listing prima di confermare STEP
  0", "voglio output di `python -m tools.scrapers.quick_scrape --help`"). Te
  le passo immediatamente, non escalation.
- **Verdict singolo**: GO/REVISE/STOP. Se STOP, spiega blocker.

NON sintetizzare la mia diagnosi. Vai diretto al prompt + risk + verifiche
richieste + verdict.
