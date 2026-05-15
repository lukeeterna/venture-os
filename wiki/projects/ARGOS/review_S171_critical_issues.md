# Review S171 prompt — issues critiche

**Reviewer**: CTO peer review
**Target**: prompt operativo S171 ARGOS terminal
**Date**: 2026-05-15

---

## 1. BLOCKER — dubbio-founder-mancante

**Issue**: Il vincolo founder esplicita "dealer-pull only no system-push" e "pagamento ONLY bonifico", ma il dubbio #1 propone Twilio €1/mese come opzione (c) raccomandazione CTO. Twilio = capex ricorrente → viola #5 zero capex paid services. Il prompt si auto-contraddice nei vincoli.

**Raccomandazione**: Rimuovi opzione (c) Twilio dal dubbio #1. Lascia solo (a) 2° SIM founder (b) burner free. Se nessuna delle due viable, il blocker resta aperto — non aggirarlo con paid.

---

## 2. BLOCKER — sequenza-priorità-errata

**Issue**: P0 AMBRA audit e P1 research microdealer dichiarati eseguibili "parallel" in "Start trigger" punto 2. Single-founder single-Claude-instance non esiste parallelismo reale — è context switch costoso che brucia /context budget e viola vincolo #7 (/context periodicamente sopra 60%). 4-agent thread P1 da solo è 2-3h di token spend.

**Raccomandazione**: Sequenzializza P0 → P1. Rimuovi "parallel" da Start trigger punto 2. P0 è 1-2h e produce input per P4 design AMBRA → priorità lineare.

---

## 3. BLOCKER — dipendenza-nascosta

**Issue**: P5 step 13 "Sistema riceve bonifico (manual reconciliation o webhook PSD2 se setup)". Webhook PSD2 richiede provider Open Banking (Tink/Fabrick/TrueLayer) = paid service. Manual reconciliation in test E2E significa intervento founder → invalida criterio "Done when: 15-step cycle completato senza intervento manuale extra". Step 13 è un gap, non un'opzione.

**Raccomandazione**: Esplicita in P5 che step 13 è manual-reconciliation-only per S171 (founder verifica bonifico arrivato e fa trigger manuale step 14). Webhook PSD2 = backlog post-S171, non in scope.

---

## 4. HIGH — assunzione-sbagliata

**Issue**: P3 verifica fix daemon usa `3314928901` (FLUXION) come endpoint test. Founder ha dichiarato S170-post-close che `3314928901` per ARGOS test E2E "founder lo usa come endpoint controllato (entrambi lati simulati founder, branding irrilevante)". Ma se daemon ARGOS invia su numero brandato FLUXION durante test fix bug, qualsiasi log/audit cross-progetto futuro avrà cross-contamination dati. Anti-pattern per debugging.

**Raccomandazione**: P3 test fix daemon usa numero founder personale `3281536308` come receiver (founder=sender outbound, founder=receiver inbound stesso device OK per fix bug daemon, no branding issue).

---

## 5. HIGH — gap-context-business

**Issue**: P1 Agent 1 cita "regime fiscale forfettario applicabilità auto commercio (limite €85k revenue, codice ATECO 45.11)". Il limite forfettario 2025-2026 è €85k SOLO per attività servizi; per commercio auto (ATECO 45.11) potrebbe applicarsi limite diverso o regime non applicabile. Se target = "P.IVA forfettaria stock<20" e il regime non è applicabile a commercio auto, il target stesso è fattualmente inconsistente.

**Raccomandazione**: Agent 1 deve verificare PRIMA di tutto il resto: "regime forfettario è effettivamente applicabile ad ATECO commercio auto al dettaglio?". Se NO → escalate founder, target da ridefinire.

---

## 6. HIGH — dipendenza-nascosta

**Issue**: P4 Layer 1 "PRAW Python + Telethon Python + Subito.it scraping" come tools/layer1-scout.py. PRAW richiede Reddit app credentials, Telethon richiede Telegram API hash/ID. Founder non li ha mai menzionati come configurati. Se mancano = blocker P4. Non c'è dubbio founder dedicato.

**Raccomandazione**: Aggiungi dubbio #7: "Reddit API credentials + Telegram API hash/ID già configurati? Path .env? Se NO, P4 Layer 1 blocked fino a setup founder (15min ciascuno, free)".

---

## 7. HIGH — vincolo-founder-violato

