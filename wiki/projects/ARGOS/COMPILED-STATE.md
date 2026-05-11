---
project: ARGOS
date: 2026-05-11
compiled_at: 2026-05-11T17:38:11Z
model: gemini-2.5-flash
source_files: 98
compiler: karpathy-compiler v2 (multi-pass capable)
---

## Stato attuale verificato

*   **Core Value & Focus**: Il progetto ARGOS mira a fornire ai dealer dossier con dati verificati e pronti per la rivendita, con un focus attuale sulla fase 04 "primo-outreach-stile-car" (S27).
*   **Milestone**: Il progetto è alla milestone v1.0, con 4 di 5 fasi completate e 14 di 17 piani completati (S27).
*   **Stato Esecutivo**: Il progetto è "Ready to execute" (S27).
*   **Obiettivo Dossier**: Il dealer riceve un dossier con dati che non trova da nessun'altra parte — verificati, reali, e pronti per la rivendita (S27).
*   **Dati Dossier**: Il dossier contiene solo dati verificati; nessun numero inventato (S27).
*   **Grading Veicoli**: ARGOS GRADE utilizza un sistema A-E (non numerico), adattato dagli standard BCA/NAAA (S27).
*   **Primo Dealer Target**: Stile Car (Domenico, NARCISO) è il primo dealer target, in quanto già importa dall'UE ed è il più ricettivo (S27).
*   **Test Listing Primario**: Il listing autoscout24_de_b0d65f095510 (Stile Car BMW X3 2022) è sempre il primo in `test_vins.json` (S27).
*   **API VIN/Recall**:
    *   NHTSA vpic API è una REST API gratuita e viene utilizzata per l'arricchimento del dossier (recall lookup per make/model/year) (S27).
    *   RDW API è una REST API gratuita e viene utilizzata per lo stato dei recall dei veicoli olandesi (plate-based, `openstaande_terugroepactie_indicator`) (S27).
    *   KBA RRDB è integrato e permette la ricerca di recall per make/model/year tramite risoluzione di PoW altcha in Python (S27).
*   **API VIN/Recall (non integrate/rifiutate)**:
    *   `freevindecoder /api` restituisce 404; il flusso reale è POST a `/search` con CSRF token e restituisce solo informazioni sul produttore (S27).
    *   DAT consumer portal richiede Playwright (JS-rendered React wizard), l'integrazione è rimandata alla fase di automazione browser (S27).
    *   `car-recalls.eu` è stato rifiutato (WordPress blog, non API VIN) (S27).
    *   BMW warranty è stato rifiutato (richiede login, nessun endpoint pubblico trovato) (S27).
*   **Calcolo ARGOS GRADE**: L'ARGOS GRADE legge direttamente da `cove_results` (non da `cove_engine_v4`) (S27).
*   **Storia KM**: La storia dei km è impostata staticamente a 0.5 con un peso del 5%, poiché non è stata confermata alcuna API gratuita per l'odometro in Germania (S27).
*   **Garanzia**: La garanzia è hardcoded come "richiedere al venditore" (tutte le API OEM richiedono login) (S27).
*   **Costo Trasporto**: Il costo di trasporto è fisso a EUR 1200 (DE→Sud Italia bisarca) per garantire coerenza nel dossier (S27).
*   **Generazione Scheda Veicolo**: `generate_vehicle_sheet` è preservato per compatibilità retroattiva, con le funzionalità V2 iniettate tramite il parametro `grade_data` (S27).
*   **Scraper**:
    *   Gli scraper per BMW X3, X1, X5, X4 e Audi Q5, A4 funzionano (S142).
    *   Gli scraper per BMW Serie 3, Serie 5, Mercedes Classe C, Classe E, GLC, GLE funzionano (S157).
    *   La pipeline E2E completa (raw → CoVe → PROCEED → immagini → PDF) funziona in 41.6s per 1 PDF (S157).
    *   Il `seller_name` e `seller_city` vengono estratti correttamente dai listing di AutoScout24.it (S131).
*   **PDF Generation**:
    *   Il PDF generator produce dossier di dimensioni adeguate (4.1MB per BMW, 4.7MB per Mercedes) con 6 immagini full-res embedded (S158).
    *   Il `pdf_generator_enterprise.py` è stato corretto per aggiornare l'URL delle thumbnail e includere immagini di dimensioni maggiori (S158).
