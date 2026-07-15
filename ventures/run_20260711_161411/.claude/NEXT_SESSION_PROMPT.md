# NEXT SESSION — sportswear configuratore

## Stato al 2026-07-15
- **MT1c FASE A2 ESEGUITA** (VIA 2, asset auto-prodotto EUR 0). Deliverable committato: **`46cbd80`**.
  - `configurator/tools/kit_build.py` (script bpy), `configurator/assets/kit.glb` (5 zone, 100.080 tris), `configurator/ASSET_LICENSE.md` (CC0 verbatim).
  - Blender 3.6.23 headless in `.tools/Blender.app` (NON versionato). Base CC0 `.tools/base.obj`.
  - Render gate in `.tools/gate_render/gate_{front,back,side,threeq}.png` → copiati in `~/Desktop/kit_gate_mt1c/`.
- **IN ATTESA: verdetto founder/giudice sul gate estetico.** Screenshot da caricare manualmente su Claude.ai (giudice senza filesystem).

## Gate — dichiarato PRESENTE
maniche integrate · calzettoni al polpaccio · silhouette anatomica · 5 zone indipendenti (5 materiali + 5 primitive nel GLB) · UV valide (cilindrica, 0 loop non-finiti).

## Difetti dichiarati (estetici — decide il giudice)
1. Colletto arruffato al confine di rimozione testa (banda z 0.83-0.86).
2. Pantaloncini deboli come short distinti (banda bacino z 0.40-0.52).
3. Bordi maniche/torso frastagliati (rim solidify).

## Prossimo step SECONDO IL VERDETTO
- **Se POSITIVO** → FASE B: integrazione `kit.glb` nel configuratore (`configurator/index.html`), sostituendo la mesh procedurale three.js con GLTFLoader; mappare i 5 materiali `body/sleeves/collar/shorts/socks` su `window.__kit.materials`. Poi MT2 solo con via libera giudice.
- **Se NEGATIVO** → nessun secondo giro autonomo. Decide il giudice; fallback VIA 1 (acquisto) incluso. Per migliorare i difetti in VIA 2: ritarare bande collo/bacino in `kit_build.py` (costanti in testa) + pulire il bordo scollo.

## Rebuild
`.tools/Blender.app/Contents/MacOS/Blender --background --python configurator/tools/kit_build.py -- <abs>/.tools/base.obj <abs>/configurator/assets/kit.glb`
