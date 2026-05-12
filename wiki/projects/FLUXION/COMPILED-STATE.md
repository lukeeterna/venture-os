---
project: FLUXION
date: 2026-05-12
compiled_at: 2026-05-12T16:40:35Z
model: gemini-2.5-flash
source_files: 2
compiler: karpathy-compiler v2 (multi-pass capable)
---

## Stato attuale verificato

### CI/CD e Deploy
*   Il CI release gate completo è deployato via VOS e self-hosted runner (S207).
*   Il runner self-hosted GitHub Actions su MacBook esegue il componente VOS orchestrator (S207).
*   Il workflow `.github/workflows/sara-release-gate.yml` è configurato per trigger su PR `voice-agent/**` e `workflow_dispatch` (S207).
*   Il workflow `.github/workflows/sara-release-gate.yml` include pre-flight per il mount di T7 e la presenza dell'orchestrator (S207).
*   Il workflow `.github/workflows/sara-release-gate.yml` sincronizza il path canonico `/Volumes/MontereyT7/FLUXION/` con il commit CI SHA (S207).
*   Il workflow `.github/workflows/sara-release-gate.yml` carica l'artifact report JSON e l'entry VOS (S207).
*   Il workflow `.github/workflows/sara-release-gate.yml` ha un timeout di 20 minuti (S207).
*   Il file `~/venture-os/docs/SETUP-SELFHOSTED-RUNNER.md` contiene una procedura di 5 passaggi per il setup del runner (S207).
*   Il `morning-briefer/briefer.py` è patchato per leggere l'ultimo entry di `sara-gate-runs.jsonl` e segnalare "Sara Gate FAIL: N verticali ko" / "INFRA_ERROR" / age >7gg (S207).
*   Il `morning-briefer/briefer.py` è stato testato post-edit e genera un brief di 26 righe (S207).
*   Il commit `149cbc0` (FLUXION) ha implementato il CI release gate completo via VOS e self-hosted runner (S207).
*   Il commit `7f32551` (VOS) ha implementato `sara-gate-orchestrator` e il brief signal Sara Gate (S207).
*   Il deploy dell'onboarding Ehiweb è stato effettuato con il commit `1a6cb51` (S202).
*   Il deploy dell'onboarding Ehiweb è verificabile su `https://e7064e1d.fluxion-landing.pages.dev/voip-guida/` con 6 keyword nuove (S202).
*   La produzione `fluxion-landing.pages.dev/voip-guida` è stata aggiornata (S202).
*   Il release gate è in stato PASS con 0 FAIL (S201).
*   La pipeline iMac e la codebase master sono sincronizzate sul commit `893f349` (S201).
*   Il `fluxion-proxy` è deployato con version ID `008dd86c-46c1-4a55-8943-32814dac1019` (S197).
*   I cron triggers per F-3 (`0 9 * * *`) e F-4 (`*/5 * * * *`) sono attivi (S197).

