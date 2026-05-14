# Prompt next session — S168 (ARGOS workflow communication-broker MVP build + Day 1 V3 finale)

> Salvato 2026-05-14 close S167 verde. Brief auto-iniettato all'avvio CC.
> S167 ha shipped: B6 3-layer (Step 1) + research v2 automated 4 thread (workflow evolution).
> S168 = build phase + Day 1 V3 finale send TEST_FOUNDER.

---

## UPDATE 2026-05-14 fine sessione — MVP comm-broker SHIPPED 17/17 test PASS

Comm-broker stack D-22 F1+F2+F3+F4 SHIPPED in ARGOS repo `comm-broker/`:
- `image_shield.py` (D-25 Pillow Big Sur safe)
- `deal_state_machine.py` (D-22 F4 7-step + SQLite)
- `templates/*.j2` (D-22 F3 5 fasi × 2 lang IT+EN, 10/10 render)
- `wa_bridge.py` (D-22 F1 SQLite bridge — KEEP whatsapp-web.js NO Baileys)
- `message_analyzer.py` (D-22 F2 Groq cascade wrap — 1-call combined)
- `pipeline.py` (D-22 glue orchestrator)
- `tests/` 4 test files, 17/17 PASS (incl 4 live Groq calls verified)

Live Groq verified:
- BMW interest → offer/positive translation EN OK
- Western Union → scam_flag=True, FSM aborted, outbound NOT queued ✅
- Gemini-flash 429 quota → cascade circuit breaker → Groq fallback automatic

S168 Step 2 MVP build COMPLETE. Step 3 V3-rev2 send TEST_FOUNDER + wa-daemon
wire-up real = next priority. Step 1 consulenza commercialista = DEFERRED
fino payment evidence (Luke feedback memoria saved).

## Pre-condizioni GIÀ COMPLETATE in S167 (verifica)

- **B6 3-layer shipped** (ROADMAP B6 marker SHIPPED): hook SessionStart cwd-detect + skill `pre-action-check` + CLAUDE.md vincolo #13 (file 198 righe ≤200). Test cwd ARGOS: 25+ DECIDED entries iniettate (7.5k+ chars). Test cwd VOS root: NO inject corretto.
- **5 nuove DECISIONS.md ARGOS** (D-21..D-25): workflow info-broker → communication-broker-garante eBay-style + stack tecnico verified + D-OPEN-Q2 timeline revision + 3-pillar anti-disintermediation + Pillow-only image-shield
- **Protocollo VOS data-driven v2 AUTOMATED** validato PoC: `wiki/patterns/data-driven-research-protocol-v2-automated.md`. 4 thread research via 3 Agent parallel + CC autonomous in ~25 min (vs 3-4h manual S166)
- **Memory persistente** B6 mitigation: `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/feedback_pattern_S159_mitigation.md`
- **VOS commit S167**: `ca2eebf` (B6 ship) + commit close (D-21..D-25 + protocollo v2 + handoff S168)

## Cosa parte automatico domani 2026-05-15 (zero azione Luke richiesta)

- **~07:00 IT**: morning-briefer LaunchAgent genera `briefs/2026-05-15.md`
- **All'avvio CC sessione**: SessionStart hook `session_start_brief.sh` (upgraded S167) inietta brief + DECISIONI FOUNDER NON RINEGOZIABILI estratte da DECISIONS.md cwd-detected (B6 L1)
- Se cwd `~/Documents/combaretrovamiauto-enterprise` → 30 DECIDED entries iniettate (D-01..D-25 + D-OPEN-Q1..Q5)
- host-monitor + routing-refresh + git-push hook continuano automatici

## Goal S168 — Sequenza atomica

