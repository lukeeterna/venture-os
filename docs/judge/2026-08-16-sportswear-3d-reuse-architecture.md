# SPORTSWEAR 3D — REUSE ARCHITECTURE AUTHORITY

Data: 2026-08-16
Autore/architetto: GPT-5.6 Sol
Target repo: `lukeeterna/venture-os`
Working PR: #5
Working branch: `sol/mt3d-football-production-20260816`
Base: `08b97b1342c82049ca17945e00b6a3478dabb7b8`

## 0. Regola di autorità

Questo documento decide l'architettura. Claude Code locale è **writer/executor**, non architetto.

CC NON deve:
- cercare altri repository o librerie;
- scegliere framework;
- sostituire donor;
- proporre una nuova architettura;
- riscrivere da zero funzioni per cui questo documento indica codice donor;
- introdurre React, React Three Fiber, Fabric.js, Troika o altri framework/layer editor;
- cambiare versione Three.js per propria iniziativa.

CC deve soltanto:
1. leggere i sorgenti pinnati qui sotto;
2. portare/adattare il codice indicato;
3. collegarlo al nostro `kit.glb` e alle nostre feature dominio;
4. eseguire i test meccanici prescritti;
5. fermarsi su incompatibilità reale con evidenza, senza inventare una soluzione alternativa.

## 1. Decisione architetturale

Il configuratore calcio non viene ricostruito da zero.

Architettura finale:

`Venture-OS football domain + existing kit.glb + existing 12 designs/colors`

sopra un editor 3D/layer system derivato da codice già funzionante e permissivamente licenziato:

**PRIMARY DONOR: `senol41tr/Customizer3D`**

Pinned commit:
`c9a9f4b41e10fd2a6cc8c71d8b2317d18adb0fce`

License:
MIT — mantenere copyright/licenza per il codice sostanzialmente riusato.

Questo donor è scelto perché contiene già:
- motore Three.js client-side;
- GLB runtime;
- Orbit/3D controls;
- product adapters;
- layer editor dinamico;
- N layer testo/immagine/shape;
- add/remove/reorder;
- posizione/zoom/rotazione;
- font e custom font;
- texture/layer rendering su mesh;
- salvataggio/apertura locale come capacità donor (non P0 nostro);
- runtime Three locale;
- un adapter TShirt con superfici `front`, `back`, `left`, `right` e preset vista.

Non importare feature non necessarie al football P0 (PDF editor, WebXR, gradients avanzati, ecc.) soltanto perché presenti nel donor.

## 2. Sorgenti donor obbligatori

Repository:
`https://github.com/senol41tr/Customizer3D`

Commit immutabile:
`c9a9f4b41e10fd2a6cc8c71d8b2317d18adb0fce`

File/pattern da studiare e portare, non reinterpretare:

### 2.1 Product adapter / superfici / viste

`examples/models/TShirt/TShirt.js`

Blob osservato:
`2bf20c0eb657fe1e0baee4af7361869316b8a46d`

Da questo file riusare il pattern:
- `data.front.printSize`
- `data.back.printSize`
- `data.left.printSize`
- `data.right.printSize`
- `setView('front')`
- `setView('back')` → 180°
- `setView('left')` → 90°
- `setView('right')` → -90°
- product-specific adapter separato dal motore.

Questa è anche la base del futuro adapter ciclismo.

### 2.2 Layer renderer N-elementi

`js/customizer3D/three/Render3D.js`

Blob osservato nel donor tree al commit pinnato; usare la versione esatta del commit.

Pattern da riusare:
- iterazione dei layer per mesh/surface;
- `renderSolidLayer()`;
- `renderTextLayer()`;
- `renderImageLayer()`;
- `addTextLayer()`;
- `addImageLayer()`;
- `removeLayer()`;
- texture slots;
- render order;
- parametri per layer (zoom/rotation/offset/opacity);
- canvas → texture update.

Il nostro attuale modello fisso `main/secondary/patch` deve essere sostituito da una collezione dinamica usando questo pattern, non da un sistema inventato ad hoc.

### 2.3 Text editor / font / move / scale / rotate

`js/customizer3D/layers/TextLayer.js`

Blob:
`5f537b2ed2a5df6e5e20a08bef156f08b683e8b8`

Pattern da riusare:
- text input live;
- font list;
- font size;
- color;
- rotation slider;
- zoom slider;
- pointer/touch movement;
- `THREE.CanvasTexture`;
- custom font support via local `opentype`.

Per football UI non importare l'intera UI donor se non necessaria: portare le primitive/comportamenti nel nostro pannello esistente.

### 2.4 Image layer / patch / sponsor

`js/customizer3D/layers/ImageLayer.js`

Blob:
`0d936271666cdfc0eab7e336489cd96528fce089`

Pattern da riusare:
- image layer;
- move;
- scale/zoom;
- rotation;
- live texture update;
- RAM/client-side behavior.

