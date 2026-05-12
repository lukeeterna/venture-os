---
project: ARGOS
date: 2026-05-12
compiled_at: 2026-05-12T16:39:45Z
model: gemini-2.5-flash
source_files: 7
compiler: karpathy-compiler v2 (multi-pass capable)
---

## Stato attuale verificato

### Sanitizer Immagini
*   Il sanitizer Apple Vision Framework è operativo su MacBook Big Sur. (S163)
*   `src/cove/vision_ocr.py` è un nuovo detector drop-in che usa `Vision.framework` system (macOS 10.13+, zero install, zero AVX2). (S163)
*   `src/cove/image_sanitizer.py` v4 usa `_get_vision_ocr()` per il lazy-load del Vision Framework. (S163)
*   Il sanitizer include `dotenv` e `cv2 inpaint TELEA`. (S163)
*   Il sanitizer include un'opzione per il crop LaMa. (S163)
*   Il sanitizer è stato testato con successo su 23 immagini reali AS24 (3 listing, seller "Autohaus Isernhagen"), con 1 skip atteso per una promo-slide guard (JPEG <20% size originale). (S163)
*   L'output del sanitizer per le 23 immagini è in `/tmp/argos_s163_e2e/` con file JPG nel range 75K-261K. (S163)
*   La latenza di Vision OCR è di 1.6-2.0s/img su Intel MacBook. (S163)
*   Il `vision_ocr.py` top-level usa solo stdlib + typing, con `Vision/Quartz/Foundation` lazy-load dentro le funzioni. (S163)
*   `image_sanitizer.py` chiama `vision_ocr` via `_get_vision_ocr()` lazy, senza import `pyobjc` top-level. (S163)
*   `pyobjc` NON è in `requirements.txt`. (S163)
*   Nessun guard `sys.platform == "darwin"` è necessario per il sanitizer. (S163)
*   Il sanitizer è in grado di mascherare targhe e watermark. (S158)

### Pipeline E2E
*   La pipeline E2E è stata testata con successo su 6 modelli di auto (BMW Serie 3, BMW Serie 5, Mercedes Classe C, Classe E, GLC, GLE) su autoscout24.de. (S157)
*   Un run E2E ha processato 16 listing raw, 16 CoVe scored, 2 PROCEED, 6 immagini scaricate, e 1 PDF generato in 41.6s. (S157)
*   La pipeline E2E include Day 1 WA delivered, risposta dealer simulata, classificazione analyzer e Day 3 schedulato. (S164)
*   La pipeline E2E include la generazione di PDF enterprise con sanitizer attivo e delivery via WA. (S164)
*   La pipeline E2E include l'emissione di fatture TD17/18/19 (verifica solo, no invio reale). (S164)
*   La pipeline E2E include il flow IBAN con `send-iban` e `mark-paid` Cloudflare Worker, con conferma `wa_sent: true`. (S164)

### Generazione PDF
*   Il PDF generator produce PDF dealer-grade > 4MB cross-brand. (S158)
*   Il PDF generator incorpora 6 immagini full-res embedded. (S158)
*   Il `_download_image_to_temp` ora aggiorna l'URL delle thumbnail e prova l'URL upgradato con fallback originale. (S158)
*   Il filtro immagini da 30KB è invariato. (S158)
*   Il PDF generato per BMW Serie 3 ha una dimensione di 4,161,219 bytes (4.1MB) con immagini da 215-646 KB. (S158)
*   Il PDF generato per Mercedes GLC ha una dimensione di 4,761,092 bytes (4.7MB) con immagini da 393-954 KB. (S158)
*   Il PDF generato è visibile su macOS Preview. (S158)
*   Il PDF generator è cablato con TTF embedded subset. (S152a)
*   Il PDF generator usa `pdf-lib` e `fontkit`. (S152a)
*   Il PDF generator produce 4 pagine A4 (header+parts → oggetto+veicolo+fee → 6 clausole+FES consent → signature embed + bundle FES). (S152a)

### Scraper
*   Gli scraper per BMW Serie 3, BMW Serie 5, Mercedes Classe C, Classe E, GLC, GLE sono funzionanti su autoscout24.de. (S157)
*   Gli scraper producono 19-20 listing per modello con campi completi (price/km/seller_name). (S157)
*   Lo scraper per BMW X3 budget 40k ha trovato 17 listing, con 10 PROCEED. (S149c)
*   Gli scraper per BMW X3/X1/X5/X4 e Audi Q5/A4 sono funzionanti. (S143)

