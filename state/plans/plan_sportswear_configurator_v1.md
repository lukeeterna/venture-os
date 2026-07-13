# PIANO MICROTASK — Sportswear: configuratore kit v1

> Deliverable: configuratore web di kit calcio per scuole calcio / ASD / squadre
> amatoriali dilettanti italiane. Statico, Cloudflare Pages. UNA unità, scomposta
> in 7 microtask sequenziali con commit e checkpoint per microtask.
> Creato: 2026-07-13. Stato: **ATTESA VIA LIBERA GIUDICE** (nessun MT eseguito).

## Deliverable path (versionato, NON /tmp)

- Cartella: `ventures/run_20260711_161411/configurator/`
- File principale: `index.html` (single-file autoportante — importmap CDN, zero build step)
- Stato durevole: `ventures/run_20260711_161411/CONFIGURATOR_PROGRESS.md` (creato a fine MT1, aggiornato ogni MT)

## Decisione tecnica 3D (motivata — ho il disco)

**Via A: three.js real-3D con mesh procedurale a zone-materiale + CanvasTexture live.**

- **Perché A e non B**: i requisiti (colori indipendenti + tonalità libere + pattern +
  upload sponsor live + nome/numero live) impongono compositing runtime. Il pre-render
  (Via B) può mostrare solo combinazioni pre-generate → esplosione combinatoria e
  impossibilità strutturale di renderizzare un logo caricato dall'utente. B è
  *incompatibile*, non "meno". (DISCORDANZA registrata nel report.)
- **Rotazione**: OrbitControls = orbit libero vero (fronte/retro/laterale + qualsiasi
  angolo). Preset-camera per fronte/retro/lato come scorciatoie e come fallback.
- **Mesh**: geometria maglia costruita in codice (BufferGeometry/Lathe: torso + maniche +
  colletto come gruppi-materiale distinti) → colori indipendenti nativi (un materiale per
  zona), zero dipendenza da asset GLB esterno → single-file, offline, licenza-safe.
  Trade-off dichiarato: mesh stilizzata-realistica, non fotoscannerizzata come spized;
  upgrade a GLB modellato = enhancement futuro se emerge asset con licenza.
- **Pattern/logo/nome-numero**: compositati su un `<canvas>` 2D → `THREE.CanvasTexture`
  applicata via UV mapping sul corpo/retro. Aggiornamento live.
- **Scena accattivante**: studio backdrop (gradiente + ground), 2-3 luci, tone mapping.
- **Mobile**: WebGL supportato su Safari mobile; mesh a basso poly. Degradazione:
  no-WebGL o `prefers-reduced-motion` → stop auto-rotazione, angoli-camera fissi.
- **Librerie (CDN pubblica, tutte free/MIT)**: `three` (r160+) e `OrbitControls` via
  jsDelivr ESM importmap. Nessuna dipendenza a pagamento. Nessun altro pacchetto.

## Checklist best-practice di mercato (da FASE 0, sintesi)

STANDARD (≥3 leader): preview live · color picker per-zona · pattern da libreria ·
nome+numero per giocatore con font · upload logo/sponsor con posizionamento.
CONVENZIONE-CHIAVE: i brand con rete rivenditori (VX3, Macron, Erreà) **nascondono il
prezzo** e chiudono in "richiedi preventivo" → coerente col vincolo founder no-prezzo.
Ordine passi tipico: modello → colori/pattern → nome/numero → loghi → riepilogo/preventivo.
NICE-TO-HAVE (scartati v1): AR view, voting-tool team, sample order, app mobile nativa.

## Microtask

| MT | Obiettivo | File toccati | Fatto terminale | Dip. |
|----|-----------|--------------|-----------------|------|
| MT1 | Scaffold + scena 3D base: index.html, importmap three.js+OrbitControls, scena+luci+backdrop, mesh maglia (corpo/maniche/colletto = gruppi distinti), OrbitControls, preset fronte/retro/lato | `configurator/index.html` (NEW), `CONFIGURATOR_PROGRESS.md` (NEW) | index.html aperto nel browser renderizza una maglia 3D ruotabile con orbit + 3 preset | — |
| MT2 | Color picker indipendenti corpo/colletto/maniche con tonalità libere (`input type=color`), wired ai materiali | `configurator/index.html` | cambiare un picker aggiorna live la zona corrispondente | MT1 |
| MT3 | Pattern: tinta unita, strisce, fasce, banda, metà, chevron — su CanvasTexture del corpo | `configurator/index.html` | selezionare un pattern aggiorna la texture della maglia | MT1,MT2 |
| MT4 | Testo NOME + NUMERO + selezione multi-font (rosa font sportivi leggibili) sul retro | `configurator/index.html` | nome/numero/font renderizzati sul retro | MT1,MT3 |
| MT5 | Upload sponsor multi-formato client-side (PNG/JPG/SVG) via FileReader, validazione formato/peso, preview posizionata sul petto + controllo posizione, zero upload a server | `configurator/index.html` | caricare un PNG/JPG/SVG mostra il logo sulla maglia | MT1,MT3 |
| MT6 | Camerino virtuale (vista scenica) + riepilogo kit + CTA "Richiedi preventivo gratuito" (raccoglie società/quantità/recapito → mailto `[EMAIL_ATTIVITA]` con config). NESSUN PREZZO | `configurator/index.html` | CTA apre mailto con riepilogo config; grep conferma zero prezzo | MT1-MT5 |
| MT7 | Responsive fino a 375px + accessibilità (focus tastiera visibile, alt/aria sui controlli, `prefers-reduced-motion` stop auto-rotazione) + degradazione 3D no-WebGL | `configurator/index.html` | funziona a 375px, tab-nav, reduced-motion onorato, fallback WebGL | MT1-MT6 |

## Disciplina per microtask

- **Soglia contesto 50%**: se supero il 50% prima del MT successivo, chiudo ordinato e riprendo in sessione nuova (fonte di verità = `CONFIGURATOR_PROGRESS.md`).
- **Commit per MT**: ogni MT con fatto terminale → `git add` dei soli file toccati + commit d'unità + `git status` pulito + hash. Nessun maxi-commit finale. MAI `git add` di `state/*.jsonl`.
- **Report per MT**: a ogni chiusura riporto eseguito + stack/librerie + file toccati + hash + % contesto. Il giudice giudica il MT contro il suo fatto terminale prima della via libera al successivo.
- **Rule 1d**: `index.html` dopo MT1 è file esistente → backup verificato prima di ogni Edit successivo. `CONFIGURATOR_PROGRESS.md` idem. `state/*.jsonl` esclusi (append-only).
- **accept-edits**: '1' a ogni edit; opzione "allow all" vietata.

## Rollback

File nuovi del deliverable → rimossi col revert dei commit d'unità. File esistenti toccati (index.html, PROGRESS dopo la loro creazione) → ripristino dai backup Rule 1d. Nessun percorso fuori dal deliverable toccato.
