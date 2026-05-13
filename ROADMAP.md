---
project: VOS (Venture OS)
generated: 2026-05-11 (S5f close)
author: Claude (architetto, vincolo #3)
status: vivente — aggiornare end-of-session quando una fase chiude
---

# VOS — Roadmap architetturale post-S5f

**Stato S5f close**: VOS operativo. 8 componenti, 4 LaunchAgent, 3/3 progetti COMPILED-STATE.md, 2 hook globali, ~26 deviation tracciate.

**Filosofia ordine**: foundation prima di expansion. Garantire che ciò che esiste funziona, allineare doc a stato reale, POI costruire nuove componenti.

**Vincoli ricorrenti per ogni fase**: #1 verifica fattuale | #3 raccomandazione singola | #4 critica 4 punti | #5 zero-cost | #6 verde o handoff | #7 60% context | #11 pattern recognition.

---

## FASE 1 — Sanità infrastrutturale (S6, urgenza alta)

**Goal**: trust foundation. Garantire che componenti esistenti girano davvero e che CLAUDE.md descrive lo stato reale, non aspirazionale.

### 1.1 — FLUXION hook context budget audit ✅ (2026-05-11)
**Pattern S5e bug 5x**: `~/.claude/hooks/global_context_gate.py:88` aveva budget hardcoded 200K vs 1M reale. Alta probabilità (~80%) replicato in hook locale FLUXION.
- Read `/Volumes/MontereyT7/FLUXION/.claude/hooks/` (cerca context_budget_gate.py o simile)
- Grep magic number 200_000 / 200000 / 200K
- Se trova: fix analogo VOS (constante named, env override, default 1M)
- Stima: 15 min
- **Done when**: ricerca eseguita + (fix shipped OR conferma "no bug in FLUXION hook")
- **Esito**: bug confermato (`context_budget_gate.py:108` `budget = 200_000.0`). Fix shipped: costante named `_MAX_CONTEXT_TOKENS_FALLBACK = 1_000_000` con commento deviation ref. Test: transcript 100KB → 2.50% (era 12.5% sovrastima 5x). Sintassi OK. Hypothesis 80% confermata.

### 1.1bis — Brief delivery a CC sessione ✅ (2026-05-11)
**Blocker P0 emerso in discussione FASE 1.1 (founder feedback)**: morning-briefer genera correttamente brief in `briefs/` ma SessionStart hook in `~/.claude/settings.json` iniettava solo i 12 vincoli CLAUDE.md, NON il brief. Brief invisibile a CC ad ogni avvio sessione → Validation Window blueprint (sez. 5, Fase B) di fatto MAI iniziata.
- Script `~/.claude/hooks/session_start_brief.sh`: cerca brief di oggi, se manca rigenera al volo via briefer.py (~1.3s), inietta JSON additionalContext con freschezza esplicita.
- Edge cases gestiti: T7 unmounted (warning), nessun brief disponibile (diagnostica), brief stale N giorni (label "gg fa, MacBook era spento?" coerente con pattern Luke spento notte).
- Settings.json: aggiunto secondo matcher SessionStart `startup|resume` (non compact, ridondante post-compact). Backup pre-modifica salvato.
- Test verdi: JSON valido, hook invoke ritorna ctx 1235 char, delete+rerun rigenera brief automaticamente.
- Deviation: blueprint sez. 5 prevedeva pull ("Luke dice buongiorno → brief-narrator"), implementato push (auto-inject SessionStart). Motivo: tu non hai mai detto buongiorno per 4 giorni → pull non funziona se l'utente non sa di doverlo invocare.

### 1.2 — Audit LaunchAgent alive ✅ (2026-05-12, S7)
**Esito**: 4/4 VERDE.
- host-monitor: ultima entry 2026-05-12T10:50:59Z ✅
- morning-brief: `briefs/2026-05-12.md` ✅
- claude-memory-backup: ROTATE OK 2026-05-12 ✅
- git-push hook: ultimo push 2026-05-11T19:30:52Z (event-based, no commit oggi) ✅
- `launchctl list | grep luke.vos` → 4/4 loaded, exit 0
- Brief mancante 2026-05-10 coerente con pattern operativo Luke (MacBook salta giorni).

### 1.3 — Allineamento CLAUDE.md vs stato reale ✅ (S7 chiude residua)
**Reference dangling identificate e risolte**:
- ~~`BLUEPRINT-JD-v3.4.md`~~ → CHIUSO S6 (v3.5 ingerito).
- ~~`bigsur-compatible-versions.yaml`~~ → CHIUSO S7: seed file creato `~/venture-os/config/bigsur-compatible-versions.yaml` (schema vuoto, popolare on-demand).
- ~~`preflight-blacklist.yaml`~~ → CHIUSO S7: seed file creato con blacklist da CLAUDE.md vincolo #8.
- `routing-refresh` notturno → resta aperto, FASE 3.1.
- `~/automation-business/transcripts/` → lazy-created on first use skill yt-transcript, no fix.

**Esito**: 0 reference dangling rimaste (escluso `routing-refresh` atteso FASE 3.1).

**FASE 1 done when**: 3/3 task verdi → ✅ **FASE 1 CHIUSA** (2026-05-12).

---

## FASE 2 — Chiusura debiti pending (S7, lead time esterno)

**Goal**: chiudere entry pending da S5b-S5f senza scope creep.

### 2.1 — OpenRouter HTTP test
**Pendente da S5c, analogo S5e Cerebras**.
- Luke crea account `https://openrouter.ai` → OPENROUTER_API_KEY in `~/.claude/.env.free-gpu`
- HTTP test reale su `meta-llama/llama-3.3-70b-instruct:free` (vincolo #1)
- Verifica: HTTP 200, reply pertinente, latenza, free-tier quota effettiva
- Update routing.yaml v5: aggiungi in `long_context_fallback_chain` con last_verified_method=real_http_call
- Stima: 30 min (10 self + 20 wait Luke)
- **Done when**: chain ha 3 entry verificate (gemini-flash, openrouter-llama-3.3-70b, gemini-pro)

### 2.2 — Switch violation gate log-only → block
**Pre-requisito**: ≥7gg baseline cc-violations.jsonl (parte S5e 2026-05-11, gate 2026-05-18).
- Audit: `tail -200 state/cc-violations.jsonl | jq` → counts per pattern_id, falsi positivi?
- Decisione: se ≥3 violazioni reali / 7gg AND zero falsi positivi → switch a block.
- Se falsi positivi → raffinare regex prima di switch.
- Edit env in shell profile o hardcode MODE="block" in `~/.claude/hooks/global_violation_gate.py`.
- Stima: 30 min audit + 5 min switch
- **Done when**: log JSONL audited + gate in mode block O regex refined + 2 sessione consecutive senza violation

### 2.3 — Seed S6-blueprint-backup → decisione ✅ (2026-05-12, S7)
**Esito**: ARCHIVE 3/3 step con motivo. Seed mosso in `seeds/archived/S6-blueprint-backup.ARCHIVED-2026-05-12.md`.
- Step 1 blueprint section "Componenti backup": ARCHIVE (convention già in produzione + deviation log, doc duplicato).
- Step 2 gdrive-backup: NO-GO (post-whitelist <500MB stimati, github+imac bare repo coprono già, ARGOS sqlite = ToS violation su personal gdrive).
- Step 3 disk-keeper quarantine: NO-GO (keeper.py ha già dry-run default + conferma Y maiuscola, safety pattern adeguato).
- Deviation `blueprint-backup-codified` (resolves `git-backup-multi-remote-codified-ad-hoc`).

**FASE 2 progress**: 1/3 ✅ (2.3 done). 2.1+2.2 restano blocked (account OpenRouter + baseline 7gg matura 2026-05-18).

---

## FASE 3 — Componenti strutturali (S8-S9, impatto alto)

**Goal**: aggiungere capacità VOS che ora mancano e bloccano ottimizzazione.

### 3.1 — `routing-refresh` notturno
**Componente citato in CLAUDE.md "vincoli invarianti" ma non esistente**.
- Scope: LaunchAgent giornaliero (RunAtLoad, pattern operativo Luke) che esegue:
  - HTTP `/v1/models` su Gemini, Cerebras, OpenRouter (vincolo #1, dato live)
  - Confronta con routing.yaml — se diff → log delta in `state/routing-drift.jsonl`
  - **NON** modifica routing.yaml automaticamente (gate manuale Luke per evitare regressioni)
  - Brief mattutino segnala drift
- Path: `components/routing-refresh/refresher.py`
- Stima: 2-3h
- **Done when**: LaunchAgent installato, primo run mostra 0 drift (catalogo congruente), drift simulato (test con fake response) attiva alert brief

### 3.2 — ~~Karpathy compilation periodica (handoff-debt-watcher)~~ ✅ **RESOLVED-DEDUP (S11, 2026-05-12)**

**Stato S11**: scope già coperto da componenti esistenti, no new component required.
- `project-scanner/scanner.py` calcola `handoff_debt_lines` per progetto da glob pattern `handoff-debt-config.yaml`, scrive in `state/projects-inventory.yaml`.
- `morning-briefer/briefer.py:307-310` legge debt + threshold, genera segnale brief "ARGOS: handoff debt N righe oltre soglia (T) — compilation Sessione 4 Fase C" quando `debt >= threshold`.
- Cadenza: project-scanner gira via LaunchAgent (parte di morning-brief pipeline, pattern operativo Luke RunAtLoad).

**Validazione loop end-to-end post-S10 (eseguita S11 2026-05-12)**:
- Pre-S10: ARGOS 14693, FLUXION 3277, Guardian 16398 righe handoff.
- Post-S10 archive + re-scan: ARGOS 0, Guardian 0, FLUXION 41 (file auto-rigenerato post-archive, sotto threshold, no false alert).
- Brief domani mostrerà 0 segnali "compilation Karpathy raccomandata" → loop funziona end-to-end.

**Deviation logged**: `handoff-debt-watcher-already-covered-by-scanner-briefer` — roadmap S5f assumeva component dedicato, S11 audit dimostra coverage già completa. Trend tracking (alert su crescita vs threshold assoluto) non implementato perché threshold assoluto già adeguato per use case attuale.

**Riapertura condizionata a**: detection di growth-pattern subdoli (debt sotto threshold ma crescita +30%/settimana) che il check assoluto manca. Non c'è evidenza oggi.

### 3.3 — ~~DECISIONE blueprint v3.4 canonico~~ **OBSOLETA-RISOLTA (S6, formalizzata S7 2026-05-12)**

**Stato**: superata da ingestion blueprint v3.5 in S6 FASE 1.3. v3.5 È il canonico vivente (`~/venture-os/wiki/BLUEPRINT-JD-v3.5.md`). v3.4 deprecato. Reference CLAUDE.md già aggiornata a v3.5. Karpathy compilation per-progetto resta meccanismo Layer 4 wiki, non sostituisce blueprint globale.

**Risoluzione**: nessun REVERT necessario. Deviation `blueprint-canonico-v3.5-ingerito` (S6) documenta decisione.

**FASE 3 done when**: 3.1 shipped (3.2 RESOLVED-DEDUP S11, 3.3 già chiusa).

---

## FASE 4 — Process manutenzione (ricorrente, no kickoff)

**Non sono fasi a sé, sono pattern operativi attivi a partire da S6**.

### 4.1 — Cadenza Karpathy compilation
Trigger su alert handoff-debt-watcher (FASE 3.2). Manualmente: ogni 4-8 settimane per progetto attivo.

### 4.2 — Audit deviazioni mensile
- `tail -100 state/blueprint-deviations.jsonl` → review pattern ricorrenti
- Se pattern_id si ripete ≥3 volte → rule_implication non rispettata, escalation a fix strutturale (hook gate / pre-flight script / blacklist)

### 4.3 — Health check LaunchAgent settimanale
- Riproduzione FASE 1.2 ogni 7gg
- Brief mattutino segnala se qualunque agent silente >48h

### 4.4 — Routing.yaml sync mensile
- HTTP test manuale su tutti i provider attivi (vincolo #1)
- Aggiorna last_verified
- Se cambiato qualcosa → deviation entry + update

---

## Priorità ordinata per esecuzione

| # | Fase | Item | Tempo | Blocker |
|---|------|------|-------|---------|
| 1 | 1.1 | FLUXION hook audit | 15min | nessuno |
| 2 | 1.2 | LaunchAgent alive audit | 20min | nessuno |
| 3 | 1.3 | CLAUDE.md alignment | 30min | nessuno |
| 4 | 2.2 | violation gate switch (post baseline 7gg) | 35min | baseline 2026-05-18 |
| 5 | 2.1 | OpenRouter HTTP test | 30min | ✅ S8 |
| 6 | 2.3 | seed S6-blueprint-backup decision | 20min | ✅ S7 |
| 7 | 3.1 | routing-refresh component | 2-3h | nessuno post FASE 2 |
| 8 | ~~3.2~~ | ~~handoff-debt-watcher~~ | ~~1-2h~~ | ✅ S11 RESOLVED-DEDUP |
| 9 | 3.3 | blueprint v3.4 decisione | docu only | ✅ S6 |
| 10 | B4 | hook global_session_end overwrite fix | 15min | nessuno |

**Sessioni stimate**: S6 = FASE 1 completa. S7 = FASE 2 (split su 2 sessioni se baseline non ready). S8 = OpenRouter + routing-http-verify. S9 = llm-router adapter. S10 = Karpathy compilation 3/3. S11 = loop validation + 3.2 dedup + B4 fix. S12+ = FASE 3.1 routing-refresh + FASE 2.2 violation gate switch (post 2026-05-18).

---

## Anti-pattern evitati (vincolo #4 esplicito)

- **NO** ricostruzione blueprint v3.4 da archived-handoffs (Karpathy in reverse) — è scope creep travestito da documentazione.
- **NO** scrittura nuove component prima di aver auditato esistenti (FASE 1 obbligatoria prima di FASE 3).
- **NO** stati PARTIAL: ogni fase ha gate verificabile. Se gate non raggiungibile in sessione → handoff strutturato.
- **NO** scope decisions su Luke per tecnica (vincolo #3). Roadmap è raccomandazione singola motivata.
- **NO** capex hardware come soluzione (vincolo #5). Tutto è software su esistente.

## Backlog S7+ (captured 2026-05-11 close S6, founder input post-close)

### B1 — Mike OSS self-host + wrap legal-compliance-checker (DEFERRED, 2026-05-12 S7)
**Trigger originale**: founder S6 close 2026-05-11. Mike OSS = github.com/willchen96/mike, launched 2026-04-29 (verificato S7).

**Stack reale verificato S7** (vincolo #1):
- Next.js (port 3000) + Express (port 3001) + Supabase (Postgres) + S3-compatible storage
- Node 20+ required, AGPL v3, bring-your-own-key (Claude/Gemini/OpenAI)
- **NO docker-compose**, deploy manuale
- Supabase locale richiede 8+ container self-hosted, OR cloud free tier 500MB (contraddice "files never leave perimeter")

**Decisione S7 NO-START** (motivazione singola, vincolo #3):
- Setup realistico 4-6h (non 2-3h del trigger originale, sottostimato — Supabase locale non banale)
- Use case ARGOS dealer contracts = lead-gen attivo, no firme oggi
- Use case FLUXION €497 EULA = draft once, no review continuo
- Use case Guardian = pre-production
- Skill `legal-compliance-checker` standalone già funziona senza Mike (usa LLM via Claude Code)
- Mike OSS launched 13gg, stack ancora in fast evolution → setup oggi obsoleto in 6 mesi

**Trigger riapertura**: (a) ARGOS firma primo dealer reale, O (b) FLUXION richiede EULA finale per launch, O (c) Mike OSS raggiunge v1.0 stable + docker-compose ufficiale.

**Done when**: ri-valutazione con dato di business reale, non good-practice pre-emptive.

### B2 — Humanizer skill (installata 2026-05-11 21:20 ✅ — eval ITA aperta)
**Update**: Luke ha fornito `~/Downloads/humanizer.zip` con `humanizer-skill/SKILL.md` v2.5.1 MIT (basata su Wikipedia "Signs of AI writing", compat claude-code+opencode, frontmatter allowed-tools esplicito). Installata in `~/.claude/skills/humanizer/SKILL.md`. **Skill generica EN-first**. Da valutare a S7 se funziona su output italiano sales ARGOS (Luca Ferretti dealer DE/BE/NL/AT) — se sì: chiusa. Se output ITA degradato: scrivere variante `argos-humanizer-it` con regole anti-pattern AI italiani specifici.

### B4 — ~~Fix hook `global_session_end.sh` overwrite destruttivo~~ ✅ **RESOLVED-MITIGATED (S11, 2026-05-12)**

**Stato S11 audit**: hook `~/.claude/hooks/global_session_end.sh:104-115` ha già pre-overwrite safety:
- Detecta first-line != `"# Prompt ripartenza — generato automaticamente"` (AUTO_SENTINEL)
- Sposta manual handoff in `.claude/NEXT_SESSION_PROMPT.manual.md` PRIMA di overwrite
- Logga `[VOS-SESSION-END] preserved manual handoff -> ...` a stderr

**Pattern operativo Luke complementare**: handoff strutturati cross-session usano nomi sessione-specifici (`~/venture-os/.claude/S6-HANDOFF.md`, `S7-HANDOFF.md`) → immuni al hook (file diverso, mai toccato).

**Decisione no-code-change**: l'alternativa "scrivere su `.auto.md` separato" cambia il contratto del path canonico (tooling/agent che leggono `NEXT_SESSION_PROMPT.md` si aspettano versione auto). Breaking change non motivato. Mitigation attuale + pattern operativo coprono il rischio.

**Riapertura condizionata a**: caso reale dove move-to-.manual.md fallisce O agent down-stream legge `NEXT_SESSION_PROMPT.md` aspettandosi manual content.

### B2-original — Humanizer skill italiano custom (residua, condizionata a B2 eval)
**Trigger**: founder S6 close 2026-05-11. ARGOS persona Luca Ferretti output WhatsApp/email B2B verso dealer DE/BE/NL/AT in italiano. Tono naturale = critico per response rate.
- Step 1: search `claudemarketplaces.com` (4200+ skills) + `github.com/anthropics/skills` per humanizer ITA esistente.
- Step 2: se nessuna ITA → scrivi `~/.claude/skills/argos-humanizer-it/SKILL.md` custom con regole anti-pattern AI (no "Spero che questo messaggio ti trovi bene", no "In primo luogo", no "Tuttavia"), tono dealer auto italiano.
- Mappare a ARGOS sales agent flow (verificare in `~/Documents/combaretrovamiauto-enterprise/`).
- Stima: 30min (install esistente) o 1-2h (scrittura custom).
- Done when: skill triggera su output sales ARGOS + sample message passa "detect AI" test informale.

### B3 — Pattern operativo: anthropics/skills come default discovery
**Trigger**: founder S6 close 2026-05-11. Skill marketplace ecosystem maturo (4200+ skills SkillsMP, 770+ MCP, 2500+ marketplaces aggiornato 10/5/2026).
- Aggiungi 2 righe a `~/.claude/CLAUDE.md` sezione "Indice puntatori": prima di scrivere skill da zero, check `github.com/anthropics/skills` (ufficiale) + `claudemarketplaces.com` (community).
- CLI: `/plugin marketplace add <url>` + `/plugin install <name>`.
- Stima: 5 min.
- Done when: CLAUDE.md aggiornato + 1 riga in memoria globale `~/.claude/projects/-Users-macbook/memory/`.

### C1 — Hook `global_session_end.sh` husky-aware (S11b 2026-05-13, deferred)
**Trigger**: analisi `~/.claude/session-log.txt` S11b mostra FLUXION = 50/63 commit-failed (79%). Root cause: hook auto-commit tenta `git commit` semplice, ma `.husky/pre-commit` esegue lint/typecheck/test → fail → hook si arrende.

**Scope**: hook deve detectare presenza `.husky/pre-commit` o `.git/hooks/pre-commit` non-sample, e in quel caso:
- Skip auto-commit (rischio elevato di fail, husky è lavoro WIP-aware)
- Genera `.claude/WIP-MARKER.md` con timestamp + file modificati + last user prompt
- Log session-log come `result=husky-skip` invece di `commit-failed`

**Stima**: 30 min (script + test su FLUXION + verifica non rompe ARGOS/Guardian).
**Done when**: hook husky-aware shipped + 2 sessione consecutive FLUXION chiudono `husky-skip` invece di `commit-failed` + ARGOS/Guardian behavior invariato.

**Riapertura**: SUBITO disponibile, basso rischio. Candidato post-S12.

### B5 — Componente VOS `tool-scout` ✅ (SHIPPED 2026-05-12, S7)
**Esito**: v0 MVP shipped in ~1.5h (sotto stima 3-4h originale).
- `config/tool-scout-areas.yaml` — 3 aree MVP (image-inpainting, background-removal, ocr)
- `components/tool-scout/scouter.py` — stdlib only, HF public API, license whitelist+blacklist (vincolo #5 esteso)
- LaunchAgent `com.luke.vos.tool-scout` RunAtLoad, gate interno settimana ISO
- `state/tool-landscape.jsonl` + `state/tool-scout-diff.jsonl`
- briefer.py integration testato con diff simulato (Qwen-Image-Edit emerge correttamente in Segnali brief)

**Scoperta strutturale primo run** (vedi deviation `tool-scout-v0-first-run-confirms-drift-pattern`): mia raccomandazione ARGOS "LaMa" era 4 anni dietro SOTA. SOTA inpainting 2026-W20 = Qwen/Qwen-Image-Edit (Apache-2.0, 2386 likes). ARGOS prompt S163 Step 4 GO/NO-GO da valutare Qwen-Image-Edit vs LaMa.

**Espansione futura** (deferred, on-demand): aggiungere aree tts-italian, stt, llm-inference-free, vision-language quando entrano in use case attivo progetto.

### B5-old — Componente VOS `tool-scout` (entry originale, mantenuta come spec)
**Trigger**: founder S7 close 2026-05-12. Pattern strutturale VOS: framework deve fare proactive scouting alternative open source, non aspettare proposte ad-hoc CTO. Caso reale ARGOS image sanitizer: ho proposto LaMa "soluzione certa" senza confronto con BiRefNet/RMBG-2.0/BrushNet/PowerPaint/Florence-2/Replicate. Vincolo #2 (ricerca attiva) applicato a metà. Inoltre scoperto RMBG-2.0 license non-commercial = vincolo #5 esteso a license-trap.

**Scope**:
- Componente: `~/venture-os/components/tool-scout/scouter.py`
- Cadenza: LaunchAgent RunAtLoad (pattern operativo Luke), eseguito 1x/settimana
- Aree calde da monitorare (config `~/venture-os/config/tool-scout-areas.yaml`):
  - image-inpainting (LaMa, BrushNet, PowerPaint, IOPaint platform)
  - background-removal (BiRefNet, RMBG-x.0 license tracking, rembg)
  - ocr (PaddleOCR, EasyOCR, Tesseract, Surya)
  - tts-italian (XTTS, Coqui, Bark, ElevenLabs API)
  - stt (Whisper variants, Insanely-Fast-Whisper, faster-whisper)
  - llm-inference-free (OpenRouter free models, HF Inference API, Together free, Groq free)
  - vision-language (Florence-2, Qwen2-VL, LLaVA, InternVL)
- Per ogni area: WebSearch SOTA 2026 + estrai license + estrai requirement HW
- Output: `~/venture-os/state/tool-landscape.jsonl` append daily snapshot {area, top_3, license, hw_req, hosting_option, last_change}
- Diff vs precedente snapshot → entry brief mattutino "tool landscape update: <area> new SOTA <tool> (was <prev>, reason <X>)"

**License-trap detection (vincolo #5 esteso)**:
- License whitelist: MIT, Apache-2.0, BSD-*, MPL-2.0, AGPL-3.0 (con disclaimer copyleft)
- License blacklist: "non-commercial", "source-available", proprietary, "research-only" → FLAG nel snapshot, mai proposto come default
- Esempio: RMBG-2.0 source-available non-commercial → SOTA accuracy ma blacklist per ARGOS B2B revenue

**Stima**: 3-4h prima versione (script + areas config + LaunchAgent + brief integration).
**Done when**: 7 aree popolate in tool-landscape.jsonl + diff detection testato simulando snapshot vecchio + brief mostra "tool landscape update" sezione.

**Anti-pattern da evitare**: scope creep verso "AI tool curation platform". Tool-scout VOS è interno, MVP minimale, output JSONL grezzo per CC reading, non UI/dashboard.

## Re-audit roadmap

Questa roadmap è documento vivente. Quando una fase chiude → marcare ✅ qui + commit. Quando emerge nuova priorità → entry in deviation log "roadmap-revision-S<N>" + update qui.