### Infrastruttura e Servizi
*   Il daemon WA `argos-wa-daemon` è connesso e operativo su iMac. (S156)
*   `tailscaled` standalone (Homebrew) è il path canonical per ARGOS scale, persistente cross-reboot via launchd. (S155-tris)
*   Il Funnel Tailscale è persistito e operativo. (S155-tris)
*   Il Worker Cloudflare può raggiungere il daemon WA tramite Tailscale Funnel. (S155-tris)
*   Il Worker Cloudflare `argos-proxy` è LIVE su `https://argos-proxy.gianlucanewtech.workers.dev`. (S154a)
*   Il Worker Cloudflare ha un rate-limit middleware per-IP (10/min sign, 30/min get) e globale (100/200), con body cap 100KB su sign e 429 con Retry-After header. (S154a)
*   Il Worker Cloudflare ha un bypass admin via `c.get('adminAuthed')`. (S154a)
*   Il Worker Cloudflare ha bindings DB+CONTRACTS verificati. (S154a)
*   Il Worker Cloudflare risponde `GET /health` con `{status:ok, version:1.0.0, environment:test}`. (S154a)
*   Il D1 `argos-contracts` è stato creato con UUID `75d63bc9-342f-46cf-b6d2-c0adf77c975e` nella regione EEUR. (S153)
*   Il CF Alert Monitor `argos-cf-monitor` è un servizio PM2 online su iMac, con heartbeat verde e primo poll 0 errori. (S153)
*   Il CF Alert Monitor usa `wa-intelligence/cf_alert_monitor.py` (200 LOC stdlib only). (S153)
*   Il CF Alert Monitor ha test verdi per IMAP login Gmail, `--once` test locale, Telegram delivery E2E e PM2 boot iMac. (S153)
*   L'iMac ha un IP statico `192.168.1.2`. (S153 unblock)
*   Il `CLOUDFLARE_API_TOKEN` ha scope D1, R2, Workers, Pages Edit. (S153 unblock)
*   Il Worker code è production-ready e typecheck pulito. (S152b)
*   La dashboard admin contracts è cablata (proxy a Worker via Bearer). (S152b)
*   I template Python sono sincroni con TS Worker. (S152b)
*   L'helper analyzer HITL ha guardrails. (S152b)
*   Il Worker `argos-proxy` è uno scaffold Hono+TS. (S152a)
*   Il Worker `argos-proxy` ha 7 endpoint (4 admin + 3 public). (S152a)
*   Il Worker `argos-proxy` include utility libs per `resend`, `telegram`, `wa-daemon`, `r2-signed-url`. (S152a)
*   Il Worker `argos-proxy` ha un middleware `admin-auth.ts` per Bearer constant-time compare. (S152a)
*   Il Worker `argos-proxy` ha implementazioni complete per `contract-create`, `contract-get`, `contract-sign`, `contracts-list`. (S152a)
*   Lo schema D1 include tabelle `contracts` (7-state CHECK, signature_token UNIQUE, FES columns, pdf_r2_key/sha256, payment_*) e `audit_log` append-only con 4 index. (S152a)
*   Il `landing/_redirects` è configurato per la rotta `/contract/<token>`. (S152a)
*   La pagina `landing/contract/index.html` usa Tailwind CDN e Google Fonts CDN. (S152a)
*   Il `landing/contract/sign.js` recupera il contratto, renderizza 10 preview di firme stilizzate, invia al sign endpoint e reindirizza alla pagina di ringraziamento. (S152a)
*   La pagina `landing/contract/thank-you.html` è una conferma post-firma. (S152a)
*   Il `wrangler.toml` ha regole glob TTF da `assets/fonts/*.ttf` a `**/*.ttf`. (S154a)
*   Il `ARGOS_PROXY_URL` è salvato in `.env`. (S154a)
*   Il `wa-daemon.js` è stato aggiornato con 3 patch per loggare tutti gli ack, catturare `sentMsg.id._serialized` come `wa_msg_id` reale e controllare `client.getState()` pre-send. (S149)
*   L'IP hardcoded `192.168.1.12` è stato corretto a `192.168.1.2` nel Telegram alert per QR. (S149)
*   Il `wa-daemon.js` aggiornato è committato nel repo. (S149)
*   Il `better-sqlite3` è ricompilato per Node 20. (S146)
*   Il repo è allineato con commit `871fab7` (IP) e `91321b6` (CLAUDE.md lean refactor + fix startup check). (S146)
*   Il `CLAUDE.md` è ridotto a 51 righe. (S146)
*   Cloudflare Pages `argos-automotive` è deployata e serve correttamente le 16 foto Imagen. (S144)
*   Il DB live path è `/Users/gianlucadistasi/Documents/app-antigravity-auto/dealer_network.sqlite`. (S145)
*   La tabella `conversations` è usata per i dealer. (S145)
*   Il profilo LinkedIn di Luca Ferretti è stato completato con banner personale, post fissato con foto e hashtag, e About targeted-Sud. (S147)

