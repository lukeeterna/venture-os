# CTO Review — Prompt FLUXION S184-S188

**Reviewer**: CTO senior peer review
**Target**: prompt operativo destinato a istanza Claude Code in terminal dedicato (`cwd /Volumes/MontereyT7/FLUXION/`)
**Founder**: Luke (Gianluca Di Stasi), Lavello (PZ)
**Data review**: 2026-05-15
**Outcome**: 3 BLOCKER + 7 HIGH — prompt **NON pronto per esecuzione** senza fix preliminari

---

## Issues critiche

### 1. BLOCKER — dipendenza-nascosta

**Issue**: P1 Ehiweb mechanic (3-4h) è marcato come task eseguibile ma il "Done when" stesso ammette che dipende da risposta founder al Dubbio #1 (reseller status, link affiliate, tariffa). Senza questa info, l'istanza Claude Code non può nemmeno scegliere tra opzione (a/b/c). Il prompt poi contraddice se stesso dicendo "P1 depends Dubbio #1" in fondo ma lo lista come P1 con stima ore.

**Raccomandazione**: Sposta P1 fuori dalla sequenza eseguibile. Marca come "BLOCKED until founder answers Dubbio #1 — no work until unblock". Rinumera P2→P1.

---

### 2. BLOCKER — vincolo-founder-violato (#3)

**Issue**: P1 propone esplicitamente 3 opzioni (a/b/c) come design da scegliere. Vincolo #3 founder: "una raccomandazione singola motivata, NO opzioni A/B/C". Il prompt sta istruendo l'istanza a violare il vincolo.

**Raccomandazione**: Rimuovi opzioni (a/b/c). Istruisci l'istanza a raccogliere risposta Dubbio #1, poi produrre UNA raccomandazione singola motivata con autocritica 4 punti.

---

### 3. BLOCKER — assunzione-sbagliata

**Issue**: P5 dice "riuso pattern ARGOS daemon, stesso iMac PM2 OR instance separata" ma l'istanza Claude Code è in `cwd /Volumes/MontereyT7/FLUXION/` e NON ha accesso al codice ARGOS daemon. Non può "riusare" un pattern che non vede. Cross-reference ad ARGOS Phase 6 AMBRA è marcata "TBD audit terminal ARGOS" — quindi l'istanza non sa cosa replicare.

**Raccomandazione**: Prima di P5, founder deve fare export pattern AMBRA (file copy o snippet) in `/Volumes/MontereyT7/FLUXION/docs/reference/AMBRA-pattern.md`. Senza questo, P5 BLOCKED.

---

### 4. HIGH — sequenza-priorità-errata

**Issue**: P4 Sara latency optimization (4-6h) è prima di P5 sales agent e P6 beta. Ma il founder ha dichiarato "FLUXION priority production" e il path critico per first paying customer è: pricing patch → MSI build → sales agent → beta. Sara latency 1330ms vs 800ms è performance optimization, NON blocker funzionale (Sara funziona già). Ottimizzare latency prima di avere 1 cliente pagante è premature optimization (pattern noto founder).

**Raccomandazione**: Sposta P4 dopo P6 beta. Se beta clienti non lamentano latency, può slittare a sprint S189+.

---

### 5. HIGH — gap-context-business

**Issue**: P0 pricing patch include `migrations/` (DB schema license_tier enum) ma il prompt non specifica se ci sono già clienti BASE €297 in produzione. Se sì, una migration DROP enum value rompe DB esistenti. Dubbio #2 lo cita ma è elencato come "residuo" non come blocker per P0.

**Raccomandazione**: P0 deve iniziare con query `SELECT COUNT(*) FROM licenses WHERE tier='BASE'`. Se >0, STOP e chiedi founder strategia migration prima di toccare schema.

---

### 6. HIGH — dubbio-founder-mancante

**Issue**: P2 MSI unsigned dice "license auto-activates" nel Done when, ma il prompt non specifica COME avviene attivazione (key online check? offline file? hardware fingerprint?). Senza questo, l'istanza inventerà un meccanismo che potrebbe non matchare l'architettura esistente in `src-tauri/src/license/`.

**Raccomandazione**: Aggiungi Dubbio #6: "Meccanismo license activation attuale: online API check, offline keyfile, o hardware-bound? File ref in codebase?". L'istanza deve leggere `src-tauri/src/license/` prima di toccare MSI.

---

### 7. HIGH — vincolo-founder-violato (#5 zero capex)