Usarlo per `sponsor`, `patch`, `badge` come tipi dominio diversi della stessa primitive grafica.

### 2.5 Layer collection

`js/customizer3D/layers/Layers.js`

Blob:
`1c7f1c07d653b0b4d779e0769d7e014ca5465c6c`

Portare il pattern di gestione collection/layer lifecycle necessario a:
- add;
- remove;
- reorder se utile;
- attach to surface.

### 2.6 Runtime locale

Il donor dimostra importmap/runtime locale da `js/three/`.

Non copiare una versione Three casuale dal donor.
Il nostro progetto resta pin su **Three.js r160 / 0.160.0** per compatibilità con il codice esistente.

Usare la sorgente ufficiale pinnata descritta al §3 per i moduli locali.

## 3. Three.js ufficiale — authority per runtime e decal fallback

Repository ufficiale:
`mrdoob/three.js`

Tag:
`r160`

Commit risolto:
`d04539a76736ff500cae883d6a38b3dd8643c548`

License:
MIT.

Vendorizzare dal commit ufficiale, se non già presente localmente:
- `build/three.module.js` o equivalente ES module r160 necessario al runtime;
- `examples/jsm/controls/OrbitControls.js`;
- `examples/jsm/loaders/GLTFLoader.js`;
- dipendenze transitivamente richieste da GLTFLoader;
- `examples/jsm/geometries/DecalGeometry.js` SOLO se scatta il fallback del §5.

`DecalGeometry.js` blob osservato:
`5e712f23c65bf050ae292dd02afdbfc352f9cd01`

Il relativo esempio ufficiale `examples/webgl_decals.html` è il riferimento per:
- raycast sulla mesh;
- point + normal;
- projector position/orientation/size;
- creazione di più decal.

Nessun algoritmo di decal/proiezione fatto in casa se `DecalGeometry` risolve il caso.

## 4. Donor secondario — reference only

`Starklord17/threejs-t-shirt`

Pinned commit:
`ee621ff031661382273933f8b3d91cfdbc33427f`

License:
MIT.

File:
`src/canvas/Shirt.jsx`
blob `ad2b97d38eaca20bd198343b4319c023429c5df9`

Uso consentito:
- riferimento al pattern GLB + uploaded texture/decal su apparel;
- confronto comportamentale.

Uso vietato:
- migrare Venture-OS a React;
- introdurre React Three Fiber/drei solo per copiare questo esempio.

## 5. Strategia superfici — decision tree deterministico

CC deve ispezionare il nostro:
`ventures/run_20260711_161411/configurator/assets/kit.glb`

Non è una decisione architetturale libera. Applicare esattamente questa sequenza:

### PATH A — mesh/material surfaces sufficienti

Se il GLB consente una mappatura stabile delle superfici richieste tramite mesh/material/group o UV già utili:
- costruire un `footballAdapter` con il pattern `TShirt.js` del donor;
- superfici P0: `shirt-front`, `shirt-back`;
- superfici best-effort: `left-sleeve`, `right-sleeve`, `shorts-left`, `shorts-right`;
- usare il layer renderer donor adattato alla nostra mesh.

### PATH B — front/back o sub-superfici non separabili

Se una superficie P0 non è esposta in modo stabile dal GLB:
- NON inventare una nuova proiezione UV;
- usare Three.js r160 `DecalGeometry` ufficiale;
- scegliere target mesh via raycast/material mapping reale;
- creare decal mesh per testo/immagini;
- position/orientation/size derivano dal point/normal/surface adapter;
- front/back vengono distinti semanticamente dal normale/orientamento e dal preset di vista.

`shirt-front` e `shirt-back` non possono finire `TECH_LIMIT`: il fallback ufficiale esiste proprio per chiuderli.

Le sub-superfici sleeve/shorts possono essere `TECH_LIMIT` solo se la mesh non consente un target affidabile neppure via raycast/material selection, con prova concreta.

## 6. Mappatura feature → codice riusato

| Requisito football | Authority / donor |
|---|---|
| 360° orbit + quick views | existing Venture-OS OrbitControls + Customizer3D `TShirt.js::setView` pattern |
| front/back/left/right semantics | Customizer3D `TShirt.js` product adapter |
| N sponsor/patch/badge | Customizer3D `Layers.js` + `Render3D.js` + `ImageLayer.js` |
| text nome/numero | Customizer3D `TextLayer.js` + `Render3D.renderTextLayer` |
| font/size/color/move/rotate | Customizer3D `TextLayer.js` |
| patch move/scale/rotate | Customizer3D `ImageLayer.js` |
| arbitrary surface fallback | official Three.js r160 `DecalGeometry.js` + `webgl_decals.html` |
| GLB/runtime/orbit/load | existing Venture-OS + official Three.js r160 |
| 12 design archetypes | existing Venture-OS code — preserve |
| garment colors | existing Venture-OS code — preserve |
| payload/customer output | existing Venture-OS MT-2D.6 logic adapted to `window.__payload3d` |
| cycling later | product-adapter pattern from Customizer3D; new `cyclingAdapter`, same engine |

