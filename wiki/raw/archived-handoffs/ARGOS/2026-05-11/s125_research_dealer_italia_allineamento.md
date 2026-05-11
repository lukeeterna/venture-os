# S125 — Deep Research Dealer Italia + Allineamento Strategico

## Contesto sessione precedente (S124)

Sessione S124 ha prodotto due correzioni critiche:

1. **Target geografico**: ARGOS parla a dealer family-business DI TUTTA ITALIA (non solo Sud).
   Tutte le research precedenti erano Sud-centriche — vanno ampliate a scala nazionale.

2. **Valore formativo ARGOS**: non è supporto logistico (checklist import, calcolatore margine).
   È aiutare il dealer a COMUNICARE e ATTRARRE clienti alto-spendenti (€30k-50k BMW/Mercedes/Audi).

3. **Self-perception dealer (parziale, solo Sud)**: i dealer si percepiscono GIÀ nel segmento premium.
   Frame "ti aiuto a salire di livello" = insulto. Frame corretto: "hai già i clienti giusti,
   ti trovo le auto che cercano — più veloce e con margine netto certo".
   ATTENZIONE: questa conclusione vale solo per il Sud. Da verificare a livello nazionale.

4. **Sistema auto-approve**: è una FEATURE VOLUTA. Non toccare l'architettura di invio automatico.
   Il problema del 14/04 era qualità LLM/prompt, non il meccanismo.

---

## Obiettivo S125

Prima di costruire qualsiasi cosa, serve allineamento strategico tra founder e CTO.
La sequenza è: **research → sintesi → domande aperte → decisione**.

---

## Step 1 — Deep Research (eseguire con agent-research in parallelo)

Lanciare 3 agent-research paralleli su questi tre domini:

### Research A — Self-perception dealer TUTTA Italia
**Domanda**: I dealer family-business italiani (30-80 auto, multi-brand, Nord/Centro/Sud)
si percepiscono già nel segmento premium, o lo vedono come territorio da concessionari ufficiali?
Differisce tra Nord, Centro e Sud?
**Fonti**: DealerLink, Quintegia, LinkedIn profili dealer, AutoScout24 annunci per regione,
siti ufficiali dealer per fascia, forum Quattroruote PRO, Automotive Dealer Day 2024-2025

### Research B — Come il dealer italiano parla ai clienti premium oggi
**Domanda**: Quali canali, tono e messaggi usano oggi i dealer indipendenti italiani per attrarre
clienti che spendono €30k-50k? Cosa funziona nel Nord vs Sud? Cos'è assente nel loro marketing?
**Fonti**: Profili Instagram/Facebook dealer (campione 20+), Google Business description,
siti web dealer con stock premium, community dealer italiani, MotorK/DealerLink contenuti

### Research C — Gap di mercato: cosa NON esiste per dealer indipendenti italia
**Domanda**: Esiste già qualcuno in Italia che aiuta dealer indipendenti (non ufficiali)
ad acquisire clienti premium e a comunicare con loro? Formato, pricing, contenuto?
**Fonti**: Asconauto Academy, MotorK, GA Academy, Quintegia Academy, consulenti automotive
indipendenti su LinkedIn, servizi di marketing specifici per dealer, confronto con UK/DE

---

## Step 2 — Sintesi e allineamento

Dopo la research, presentare al founder:
1. Mappa delle differenze Nord/Centro/Sud nella self-perception dealer
2. Cosa manca nel marketing dei dealer indipendenti oggi (gap concreti, documentati)
3. Proposta: cosa ARGOS costruisce esattamente per colmare quel gap
   (format, contenuto, delivery — non soluzioni preconfezionate)

**NON decidere nulla prima di sentire il founder.**
**NON costruire materiali prima dell'allineamento.**

---

## Step 3 — Piano operativo (solo dopo allineamento)

Una volta allineati su "cosa costruiamo", pianificare con GSD:
- Nuove fasi nel milestone v1.1 per i materiali formativi
- Test qualità LLM su TEST_FOUNDER (migliorare prompt response-analyzer, non cambiare architettura)
- Go-live Wave 1 (Stile Car, Sa.My., Car Plus) solo dopo test E2E PASS

---

## File da leggere all'inizio sessione

```
HANDOFF.md
.planning/research/s105_formazione_dealer_premium.md  ← research dealer premium già fatta
research/s94_MESSAGGI_DEFINITIVI_V3.md               ← framework messaggi corrente
research/s99_formazione_integrata_operazione.md       ← modello "learn by earning"
```

---

## Stato sistema (fine S124)

- WA daemon: ONLINE (iMac 192.168.1.2, porta 9191, wa_status: connected, 9/10 msg disponibili)
- GSD milestone v1.0: 82% — Phase 4 ancora aperta (3 piani non eseguiti)
- Nessun go-live approvato
- Nessun dealer reale contattato (solo TEST_FOUNDER 393314928901)
- DB dealer: Stile Car / Sa.My. Auto / Car Plus in PENDING, Day 1 pronti ma non inviati
