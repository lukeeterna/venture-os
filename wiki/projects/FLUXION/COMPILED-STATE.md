---
project: FLUXION
date: 2026-05-09
compiled_at: 2026-05-09T20:25:22Z
model: gemini-2.5-flash
source_files: 14
compiler: karpathy-compiler v2 (multi-pass capable)
---

## Stato attuale verificato

### Voice Agent (Python)
*   Il Voice Agent "Sara" è implementato con una pipeline a 5 layer. (P-R-2026-02-06)
*   Il Voice Agent include una logica di WAITLIST completa. (P-R-2026-02-06)
*   Il Voice Agent supporta la disambiguazione fonetica dei nomi (es. "Gino" vs "Gigio"). (P-R-2026-02-11)
*   Il Voice Agent riconosce i soprannomi (es. "Gigi" per "Gigio"). (P-R-2026-02-11)
*   Il Voice Agent gestisce la chiusura della chiamata con conferma ("Terminiamo la comunicazione e le inviamo la conferma via WhatsApp?"). (P-R-2026-02-07-LIVE-TEST)
*   Il Voice Agent gestisce il rifiuto elegante di un booking ("No, ho cambiato idea" → "Posso aiutarla in altro modo?"). (P-R-2026-02-07-LIVE-TEST)
*   Il Voice Agent può inviare conferme di booking via WhatsApp. (P-R-2026-02-07-LIVE-TEST)
*   Il Voice Agent può leggere il `nome_attivita` dalle impostazioni del DB per un greeting dinamico. (P-R-2026-02-06)
*   Il Voice Agent include un `FluxionLatencyOptimizer` per lo streaming LLM e connection pooling. (P-R-2026-02-12-VoiceAgent)
*   Il Voice Agent include un `FluxionTurnTracker` per l'osservabilità a livello di turno e breakdown della latenza. (P-R-2026-02-12-VoiceAgent)
*   Il Voice Agent utilizza un client Groq modificato per lo streaming LLM con chunking su punteggiatura. (P-R-2026-02-12-VoiceAgent)
*   Il Voice Agent ha flag CLI `--version` e `--health-check` che funzionano anche con dipendenze mancanti. (S184)
*   Il Voice Agent è configurato per ascoltare su `0.0.0.0:3002` sull'iMac. (P-R-2026-02-12-VoiceAgent)
*   Il Voice Agent ha un test suite completa con 40+ test per intent, entity, state machine e performance. (P-R-2026-02-12-VoiceAgent)
*   Il Voice Agent ha smoke test rapidi (14 test) e test cross-machine. (P-R-2026-02-12-VoiceAgent)
*   Il Voice Agent ha un filtro PII per trascrizioni e `user_text` (16 chiavi). (S184)

### Frontend (React/TypeScript)
*   Esiste un Setup Wizard a 6 step (Dati→Indirizzo→Macro→Micro→Licenza→Config). (P-R-2026-02-04)
*   Il Setup Wizard include la selezione di macro e micro categorie. (P-R-COMPLETO)
*   Le schede cliente verticali sono dinamiche e si attivano in base alla micro-categoria selezionata. (P-R-COMPLETO)
*   Sono complete le schede `SchedaOdontoiatrica.tsx`, `SchedaFisioterapia.tsx`, `SchedaEstetica.tsx`. (P-R-2026-02-04)
*   Esiste un componente `SchedaClienteDynamic.tsx` che funge da switcher automatico per le schede. (P-R-2026-02-04)
*   Esiste una UI completa per la gestione delle licenze (`LicenseManager.tsx`). (P-R-2026-02-04)
*   Esistono React Query hooks per tutte le schede cliente e per la gestione delle licenze. (P-R-2026-02-04)
*   Esiste una UI per la creazione di pacchetti (`PacchettiAdmin.tsx`). (P-R-COMPLETO-2026-02-06)
*   Esiste una UI per la visualizzazione del progresso loyalty (`LoyaltyProgress.tsx`). (P-R-COMPLETO-2026-02-06)
*   Esiste un `FirstRunNetworkModal.tsx` per la gestione della connettività di rete al primo avvio. (S184)
*   Esiste un Pre-flight Wizard a 8 step (`FirstRunWizard.tsx`) per controlli iniziali (network, microfono, path DB, porte, voice ready, AV/Defender). (S184)
*   Esiste un componente `DiagnosticReport.tsx` per l'invio di report diagnostici. (S184)
*   Il frontend ha un filtro PII per 15 chiavi. (S184)