### Contenuti e Materiali
*   `LINKEDIN_ABOUT.md` (220 parole, hook 15.4% frode km) è stato creato. (S142)
*   `LINKEDIN_POST_FISSATO.md` (post fissato ~400 parole + hashtag) è stato creato. (S142)
*   `DAY1_STILE_CAR.md` (WA Day 1 RELAZIONALE + 5 risposte pronte) è stato creato. (S142)
*   `SITO_SEZIONI.html` (3 sezioni drop-in: Chi siamo / Come funziona / Comparison) è stato creato. (S142)
*   `PLAYBOOK_30MIN.md` (step-by-step Gmail → LinkedIn → GBP → sito + pre-warming) è stato creato. (S142)
*   `GBP_DESCRIPTION.md` (descrizione Google Business 720 char) è stato creato. (S142)
*   Esistono 16 foto Imagen-4 Ultra in `assets/luca_ferretti/` con volto coerente. (S143)
*   Le 16 foto Imagen `assets/luca_ferretti/*.jpg` sono state copiate in `landing/assets/luca_ferretti/`. (S143)
*   `PLAYBOOK_30MIN.md` è stato aggiornato con LinkedIn profile = `luca_portrait_formal.jpg` e banner = `luca_munich_street.jpg`. (S143)
*   `SITO_SEZIONI.html` Chi siamo è stato aggiornato (foto rimossa). (S143)
*   `.claude/NORTH_STAR.md` v1 è stato creato. (S143)
*   Il dossier PDF `dossiers/ARGOS_BMW_X3_2022_Stile_Car_20260427_112932.pdf` è stato generato per Stile Car. (S144)
*   Il `DAY1_STILE_CAR.md` è stato riscritto con dati reali e ricalibrato per archetipo NARCISO. (S144)
*   Il `fee_calculator.py` calcola `dealer_margin_est` come % fissa del prezzo veicolo (12% per €30-50k). (S144)
*   Il `response-analyzer.py` ha un helper `create_contract_for_interest(...)` che fa HTTP POST a `argos-proxy/contract/create` con guardrail confidence>=0.85 e config check. (S152b)
*   La dashboard `wa-intelligence/dashboard/app.py` ha una rotta `/contracts` e proxy `send-iban/mark-paid`. (S152b)
*   La dashboard `wa-intelligence/dashboard/templates/contracts.html` ha una tabella con status badges, bottoni condizionali e modal mark-paid. (S152b)
*   La dashboard `wa-intelligence/dashboard/templates/base.html` ha una voce sidebar "Contratti". (S152b)
*   I template `wa-intelligence/templates.py` includono `DAY_INTEREST`, `IBAN_SEND`, `PAYMENT_RECEIVED`. (S152b)

### Stato Dealer
*   Ci sono 3 dealer COLD nel DB: Stile Car FG (NARCISO 8.5), Sa.My. Auto CS (TECNICO 8.0), Car Plus AV (RAGIONIERE 7.8). (S144)
*   Stile Car è da considerare ancora mai contattato. (S147)