*   **Image Sanitizer**:
    *   Il sanitizer è stato configurato per funzionare su iMac (macOS 12.7.4) tramite SSH, con rsync delle immagini raw e dei risultati (S160).
    *   Il `_find_sanitizer_python()` in `tools/scripts/pdf_generator_enterprise.py` testa `import paddleocr` prima di accettare un candidato venv, garantendo un fallback sicuro se il venv è rotto (S159).
    *   Il sanitizer è operativo e rimuove testo dealer, watermark e targhe dalle foto (S160).
*   **Infrastruttura iMac**:
    *   L'iMac è online e raggiungibile all'IP `192.168.1.2` (S153).
    *   Il daemon WA è connesso e operativo sulla porta `9191` (S153).
    *   `tailscaled` open-source standalone è installato e configurato come daemon `launchd` per la persistenza cross-reboot (S155-tris).
    *   Il funnel Tailscale è attivo e persistente, esponendo il daemon WA tramite `https://imac-di-gianluca.tail62c468.ts.net` (S155-tris).
    *   Il Worker Cloudflare può raggiungere il daemon WA tramite l'URL pubblico di Tailscale Funnel (S155-tris).
    *   Il `pm2 startup launchd` è configurato per la persistenza dei processi PM2 (argos-wa-daemon, argos-cf-monitor) cross-reboot (S156).
    *   Il `pm2 resurrect` è stato utilizzato per recuperare i daemon PM2 dopo un reboot (S147).
    *   Il `argos-cf-monitor` è un servizio PM2 online che fornisce monitoring di base (S153).
*   **Daemon WA**:
    *   Il daemon WA è stato fixato per tracciare correttamente gli ack di delivery (SENT_SERVER, DELIVERED, LETTO) e per verificare lo stato della sessione prima dell'invio (S149).
    *   Il `wa-daemon.js` è stato aggiornato con 3 patch per loggare tutti gli ack, catturare il `wa_msg_id` reale e controllare lo stato `CONNECTED` prima dell'invio (S149).
    *   Il formato LID (WhatsApp ID interno) è `*@lid` (S149).
    *   Il `phone` viene normalizzato (rimozione di `+` e non-cifre) in `argos-proxy/src/lib/wa-daemon.ts` prima della validazione e dell'invio al daemon (S154-ter).
*   **Cloudflare Workers (argos-proxy)**:
    *   Il Worker `argos-proxy` è deployato su `https://argos-proxy.gianlucanewtech.workers.dev` (S154a).
    *   Il rate-limit middleware è deployato e funziona, con limiti per-IP (10 req/min sign, 30 req/min get) e globale, e restituisce 429 con header `Retry-After` (S154-ter).
    *   Il Worker gestisce la creazione, firma, invio IBAN e marcatura come pagato dei contratti (S152b).
    *   Il Worker è configurato con 8 secrets (ARGOS_ADMIN_SECRET, R2_SIGNING_SECRET, ARGOS_IBAN, ARGOS_INTESTATARIO, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, WA_DAEMON_API_KEY, WA_DAEMON_URL) (S154a).
    *   Il `wrangler.toml` è stato corretto per le regole glob TTF (S154a).
*   **Database (D1 & R2)**:
    *   Il D1 `argos-contracts` è stato creato e migrato con lo schema `0001_init.sql` (tabelle `contracts` e `audit_log`) (S154a).
    *   Il bucket R2 `argos-contracts` è stato creato (S154a).
    *   Gli alert R2 (Storage 80%, Class A 800k, Class B 8M) sono abilitati con email `ferretti.argosautomotive@gmail.com` (S154a).
    *   Il D1 `audit_log` registra le azioni CREATE, SIGN, SEND_IBAN, MARK_PAID con timestamp e attore (S154-ter).
*   **Frontend (Cloudflare Pages)**:
    *   Il frontend è deployabile su CF Pages (statico, senza build) (S152a).
    *   La pagina di firma del contratto (`landing/contract/index.html`) è completa con 10 firme stilizzate (Google Fonts TTF embedded) e checkbox di consenso FES (S152a).
    *   La pagina di ringraziamento (`landing/contract/thank-you.html`) è completa con il flusso di bonifico esplicito (S152a).
    *   Le 16 foto Imagen-4 Ultra sono state copiate in `landing/assets/luca_ferretti/` e sono servite correttamente (S143).
