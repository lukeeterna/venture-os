# Review v2.1 ARGOS Terminal Prompt — CTO Senior

**Data**: 2026-05-15
**Reviewer**: CTO senior (instance separata)
**Subject**: PROMPT-S171-ARGOS v2.1 (post-fix v2→v2.1)
**Workspace target**: terminal Claude Code `~/Documents/combaretrovamiauto-enterprise/`

---

## ⚠️ DISCREPANCY NOTICE (pre-review)

Il task dichiara: *"il CTO ha applicato TUTTI 10 fix nella v2.1"*.
La review fattuale del documento incollato rileva: **1/10 fix CORRECT, 2/10 PARZIALI, 6/10 NON APPLICATI, 1/10 NON VERIFICABILE**.

Due ipotesi mutuamente esclusive:
- (a) documento incollato NON è la v2.1 ma versione precedente etichettata erroneamente
- (b) i fix sono stati identificati ma non applicati al testo finale

Per evitare anti-pattern reviewer FLUXION (4/10 inferenza errata): valuto SOLO il testo incollato come documento di execution. Non infero contenuto fix originali.

---

## PARTE A — Verifica fix v2→v2.1 (10 fix originali)

### Fix #1 — Twilio €1/mese rimosso da opzione (c) Dubbio #1

**Verdict**: ❌ **NON APPLICATO**

**Evidence (testo prompt)**:
> DUBBIO FOUNDER #1, opzione (c): *"Twilio number €1/mese dedicato mystery shopper Argos"*
> Raccomandazione CTO: *"(c) come backup low-cost professional"*

**Impatto**: violazione vincolo #5 zero capex paid services. Twilio €1/mese è capex ricorrente, anche se basso.

---

### Fix #2 — P0→P1 sequenziale (rimosso "parallel")

**Verdict**: ❌ **NON APPLICATO**

**Evidence (testo prompt)**:
> Sezione "Start trigger", riga 3:
> *"Poi P0 AMBRA audit + P1 research microdealer **parallel**"*

**Impatto**: violazione vincolo #7 context budget (parallel = 2x context simultaneo). Più rischio context creep.

---

### Fix #3 — P5 step 13 manual reconciliation ONLY (no PSD2 webhook S171)

**Verdict**: ⚠️ **APPLICATO PARZIALE**

**Evidence (testo prompt)**:
> P5 step 13:
> *"Sistema riceve bonifico (manual reconciliation **o webhook PSD2 se setup**)"*

**Gap**: opzione webhook PSD2 condizionale ancora presente. Non è "manual ONLY". PSD2 webhook reintroduce capex (Tink/TrueLayer/Fabrick paid).

---

### Fix #4 — P3 daemon receiver PREFER numero personal non brandato

**Verdict**: ❓ **NON VERIFICABILE**

**Evidence (testo prompt)**:
> P3 step 6: *"3 test outbound consecutivi su founder phone **3314928901**"*
> Context iniziale: *"`3314928901` = numero FLUXION, brandato 'Erica Fluxion'"*
> Context iniziale: *"per ARGOS test E2E founder lo usa come endpoint controllato (entrambi lati simulati founder, branding irrilevante in test)"*

**Note**: il numero usato è brandato FLUXION (apparente conflict col fix), ma il prompt razionalizza come "branding irrilevante in test". Non posso determinare se questa razionalizzazione È il fix v2.1 oppure se il fix è stato omesso. Senza accesso a v2 originale, marker ❓.

---

### Fix #5 — Agent 1 STEP 0 BLOCKING verifica regime forfettario ATECO commercio

**Verdict**: ⚠️ **APPLICATO PARZIALE**

**Evidence (testo prompt)**:
> P1 Agent 1 — Profilo segmento, bullet 2:
> *"Regime fiscale forfettario applicabilità auto commercio (limite €85k revenue, codice ATECO 45.11)"*

**Gap**: contenuto presente come bullet point al pari degli altri. NON marcato STEP 0 BLOCKING. Nessun gate sequenziale che blocca Agent 2/3/4 fino a verifica forfettario+ATECO esito positivo.

**Nota tecnica fattuale**: ATECO 45.11 è "Commercio di autoveicoli". Il regime forfettario ha limitazioni specifiche per commercio beni usati (regime margine IVA art.36 DL 41/95 potenzialmente obbligatorio). Se Agent 1 scopre incompatibilità → target D-28 cade → Agent 2/3/4 budget research sprecato.

---

### Fix #6 — Dubbio #7 NEW Reddit + Telegram API creds

**Verdict**: ❌ **NON APPLICATO**

**Evidence (testo prompt)**:
> Sezione DUBBI FOUNDER contiene 6 dubbi numerati (1-6). Non esiste Dubbio #7.
> P4 Layer 1 setup menziona *"PRAW Python (Reddit API)"* e *"Telethon Python (Telegram)"* senza richiesta creds.