### Backend (Rust/Tauri)
*   Sono implementati 12 comandi Tauri per `get/upsert` di ogni scheda cliente. (P-R-2026-02-04)
*   Sono implementati comandi Tauri per lo stato, attivazione, verifica e fingerprint delle licenze Ed25519. (P-R-2026-02-04)
*   Sono implementati comandi Tauri per `get_setup_status`, `get_setup_config`, `save_setup_config`. (P-R-2026-02-04)
*   Sono implementati comandi Tauri per `check_feature_access_ed25519` e `check_vertical_access_ed25519`. (P-R-2026-02-04)
*   Il backend Rust include la dipendenza `ed25519-dalek`. (P-R-2026-02-04)
*   Il backend Rust include una funzione `detect_cloud_sync_provider()` per rilevare servizi come iCloud/OneDrive/Dropbox. (S184)
*   Il backend Rust include comandi per `check_network`, `check_mic`, `check_db_path`, `check_ports`, `check_voice_ready` per il Pre-flight Wizard. (S184)
*   Il backend Rust include comandi per `collect_diagnostic` e `send_diagnostic_report` per i report diagnostici. (S184)
*   Il backend Rust ha un filtro PII per 15 chiavi. (S184)
*   Il backend Rust è configurato per il linking statico CRT su Windows (`target-feature=+crt-static`). (S184)
*   Il backend Rust è configurato per `embedBootstrapper` per WebView2 su Windows. (S184)

### Database (SQLite)
*   Esistono tabelle per 6 schede cliente verticali (odontoiatriche, fisioterapia, estetica, parrucchiere, veicoli, carrozzeria). (P-R-2026-02-04)
*   Esiste una tabella `license_cache` per i dati di licenza Ed25519. (P-R-2026-02-04)
*   Esistono tabelle base per clienti, appuntamenti, operatori (`001_init.sql`). (P-R-COMPLETO)
*   Esistono tabelle per la configurazione del Voice Agent (`011_voice_agent.sql`). (P-R-COMPLETO)
*   Esistono tabelle per operatori e specializzazioni (`012_operatori_voice_agent.sql`). (P-R-COMPLETO)
*   Esiste una tabella per la lista d'attesa VIP (`013_waitlist.sql`). (P-R-COMPLETO)
*   Le query SQLite principali (list-all, by-id, search LIKE, count-active, count-vip, export, by-telefono, by-email) sono ottimizzate e passano gli SLO di performance (P95 list-all 24.50ms vs SLO 50ms). (S190)

### Sistema Licenze
*   Il sistema di licenze Ed25519 è implementato. (P-R-2026-02-04)
*   Il License Generator è un tool separato che contiene la chiave privata Ed25519. (P-R-2026-02-04)
*   La chiave pubblica Ed25519 è embedded in `license_ed25519.rs`. (P-R-2026-02-04)
*   L'hardware fingerprint è generato tramite SHA-256(hostname + CPU + RAM + OS). (P-R-2026-02-04)
*   Sono definiti i tier di licenza (Trial, Base, Pro, Enterprise) con mapping a verticali e funzionalità. (P-R-2026-02-04)