*   **Workflow Contratto & Pagamento**:
    *   Il modello di pagamento è il bonifico bancario manuale (S151).
    *   Gli endpoint `send-iban` e `mark-paid` sono implementati nel Worker (S152b).
    *   La riconciliazione è manuale tramite la dashboard admin (S151).
    *   Il `ARGOS_IBAN` e `ARGOS_INTESTATARIO` sono configurati come secret (S152a).
    *   I template WA `IBAN_SEND` e `PAYMENT_RECEIVED` sono implementati (S152b).
*   **Dashboard Admin**:
    *   La dashboard admin (`wa-intelligence/dashboard/app.py`) ha una rotta `/contracts` che mostra i contratti e permette le azioni `send-iban` e `mark-paid` (S152b).
*   **LLM & Analisi Risposte**:
    *   La cascade LLM (GOOGLE_AI/GROQ/OPENROUTER) è operativa, con fallback a Groq in caso di problemi con Gemini (S149c).
    *   Il `response-analyzer.py` è stato corretto per gestire correttamente i template (S149b).
    *   Il `response-analyzer.py` include un helper `create_contract_for_interest` che può essere triggerato manualmente dopo approvazione Telegram per creare un contratto (S152b).
    *   I template `DAY_INTEREST`, `IBAN_SEND`, `PAYMENT_RECEIVED` sono stati aggiunti a `wa-intelligence/templates.py` (S152b).
