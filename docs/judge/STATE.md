venture: sportswear
repo: github.com/lukeeterna/venture-os
head_atteso: DA_COMPILARE
unita_corrente: MT-2D.5
modello_previsto: Sol
blocco_attivo: nessuno

Ultima unità chiusa: MT-2D.4 nome+numero — PASS: PSD SENZA vista retro (verificato per ispezione diretta 4 JPG preview); numero canvas sul petto frontale; anteprima retro testuale con 5 font system stack; regressione mt2+mt3 verde; 5 screenshot font generati. Difetti rinviati a MT-2D.7.

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
- FASE 0: tollerati dopo head_atteso i commit "auto-close session" e "docs(judge): state".

Pendenti founder: "PDF ok" preventivatore; margin_floor fissata (mai numeri nel repo).
Catena: MT-2D.5 → 2D.6 → 2D.7 → 2D.8 (deploy) → 2D.9. Produzione entro 27/08.
Questo file si RISCRIVE a ogni FASE CHIUSURA e sostituisce gli handoff in prosa.

DIFETTI RINVIATI (da chiudere entro MT-2D.7):
- alone alpha ~1-2px sui bordi del capo (MT-2D.3)
- chevron invisibile su maglia in zone d'ombra profonda (MT-2D.3)
- calze piccole: pattern poco leggibile alla dimensione mockup (MT-2D.3)
- numero petto disegnato sopra lo shading, non moltiplicato: sembra un adesivo,
  non una stampa che segue le pieghe (MT-2D.4)
- font stack sistema: 3/5 visibilmente distinti (geometric+college; block/condensed/technical
  quasi indistinguibili alla dimensione canvas). Stack ripega sul default per condensed/technical (MT-2D.4)