**Impatto bloccante P4**:
- PRAW richiede `client_id` + `client_secret` + `user_agent` registrati su `https://www.reddit.com/prefs/apps`
- Telethon richiede `api_id` + `api_hash` da `https://my.telegram.org/auth`
Senza creds, P4 Layer 1 setup blocca silently.

---

### Fix #7 — P5 step 10 DocuSeal email-only NO firma actual founder

**Verdict**: ❌ **NON APPLICATO**

**Evidence (testo prompt)**:
> P5 step 10:
> *"Dealer accetta pre-deal contract (DocuSeal D-22/D-24, **founder firma test**)"*

**Impatto**: esplicitamente l'opposto del fix. Firma founder reale su contratto fittizio = inquinamento dataset DocuSeal + possibile rischio legale residuo.

---

### Fix #8 — P2 CoVe weights TENTATIVE proposal (no fit pretesa S171)

**Verdict**: ✅ **APPLICATO CORRECT** (marginal)

**Evidence (testo prompt)**:
> P2 Step 2 — Re-calibrate CoVe v4 scoring:
> *"`few_listings` weight HIGH (era 2.0 → **propose** 4.0)"*
> *"`brand_diversity` weight LOW (era 2.0 → **propose** 0.5)"*

**Note**: linguaggio "propose" segnala tentativeness corretta. Verbo principale step "Re-calibrate" è meno tentative ma accettabile. Marginal pass.

---

### Fix #9 — Subito.it RIMOSSO Layer 1 commissione discovery

**Verdict**: ❌ **NON APPLICATO**

**Evidence (testo prompt), DUE occorrenze**:
> P1 Agent 3 — Channel discovery:
> *"DOVE vendono: **Subito.it** (segnale: dealer profile con 5-15 auto + annunci EU)"*
>
> P4 Layer 1 setup:
> *"**Subito.it scraping** (rate-limited, existing scraper config)"*

**Impatto**: Subito.it ancora in scope sia come discovery channel sia come scraping target.

---

### Fix #10 — P0 cross-workspace T7 mount verify + fallback locale

**Verdict**: ❌ **NON APPLICATO**

**Evidence (testo prompt)**:
> Sezione "Memory pointers VOS-side": path `~/.claude/projects/-Volumes-MontereyT7-venture-os/memory/`
> Sezione "Riferimenti": `DECISIONS.md path: /Volumes/MontereyT7/venture-os/wiki/projects/ARGOS/DECISIONS.md`

**Gap**: nessuna istruzione `mount | grep MontereyT7` pre-P0. Nessun fallback path locale. Se T7 non montato → tutti read memory pointers + DECISIONS.md falliscono silently.

---

### Summary tabellare PARTE A

| # | Fix | Verdict |
|---|-----|---------|
| 1 | Twilio rimosso Dubbio #1 | ❌ NON APPLICATO |
| 2 | P0→P1 sequenziale | ❌ NON APPLICATO |
| 3 | Manual reconciliation ONLY | ⚠️ PARZIALE |
| 4 | Daemon receiver personal | ❓ NON VERIFICABILE |
| 5 | Agent 1 STEP 0 BLOCKING forfettario+ATECO | ⚠️ PARZIALE |
| 6 | Dubbio #7 API creds Reddit+Telegram | ❌ NON APPLICATO |
| 7 | DocuSeal email-only no firma founder | ❌ NON APPLICATO |
| 8 | CoVe weights TENTATIVE | ✅ CORRECT |
| 9 | Subito.it rimosso | ❌ NON APPLICATO |
| 10 | T7 mount verify + fallback locale | ❌ NON APPLICATO |

**Score**: 1/10 CORRECT — 2/10 PARZIALE — 6/10 NON APPLICATO — 1/10 NON VERIFICABILE

---

## PARTE B — Issues critici v2.1

### #1 — BLOCKER — vincolo-founder-violato — Twilio paid ancora raccomandato

**Issue**: Dubbio #1 raccomandazione CTO include Twilio €1/mese come backup. Viola vincolo #5 zero capex paid services strict.
**Raccomandazione**: rimuovere opzione (c) Twilio. Lasciare solo (a) 2° SIM esistente, (b) burner free. Se nessuno disponibile → defer mystery shopper REAL a S172.

---

### #2 — BLOCKER — sequenza-priorità-errata — P0/P1 parallel nel trigger

**Issue**: "Start trigger" istruisce P0 + P1 parallel. P1 deve essere sequenziale dopo P0 per dipendenza Layer 3 + vincolo #7 context budget 60%.
**Raccomandazione**: "Start trigger" step 2 → *"Poi P0 AMBRA audit. Solo a P0 done, P1 research microdealer."*

---

### #3 — BLOCKER — dipendenza-nascosta — Reddit/Telegram API creds mancanti

**Issue**: P4 Layer 1 richiede PRAW + Telethon senza dubbio founder per creds. Senza credentials registrate, P4 Layer 1 setup blocca silently.
**Raccomandazione**: aggiungere DUBBIO FOUNDER #7: *"Reddit client_id/secret/user_agent + Telegram api_id/api_hash già registrati? Se no, founder registra prima di P4 (10min setup ciascuno)."*