### CI/CD e Build
*   Il workflow `release-full.yml` su GitHub Actions è configurato per buildare su Linux, macOS-arm e Windows. (S183-bis)
*   Il workflow `release-full.yml` include uno step per rinominare il Voice Agent per il sidecar Tauri. (S184)
*   Il workflow `release-full.yml` include `!include LogicLib.nsh + WinVer.nsh + x64.nsh + FileFunc.nsh` per gli NSIS hooks su Windows. (S184)
*   Il workflow `release-full.yml` è configurato con `permissions: contents: write` per la creazione di draft release su GitHub. (S184)
*   Il workflow `release-full.yml` usa `actions/upload-artifact@v4` con `if: always()` per caricare i bundle indipendentemente dal successo della release. (S184)
*   Esiste un workflow `.github/workflows/smoke-test-installers.yml` per smoke test CI cross-OS. (S184)
*   Esiste un workflow `.github/workflows/virustotal-gate.yml` per il controllo VirusTotal pre-release. (S184)
*   Esiste un workflow `.github/workflows/verify-windows-static-crt.yml` per verificare il linking statico CRT su Windows. (S184)
*   Il bundle PyInstaller include `espeak-ng-data/` e tutti i submodules `piper.*`. (S195)
*   Il `tts_engine.py` usa la PiperVoice Python API in priorità. (S195)
*   La funzione `_find_model()` in `tts_engine.py` cerca i modelli anche nella directory del bundle (`get_bundle_root()`). (S195)
*   Il `voice-agent-x86_64-apple-darwin` ha una dimensione di 193MB. (S194)
*   Il `voice-agent-x86_64-apple-darwin` passa i smoke test `--version` e `--health-check`. (S194)

### Customer Success
*   Esiste una FAQ pubblica (`landing/faq.html`) con 24 Q&A in 8 categorie, filtro di ricerca live e JSON-LD SEO. (S187)
*   Esiste un Support Runbook (`docs/SUPPORT-RUNBOOK.md`) con 1989 righe, 7 categorie, top-20 issue e 15 email template. (S187)
*   Esiste un sistema di Email Sequence Cron (`fluxion-proxy/src/scheduled/email-sequence.ts`) con 5 template HTML (attivazione, tutorial, tips, feedback, review) e dispatcher. (S188)
*   Esiste un Health Monitor Cron (`fluxion-proxy/src/scheduled/health-monitor.ts`) con 4 probe target (landing, self, Resend, Stripe), isteresi, persistenza stato KV e Discord webhook. (S188)
*   Esiste un endpoint `POST /admin/email-sequence/preview` per inviare singoli step di email sequence a email di test. (S188)
*   Esiste un endpoint `POST /admin/email-sequence/run-now` per invocare il cron handler immediato. (S188)
*   Esiste un endpoint `GET /admin/health/status` per leggere lo snapshot dello stato di salute. (S188)
*   Esiste un endpoint `POST /admin/health/run-now` per forzare l'esecuzione delle probe e la valutazione degli alert. (S188)
*   Esiste un endpoint `POST /api/v1/diagnostic-report` per l'invio di report diagnostici privacy-safe. (S184)
*   Esiste un tool `tools/network-test.sh` per il network audit con 9 probe endpoint e 3 modalità di output. (S184)
*   Esiste un documento `scripts/install/docs/NETWORK-REQUIREMENTS.md` per i requisiti di rete e whitelist firewall per PMI. (S184)
*   Il Discord webhook per il monitoraggio della salute è stato rollato a un Account API Token Cloudflare. (S192)

### Sentry
*   L'integrazione Sentry è LIVE su 3 tier (Frontend React, Rust Tauri, Python voice-agent). (S184)
*   Sono stati validati 3 DSN end-to-end con eventi di test reali. (S184)
*   L'account Sentry è configurato per la regione EU `de` (GDPR safe). (S184)
*   La configurazione Sentry è zero-cost (traces=0, replay=0, profiling NON aggiunta). (S184)

### Installazione
*   Esistono script post-install `setup-mac.command` e `setup-win.bat` per bypassare quarantine/SmartScreen/Defender/firewall. (S184)
*   Esiste un documento `scripts/install/docs/av-submission-guide.md` per la submission a 5 vendor AV. (S184)
*   Esiste un video tutorial AI-generato (`landing/assets/video/fluxion-tutorial-install.mp4`) di 4:21 che copre l'installazione su macOS e Windows. (S184)
*   La pagina `landing/come-installare.html` è aggiornata con il video tutorial e sezioni per script di setup ed errori comuni. (S184)
*   Il `src-tauri/installer-hooks.nsh` include 4 macro per pre-flight checks (Win10+, x64, WebView2 detection, 1GB disk space). (S184)
*   Il `src-tauri/installer-hooks.nsh` include messaggi in italiano per PMI. (S184)
*   Il `tauri.conf.json` è configurato con `installerHooks: "./installer-hooks.nsh"`, `languages: ["Italian", "English"]`, `displayLanguageSelector: false`. (S184)
*   Il `scripts/install/docs/win10-fresh-compat.md` documenta la compatibilità con Win10/Win11 e la strategia di installazione. (S184)

