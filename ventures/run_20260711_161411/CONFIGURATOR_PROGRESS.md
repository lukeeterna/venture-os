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
- [~] **MT1b** ESEGUITO 2026-07-14 — in attesa sigillo browser founder (fix colletto→scollo + maniche raccordate + silhouette meno squadrata + toggle verificato + NUOVE mesh pantaloncini/calzettoni su window.__kit.materials). Vedi "MT1b — esito" sotto.
- [ ] MT2 colori indipendenti su tutte le 5 zone (corpo/colletto/maniche + pantaloncini + calzettoni) + tonalità libere
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

## MT1b — esito esecuzione (2026-07-14, in attesa sigillo browser founder)

Fix strutturale: eliminato `bodyGeo.center()` (che centrava il solo corpo). Ora corpo, maniche, colletto, pantaloncini e calzettoni sono nello stesso sistema di coordinate; l'INTERO gruppo `kit` è centrato con `new THREE.Box3().setFromObject(kit)`. Camera/preset riinquadrati per il kit più lungo (`z=10.5`, min/max 6/18). Ground abbassato sotto i calzettoni. Nuovi materiali `shortsMat`/`sockMat`; `window.__kit.materials` espone 5 zone: bodyMat, sleeveMat, collarMat, shortsMat, sockMat.

### Verifica headless (Chrome 138 + SwiftShader, flag `--headless=new --enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader`) — angoli catturati: front, back, side, 3/4
Verdetto guardando gli screenshot (giudice, canale 1):
- **Colletto allo scollo**: PRESENTE — semi-toro girocollo all'apice dello scollo (front + 3/4 chiari; dal retro correttamente non sporge).
- **Maniche raccordate**: PRESENTE — raccordo spalla-manica senza distacco in front/3-4/back (condividono i vertici spalla col corpo).
- **Silhouette non squadrata**: PRESENTE/MIGLIORATA — spalle spioventi, rastremazione vita, orlo arrotondato; trapezio leggibile come maglia.
- **Pantaloncini**: PRESENTE in tutti gli angoli, spacco centrale.
- **Calzettoni**: PRESENTE in tutti gli angoli, due gambe.

### Difetti/limiti osservati (dichiarati, non taciuti)
1. **Vista laterale**: il kit è estrusione 2.5D → di profilo i pezzi appaiono come sagome sottili con stacchi visibili tra maglia/pantaloncini/calzettoni e tra manica e corpo; il colletto-toro sporge come blob laterale. È il trade-off Via A già dichiarato nel piano (mesh stilizzata, non fotoscannerizzata). Non blocca il fatto terminale MT1b (feature leggibili frontalmente). Upgrade a mesh volumetrica/GLB = enhancement futuro condizionato a asset con licenza.
2. Colletto = semi-arco frontale (non circonda il collo) — massimo ottenibile in 2.5D senza mesh volumetrica.

### Toggle auto-rotazione — DISCORDANZA rispetto al bug report MT1
Verifica CDP headless: il toggle FLIPPA correttamente lo stato — `#autorotate-toggle` porta `aria-pressed` ON→OFF→ON e testo "Rotazione: ON/OFF" coerente. Il codice era già corretto in MT1 (`controls.autoRotate = !controls.autoRotate` + `syncAutorotateButton()`), NON è stato modificato (nessun fix inventato). Ipotesi sul "non funziona" di MT1: interazione con i preset (`goToView` setta `autoRotate=false`) o `prefers-reduced-motion` nell'ambiente di Luke. **La conferma della rotazione VISIBILE ON/OFF resta al sigillo browser del founder** (canale 2).

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
1. **MT1b ESEGUITO + committato** (2026-07-14). Manca solo il sigillo browser del founder (orbit + toggle ON/OFF + estetica complessiva). STOP fino a via libera giudice.
2. Poi MT2 (SOLO con via libera giudice): color picker `input type=color` (tonalità libere) sulle 5 zone corpo/colletto/maniche + pantaloncini + calzettoni, wired a `window.__kit.materials`.

## Rollback
File nuovi → revert commit d'unità MT. `index.html`/`CONFIGURATOR_PROGRESS.md` = file esistenti → backup Rule 1d prima di Edit (es. `CONFIGURATOR_PROGRESS.md.bak-mt1verify`).
