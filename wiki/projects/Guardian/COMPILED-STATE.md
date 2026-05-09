---
project: Guardian
date: 2026-05-09
compiled_at: 2026-05-09T17:51:54Z
model: gemini-2.5-flash
source_files: 17
compiler: karpathy-compiler v0
---

## Stato attuale verificato
*   Il contesto budget strutturale V1 (hook auto-enforcement) e V3 (soglia CLAUDE.md 40/50%) sono implementati, testati e attivi (S27).
*   Il hook di auto-enforcement ha rilevato un utilizzo del 48% durante la sessione S27 e ha attivato un system-reminder di avviso (S27).
*   Il file `~/.claude/statusline-command.sh` è stato esteso per scrivere `/tmp/claude-ctx-{session_id}.json` con metriche di utilizzo del contesto (S27).
*   Il hook `.claude/hooks/context_budget_gate.py` è configurato per triggerare un avviso al 40% e un enforcement al 50% di utilizzo del contesto (S27).
*   Il hook di auto-enforcement ha un cooldown di 3 tool calls e uno stale guard di 60 secondi (S27).
*   La sezione "Context Budget Operativo" è stata aggiunta a `CLAUDE.md` con soglie e protocollo di chiusura (S27).
*   Il protocollo di chiusura V3 è stato applicato alla sessione S27 stessa, con V4, V5 e V2 posticipati (S27).
*   Il processo Guardian è attivo e stabile, con FPS di 0.9 per il soggiorno (S26, S25, S24, S23).
*   Il baseline del soggiorno ha 1373 osservazioni e `MAX(learning_days)=1` (S26).
*   Il processo Luna sul telefono è attivo (PID 10810) (S26).
*   Sono stati rimossi 16 file `.bak` obsoleti (>14gg pre-S20) e archiviati in due tarball (S26).
*   Sono stati preservati 14 file di backup recenti (S15+ ≤7gg) (S26).
*   Il cron per la ricostruzione del profilo baseline è attivo e funziona correttamente ogni ora (S26).
*   La cameretta ha 458 osservazioni congelate (hardware disabilitato) (S26).
*   Il backup del database è stato rafforzato con uno script idempotente (`db-backup.sh`) e un LaunchAgent (`com.guardian.dbbackup.plist`) che esegue il backup all'avvio e alle 03:00 (S26).
*   Il cron delle 03:00 per il backup del database è mantenuto come safety-net (S26).
*   È stato eseguito un audit delle credenziali senza trovare segreti hardcoded (S26).
*   È stato recuperato 1GB di spazio sul telefono eliminando file di ricerca obsoleti e log vecchi (S26).
*   È stato implementato un log rotator per iMac (`log-rotator.sh`) che comprime e ruota i log superiori a 10MB (S26).
*   È stato implementato un sistema di health check end-to-end (`health-check.sh`) con 14 controlli e alerting su Telegram (S26).
*   Il health check è installato come cron ogni 15 minuti (S26).
*   Il watchdog di Luna è stato rafforzato con uno script dedicato (`luna-watchdog.sh`) che riacquisisce il wake-lock e riavvia Luna ogni 5 minuti (S25).
*   Il test live del watchdog di Luna ha dimostrato il riavvio di Luna in 3 secondi dopo un kill (S25).
*   L'installer Scope B (`install-guardian.sh`) è stato validato in dry-run su Mac e iMac sandbox (S25).
*   Sono stati corretti 3 bug nell'installer Scope B (banner ANSI, wizard early-return in dry-run, verifica finale skip in dry-run) (S25).
*   Il `MAX(learning_days)` è ancora 1 per il soggiorno (S25, S24).
*   La cameretta è stata disabilitata in `guardian.py:124` a causa del degrado hardware dello stream RTSP (S23).
*   Il Guardian ora funziona solo con la telecamera del soggiorno (S23).
*   `CLAUDE.md` e `device_config.md` sono stati aggiornati con gli IP corretti delle telecamere (S23).
*   Il Telegram alert path è stato verificato con un messaggio live (S23).
*   Il Guardian LaunchAgent `com.guardian` è configurato con KeepAlive (S23).
*   I LaunchAgent di go2rtc, Mosquitto e Traccar sono attivi e funzionanti (S23).
*   Il boot script di Termux sul telefono (`start-services.sh`) è attivo con 14+ cron job (S23).
*   Il cron per il backup del database di Guardian alle 03:00 è attivo con retention di 8 giorni (S23).
*   Il cron per il watchdog di go2rtc è attivo ogni 5 minuti (S23).
*   Il cron per la ricostruzione del profilo baseline è attivo ogni ora (S23).
*   Il cron per il risolutore IP EZVIZ è attivo ogni 5 minuti (S23).
*   La pipeline `score_observation` è stata validata e funziona, ma è bloccata dal `learning_days=1` (S15).
*   Il `record_observation` viene chiamato sempre, anche quando la casa è vuota (S14).
*   Il thread della cameretta è attivo e l'FPS è corretto (S14).
*   Il cron per la ricostruzione del profilo baseline è installato e attivo (S14).
*   Il profilo baseline è stato ricostruito con 14 righe slot-state attive (S14).
*   La conferma vocale v3.1 è stata verificata end-to-end per entrambe le telecamere (S13).
*   Il Guardian v3.2 è in produzione con wiring, cattura, conferma vocale e auto-discovery IP (S13).
*   Lo script `rebuild_baseline_profile.py` è deployato e funzionante (S13).
*   Lo script `ezviz_ip_resolver.py` è stato creato per l'auto-discovery degli IP delle telecamere EZVIZ (S12).
*   Il file `go2rtc.yaml.tmpl` è stato creato con placeholder per gli IP delle telecamere (S12).
*   Lo script `render_go2rtc.sh` è stato creato per renderizzare `go2rtc.yaml` e riavviare il LaunchAgent (S12).
*   Lo script `ezviz_aac_talk.py` è stato modificato per leggere gli IP da un JSON (S12).
*   Il cron per il risolutore IP e il render di go2rtc è attivo ogni 5 minuti (S12).
*   L'auto-discovery degli IP delle telecamere EZVIZ è funzionante (S12).
*   L'audio EZVIZ v3.1 per il soggiorno è stato confermato udibile (S11).
*   L'audio EZVIZ v3.1 per la cameretta è tecnicamente funzionante (S11).
*   La mappatura delle telecamere con i nuovi IP DHCP è stata verificata (S11).
*   Il Guardian v3.0 è attivo, con MQTT connesso e entrambe le telecamere caricate (S10).
*   Il framework anti-drift è integrato con `NORTH_STAR.md`, `PROJECT_STATE.md`, `session-start.py` e `alignment-check/SKILL.md` (S10).
*   La directory `docs/adr/` è stata creata con 5 decisioni storiche (S10).
*   La statusline di Claude Code è ripristinata (S10).
*   ffmpeg 8.1 è installato su iMac (S9).
*   `ezviz_aac_talk.py` v3 utilizza una pipeline ffmpeg professionale per l'audio (S9).
*   La pipeline audio finale utilizza edge-tts Isabella, ffmpeg per EQ/compand/loudnorm, e afconvert per ADTS AAC-LC (S9).
*   Il test tecnico dell'audio per il soggiorno è PASS (S9).
*   Il test E2E di rilevamento cadute è PASS (S8).
*   Il bug `faster-whisper` subprocess isolation è stato risolto (S8).
*   L'integrazione Guardian→EZVIZ è completa, con `local_voice_announce` che lancia `_ezviz_speak` in un thread daemon (S7).
*   La voce Edge-TTS `it-IT-IsabellaNeural` è utilizzata per gli alert vocali (S7).
*   Il volume è gestito con peak normalize e tanh soft limiter (S7).
*   Il `talk_all` utilizza subprocess separati per ogni telecamera (S7).
*   Il test audio per soggiorno e cameretta è PASS (S7).
*   Il codec audio AAC-LC 16kHz mono è stato identificato per le telecamere EZVIZ (S6).
*   Il talkback AAC-LC 16kHz dallo speaker C6CN è stato confermato live (S6).
*   L'infrastruttura HCNetSDK è pronta (S4).
*   Il login HCNetSDK funziona (S4).
*   Il comando `cmd=0x110044` riceve "audio stream type:7" (S4).
*   La directory `~/ezviz_sdk/` contiene le dylib di iVMS-4200 (S4).
*   L'URL backchannel RTSP esiste e accetta la sessione (S3).
*   go2rtc è operativo con le telecamere soggiorno e cameretta (S3).
*   Il framework Enterprise v2026.2 è stato integrato (S3).
*   I servizi iMac Traccar, MQTT, Dashboard, Guardian, Ollama, Ferroli AC, Netatmo, go2rtc sono operativi (S3).
*   Guardian v3.1 è deployato (S3).
*   MQTT mosquitto 2.1.2 è attivo con autenticazione (S3).
*   Guardian v1.6 TVCC è deployato (S3).
*   Le feature v1.6 sono operative e testate live (S3).
*   I fix v1.6 sono stati implementati (S3).
*   I test live v1.6 sono PASS (S3).
*   ADB Self-Loop per chiamate di emergenza è configurato (S3).
*   Luna v4.1 è attiva (S3).
*   Le nuove feature v4.1 di Luna sono implementate (S3).
*   Lo script di boot di Luna è unificato (S3).
*   L'hardening Enterprise è completato (S3).
*   La PTZ C6CN è stata fissata e verificata live (S3).
*   Il go2rtc aveva un drop rate dell'87% ed è stato fissato (S3).
*   La strategia di backup 3-2-1 è operativa (S3).
*   L'hardening delle porte è completato (S3).
*   L'audit delle credenziali è completato (S3).
*   I nomi degli stream go2rtc sono stati corretti (S3).
*   La soglia di confidenza di rilevamento è stata abbassata a 0.25 (S3).
*   Il GeometricFallScorer è deployato e sostituisce TSSTG (S3).
*   Il tracking ID instabile è stato risolto (S3).
*   La conferma vocale è verificata (S3).
*   L'audio bidirezionale EZVIZ è confermato impossibile (S3).
*   La PTZ del soggiorno è stata ruotata (S3).
*   Il baseline learning è stato fissato e deployato (S3).
*   Il TCN è stato chiuso (S3).
*   Il flapping MQTT è stato fissato (S3).
*   La conferma vocale bidirezionale è deployata (S3).
*   Il test YOLO non rileva caduta è fallito (S3).
*   Lo stream cameretta go2rtc ha un health check attivo (S3).
*   Il POC auto-detect furniture (YOLOv8n COCO) è PASS su 2 snapshot statici (S30).
*   Il fix per il mismatch di coordinate HPT è stato deployato (S29).
*   Il health-check è stato aggiornato per usare la sonda TCP RTSP (S28).
*   Il commit template è stato creato e la skill `/commit` aggiornata (S28).
*   Il pattern append-only per i file di memoria è stato esteso (S28).
*   Il Guardian è stato riavviato (PID 19339) e i fix S34 P0+P1 sono deployati (S34).
*   Il cron watchdog `guardian_watchdog.sh` è stato riabilitato (S38).
*   Il POC `fall_standalone.py` è stato deployato e il test idle smoke 30s è PASS (S46).
*   La pipeline `fall_standalone.py` è stata corretta per l'estrazione delle feature (S49).
*   La pipeline `run_upstream.py` è stata implementata con `YoloProcessor` (S50).
*   Il test smoke di `run_upstream.py` è PASS (S50).
*   Il test fisico di `run_upstream.py` è PASS (S50).
*   Il test di soppressione FP sul divano è PASS (S52).
*   Il sistema di rilevamento cadute `fall_standalone.py` è stato attivato 24/7 (S53).