### Cloudflare Worker (fluxion-proxy)
*   Il Worker è deployato su `https://fluxion-proxy.gianlucanewtech.workers.dev/`. (S181)
*   Il Worker include un endpoint `DELETE /admin/resend/domains/:id` per la gestione dei domini Resend. (S181)
*   Il Worker include un endpoint `POST /api/v1/diagnostic-report` pubblico con validazione, honeypot, rate limit e inoltro a Resend. (S184)
*   Il Worker è configurato con cron schedules per email sequence e health monitor. (S188)

### Generale
*   Il progetto aderisce a un vincolo di zero costi permanenti (no domini custom, no SaaS a pagamento). (S181)
*   La chiave API OpenRouter è salvata in `.env` e gitignored, con accesso a modelli free per video, immagini, testo e audio. (DIRETTIVA OPENROUTER)
*   Il repository GitHub è `https://github.com/lukeeterna/fluxion-desktop.git`. (S184)
*   Il tag `v1.0.1` è stato pushato e la GitHub Release è stata creata. (S183-bis)
*   Il `PRE-LAUNCH-AUDIT.md` è stato creato con 22 P0, 21 P1, 12 P2 distribuiti su 6 categorie. (S182)
*   La `ROADMAP_S183_S190.md` è stata creata con 4 gate strict (S183→S188) e un buffer (S189-S190). (S182)
*   Il `CLOUDFLARE_API_TOKEN` è stato rimosso dalla history git e dai file di configurazione locali. (S192)
*   Il `setuptools` sull'iMac è stato downgradato a 69.5.1 per compatibilità con PyInstaller 6.19. (S194)
*   `appdirs` 1.4.4 è installato sull'iMac. (S194)
*   Il modello `it_IT-paola-medium.onnx` (61MB) e la sua configurazione sono stati scaricati in `voice-agent/models/tts/` sull'iMac. (S193)
*   `piper-tts>=1.2.0` è installato sull'iMac. (S193)
*   Il benchmark D-3 Voice TTS Piper ha un P95 di 590.8ms (vs SLO 800ms). (S193)
*   Il benchmark D-2 IPC ha un P95 di 36.9ms (vs SLO 100ms). (S192)