**Issue**: P3 Sentry "free tier 5K errors/mese" — il prompt assume che 5K errors/mese siano sufficienti senza dati su crash rate atteso. Con 6 beta clienti + bug iniziali tipici alpha, è plausibile sforare. Se sfora, Sentry paid parte da $26/mese = viola vincolo #5 + soglia €30/mese LLM (anche se non LLM, è costo ricorrente).

**Raccomandazione**: P3 deve includere hard cap config Sentry: rate limiting client-side a 100 events/giorno per install. Se sfora free tier → disable, non upgrade.

---

### 8. HIGH — assunzione-sbagliata

**Issue**: P5 "5 prospect contattati + 1 demo video sent" come Done when, ma il vincolo founder S170-post-close è "dealer-pull only no system-push". Outreach WA a freddo verso SMB (saloni, medical, etc.) è system-push per definizione. Il pattern AMBRA ARGOS funziona perché ARGOS targetta dealer che HANNO già il problema dichiarato (stock auto). Per FLUXION SMB il problema non è dichiarato pubblicamente.

**Raccomandazione**: P5 deve chiarire con founder se "dealer-pull only" si applica anche a FLUXION o solo ARGOS. Se sì, P5 va ridisegnato come inbound (landing + SEO + referral) non outbound WA.

---

### 9. HIGH — dipendenza-nascosta

**Issue**: P6 beta program richiede "landing page production-ready" + "demo videos per verticale" (citati in P7) ma il prompt non li include come task. Dubbio #3 e #4 lo segnalano come residui, ma sono prerequisiti hard per P6, non nice-to-have.

**Raccomandazione**: Promuovi Dubbio #3 e #4 a BLOCKER per P6. Se landing+video non esistono, aggiungi task esplicito "P5.5 — produce landing + 1 demo video per verticale beta" prima di P6.

---

### 10. HIGH — gap-context-business

**Issue**: Il prompt menziona "first public buyer paying €497 = MILESTONE 1" ma non specifica payment flow. Founder ha deciso S170-post-close "bonifico ONLY pagamento". Tauri app non può gestire bonifico automaticamente — serve processo manuale (fattura → bonifico ricevuto → license key emessa). Questo non è coperto da nessuna P-task.

**Raccomandazione**: Aggiungi P2.5 "Payment flow bonifico manuale: template fattura forfettaria + script license key generation + email automation". BLOCKER per first paying customer, non per MSI.

---

## Sintesi esecutiva

**Status**: 3 BLOCKER + 7 HIGH. Prompt eseguibile solo dopo:

1. Risposta founder a Dubbi #1, #2, #3, #4, #6 (nuovo)
2. Decisione esplicita su "dealer-pull vs system-push" applicabilità a FLUXION
3. Riordino sequenza:
   ```
   P0 (pricing patch)
   → P2 (MSI build)
   → P2.5 (payment flow bonifico) [NEW]
   → P5 (sales/inbound — ridisegnato se dealer-pull si applica)
   → P5.5 (landing + video demo per verticale) [NEW]
   → P6 (beta program)
   → P3 (Sentry con hard cap)
   → P4 (Sara latency)
   → P7 (public launch)
   ```
4. P1 (Ehiweb) e P5 (sales agent) attualmente violano vincolo #3 e potenzialmente decisione "dealer-pull only"

**Raccomandazione finale**: NON procedere con esecuzione in terminal FLUXION finché blocker #1, #2, #3 non risolti. Gli HIGH possono essere mitigati durante esecuzione ma vanno indirizzati esplicitamente nel prompt prima del paste.

---

## Checklist pre-paste prompt

- [ ] Founder risponde Dubbi #1 (Ehiweb), #2 (clienti BASE esistenti), #3 (landing), #4 (video demo), #6 (license activation mechanism)
- [ ] Founder dichiara applicabilità "dealer-pull only" a FLUXION (yes/no)
- [ ] Pattern AMBRA esportato in `/Volumes/MontereyT7/FLUXION/docs/reference/AMBRA-pattern.md`
- [ ] Sequenza P-task riordinata secondo critical path first-paying-customer
- [ ] P1 ed P5 riscritti senza opzioni A/B/C (vincolo #3)
- [ ] P2.5 payment flow bonifico aggiunto
- [ ] P5.5 landing + video aggiunto come prerequisito P6
- [ ] P3 Sentry con hard cap rate limiting client-side documentato