## Decisioni chiuse
*   Il sanitizer Apple Vision Framework è operativo su MacBook Big Sur, sostituendo PaddleOCR. (S163)
*   `src/cove/vision_ocr.py` è il nuovo detector drop-in, con lazy import di `pyobjc-framework-Vision` e `pyobjc-framework-Quartz`. (S163)
*   `src/cove/image_sanitizer.py` v4 usa `_get_vision_ocr()` per lazy-load, mantenendo dotenv e cv2 inpaint TELEA. (S163)
*   Il codice `vision_ocr.py` e `image_sanitizer.py` è stato verificato per non avere import top-level di `pyobjc` e `pyobjc` non è in `requirements.txt` per compatibilità CI Linux. (S163)
*   La catena di fallimenti S159-S162 è stata chiusa strutturalmente, abbandonando l'assunzione che uno stack ML pesante fosse l'unico percorso per l'OCR. (S163)
*   Il workaround per il bug di `pm2 startup launchd` su macOS è il percorso canonico: installazione a livello utente e spostamento a livello di sistema con `sudo mv`. (S156)
*   È stato scelto un Daemon a livello di sistema per la persistenza di PM2, evitando l'auto-login GUI dell'iMac per non degradare la sicurezza fisica. (S156)
*   La GUI di Tailscale.app rimane installata come fallback di emergenza, ma `tailscaled` standalone Homebrew è il percorso canonico per la scalabilità di ARGOS, persistente tra i riavvii tramite launchd. (S155-tris)
*   Il formato del numero di telefono viene normalizzato in `argos-proxy/src/lib/wa-daemon.ts` con `phone.replace(/\D/g, '')` prima del controllo regex. (S154-ter)
*   Il Cloudflare Worker `argos-proxy` è LIVE su `https://argos-proxy.gianlucanewtech.workers.dev`. (S154a)
*   Il backup dei codici Google è stato spostato nel Portachiavi di macOS e il file originale cancellato con `rm -P`. (S154a)
*   Sono stati abilitati 3 alert R2 su Cloudflare Dashboard per "R2 Storage 80%", "R2 Write Ops 80%", "R2 Read Ops 80%". (S154a)
*   È stato implementato un middleware di rate-limit per-IP e globale nel Worker. (S154a)
*   È stato creato il bucket R2 `argos-contracts` con storage standard. (S154a)
*   È stata eseguita la migrazione D1 con `0001_init.sql`, creando le tabelle `contracts` e `audit_log`. (S154a)
*   Sono stati caricati 8 secret nel Worker. (S154a)
*   Il `wrangler.toml` è stato corretto per le regole glob TTF. (S154a)
*   Il D1 `argos-contracts` è stato creato con UUID `75d63bc9-342f-46cf-b6d2-c0adf77c975e` e regione EEUR. (S153)
*   Il CF Alert Monitor `argos-cf-monitor` è stato costruito e deployato sull'iMac come servizio PM2. (S153)
*   L'IP dell'iMac è stato aggiornato da `192.168.1.12` a `192.168.1.2` in 8 file operativi critici. (S153 unblock)
*   Il token Cloudflare API è stato aggiornato con gli scope D1, Workers R2 Storage, Workers Scripts e Cloudflare Pages. (S153 unblock)
*   Il pagamento avviene tramite bonifico bancario manuale su IBAN MyTu/evolu, senza Stripe. (S151)
*   La riconciliazione dei pagamenti è manuale tramite la dashboard admin "Mark PAID". (S151)
*   La firma elettronica è FES eIDAS art.3 con bundle di evidenze completo. (S151)
*   Lo storage utilizza D1 per le relazioni SQL e R2 con URL firmati TTL 7gg. (S151)
*   La P.IVA è stata rimossa come blocker e verrà riaperta solo quando il primo dealer reale pagherà. (S151)
*   Il Day 1 reale è stato rimosso come data fissa e partirà solo dopo la simulazione S153 verde e la conferma visiva di Luke. (S151)
*   Il daemon WA è stato fixato e committato nel repo, con 3 patch attive per il tracking degli ack e il controllo dello stato. (S149)
*   L'IP hardcoded `192.168.1.12` è stato corretto a `192.168.1.2` nel Telegram alert per QR. (S149)
*   Il bug `templates.py:58 SyntaxError EOL` sull'iMac è stato fixato. (S149b)
*   Le 16 foto Imagen-4 Ultra in `assets/luca_ferretti/*.jpg` sono state copiate in `landing/assets/luca_ferretti/` per risolvere il bug delle foto rotte sul deploy Cloudflare. (S143)
*   Il profilo LinkedIn di Luca Ferretti utilizza `luca_portrait_formal.jpg` e il banner `luca_munich_street.jpg`, entrambi Imagen e coerenti con il sito. (S143)
*   Il file `SITO_SEZIONI.html` è stato aggiornato rimuovendo la foto dalla sezione "Chi siamo". (S143)
*   Il progetto Cloudflare `argos-automotive` è stato deployato tramite CLI con `wrangler pages deploy landing/ --project-name argos-automotive --branch main --commit-dirty=true`. (S144)
*   Il DB live path è `/Users/gianlucadistasi/Documents/app-antigravity-auto/dealer_network.sqlite` e la tabella è `conversations`. (S145)