---

### #4 — BLOCKER — vincolo-founder-violato — DocuSeal P5 step 10 firma founder

**Issue**: P5 step 10 *"founder firma test"* = firma reale founder su pre-deal contract fittizio. Inquinamento dataset DocuSeal + rischio legale residuo.
**Raccomandazione**: P5 step 10 → *"Dealer accetta via email confirm. DocuSeal flow validato separatamente con account test dedicato post-P5."*

---

### #5 — HIGH — dipendenza-nascosta — T7 mount non verificato pre-P0

**Issue**: Memory pointers + DECISIONS.md vivono su `/Volumes/MontereyT7/`. Workspace ARGOS è locale. Se T7 non montato → tutti read falliscono.
**Raccomandazione**: aggiungere Step P-1 (pre-P0): `mount | grep -q "MontereyT7" || { echo "T7 NOT MOUNTED — abort"; exit 1; }` + fallback locale documentato.

---

### #6 — HIGH — assunzione-sbagliata — P5 step 13 PSD2 webhook reintroduce capex

**Issue**: opzione "webhook PSD2 se setup" mantiene escape hatch al vincolo bonifico-only. PSD2 webhook implica AISP/PISP paid provider.
**Raccomandazione**: P5 step 13 → *"Manual reconciliation via CSV export home banking + match script. NO webhook PSD2 in S171."*

---

### #7 — HIGH — sequenza-priorità-errata — Agent 1 forfettario+ATECO non BLOCKING

**Issue**: se Agent 1 scopre forfettario inapplicabile a commercio autoveicoli usati (regime margine IVA art.36 prevalente), target D-28 cade. Agent 2/3/4 budget research sprecato.
**Raccomandazione**: P1 Agent 1 STEP 0 BLOCKING: *"Verifica forfettario applicabile commercio autoveicoli usati ATECO 45.11. Se NO → STOP, escalate founder per re-definizione target prima di Agent 2/3/4."*

---

### #8 — HIGH — gap-context-business — Subito.it ancora target Layer 1

**Issue**: Subito.it persiste in P1 Agent 3 + P4 Layer 1. Se fix originale prevedeva rimozione, motivazione sconosciuta a current reviewer.
**Raccomandazione**: rimuovere Subito.it da P1 Agent 3 + P4 Layer 1, OPPURE chiedere founder motivazione fix prima di esecuzione.

---

### #9 — HIGH — dipendenza-nascosta — Open Q #12 daemon non blocca P5

**Issue**: P3 fix daemon duplicate è prerequisito implicito P5 E2E (15 step richiedono single-send deterministico). Nessun gate esplicito P3→P5.
**Raccomandazione**: P5 prima riga → *"PREREQUISITO: P3 verde (3/3 single-msg verified). Se P3 rosso → S171 chiude su P3 + handoff S172, P5 NON eseguito."*

---

### #10 — HIGH — vincolo-founder-violato — Numero brandato FLUXION in test E2E

**Issue**: `3314928901` = numero FLUXION brandato Erica. Usarlo per ARGOS test E2E inquina WhatsApp Business brand consistency + persistenza history conversazioni.
**Raccomandazione**: P5 → usare numero personale founder (`3281536308` se controllato bidirezionale) o numero terzo. Non riusare FLUXION brand.

---

## PARTE C — Verdict finale

### 🔴 NOT READY FOR EXECUTION

**Conta issues**: 4 BLOCKER + 6 HIGH
**Soglia READY**: 0 BLOCKER + max 2 HIGH minori
**Gap**: ampio.

### Azioni preliminari richieste (ordine)

1. **Chiarire discrepanza versione**: il prompt incollato è effettivamente la v2.1 post-fix? 9/10 fix risultano non applicati o parziali. Possibile errore di copia/versioning.
2. Se v2.1 confermata: **applicare fix #1, #2, #6, #7, #9, #10** (tutti NON APPLICATI) e **completare #3, #5** (PARZIALI).
3. **Chiarire fix #4** (daemon receiver personal): considerato e razionalizzato come "irrilevante in test", oppure omesso?
4. Aggiungere **gate esplicito P3→P5 dependency**.
5. Aggiungere **Step P-1 T7 mount verify**.
6. **Rimuovere Twilio paid option** Dubbio #1.

---

## Note di metodo (auto-disciplina anti-pattern reviewer FLUXION)

- Fix #4 marcato esplicitamente ❓ NON VERIFICABILE invece di inferire absence/presence.
- Sui 9 fix marcati ❌/⚠️ ho citato **testo testuale dal prompt incollato**, non inferito da memoria documento originale v2.
- Nessuna assunzione di cattiva fede del CTO autore v2.1: la discrepanza può derivare da copy errato del documento al reviewer.
- Severity BLOCKER assegnata solo dove l'issue blocca execution o viola vincolo founder esplicito.

---

**Fine review.**
