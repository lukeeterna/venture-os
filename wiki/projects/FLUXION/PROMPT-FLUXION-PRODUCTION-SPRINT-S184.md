# Prompt FLUXION — Production Sprint S184-S190 — Public Launch Path (v3 post-review)

> **Workspace**: terminal Claude Code con `cwd /Volumes/MontereyT7/FLUXION`
> **NON** in terminal VOS o ARGOS. Workspace dedicato FLUXION (decisione split S170).
> **Priority CTO**: priority 1 production (founder S170-post-close: "FLUXION deve andare in produzione quanto prima").
> **Versione**: v3 post-review CTO peer-review applicata 2026-05-15 (3 BLOCKER + 7 HIGH risolti, vedi commit log)

---

## ⛔ PRE-CONDITIONS — FOUNDER ACTION REQUIRED PRIMA DI PROCEDERE

**Senza queste 7 risposte, NON aprire terminal FLUXION**. Le opzioni A/B/C nel prompt sono BANNED (vincolo #3 founder). L'istanza Claude Code FLUXION non può procedere blind.

### Action 1 — Ehiweb (BLOCKER P1-BLOCKED, P3 dependency)
Risposta a 3 domande:
- Sei già **reseller** Ehiweb (contratto firmato)? Sì/No
- Hai **link affiliate** Ehiweb attivo? Sì/No → URL se sì
- Quale **tariffa €/mese** cliente paga post-trial Sara?

### Action 2 — Clienti tier BASE €297 esistenti (BLOCKER P0)
Esegui query DB prod (o staging):
```bash
sqlite3 /path/to/fluxion.db "SELECT COUNT(*) FROM licenses WHERE tier='BASE' OR tier_name LIKE '%BASE%' OR price=297"
```
Output: count number. Se >0 → strategia migration (grandfather/upgrade-forced/refund). Se =0 → safe drop tier.

### Action 3 — Landing pages per verticale (BLOCKER P4)
Per ognuno dei 9 verticali (saloni, medical, palestre, auto, odonto, vet, servizi, immobiliare, assicurazioni):
- Esiste landing dedicata? Sì/No
- URL se sì
- Production-ready o draft?

Se 0/9 esistono → P4 NEW task built da zero, MVP 1 verticale.

### Action 4 — Video demo Sara (BLOCKER P4)
Per ognuno dei 9 verticali:
- Video demo recorded? Sì/No
- Formato + length + path file se sì

Se 0/9 esistono → P4 NEW task recorded da zero, MVP 1 verticale.

### Action 5 — License activation mechanism (BLOCKER P1)
Risposta a 1 domanda:
- Meccanismo attuale: **online API check**, **offline keyfile**, o **hardware-bound** (machine fingerprint)?
- File path codice in `src-tauri/src/license/`?

Senza questa info, P1 MSI build inventerebbe meccanismo non matching → rottura.

### Action 6 — Dealer-pull vs system-push applicabilità FLUXION (BLOCKER P3)
S170-post-close hai stabilito "Dealer richiede auto, NO sistema propone" per ARGOS. Per FLUXION:
- Stesso vincolo applica? Sì/No
- Se sì: P3 sales agent ridisegnato come **inbound only** (landing + SEO + referral + ads)
- Se no: P3 sales agent può essere **outbound WA AMBRA-pattern** (richiede Action 7)

### Action 7 — Export pattern AMBRA (BLOCKER P3 outbound path)
Solo se Action 6 = "outbound OK":
- Copia file/snippet AMBRA agent ARGOS in `/Volumes/MontereyT7/FLUXION/docs/reference/AMBRA-pattern.md`
- L'istanza FLUXION non ha accesso a codebase ARGOS — pattern va portato esplicito
- Comando suggerito: `cp ~/Documents/combaretrovamiauto-enterprise/<ambra-file> /Volumes/MontereyT7/FLUXION/docs/reference/AMBRA-pattern.md`

**Quando tutte 7 risposte ottenute → re-edit pre-conditions section sostituendo "BLOCKED" con risposte concrete. POI paste prompt all'istanza FLUXION.**

---

## Stato attuale verificato (discovery S170 VOS-meta 2026-05-14)

**Pre-launch ALPHA in corso**. Documentazione completa:
- README ✓
- PRD-FLUXION-COMPLETE.md (PRD aggiornato 2026-03-03, sez 1 pricing patched S170-post-close)
- ROADMAP_S184_REVISED_ALPHA.md
- ROADMAP_REMAINING.md
- TESTING_SUITE_COMPLETE.md (26+ test case multi-turn Sara)
- docs/launch/PRE-LAUNCH-AUDIT.md (gate 3 readiness 2026-05-11)
- docs/launch/RUNBOOK-P1-SARA-LIVE-TEST.md
- docs/launch/RUNBOOK-P2-WIN-MSI-BUILD.md
- docs/perf/D3-voice-latency.md (P95 1330ms vs target <800ms — DEFERRED post-beta)
- docs/SUPPORT-RUNBOOK.md
- docs/PMI_VERTICALS_ANALYSIS.md (9 verticali)
- docs/helpdesk-wiki/wiki/entities/win10-installation.md (install guide self-signed)

**Stack**: Tauri 2 + React 19 + SQLite + Voice Agent Python (Twilio + Groq + Piper TTS)

**Founder decision S170-post-close (CRITICAL CHANGES applicate)**:
1. **Pricing 2-tier definitivo** (DROP €297 Base, gestione migration dipende Action 2):
   - PRO **€497**: 3 verticali + 1 mese trial Sara Voice Agent **incluso**
   - ENTERPRISE **€897**: 6 verticali + Sara lifetime
2. **Meccanica Sara post-trial €497**: cliente attiva abbonamento Ehiweb separato. FLUXION deve SEMPLIFICARE (Action 1 risolve approccio).
3. **WA FLUXION operativo**: numero `3314928901` brandato "Erica Fluxion" + logo già attivo
4. **No code signing**: install guide esistente (Action skip, già risolto)
5. **Pagamento**: BONIFICO BANCARIO ONLY (NO Stripe/SumUp/PSP)
6. **TUTTO MECHANIC tradeoff**: 1 click "Esegui comunque" one-time + payment manual reconciliation accettati; resto installazione (license auto-activation, Sara setup, Ehiweb integration) MUST stay automated

---

## Goal Sprint S184-S190 — Nuova sequenza critical-path first-paying-customer (post-review)

### P0 — Patch pricing safe migration (1-2h)

**Pre-check (BLOCKER)**: completata Action 2 sopra. Se clienti BASE €297 esistono >0 → applica strategia migration scelta founder PRIMA di toccare schema.

**Task**:
- Audit codebase reference €297/Base tier:
  ```bash
  grep -rE "297|tier.*[Bb]ase|tier.*BASE" --include="*.ts" --include="*.tsx" --include="*.rs" --include="*.py" --include="*.md" --include="*.json" --include="*.yaml" /Volumes/MontereyT7/FLUXION/ 2>/dev/null
  ```
- Patch files identificati: `src-tauri/src/license/`, `src/components/`, marketing materials, DB migration safe (additive if clienti BASE esistono, destructive only se 0 BASE)
- Update PRD reference (già done VOS-side, verify cross-mount)

**Done when**: zero reference tier Base €297 in codebase production OR (se migration grandfather) flag `tier=BASE_GRANDFATHERED` mantained per clienti esistenti + nuova vendita solo PRO/ENTERPRISE.

### P1 — Build MSI Windows UNSIGNED (3-4h)

**Pre-check (BLOCKER)**: completata Action 5 (license activation mechanism). Read `src-tauri/src/license/` PRIMA di modificare anything.

**Task** (da `docs/launch/RUNBOOK-P2-WIN-MSI-BUILD.md`):
- Tauri build target Windows MSI
- NO code signing (vincolo #5 + guida cliente esistente)
- License auto-activation post-bonifico (dipende mechanism identificato Action 5)
- Test installazione VM Win10/Win11 via guida `docs/helpdesk-wiki/wiki/entities/win10-installation.md`

**Done when**: MSI build clean + install Win10/Win11 VM via guida cliente + Sara starts correctly + license auto-activates con key valida.

### P2 — Payment flow bonifico manuale (4-6h, NEW from review)

**Founder decision S170**: BONIFICO ONLY. Tauri app non gestisce bonifico auto → servono pezzi backoffice.

**Task**:
1. **Template fattura forfettaria PDF** (Python ReportLab o LaTeX): cliente richiede, FLUXION genera fattura €497/€897, founder firma manuale
2. **License key generation script**: input bonifico received (IBAN + amount + customer email) → output license key + email automation
3. **Email automation**: SMTP free tier (Mailgun 100/giorno free, Sendgrid 100/giorno free, OR Gmail SMTP founder account)
4. **Reconciliation manual workflow**: founder check bonifici settimanali (PSD2 open banking se disponibile, altrimenti login banca + CSV export)

**Stack**: Python script + Cloudflare Workers free tier per webhook generation, SQLite tracking tabella `licenses_pending` / `licenses_activated`.

**Done when**: end-to-end test: founder esegue script con dati bonifico fake → fattura PDF generata + license key generata + email con MSI download + key arrivata customer mailbox test.

### P3 — Sales agent FLUXION (5-8h, DESIGN dipende Action 6)

**Pre-check (BLOCKER)**: completata Action 6 (dealer-pull applicabilità).

**Path A — Action 6 = "outbound OK"** (richiede anche Action 7 pattern AMBRA):
- WA AMBRA-pattern style "umano"
- Stack: Baileys (riuso pattern), numero `3314928901` Erica Fluxion
- FSM design replicato da `docs/reference/AMBRA-pattern.md` (Action 7)
- Outreach verticali target (saloni MVP primo, espansione later)
- Stile italiano natural, NO americanate, NO CTA aggressivi
- **Raccomandazione singola (vincolo #3)**: design FSM 3-stati (warm_curious → asking_details → demo_offered), no opzioni

**Path B — Action 6 = "dealer-pull only applica FLUXION"**:
- NO outbound WA proactive
- Inbound only: landing + SEO + referral + ads paid (defer ads se vincolo #5 strict)
- Sales agent funzione = handle inbound qualification
- WA `3314928901` Erica Fluxion = response to inbound query only

**Done when (Path A)**: 1 verticale MVP (saloni) + 5 prospect contattati + 1 demo video sent + tracking conversioni.
**Done when (Path B)**: landing 1 verticale live + inbound form + Erica WA risponde a 1 inbound query test.

### P4 — Landing + video demo per verticale (3-5h, NEW prerequisite P5)

**Pre-check (BLOCKER)**: completate Actions 3 + 4. Se 0/9 esistono → produce MVP da zero per 1 verticale (raccomando: **saloni di bellezza** — più alta densità + più semplice copy + Sara già testata).

**Task MVP 1 verticale**:
1. **Landing page** production-ready: hero + pain → soluzione + Sara demo video embed + pricing 2-tier + CTA "Richiedi info" form
   - Stack: HTML/CSS/JS statico hostable Cloudflare Pages free
   - Domain: TBD founder action (fluxion.it? sottosezione? altro?)
2. **Demo video Sara**: screen-record 60-90 sec con scenario saloni real call (mock client, Sara prenota appuntamento)
   - Tool: OBS Studio macOS Big Sur compatible (free, OSS)
   - Edit: iMovie (built-in macOS, free)
   - Hosting: Cloudflare Stream free 1000 min/mese OR YouTube unlisted

**Done when**: landing live + video embedded + form invio email founder + Lighthouse score >85 mobile.

### P5 — Beta program 6 clienti (gate readiness pre-launch)

**Pre-check**: P0-P4 done (in particular P3 sales agent + P4 landing+video).

**Task** (da `ROADMAP_REMAINING.md`):
- Recruit 6 beta clienti SMB Italian (target 1 verticale MVP saloni)
- Tier proposto: free 1 mese o sconto 50% (€248 invece di €497) per feedback estensivo
- Daily ping support, weekly check
- Metric: bug count, feature requests, NPS

**Done when**: 6 beta onboarded + 4 settimane data raccolti + go/no-go launch decision.

### P6 — Sentry con hard cap rate limiting (2-3h)

**Trigger**: post P5 beta running (errors da real users più informativi che synthetic).

**Task** (vincolo #5 strict):
- Sentry SDK Tauri + Python Voice Agent
- **Hard cap client-side**: rate limit max 100 events/giorno/install (anti-runaway crash spam)
- Server-side: monitoring usage Sentry dashboard
- **Se sfora 5K/mese free tier → DISABLE Sentry, NOT upgrade paid** (vincolo #5)
- Alert founder Telegram quando usage > 80% free tier

**Done when**: 1 forced crash → event in Sentry < 60s + rate limit verified su test simulato 200 events.

### P7 — Sara latency optimization (4-6h, DEFERRED post-beta)

**Trigger**: solo se beta clienti P5 lamentano latency. Altrimenti slittare S191+.

**Task** (da `docs/perf/D3-voice-latency.md`):
- Bottleneck IPC analysis flame graph
- Optimization candidates: Groq cascade vs single-model, Piper TTS streaming
- Target P95 <800ms, P99 <1200ms

**Done when**: 3 consecutive benchmark verificato target OR feedback beta dice "latency OK così" → close P7 senza work.

### P8 — Public launch

**Pre-check**: P0-P5 done + beta feedback positivo (NPS >7).

**Task**:
- Landing production tutti verticali OR scaling progressivo (1 verticale al mese)
- Pricing 2-tier €497/€897 pubblico
- Sales agent attivo Path A o B
- Support runbook attivo
- **MILESTONE 1 = primo public buyer paying €497**

---

## ⛔ BLOCKED tasks (post-Actions risolutive)

- **Ex-P1 Ehiweb mechanic**: BLOCKED until Action 1 risposta founder. Quando unblock → re-design P-task come "P9 Ehiweb integration" dopo P8 (post-launch, non bloccante first paying customer).

---

## Vincoli S184-S190

- **#1** verifica fattuale: Tauri/Sentry/Twilio/Baileys docs verified, no API inventata
- **#3** raccomandazione singola CTO (NO opzioni A/B/C in design choices)
- **#4** autocritica 4 punti obbligatoria per ogni decisione design
- **#5** zero capex (Sentry free tier hard cap, NO upgrade paid)
- **#6** verde gate: P5 beta 6 clienti onboarded OR handoff sprint S191 strutturato
- **#7** /context periodicamente — sopra 60% chiusura
- **#9** no diplomatico — disagree con dati se serve
- **#10** verificato > verosimile (P7 latency benchmark dati reali, no claim ottimisti)
- **#11** root cause (P0 pricing audit completo, P2 payment flow strutturato no workaround)
- **#13** dealer-pull-only se applica FLUXION (Action 6): inbound only, NO system-push

---

## Memory pointers VOS-side da leggere

Path: `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/`
File rilevanti per FLUXION:
- `feedback_workspace_split_vos_vs_argos.md` — regola workspace
- `feedback_premature_optimization.md` — NO legale/fiscale pre-revenue
- `feedback_pattern_S159_mitigation.md` — B6 3-line check
- `MEMORY.md` index

FLUXION-specific memory dir: `~/.claude/projects/-Volumes-MontereyT7-FLUXION/memory/` (se vuota, crea feedback FLUXION-specifici incrementali in dir locale).

---

## Riferimenti FLUXION

- Repo: `/Volumes/MontereyT7/FLUXION/`
- PRD: `PRD-FLUXION-COMPLETE.md` (patched S170: 2-tier €497/€897 + Ehiweb mechanic)
- Roadmap: `ROADMAP_S184_REVISED_ALPHA.md` + `ROADMAP_REMAINING.md`
- Audit pre-launch: `docs/launch/PRE-LAUNCH-AUDIT.md`
- Runbook MSI Win: `docs/launch/RUNBOOK-P2-WIN-MSI-BUILD.md`
- Runbook Sara live test: `docs/launch/RUNBOOK-P1-SARA-LIVE-TEST.md`
- Testing suite: `TESTING_SUITE_COMPLETE.md`
- Latency analysis: `docs/perf/D3-voice-latency.md`
- Verticali analysis: `docs/PMI_VERTICALS_ANALYSIS.md`
- Install guide cliente: `docs/helpdesk-wiki/wiki/entities/win10-installation.md`

## Start trigger

1. **PRE-CONDITIONS Actions 1-7 risolte** (founder action upstream, NON skip)
2. Founder apre terminale FLUXION (`cwd /Volumes/MontereyT7/FLUXION`)
3. Copia-incolla questo prompt (versione post-Action-risolte, le BLOCKER frasi sostituite con risposte concrete)
4. Tu (Claude FLUXION-instance) parti da P0 pricing patch sequenza P0→P1→P2→P3→P4→P5→P6→P7→P8

## Critical-path summary (per orientamento)

```
First paying customer = P0 → P1 → P2 → P3 → P4 → P5 → P8
   pricing  MSI  payment  sales  landing  beta  launch
```

P6 Sentry e P7 Sara latency NON sono critical path — possono slittare sprint successivo se beta è verde.