## Decisioni chiuse
*   Il Voice Agent deve usare l'IP `0.0.0.0` invece di `127.0.0.1` per essere accessibile dalla rete (S2026-02-12).
*   L'IP statico `192.168.1.7` deve essere configurato sul router per l'iMac (S2026-02-12).
*   Il Voice Agent deve ascoltare sulla porta `3002` e l'HTTP Bridge sulla porta `3001` (S2026-02-12).
*   Il Voice Agent deve implementare lo streaming dei token LLM al TTS, connection pooling con keep-alive e selezione dinamica del modello (S2026-02-12).
*   Il Voice Agent deve implementare il Turn-level observability con backend SQLite e latency breakdown per componente (S2026-02-12).
*   Il Voice Agent deve implementare la generazione di risposte in streaming con chunking su punteggiatura e parallel TTS-ready (S2026-02-12).
*   Il Voice Agent deve gestire la disambiguazione fonetica dei nomi (es. "Gino vs Gigio") e il riconoscimento dei soprannomi (es. "Gigi" per "Gigio") (S2026-02-11).
*   Il Voice Agent deve gestire la chiusura della chiamata con una conferma esplicita all'utente e l'invio di un messaggio WhatsApp (S2026-02-11).
*   Il Voice Agent deve gestire il rifiuto di un booking in fase di conferma, annullando la prenotazione e offrendo ulteriore aiuto (S2026-02-11).
*   Il Voice Agent deve utilizzare il `nome_attivita` dalle impostazioni del DB per i greeting dinamici (S2026-02-06).
*   Il sistema deve supportare schede cliente dinamiche che si attivano in base alla micro-categoria selezionata nel setup (S2026-02-04).
*   Il sistema di licenze utilizza Ed25519 offline, hardware-locked (S2026-02-04).
*   Il pricing dei tier di licenza è: Trial (Gratis, tutte verticali, Voice/API, 30gg), Base (€199, 1 verticale, no Voice/API, Lifetime), Pro (€399, 3 verticali, Voice, no API, Lifetime), Enterprise (€799, tutte verticali, Voice/API, Lifetime) (S2026-02-04).
*   Il sistema deve supportare 8 macro-categorie verticali (medico, beauty, hair, auto, ecc.) con mapping a micro-categorie e schede DB/componenti React specifici (S2026-02-04).
*   La chiave privata del License Generator non deve mai essere committata su repo pubblica e deve essere conservata offline/USB cifrata (S2026-02-04).
*   La chiave pubblica è embedded in `license_ed25519.rs` come `FLUXION_PUBLIC_KEY_HEX` (S2026-02-04).
*   L'hardware fingerprint è SHA-256(hostname + CPU + RAM + OS) (S2026-02-04).
*   Il sistema deve supportare il vecchio Keygen.sh per retrocompatibilità (S2026-02-04).
*   Il pricing canonico è `trial €0 / Base €497 / Pro €897` (S185-A).
*   Le verticali sono `8 macro × ~50 micro` (S185-A).
*   La wiki helpdesk è internal-only v1 (S185-A).
*   Il prefisso `_` indica meta-content non query reale per i file di verifica (S185-A).
*   Il build Tauri Windows è self-contained e non dipende da `vcruntime140.dll` / `msvcp140.dll` (S184 α.3.3).
*   Il WebView2 viene installato tramite `embedBootstrapper` se non presente (S184 α.3.3).
*   Gli installer hooks NSIS (`installer-hooks.nsh`) includono controlli Win10+, x64, WebView2 detection, spazio disco e messaggi in italiano (S184 α.3.3).
*   Un CI gate verifica il linking statico del CRT per Windows e la presenza delle macro NSIS (S184 α.3.3).
*   Il pre-flight wizard include 8 step di controllo (network, microfono, path DB, porte, voice ready, AV/Defender) e un flag `fluxion-preflight-completed-v1` in localStorage (S184 α.3.1).
*   Il diagnostic send-report raccoglie payload privacy-safe (no PII clienti) e lo invia a un CF Worker con rate limit e persistenza KV (S184 α.3.1).
*   Il CF Worker per il diagnostic report è pubblico e inoltra le email a `fluxion.gestionale@gmail.com` (S184 α.3.1).
*   Il `voice-agent` espone CLI flags `--version` e `--health-check` (S184 α.3.0).
*   Il sistema rileva i provider di cloud-sync (iCloud/OneDrive/Dropbox/etc.) e genera un warning (S184 α.3.0).
*   Un CI smoke test cross-OS verifica l'installazione e lo stato di salute del `voice-agent` (S184 α.3.0).
*   Un CI gate VirusTotal verifica gli hash SHA256 dei bundle e crea un'issue GitHub se ci sono troppe detection (S184 α.3.0).
*   Il video tutorial di installazione copre sia macOS che Windows (S184 α.2-bis).
*   Gli script post-install (`setup-mac.command`, `setup-win.bat`) sono mirrorati in `landing/assets/install/` (S184 α.2).
*   La documentazione per la submission ai vendor AV è stata creata (S184 α.2).
*   Il video tutorial è AI-generato, self-hosted e senza costi (S184 α.2).
*   La landing page `come-installare.html` è stata aggiornata con nuove sezioni (S184 α.2).
*   Un modal di errore di rete al primo avvio (`FirstRunNetworkModal.tsx`) è stato implementato (S184 α.2).
*   L'integrazione Sentry è 3-tier (Frontend React + Rust Tauri + Python voice-agent) con 3 DSN validati (S184 α.1).
*   L'account Sentry è `fluxion.gestionale@gmail.com` con regione EU `de` e filtri PII obbligatori (S184 α.1).
*   La configurazione Sentry è zero-cost (traces=0, replay=0, profiling non aggiunta) (S184 α.1).
*   Il piano Sentry sarà auto-downgradato a "Developer" free intorno al 2026-05-15 (S184 α.1).
*   L'API key "fluxion" per OpenRouter è salvata in `.env` (`OPENROUTER_API_KEY`, gitignored) (S181-bis).
*   L'endpoint OpenRouter è OpenAI-compatible: `https://openrouter.ai/api/v1` (S181-bis).
*   I modelli OpenRouter free ($0/M) sono usati per video promo, thumbnail YouTube, asset social, copy multilingua landing, embeddings RAG Sara (S181-bis).
*   Le dipendenze a pagamento devono essere sostituite per mantenere il vincolo zero costi (S181-bis).
*   Il lancio cold-traffic non è ammissibile nello stato attuale del progetto (S182).
*   Sono stati identificati 22 P0 BLOCKING, 21 P1 e 12 P2 (S182).
*   La roadmap è divisa in 4 gate strict (BUILD + FUNCTIONAL E2E, SECURITY + COMPLIANCE, PERFORMANCE + UX, LAUNCH) (S182).
*   Non si procede a Gate N+1 finché Gate N non è tutto verde con E2E PASS (S182).
*   Il dominio `fluxion.it` non è mai stato registrato e non si intende registrare domini a pagamento (S181).
*   Lo stack FLUXION resta su subdomini CF gratis: `fluxion-landing.pages.dev` + `fluxion-proxy.gianlucanewtech.workers.dev` (S181).
*   Le email transazionali usano `onboarding@resend.dev` come sender (Resend free tier) (S181).
*   Le email di contatto/supporto usano `fluxion.gestionale@gmail.com` (Gmail founder) (S181).
*   Il vincolo zero costi è permanente (S181).
*   L'endpoint `DELETE /admin/resend/domains/:id` è stato aggiunto per la gestione dei domini orfani (S181).
*   Il dominio orfano Resend `fluxion.it` ID `e6de440b-c6f6-4c84-8bc5-a5d87d19b7fe` è stato eliminato (S181).
*   I riferimenti a `fluxion.it` e `@fluxion.app` nei file non di produzione sono intenzionalmente non toccati (S181).
*   Stripe è in modalità TEST (S181).
*   La pipeline di release GitHub Actions è 3/4 GREEN (Linux, macOS-arm, Windows) con macOS-intel waived (S183-bis).
*   Il tag `v1.0.1` è stato pushato e la GitHub Release è stata creata (S183-bis).
*   La strategia α (onesta lenta) è stata confermata, con ETA +3 settimane e 6 beta tester (S183-bis).
*   Il build Tauri macOS-intel è stato differito, con build locale su iMac on-demand (S184 α.3.2).
*   La funzionalità di auto-update è temporaneamente disabilitata a causa di un mismatch nella password di firma (S184 α.3.2).
*   La creazione di GitHub Release richiede `permissions: contents: write` nel job `build-tauri` (S184 α.3.2).
*   Il scope del test α.3.2 è stato ridotto alla validazione degli artifact CI e all'integrità MSI (S184 α.3.2).
*   Il `setup-win.bat` è stato copiato in `~/fluxion-vm-share/` su iMac per la VM Win11 (S184-bis3).
*   La ISO Win11 it-IT è stata verificata (S184-bis2).
*   La RAM dell'iMac è satura e richiede cleanup per la creazione di VM (S184-bis2).
*   La cartella `~/fluxion-vm-share/` è stata creata su iMac per la shared folder UTM (S184-bis2).
*   La ISO Win11 en-US è accettabile per α.3.2, con validazione UI italiana stock differita (S184-bis prep).
*   Il `UTM.app` è stato spostato in `/Applications/UTM.app` su iMac (S184-bis prep).
*   Il `voice-agent` è stato fixato per ascoltare su `0.0.0.0` invece di `127.0.0.1` (S2026-02-12).
*   L'IP statico `192.168.1.7` è configurato per l'iMac (S2026-02-12).
*   Il Voice Agent implementa lo streaming LLM, connection pooling, model selection dinamico (S2026-02-12).
*   Il Voice Agent implementa il turn-level observability con SQLite backend e latency breakdown (S2026-02-12).
*   Il Voice Agent ha una test suite completa e smoke tests cross-machine (S2026-02-12).
*   Il build Tauri di Fluxion sull'iMac è stato completato e il Voice Agent è stato verificato in produzione (S2026-02-13).
*   Node.js 20.11.0 LTS è installato su iMac (S2026-02-13).
*   Il bundle `.app` è generato in `src-tauri/target/release/bundle/macos/` (S2026-02-13).

