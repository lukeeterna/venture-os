# MT-2D.3 — Ricerca design: 12 archetipi

## Natura delle primitive

I 12 archetipi sono **primitive geometriche disegnate proceduralmente su canvas 2D**
tramite `CanvasRenderingContext2D` (fillRect, beginPath/lineTo/stroke).
Nessuna immagine esterna, nessun kit grafico, nessun font, nessun marchio di terzi
consultato o riprodotto. I nomi sono **descrizioni geometriche generiche** in italiano,
non riferimenti a club, brand o divise specifiche.

## Lista 12 archetipi

| # | id | nome |
|---|-----|------|
| 1 | `solid` | Tinta unita |
| 2 | `vertical-stripes` | Righe verticali |
| 3 | `horizontal-stripes` | Righe orizzontali |
| 4 | `horizontal-band` | Fascia orizzontale |
| 5 | `diagonal-band` | Banda diagonale |
| 6 | `half-split` | Metà campo |
| 7 | `chevron` | Chevron |
| 8 | `side-panels` | Pannelli laterali |
| 9 | `contrast-shoulders` | Spalle a contrasto |
| 10 | `center-band` | Banda centrale |
| 11 | `quarters` | Quarti alternati |
| 12 | `pinstripes` | Gessato fine |

## Implementazione

Ogni archetipo accetta `(target, designId, box, primary, secondary)`:
- `box` = bounding box della maschera capo (da `findMaskBounds`)
- Pattern disegnato su `patternCanvas` → clip via `destination-in` con maschera
- Shading moltiplicato sopra il pattern (`multiply`) → pieghe e volumi visibili
- Colori primario e secondario configurabili per capo (maglia / pantaloncini / calze)

## Limitazioni note (MT-2D.3)

- Chevron invisibile su maglia in condizioni di forte ombra (multiply annulla il secondario chiaro)
- Geometrie piccole (calze) riducono la leggibilità del pattern
- Entrambi da valutare in MT-2D.7 (UX/polish)