**Issue**: P5 step 10 "Dealer accetta pre-deal contract (DocuSeal D-22/D-24, founder firma test)". DocuSeal self-hosted è OSS, OK. Ma il test E2E S171 ha founder simulating entrambi i lati (dealer Mario + Luca Ferretti). Founder che firma DocuSeal a sé stesso non testa nulla di reale del flow firma — testa solo che il software invia email. Spreco di P5 budget tempo per zero learning.

**Raccomandazione**: P5 step 10 ridotto a "verify DocuSeal invia request email correttamente, founder NON firma (lascia pending). Step 11 procede simulando firma avvenuta". Risparmi 20-30min P5.

---

## 8. HIGH — gap-context-business

**Issue**: P2 step 2 "Re-calibrate CoVe v4 scoring" propone modifiche pesi feature (`few_listings` 2.0→4.0, `brand_diversity` 2.0→0.5) come fatto compiuto. Non c'è validation: chi dice che 4.0 è meglio di 3.0 o 5.0? È un guess basato sul nuovo target, non un fit empirico. Senza ground truth labeled (dealer wave 1 burned, non utili come label) il re-calibration è arbitrario.

**Raccomandazione**: P2 step 2 produce solo *proposta* pesi + rationale qualitativo. La validation empirica avviene su wave 2 (P5 + reale outreach post-S171), non in S171. Esplicitalo come "tentative weights, validate over next 10 contacts".

---

## 9. HIGH — assunzione-sbagliata

**Issue**: P1 Agent 3 cita "Subito.it (segnale: dealer profile con 5-15 auto + annunci EU)" come canale dove micro-dealer commissione vivono. Ma se target = "dealer commissione stock<20" e questi NON hanno piazzale, NON listano stock su Subito — fanno scouting su richiesta cliente. Il segnale Subito identifica dealer-piazzalino-piccolo, NON dealer-commissione. È il fail mode di S170 wave 1 che si ripropone.

**Raccomandazione**: P1 Agent 3 NON include Subito/AutoScout24 listings come canale primario per target commissione. Re-focus su: gruppi WhatsApp/Telegram chiusi, passaparola, FB groups privati dealer commissione, eventi Salone Auto come canali fisici. Subito = canale per target sbagliato.

---

## 10. HIGH — dipendenza-nascosta

**Issue**: P0 AMBRA audit definisce "Done when: file `wiki/projects/ARGOS/AMBRA-AUDIT.md`". Ma il workspace è `~/Documents/combaretrovamiauto-enterprise` (terminal ARGOS). Il path `wiki/projects/ARGOS/` vive in `/Volumes/MontereyT7/venture-os/` (terminal VOS). Cross-workspace write da terminal ARGOS richiede T7 mounted + path absolute. Se T7 non mounted → blocker silenzioso.

**Raccomandazione**: Esplicita in P0: "verify `/Volumes/MontereyT7/` mounted prima di write. Se unmounted → output AMBRA-AUDIT.md in `~/Documents/combaretrovamiauto-enterprise/.audit/AMBRA-AUDIT.md` con git note follow-up sync VOS".

---

## Sintesi review

- **3 BLOCKER** (Twilio capex violation, parallelism inesistente, manual reconciliation gap)
- **7 HIGH** (tutti gli altri)
- **0 LOW** ignorati

Il prompt è strategicamente solido (target rebaseline corretto, paradigma scaltro coerente con D-27/D-28, sequenza P0→P6 ha logica) ma ha **due classi di problemi strutturali**:

1. **Capex creep latente**: Twilio + PSD2 webhook + DocuSeal full-flow sono tutti "se setup" che diventerebbero paid se attivati. Pattern S159 si ripresenta in forma diversa.

2. **Test E2E con founder=both-sides ha valore limitato**: P5 testa la *meccanica software*, NON il *flusso umano dealer reale*. È un test integration, non un test mystery shopper. Founder dovrebbe esplicitamente accettare questo trade-off, altrimenti P5 verde non significa "Layer 2 ready per dealer veri".

## Considerazione fuori format

Il prompt ha **6 dubbi founder che bloccano start**. Realisticamente Luke avrà risposte a 2-3, non a tutti 6. Il prompt dovrebbe specificare quale subset di dubbi è *hard blocker* (es. #1 numero, #3 AMBRA stato) vs quali sono *soft preference* (es. #6 auto fittizia, default proposto già accettabile). Senza questa distinzione, P0 non parte finché tutti 6 chiariti — anti-pattern.