### Componenti e Funzionalità
*   Il file `~/venture-os/components/sara-gate-orchestrator/orchestrator.py` (231 righe) è un wrapper Python stdlib (S207).
*   `orchestrator.py` include `require_t7_or_exit` condiviso (S207).
*   `orchestrator.py` esegue il parsing dei trigger metadata env (GitHub Actions: PR num, actor, run_id, SHA / manual / cron) (S207).
*   `orchestrator.py` esegue `sara-release-gate.sh` con `SARA_GATE_ARGS` override (S207).
*   `orchestrator.py` esegue il parsing del report JSON e l'audit per-vertical su 12 verticali noti (S207).
*   `orchestrator.py` appende `state/sara-gate-runs.jsonl` con verdict, totals, latency, per_vertical {ok,warn,fail,failures} (S207).
*   `orchestrator.py` propaga l'exit code 0/1/2 (S207).
*   Il `gsd-statusline.cjs:21-47` è stato modificato per rimuovere `bridgeUsed` dal calcolo di `used` (S206).
*   Il `gsd-statusline.cjs` ora ottiene `used` sempre da stdin runtime (S206).
*   Il bridge in `gsd-statusline.cjs` è mantenuto solo per `budgetState` (badge SAFE/WARN/BLOCK) (S206).
*   Il file `voice-agent/src/whatsapp.py:37, 60-80` è stato modificato per correggere il path di `fluxion_root` a 3 livelli `.parent` (S206).
*   Il `whatsapp.py` ora include un autoresolve di `node_path` via `FLUXION_NODE_PATH` env (S206).
*   La pipeline pid 83278 e il subprocess WhatsApp pid 83319 sono RUNNING (S206).
*   Il log `/tmp/fluxion-whatsapp-service.log` è popolato con "FAQ Category salone, Auto-Responder ENABLED, Chrome path detected" (S206).
*   Il messaggio "✅ WhatsApp service avviato" è visibile in `voice-pipeline.log` riga 78 (S206).
*   Il file `landing/voip-guida/index.html` è stato corretto (S202).
*   `landing/voip-guida/index.html` ha rimosso la FAQ contraddittoria "Sara funziona senza VoIP" (S202).
*   `landing/voip-guida/index.html` ha 4 step (era 3) (S202).
*   `landing/voip-guida/index.html` ha pricing veritiero (VivaVox Free 30gg / Flat €7,95-4,95 promo) (S202).
*   `landing/voip-guida/index.html` ha una nuova FAQ "Cosa succede se Sara non è ancora pronta" (S202).
*   `landing/voip-guida/index.html` chiarisce che il mobile non è supportato (S202).
*   `src/components/setup/SetupWizard.tsx` step 6 ha una CTA prominente VivaVox Free + deep-link guida + testid E2E (S202).
*   `docs/launch/ONBOARDING-EHIWEB-CLIENTE.md` (107 righe) contiene una procedura formale CTO (S202).
*   `orchestrator.py` non resetta più `_vertical_explicitly_set=False` incondizionatamente in `start_session()` (S201).
*   `orchestrator.py` L5202 (`greet()` VoIP) resetta esplicitamente il flag (S201).
*   `availability_checker._generate_slots` non crasha più con `ValueError: time data ''` per verticali senza pausa pranzo (S201).
*   `LATENCY_TARGET_MS` è allineato da 2000ms a 5000ms (S201).
*   Il release gate completo (Tier 1+2+3) ha 0 FAIL (S201).
*   Il `release_gate.py` (circa 340 righe) è un harness Tier 1+2+3 (S200).
*   Lo `scripts/sara-release-gate.sh` (circa 95 righe) è un wrapper SSH iMac (S200).
*   La directory `docs/launch/sara-release-gate-reports/` contiene lo storico dei report JSON timestamped (S200).
*   Il Tier 1 — Core deep riusa il framework `test_sara_stress_per_verticale.py` (S200).
*   Il Tier 2 — Extended smoke include 5 verticali (barbiere, fisioterapia, gommista, odontoiatra, toelettatura) (S200).
*   Il Tier 3 — DB integrity verifica schema clienti+appuntamenti, conteggi, FK integrity, waitlist (S200).
*   I runbook `docs/launch/RUNBOOK-P1-SARA-LIVE-TEST.md` (300 righe) e `docs/launch/RUNBOOK-P2-WIN-MSI-BUILD.md` (380 righe) sono stati consegnati (S200).
*   Il `docs/launch/PRE-LAUNCH-AUDIT.md` è aggiornato (S200).
*   Il `landing/faq.html` è di qualità enterprise con 8 categorie e 24 FAQ items (S199).
*   Il `landing/faq.html` include cross-link tra Q, JSON-LD `FAQPage` schema markup SEO Google, GDPR Art. 9 dettagliato, distinzione soft-delete vs hard-delete Art. 17, SLA dichiarato, tier Pro priority (S199).
*   Il footer di `landing/faq.html` ha 3 link legali distinti (Privacy + Termini di Servizio + Termini Garanzia) (S199).
*   Il `landing/privacy.html` (22.8KB, 14 sezioni) è una riscrittura completa con Groq STT sub-processor + Sentry (S198).
*   `landing/privacy.html` distingue Titolare/Responsabile, dettaglia il flusso audio Sara, include una tabella di conservazione per 7 categorie, CF edge analytics aggregati (no cookie banner), e il diritto ODR UE (S198).
*   Il `landing/termini.html` (21.3KB, 15 sezioni) include Licenza lifetime 1 attività, garanzia commerciale 30gg distinta da recesso legale 14gg, disclaimer Sara, cambio provider AI consentito, foro Potenza, diritto italiano (S198).
*   Il footer di `landing/index.html` è aggiornato con il link a `termini.html` (S198).
*   L'API admin `POST /admin/health/run-now` ritorna HTTP 200 con `ok:true` e 3 checks `up` (S198).
*   L'API admin `POST /admin/email-sequence/preview {email,tier:"base",step:1}` ritorna HTTP 200 con `sent:true` e `resend_id` (S198).
*   Il `docs/launch/PRE-LAUNCH-AUDIT.md` è stato creato (S197).
*   Il file `scripts/setup-piper.js` è stato rimosso (S197).
*   L'entry `"setup:piper": "node scripts/setup-piper.js"` è stata rimossa da `package.json` (S197).
*   Il bundle PyInstaller sidecar (208MB) è stato validato E2E HTTP `/api/voice/say` (S196).
*   Il bundle include `models/tts/it_IT-paola-medium.onnx` (58MB), `models/tts/it_IT-paola-medium.onnx.json`, `piper/espeak-ng-data/it_dict` (95KB), `piper/espeakbridge.so`, e moduli PYZ (S196).
*   Il sidecar è standalone e avviabile con `dist/voice-agent --port 3099 --host 127.0.0.1` (S196).
*   Il log conferma `[TTSEngineSelector] PiperTTSEngine selected (fast mode)` e `PiperTTS: Python API voice loaded` (S196).
*   `POST /api/voice/say` ritorna `success=true` e `audio_base64` con header `RIFF...WAVEfmt` valido (S196).
*   Il bundle è copiato in `src-tauri/binaries/voice-agent-x86_64-apple-darwin` (S196).
*   Il file `docs/perf/D3-voice-latency.md` è aggiornato con la sezione "S196 RESULT" (S196).

