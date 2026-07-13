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
- [x] **MT1** scaffold + scena 3D base — COMPLETATO 2026-07-13, VERIFICATO da Luke nel browser (orbit+preset OK)
- [ ] **MT1b** (nuovo, PRIMA di MT2) fix colletto→scollo + maniche raccordate alla spalla + silhouette meno squadrata + toggle rotazione + NUOVE mesh pantaloncini e calzettoni (zone-materiale su window.__kit.materials)
- [ ] MT2 colori indipendenti corpo/colletto/maniche + pantaloncini/calzettoni + tonalità libere
- [ ] MT3 pattern (tinta unita/strisce/fasce/banda/metà/chevron) via CanvasTexture
- [ ] MT4 nome + numero + multi-font (retro)
- [ ] MT5 upload sponsor multi-formato client-side (PNG/JPG/SVG) + posizionamento
- [ ] MT6 camerino virtuale (kit INDOSSATO su busto/manichino) + riepilogo + CTA preventivo (NO PREZZO)
- [ ] MT7 responsive 375px + accessibilità + degradazione 3D no-WebGL

## MT1 — esito verifica umana (2026-07-13)
Luke, browser locale (http.server): **orbit libero = SI**, **preset Fronte/Retro/Lato = SI** → fatto terminale MT1 RAGGIUNTO. Confermato anche via screenshot Chrome headless (render OK).

### DIFETTI APERTI — CORREGGERE PER PRIMI nella prossima sessione (prima di MT2)
1. **Colletto fuori posto**: il TorusGeometry (`collar`) è a `y=0.92` ma `bodyGeo.center()` sposta il corpo → il colletto finisce a metà petto (sembra manico di borsa), non allo scollo. FIX: dopo `bodyGeo.center()`, calcolare il vero Y dello scollo del corpo centrato (bounding box top ~ +1.51) e posizionare colletto lì; verificare anche Z rispetto allo spessore.
2. **Maniche squadrate/disallineate**: `makeSleeve` usa coordinate originali mentre il corpo è centrato → non combaciano alla spalla e rendono come slab orizzontali rigidi. FIX: applicare lo stesso offset di centratura del corpo alle maniche (o centrare l'intero gruppo dopo l'assemblaggio, non il solo corpo), e ammorbidire la sagoma manica.
3. **Toggle "Rotazione ON/OFF" non funziona** (Luke: NO): il click non produce effetto visibile. Da diagnosticare — verificare che l'handler su `#autorotate-toggle` flippi davvero `controls.autoRotate` e che `controls.update()` nel loop applichi l'auto-rotazione; possibile interazione con `camTarget`/preset che blocca la ripresa.

> Nota: il fatto terminale MT1 (ruotabile + preset) è raggiunto; questi 3 sono difetti da chiudere prima di costruire MT2/MT3 perché la geometria zone è la base di colori e texture.

## Dettaglio MT1 (realizzato)
- File: `configurator/index.html` (NEW, commit d64563a), `CONFIGURATOR_PROGRESS.md` (NEW).
- Renderer WebGL (antialias, shadow PCFSoft, ACES, sRGB) + guardia `webglAvailable()` con fallback `.no-webgl`.
- Scena: backdrop radiale, 3 luci (hemisphere+key con ombra+fill), piano ShadowMaterial.
- Maglia procedurale: `bodyMesh` (ExtrudeGeometry, scollo a giro), 2 maniche (`makeSleeve`), colletto (Torus). Materiali zona `bodyMat`/`sleeveMat`/`collarMat` esportati su `window.__kit.materials`.
- OrbitControls (damping, no-pan, min/max distance, autoRotate rispetta reduced-motion). Preset `goToView()` con lerp + aria-pressed. Resize responsivo. focus-visible.

## MT1b — definizione (deciso dal giudice 2026-07-13, da eseguire PRIMA di MT2)
Esito verifica MT1 (founder + giudice su screenshot): orbit fluido CONFERMATO, preset OK; **toggle Rotazione ON/OFF NON funziona (confermato)**; difetti confermati (colletto a metà petto, maniche squadrate/disallineate). Estensione scope founder: silhouette meno squadrata + aggiunta PANTALONCINI e CALZETTONI.
Fatto terminale MT1b:
1. Colletto ancorato allo scollo del corpo (non a metà petto).
2. Maniche raccordate alla spalla (non slab orizzontali staccati).
3. Silhouette complessiva meno squadrata.
4. Toggle rotazione automatica funzionante.
5. NUOVE mesh **pantaloncini** e **calzettoni** in scena, con zone-materiale dedicate esposte su `window.__kit.materials` (MT2 estenderà i color picker a queste zone).
Verifica: screenshot Chrome headless + apertura browser di Luke.

## Prossima sessione — ordine operativo
1. **MT1b** (sopra) su `index.html` → Rule 1d backup, commit "sportswear: MT1b geometria+kit completo", ri-verifica (screenshot headless + browser Luke). Solo dopo via libera giudice.
2. Poi MT2: color picker `input type=color` (tonalità libere) su corpo/colletto/maniche + pantaloncini/calzettoni, wired a `window.__kit.materials`.

## Rollback
File nuovi → revert commit d'unità MT. `index.html`/`CONFIGURATOR_PROGRESS.md` = file esistenti → backup Rule 1d prima di Edit (es. `CONFIGURATOR_PROGRESS.md.bak-mt1verify`).
