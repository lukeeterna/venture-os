# BLUEPRINT-JD — Venture OS personale di Luke

> **Versione 3.5 — patch CTO post-AUDIT Task B (7 maggio 2026)**
> Sostituisce v0/v1/v2/v3.0/v3.1/v3.2/v3.2.1/v3.3/v3.4.
> Modifiche v3.4 (preservate): (1) fix sintassi Mole reale + shell cleanup, (2) routing.yaml bootstrap-seed non config eterna, (3) disk-keeper whitelist senza Xcode/Indexes, (4) piano costruzione MVP 2 sessioni + Validation Window 7-14gg + 4 sessioni Fase C, (5) Big Sur exit strategy documentale, (6) PRAGMA busy_timeout per lock contention SQLite progetti.
> Modifiche v3.5 (questo giro): (a) Mole sintassi corretta `mo analyze -json` Go-style single-dash (era `--json` doppio-dash, errato), (b) OpenRouter ID fix sez 6.2: `qwen/qwen3-coder:free` (no `-480b`) + `nvidia/nemotron-nano-12b-v2-vl:free` (con `-v2-`), (c) SSH iMac canonico via alias `ssh imac` (non `imac.local`, mDNS non risolve sulla LAN di Luke), (d) handoff-debt-tracker con config per-progetto YAML (ARGOS usa `agent-memory/`/`memory/`/`prompts/s*.md` non-standard), (e) Fase B Validation Window con AC misurabili: schema `state/brief-actions.jsonl` + tabella decisionale go/no-go basata su contatori `source_match`/`brief_read`.
> **Destinatario**: Claude Code per implementazione su Mac di Luke.
> **Lingua**: italiano per i contenuti, inglese solo per termini tecnici, nomi file, comandi shell.
> **Vincolo invariante**: zero costo aggiuntivo oltre €240/mese di Claude Code, target sotto €15/mese di costi LLM, soglia hard €30/mese.

---

## Indice

1. Cosa risolve il Venture OS JD
2. Cosa NON risolve
3. Architettura tecnica
4. Stage venture pipeline
5. Layer di proattività
6. Layer multi-LLM federato
7. Layer manutenzione HW/SW autonoma
8. Layer memoria persistente
9. Adattabilità, scalabilità, flessibilità
10. Costo previsto
11. Piano di costruzione (6 sessioni)
12. Cosa Luke deve fornire
13. Anti-pattern
13bis. Protocollo Blocker Operativo (PBO) — vincolante per CC
14. Evoluzione futura
15. Appendice — 20 famiglie di componenti concreti

---

## 1. Cosa risolve il Venture OS JD

Il problema reale di Luke è strutturale: 12 mesi di costruzione, revenue zero, decisioni strategiche ignorate per mesi, energia dispersa, niente sistema che osservi il portfolio dall'alto. Caso recente S159 di ARGOS (paddlepaddle 3.0 + macOS 11 Big Sur, blocker prevedibile non anticipato, sessione chiusa "PARTIAL", Day 1 reale Stile Car ancora bloccato): è il pattern strutturale del problema, non un episodio.

Il Venture OS JD risolve quattro problemi specifici:

**Linearità forzata idea → produzione → mercati**. Ogni venture ha stage canonici da chiudere in ordine. Massimo 3 venture attive contemporaneamente. Quarta idea = il sistema chiede quale chiudere. Disciplina che Luke da solo non si dà.

**Proattività data-driven**. Ogni mattina il sistema legge i DB di ARGOS/FLUXION/Guardian (scoperti a runtime), l'INBOX idee, i costi LLM, lo stato dei dischi, i token in scadenza. Quando Luke apre Claude Code: *"Buongiorno. Oggi devi decidere X, raccomando Y, fonti Z, rischi W. Approvi?"*

**Anti-Scarico-Decisioni**. Niente tabelle A/B/C/D senza raccomandazione. Niente "rischio ZERO" senza giustificazione. Ogni decisione ha contesto, opzioni, fonti, raccomandazione motivata, rischi specifici. Validato dal `decision-template` a 2 livelli (strategic hard / operational soft).

**Manutenzione autonoma reale, basata su fatti osservabili**. iMac 2012 server sempre acceso e MacBook con SSD interno al 93% richiedono vigilanza continua. Sistema osserva via API ufficiali e tool standard, propone ottimizzazioni nel brief, esegue solo dopo approvazione dove c'è rischio, esegue automaticamente solo cleanup whitelist-ato. **Niente euristiche fragili: tutto si appoggia su comandi che esistono e ritornano dati strutturati JSON.**

Il VOS è agnostico ai progetti specifici. Whitelist iniziale 3 progetti (ARGOS, FLUXION, Guardian); quarto va aggiunto esplicitamente.

---

## 2. Cosa NON risolve

- Non vende ARGOS o FLUXION oggi (quei progetti hanno il loro flusso commerciale separato)
- Non fa contabilità o gestione fiscale (resta al commercialista)
- Non ricicla, nasconde, evade flussi finanziari (scope chiuso)
- Non fa community management interattivo (pubblica via API ufficiali, fine)
- Non sostituisce Claude Code come IDE (vive dentro e a fianco)
- Non automatizza decisioni che richiedono giudizio umano irriducibile

---

## 3. Architettura tecnica

Architettura a 7 layer orizzontali con interfacce esplicite via config.

