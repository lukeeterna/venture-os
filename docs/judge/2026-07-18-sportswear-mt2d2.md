# Report giudice — sportswear MT-2D.2 (configuratore base + colori)

Data: 2026-07-18 · Binario: **MOCKUP** (gate `08fa976`) · Regime v2

## FASE 0 (read-only, verbatim)
```
$ git log --oneline -3
08fa976 sportswear: MT-2D.1d verbale gate — scelta MOCKUP
a7cf754 auto-close session 2ee0d4ed-fef8-4df9-845c-1922b6ac5830 @ 2026-07-18T11:59:21Z
f669cd8 auto-close session 2b8089df-e3ea-4984-8d41-c7e9ba72b4fe @ 2026-07-18T06:25:42Z

$ git status
On branch master
Your branch and 'imac/master' have diverged,
and have 15 and 1 different commits each, respectively.
  (use "git pull" to merge the remote branch into yours)

nothing to commit, working tree clean
```
HEAD = `08fa976` (atteso). Nessuna DISCORDANZA. Divergenza `imac/master` = backup
secondario in ritardo (noto dal brief 18/07); target autoritativo push = `github`.

## FASE 1 — piano (commit `07bd54b`, pushato github)
Piano `state/plans/plan_sportswear_configurator_2d_v1.md` riscritto (Rule 1d backup):
binario MOCKUP, catena MT-2D.2→2D.9, attribuzione landing = NO (decisione founder
18/07, revoca vincolo verbale mt2d1d; ASSET_LICENSE.md unico tracciamento),
architettura asset (derived/ gitignored, script tools/ versionati, web-opt <2.5MB).

## MT-2D.2 — cosa è stato fatto
- **Rule 1d**: backup `index.html` (SVG bocciato) verificato per stat in
  `lab/backups/` (gitignored) prima di sostituirlo. IDENTICAL, size 19953.
- **Asset**: derivati full-res del PSD (già validati in MT-2D.1d) formalizzati in
  `assets-mockup/derived/` (gitignored). Nuovo step **web-opt**
  (`tools/optimize_web.py`) → `derived/web/` a 1067×1600px:
  `shading_base.jpg` 78KB + 3 maschere PNG (48/17/20KB). **Totale 0.16 MB** (target <2.5MB).
- **Script versionati** in `tools/` (solo script, output gitignored):
  `inspect_layers.py`, `extract_masks.py`, `generate_shading.py`, `optimize_web.py`,
  `README.md`. Pipeline riproducibile dal PSD. NON ri-eseguita questa sessione
  (154MB PSD, RAM al limite): asset riusati dagli output MT-2D.1d già validati.
  Correzioni portate: formato canonico maschere = RGBA alpha=forma; `generate_shading`
  legge l'alpha (bug `convert("L")` sui mask RGBA-zeroed corretto).
- **index.html**: configuratore base + colori, vanilla JS, ZERO CDN, ES5-safe.
  Canvas compone `shading_base` + per-capo `multiply(colore) × destination-in(maschera)`.
  3 picker: **maglia, pantaloncini, calze** (3 zone reali). Asset referenziati con
  path relativi `assets-mockup/derived/web/` → **il repo NON contiene asset**.
  Guardia errore asset mancanti (base). Supporto `?zona=RRGGBB` per verify headless.
- **Sub-zone colletto/maniche**: `Neck`/`Right Arm`/`Left Arm` sono layer PSD separati
  → estraibili senza nuovo lavoro sul PSD, ma **dichiarati enhancement futuro**
  (MT-2D.2 = 3 zone reali, come da mandato). NON è uno STOP.

## Verify (verde)
`verify/mt2/screenshot.sh` — Chrome headless, 2 combinazioni via URL param:
```
combo1_blu.png: 193477 byte   (maglia+calze blu, pantaloncini bianchi)
combo2_rosso.png: 156478 byte (maglia+calze rossi, pantaloncini neri)
SCREENSHOT: PASS
```
Ispezione visiva `combo1_blu.png`: maglia blu fotorealistica (pieghe/ombreggiatura
visibili tramite multiply), pantaloncini bianchi, calze blu, pannello 3 zone con hex.
Screenshot committati come evidenza.

## Esito
MT-2D.2 = **VERDE**, committato + pushato (github). Chiusura ordinata a soglia
context 50% (regime v2): **NON avviato MT-2D.3**. Ripresa in sessione nuova dal piano.