## Blocker aperti

*   **Day 1 reale bloccato da E2E su TEST_FOUNDER (S163)**: NESSUN Day 1 dealer reale (Stile Car o altri) finché pipeline COMPLETA non gira verde end-to-end su TEST_FOUNDER `393314928901` coprendo 4 step: Contatto, Dossier, Fattura, IBAN flow. UAT visivo sanitizer da solo NON sblocca.
*   **Fattura TD17/18/19 (S164)**: Se il tool per la fatturazione TD17/18/19 non esiste, è un gap critico che blocca il Day 1 reale.
*   **Day 1 reale Stile Car (S163)**: Gated dietro S164 VERDE su 4 step E2E TEST_FOUNDER. UAT visivo Luke su `/tmp/argos_s163_e2e/` resta gate parallelo indipendente.
*   **Filtrare slide marketing AS24 (S163)**: Filtrare slide marketing AS24 (Premium Selection/Garantie/Wartungsfreiheit/Inzahlungnahme/Finanzierung) upstream a scraping time prima del DB insert (S163.1 guard è safety net reattivo).
*   **Sovradimensionamento image_sanitizer (S163)**: `cv2 inpaint TELEA + LaMa` opzionale ancora presenti. Se UAT mostra TELEA basta su 100% casi → defer LaMa rimozione (sprint dedicato, no scope creep ora).
*   **PDF generator MacBook locale rotto senza PaddleOCR (S149c)**: Il PDF generator locale è rotto senza PaddleOCR (5KB/0 immagini).
*   **Gemini MAX_TOKENS strutturale (S149c)**: `gemini-2.5-flash` thinking model + `maxOutputTokens=800` troppo basso. Cascade fallback Groq llama-3.3-70b operativo.
*   **Reply LLM Day N+ qualità sotto-Cormorant (S149c)**: Gate obbligatorio S150 step -1: Telegram HOLD su tutti gli intent diversi da NEGATIVE.
*   **IP `.12` hardcoded (S149c)**: IP `192.168.1.12` hardcoded ovunque (DHCP regress S147).
*   **test_9 dataset (S149c)**: test_9 Day 1 contiene "Germania"/"premium" (solo TEST_FOUNDER, non dealer reali — ma da sostituire).
*   **hood reflection warning (S149c)**: Non specificato.
*   **SessionStart hook stale (S149c)**: Non specificato.
*   **Dashboard 8080 NON in pm2 dump.pm2 (S146)**: Non bloccante per Day 1, indagare in S147+.
*   **Google Business Profile (S145)**: Verifica postale 5-14gg in transito.
*   **LinkedIn popolato (S145)**: Il profilo è creato ma serve check che foto + About + post fissato + headline siano coerenti con `LINKEDIN_ABOUT.md` e `LINKEDIN_POST_FISSATO.md`. Se vuoto → chiedere a Luke screenshot o pubblicare i contenuti via materiali.
*   **Scraper X4 ADAC lowball (S144)**: Su BMW X4 budget €32k: 0 PROCEED su 3 listing (54 grezzi NL+DE). ADAC ritorna €15-17k per X4 2018-2019 (n=0 listing IT). Il MarketVerifier non ha index IT per X4 → cade su ADAC katalog_depreciation che è troppo basso. CoVe scarta tutto come SKIP. Non è un bug del scraper, è gap del Market Price Index per X4.
*   **Scraper 404 su Mercedes + BMW sedan (S142)**: Scraper non funziona ancora per Mercedes + BMW sedan.

## Prossimi passi

*   leggi prompts/s164_e2e_full_test_founder.md ed esegui (S163)
