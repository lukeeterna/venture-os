# Prompt S171 — ARGOS terminal — re-baseline target + mystery shopper + E2E test fino bonifico

> **Workspace**: terminal Claude Code con `cwd ~/Documents/combaretrovamiauto-enterprise`
> **NON** in terminal VOS. Decisione split S170 close.
> **Self-contained**: leggi questo prompt + memory pointers + DECISIONS.md path canonical e parti.

---

## Stato precedente (S170 close + post-close founder)

### Verde tecnico
- Pipeline outbound E2E validata S169
- Pipeline inbound classifier E2E validata S170 (Groq cascade, intent=greeting on "Ok")
- GROQ_API_KEY ruotata 2026-05-14, daemon restart pickup confermato

### Rosso strutturale scoperto S170 close + post-close
1. 🔴 **Bug daemon duplicate sends** (Open Q #12 DECISIONS) — daemon invia N msg identici per ogni outbound row
2. 🔴 **Target wrong wave 1 S170**: contattati dealer stock 30/49/30/200/n/a → ESCLUSIONE corretta era stock <20 micro-commissione (D-28 founder S170-post-close)
3. 🔴 **Paradigma wrong V5**: D-26 V5 cold-lead self-introduce SUPERSEDED. Founder ha richiesto paradigma INVERSO: mystery shopper Layer 2 (richiedere quote → pivot Argos organico)
4. **Dataset burned**: 4/18 dealer Sud non re-contattabili. PLUS dataset geo-bias Sud-only (Open Q #10)
5. **AMBRA agent stato unknown**: Phase 6 roadmap prevede WA autonomo "umano". Critical path per D-27 Layer 3 — audit obbligatorio

### Founder explicit S170-post-close (raw prompt)
- Target = **micro-dealer commissione P.IVA forfettaria stock <20** (D-28)
- Service offering: brand + scouting + import calc + docs + area riservata formativa
- Approach scaltro: NON ARGOS si presenta, MA finta richiesta auto → pivot organico "ho sentito di Argos" (D-27 Layer 2)
- **NO americanate**, NO CTA aggressivi, italiano natural
- **Dealer chiede auto, NO sistema propone** (no spam BTW X3)
- Pagamento ufficiale = **BONIFICO BANCARIO** (NO Stripe/SumUp/PSP altri)
- Test E2E completo fino bonifico simbolico (€0 o €1) + dossier + tracking veicolo fittizio
- Founder phone test = **3314928901**
- IBAN multipli config DOPO pipeline funziona

---

## Goal S171 — Sequenza atomica priorità riordinate

### P0 — Audit AMBRA agent stato (1-2h)
Critical path: D-27 Layer 3 depends. Domande aperte:
- AMBRA built? Codice esistente in `~/Documents/combaretrovamiauto-enterprise/wa-intelligence/` o altro path?
- FSM design progettato? Lessico micro-dealer integrato?
- Cascade LLM mapping (Groq primary? OpenRouter fallback)?
- Test coverage?

```bash
# Discovery AMBRA codebase
find ~/Documents/combaretrovamiauto-enterprise -type f \( -name "*ambra*" -o -name "*AMBRA*" \) 2>/dev/null
grep -r "ambra\|AMBRA" ~/Documents/combaretrovamiauto-enterprise/wa-intelligence/ ~/Documents/combaretrovamiauto-enterprise/src/ 2>/dev/null | head -30
cat ~/Documents/combaretrovamiauto-enterprise/.planning/ROADMAP.md | grep -A20 "Phase 6\|AMBRA"
```

**Done when**: file `wiki/projects/ARGOS/AMBRA-AUDIT.md` con stato corrente + gap to Phase 6 production-ready.

### P1 — Research microdealer commissione (P2.A, 4-agent thread, 2-3h)
Research-protocol-v2 4-agent parallel. Output: `wiki/projects/ARGOS/RESEARCH-MICRODEALER-COMMISSIONE.md` con sezioni:

**Agent 1 — Profilo segmento**:
- Dati demografici micro-dealer auto Italia (count, geo distribution, age tier, gender)
- Regime fiscale forfettario applicabilità auto commercio (limite €85k revenue, codice ATECO 45.11)
- Stack tecnologico typical (WA business? CRM? landing? marketplace listing)
- Fonti: Federauto, Confapi PMI Auto, AsConAuto, Istat commercio auto

**Agent 2 — Pain points + needs**:
- Pain reale scouting EU (lingue, expertise, tempo)
- Pain calcolo tariffe import (IVA intra-UE, dazi, F24)
- Pain produzione documenti (atto vendita cross-border, COC, IMT, fattura UE)
- Pain trust/credibility (cliente finale chiede certificazioni)
- Fonti: forum Reddit r/automobili / r/ItaliaCarOwners (lurk), Telegram groups, FB groups

**Agent 3 — Channel discovery**:
- DOVE micro-dealer vivono online: Telegram groups specifici, FB groups (search "dealer auto Italia commissione"), Reddit, forum specializzati (es. AutoScout24 Italia community, mobile.de forum IT users), eventi locali (Salone Auto Bologna, fiere fascia bassa)
- DOVE vendono: Subito.it (segnale: dealer profile con 5-15 auto + annunci EU), AutoScout24.it (search dealer pages), siti propri minori
- Output: lista 10+ canali ranked per ROI scouting

**Agent 4 — Lessico + culturale**:
- Slang micro-dealer commissione (es. "trovami una macchina", "lavoro su commissione", "porto auto da fuori", "tarata", "spesa")
- Modalità comunicazione preferita (WA > email > telefonata?)
- Trust signals (foto auto da Germania? CRO bonifico verificabile? recensioni passaparola?)
- Anti-pattern (cosa li fa scappare: corporate-speak, urgency, "lead", "ROI", "funnel")

**Vincoli**:
- WebSearch + WebFetch max 60 min totale (vincolo #2 ricerca attiva)
- Fonti verificate (vincolo #1) — no estrapolazioni inventate
- Output file con [verified] / [unverified-insight] marker per ogni claim

### P2 — Dataset re-baseline filtro stock<20 + extension geo (2-3h)
**Step 1 — Audit current dealer_network.sqlite**:
```sql
SELECT region, COUNT(*) FROM dealers WHERE stock_size < 20 GROUP BY region;
-- Quanti dei 18 attuali sono target valido?
```

**Step 2 — Re-calibrate CoVe v4 scoring**:
- Feature weights per target micro-commissione:
  - `few_listings` weight HIGH (era 2.0 → propose 4.0)
  - `brand_diversity` weight LOW (era 2.0 → propose 0.5)
  - `premium_pct` moderate (mantieni 1.5)
  - NEW feature: `pivot_signal` (dealer commissione=fa scouting clienti, signal via descrizione annuncio "su richiesta" / "trovo io")
- Soglia `fit_argos`: re-test su top-10 dealer per coerenza

**Step 3 — Extension scout Nord/Centro/Isole**:
- Open Q #10: 0 dealer Nord/Centro/Isole in dataset attuale
- Re-run scout pipeline su 20 regioni Italia con filtro stock<20
- Target: ≥30 dealer micro-commissione validati ranked

**Done when**: `dealer_network.sqlite` ha ≥30 dealer NEW (non wave 1 burned) + stock<20 + geo balanced + score_fit ricalcolato.

### P3 — Fix daemon duplicate sends (Open Q #12, 4-6h)
Diagnostic + fix come specificato precedentemente:
1. Query duplicate sent_ts stamps wave 1 S170
2. Tail logs daemon S170 send window (20:43-20:46)
3. Inspect `wa-daemon.js` poll/send logic
4. Identify root cause: poll race / Baileys retry / schema missing UNIQUE
5. Fix design + implementation
6. **Verify fix**: 3 test outbound consecutivi su founder phone 3314928901 → exactly 1 msg ricevuto per ogni outbound. Solo se 3/3 = 1 msg → P3 verde.

### P4 — Design approach scaltro D-27 Layer 1/2/3 artifacts (3-4h, depends P0+P1)
**Layer 1 setup**:
- PRAW Python (Reddit API) → join r/ItaliaCarOwners r/automobili r/ItaliaCareerHelp
- Telethon Python (Telegram) → join groups identificati P1 Agent 3
- Subito.it scraping (rate-limited, existing scraper config)
- Output: `tools/layer1-scout.py` con join + listen + lessico match filter

**Layer 2 mystery shopper script template**:
- Numero "diverso" da Luca Ferretti brand: COSA usare? (vedi DUBBI FOUNDER sotto)
- Script base: "Buongiorno, cerco una BMW Serie 3 anno 2021 km <50k. Riesce a propormi qualcosa nel suo piazzale o riesce a trovarmela?"
- Risposta dealer → follow-up natural 2-3 turni → pivot organico "ho sentito di un servizio Argos..."
- Stile: italiano natural, varia messaggi (NO template fisso = bypass spam detection)

**Layer 3 AMBRA integration**:
- Solo dopo P0 audit + P1 lessico micro-dealer
- AMBRA gestisce conversazione dealer post-pivot (handoff Layer 2 → Layer 3)
- FSM: warm_curious → asking_details → showing_dossier → pre_deal_ready

### P5 — Test E2E su founder phone 3314928901 (2-3h, depends P0-P4)
**Steps test E2E completo**:
1. Founder simula dealer micro-commissione (alias "Mario, dealer Lecce stock 8 auto")
2. Mystery shopper WA (Layer 2) chiede quote BMW Serie 3
3. Dealer Mario risponde con quote (founder improvvisa)
4. Mystery shopper follow-up 2 turni → pivot Argos
5. Dealer Mario "curioso" → richiesta info Argos
6. **Handoff brand**: numero Luca Ferretti contatta Mario "ho sentito che mi cercava info"
7. Argos invia dossier servizio + chiede dealer di richiedere auto specifica (NON push)
8. Dealer Mario chiede auto specifica (es. BMW X3 anno 2022 km <50k)
9. Argos scout fittizio + invia preview dossier protected (D-25 image-shield)
10. Dealer accetta pre-deal contract (DocuSeal D-22/D-24, founder firma test)
11. Argos invia quote formale auto + condizioni
12. Dealer accetta → **bonifico simbolico €0-1** su IBAN test Argos
13. Sistema riceve bonifico (manual reconciliation o webhook PSD2 se setup)
14. Trigger post-payment: dossier finale + tracking auto fittizio (es. "auto presa in carico spedizioniere, ETA 7gg")
15. Closure cycle: delivery confirm, dealer feedback

**Done when**: 15-step cycle completato senza intervento manuale extra (oltre founder simulation dealer). Tutti msg correctly sent/received, payment received-trigger fired, dossier+tracking arrived.

### P6 — IBAN multipli config (1h, depends P5 verde)
Solo se P5 verde:
- Definire schema config IBAN multipli (per_region? per_dealer? per_amount_range?)
- File `config/iban-routing.yaml` con N IBAN
- Logic selezione IBAN per outbound payment request
- Test integrazione P5 flow con N=2 IBAN

---

## DUBBI FOUNDER da chiarire (vincolo "SE HAI DUBBI CHIEDI")

1. **Numero secondo per mystery shopper Layer 2**: il numero 3314928901 è già contatto ARGOS daemon (whitelist pipeline). Per mystery shopper serve numero DIVERSO da brand Luca Ferretti. Hai:
   - (a) 2° SIM/numero attivo che possiamo usare? — quale?
   - (b) Burner number temporaneo (es. Tally / GoogleVoice / TextNow gratuiti)?
   - (c) Stesso numero pretending "civilian" senza identity Luca Ferretti?
   **Raccomandazione CTO**: (a) 2° numero reale è più credibile. (b) burner free è zero-cost ma trust signals minori. Tu decidi.

2. **Canali specifici Layer 1**: Reddit/Telegram/FB groups dealer auto Italia commissione — hai pointer a gruppi specifici già conosciuti? Senza pointer founder, Agent 3 ricerca blind richiede 60+ min. Con pointer → 15min validation.

3. **AMBRA agent stato**: Phase 6 ROADMAP cita AMBRA. Built già? Quale file/modulo? Founder ha designs FSM o è ancora concept?

4. **IBAN multipli — quanti e che criterio routing**? (defer fino P5 verde, ma utile sapere upper bound: 2 IBAN? 5? per_region 20?)

5. **Stile italiano "senza americanate"**: hai esempi concreti di tono che funziona vs tono che NON funziona? (es. screenshot conversazione tua che ha funzionato, NDA permitting)

6. **Auto fittizia P5 test**: hai preferenza brand/modello/anno per simulation? (default: BMW Serie 3 2021 km 45000)

---

## Vincoli S171

- **#1** verifica fattuale: Baileys/SQLite/daemon source verified, no claim API inventate
- **#3** raccomandazione singola CTO (P0-P6 sequenza, NO opzioni A/B/C)
- **#4** autocritica 4 punti per ogni design (P0 AMBRA gap, P3 fix daemon, P4 mystery shopper, P5 E2E)
- **#5** zero capex (OSS only, BONIFICO no PSP)
- **#6** verde gate: P5 E2E completato single-msg-per-outbound verified OR handoff S172 strutturato
- **#7** /context periodicamente — sopra 60% chiusura
- **#9** no diplomatico — disagree con dati se serve
- **#10** verificato > verosimile (P1 research [verified] vs [unverified] marker)
- **#11** root cause (target wrong + paradigm wrong + bug daemon — fix strutturali)

---

## Memory pointers VOS-side da leggere

Path: `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/`
File rilevanti:
- `feedback_argos_target_microdealer_commissione.md` — TARGET DEFINITIVO (D-28)
- `feedback_wa_daemon_duplicate_sends.md` — BUG dettagli (Open Q #12)
- `feedback_argos_scope_italia.md` — scope nazionale no geo-anchor
- `feedback_premature_optimization.md` — NO legale/fiscale pre-revenue
- `feedback_pattern_S159_mitigation.md` — B6 3-line check pre-action
- `feedback_workspace_split_vos_vs_argos.md` — regola workspace

---

## Riferimenti

- DECISIONS.md path: `/Volumes/MontereyT7/venture-os/wiki/projects/ARGOS/DECISIONS.md`
  - D-26 SUPERSEDED V5 cold-lead (target wrong + paradigm wrong)
  - D-27 PROPOSED mystery shopper hybrid 3-layer (pending P1 research)
  - D-28 DECIDED target = micro-dealer commissione stock<20
  - Open Q #12 BLOCKER bug daemon
  - Open Q #13 IBAN multipli config (post P5 verde)
  - Open Q #14 AMBRA agent stato (P0 audit)
  - Open Q #15 dealer-pull-only no system-push
- ARGOS repo: `~/Documents/combaretrovamiauto-enterprise/`
- ROADMAP.md ARGOS: Phase 0/5/6 (Phase 6 AMBRA = critical path now)
- STRATEGY.md ARGOS: persona Luca Ferretti + lessico commissione informale
- Last VOS commits S170:
  - `70f358d` workspace split + PROMPT-S171-ARGOS v1
  - `174260d` Open Q #12 BLOCKER daemon dedup
  - `dcc2721` routing.yaml v5.1
  - Current commit pending: D-27/D-28 + PROMPT-S171 v2

## Start trigger

Founder apre terminal ARGOS, copia-incolla questo prompt. Tu (Claude ARGOS-instance) parti da:
1. **Rispondi prima ai 6 DUBBI FOUNDER** (block until clarified — non procedere blind su mystery shopper senza numero 2°)
2. Poi P0 AMBRA audit + P1 research microdealer parallel
3. Sequenza P2-P6 dopo unblock dubbi