### Step 1 — Consulenza commercialista (~1 settimana wallclock, €150-300 capex) ⚠️ FOUNDER ACTION
Trigger critico D-23: prima di scaling ARGOS oltre deal #3-5 cumulative, verificare se P.IVA forfettario 5% nuova attività ISOLA redditi da cumulo recupero Equitalia pre-esistente con piano rateazione attivo art. 19 DPR 602/1973. Costo €150-300 = UNICO capex giustificato (vincolo #5 deroga motivata).
- Contatto: ordine dottori commercialisti Potenza, sezione contenzioso (specializzato pignoramenti)
- Domanda specifica: "P.IVA forfettario 5% nuova attività + piano rateazione AdE attivo: redditi nuova attività entrano nel cumulo recupero pregresso o restano isolati?"
- Output: deviation entry `state/blueprint-deviations.jsonl` con esito + decision next
- Done when: consulenza eseguita + esito documentato in DECISIONS.md (revisione D-OPEN-Q2 o conferma)

### Step 2 — MVP build communication infrastructure (2 settimane founder solo)
Stack D-22:
- **Day 1-3**: Baileys daemon setup (esistente WA daemon ARGOS può essere wrapper Baileys o sostituito) — test invio/ricezione su TEST_FOUNDER 393314928901
- **Day 4-7**: python-statemachine 3.0.0 install + state machine 7-step (offer-sent → accepted → docs-shared → payment-pending → payment-confirmed → transport-scheduled → in-transit → delivered) + SQLite persistence
- **Day 8-10**: Jinja2 templates 5 fasi (offer/negotiation/documents/payment/delivery) IT+EN + LLM finishing via cascade Groq esistente
- **Day 11-12**: DocuSeal self-host iMac (Docker 2 container) + template clausola anti-disintermediation D-24 (estensione skill `legal-compliance-checker` parallel)
- **Day 13-14**: Pillow image-shield pipeline (crop 65% + watermark grid + HSV shift + JPEG q=72) + benchmark validation 10 listing Mobile.de
- **Day 15**: dashboard founder lean (FastAPI + HTMX server-rendered) — visibility deals attivi + alert scam-flag

Done when:
- Baileys daemon connesso WA (single brand identity Luca Ferretti +39 328 1536308)
- State machine test E2E 1 deal simulato (TEST_FOUNDER come dealer fittizio)
- Templates pre-loaded 5 fasi IT+EN funzionanti
- DocuSeal genera contratto FES pre-deal con clausola anti-disintermediation
- Image-shield validation: hit-rate reverse-search ≤1/10 su Google Lens + TinEye + Yandex su 10 listing Mobile.de test
- Dashboard mostra state attuale 1 deal simulato

### Step 3 — Day 1 V3-rev2 finale + send TEST_FOUNDER (~30 min)
Day 1 V3-rev2 deve riflettere workflow D-21 (dossier-then-pay communication-broker):

```
Buongiorno, sono Luca Ferretti.

Trovo auto premium dalla Germania, Belgio, Olanda, Austria
per concessionari italiani. Sto cercando 2-3 referenti per la
provincia di Foggia.

Niente da venderle oggi. Solo presentarmi: se le capita un cliente
che chiede una BMW, Mercedes o Audi specifica, mi può scrivere.
Le mando il dossier completo dell'auto che ho trovato (foto, anno,
km, prezzo, margine atteso per lei). Se la convince, sblocca con
€1.000 cash i dati per andarla a prendere. Il resto lo fa lei,
margine resta tutto suo.

Per il momento è solo per averla nel pallottoliere.

Luca Ferretti
```

Workflow:
- Founder valida V3-rev2 finale (provincia OK? lessico? lunghezza ~95 parole?)
- Send a 393314928901 (TEST_FOUNDER configurato `.env` ARGOS)
- Luke risponde "sì interessato" → verify classifier=POSITIVE + Day 3 candidate generato + state machine transition offer-sent
- Luke risponde "STOP" → verify NEGATIVE + opted_out

### Step 4 — D-21 V3-rev2 entry (~10 min) post-validation
Nuova entry o patch a D-21 con V3-rev2 testo finale + outcome TEST_FOUNDER classifier verify Step 2+3.

## Vincoli sessione S168