```
┌─ Layer 1 — UI ──────────────────────────────────────────────┐
│ Claude Code interattivo + Streamlit dashboard read-only     │
└──────────────────────────┬──────────────────────────────────┘
┌─ Layer 2 — Orchestration ───────────────────────────────────┐
│ Claude Agent SDK (subagents specializzati)                  │
│ launchd LaunchAgents per scheduled tasks                    │
└──────────────────────────┬──────────────────────────────────┘
┌─ Layer 3 — Decision Discipline ─────────────────────────────┐
│ decision-template a 2 livelli (strategic hard / op soft)    │
│ Anti-Scarico-Decisioni come hard rule                       │
└──────────────────────────┬──────────────────────────────────┘
┌─ Layer 4 — Memory & Pipeline ───────────────────────────────┐
│ Karpathy LLM Wiki (L1 CLAUDE.md / L2 wiki/ markdown puro)   │
│ pipeline-runner con stage gates forced-closure              │
└──────────────────────────┬──────────────────────────────────┘
┌─ Layer 5 — LLM Routing federato ────────────────────────────┐
│ Router Python sopra LiteLLM SDK                             │
│ 4 gateway: OpenRouter / free-gpu-api / Claude Code / Locale │
│ routing.yaml + auto-discovery quotidiano + cost-tracker     │
└──────────────────────────┬──────────────────────────────────┘
┌─ Layer 6 — Maintenance & Observability ─────────────────────┐
│ host-monitor (psutil + macOS native, MacBook+iMac)          │
│ disk-keeper (Mole + whitelist a inclusione)                 │
│ session-health (wrapper su /context, /usage, pip --dry-run) │
│ launchd-orchestrator + token-watcher                        │
└──────────────────────────┬──────────────────────────────────┘
┌─ Layer 7 — External Bridges ────────────────────────────────┐
│ project-scanner / research-bridge / social-publisher        │
│ payment-bridge / backup-orchestrator                        │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Quattro principi architetturali invarianti

**Project discovery a runtime, mai hardcoded**. Lo `project-scanner` scopre i progetti via marker convenzionali nei path della whitelist (`config/projects-whitelist.yaml`). Whitelist iniziale: ARGOS, FLUXION, Guardian. Quarto progetto va aggiunto esplicitamente da Luke al file YAML.

**Federazione 4 gateway, niente vendor lock-in**. Router parla con OpenRouter (290+ modelli text/vision/uncensored), free-gpu-api skill globale (Colab T4 GPU per image/TTS/STT/OCR), Claude Code subscription (reasoning critico, costo marginale 0), locale macOS (deterministico, no LLM).

**Markdown puro come substrato di stato**. Tutto lo stato persistente è file Markdown + qualche `.jsonl` per log strutturati + `.yaml` per config. Niente vector DB, niente PostgreSQL, niente Redis. Pattern Karpathy LLM Wiki + L1/L2 cache.

**Storage primario su T7 con disconnect handling**. SSD MacBook al 93% (verificato dalla review CC) impone storage sul T7: `/Volumes/MontereyT7/venture-os/` con symlink `~/venture-os` per ergonomia. Ogni componente verifica all'avvio `os.path.ismount('/Volumes/MontereyT7')` — se falso rifiuta di partire, logga warning su `~/.venture-os-disconnected.log` (fallback minimal su SSD interno, ~10KB). Backup giornaliero del wiki+config su HD esterno iMac via rsync.

### 3.2 Comunicazione MacBook ↔ iMac

Verifica al primo setup quale canale è già attivo. Default raccomandato: SSH classico (`ssh imac` — alias in `~/.ssh/config` su MacBook Luke che risolve a `192.168.1.2`, IdentityFile `id_ed25519` — con chiave pubblica già scambiata, niente password. NB: Bonjour/mDNS `imac.local` non risolve sul MacBook di Luke, alias obbligatorio). Tailscale come opzione se Luke vuole accesso da fuori casa. **Niente daemon esterni** sull'iMac che apra porte: il MacBook chiama l'iMac on-demand via SSH, l'iMac esegue il comando Python e ritorna JSON via stdout. Stateless, robusto, zero superficie di attacco.

### 3.3 Installation scope: GLOBALE Claude Code, non project-scoped

**Vincolo strutturale invariante**: il Venture OS è un sistema **trasversale** ai progetti di Luke (ARGOS, FLUXION, Guardian, futuri). Quindi tutti i pezzi che dipendono da Claude Code (skill, sub-agents, CLAUDE.md root del VOS, statusline, hook) vivono in `~/.claude/` (configurazione globale CC), **non dentro un singolo progetto**.

Errore da non commettere (caso reale: prima implementazione VOS è stata fatta dentro la sessione CC di FLUXION, finendo i file in `<FLUXION>/.claude/`. Ovvio risultato: ARGOS e Guardian non vedevano nulla del VOS).

**Mappa degli scope**:

| Elemento VOS | Path corretto | Motivo |
|---|---|---|
| CLAUDE.md root del VOS | `~/.claude/CLAUDE.md` | Auto-loaded da CC in qualunque progetto |
| Skill VOS (es. `wiki-curator`, `brief-narrator`) | `~/.claude/skills/<name>/` | Disponibili da qualunque sessione CC |
| Sub-agents VOS | `~/.claude/agents/<name>.md` | Idem |
| Statusline (per `context-monitor` di session-health) | `~/.claude/statusline.sh` | Mostra stato globale, non per-progetto |
| `~/.claude/settings.json` | `~/.claude/settings.json` | Config globale CC |
| LaunchAgents | `~/Library/LaunchAgents/` | Sempre globali macOS |
| Storage operativo VOS (wiki, brief, state, components) | `/Volumes/MontereyT7/venture-os/` | Già globale per design |
| `routing.yaml`, `disk-keeper-include.yaml`, ecc. | `/Volumes/MontereyT7/venture-os/config/` | Idem |

**Rapporto VOS ↔ progetti**: ogni progetto (ARGOS, FLUXION, Guardian) mantiene il suo `<progetto>/.claude/` con skill/agents specifici di quel progetto (es. CoVe Engine, persona Luca Ferretti per ARGOS). Il VOS globale **non sostituisce** quei file — coesiste. CC al lancio in una cartella di progetto fonde `~/.claude/` (globale, VOS) con `<progetto>/.claude/` (specifico). Pattern standard CC, documentato.

**Vincolo per CC durante implementazione**: ogni volta che CC sta per creare un file `.claude/...` deve verificare il path. Se path proposto contiene un nome di progetto (es. `~/Documents/FLUXION/.claude/skills/wiki-curator/`) → STOP, è errore di scope, riposiziona in `~/.claude/skills/wiki-curator/`. Eccezione: se la skill è specifica di quel progetto (non del VOS), allora resta project-scoped. Discriminante: serve a tutti i progetti? globale. Serve a uno solo? project-scoped.

**Recovery se errore già fatto**: se il VOS è stato installato dentro un progetto per errore, fix in <10 minuti via `mv` dei file da `<progetto>/.claude/` a `~/.claude/` + `git rm` dal repository del progetto. Non è errore irrecuperabile.

---

## 4. Stage venture pipeline

7 stage canonici. Ogni stage ha file `stage-N-NAME.md` per progetto. File `approved.md` come gate.

```
~/venture-os/projects/<NAME>/pipeline/
├── stage-1-idea-intake.md
├── stage-2-market-intel.md
├── stage-3-venture-definition.md
├── stage-4-stack-and-build.md
├── stage-5-legal-tax-prep.md
├── stage-6-gtm-launch.md
└── stage-7-post-launch-review.md
```

**Stage 1 — Idea intake**. Luke (o `inbox-ideas.md`) scrive idea in 200-500 parole. Sistema applica `idea-screen.md`: problema, target, ipotesi valore, perché Luke specificamente, ipotesi prezzo, timing. Output: promossa o archiviata in `wiki/decisions/archived-ideas/`.

**Stage 2 — Market intel**. Sistema usa `research-bridge`: KB locale (memorie progetti) → web search nativo → link cliccabile Perplexity precompilato → link cliccabile NotebookLM precompilato. Output: `market-intel.md` con dimensione mercato, competitor, gap, prezzo medio, fonti citate. Se dati insufficienti: `inconclusive: needs more research`.

**Stage 3 — Venture definition**. Nome interno, brand user-facing, persona target, jobs-to-be-done, prezzo, modello, unit economics. Output: `venture-definition.md` + `approved.md`.

**Stage 4 — Stack e build**. Decisione stack motivata, scaffold repo, milestone, primo MVP. Sistema invoca CC con prompt strutturato che include `venture-definition.md` come contesto vincolato. **Pre-flight env check obbligatorio prima di install di dipendenze pesanti** (vedi 7.6).

**Stage 5 — Legal/tax prep**. Vincoli legali italiani, forma giuridica, IVA, contratti, GDPR. Output: `legal-checklist.md` con campi che il commercialista/legale deve riempire. Stage non si chiude finché Luke non conferma "ho parlato con commercialista, risposte sono X/Y/Z".

**Stage 6 — GTM e launch**. Channel mix, calendario primi 30 giorni, metriche numeriche e dicotomiche.

**Stage 7 — Post-launch review**. A 30/60/90 giorni: metriche raggiunte vs attese, conversione, feedback. Decisione: double down / pivot / shut down.

**Vincolo numerico duro**: massimo 3 progetti attivi contemporaneamente. Quarto = sistema chiede quale chiudere o parcheggiare.

---

## 5. Layer di proattività

**Ciclo giornaliero — brief mattutino**. LaunchAgent `com.luke.ventureos.morning-brief.plist` parte alle 7:00:

1. `project-scanner discover` aggiorna inventario
2. Per ogni progetto: legge DB principale, conta stato (lead aperti, task pending, ultime esecuzioni)
3. Legge `inbox-ideas.md` e `wiki/decisions/open/`
4. Legge `costs.jsonl` ultimo giorno
5. Esegue `host-monitor probe` su MacBook + via SSH su iMac
6. Esegue `token-watcher status` (OAuth in scadenza nei prossimi 14gg)
7. Esegue `session-health summary` (handoff debt per progetto, stato preflight cache)
8. Aggrega in `briefs/morning-brief-YYYY-MM-DD.md`

Alle 7:30 brief pronto. Quando Luke apre CC e dice "buongiorno", sub-agent `brief-narrator` (system prompt italiano scarno) legge interattivamente: priorità giorno (max 5), decisione che richiede attenzione (raccomandazione + fonti + rischi), warning se ci sono.

**Ciclo settimanale — review portfolio**. Lunedì 8:00: `weekly-review.md` con stato 3 progetti attivi, gap milestone, suggerimenti prioritizzazione. Stage bloccato >14gg senza progresso → segnalato.

**Ciclo eventi — reattivo**:
- Disco oltre 90% → alert al prossimo CC, proposta cleanup `disk-keeper --dry-run`
- Token OAuth scaduto durante esecuzione → log fail in `pending-posts/`, riprova dopo refresh
- Soglia costi mensile LLM superata → blocca paid models, scivola tutto su free, alert
- DB progetto corrotto → log italiano, brief con diagnostica e proposta restore da backup

---

## 6. Layer multi-LLM federato

### 6.1 Quattro gateway

**Gateway 1 — OpenRouter** (account già attivo, key nei `.env`). 290+ modelli via API OpenAI-compatibile.

**Gateway 2 — free-gpu-api** in `~/.claude/skills/free-gpu-api/` (skill globale riusato). Pattern Colab T4 + ngrok + HF. Image/TTS/STT/OCR offline/translate. Keepalive automatizzato (ping ogni 60min, auto-restart, refresh ngrok URL al `routing.yaml`).

**Gateway 3 — Claude Code subscription** (€240/mese). Reasoning critico, costo marginale 0.

**Gateway 4 — Locale macOS** (no LLM). Regex, parse JSON/YAML, lookup, calcoli, format conversion.

### 6.2 Router e routing.yaml

`LLM Router` modulo Python ~80 righe sopra LiteLLM SDK. Riceve task tipizzato, decide gateway+modello via `routing.yaml`. Pseudocodice già ampiamente noto, file generato in Sessione 3 secondo schema standard.

**Nota v3.4 — bootstrap seed**: i modelli ID hardcoded sotto sono **bootstrap seed verificato al 7/5/2026**, non config eterna. Servono al primo run del sistema, prima che `routing-refresh` (sezione 6.3) gira la prima notte e aggiorna il file con il catalogo OpenRouter live. Modelli OpenRouter cambiano settimanalmente — il drift è gestito strutturalmente da `routing-refresh`, non da te che modifichi a mano. Se al primo run un modello ID non esiste più, LiteLLM ritorna errore noto, il router scivola al fallback successivo, `routing-refresh` notturno lo segnala e propone update.

```yaml
reasoning_critical:
  primary: {gateway: claude_code, model: claude-opus-4-7}
  fallbacks:
    - {gateway: openrouter, model: anthropic/claude-sonnet-4-6}
    - {gateway: openrouter, model: openai/gpt-oss-120b:free}     # 117B MoE, frontier reasoning open-weight, free
    - {gateway: openrouter, model: deepseek/deepseek-r1-0528}

volume:
  primary: {gateway: openrouter, model: deepseek/deepseek-v3.2}
  fallbacks:
    - {gateway: openrouter, model: qwen/qwen3-next-80b-a3b-instruct:free}  # 262K ctx, instruct stabile
    - {gateway: openrouter, model: meta-llama/llama-3.3-70b-instruct:free}
    - {gateway: openrouter, model: z-ai/glm-4.5-air:free}        # hybrid thinking, 131K

