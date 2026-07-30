venture: sportswear
repo: github.com/lukeeterna/venture-os
head_atteso: 48a283d
unita_corrente: MT-2D.4
modello_previsto: Sol
blocco_attivo: nessuno

Ultima unità chiusa: MT-2D.3 galleria 12 archetipi — PASS: 3 archetipi verificati (vertical-stripes, chevron, quarters), shading multiply visibile, regressione mt2 verde. Difetti dichiarati: alone alpha ~1-2px sui bordi, chevron invisibile su maglia in zone d'ombra, calze piccole riducono leggibilità pattern. Entrambi rinviati a MT-2D.7.

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
Catena: MT-2D.4 → 2D.5 → 2D.6 → 2D.7 → 2D.8 (deploy) → 2D.9. Produzione entro 27/08.
Questo file si RISCRIVE a ogni FASE CHIUSURA e sostituisce gli handoff in prosa.