- **#1** verifica fattuale: ogni libreria/version cita doc upstream o `pip show <pkg>`
- **#3** raccomandazione singola motivata (no Path A vs B)
- **#4** critica strutturale 4 punti su ogni proposta tecnica
- **#5** zero-cost obbligatorio (DEROGA SOLO consulenza commercialista €150-300 Step 1)
- **#6** verde o handoff S169-deferred
- **#7** chiusura ordinata sotto 60% context
- **#9** no diplomatico, no scarico decisioni su founder
- **#11** pattern recognition: B6 L2 nudge applicare anche on artifact carry-over inter-sessione
- **#13** pre-action check obbligatorio in proposte tecniche (auto-applicato da skill `pre-action-check`)

## Open question critical pre-S168

1. **Step 1 consulenza commercialista** è ASYNC (1 settimana wallclock) — può procedere in parallelo a Step 2 MVP build. Se esito negativo (P.IVA NON isolata da cumulo) → revisione D-OPEN-Q2 + D-23 necessaria PRIMA Step 3 send TEST_FOUNDER (cambia frame "cash a consegna documento" se P.IVA scatta diversamente)
2. **DocuSeal AGPLv3 §7(b)**: verificare additional terms specifici pre-deploy (check `LICENSE_ADDITIONAL_TERMS` file repo). Mitigazione: self-host pure senza fork modification = no obblighi distribution
3. **Skill `legal-compliance-checker` extension**: template clausola anti-disintermediation IT art. 2596 c.c. con penale forfettaria €5.000 — work S168 parallel
4. **AS24/Mobile.de NO API ufficiale messaging**: scraping session-long custom = nuovo stack complessità, OR ARGOS contatta venditore EU via canale esposto su listing (email/tel/WA pubblico). CTO decision S167 = opzione hybrid via canale esposto. Verificare in MVP Step 2 se davvero la maggior parte listing espone contatti utili (data collection lato founder durante CoVe scrape)

## Next post-S168

S169 — dealer reale primo TIER 0 (Stile Car FG / Car Plus AV / Sa.My. CS) HITL 100% applicando V3-rev2 Day 1 + workflow D-21 communication-broker + clausola D-24 pre-deal + image-shield D-25 dossier preview. Se Step 1 consulenza commercialista esito positivo → P.IVA forfettario aperta in parallel (Luke action).

S170+ — wave-based outreach D-14 scaling (Salerno + Bari + Catania + Cosenza) + skill `/outreach-day1` con archetype variants D-08 + outcome tracking CRM (gap counter cumulativo per-committente D-23).

## Riferimenti completi S167

- DECISIONS.md ARGOS D-21..D-25 (30 entries totali)
- ROADMAP B6 SHIPPED marker
- `wiki/patterns/data-driven-research-protocol-v2-automated.md`
- `state/blueprint-deviations.jsonl` events S167 (B6-shipped + workflow-evolution-research)
- `~/.claude/skills/pre-action-check/SKILL.md` (B6 L2)
- `~/.claude/hooks/session_start_brief.sh` (B6 L1 upgraded)
- `~/.claude/CLAUDE.md` vincolo #13 (B6 L3, file 198 righe)
- `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/feedback_pattern_S159_mitigation.md`

## Pattern recognition S167 (vincolo #11 — per memoria futura)

1. **B6 caught rebrand #6**: V3 "pago io fino piazzale" carry-over S166→S167 senza re-validation = drift workflow. Luke caught it. **B6 L2 va applicato anche on artifact carry-over inter-sessione**, non solo proposte ex-novo.
2. **Scope evolution founder-driven ≠ rebrand drift**: workflow info-broker → communication-broker-garante è founder-driven evolution legittima, NON drift Claude. Distinguere i due.
3. **Cost projection senza audit stack**: io ho proiettato €30/mese senza prima fare audit. Reale €0/mese. Luke caught it. **Bash audit locale obbligatorio PRIMA proiezione costo**.
4. **Single-question challenge da Luke = goldmine**: ogni volta che Luke ha sollevato "ma se utilizziamo wa web a cosa si riferiscono questi costi?" o "verificare con DATI REALI" → ha esposto assumption non verificata mia. Internalizzare: trattare ogni Luke challenge come opportunity per pattern recognition strutturale, non difensività.
