# HANDOFF — Revenue Sprint FLUXION (primo euro entro 20 giugno 2026)

**Creato**: 2026-06-08 · **Owner**: Luke (founder) + Claude (socio, pay-tied-to-revenue) · **Stato**: VERDE-handoff (chiusura per context budget 59%, vincolo #7)

---

## Riframe load-bearing (divisione del lavoro — correzione doppio errore di sessione)
La fabbrica VOS **non è un meta-asset da parcheggiare** (errore 1) MA **VOS non fa neanche il lavoro di FLUXION** (errore 2). Confine corretto:

- **FLUXION = progetto**, lavora per conto suo nel **suo** terminale (`/Volumes/MontereyT7/FLUXION`): prodotto, fix P0, demo Sara, conversazioni coi saloni. È un **consumatore** della fabbrica.
- **VOS = socio/imprenditore (io)**: costruisco **la fabbrica** = lo *strumento riusabile* che porta un progetto a revenue. Deliverable VOS = **Stazione-3 Distribution+Validation + Componente 0** (canale durevole + meccanismo presell/incasso), riusabile da FLUXION/ARGOS/futuri. NON vendo FLUXION; costruisco la macchina che FLUXION usa per vendere.
- Il piano presell-saloni qui sotto = **sottoprodotto per il terminale FLUXION**, non deliverable VOS.

- **FLUXION come scocca** entra in linea **già a S4** (prodotto costruito). Lavoro residuo verso S6 (primo euro entro **20/6**) = eseguito da FLUXION-terminale, **usando** lo strumento di distribuzione che VOS fornisce.
- **ARGOS = scocca #2** in coda (WIP=1). Fallback se readiness FLUXION fallisce. Motivo FLUXION-first: ciclo-cassa più corto (€497 one-time, un "sì" = euro) vs ARGOS commission-on-delivery + blocker WA dup-sends.
- **Corsa nicchia-nuova** `run_20260606_190002` (media-monitoring) = **G1-REWORK, deprioritizzata** dietro la revenue. NON morta. Premessa "sotto-servito" falsificata da audit Claude AI (competitor density non verificata: Mentionlytics/BrandMentions/SocialRails/Talkwalker-free esistono → non è un vuoto). Se si riprende: ri-scoring 3 nicchie con criteri competitor-density + build-feasibility-solo + distribution-fit, loggati. Fix strutturale Discovery station: aggiungere "dove-è-andata-la-domanda" come sub-check obbligatorio (discontinuità lato-offerta ≠ domanda sotto-servita).

---

## PIANO REVENUE FLUXION (da Task growth-hacker, ancorato a DECISIONS.md D-01/D-04/D-06)

### Verticale scelto: PARRUCCHIERI / SALONI HAIR (uno solo, no split)
- **Spesa esistente**: saloni pagano già Treatwell/Booksy commissione 15-25%/appuntamento (perpetua). FLUXION €497 one-time si ripaga in 4-6 mesi → confronto diretto. *(% esatta [non verificata], confermare con pricing page Treatwell IT)*
- **Raggiungibilità senza ads**: gruppi FB "Parrucchieri italiani" / "Barbieri e Parrucchieri professionisti Italia"; Confartigianato Benessere (confartigianato.it/categoria/benessere) e CNA Benessere (cna.it) — email provinciali pubbliche, raggiungibili 48h.
- **Decisore = titolare-operatore**, no procurement → ciclo 5-7 giorni fattibile.

### Movimento presell
- **Offerta**: €497 pieno, no sconto. Leva reale: "Accetto 5 saloni per il lancio di giugno, li seguo io nell'attivazione."
- **Ask che produce pagamento**: link Stripe **acconto €197** (blocca slot) + saldo €300 post-attivazione. Se Stripe non pronto: bonifico €497 causale "FLUXION licenza + attivazione".
- **Messaggio primo contatto** (italiano, tono founder — copia-incolla):
  > Ciao [Nome], sono Gianluca — ho costruito FLUXION, un gestionale per saloni con una segretaria AI (Sara) che risponde al telefono e prende appuntamenti quando hai le mani in testa. Niente abbonamento mensile, licenza una volta sola €497. Non sono Treatwell. Sto cercando 5 saloni in Italia per il lancio di giugno — li seguo io nell'installazione. Ti mando un video di 2 minuti di Sara in azione se ti interessa.
- **Primi buyer**: post (non "vi interessa?" ma osservazione concreta su Sara) nei 2 gruppi FB + DM ai profili attivi 7gg; email Confartigianato/CNA Benessere 5 province alta-densità (MI/RM/NA/TO/BO); DM IG saloni <500 follower.

### Gate F (terminale, vincolo #1b) — `BLOCKED-ON pagamento reale`
Entro **20/6**: pagamento Stripe o bonifico ≥€197 (acconto) o €497 (pieno) da titolare salone reale mai conosciuto prima. No proxy ("interessati" non conta). Fatto = transazione su conto/dashboard Stripe.

---

## BLOCKER P0 — fixare PRIMA di mostrare la demo (agent-reported, VERIFICARE)
Il growth-hacker segnala 3 bug demo-visibili (DECISIONS.md FLUXION Open Q #9, #11, #14): trial bypass license, servizi seed non filtrati per verticale, tier "trial" nel wizard. Stima 2-4h. **Senza fix, la demo danneggia la conversione.** → Verificare la loro esistenza reale come PRIMO atto in terminale FLUXION.

---

## PROMPT RESUME (prossima sessione — terminale FLUXION, cwd /Volumes/MontereyT7/FLUXION, context pulito)

```
Revenue sprint FLUXION: primo euro entro 20/6, verticale = saloni/parrucchieri (deciso).
Leggi handoffs/HANDOFF-VOS-revenue-sprint-FLUXION-2026-06-08.md in ~/venture-os per il piano completo.
Sequenza:
1. VERIFICA i 3 P0 demo-blocker (DECISIONS.md Open Q #9/#11/#14). Se reali, fixali (delega backend-architect/frontend-developer). Done = demo gira pulita per un estraneo.
2. Registra video 2-min di Sara in azione (verticale saloni).
3. Esegui outreach presell saloni (messaggio nell'handoff): 2 gruppi FB + email Confartigianato/CNA Benessere 5 province + DM IG. Target 20-30 contatti.
4. Setup link Stripe acconto €197 (o bonifico fallback).
Gate F = ≥1 pagamento reale ≥€197 su conto/Stripe entro 20/6. BLOCKED-ON pagamento reale finché non incassato.
ARGOS = #2 in coda se readiness FLUXION fallisce.
```

## Stato corse fabbrica
- `run_20260606_190002` — S2, G1-REWORK deprioritizzata (nicchia-nuova, ripresa post-20/6)
- FLUXION — scocca prioritaria S4→S6, sprint attivo (dossier formale da istanziare in terminale FLUXION se serve tracciabilità)
