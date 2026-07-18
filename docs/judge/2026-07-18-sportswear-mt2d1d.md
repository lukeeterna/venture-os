# MT-2D.1d — Verbale di chiusura (gate: MOCKUP)

Data: 2026-07-18 · Progetto: sportswear · Configuratore 2D
Esperimento: mockup fotorealistico come alternativa al template SVG.

## FASE 0 (read-only, verbatim)

```
=== git log --oneline -3 ===
a7cf754 auto-close session 2ee0d4ed-fef8-4df9-845c-1922b6ac5830 @ 2026-07-18T11:59:21Z
f669cd8 auto-close session 2b8089df-e3ea-4984-8d41-c7e9ba72b4fe @ 2026-07-18T06:25:42Z
9d78977 sportswear: 2D MT-2D.1 gate founder NEGATIVO — stop, attesa nuova direzione

=== git status ===
On branch master
Your branch and 'imac/master' have diverged,
and have 14 and 1 different commits each, respectively.
Untracked files:
	ventures/run_20260711_161411/configurator-2d/HANDOFF-MT-2D.1d.md
nothing added to commit but untracked files present
```
(Il file HANDOFF, scratch creato dall'esecutore prima del verbale, è stato rimosso: sostanza confluita in questo report; nessun altro file toccato.)

## Sintesi PASSI 1–3

**PASSO 1 — Asset + licenza.** `.gitignore` creato e verificato con `git check-ignore` PRIMA del download (`assets-mockup/`, `lab/` esclusi). Asset da psfiles.com (Complete Soccer / Full Kit Mockup, Smart Layer PSD) → redirect Google Drive; dichiarato "RAR" ma in realtà archivio ZIP (85 MB) → `unzip` nativo, nessun muro di estrazione. Licenza di pagina verbatim: *"Free for personal and commercial use"*. Autore reale (readme interno all'archivio): **Alexandru Istratuca** (behance.net/istra2k); PSFiles è ri-distributore (credit di pagina `salimseddiki`). Attribuzione non esplicitamente obbligatoria ma prudente. Tracciato in `ASSET_LICENSE.md`.

**PASSO 2 — Estrazione maschere.** psd-tools 1.17.4 (venv gitignorato). Inventario layer estratto verbatim. Nodo di giudizio: gli smart-object (gruppo `Smarts`) servono solo a design/loghi; il controllo COLORE è nel gruppo `Parts` (layer `solidcolorfill`) con **maschere pulite separabili**, e il gruppo `Texture` (multiply/screen/overlay) fornisce l'ombreggiatura delle pieghe. → NON è la discordanza bloccante "smart-object non separabili in maschere pulite". Estratte 3 maschere alpha per capo: **maglia** (Shirt/Back/Neck/braccia/maniche), **pantaloncini** (Short), **calze** (Socks/Upper socks) + composito base + mappa di ombreggiatura normalizzata a bianco per capo (p5–p95).

**PASSO 3 — Ricolorazione provata.** Canvas web (`lab/index.html`): `multiply(colore × ombreggiatura)` per capo, clip sulla maschera alpha del capo. **Bug intercettato e corretto**: le maschere erano PNG grayscale senza canale alpha → `destination-in` manteneva l'intera scena (alpha=255 ovunque) tingendo tutto; rigenerate come RGBA con alpha=forma → isolamento per-capo corretto. Verify headless: 2 ricolorazioni fronte (kit rosso/bianco, kit blu/bianco), pieghe e ombre preservate, scarpe/sfondo intatti (`verify/mt1d/recolor1_rosso.png`, `recolor2_blu.png`, `screenshot.sh`).

## Nota di forma (deviazione, sostanza conforme)

I 5 file committabili (`.gitignore`, `ASSET_LICENSE.md`, `verify/mt1d/` × 3) sono entrati in git tramite l'hook **auto-close `a7cf754`**, cioè PRIMA della decisione formale del gate. Deviazione di forma (commit non intenzionale dell'esecutore), sostanza conforme al mandato: **zero asset in git** (PSD/ZIP/venv/mappe restano esclusi via `.gitignore`), solo testo + screenshot. Non ricommittati (non è discordanza).

## Decisione del gate

**GATE = MOCKUP.** Sigillo estetico del founder dato in chat sugli screenshot (2026-07-18). Binario ratificato su raccomandazione del giudice, che se ne assume la responsabilità tecnica.

## Vincolo fissato per MT-2D.8

Nel footer della landing DEVE comparire la riga di attribuzione:
`Mockup: Alexandru Istratuca (behance.net/istra2k)`

## Correzione a registro

Il template SVG di fallback **NON è su disco**: resta in mano al founder come fallback congelato. Il binario MOCKUP non lo consuma.