## Blocker aperti

*   **Build iMac**: PyInstaller `voice-agent.spec --clean` in background (commit `5f4aefe` pulled) (S195)
*   **Bundle size**: target ~190MB (era 193MB S194, +espeak-ng-data ~10MB → ~200MB) (S195)
*   **TEMPDIR inspection**: `find _MEI* -name 'paola*.onnx' -o -path '*espeak-ng-data*it_dict' -o -path '*piper/voice*'` → 3 hit (S195)
*   **E2E sintesi**: avviare sidecar standalone (kill iMac voice 3002 first), `curl -X POST :3002/api/voice/say -d '{"text":"Ciao Sara test","voice_engine":"piper"}'` → WAV bytes `> 1KB` (S195)
*   **Bench latency**: 10 frasi italiane → P95 vs SLO 800ms (atteso ~590ms come S193 native, possibile +20-50ms overhead Python API loaded vs subprocess) (S195)
*   **Tech debt #4 NUOVO** (S184 α.3.2 build #17): Tauri updater signing password mismatch. Founder action: regenerate key + update GitHub secrets `TAURI_SIGNING_PRIVATE_KEY` + `TAURI_SIGNING_KEY_PASSWORD`. Auto-update DISABILITATA temporaneamente. (S184)
*   **Tauri 2 NSIS DLL custom** (es: `nsisDriveSpace`) potenziale issue su build CI — verifica al primo build Win full (deferred to first Win MSI release) (S184 α.3.3)
*   **Stripe LIVE flip + E2E carta reale con refund** (Gate 4 launch dopo CHUNK B) (S184 α.3.3)
*   **macos-intel runner queue persistente GH** (waived S183-bis, da investigare quota) (S184 α.4)
*   **Reminder calendar founder 2026-05-15**: verifica plan Sentry = "Developer" (free), NON "Business expired" (paid). NO carta credito chiesta da Sentry. (S184 α.1)
*   **Runtime crash E2E** (browser throw + Rust panic + voice endpoint) — pending tauri dev runtime (S184 α.1)
*   **Wrangler v3 → v4** upgrade (warning out-of-date) (S182)
*   **iMac DHCP reservation router** (.2 vs .12 fluttua — eredità S179) (S182)
*   **`purchase:fluxion.gestionale@gmail.com` pre-S174** verifica payment_intent migration (eredità S179) (S182)
*   **Audit Stripe customer Base/Pro swap** pre-S175 (eredità S178 — ma audit live S179 ZERO clienti reali → priorità bassa) (S182)
*   **Voice Agent Timeout**: Il Voice Agent sull'iMac ascolta su **127.0.0.1** (localhost) invece che su **0.0.0.0** (tutte le interfacce). (S2026-02-12)
*   **Node.js su iMac**: Node.js non installato su iMac, bloccando `npm install` e `tauri build`. (S2026-02-13)
*   **npm install**: Bloccato dall'installazione di Node.js. (S2026-02-13)
*   **Tauri Build**: Bloccato dall'installazione delle dipendenze Node.js. (S2026-02-13)
*   **Test Live**: Bloccato dal completamento del build Tauri. (S2026-02-13)

## Prossimi passi

*   Apri Claude Code da `/Volumes/MontereyT7/FLUXION` (S196)
*   Leggi questo file (auto-loaded? dipende da config progetto) (S196)
*   Continua dal punto indicato negli ultimi turni assistant sopra (S196)
*   Bundle size: target ~190MB (era 193MB S194, +espeak-ng-data ~10MB → ~200MB) (S195)
*   TEMPDIR inspection: `find _MEI* -name 'paola*.onnx' -o -path '*espeak-ng-data*it_dict' -o -path '*piper/voice*'` → 3 hit (S195)
*   E2E sintesi: avviare sidecar standalone (kill iMac voice 3002 first), `curl -X POST :3002/api/voice/say -d '{"text":"Ciao Sara test","voice_engine":"piper"}'` → WAV bytes `> 1KB` (S195)
*   Bench latency: 10 frasi italiane → P95 vs SLO 800ms (atteso ~590ms come S193 native, possibile +20-50ms overhead Python API loaded vs subprocess) (S195)