## Decisioni chiuse
*   V4 (memory append-only pattern), V5 (commit template), V2 (pre-flight estimation) sono stati posticipati alla sessione S28 (S27).
*   La pulizia dei backup pre-S20 è stata anticipata (S26).
*   La persistenza di Luna è stata deferita alla sessione S27 (S26).
*   L'installer Scope B è stato deferito alla sessione S27+ (S26).
*   La strategia di backup del database è stata rafforzata con LaunchAgent (S26).
*   L'audit delle credenziali è stato eseguito (S26).
*   La pulizia del disco del telefono è stata eseguita (S26).
*   La rotazione dei log di iMac è stata implementata (S26).
*   Il health check end-to-end con Telegram alerting è stato implementato (S26).
*   La decisione di riutilizzare il WIP S24 per l'installer Scope B è stata presa (S25).
*   La decisione di non eseguire l'installazione reale dell'installer Scope B è stata presa (S25).
*   La decisione di non modificare il codice per il gate NORTH STAR nella sessione S24 è stata presa (S24).
*   La decisione di disabilitare la telecamera della cameretta è stata presa (S23).
*   La decisione di implementare l'Opzione A (`learning_period_days` 7→21) per il fix NORTH STAR è stata presa (S23).
*   La decisione di utilizzare l'auto-discovery via cloud EZVIZ per la persistenza degli IP è stata presa (S11).
*   La decisione di non implementare un quick fix per l'IP della telecamera è stata presa (S12).
*   La decisione di utilizzare un template + script di render per la configurazione di go2rtc è stata presa (S12).
*   La decisione di non implementare regole firewall `pf` per la chiusura LAN è stata presa (S16).
*   La decisione di non utilizzare `tailscale serve` è stata presa (S16).
*   La decisione di utilizzare un watchdog cron esterno come quick-fix per il Bug B è stata presa (S16).
*   La decisione di patchare il template di go2rtc e non solo il file generato è stata presa (S16).
*   La decisione di mantenere `min_days_to_score=3` e `learning_period_days=7` per la baseline è stata presa (S15).
*   La decisione di non modificare il design della baseline è stata presa (S15).
*   La decisione di utilizzare Tailscale-only (Tier 1) + mDNS fallback (Tier 2) + manual env (Tier 3) per l'addressing distribuibile è stata accettata (S21).
*   La decisione di mantenere `go2rtc bind 127.0.0.1:8554/1984` è stata presa (S20).
*   La decisione di non implementare un multi-bind per go2rtc è stata presa (S20).
*   La decisione di non implementare un SSH tunnel per il telefono è stata presa (S20).
*   La decisione di non implementare un bind `0.0.0.0` per go2rtc è stata presa (S20).
*   La decisione di utilizzare `os._exit(2)` per la recovery garantita del Guardian è stata presa (S18).
*   La decisione di utilizzare `127.0.0.1:8554` per il bind di go2rtc è stata presa (S19).
*   La decisione di utilizzare hostname mDNS per il telefono Luna è stata presa (S19).
*   La decisione di aggiornare `CLAUDE.md` con hostname-based + nota DHCP-resilience è stata presa (S19).
*   La decisione di documentare ADR 006 hostname-based migration è stata presa (S19).
*   La decisione di utilizzare la pipeline ffmpeg professionale per l'audio è stata presa (S9).
*   La decisione di utilizzare Edge-TTS `it-IT-IsabellaNeural` per la voce è stata presa (S7).
*   La decisione di utilizzare il tanh soft limiter per il volume è stata presa (S7).
*   La decisione di utilizzare subprocess separati per `talk_all` è stata presa (S7).
*   La decisione di utilizzare HCNetSDK porta 8000 per il talkback è stata presa (S3).
*   La decisione di non implementare un reverse engineer dell'app EZVIZ è stata presa (S3).
*   La decisione di non implementare `NET_DVR_ClientAudioStart` è stata presa (S4).
*   La decisione di non implementare un reverse engineer della porta 9010 è stata presa (S3).
*   La decisione di non implementare un reverse engineer dell'RTSP ANNOUNCE è stata presa (S3).
*   La decisione di non implementare un reverse engineer del go2rtc backchannel exec è stata presa (S3).
*   La decisione di non implementare un reverse engineer del portale web Playwright è stata presa (S3).
*   La decisione di non implementare `setprop AEC` è stata presa (S3).
*   La decisione di non integrare Guardian LSTM è stata presa (S3).
*   La decisione di non integrare TCN è stata presa (S3).
*   La decisione di non integrare PS4/Eureka/USB è stata presa (S3).
*   La decisione di non integrare EZVIZ backchannel è stata presa (S3).
*   La decisione di utilizzare la Strada A+ ibrida per la piattaforma è stata accettata (S35).
*   La decisione di estendere il timeout di PersonState da 30s a 90s è stata presa (S42).
*   La decisione di utilizzare YOLOv8-pose Ultralytics per la pose detection e LSTM `lstm_weights.sav` taufeeque9 per la fall classification è stata presa (S45).
*   La decisione di utilizzare `taufeeque9/algorithms.py` upstream as-is, sostituendo solo `vis/processor.py:Processor` con un wrapper YOLOv8-pose, è stata presa (S50).