## 7. Cosa NON viene usato

### `gorhorvat/product-configurator-3d`
Valutato come riferimento concettuale per per-part materials/colors, ma GitHub non espone una licenza repository chiara al commit osservato. **Non copiare codice.**

### `iosorin/cup-demo`
Valutato come riferimento Three.js + Fabric.js, ma non viene scelto come donor: licenza repository non chiaramente esposta nell'ispezione e architettura Nuxt/Fabric aggiungerebbe complessità. **Non copiare codice.**

### Fabric.js
Non aggiungerlo. Il primary donor possiede già layer/text/image/move/scale/rotate.

### Troika
Non aggiungerlo per default. Il primary donor possiede già text + font machinery. Valutazione futura soltanto se una prova reale mostra qualità testo insufficiente.

## 8. Struttura target Venture-OS

Non migrare l'app a un framework.

Mantenere il configuratore deployabile staticamente e vanilla/ES modules.

Struttura consigliata e vincolante (nomi possono variare solo se collisione reale):

```text
configurator/
  index.html
  assets/
    kit.glb
  assets-photo/
    ...
  vendor/
    three-r160/
      ...
  src/
    engine/
      layer-engine.js
      decal-surface.js        # solo se PATH B usato
      model-runtime.js
    adapters/
      football.js
    domain/
      designs.js
      payload3d.js
      quote-output.js
    ui/
      graphics-editor.js
      personalization-editor.js
```

Non è richiesta una grande riscrittura immediata del vecchio `index.html`: estrarre moduli soltanto quando riduce realmente il rischio e mantenere un entrypoint funzionante a ogni commit.

## 9. Modello dati target

```js
state = {
  sport: 'football',
  design: '...',
  colors: {...},
  personalization: {
    name: 'ROSSI',
    number: '10',
    font: '...',
    color: '#ffffff',
    frontNumberEnabled: false,
    backName: { surface:'shirt-back', x, y, scale, rotation },
    backNumber: { surface:'shirt-back', x, y, scale, rotation }
  },
  graphics: [
    {
      id: <runtime-only>,
      type: 'sponsor'|'patch'|'badge',
      surface: 'shirt-front'|...,
      x, y, scale, rotation,
      image: <runtime-only>,
      dataUrl: <runtime-only>
    }
  ]
}
```

Runtime id/dataUrl/image non entrano nel payload preventivo.

`window.__payload3d` usa allowlist deterministica e contiene `image_present` boolean.

## 10. Sequenza di implementazione — non modificabile

1. Clone/read-only del donor Customizer3D al commit pin.
2. Eseguire localmente il donor TShirt demo prima di portare codice. Se il demo donor non parte, riportare `DONOR_RUNTIME_BLOCKED` con log; non inventare sostituti.
3. Ispezionare `kit.glb` nostro e classificare PATH A o PATH B con evidence.
4. Vendorizzare Three.js r160 official local modules.
5. Portare product adapter/views 360.
6. Portare layer collection + image layer N-elements.
7. Portare text layer per back name/number e font controls.
8. Applicare DecalGeometry solo dove richiesto dal decision tree.
9. Collegare i nostri 12 design e colors senza regressione.
10. Aggiungere payload3d/output cliente riusando MT-2D.6.
11. Verificare browser GPU reale, desktop + mobile.
12. Commit/push su PR #5; nessun merge.

## 11. Acceptance evidence

Oltre ai marker del brief football, produrre:

- `DONOR_CUSTOMIZER3D_PIN=c9a9f4b41e10fd2a6cc8c71d8b2317d18adb0fce`
- `DONOR_TSHIRT_RUNTIME=PASS`
- `DONOR_LICENSE=MIT`
- `KIT_SURFACE_PATH=A|B`
- `THREE_R160_PIN=d04539a76736ff500cae883d6a38b3dd8643c548`
- `CUSTOM_LAYER_ENGINE_SOURCE=Customizer3D`
- `CUSTOM_DECAL_ALGORITHM=NO`
- `REACT_INTRODUCED=NO`
- `FABRIC_INTRODUCED=NO`
- `UNLICENSED_CODE_COPIED=NO`

Se viene copiato/adattato codice sostanziale MIT, aggiungere NOTICE/licenza appropriata nel target.

## 12. Cycling

Il cycling non parte finché football non è verde.

Quando parte:
- stesso engine;
- stesso layer model;
- stesso payload core;
- nuovo adapter `cycling.js`;
- nuovo GLB/zone/surfaces;
- niente fork applicativo e niente seconda codebase.

Questa è la ragione per cui il pattern product-adapter del donor Customizer3D è scelto come root architetturale.