### Performance
*   La latency aggregata del release gate è P50=993ms, Slow-ratio=17%, P95=10177ms (WARN-only) (S201).
*   Il Gate 3 D-1 SQLite ha 8/8 query PASS (Q1-list P95 24.5ms vs SLO 50ms) (S197).
*   Il Gate 3 D-2 IPC `get_clienti` ha P95 36.9ms vs SLO 100ms (margine -63%) (S197).
*   Il Gate 3 D-3 Voice TTS Piper sidecar ha P95 **404ms** vs SLO 800ms (margine -49.5%) (S197, S196).
*   Il bench latency di 10 frasi production-realistic ha P50=278.0 ms, P95=404.1 ms, P99/MAX=404.1 ms, MIN=209.7 ms, AVG=296.4 ms, STDEV=73.6 ms (S196).

### Audit e Conformità
*   L'entry `deploy-s207` è presente in `~/venture-os/state/blueprint-deviations.jsonl` (S207).
*   Sono presenti 3 entry in `~/venture-os/state/blueprint-deviations.jsonl` per `statusline-bridge-stale-override`, `whatsapp-autostart-silent-noop-s205-p5`, `whatsapp-node-path-default-node-fails-under-nohup-ssh` (S206).
*   Il `docs/launch/PRE-LAUNCH-AUDIT.md` è stato creato e include 6 categorie CTO checklist (S197).
*   La categoria Security è PASS post-rotate (S197).
*   La categoria Performance è PASS PRO (S197).
*   La categoria Compliance è PARTIAL (S197).
*   La categoria Customer Success è PARTIAL (S197).
*   Il Gate 3 è COMPLETO BLINDATO (S196).
*   F-1, F-2, F-3 (CODE COMPLETE), F-4 (CODE COMPLETE) sono ✅ (S196).
*   D-1, D-2 (P95 36.9ms), D-3 (P95 404ms vs SLO 800ms) sono ✅ PASS PRO (S196).

