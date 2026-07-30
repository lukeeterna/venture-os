# MT-2D.3 — Report chiusura — 2026-07-30

## FASE 0 — verbatim

HEAD atteso: ab43539 (sportswear: MT-2D.2 configuratore base + colori mockup (3 zone))
HEAD effettivo: ab435396dfe34ee801664270e82b19b00c353c35 — CONCORDANZA ✓
MT-2D.3 primo non spuntato nel piano ✓

## Autore del codice

GPT-5.6 Sol — consegnato inline nella sessione del giudice (caso c: testo di sessione).

## Delta imposto dal giudice

Nel blocco `catch` di `findMaskBounds`, il catch silenzioso (`catch (ignore) { // commento }`)
è stato sostituito con:
- `window.__boundsFallback = true`
- visualizzazione avviso visibile in `#err`: "Anteprima approssimata: apri la pagina via
  server locale per la resa corretta."

Motivazione: sotto `file://` senza `--allow-file-access-from-files`, `getImageData` lancia
`SecurityError`; i bounds ripiegano sull'intera immagine e i pattern escono a scala sbagliata
senza nessun segnale per l'utente.

## Controllo di integrità — voce per voce

- a) `<html>` aperto e chiuso: PASS (1/1)
- b) segnaposto `...`: PASS (0 occorrenze)
- c) path assoluti `/Users/` o `/Volumes/`: PASS (0)
- d) URL/CDN nuovi rispetto al .bak: PASS (0 in entrambi)
- e) chiavi/valori economici/contatti: PASS (0)
- f) ASSET_DIR e nomi file identici al .bak: PASS (`assets-mockup/derived/web/`, mask_maglia/pantaloncini/calze.png, shading_base.jpg)

## Esito regressione MT-2D.2

PASS — `verify/mt2/screenshot.sh` non modificato; 2 file generati:
- combo1_blu.png: 229730 byte
- combo2_rosso.png: 198190 byte

## Tempo di avvio

Wallclock Chrome headless (startup + load + render): ~4.2s.
Dominato da avvio processo Chrome (~3s). Asset locali file:// < 1s.

## window.__boundsFallback

**false** — sotto `file://` con `--allow-file-access-from-files` (flag usato nello script
verify), `getImageData` funziona senza SecurityError. Il catch non viene triggerato.
In produzione su Cloudflare (https://): `__boundsFallback = false` garantito (CORS non
applicabile per risorse same-origin).

## Difetti osservati (ispezione screenshot al 100%)

1. **Alone alpha ~1-2px sui bordi** (tutti gli archetipi): artefatto anti-aliasing del
   compositing multiply×clip — bordo sottile chiaro sul contorno colletto/maniche dove
   la maschera RGBA incontra l'area trasparente. Entità cosmetica, non distorsiva.

2. **Chevron invisibile sulla maglia** (archetype_chevron): lo stroke secondario giallo
   (#f5c518) su primario verde (#1a7c3d) viene annullato dal multiply del shading_base
   nelle zone d'ombra del corpo maglia. Il chevron è geometricamente presente ma
   cromaticamente assorbito. Visibile sulle maniche in controluce. Da valutare in MT-2D.7.

3. **Pattern illeggibile su calze piccole** (chevron, altri): la bounding box delle calze
   è piccola (~80×140px stimati); la geometria chevron produce un punto senza forma
   riconoscibile. Da valutare in MT-2D.7 (scala minima pattern per capo piccolo).

4. **Calze parzialmente fuori viewport** (tutti): con window-size=1200×1000 headless, il
   bordo inferiore delle calze è tagliato. UX da correggere in MT-2D.7.

## Archivio verify

- `verify/mt3/screenshot.sh` — committato
- `verify/mt3/archetype_vertical-stripes.png` — committato
- `verify/mt3/archetype_chevron.png` — committato
- `verify/mt3/archetype_quarters.png` — committato
- `verify/mt3/design_research.md` — committato
