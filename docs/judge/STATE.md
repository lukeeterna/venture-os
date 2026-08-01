venture: sportswear
repo: github.com/lukeeterna/venture-os
head_atteso: ee317d1
unita_corrente: MT-2D.6
modello_previsto: Sol
blocco_attivo: MT-2D.6

Ultima unità chiusa: MT-2D.5 sponsor upload — PASS: FileReader client-side, overlay petto, reset pulito (sponsor_off/on/reset byte-identici); nessuna scrittura su disco del repo; regressione mt2+mt3+mt4 verde; 3 screenshot sponsor committati. Difetti rinviati a MT-2D.7.

GATE-0 @ee317d1 (aggiornato da giudice 2026-08-01):
- Anomalie post 3815e9a sanate qui: commit 5320b14 (fix codice B3D-01, assets-photo+index.html) e
  ee317d1 (docs: SOL-PROMPT-MT3D, prefisso errato — non docs(judge):) appartengono a MT-3D.1
  già eseguita da CC, non toccano configurator-2d/, registrate e chiuse. head_atteso avanzato.
- FASE 0 tollerati: "auto-close session" e "docs(judge):" — regola invariata.

Decisioni chiuse (NON si ridiscutono):
- Binario MOCKUP. SVG congelato in mano al founder, mai su disco né in repo.
- Attribuzione in landing: NO. Licenza tracciata solo in ASSET_LICENSE.md.
- 3 zone colore (maglia/pantaloncini/calze), ognuna ricolorabile primario+secondario.
  Sub-zone colletto/maniche = enhancement futuro, fuori scope.
- Asset derivati solo sotto assets-mockup/derived/, gitignorati. Il repo non contiene asset.
- Deploy Cloudflare: lo esegue CC, gated da GO esplicito del founder (unica azione della
  catena che non si annulla con git). Credenziali solo per nome di variabile, valori in .env.
- Ponte Sol→CC: file in incoming/<unita>.<est>, gitignorato, uno per unità, spostato lì da CC.
  CC lo copia, NON lo legge in contesto: la revisione è il controllo di integrità più la
  riesecuzione dei verify precedenti.
- FASE 0: tollerati dopo head_atteso i commit "auto-close session" e "docs(judge):".
- MT-2D.6 = payload strutturato client-safe (NON semplice mailto). Schema congelato:
  { v:1, ts, cliente:{societa,referente,recapito}, kit:[{voce,qta,colori:{p,s},pattern,nome,numero,sponsor_ref}] }
  Canale: mailto con blocco CONFIG incollabile + bottone "Copia codice preventivo".
  Vincolo assoluto: zero prezzi/costi/margini nel payload (grep prezzo|costo|eur|€ = 0).
  "Importa da configuratore" nel preventivatore = MT-2D.9 (nuova ultima unità in catena).
  Il preventivatore tools/preventivatore/index.html non si tocca prima di MT-2D.9.

Pendenti founder: "PDF ok" preventivatore; margin_floor fissata (mai numeri nel repo).
Catena: MT-2D.6 → 2D.7 → 2D.8 (deploy) → 2D.9 (importa-da-config preventivatore). Produzione entro 27/08.
Questo file si RISCRIVE a ogni FASE CHIUSURA e sostituisce gli handoff in prosa.

DIFETTI RINVIATI (da chiudere entro MT-2D.7):
- alone alpha ~1-2px sui bordi del capo (MT-2D.3)
- chevron invisibile su maglia in zone d'ombra profonda (MT-2D.3)
- calze piccole: pattern poco leggibile alla dimensione mockup (MT-2D.3)
- numero petto disegnato sopra lo shading, non moltiplicato: sembra un adesivo,
  non una stampa che segue le pieghe (MT-2D.4)
- font stack sistema: 3/5 visibilmente distinti (geometric+college; block/condensed/technical
  quasi indistinguibili alla dimensione canvas). Stack ripega sul default per condensed/technical (MT-2D.4)
- sponsor disegnato in overlay finale sopra lo shading, non moltiplicato (drawSponsor: destination-in
  maschera maglia + ctx.drawImage, nessun multiply): come il numero, sembra un adesivo piatto, non
  una stampa che segue le pieghe del tessuto (MT-2D.5)
- sponsor a posizione/scala fisse (area petto box.w*0.48 × box.h*0.12, y=0.2h): nessun controllo
  utente su collocazione o dimensione del logo (MT-2D.5)

## TRACCIA 3D (parallela, non sostituisce il 2D)
- MT-3D.1 configuratore ruotabile da asset fotografico — kit visibile, 2 difetti aperti per Sol:
  - D3D-01 retro mancante (angolo bloccato ±70°, serve retro sintetico neutro — Opzione A)
  - D3D-02 sbavature colore (smoothstep troppo largo o zone mesh mal assegnate)
  - Brief completo: docs/judge/2026-07-31-sportswear-mt3d1.md §DIFETTI VISIVI
  - Brief Sol per D3D-01+D3D-02: ventures/run_20260711_161411/configurator/SOL-PROMPT-MT3D.md
- gate estetico founder: NON ancora dato