uncensored:
  primary: {gateway: openrouter, model: cognitivecomputations/dolphin-mistral-24b-venice-edition:free}
  fallbacks:
    - {gateway: openrouter, model: nousresearch/hermes-3-llama-3.1-405b:free}  # ora è free su OR

code:
  primary: {gateway: openrouter, model: qwen/qwen3-coder:free}
  fallbacks:
    - {gateway: openrouter, model: deepseek/deepseek-coder-v3}
    - {gateway: openrouter, model: openai/gpt-oss-120b:free}     # ottimo coding free fallback

long_context:
  primary: {gateway: openrouter, model: google/gemini-2.5-pro}    # 1M context, paid ma low cost
  fallbacks:
    - {gateway: openrouter, model: qwen/qwen3-next-80b-a3b-instruct:free}  # 262K free
    - {gateway: openrouter, model: qwen/qwen3-coder:free}    # 262K free

vision_ocr:
  primary: {gateway: openrouter, model: nvidia/nemotron-nano-12b-v2-vl:free}   # leader OCRBench v2, free
  fallbacks:
    - {gateway: openrouter, model: qwen/qwen3-vl-235b-thinking:free}
    - {gateway: openrouter, model: qwen/qwen2.5-vl-72b-instruct:free}

ocr_local:
  primary:
    gateway: free_gpu_api
    model: PaddlePaddle/PaddleOCR-v4
    notebook: ~/.claude/skills/free-gpu-api/notebooks/paddleocr.ipynb
  fallbacks:
    - {gateway: openrouter, model: nvidia/nemotron-nano-12b-v2-vl:free}        # cloud free, no install (anti-S159)
    - {gateway: openrouter, model: qwen/qwen3-vl-235b-thinking:free}

image_gen:
  primary:
    gateway: free_gpu_api
    model: black-forest-labs/FLUX.1-schnell
    notebook: ~/.claude/skills/free-gpu-api/notebooks/flux_schnell.ipynb

tts_it:
  primary:
    gateway: free_gpu_api
    model: coqui/XTTS-v2
    notebook: ~/.claude/skills/free-gpu-api/notebooks/xtts_it.ipynb

stt:
  primary:
    gateway: free_gpu_api
    model: openai/whisper-large-v3
    notebook: ~/.claude/skills/free-gpu-api/notebooks/whisper.ipynb

translate:
  primary:
    gateway: free_gpu_api
    model: facebook/nllb-200-3.3B

factual_research:
  primary: {gateway: openrouter, model: perplexity/sonar-pro}
  fallbacks:
    - {gateway: openrouter, model: perplexity/sonar}
```

### 6.3 Auto-aggiornamento routing

LaunchAgent notturno `routing-refresh` (4:00):

1. `GET https://openrouter.ai/api/v1/models` → diff vs catalogo precedente
2. Per ogni notebook free-gpu-api: ping ngrok endpoint
3. Aggregato 429 rate-limit hit della giornata precedente
4. Aggregato `costs.jsonl` del giorno

Tutte le proposte di update finiscono nel brief mattutino in italiano con raccomandazione motivata. **Mai sostituzioni automatiche**.

### 6.4 Tracking costi

Ogni chiamata logga `state/costs.jsonl`:
```json
{"ts":"2026-05-07T08:30:12Z","task":"volume","gateway":"openrouter","model":"deepseek/deepseek-v3.2","prompt_tokens":1240,"completion_tokens":320,"cost_eur":0.0011,"caller":"morning_brief","duration_ms":1450}
```

`cost-tracker` aggrega: oggi, mese-corrente, top 5 task, top 5 modelli. Soglia €30/mese: all'80% (€24) alert con raccomandazione di shift su free, al 100% blocca paid non essenziali e scivola su free tier.

**Override manuale**: `cost-tracker unblock --task <task> --reason "<motivo>"` permette override singolo task con motivo loggato. Niente blocco totale: solo paid → free fallback automatico.

---

## 7. Layer manutenzione HW/SW autonoma

### 7.1 host-monitor unificato

Decisione di review CC C2+C13: Glances con flag `--enable-mcp-server` non esiste nel software reale (errore mio nella ricerca v3.0). Sostituito con `host-monitor` Python ~80 righe sopra `psutil` + subprocess macOS native (`smartctl`, `pmset`, `ioreg`, `df`, `vm_stat`).

Funziona identico su MacBook (locale) e iMac (chiamato da MacBook via `ssh imac "python3 ~/venture-os/components/host-monitor/probe.py"` — alias `~/.ssh/config`, NON `imac.local` perché mDNS non risolve sulla LAN di Luke). Stateless, zero daemon, zero porte aperte.

Output `host-monitor probe`:
```json
{
  "host": "MacBook-Luke",
  "ts": "2026-05-07T08:30:12Z",
  "macos_version": "11.7.10",
  "cpu_percent": 23.4,
  "ram_percent": 67.2,
  "ram_pressure": "normal",
  "disks": [
    {"mountpoint": "/", "percent": 93.0, "free_gb": 24.5},
    {"mountpoint": "/Volumes/MontereyT7", "percent": 28.5, "free_gb": 712.3}
  ],
  "battery": {"plugged": true, "percent": 100},
  "thermal_pressure": "nominal",
  "processes_top5": [...]
}
```

Chiamato da: `morning-briefer`, LaunchAgent ogni 60min (storico in `state/host-monitor.jsonl`), `disk-keeper` prima di proporre cleanup, `session-health` prima di sessioni CC pesanti.

### 7.2 Software monitoring

Quotidiano:
- Versioni Python/Node/uv installate, segnala major version updates
- Dipendenze Python progetti via `pip list --outdated` (mai aggiornate auto, solo proposte)
- Vulnerabilità note via `pip-audit`
- Dimensione log directories
- Integrità file critici (CLAUDE.md, routing.yaml, env files con hash MD5 baselined)

### 7.3 Spazio disco automatizzato

Quattro dischi monitorati. Soglie:

| Disco | Path | Warning | Critica |
|---|---|---|---|
| SSD interno MacBook | `/` | 80% | 90% |
| Samsung T7 USB | `/Volumes/MontereyT7` | 75% | 88% |
| SSD interno iMac | `/` (sull'iMac) | 80% | 90% |
| HD esterno USB iMac | `/Volumes/<nome>` | 70% | 85% |

`disk-keeper` wrapper su Mole con **whitelist a inclusione chiusa** e **sintassi Mole reale verificata 7/5/2026** (fix v3.4: `mo analyze -json <path>` esiste, `mo clean --scope` NON esiste). Approccio hybrid:

1. **Fase analisi**: `mo analyze -json <path>` ritorna JSON strutturato per ogni path della whitelist (ufficiale, supportato, output parsabile)
2. **Fase cleanup**: shell standard `du -sh` + `rm -rf` controllato sui path approvati (Mole `mo clean` è interattivo per categoria, non per path, incompatibile con whitelist a inclusione)
3. **Mole resta installato** per uso interattivo manuale di Luke (`mo` apre menu cleanup completo se vuole)

Whitelist `config/disk-keeper-include.yaml` (ridotta v3.4: rimosso `Xcode/Indexes` perché causa rebuild 30min next session, mantenuti solo path veramente safe-to-clean):

```yaml
# config/disk-keeper-include.yaml
safe_to_clean:
  - ~/Library/Developer/Xcode/DerivedData      # build artifacts, rebuild ~5min se serve
  - ~/Library/Caches/Homebrew                   # downloadable
  - ~/Library/Caches/pip                        # ricreato al volo
  - ~/Library/Caches/uv                         # ricreato al volo
  - ~/.npm/_cacache                             # ricreato al volo
  - ~/.cargo/registry/cache                     # ricreato al volo
  - ~/.Trash                                    # già "cestino"

# Esclusi esplicitamente (causano user-pain):
# - ~/Library/Caches/com.apple.dt.Xcode/Indexes (rebuild lento)
# - ~/Library/Developer/CoreSimulator/Caches    (riconfigurazione simulatori)
```

Esecuzione:
1. Per ogni path della whitelist: `mo analyze -json <path>` → parsing JSON → totale dimensione + lista large_files
2. Aggregato proposto a Luke in italiano: *"l'SSD MacBook è al 93%. Posso liberare 28GB rimuovendo: Xcode DerivedData (18GB), Homebrew cache (6GB), pip+uv cache (4GB). Approvi?"*
3. Solo dopo approvazione esplicita: shell standard `rm -rf <path>/*` su ogni path approvato (path-by-path, conferma se >5GB)
4. Audit log `state/disk-keeper-log.jsonl` con before/after sizes via `du -sh`

Aggiungere path alla whitelist = modifica esplicita YAML, mai espansione automatica. `disk-keeper` rifiuta esecuzioni su path non in whitelist anche se richiesto da CC.

### 7.4 Politiche di allocazione tra dischi

Sistema **propone** spostamenti, mai esegue automaticamente:
- File >100MB con ultimo accesso >90gg → archive su HD esterno iMac
- Video FLUXION renderizzati e già pubblicati → archive su HD esterno + symlink
- Build artifacts progetti chiusi → cancellazione dopo backup verificato
- DB SQLite/DuckDB → snapshot incrementali su T7, copia mensile su HD esterno

### 7.5 Backup orchestrato

`backup-orchestrator` rsync incrementale schedulato:
- DB principali progetti: snapshot quotidiano locale, copia mensile HD esterno
- Wiki Karpathy + brief storici: snapshot quotidiano, copia settimanale
- Config critici (routing.yaml, .env, plist): snapshot ad ogni modifica via post-commit git hook
- **VOS stesso (T7)**: backup giornaliero del solo `wiki/` e `config/` su HD esterno iMac (resilienza disconnect T7)

Niente cloud paid backup. iCloud Drive opzionale come destinazione aggiuntiva se già attivo.

### 7.6 Layer di sanità sessione (Session Health)

Decisione critica della v3.2: il Session Health della v3.1 era basato su stime e ipotesi. **Riformulato come wrapper su API ufficiali**, niente più euristiche. Quattro componenti, ognuno appoggiato su funzionalità native esistenti.

#### 7.6.1 context-monitor — wrapper su /context e statusline JSON

Claude Code v2.x espone nativamente:
- Comando `/context`: breakdown dettagliato di token consumati per categoria (System prompt, Tools, MCP, Custom agents, Memory files, Conversation, Autocompact buffer)
- Comando `/usage`: stato 5h billing window
- Statusline JSON via `stdin`: campo `context_window.used_percentage`, `context_window.remaining_percentage`, `current_usage.input_tokens`, `cache_read_input_tokens`

Fonte: code.claude.com/docs/en/statusline (verificato 7/5/2026). Il pattern industriale 2026 è già consolidato (ccusage, ccstatusline, claude-hud, ClaudeFast Code Kit, Claude-Usage-Tracker).

`context-monitor` del VOS è **un wrapper minimale** (~30 righe Python) che:
1. Espone helper script `vos-context-status` che CC chiama in qualunque momento
2. Lo script riceve dati JSON da CC statusline (input via stdin), legge `used_percentage`, restituisce in italiano: *"Contesto al 47%, sotto soglia warning (50%). Consumo principale: System tools 18k, Memory 12k, Conversation 21k. OK procedere."*
3. Soglie configurabili in `config/context-thresholds.yaml`: warning 50%, critica 70%, autocompact 85%
4. Quando soglia critica raggiunta, il wrapper produce **prompt di chiusura ordinata** che CC esegue: commit corrente, scrive `HANDOFF-{data}-{stage}.md` con stato preciso e prompt resume per sessione successiva, esce. **Niente stati "PARTIAL"**.

Implementazione concreta: configurazione statusline nativa di Claude Code (file `~/.claude/statusline.sh`) che chiama il wrapper VOS, output mostrato persistentemente in basso nel terminale.

#### 7.6.2 preflight-env-checker — wrapper su pip install --dry-run

Pattern S159 da risolvere: `paddlepaddle 3.0 + macOS 11 + opencv-contrib` → wheel built per macOS 12, libtesseract symbol error, sessione persa.

`pip` espone nativamente:
- `pip install --dry-run --report -.json --ignore-installed <pkg>`: ritorna JSON dettagliato di cosa verrebbe installato senza modificare ambiente
- `--platform <platform_tag>`: simula piattaforma diversa per cross-compatibility check
- `--python-version <ver>`: simula Python version target

Fonte: pip.pypa.io/en/stable/cli/pip_install (verificato 7/5/2026, `--dry-run` stabile da pip 23+).

`preflight-env-checker` del VOS è un wrapper Python ~50 righe che intercetta install di librerie nella **blacklist**:

```yaml
# config/preflight-blacklist.yaml
heavy_libs:
  - paddlepaddle
  - paddleocr
  - tensorflow
  - torch
  - torchvision
  - opencv-contrib-python
  - mediapipe
  - onnxruntime-gpu
```

Per ogni install richiesto su lib in blacklist:

1. Esegue `pip install --dry-run --report - --ignore-installed <pkg>` con `--python-version` e `--platform` correnti
2. Parse del JSON ritornato: lista wheel che pip selezionerebbe, dipendenze transitive
3. Per ogni wheel: estrae platform tag dal filename (es. `paddlepaddle-3.0-cp311-cp311-macosx_12_0_arm64.whl`), verifica compatibilità reale con macOS host
4. Lookup `config/bigsur-compatible-versions.yaml` (whitelist versioni note funzionanti su Big Sur) — se il pkg+versione richiesta non è in whitelist e non ha entry esplicita di compatibilità verificata, **blocca**
5. Se blocca: produce nel brief output italiano con i path alternativi:
```
Bloccato install paddlepaddle==3.0 su macOS 11 Big Sur:
- Wheel selezionato: paddlepaddle-3.0-cp311-cp311-macosx_12_0_arm64.whl
- macOS minimo richiesto: 12.0, MacBook è 11.7
- Path alternativi:
  1. Usa paddlepaddle==2.6.x (ultima versione macOS 11 compatibile, in whitelist)
  2. Esegui su iMac via SSH (anche iMac è macOS 11, stesso vincolo, scarta)
  3. Usa qwen/qwen3-vl-235b-thinking:free su OpenRouter (cloud, no install locale)
Raccomando: 3 (zero install, zero conflitti, capability OCR equivalente).
Approvi?
```

**Niente installazione cieca, niente S159 ripetuto.**

#### 7.6.3 session-planner — stima dimensione task via metriche oggettive

V3.1 era vago su "stima". V3.2 lo ancora a metriche misurabili:

Quando Luke (o un brief) propone un task per sessione CC, `session-planner` raccoglie:
- Numero file che il task tocca (lista esplicita nel prompt o discovery)
- Per ogni file: righe, dimensione, complessità sintattica via `radon cc` (Python) o `eslint --format json` (JS)
- Dimensione totale dei file di contesto necessari (CLAUDE.md, skill, agents attivi)
- Stima tokens via `tiktoken` (libreria Python di Anthropic-compatibile)

Output: stima tokens necessari per completare il task (input + output approssimativo). Confronto con context window disponibile (200k Claude Sonnet/Opus, calcolato come `200000 - already_consumed_at_session_start`).

Se stima > 60% del disponibile: **propone spezzamento**. Suggerimenti concreti: "il task tocca 12 file in 3 moduli; ti propongo di spezzarlo in 3 sub-task uno per modulo, ogni sub-task in sessione fresca". Luke conferma o modifica lo spezzamento.

Se stima ≤ 60%: procede.

#### 7.6.4 handoff-debt-tracker — metrica visibile + compilation pattern concreto

**Discovery per-progetto, NON glob fisso** (fix v3.5: convention naming differisce tra progetti, glob fisso fallirebbe silenziosamente su ARGOS producendo 0 righe).

Configurazione in `config/handoff-debt-config.yaml` — pattern handoff dichiarati esplicitamente per ogni progetto attivo, perché ARGOS, FLUXION, Guardian hanno strutture diverse e un glob unico non li copre tutti:

```yaml
# config/handoff-debt-config.yaml
projects:
  ARGOS:
    root: ~/Documents/combaretrovamiauto-enterprise
    patterns:
      - "agent-memory/**/*.md"     # convention non-standard, ARGOS-specifica
      - "memory/**/*.md"
      - "prompts/s*.md"            # session prompts numerati
      - "rules/**/*.md"
    threshold_lines: 2000
  FLUXION:
    root: /Volumes/MontereyT7/FLUXION
    patterns:
      - "HANDOFF*.md"              # convention standard
      - "MEMORY*.md"
      - "STATO_CORRENTE*.md"
      - "docs/handoffs/*.md"
    threshold_lines: 2000
  Guardian:
    root: ~/Documents/pulizia-smartphone
    patterns:
      - ".planning/**/*.md"        # struttura GSD
      - "HANDOFF*.md"
    threshold_lines: 1500          # progetto piccolo, soglia ridotta
```

`handoff-debt-tracker` itera per ogni progetto, applica i suoi pattern, somma le righe. **Se un progetto non è in `handoff-debt-config.yaml` viene ignorato** — aggiungere progetto = modifica YAML esplicita (whitelist a inclusione chiusa, coerente con principio disk-keeper).

Output mostrato nel brief mattutino:
```
Handoff debt:
- ARGOS: 4.382 righe (soglia 2000) → compilation raccomandata
- FLUXION: 1.247 righe → OK
- Guardian: 380 righe → OK
```

**Compilation pattern concreto** (decisione review CC: era etichetta vuota nella v3.1):

Quando un progetto supera soglia, `wiki-curator` esegue il comando `/wiki compile <project>`:
1. Legge tutti i file matchati dai pattern del progetto in `handoff-debt-config.yaml`
2. Invoca routing categoria `long_context` (Gemini 2.5 Pro 1M context o Claude Sonnet 200K) con prompt:
   *"Sei un compilatore di stato progetto. Leggi questi N file di handoff totali Y righe e produci un singolo file `wiki/projects/<NAME>/COMPILED-STATE.md` di max 500 righe che contenga: stato attuale verificato, decisioni chiuse con rationale, blocker aperti con stato, prossimi passi prioritari. Ignora dettagli storici di sessioni chiuse, ignora retry e tentativi falliti, ignora discussioni su decisioni poi sostituite. Lingua: italiano."*
3. Output: `COMPILED-STATE.md` diventa nuovo CLAUDE.md di progetto (L1 cache compatto). Vecchi file archiviati in `wiki/raw/archived-handoffs/<project>/<data>/` mantenendo struttura sorgente
4. Da quel momento, le sessioni CC del progetto partono leggendo solo `COMPILED-STATE.md`, non più 4382 righe di storia

**AC pre-compilation** (Sessione 2): `python3 components/handoff-debt-tracker/scan.py --project ARGOS` deve ritornare `>0` righe. Se ritorna `0`, pattern config sbagliato → blocca sessione, chiedi a Luke di verificare struttura reale del progetto.

#### 7.6.5 Vincoli operativi forzati

- Mai install di dipendenze pesanti (libs in `preflight-blacklist.yaml`) senza preflight verde
- Mai chiusura sessione "PARTIAL" o "ARANCIONE" — solo verde o handoff strutturato con prompt resume
- Mai sessione che parte sopra 35% di context già consumato senza session pruning prima:
  - Se memorie utente + CLAUDE.md + skill consumano già 35%, `context-monitor` mostra all'avvio: "Sessione parte al 38%, sopra soglia 35%. Cosa disabilitare per questo task: [lista skill non rilevanti], [lista memorie non rilevanti]. Procedo con pruning?"
  - Pruning concreto: skill via `~/.claude/settings.json` toggle temporaneo, memorie tramite startup flag CC (se disponibile) o session prompt esplicito "ignora memorie su X, Y, Z per questa sessione"
- Vincolo Big Sur: `config/bigsur-compatible-versions.yaml` mantiene whitelist versioni note. Esempio:
```yaml
paddlepaddle: ["<=2.6.0"]
tensorflow: ["<=2.13.0"]
torch: ["<=2.1.2"]
opencv-contrib-python: ["<=4.8.0.74"]
python: ["3.9", "3.10", "3.11"]
```

### 7.7 Alert in italiano, mai stack trace

Output verso Luke sempre interpretato in italiano. Stack trace solo in `state/errors.jsonl` per audit. Esempio brief output:

❌ Sbagliato: `psutil.NoSuchProcess: process no longer exists (pid=4523)`

✅ Corretto: *"Il processo che monitoravo (n8n, PID 4523) non c'è più — probabilmente chiuso o crashato. Vuoi che provi a rilanciarlo via launchd?"*

Interpretazione passa per routing categoria `volume` (DeepSeek o Llama free). Costo per alert ~€0.0001.

---

## 8. Layer memoria persistente

### 8.1 Struttura

```
~/venture-os/wiki/
├── CLAUDE.md                    # L1 — auto-loaded, sotto 200 righe
├── decisions/
│   ├── open/
│   ├── approved/
│   │   ├── strategic/           # template hard, validator rigido
│   │   └── operational/         # template soft, validator basico
│   └── archived-ideas/
├── projects/
│   ├── ARGOS/
│   │   ├── COMPILED-STATE.md    # generato da /wiki compile, L1 di progetto
│   │   └── ...
│   ├── FLUXION/
│   └── Guardian/
├── workflows/
├── research/
└── raw/
    └── archived-handoffs/        # storia post-compilation
```

### 8.2 L1 — `CLAUDE.md` root

Sotto 200 righe. Contenuto:
- Chi è Luke (3-4 righe)
- Lingua: italiano
- Vincoli invarianti (zero-cost, max 3 venture, mai Telegram, T7 storage)
- Anti-Scarico-Decisioni come hard rule (3 righe)
- Indice di puntatori a L2

### 8.3 L2 — wiki on-demand

Comandi del `wiki-curator`:
- `/wiki ingest <source>` — assorbe nuova fonte (URL, PDF, conversazione)
- `/wiki query <topic>` — cerca, ritorna pagine rilevanti
- `/wiki lint` — pagine orfane, contenuto stantio (>90gg), riferimenti rotti, fughe credenziali
- `/wiki diff <doc>` — git history
- `/wiki compile <project>` — compilation pattern (vedi 7.6.4)

### 8.4 Niente vector DB, niente embedding

Markdown puro. Cross-reference esplicite (`[[link]]`). Quando wiki cresce oltre soglia: compilation produce viste compatte specializzate.

---

## 9. Adattabilità, scalabilità, flessibilità

**Adattabilità**: cambio modello LLM = riga in `routing.yaml`. Cambio cadenza brief = modifica plist. Cambio soglia costi = `config/cost-tracker.yaml`. Niente codice, niente deploy.

**Scalabilità**: quarto progetto = aggiungi a `projects-whitelist.yaml`. Decimo progetto = stesso pattern. Nuova fonte dati = connettore in `bridges/<name>.py`. Nuovo agente specializzato = file in `agents/<name>.md`.

**Flessibilità**: da Streamlit a Reflex = riscrivi `dashboard/`. Da OpenRouter a Ollama self-hosted = aggiungi 5° gateway. Da Karpathy Wiki a Letta = adapter con stessa API. Da launchd a cron = sostituisci `launchd-orchestrator`.

Garanzia strutturale via architettura a layer + interfacce config.

---

## 10. Costo previsto

| Voce | Mensile | Note |
|---|---|---|
| Claude Code subscription | €240 | Già pagato, base |
| OpenRouter top-up | €5-15 | Solo paid fallback su free rate-limited |
| Colab T4 (free tier) | €0 | Sufficiente per uso non-burst |
| HuggingFace Inference | €0 | Free tier 1000 req/mese |
| Perplexity / NotebookLM | €0 | Tier gratuito, accesso manuale |
| Domain/hosting | €0 | Tutto self-hosted |
| Backup cloud | €0 | Solo storage locale |
| Stripe/Wise/Revolut | €0 fisso | Solo fee per-transazione |
| **Totale aggiuntivo target** | **€5-15/mese** | Sotto soglia €30 |

Mitigazione casi peggiori:
- OpenRouter paid sopra fallback → cost-tracker blocca paid non essenziali al 100% soglia
- Colab termini cambiati → fallback OpenRouter paid, +€10-20/mese caso peggiore
- Crescita volume task → cost-tracker segnala al 50% soglia, raccomanda riallocazione

---

## 11. Piano di costruzione (MVP 2 sessioni → Validation Window 7-14gg → 4 sessioni rimanenti)

**Modifica strutturale v3.4** (review CC: 12 mesi di costruzione zero-revenue è il pattern da rompere; applichiamolo al VOS stesso). Prima si valida il pattern del brief mattutino con dati reali su 7-14gg, poi si decide se le altre 4 sessioni servono davvero o se l'MVP basta.

### Fase A — MVP (2 sessioni, 6-8h totali)

Obiettivo: avere un brief mattutino reale che osserva i 3 progetti, niente LLM routing, niente UI, niente cleanup. Solo discovery + osservazione + brief markdown italiano scritto da Python aggregator.

#### Sessione 1 (MVP) — Bootstrap T7 + struttura + project-scanner (3-4 ore)

Scope ridotto vs v3.3 per via review CC sovradimensionamento:

1. Recovery scope se file VOS misplaced in `<progetto>/.claude/` (Task 0 PROMPT)
2. Cleanup SSD MacBook **shell-only** (4 comandi diretti, no disk-keeper Python ancora):
   - `brew cleanup --prune=all`
   - `rm -rf ~/Library/Developer/Xcode/DerivedData/*`
   - `rm -rf ~/Library/Caches/{pip,Homebrew,uv}/*`
   - `xcrun simctl delete unavailable` (se Xcode presente)
3. Verifica gate: SSD sotto 85% (`df -h /`)
4. Crea struttura `/Volumes/MontereyT7/venture-os/` + symlink `~/venture-os`
5. `is_t7_mounted()` shared in `components/_shared/mount_check.py`
6. Crea `~/.claude/` se non esiste, scope globale dichiarato in CLAUDE.md root del VOS (sezione 3.3)
7. Implementa `project-scanner` con whitelist 3 progetti
8. Esegui prima discovery → `state/projects-inventory.yaml`
9. Stub markdown in `wiki/projects/<NAME>/` per ognuno
10. `git init` + primo commit

**Disk-keeper FUORI Sessione 1** (review CC: prima rodi PBO + fixi bug Mole noti, poi aggiungi disk-keeper come componente). Spostato a Sessione 3 della fase B.

Gate: SSD <85%, struttura VOS su T7, symlink OK, project-scanner trova 3 progetti, git init OK.

#### Sessione 2 (MVP) — host-monitor + morning-briefer v0 (3-4 ore)

1. Implementa `host-monitor` Python (psutil + subprocess) per MacBook
2. Test `host-monitor` via SSH su iMac (stesso codice, stesso JSON output)
3. LaunchAgent `host-monitor` ogni 60 min su entrambi gli host
4. **`morning-briefer` v0 piatto**: aggregator Python che legge:
   - `projects-inventory.yaml`
   - DB principale di ogni progetto via SELECT read-only (con `PRAGMA busy_timeout=5000` per evitare lock contention con scrittori concorrenti tipo cron Guardian)
   - `host-monitor` ultima probe
   - Output: brief markdown italiano scritto direttamente da template Python (no LLM, no routing, italiano hardcoded nei template del briefer)
5. LaunchAgent `morning-brief` 7:00
6. Test: brief reale prodotto domattina, leggibile, in italiano, max 50 righe

Gate: brief mattutino arriva domattina con dati reali dei 3 progetti, host-monitor logga ogni ora, italiano leggibile.

### Fase B — Validation Window (7-14 giorni reali)

Obiettivo: capire se il brief mattutino cambia il comportamento operativo di Luke. Non costruisci nulla in questa fase. Usi.

**Misurazione strutturata, non auto-valutazione** (fix v3.5: review CC AUDIT-2 punto 7 — i 3 criteri "utile/sufficiente/inutile" erano soggettivi, decisione gate arbitraria).

Ogni mattina, dopo aver letto il brief, Luke registra una riga JSON in `state/brief-actions.jsonl` (input minimo, scrivibile in 30 secondi):

```jsonl
{"date":"2026-05-08","brief_read":true,"action_taken":"argos-contact-lead-fiat-de-127","source_match":true,"notes":"brief segnalava 12 lead non contattati >8gg, ho ripreso il primo"}
{"date":"2026-05-09","brief_read":true,"action_taken":null,"source_match":false,"notes":"brief letto ma niente di azionabile oggi"}
{"date":"2026-05-10","brief_read":false,"action_taken":"fluxion-cf-token-renewal","source_match":false,"notes":"brief non aperto, priorità decisa indipendentemente"}
```

Schema campo per campo:
- `date` (string ISO): giorno del brief
- `brief_read` (bool): brief effettivamente letto entro le 12:00
- `action_taken` (string\|null): identificativo azione operativa eseguita quel giorno (formato libero `<progetto>-<azione>-<id>`), `null` se nessuna azione linkabile a un progetto attivo
- `source_match` (bool): l'azione è stata triggerata da una segnalazione del brief? `true` solo se Luke ha agito *grazie* al brief, non in parallelo
- `notes` (string): 1 riga in italiano, opzionale

**Criteri di decisione misurabili a fine Validation Window** (giorno 7-14, calcolati con `python3 components/brief-tracker/score.py`):

| Criterio | Calcolo | Verdetto |
|---|---|---|
| **Brief utile** → procedi Fase C | `count(source_match=true) ≥ 3` su 7gg, oppure `≥ 5` su 14gg | Sessione 3-6 hanno valore |
| **Brief sufficiente** → MVP basta, fermati qui | `1 ≤ count(source_match=true) ≤ 2` E `count(brief_read=true) ≥ 5/7` | Risparmiato 13-15h Fase C |
| **Brief inutile** → dichiara fallimento pattern | `count(source_match=true) == 0` su 7gg, oppure `count(brief_read=true) < 4/7` | Stop VOS, considera handoff manuali cross-progetto |

**AC implementazione** (Sessione 2 deve consegnare):
- `state/brief-actions.jsonl` esiste con schema validato (script `validate-brief-actions.py` rifiuta righe malformate)
- `components/brief-tracker/score.py` legge il jsonl e stampa il verdetto secondo tabella
- Brief mattutino include footer 1-riga: *"Per chiudere oggi: `echo '{...}' >> ~/venture-os/state/brief-actions.jsonl`"* con template precompilato

Questo è il vincolo **applicato al VOS stesso** del principio "max 3 venture attive, chiudi prima di aprire altro". VOS non diventa la 4ª cosa fermata a metà — il go/no-go è dato, non sentito.

### Fase C — Sessioni rimanenti (4 sessioni, 13-15h totali, solo se Fase B conferma)

Da decidere a Fase B-fine quale delle seguenti effettivamente serve:

#### Sessione 3 (Fase C) — disk-keeper + LLM Router federato + cost tracking (4 ore)

(Prima parte: disk-keeper Python con sintassi Mole verificata. Seconda parte: LLM Router + cost-tracker + routing-tester come da blueprint v3.3 Sessione 3 originale.)

#### Sessione 4 (Fase C) — Wiki Karpathy + Pipeline runner + Brief mattutino LLM-enhanced (3 ore)

(Brief upgrade: aggiungi LLM routing categoria `volume` per riformulare il brief piatto in italiano scorrevole con raccomandazioni motivate. Wiki + pipeline come da v3.3 Sessione 4.)

#### Sessione 5 (Fase C) — Decision template + Token-watcher + Backup (3 ore)

(Decision template a 2 livelli + token-watcher OAuth + backup-orchestrator. **Session-health spostato a Sessione 6 dedicata** per ridurre densità sotto critica review CC punto 4.)

#### Sessione 6 (Fase C) — Session-health dedicato + Bridges + Dashboard (4 ore)

(Session-health 4 sotto-componenti **in sessione dedicata** dopo che PBO è rodato da Fase B+C: context-monitor, preflight-env-checker, session-planner, handoff-debt-tracker. Più research-bridge, social-publisher v0, Streamlit dashboard, capability-scanner skeleton, README-VOS.)

**Totale stimato realistico** (con buffer +50% confermato dal pattern Guardian S24-26):
- Fase A MVP: 6-8h ottimistiche → 9-12h reali
- Fase B Validation: zero costruzione, solo uso
- Fase C completa: 14h ottimistiche → 21h reali (se decisi di costruirla tutta)
- Totale **se** vai fino in fondo: 30-33h reali distribuite su 3-4 settimane

Ma il punto di Fase B è proprio: forse non vai fino in fondo. È ok.

---

## 12. Cosa Luke deve fornire

**Hardware verificabile a runtime** (CC verifica fattualmente all'avvio Sessione 1):
- Stato T7 connesso (gate hard)
- macOS version su MacBook + iMac
- Stato 4 dischi (`df -h`)
- Connettività SSH MacBook → iMac

**API key** (presenti nei `.env` progetti):
- OpenRouter API key
- HuggingFace token (per skill free-gpu-api)
- ngrok auth token (per skill free-gpu-api)
- LinkedIn app credentials da creare al Sessione 6 (gratis nel Developer Portal LinkedIn)

**Decisioni di scope chiuse**:
- Path canonico: `/Volumes/MontereyT7/venture-os/` con symlink `~/venture-os` ✅
- 3 progetti attivi: ARGOS, FLUXION, Guardian ✅
- Big Sur LTS pinning: confermato ✅
- Brief modalità interattiva CC: confermato ✅
- Social: L2 default su `w_member_social` free LinkedIn ✅
- Categoria C uncensored: presente come componente architetturale, scope d'uso non vincolato ✅

**Approvazioni durante esercizio**:
- Cleanup `disk-keeper` (Sessione 1)
- Routing changes proposti dal `routing-refresh`
- Aggiunta path al disk-keeper-include
- Aggiunta progetti al `projects-whitelist.yaml`
- Stage chiusure (`approved.md`)
- Ricariche OpenRouter quando raccomandate

---

## 13. Anti-pattern

13 anti-pattern da rifiutare attivamente:

1. Over-engineering preventivo (no feature non richieste)
2. Sostituzione cieca per "modernità" (no Letta sopra Karpathy senza blocker reale)
3. Logging verboso o stack trace verso Luke
4. Dipendenze da servizi a pagamento (vincolo zero-cost)
5. Telegram per alert VOS (riservato ad ARGOS HITL)
6. Riuso del framework architect/implementer/validator di aprile come backbone
7. Sales-first deviation
8. Domande chiuse multiple a Luke su decisioni tecniche
9. Path hardcoded nel codice (sempre via `project-scanner` o `config/paths.yaml`)
10. Sostituzione automatica routing senza approvazione
11. **Installazione dipendenze pesanti senza preflight check** (pattern S159)
12. **Chiusura sessione "PARTIAL" o "ARANCIONE"** (solo verde o handoff strutturato)
13. **Sessione che parte sopra 35% di context già consumato senza pruning**

---

## 13bis. Protocollo Blocker Operativo (PBO) — vincolante per Claude Code

Questa sezione è **vincolante per Claude Code in ogni sessione di implementazione**. Non è una linea guida, è un protocollo. CC non deve scaricare decisioni su Luke quando incontra un blocker durante l'esecuzione di un task del blueprint. Deve seguire questi step nell'ordine indicato. Saltare uno step = anti-pattern n.8 violato.

### 13bis.1 Cosa è un blocker operativo

È un blocker operativo qualunque situazione in cui CC sta eseguendo un task del piano di costruzione (sezione 11) e:
- un comando shell ritorna errore inatteso
- una sintassi/API documentata nel blueprint risulta diversa dalla realtà del software installato
- una dipendenza fallisce install nonostante preflight passato
- un percorso filesystem assunto non esiste

**NON è blocker operativo**: dubbio strategico ("ma è davvero la cosa giusta da costruire?"), domanda di scope ("e se invece...?"), ottimizzazione architetturale non richiesta. Quelle sono **anti-pattern n.7 e n.8** e vanno rifiutate da CC stesso senza coinvolgere Luke.

### 13bis.2 Step obbligatori in sequenza

Quando CC incontra un blocker operativo, esegue questi step **nell'ordine, senza saltarne nessuno, senza chiedere a Luke di scegliere**:

**Step 1 — Verifica fattuale del blocker (max 2 min)**

CC esegue almeno 2 comandi shell che dimostrano oggettivamente il blocker. Esempio: se `mo analyze --scope <path>` non esiste, CC esegue `mo --help`, `mo analyze --help`, `mo --version`. Se un import Python fallisce, CC esegue `python3 -c "import X; print(X.__version__)"`, `pip show X`, `pip list | grep X`. Output dei comandi salvato in `state/errors.jsonl` con timestamp e contesto.

**Step 2 — Ricerca attiva con fonti aggiornate (max 5 min)**

CC esegue almeno UNA delle seguenti, scegliendo quella più probabilmente decisiva:
- `WebFetch` o `WebSearch` su documentazione ufficiale del tool/libreria coinvolta (README upstream, release notes, man pages, `--help` esteso)
- `WebFetch` su GitHub Issues del repo upstream con query sulla error string esatta
- Lettura del file di help del tool con flag esteso (`--help-all`, `man <tool>`, `<tool> help <subcommand>`)

**Output obbligatorio**: CC scrive nel proprio output i link/fonti consultati e la sintassi/API reale trovata, con citazione testuale (≤15 parole, no copyright).

**Step 3 — Confronto blueprint vs realtà**

CC produce una micro-tabella mentale (anche solo nel suo output, non file):
- Cosa il blueprint assume
- Cosa la realtà 2026 dimostra
- Differenza concreta (sintassi diversa, API rinominata, flag rimosso, comportamento cambiato)

**Step 4 — Decisione automatica seguendo regole fisse**

CC applica la prima regola che si attiva:

| Caso | Regola |
|---|---|
| Il blueprint era **corretto**, errore è di CC nell'interpretarlo | CC corregge sé stesso, esegue, niente Luke |
| Il blueprint era **errato** (mia svista in sessione blueprint) e la realtà offre **una sola** alternativa tecnicamente sensata | CC sceglie quella alternativa, motiva con i dati di Step 2, **procede senza chiedere a Luke**, segnala in handoff finale "blueprint sezione X.Y aveva sintassi obsoleta, applicato fix Z basato su fonte W" |
| Il blueprint era errato e la realtà offre **alternative multiple equivalenti tecnicamente** ma con trade-off rilevanti per Luke (costo, sicurezza, performance percepita) | CC porta a Luke **una raccomandazione singola motivata** con i dati, segnalando il trade-off rilevante in 2 righe. Mai 3+ opzioni A/B/C. |
| Il blocker richiede decisione di scope (no soluzione tecnica esiste con i vincoli del blueprint) | CC ferma la sessione, scrive `HANDOFF-BLOCKED-{timestamp}.md` con stato + ricerca + opzioni, escalation a Luke |

**Step 5 — Applicazione + audit**

CC applica la decisione, esegue il task, salva in `state/blueprint-deviations.jsonl` un record con: sezione blueprint impattata, descrizione blocker, fonti consultate, decisione presa, comando applicato. Questo file diventa input per la prossima review del blueprint.

### 13bis.3 Esempio concreto applicato al caso Mole

Blocker: `mo analyze --scope <path>` non esiste in Mole 1.37.

❌ Comportamento sbagliato (come fatto nella prima sessione 1):
> "Hybrid: Mole solo per fase analisi via mo analyze <path> -json, cleanup via shell standard. Una riga: 'ok hybrid' → procedo. Oppure: 'NO, fai solo Mole nudo'. Oppure: 'NO, scrivi tu un'altra strategia'."

✅ Comportamento corretto secondo PBO:

> Step 1: eseguito `mo --help`, `mo analyze --help`, `mo clean --help`. Conferma: `--scope` non esiste, `mo clean` è interattivo con categorie predefinite, `mo analyze <path>` accetta path posizionale e supporta `-json` (single-dash Go-style, non `--json`).
>
> Step 2: consultato GitHub README di `tw93/Mole` (commit più recente). Citazione: `"mo analyze -json ~/Documents"` ritorna JSON strutturato. `mo clean` è interattivo con whitelist a esclusione interna, non accetta path target.
>
> Step 3: blueprint sezione 7.3 assume API a inclusione chiusa con `--scope`. Realtà: Mole espone analyze per-path (compatibile) ma clean è interattivo per-categoria (non compatibile con whitelist a inclusione del blueprint).
>
> Step 4: il blueprint era errato (mia svista). Esiste **una sola** alternativa sensata che mantiene principio inclusione chiusa: `mo analyze -json <path>` per la fase di scoperta + cleanup via shell standard (`du -sh`, `rm -rf` controllato) sui path della whitelist. Mole resta installato come tool interattivo per Luke ma non è invocato da `disk-keeper`. Procedo applicando questa scelta.
>
> Step 5: salvo in `blueprint-deviations.jsonl` l'audit, implemento `keeper.py` che usa `mo analyze -json <path>` + shell cleanup, eseguo task 4-5, vado avanti.

Nessuna domanda a Luke. Decisione presa con dati. Sessione procede.

### 13bis.4 Quando invece CC DEVE coinvolgere Luke

Solo questi casi richiedono pausa per input di Luke durante una sessione:

1. **Approvazione esplicita richiesta dal piano** (es. step 5 Sessione 1: cleanup `--execute` dopo dry-run, step 12 gate finale)
2. **Decisione di rischio reale**: cancellazione dati, costi sopra soglia, modifica a config di progetti operativi (ARGOS/FLUXION/Guardian)
3. **Conflitto tra due principi del blueprint** che si attivano sullo stesso task
4. **Trade-off rilevante per Luke** (caso 3 della tabella Step 4)

In tutti gli altri casi: CC decide e procede.

### 13bis.5 Sintesi

Il PBO impedisce a CC di replicare il pattern S158/S159: tecnicismi non spiegati, opzioni A/B/C scaricate su chi non ha gli elementi per scegliere, paralisi al primo errore. CC è obbligato a fare ricerca prima di chiedere, e quando chiede deve portare una raccomandazione motivata, mai un menu.

---

## 14. Evoluzione futura

### 14.1 Big Sur exit strategy (review CC v3.4)

macOS 11 Big Sur è deprecato Apple dal 2024. Whitelist `bigsur-compatible-versions.yaml` si restringe nel tempo (ogni mese che passa, librerie nuove non hanno wheel Big Sur). Manca exit strategy → VOS muore con Big Sur.

**Segnali di trigger** che attivano la exit strategy (almeno 2 di 3):
- 30%+ delle librerie blacklist-ate `preflight-blacklist.yaml` non ha più versione Big Sur compatibile
- 3+ blocker S159-pattern in 60gg
- Qualche progetto operativo (ARGOS/FLUXION/Guardian) richiede librerie macOS 12+ obbligatorie

**Opzioni a costo crescente** (decise quando trigger si attiva, non oggi):
1. **Aggiornamento macOS in-place su MacBook**: gratis, 1 giorno interruzione, possibili rotture su tooling vecchio. Big Sur → Monterey o Sonoma compatibile con hardware MacBook attuale (verifica modello specifico)
2. **MacBook Air M-series usato** (€600-900 mercato 2026): performance ×3-5, supporto OS futuro, costo non trascurabile
3. **Cloud-only fallback per task macOS-incompatibili**: usa OpenRouter cloud OCR/vision invece di setup locale, mantieni Big Sur per il resto. Mitigazione parziale, costo zero

Decisione: opzione 1 prima scelta quando trigger attivo, opzione 3 come ponte temporaneo, opzione 2 solo se ARGOS/FLUXION/Guardian generano revenue sufficiente a giustificare capex.

### 14.2 Componenti aggiuntivi quando dolore reale

- LangGraph come strato di orchestrazione per workflow batch notturni complessi (se Claude Agent SDK diventa stretto)
- Letta/MemGPT come supplemento del wiki (oltre 500 documenti)
- Migrazione a Reflex per dashboard più ricche
- Pubblicazione VOS open-source (dopo 3-6 mesi di uso stabile)
- Integrazione con altri founder italiani (speculative)
- Pagamenti automatici operativi (quando ARGOS/FLUXION generano revenue)
- Espansione social-publisher (YouTube + TikTok + Mastodon + Bluesky)

---

## 15. Appendice — 20 famiglie di componenti concreti

### 15.1 free-gpu-api (riusato da skill globale)
- Path: `~/.claude/skills/free-gpu-api/`
- Use case: AI inference free-tier (image/text/speech/tts/ocr/translate) via Colab T4 + ngrok
- Token globali: `~/.claude/.env.free-gpu` (HF_TOKEN, NGROK_AUTHTOKEN)
- Keepalive: ping ogni 60min, auto-restart 404, refresh URL ngrok propagato a `routing.yaml`
- Fallback se Colab giù: corrispondente categoria su OpenRouter paid

### 15.2 llm-router
- Path: `~/venture-os/components/llm-router/`
- Stack: Python + LiteLLM SDK in-process
- Config: `config/routing.yaml`
- Token: `OPENROUTER_API_KEY` da `.env`
- Auto-discovery: LaunchAgent `routing-refresh` notturno

### 15.3 wiki-engine (Karpathy L1/L2)
- Path: `~/venture-os/wiki/` + `components/wiki-engine/`
- Stack: Python + sub-agent CC dedicato
- Comandi: `/wiki ingest`, `/wiki query`, `/wiki lint`, `/wiki diff`, `/wiki compile`
- Storage: markdown puro, git versioned

### 15.4 pipeline-runner
- Path: `~/venture-os/components/pipeline-runner/`
- Stack: Python + template `.md` per i 7 stage
- Storage: `projects/<NAME>/pipeline/stage-N-*.md` + `approved.md`
- Vincolo: max 3 progetti attivi, forced linearity

### 15.5 decision-template (2 livelli)
- Path: `~/venture-os/components/decision-template/`
- Stack: Python validator + 2 schemi (strategic / operational)
- Strategic: filename `[STRATEGIC]-*.md`, schema rigido
- Operational: filename `[OPERATIONAL]-*.md`, schema snello
- Storage: `wiki/decisions/<state>/strategic|operational/`

### 15.6 host-monitor
- Path: `~/venture-os/components/host-monitor/`
- Stack: Python + psutil + subprocess (smartctl/pmset/ioreg/df/vm_stat)
- Funziona MacBook (locale) + iMac (SSH)
- Stateless, zero daemon
- Output: JSON via stdout, accumulo in `state/host-monitor.jsonl`

### 15.7 disk-keeper (whitelist a inclusione chiusa, sintassi Mole verificata)
- Path: `~/venture-os/components/disk-keeper/`
- Stack hybrid: Mole CLI per analisi (`mo analyze -json <path>`) + shell standard per cleanup (`rm -rf` controllato)
- Decisione v3.4: `mo clean --scope` non esiste in Mole reale, sostituito con shell cleanup sui path della whitelist
- Whitelist: `config/disk-keeper-include.yaml` (lista chiusa 7 path, esclusi Xcode/Indexes per user-pain)
- Mai opera fuori whitelist
- Esecuzione: `mo analyze -json <path>` automatico, `rm -rf <path>/*` solo dopo approvazione

### 15.8 launchd-orchestrator
- Path: `~/venture-os/components/launchd-orchestrator/`
- Stack: Python plist generator + `launchctl` wrapper
- Plist generati in `~/Library/LaunchAgents/com.luke.ventureos.*.plist`

### 15.9 dashboard-streamlit
- Path: `~/venture-os/dashboard/`
- Stack: Streamlit Python
- Avvio: `streamlit run app.py --server.port 8501`
- Read-only

### 15.10 cost-tracker
- Path: `~/venture-os/components/cost-tracker/`
- Stack: Python in-process (chiamato da llm-router)
- Storage: `state/costs.jsonl`
- Soglia: €30/mese, alert all'80%, blocco paid al 100%
- Override: `cost-tracker unblock --task <task> --reason "<motivo>"`

### 15.11 heretic-handler (uncensored gateway)
- Path: `~/venture-os/components/heretic-handler/`
- Stack: Python wrapper specializzato sopra llm-router categoria `uncensored`
- Modello: dolphin-mistral-24b-venice-edition:free primario
- Audit: `state/heretic-log.jsonl`
- Scope: blueprint definisce **come** si invoca, non **cosa** gli si chiede di fare

### 15.12 project-scanner
- Path: `~/venture-os/components/project-scanner/`
- Stack: Python filesystem walker
- Whitelist: `config/projects-whitelist.yaml` (ARGOS / FLUXION / Guardian inizialmente)
- Quarto progetto: aggiunto esplicitamente da Luke
- Output: `state/projects-inventory.yaml`

### 15.13 morning-briefer
- Path: `~/venture-os/components/morning-briefer/`
- Stack: Python aggregator + chiamata routing categoria `volume` per riformulazione italiana
- Input: stato + costs + host-monitor + decisions/open + token-watcher + session-health
- Output: `briefs/morning-brief-YYYY-MM-DD.md`
- Schedulato: launchd 7:00

### 15.14 research-bridge
- Path: `~/venture-os/components/research-bridge/`
- Stack: Python orchestrator
- Sequenza: KB locale → web_search → Perplexity link cliccabile → NotebookLM link cliccabile
- Output: `wiki/research/<topic>-YYYY-MM-DD.md`

### 15.15 social-publisher
- Path: `~/venture-os/components/social-publisher/`
- Stack: Python OAuth manager + workflow scheduling
- Scope: profili personali via `w_member_social` (free, ufficiale)
- Token: una app LinkedIn dedicata per profilo, refresh automatico 7gg prima scadenza
- Cadenza: max 1-2 post/giorno per piattaforma
- Fallback: post in `pending-posts/` con notifica nel brief

### 15.16 token-watcher
- Path: `~/venture-os/components/token-watcher/`
- Scope: tutti i token OAuth gestiti dal sistema
- Refresh: 7gg prima scadenza access, alert 14gg prima refresh expiry
- Storage: `state/tokens-status.yaml`

### 15.17 backup-orchestrator
- Path: `~/venture-os/components/backup-orchestrator/`
- Stack: Python wrapper su rsync
- Sorgenti: DB progetti, wiki, brief, config, VOS stesso
- Destinazioni: T7 quotidiano, HD esterno iMac settimanale + mensile
- Resilienza T7 disconnect: backup giornaliero `wiki/`+`config/` su HD esterno

### 15.18 session-health
- Path: `~/venture-os/components/session-health/`
- Componenti interni:
  - **context-monitor**: wrapper su `/context` Claude Code + statusline JSON, configurato in `~/.claude/statusline.sh`. Soglie 50%/70%/85%. Quando critica: produce prompt di chiusura ordinata
  - **preflight-env-checker**: wrapper su `pip install --dry-run --report -` con `--platform`/`--python-version`. Blacklist `config/preflight-blacklist.yaml`, whitelist Big Sur `config/bigsur-compatible-versions.yaml`. Blocca install incompatibili, propone path alternativi
  - **session-planner**: stima tokens via `tiktoken` + `radon cc` + lista file. Se >60% disponibile → propone spezzamento concreto
  - **handoff-debt-tracker**: conta righe handoff per progetto applicando pattern dichiarati in `config/handoff-debt-config.yaml` (per-progetto, NON glob fisso — fix v3.5 per ARGOS che usa `agent-memory/`, `memory/`, `prompts/s*.md`). Soglia configurabile per progetto (default 2000). Sopra soglia → segnala compilation via `/wiki compile <project>` (long_context routing → COMPILED-STATE.md max 500 righe + archive vecchi file)
- Vincoli operativi forzati (vedi sezione 7.6.5)

### 15.19 routing-tester (e2e verification)
- Path: `~/venture-os/components/routing-tester/`
- Stack: Python ~60 righe + `litellm` + `routing.yaml` introspection
- Comando: `routing-test --all` (test e2e tutte le categorie) o `routing-test --category <name>`
- Logica: per ogni categoria nel `routing.yaml`, esegue 1 chiamata reale con prompt-test minimale (~50 token), misura latenza, costo, success/fail, validità output (es. JSON parsabile per `storyboard_json`, codice eseguibile per `code`)
- Storage: `state/routing-tests.jsonl` con record per categoria/timestamp/gateway/model/latency_ms/cost_eur/status
- Schedulato: launchd notturno `com.luke.ventureos.routing-tester.plist` (3:00, prima del routing-refresh 4:00)
- Budget hard: max €0.05 per run completo (costo cumulato free-tier-first), blocco se sforo
- Brief integration: morning-briefer legge ultimo run e include riga per categoria nel brief mattutino:
  ```
  Routing health (notte 7/5):
  - reasoning_critical: OK 1.2s €0.0008
  - volume: OK 0.8s €0
  - uncensored: OK 1.4s €0
  - vision_ocr: DEGRADED nemotron timeout 30s, fallback qwen3-vl OK 2.1s €0
  - ocr_local: DOWN Colab notebook scaduto, riavvia con scripts/restart_colab.sh
  ```
- Anti-scarico: se ≥2 categorie in stato DOWN, brief include raccomandazione singola motivata, mai opzioni A/B/C

### 15.20 capability-scanner (Modo C — discovery proattiva con vincolo bisogni dichiarati)
- Path: `~/venture-os/components/capability-scanner/`
- Stack: Python + chiamate a OpenRouter `/api/v1/models`, HuggingFace API, HF Spaces listing
- Input vincolante: file `config/capability-needs.yaml` popolato da Luke con bisogni espliciti dei 3 progetti
- Esempio `capability-needs.yaml`:
  ```yaml
  needs:
    - id: sara-voice-cloning
      project: FLUXION
      description: voice cloning italiano per persona SARA, latenza <5s, free preferito
      target_category_in_routing: tts_clone_it
      keywords: [voice cloning, italian, XTTS, tortoise, F5-TTS]
    - id: argos-audio-transcription
      project: ARGOS
      description: trascrizione + diarization audio dealer (italiano), free
      keywords: [diarization, italian whisper, pyannote]
  ```
- Logica: schedulato settimanale (domenica notte), per ogni `need` cerca su OR/HF/Spaces match per keywords + descrizione, scarta non-free, scarta già presenti in `routing.yaml`, raggruppa risultati promettenti
- Output: proposta nel brief mattutino del lunedì con max 3 candidati per `need`, con dati: nome modello, provider, free/paid, contesto, link doc. Raccomandazione singola motivata per ognuno.
- **Mai aggiunte automatiche al `routing.yaml`**. Solo dopo approvazione esplicita Luke (decisione operativa, non strategica → `[OPERATIONAL]` template). Audit in `state/capability-scanner-log.jsonl`.
- Politica anti-scope-creep: se `capability-needs.yaml` è vuoto, scanner non gira. È Luke che dichiara cosa cerca, non scanner che propone idee a caso.

(Le famiglie sono ora 20 totali. Le 18 originali + routing-tester + capability-scanner come Modo C.)

---

## Conclusione

Il Venture OS JD è costruito su 5 principi:

1. **Anti-Scarico-Decisioni** come prima classe — raccomandazione + fonti + rischi specifici, italiano
2. **Federazione zero-cost** — 4 gateway, free-tier first, fallback chain, sostituzione automatica solo proposta
3. **Markdown come substrato** — stato leggibile, git versioned, niente vector DB
4. **Project discovery a runtime** — agnostico ai progetti specifici
5. **Session health basato su API ufficiali** — wrapper su `/context`, `/usage`, statusline JSON, `pip --dry-run`. Niente euristiche fragili. Risposta diretta al pattern S159

Lo costruisce Claude Code in 6 sessioni atomiche distribuite su 5-8 giorni. Costo aggiuntivo target sotto €15/mese, soglia hard a €30. Sostituibile pezzo per pezzo grazie all'architettura a layer.

---

*BLUEPRINT-JD.md v3.2*
*Thursday, May 07, 2026*
*Per Luke (Gianluca Di Stasi), Lavello (PZ), Italia*
