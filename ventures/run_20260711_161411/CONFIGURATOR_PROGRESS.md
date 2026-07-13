# CONFIGURATOR_PROGRESS — sportswear kit configuratore v1

> Fonte di verità durevole per riprendere il build fuori dal contesto di sessione.
> Piano: `state/plans/plan_sportswear_configurator_v1.md`.

## Stack / librerie fissati
- Single-file autoportante: `ventures/run_20260711_161411/configurator/index.html`
- three.js r0.160.0 (ESM importmap, CDN jsDelivr) — MIT
- OrbitControls (three/addons) — MIT
- Zero build step, zero dipendenze a pagamento. Deploy statico Cloudflare Pages.
- 3D = Via A (mesh procedurale a zone-materiale + CanvasTexture, orbit libero). DISCORDANZA su Via B ratificata dal giudice 2026-07-13.

## Microtask — stato
- [x] **MT1** scaffold + scena 3D base — COMPLETATO 2026-07-13
- [ ] MT2 colori indipendenti corpo/colletto/maniche + tonalità libere
- [ ] MT3 pattern (tinta unita/strisce/fasce/banda/metà/chevron) via CanvasTexture
- [ ] MT4 nome + numero + multi-font (retro)
- [ ] MT5 upload sponsor multi-formato client-side (PNG/JPG/SVG) + posizionamento
- [ ] MT6 camerino virtuale (kit INDOSSATO su busto/manichino) + riepilogo + CTA preventivo (NO PREZZO)
- [ ] MT7 responsive 375px + accessibilità + degradazione 3D no-WebGL

## Dettaglio MT1 (completato)
- File creati: `configurator/index.html` (NEW), `CONFIGURATOR_PROGRESS.md` (NEW)
- Realizzato:
  - Renderer WebGL (antialias, shadow PCFSoft, ACES tone mapping, sRGB) + guardia WebGL con fallback `.no-webgl`.
  - Scena: backdrop radiale (CSS), 3 luci (hemisphere + key con ombra + fill), piano ShadowMaterial per contatto a terra.
  - Maglia procedurale: `bodyMesh` (ExtrudeGeometry da Shape con scollo a giro), 2 maniche (`makeSleeve`, una specchiata), colletto (TorusGeometry semi-anello). Tre materiali di zona distinti `bodyMat`/`sleeveMat`/`collarMat`.
  - Zone esportate su `window.__kit` per wiring MT2+.
  - OrbitControls: rotazione libera, damping, no-pan, min/max distance, autoRotate rispetta `prefers-reduced-motion`.
  - Preset vista fronte/retro/lato con lerp camera + `aria-pressed`.
  - Toggle rotazione automatica, resize responsivo, focus-visible sui controlli.
- Fatto terminale MT1: **verifica umana** — Luke apre `index.html` nel browser e conferma maglia 3D ruotabile (orbit libero) + 3 preset funzionanti.

## Cosa manca (prossimo)
- MT2: color picker `input type=color` (tonalità libere) su corpo/colletto/maniche, wired a `window.__kit.materials`.

## Rollback
File nuovi → revert del commit d'unità MT. `index.html`/`CONFIGURATOR_PROGRESS.md` dopo la creazione = file esistenti → backup Rule 1d prima di ogni Edit successivo.