*   **Outreach & Credibilità**:
    *   Il profilo LinkedIn di Luca Ferretti è live e popolato (S95).
    *   Il Google Business Profile è stato attivato (S145).
    *   La pagina Facebook è stata creata con 3-5 post (S95).
    *   Il sito `argos-automotive.pages.dev` è deployato e serve correttamente le immagini (S145).
    *   Il Day 1 messaggio per Stile Car è pronto e calibrato per l'archetipo RELAZIONALE (S145).
    *   Il Day 1 messaggio segue il framework V3 (CHI-PERCHE'-CHIEDI) (S95).
    *   Il sistema di pre-warming LinkedIn è stato definito (follow, like, commenti non-pitch) (S145).
*   **Test E2E**:
    *   La pipeline E2E completa (create→sign→awaiting→iban_sent→paid) è stata verificata con successo su TEST_FOUNDER (S155-tris).
    *   Luke ha confermato la ricezione di 2 messaggi WhatsApp (IBAN_SEND e PAYMENT_RECEIVED) su TEST_FOUNDER (S155-tris).
    *   Il `test_e2e_full.py` è stato eseguito con successo (S149c).
*   **Sicurezza & Compliance**:
    *   I backup codes di Google sono stati salvati nel Keychain di macOS (S154a).
    *   Il token Telegram è stato verificato attivo (S153).
    *   Il `CLOUDFLARE_API_TOKEN` è attivo e ha gli scope necessari (D1, R2, Workers, Pages) (S153).
    *   La password sudo dell'iMac è stata cambiata (S156).
    *   Il `feedback_no_live_without_test.md` è una regola non derogabile (S155-tris).
    *   Il `feedback_context_budget_gate.md` è una regola per la chiusura forzata delle sessioni (S159).
*   **Dealer Network**:
    *   5 dealer COLD sono profilati e pronti per l'outreach: Stile Car FG (RELAZIONALE 8.5), Autoline AV (RAGIONIERE 8.0), GP Cars TA (NARCISO 8.0), Car Plus AV (RAGIONIERE 7.5), Sa.My. Auto CS (TECNICO 7.0) (S145).
    *   Enzo Car ha risposto "Nulla" il 15/04 (S147).

## Decisioni chiuse
*   Il dominio `argosautomotive.eu` è stato registrato e le email `info@` e `luca@` sono state configurate con Zoho Mail. (S100)
*   La landing page è stata riscritta con la narrativa "Dall'Europa all'Italia" e deployata su Cloudflare Pages. (S100)
*   Sono state generate 15 immagini AI di Luca Ferretti con consistenza facciale e contesti specifici, e i metadata AI sono stati rimossi. (S100)
*   È stato creato un calcolatore di margine per l'importazione EU (Google Sheet) e 4 PDF formativi ("5 Obiezioni", "Import EU in 6 Step", "Come Leggere un Annuncio Tedesco"). (S100)
*   È stato creato un database di oltre 200 dealer con nome, telefono, provincia e segnali, e sono stati inviati i primi 3-4 contatti WA a dealer di Salerno. (S100)
*   È stato preparato un template per la ricevuta di prestazione occasionale e un contratto di incarico scouting di 1 pagina. (S100)
*   Il sistema di invio WA `tools/send_day1_top5_discovery.py` è stato implementato. (S101)
*   La fee del servizio è stata definita come "SOLO scouting+verifica". (S101)
*   Il response-analyzer è stato riscritto per essere production-ready con 12 fix e 2 code review. (S102)
*   Il Groq LLM è funzionante e la cascade LLM è stata aggiornata (Gemma 4, Nemotron, GPT-OSS). (S102)
*   Il sistema di auto-send WA è funzionante e risponde autonomamente ai messaggi senza intervento umano. (S103)
*   L'architettura del response agent v2 è stata implementata con prompt modulare, validator multi-layer, pipeline CoVe→LLM e sliding window. (S103)
*   Sono stati identificati e fixati 4 bug nel response agent v2 (system prompt, classifier POSITIVE, no prezzi inventati). (S103)
*   È stato completato uno stress test autonomo con 10 scenari difficili, superato con 10/10 PASS. (S103)
*   Il response agent v2 è stato deployato su iMac. (S104)
*   Sono stati profilati 112 dealer P1 (7 province Sud, 19 fit>=5.5) e arricchiti i dati per i top 20. (S104)
*   Sono stati inviati i primi messaggi Day 1 a 5 dealer reali con listing reali e monitorate le risposte. (S104)
*   L'architettura template-first è stata completata con `state_machine.py`, `templates.py` e `validator.py`. (S106)
*   Sono state create 3 varianti di messaggi DAY1 (PREMIUM/MIXED/GENERALIST) con leve reali testate. (S106)
*   È stata definita una brand map con 22 brand e priorità CORE/HIGH/MEDIO/EVITARE. (S106)
*   CLAUDE.md è stato integrato con una Agent Routing Table (17 agent). (S106)
*   Il servizio è stato definito come "Scenario A (scouting puro, success-fee)". (S106)
*   L'integrazione tra il daemon `wa-daemon.js` e i moduli Python è stata completata e testata con 36/36 test PASS. (S107)
*   È stato creato un `requirements.txt` minimo per `wa-intelligence`. (S107)
*   Il contratto `tools/materiali/contratto_incarico_scouting.html` è stato aggiornato con clausole anti-bypass (penale 100% fee, definizione "veicolo segnalato", protezione 90 giorni). (S107)
*   Il template per il case study (1 pagina PDF) è stato preparato. (S107)
*   Il `DAY1_MIXED` in `wa-intelligence/templates.py` è stato accorciato a 5 righe. (S108)
*   Il `scheduler.py` è stato migrato da DuckDB a SQLite. (S109)
*   Il `mobile_de_scraper.py` è stato fixato per estrarre i listing. (S72)
*   Il `transport_estimator.py` è stato validato per il caso d'uso di 1 auto DE→Sud Italia, con opzioni di ritiro personale e trasportatore singolo. (S85)
*   Il `pdf_generator_enterprise.py` è stato aggiornato per rimuovere la "bisarca" e mostrare 2 opzioni di trasporto. (S85)
*   Il `wa-daemon.js` è stato modificato per supportare multi-messaggio con delay, imperfezioni volontarie e buffer multi-input. (S86)
*   Il `response-analyzer.py` è stato aggiornato per usare prompt Haiku con imperfezioni umane e formato JSON array di messaggi. (S86)
*   È stata creata una Knowledge Base ARGOS (`wa-intelligence/argos_knowledge_base.md`) con FAQ, costi, tempi, trasporto, garanzia e obiezioni comuni. (S86)
*   Il `response-analyzer.py` è stato configurato per l'invio automatico con flag `--auto-send` in business hours e per stati avanzati. (S86)
*   È stata implementata la trascrizione audio WA con Whisper locale. (S86)
*   Lo schema DuckDB è stato aggiornato con le colonne `vin_verified`, `vin_verification_data` e `recall_count`. (S88)
*   Il `pdf_generator_enterprise.py` è stato fixato per risolvere 10 problemi di qualità e layout, inclusi logo venditore EU visibile, segno margine invertito e recall NHTSA. (S89)
*   Il `pipeline_orchestrator` è stato configurato per girare ogni 4 ore sull'iMac tramite cron. (S90)
*   Il sanitizer è stato migliorato per filtrare thumbnail (< 30 KB) e il PDF generator per mostrare solo foto HD. (S90)
*   La galleria foto multi-pagina è stata aggiunta al PDF. (S90)
*   Il Market Price Index è stato calibrato con 4+ chiavi e 5000+ price points. (S91)
*   Il sanitizer è stato aggiornato alla V15 con YOLO plate detection, LaMa inpainting e OCR verify. (S93)
*   La pipeline auto-score (DISCOVERED → enrich → CoVe → SCORED/REJECTED) è funzionante. (S93)
*   Il bug di re-invio dello scheduler è stato fixato. (S94)
*   Il target dealer è stato allineato al "dealer MEDIO-PICCOLO (15-60 auto) che fa ANCHE commissione". (S95)
*   Il `request_parser.py` è stato costruito per il flusso on-demand. (S95)
*   Il `tools/scrapers/autoscout_scraper.py` è stato fixato per estrarre prezzo/km/anno. (S97)
*   Il `tools/on_demand_runner.py` è stato fixato per il CoVe dynamic import. (S97)
*   Il `tools/scripts/pdf_generator_enterprise.py` è stato reso compatibile con la CLI del runner. (S97)
*   L'autenticazione con API key è stata aggiunta al `wa-daemon.js`. (S99)
*   Il `telegram-handler.py` è stato fixato per prevenire command injection. (S99)
*   È stata aggiunta la input validation su `/send` del daemon. (S99)
*   Sono stati impostati i permessi `chmod 600` su `.env` e `sqlite` sull'iMac. (S99)
*   È stata implementata la prompt injection defense su `response-analyzer.py`. (S99)
*   Lo schema DB è stato unificato (`conversations` + `dealers`) con un sistema di migration in `src/db.py`. (S99)
*   Il `deploy/sync.sh` è stato creato per un rsync atomico con symlink swap. (S99)
*   È stato configurato il backup DB automatico sull'iMac ogni 6h. (S99)
*   Il monitoring con alert Telegram è stato implementato per WA, DB e LLM. (S99)
*   Tutti i cron sono stati spostati dal MacBook all'iMac. (S99)
*   L'IP 192.168.1.12 è stato corretto a 192.168.1.2 in `deploy.sh`. (S99)
*   È stata implementata una cascade LLM resiliente (`src/llm_cascade.py`) con circuit breaker (Gemini Flash, Groq Llama 70B, OpenRouter, Gemini Lite, Ollama locale). (S99)
*   È stato implementato un test E2E automatico (`tests/test_e2e.py`) con 10 scenari. (S99)

## Blocker aperti

*   WA daemon a 192.168.1.2:9191 può essere offline (smartphone in ripristino da S82) – needs verification before Phase 4 (S155-tris)
*   BMW X3 listing (autoscout24_de_b0d65f095510) può vendere prima di Phase 4 – move fast (S155-tris)
*   Wrangler local NON gira su macOS 11.6 (richiede 13.5+) → remote deploy in S152b (S152b)
*   Sanitizer PaddleOCR NON operativo – foto full-res embeddate contengono watermark/branding del dealer tedesco originario, targhe, numeri telefono. Violazione zero-source policy ARGOS. (S159)
*   `ImportError: dlopen(.../cv2/cv2.abi3.so): Symbol not found in libtesseract.5.dylib (built for Mac OS X 12.0)` Root cause: opencv-contrib-python 4.9 wheel embed `libtesseract.5.dylib` compilato contro macOS 12.0 SDK. MacBook Luke è macOS 11 Big Sur (Darwin 20.6.0). (S159)

## Prossimi passi

*   B-7 send-iban endpoint (validate AWAITING_DELIVERY → IBAN_SENT, WA template + email + Telegram) (S152b)
*   B-8 mark-paid endpoint (validate amount tolerance ±€1 → PAID, WA PAYMENT_RECEIVED) (S152b)
*   B-9 analyzer trigger (`response-analyzer.py` create_contract_for_interest + 3 templates su `templates.py`) (S152b)
*   B-10 dashboard (`wa-intelligence/dashboard/app.py` /contracts route + proxy + HTML) (S152b)
*   Deploy: wrangler d1 create + r2 bucket + execute remote + 9 secrets + deploy + smoke 8 endpoint (S152b)
*   Handoff S153 (S152b)
*   Reset TEST_FOUNDER: `PENDING | COLD | outbound=0 | last_contact=NULL` (S153)
*   Simulazione completa: Day 1 → vehicle_request → dossier → contract+firma → bonifico manuale + mark PAID (S153)
*   Verifica visiva Luke prima di Day 1 reale (S153)
*   Risolvere blocker sanitizer cv2 dylib (S160)
*   Smoke test sanitizer (S160)
