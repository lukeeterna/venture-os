# MT-3D.FOOTBALL — Convergenza produzione calcio

Data: 2026-08-16
Autore/implementatore: GPT-5.6 Sol
Working PR: #5
Base canonica: `08b97b1342c82049ca17945e00b6a3478dabb7b8`

## Decisione operativa

La precedente integrazione CC al commit `61c903d36c5de8790e97b245822b8bd9369b2c2f` NON è acceptance evidence:
- `DONOR_TSHIRT_RUNTIME=FAIL`;
- l'executor ha violato lo STOP prescritto;
- la resa visiva risultante non è accettata.

Da questo punto il codice applicativo della PR #5 è scritto direttamente da Sol.
Claude Code locale, se usato, è solo runner/verifier: serve la pagina, apre Chrome reale, esegue prove e restituisce evidenza. Non modifica codice salvo nuovo ordine esplicito.

## Runtime finale

Il configuratore resta statico, vanilla ES modules, zero SaaS.

Authority runtime:
- Three.js r160 / commit `d04539a76736ff500cae883d6a38b3dd8643c548`;
- `OrbitControls.js`;
- `GLTFLoader.js`;
- `BufferGeometryUtils.js`;
- proiettore geometrico locale per decal su mesh reali.

Nessun React.
Nessun Fabric.
Nessun donor runtime esterno.
Nessun CDN runtime.

`senol41tr/Customizer3D` resta reference architetturale studiata, NON dipendenza e NON gate di runtime.

## Architettura applicativa

- `configurator/index.html`: entrypoint/UI.
- `configurator/src/style.css`: UI responsive.
- `configurator/src/app.js`: motore prodotto football.
- `configurator/assets/kit.glb`: modello esistente.
- `configurator/vendor/three-r160/`: runtime locale ufficiale.

Il codice elimina la proiezione fotografica front-only come fondamento del 3D.
Colori e design sono renderizzati direttamente sulle parti reali del GLB.
Nome, numero, sponsor, patch e badge sono decal geometriche realmente proiettate sulla mesh.

## Parti colore P0

Controllo indipendente primary/secondary per:
- body;
- sleeves;
- collar;
- shorts;
- socks.

## Design P0

12 archetipi:
- tinta unita;
- righe verticali;
- righe orizzontali;
- fascia orizzontale;
- banda diagonale;
- metà campo;
- chevron;
- pannelli laterali;
- spalle contrasto;
- banda centrale;
- quarti;
- gessato.

## Personalizzazione P0

- rotazione 360° OrbitControls;
- quick views front/left/back/right;
- nome sul retro;
- numero sotto il nome sul retro;
- front number opzionale e OFF di default;
- minimo 5 font distinti; implementazione corrente: 8 stack locali/system;
- colore testo;
- x/y/scala/rotazione separati per nome e numero.

## Grafiche P0

Collezione dinamica `graphics[]`, max 12.

Tipi:
- sponsor;
- patch/scudetto;
- badge.

Ogni elemento:
- upload RAM-only;
- superficie;
- x;
- y;
- scala;
- rotazione;
- opacità;
- rimozione.

Superfici:
- shirt-front;
- shirt-back;
- left-sleeve;
- right-sleeve;
- shorts-left;
- shorts-right;
- socks-left;
- socks-right.

Sleeve/short left-right NON vengono dichiarati `TECH_LIMIT` solo perché il GLB usa una singola primitiva: la localizzazione avviene tramite proiezione geometrica sul sotto-volume della superficie.

## Payload

`window.__payload3d` deterministico, `v:1`.

Contiene:
- sport;
- design;
- colors;
- personalization;
- graphics[].

Non contiene:
- filename;
- object URL;
- data URL;
- Base64;
- bytes immagine;
- timestamp;
- UUID;
- prezzi.

## Output cliente

- riepilogo;
- textarea payload readonly/live;
- copia;
- mailto;
- zero prezzi hardcoded.

## Gate di verifica

Nessun PASS per inferenza.

Obbligatori in browser reale Mac/WebGL:
- `GLB_LOAD=PASS`
- `ROTATION_360=PASS`
- `BACK_VIEW=PASS`
- `BACK_NAME_ABOVE_NUMBER=PASS`
- `FRONT_NUMBER_DEFAULT_OFF=PASS`
- `DESIGNS_12=PASS`
- `COLORS_5_PARTS=PASS`
- `FONTS_8=PASS`
- `GRAPHICS_DYNAMIC_ADD_REMOVE=PASS`
- `SPONSOR_MULTI=PASS`
- `PATCH_MULTI=PASS`
- `GRAPHIC_SURFACE_FRONT=PASS`
- `GRAPHIC_SURFACE_BACK=PASS`
- `GRAPHIC_LEFT_SLEEVE=PASS`
- `GRAPHIC_RIGHT_SLEEVE=PASS`
- `GRAPHIC_SHORTS_LEFT=PASS`
- `GRAPHIC_SHORTS_RIGHT=PASS`
- `PAYLOAD3D_SCHEMA=PASS`
- `PAYLOAD3D_LIVE=PASS`
- `OUTPUT_CLIENTE=PASS`
- `THREE_RUNTIME_LOCAL=PASS`
- `MOBILE_390=PASS`

Screenshot:
- front;
- three-quarter;
- back con nome sopra numero;
- due sponsor simultanei;
- due patch simultanee;
- patch manica;
- grafica pantaloncino;
- mobile 390×844.

## Ciclismo

Non implementare prima del football verde.

Il motore è già organizzato attorno a:
- parts;
- surfaces;
- designs;
- personalization;
- graphics.

Il ciclismo deve usare lo stesso engine con nuovo modello/configurazione di parti e superfici, non una seconda codebase.
