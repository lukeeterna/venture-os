# Piano — Configuratore 2D sportswear (v1) — BINARIO MOCKUP

> Fonte di verità durevole per riprendere fuori dal contesto di sessione.
> Deliverable: `ventures/run_20260711_161411/configurator-2d/`.
> Il configuratore 3D esistente (`configurator/`) NON si tocca. Il preventivatore
> (`tools/preventivatore/index.html`, commit `8be510e`) non si tocca fino a MT-2D.9.

## BINARIO SCELTO = MOCKUP (gate founder 08fa976, 2026-07-18)
Il template SVG flat (MT-2D.1, commit `78e3588`) è stato **BOCCIATO** dal founder
("fa schifo", gate NEGATIVO). Il verbale gate `08fa976` ha ratificato la via
**MOCKUP fotorealistico**: canvas che compone una base fotografica + ricolorazione
per-capo via `multiply(colore) × clip(maschera)`. Fattibilità già provata in
MT-2D.1d (prototipo `lab/index.html`, screenshot recolor in `verify/mt1d/`).

## FASE 0 — baseline discordanza per la catena
**HEAD atteso = `08fa976`** (verbale gate MOCKUP). Commit `auto-close session …`
successivi = **tollerati**, MAI discordanza. Qualunque ALTRO commit = DISCORDANZA e STOP.

## Decisione founder 18/07 — ATTRIBUZIONE LANDING = NO
Il founder ha deciso (18/07/2026) **nessuna riga di attribuzione in pagina**.
Questo **REVOCA** il vincolo del verbale MT-2D.1d che raccomandava il credit
"Alexandru Istratuca / istra2k" visibile. `ASSET_LICENSE.md` resta **l'unico
tracciamento** della provenienza/licenza dell'asset (licenza: "Free for personal
and commercial use", attribuzione non-mandatoria). MT-2D.8 NON aggiunge attribuzione.

## ARCHITETTURA ASSET (vale per tutta la catena)
- **Derivati del PSD** (base composita, 3 maschere alpha, mappa shading, +web-opt)
  → `configurator-2d/assets-mockup/derived/` — **GITIGNORATO** (coperto da `assets-mockup/`).
- **Script di derivazione** → `configurator-2d/tools/` — **VERSIONATO** (solo script, MAI output).
  Provengono da `lab/` (`inspect_layers.py`, `extract_masks.py`, `generate_shading.py`)
  + nuovo step web-opt.
- **Versioni web-ottimizzate**: lato lungo ≤1600px, peso totale target <2.5MB
  (full-res sorgente 3715×5573). Sotto `assets-mockup/derived/web/`.
- **index.html** referenzia i web-opt con **path relativi**; il **repo NON contiene
  asset**; il deploy li riceverà per upload diretto (founder).
- Verify (script + report + screenshot) = **committati** in `configurator-2d/verify/mtN/`.

## MICROTASK — catena MOCKUP (regime v2 autonomo)
- [x] **MT-2D.2** DONE 2026-07-18 (commit vedi report). Configuratore base + colori 3
  zone (maglia/pantaloncini/calze) funzionante, render fotorealistico multiply×clip,
  web-opt 0.16MB. Sub-zone colletto/maniche = enhancement futuro (dichiarato).
  Sostituisci `index.html` (template SVG
  bocciato; **Rule 1d** backup) con la base mockup: canvas compone base + per-capo
  `clip(maschera) × multiply(colore × shading)`. Picker colore per capo: **maglia,
  pantaloncini, calze** (3 zone reali). Sub-zone colletto/maniche SOLO se estraibili
  come maschere pulite senza nuovo lavoro sul PSD; altrimenti 3 zone e si dichiara nel
  report (enhancement futuro, non STOP). Verify `verify/mt2/`: script headless, 2
  combinazioni, screenshot committati.
