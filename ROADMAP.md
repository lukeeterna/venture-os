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

### 1.2 — Audit LaunchAgent alive
**Verifica che i 4 agent VOS girano davvero (non solo registered)**.
- `tail -10 state/host-monitor.jsonl` → ultime entry recenti (≤24h)?
- `ls -la briefs/` → brief più recente è di oggi/ieri?
- `tail -10 state/claude-memory-rsync.log` → backup recente?
- `tail -10 state/git-push.log` → push hook funzionante?
- Se qualcuno silenzioso ≥3gg → diagnosi (`launchctl list | grep luke.vos`, plist load status)
- Stima: 20 min
- **Done when**: report stato 4/4 con timestamp ultima esecuzione + fix per chi è silente

### 1.3 — Allineamento CLAUDE.md vs stato reale (parzialmente chiuso 2026-05-11)
**Reference dangling identificate**:
- ~~`~/venture-os/wiki/BLUEPRINT-JD-v3.4.md` — file non esiste~~ → **CHIUSO**: blueprint v3.5 ingerito (supersede v3.4), reference CLAUDE.md aggiornata.
- `routing-refresh` notturno — componente non esiste → resta aperto, FASE 3.1
- Possibili altre — audit completo path-by-path (rimane da fare per altre reference)

Azione residua:
- Verificare altre reference puntatori CLAUDE.md riga-per-riga (routing.yaml exists, projects-whitelist.yaml exists, costs.jsonl — verificare)
- Decisione architetturale REVISIONATA: blueprint v3.5 È il blueprint canonico vivente. Karpathy compilation per-progetto resta meccanismo di Layer 4 wiki, ma non sostituisce blueprint globale.
- Stima residua: 15 min
- **Done when**: CLAUDE.md ha 0 reference dangling verificabili con file_check

**FASE 1 done when**: 3/3 task verdi.

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

### 2.3 — Seed S6-blueprint-backup → decisione close/promote
**File**: `seeds/S6-blueprint-backup.md` (S5-prep deviation "git-backup-multi-remote-codified-ad-hoc")
- Lettura seed
- Decisione: formalizzare convention git multi-remote (master ovunque, fire-and-forget, drift detect) in COMPILED-STATE VOS-globale OR archivia seed come "convention codificata in deviation log, no formal doc needed"
- Stima: 20 min
- **Done when**: seed o (a) promosso a fase implementation, o (b) archiviato con motivo

**FASE 2 done when**: 3/3 task verdi, no debiti aperti da S5b-S5f.

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

### 3.2 — Karpathy compilation periodica
**Oggi**: chiamata manuale per progetto. **Goal**: trigger automatico quando handoff debt cresce.
- Scope: componente `handoff-debt-watcher` che misura ogni N giorni numero file handoff per progetto, se >threshold (es. 50 file o 500K char) genera brief alert "ARGOS handoff debt re-cresciuto, run compiler"
- NON esegue compiler automaticamente (richiede --archive che è destructive — gate manuale Luke)
- Stima: 1-2h
- **Done when**: watcher LaunchAgent installato, threshold definiti per ARGOS/FLUXION/Guardian, alert testato

### 3.3 — DECISIONE: blueprint v3.4 canonico SI o NO
**Tradeoff**:
- Pro canonical doc: onboarding nuove sessioni più rapido, decisioni passate visibili senza scavare archived-handoffs
- Contro: doc statico va aggiornato manualmente, drift inevitabile, duplica info che già è in COMPILED-STATE

**Decisione raccomandata**: **NO blueprint canonico globale**. Karpathy compilation per-progetto è sufficiente. Update CLAUDE.md rimuovendo reference v3.4 (già fatto in FASE 1.3). Se in S10+ emerge bisogno reale di doc globale → riapri decisione con dati.

**FASE 3 done when**: 3.1 + 3.2 shipped, 3.3 decisione formalizzata in deviation log.

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
| 5 | 2.1 | OpenRouter HTTP test | 30min | Luke account creation |
| 6 | 2.3 | seed S6-blueprint-backup decision | 20min | nessuno |
| 7 | 3.1 | routing-refresh component | 2-3h | nessuno post FASE 2 |
| 8 | 3.2 | handoff-debt-watcher | 1-2h | nessuno post 3.1 |
| 9 | 3.3 | blueprint v3.4 decisione | docu only | post 3.1+3.2 |

**Sessioni stimate**: S6 = FASE 1 completa. S7 = FASE 2 (split su 2 sessioni se baseline non ready). S8-S9 = FASE 3. S10+ = manutenzione.

---

## Anti-pattern evitati (vincolo #4 esplicito)

- **NO** ricostruzione blueprint v3.4 da archived-handoffs (Karpathy in reverse) — è scope creep travestito da documentazione.
- **NO** scrittura nuove component prima di aver auditato esistenti (FASE 1 obbligatoria prima di FASE 3).
- **NO** stati PARTIAL: ogni fase ha gate verificabile. Se gate non raggiungibile in sessione → handoff strutturato.
- **NO** scope decisions su Luke per tecnica (vincolo #3). Roadmap è raccomandazione singola motivata.
- **NO** capex hardware come soluzione (vincolo #5). Tutto è software su esistente.

## Backlog S7+ (captured 2026-05-11 close S6, founder input post-close)

### B1 — Mike OSS self-host + wrap in legal-compliance-checker skill
**Trigger**: founder S6 close 2026-05-11. Mike OSS (mikeoss.com) = open-source legal AI rilasciato 5/5/2026, contract drafting + tracked changes versioning, self-hostable, bring-your-own-key (vincolo #5 ✓).
- Self-host su iMac (Next.js+Supabase, no AVX2 needed). Stack: `willchen96/mike` GitHub + Railway template.
- Wrap come tool del `~/.claude/skills/legal-compliance-checker/SKILL.md` già installato (39 skills enterprise).
- Use case prioritario: stage 5 venture pipeline (blueprint sez. 4) — ARGOS dealer contracts, FLUXION €497 EULA, Guardian ToS future.
- Stima: 2-3h setup + 30min wrap skill.
- Done when: Mike OSS reachable via `ssh imac "curl localhost:3000/health"` + skill testabile su contratto sample.

### B2 — Humanizer skill italiano per ARGOS sales agent
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

## Re-audit roadmap

Questa roadmap è documento vivente. Quando una fase chiude → marcare ✅ qui + commit. Quando emerge nuova priorità → entry in deviation log "roadmap-revision-S<N>" + update qui.