### Sicurezza
*   `ADMIN_API_SECRET` è stato ruotato e propagato a 3 location (MacBook `.env`, iMac `.env`, CF Worker `fluxion-proxy`) (S198).
*   La procedura di rotazione del secret è stata eseguita in modo zero-leak (S198).

## Decisioni chiuse
*   CI release gate full via VOS + self-hosted runner su MacBook è stato implementato. (S207)
*   Il self-hosted GitHub Actions runner è configurato per eseguire il componente VOS orchestrator, che a sua volta chiama `scripts/sara-release-gate.sh` via SSH su iMac. (S207)
*   Il file `~/venture-os/components/sara-gate-orchestrator/orchestrator.py` è stato creato per gestire il gate di rilascio. (S207)
*   Il workflow `.github/workflows/sara-release-gate.yml` è stato configurato per l'esecuzione del gate di rilascio. (S207)
*   La procedura di setup per il self-hosted runner è documentata in `~/venture-os/docs/SETUP-SELFHOSTED-RUNNER.md`. (S207)
*   Il `morning-briefer/briefer.py` è stato patchato per leggere lo stato del Sara Gate. (S207)
*   Il bug dello statusline FLUXION che mostrava un falso SAFE è stato risolto rimuovendo `bridgeUsed` dal calcolo di `used`. (S206)
*   Il bug di autostart di WhatsApp è stato risolto correggendo il path di `fluxion_root` e gestendo il buffering di `print()`. (S206)
*   Il bug annidato `node_path` sotto `nohup` ssh è stato risolto con un autoresolve via `FLUXION_NODE_PATH` env. (S206)
*   Sara è stata definita come inbound-only via VoIP (SIP trunk Ehiweb), non via microfono PC cliente. (S202)
*   La guida VoIP `landing/voip-guida/index.html` è stata corretta e allineata. (S202)
*   Il `SetupWizard.tsx` è stato aggiornato con una CTA per VivaVox Free. (S202)
*   La procedura formale CTO per l'onboarding Ehiweb è documentata in `docs/launch/ONBOARDING-EHIWEB-CLIENTE.md`. (S202)
*   Il trial Ehiweb di 30 giorni è stato allineato al trial Sara di 30 giorni, garantendo zero costi iniziali per il cliente. (S202)
*   I bug dei guardrail NLU di Sara sono stati risolti rimuovendo il reset incondizionato di `_vertical_explicitly_set` in `start_session()`. (S201)
*   Il crash di `availability_checker._generate_slots` per verticali senza pausa pranzo è stato risolto con un fix difensivo. (S201)
*   Il `LATENCY_TARGET_MS` per il gate è stato allineato da 2000ms a 5000ms. (S201)
*   Il release gate multi-verticale è stato automatizzato con `release_gate.py` e `sara-release-gate.sh`. (S200)
*   I runbook `RUNBOOK-P1-SARA-LIVE-TEST.md` e `RUNBOOK-P2-WIN-MSI-BUILD.md` sono stati consegnati. (S200)
*   La FAQ pubblica `landing/faq.html` è stata valutata come enterprise-grade e il footer è stato allineato con i link legali. (S199)
*   La direttiva "No Co-Authored-By trailer" è stata implementata per tutti i commit futuri. (S198)
*   Le pagine `landing/privacy.html` e `landing/termini.html` sono state riscritte per essere conformi al GDPR e pubblicate. (S198)
*   Il footer di `landing/index.html` è stato aggiornato con il link ai Termini di Servizio. (S198)
*   Il fix di autenticazione per gli admin endpoints (`ADMIN_API_SECRET`) è stato implementato e verificato. (S198)
*   I Cloudflare API tokens sono stati ruotati in S189-B e la procedura di storage è stata definita. (S197)
*   Il deploy dei Cloudflare Workers F-3 (email sequence) e F-4 (health monitor) è stato eseguito. (S197)
*   Il file `docs/launch/PRE-LAUNCH-AUDIT.md` è stato creato per aggregare lo stato di readiness del Gate 3. (S197)
*   Lo script `scripts/setup-piper.js` e la sua entry in `package.json` sono stati rimossi. (S197)
*   Il bundle PyInstaller sidecar (199MB) per Piper TTS è stato validato E2E e la sua latenza P95 è di 404ms. (S196)
*   Il bundle PyInstaller sidecar è stato copiato in `src-tauri/binaries/voice-agent-x86_64-apple-darwin` per il packaging Tauri. (S196)
*   Il file `docs/perf/D3-voice-latency.md` è stato aggiornato con i risultati del benchmark S196. (S196)

