venture: sportswear
repo: github.com/lukeeterna/venture-os
head_atteso: 1e8ee36572e77039e6a6f02c6df05b7525ede4b0
unita_corrente: MT-2D.7
modello_previsto: Sol
blocco_attivo: nessuno

Ultima unità chiusa: MT-2D.6 output cliente — PASS: PR #2 mergiata su master; sezione "Riepilogo e richiesta preventivo" sotto il canvas; window.__payload deterministico v:1 con colori lowercase; textarea readonly/live con JSON.stringify(window.__payload); copia con Clipboard API + fallback execCommand fail-closed e stato "Copiato ✓" per 2s; mailto esplicito con placeholder [ATTIVITA], [EMAIL_ATTIVITA], [TEL]; PAYLOAD_SPEC.md completo; regressioni MT2+MT3+MT4+MT5 verdi. Writer head f9e99a9cf2d4ea0a4dc085f7cd3ef2d26d544a2b; merge commit 1e8ee36572e77039e6a6f02c6df05b7525ede4b0.

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
Catena: MT-2D.7 → 2D.8 (deploy) → 2D.9. Produzione entro 27/08.
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
- gate estetico founder: NON ancora dato