## Blocker aperti
*   La telecamera del soggiorno 192.168.1.4 è UNREACHABLE (S27).
*   Il Tailscale su iMac è `Logged out` (S26, S25, S24).
*   Il login di Tailscale su iMac richiede un'azione fisica di Luke (S26).
*   La MIUI Termux + Termux:Boot battery whitelist è un'azione fisica di Luke (S26, S25, S24).
*   L'hardware della cameretta richiede uno swap o un reset di fabbrica (S26, S25, S24).
*   L'utente target esterno per l'installer Scope B non è stato identificato (S26).
*   Il `sudo pmset -a autorestart 1` sull'iMac è in sospeso (S26).
*   Il Tailscale su iMac è `Logged out` (S22).
*   Il login di Tailscale su iMac richiede un'azione fisica di Luke (S22).
*   La MIUI Termux + Termux:API + Termux:Boot battery whitelist è in sospeso (S22).
*   La pulizia dei residui post-S20 è in sospeso (S22).
*   Il Tailscale su iMac è `Logged out` (S21).
*   La MIUI Termux + Termux:API + Termux:Boot battery whitelist è in sospeso (S21).
*   La pulizia dei residui post-S20 è in sospeso (S21).
*   Il Tailscale su iMac è `Logged out` (S20).
*   Il `pmset autorestart` sull'iMac è 0 (S20).
*   La verifica delle impostazioni della batteria MIUI per Termux è in sospeso (S20).
*   La verifica dell'impostazione "Use phone MAC" su MIUI è in sospeso (S20).
*   Il Tailscale su iMac è `Logged out` (S19).
*   Il telefono Luna è DOWN dal 14 aprile (S19).
*   L'iMac è in deep sleep (S18).
*   Il login di Tailscale sul telefono richiede un'azione fisica di Luke (S16).
*   Il geofence Traccar :8082 è DOWN (S16).
*   Il telefono SSH :8022 è DOWN (S15).
*   La dashboard audio settings non è implementata (S15).
*   Il geofence Traccar :8082 è DOWN (S14).
*   Il telefono SSH :8022 è DOWN (S14).
*   La dashboard audio settings non è implementata (S14).
*   Il filtro baseline FP suppression non è operativo (S13).
*   La conferma auditiva audio cameretta v3.1 non è stata esplicitamente confermata da Luke (S12).
*   Il geofence Traccar :8082 è DOWN (S12).
*   La conferma uditiva fisica dell'audio soggiorno è pendente (S9).
*   La conferma uditiva fisica dell'audio cameretta è pendente (S9).
*   La dashboard audio settings non è implementata (S9).
*   La conferma uditiva fisica dell'audio è pendente (S6).
*   Il test fisico dell'audio è PENDENTE (S5).
*   Il `CreateVoiceTalkLink failed` persiste (S4).
*   Il `COM_Core_Init` SEGFAULT (S6).
*   Il `NET_DVR_SetDVRConfig` potrebbe essere bloccato dal firmware (S11).
*   Il Guardian è OFF (S28+).
*   Il cron watchdog e health-check sono DISABLED (S28+).
*   Il test fisico controllato sul divano è PENDENTE (S29).
*   L'audit FSM safe-zone è PENDENTE (S29).
*   La stima del budget di contesto pre-volo è PENDENTE (S29).
*   La lucidatura della produzione (runbook DR, report Telegram giornaliero) è PENDENTE (S29).
*   Le azioni fisiche di Luke (MIUI Termux+Termux:Boot whitelist, hardware cameretta swap, Tailscale iMac login, `sudo pmset -a autorestart 1`) sono PENDENTI (S29).
*   Il Guardian è OFF (S30).
*   Il cron watchdog e health-check sono DISABLED (S30).
*   Il test fisico controllato sul divano è PENDENTE (S30).
*   L'audit FSM safe-zone è PENDENTE (S30).
*   La stima del budget di contesto pre-volo è PENDENTE (S30).
*   La lucidatura della produzione (runbook DR, report Telegram giornaliero) è PENDENTE (S30).
*   Le azioni fisiche di Luke (MIUI Termux+Termux:Boot whitelist, hardware cameretta swap, Tailscale iMac login, `sudo pmset -a autorestart 1`) sono PENDENTI (S30).
*   Il Guardian è OFF (S31).
*   Il cron watchdog e health-check sono DISABLED (S31).
*   Il test fisico controllato sul divano è PENDENTE (S31).
*   L'audit FSM safe-zone è PENDENTE (S31).
*   La stima del budget di contesto pre-volo è PENDENTE (S31).
*   La lucidatura della produzione (runbook DR, report Telegram giornaliero) è PENDENTE (S31).
*   Le azioni fisiche di Luke (MIUI Termux+Termux:Boot whitelist, hardware cameretta swap, Tailscale iMac login, `sudo pmset -a autorestart 1`) sono PENDENTI (S31).
*   La POSE detection drop su sdraiato divano è un bug da risolvere (S32).
*   La FALL detection logic NON triggera è un bug da risolvere (S32).
*   Il re-enable cron watchdog/health-check è NEGATO (S32).
*   Il cron watchdog/health-check sono DISABLED (S33).
*   Il fix S32 è stato posticipato a S34 (S33).
*   Il cron watchdog/health-check sono ANCORA DISABLED (S34).
*   Il test live 90s è PENDENTE (S34).
*   L'attivazione della produzione è PENDENTE (S34).
*   Il cron watchdog/health-check sono DISABLED (S35).
*   Il test G1 fall è FAIL (S36).
*   Il G2 è BLOCKED (S36).
*   Il telefono SSHd è offline (S36).
*   Il Guardian si è auto-spento (S37).
*   Il G1 retry round 3 è PENDENTE (S38).
*   Il G2 production activation è PENDENTE (S38).
*   Il telefono Termux MIUI Doze whitelist è PENDENTE (S38).
*   Il monitoraggio watchdog.log è PENDENTE (S38).
*   La pulizia dei plist orfani è PENDENTE (S38).
*   Il G2 production activation è BLOCKED (S38).
*   Il G1 retry round 4 è PENDENTE (S40).
*   Il monitoraggio 24h è PENDENTE (S40).
*   Il G2 production activation è BLOCKED (S40).
*   Il G2 production activation è BLOCKED (S41).
*   Il G1 round 5 è BLOCKED (S42).
*   Il G2 production activation è BLOCKED (S42).
*   Il test G1 round 5 è FAIL (S43).
*   L'iMac remediation è PENDENTE (S44).
*   La strategia di backup è PENDENTE (S44).
*   La pulizia della memoria Tailscale è PENDENTE (S44).
*   L'installazione di ffmpeg su iMac è PENDENTE (S44).
*   L'iMac remediation è PENDENTE (S46).
*   La pulizia del codice morto è PENDENTE (S46).
*   La pulizia della memoria Tailscale è PENDENTE (S46).
*   Il cron watchdog Guardian è PENDENTE (S46).
*   L'iMac Multipass stop, bridge.err truncate, com.apple.582d56504e.plist audit sono PENDENTI (S47).
*   L'installazione di ffmpeg su iMac è PENDENTE (S47).
*   La pulizia del codice morto è PENDENTE (S47).
*   La pulizia della memoria Tailscale è PENDENTE (S47).
*   Il cron watchdog Guardian è PENDENTE (S47).
*   Il test fisico di `fall_standalone.py` è PENDENTE (S49).
*   Il test fisico di `run_upstream.py` è PENDENTE (S50).
*   La Luna MQTT subscribe `zeroclaw/guardian/fall` è PENDENTE (S53b).
*   La P4 reactivation H24 è BLOCCATA (S53b).
*   La Phase out Guardian v3.x fall logic è PENDENTE (S53b).

## Prossimi passi
*   Eseguire il test naturale di 30+ minuti sul divano (S53b).
*   Attivare la P4 reactivation H24 (S53b).
*   Integrare Luna MQTT subscribe `zeroclaw/guardian/fall` + conferma vocale "Tutto bene?" + escalation Telegram (S53b).
*   Eliminare la logica di rilevamento cadute di Guardian v3.x (S53b).