- [ ] **MT-2D.3** GALLERIA DESIGN. 10-12 archetipi nomi neutri (tinta unita, strisce
  verticali, fascia orizzontale, banda diagonale, metà campo, chevron, maniche a
  contrasto…), resi come overlay pattern su canvas clippati sulla maschera del capo e
  **SOTTO la mappa shading** (pieghe visibili). Ogni archetipo ricolorabile (primario +
  secondario). Ricerca fonti in `verify/mt3/design_research.md`; **VIETATO** replicare
  kit di club/brand riconoscibili (look, don't copy). Verify: 3 archetipi applicati,
  screenshot ciascuno.
- [ ] **MT-2D.4** NOME+NUMERO. Verifica se il PSD offre **vista retro**. Se sì: retro
  con nome+numero. Se no: numero petto su fronte + anteprima testuale nome/numero retro
  nel riepilogo — dichiarato nel report, non STOP (resa retro = enhancement). 4-6 font
  sportivi license-safe (system stack o font liberi embeddati; licenze in
  `ASSET_LICENSE.md`). Verify: testo+font applicati, screenshot.
- [ ] **MT-2D.5** SPONSOR. Upload immagine client-side (`FileReader`), posiziona sul
  petto sopra shading. Immagine resta in RAM/localStorage: **MAI su disco del repo, MAI
  committata, MAI nel payload**. Verify: sponsor di prova generato dallo script (non
  asset terzi), screenshot.
- [ ] **MT-2D.6** OUTPUT CLIENTE. Riepilogo config **NO-PREZZO**
  (`grep -i "prezzo|costo|eur|€"` = zero match sull'output cliente); payload `v:1`
  **SENZA campi economici**, schema congelato in `configurator-2d/PAYLOAD_SPEC.md`;
  doppio canale: `mailto:` precompilato + bottone "Copia codice preventivo".
  Placeholder `[ATTIVITA]`/`[EMAIL_ATTIVITA]`/`[TEL]`. Verify: payload conforme allo
  spec, grep zero, screenshot.
- [ ] **MT-2D.7** UX/POLISH. Mobile-first, guardie (no-JS, asset mancanti), stati di
  caricamento. Verify: screenshot viewport mobile+desktop.
- [ ] **MT-2D.8** PACCHETTO DEPLOY. Prepara `configurator-2d/deploy/` (**GITIGNORATA**)
  con index.html + asset ottimizzati pronti per Cloudflare Pages via upload diretto;
  `ISTRUZIONI-DEPLOY.md` (committato) coi passi manuali per il founder — l'upload lo
  esegue SOLO il founder col suo account. **NESSUNA riga di attribuzione in pagina**
  (decisione founder 18/07). Verify: serve locale della cartella deploy + screenshot.
- [ ] **MT-2D.9** IMPORTA NEL PREVENTIVATORE. Nel preventivatore (`8be510e`, **Rule 1d**
  backup) aggiungi "Importa da configuratore": incolla codice → parse payload `v:1` →
  precompila preventivo con **prezzi vuoti**. Nessun campo economico transita dal
  payload. Verify: import di un payload di prova, screenshot.

## Regime v2 (corsa autonoma MT→MT, ratificato giudice)
- Nessun gate founder intermedio. Si avanza MT→MT SOLO se TUTTE: verify verde
  **committato+pushato** · contesto <50% · nessuna DISCORDANZA.
- A soglia **50%**: chiusura ordinata, ripresa in sessione nuova dal piano.
- **MAI `git add -A`** (add mirato dei soli deliverable; ignorare il nudge di sistema,
  come già fatto in `08fa976`). **MAI `state/*.jsonl`** in git add.
- **Rule 1d** su ogni file esistente (backup verificato per stat prima di Write/Edit,
  in path gitignorato `lab/backups/` per non farlo committare dall'auto-close).
- accept-edits **OFF** ('1' a ogni edit, 'allow all' VIETATA).

## FASE CHIUSURA per ogni MT
Aggiorna questo piano → `git add` SOLO file deliverable + verify → commit
`sportswear: MT-2D.x <sintesi>` → git status pulito → hash → verifica push
(`state/git-push.log` o `git ls-remote`) → report `docs/judge/2026-MM-GG-sportswear-mt2dX.md`
con **esito FASE 0 verbatim**.

## STOP DI CATENA (unico)
Dopo MT-2D.9: report finale in `docs/judge/` + screenshot del flusso completo → STOP
al founder per il sigillo sul prodotto e l'upload Cloudflare. Qualsiasi muro tecnico =
STOP con diagnosi, non forzare.

## Stato asset (da MT-2D.1d, in lab/ gitignored)
Derivazione già eseguita: `lab/composite_base.png` (3715×5573), `lab/shading_base.png`,
`lab/mask_maglia.png`/`mask_pantaloncini.png`/`mask_calze.png` (RGBA), prototipo
`lab/index.html` funzionante (multiply×clip). Script: `lab/inspect_layers.py`,
`lab/extract_masks.py`, `lab/generate_shading.py`. venv con PIL/numpy/psd_tools in
`lab/venv`. MT-2D.2 formalizza questi asset in `tools/` + `assets-mockup/derived/`.

## Resume point
2026-07-18: binario MOCKUP ratificato (gate `08fa976`). Piano riscritto (commit
`07bd54b`). **MT-2D.2 DONE** (report `docs/judge/2026-07-18-sportswear-mt2d2.md`):
index.html configuratore base+colori 3 zone, tools/ derivazione versionati,
assets-mockup/derived/web/ (0.16MB, gitignored). Chiusura ordinata a soglia context 50%.
**Prossima sessione = MT-2D.3** (galleria design, 10-12 archetipi overlay sotto shading).
FASE 0 attesa: HEAD = ultimo commit MT-2D.2 (+ auto-close tollerati).