## Blocker aperti

*   **SPOF MacBook**: il runner self-hosted su MacBook è un Single Point Of Failure; se spento o in sleep, la CI resta pending. (S207)
*   **Drift 60gg**: GitHub deprecata runner vecchio; la versione `2.319.1` fissata richiede un bump manuale ogni ~3 mesi. (S207)
*   **Checkout race**: il workflow checkout in `_work/` ma il gate usa il path canonico T7; un commit master parallelo a una PR può falsare lo SHA. (S207)
*   **Sovradimensionamento**: ogni PR richiede 12 minuti per l'esecuzione del gate completo. (S207)
*   **PSTN stress test**: il founder deve ripetere lo stress test PSTN S205 per validare che i bug BUG-006/007/015/017 siano risolti e che il gate atteso sia 0 bug P0/HIGH. (S206)
*   **RUNBOOK-P2 Win MSI build**: il founder deve eseguire il RUNBOOK-P2 per la build MSI di Windows, che è una priorità P0 per l'80% del mercato IT. (S206)
*   **RUNBOOK-P1 Sara live audio**: il founder deve eseguire il RUNBOOK-P1 per il test live audio di Sara con 5 scenari. (S203)
*   **Validare timeline attivazione VivaVox Free**: è una open question la timeline di attivazione reale di VivaVox Free. (S203)
*   **Universal Binary arm64 + Linux Piper bundle**: la creazione di un Universal Binary arm64 e di un bundle Linux Piper è un'attività differita. (S206)
*   **Pipeline launcher `python -u`**: aggiungere `python -u` permanente nello script di restart della pipeline per evitare il buffering dei print(). (S206)
*   **Investigare slow-ratio 17%**: investigare lo slow-ratio del 17% dei sample > 5000ms (target <10%), quasi tutto dovuto al cold-start del primo turno di ogni verticale. (S201)
*   **DPA Groq formale**: valutare la necessità di un DPA Groq formale se le chiamate Sara reali superano la soglia del free tier. (S200)

## Prossimi passi

*   PRIORITY 1 founder fisico iMac (~60 min): ripetere S205 PSTN stress test (S207)
*   PRIORITY 2 founder Windows (~3h): RUNBOOK-P2 Win MSI build (P0 ~80% mercato IT) (S207)
*   PRIORITY 4 deferred: RUNBOOK-P1 Sara live audio (test fisico iMac mic — solo se P3 mostra regressioni audio) (S207)
*   PRIORITY 4 deferred: Validare timeline attivazione VivaVox Free (open question #1 doc Ehiweb) (S207)
*   PRIORITY 4 deferred: Universal Binary arm64 + Linux Piper bundle (S207)
*   PRIORITY 4 deferred: Pipeline launcher: aggiungere `python -u` permanente in script restart per evitare buffer di print() (lesson S206) (S207)
