# MT-3D.FOOTBALL — Convergenza produzione calcio

Data: 2026-08-16
Autore: GPT-5.6 Sol
Base canonica: `08b97b1342c82049ca17945e00b6a3478dabb7b8`
File applicazione: `ventures/run_20260711_161411/configurator/index.html`

## Obiettivo
Portare il configuratore 3D calcio già esistente da prototipo front-arc a configuratore prodotto utilizzabile per vendita/preventivo, mantenendo il 2D come fallback/strumento di verifica ma non come UI primaria.

## Stato reale di partenza
Il 3D su `master` già contiene:
- Three.js 0.160.0 + GLTFLoader + OrbitControls;
- mesh `assets/kit.glb`;
- 12 archetipi design;
- 3 zone colore indipendenti (maglia/pantaloncini/calze), primario+secondario;
- nome/numero con font, colore, x/y/scala;
- cinque font;
- tre slot grafici esistenti: sponsor principale, sponsor secondario, patch/scudetto;
- per ciascun grafico: upload RAM, zona, x/y/scala/rotazione;
- shading/mask fotografiche frontali.

Limiti reali da eliminare:
- rotazione bloccata a ±70°;
- nessuna vista retro finale;
- nome/numero usati frontalmente per verifica tecnica;
- grafica limitata a tre slot fissi, non N elementi;
- D3D-02 bleed/sbavature colore ancora aperto;
- dipendenze Three.js via CDN;
- nessun payload preventivo 3D canonico equivalente al 2D.

## Decisione prodotto
Da questa unità il **configuratore 3D è la UI primaria per il calcio**.
Il 2D resta fallback tecnico e non deve consumare il critical path salvo regressioni bloccanti.

## Requisiti P0 — obbligatori per considerare il calcio pronto

### P0-1 — Rotazione 360° reale
- OrbitControls deve consentire 360° orizzontali.
- Nessun badge `Arco frontale`.
- Quick views: fronte, sinistra, retro, destra.
- Il retro non deve riusare la fotografia frontale come se fosse reale.
- In assenza di fotografia back usare la strategia già approvata nel report MT-3D.1: **retro sintetico neutro/procedurale** guidato da colore/pattern e illuminazione 3D, senza inventare dettagli fotografici.

### P0-2 — Nome e numero sul retro
- Nome sopra numero sul dorso della maglia.
- Controlli separati per x/y/scala del nome e del numero sul retro.
- Fronte e retro devono essere superfici semanticamente diverse.
- Il numero frontale diventa opzionale, default OFF.
- Il retro deve essere visibile e verificabile ruotando a 180°.

### P0-3 — N grafiche/patch/sponsor
Sostituire i tre slot fissi come modello dati con una collezione dinamica `graphics[]`.
L'utente deve poter:
- `Aggiungi sponsor`;
- `Aggiungi patch`;
- aggiungere più elementi fino a un limite tecnico ragionevole (default max 12, configurabile nel codice);
- rimuovere ogni elemento;
- scegliere superficie/zona;
- posizione x/y;
- scala;
- rotazione;
- mantenere proporzioni;
- vedere aggiornamento live.

Tipi minimi:
- sponsor;
- patch/scudetto;
- badge.

Superfici minime calcio:
- maglia fronte;
- maglia retro;
- manica sinistra;
- manica destra;
- pantaloncino sinistro;
- pantaloncino destro.

Se il GLB non espone tutte le superfici come materiali distinti, CC deve ispezionare mesh/material names e implementare una mappatura deterministica object-space/UV o dichiarare quale superficie non è tecnicamente separabile. Non inventare PASS.

### P0-4 — Colori e design
Mantenere i 12 archetipi e le 3 zone già esistenti.
Aggiungere sub-zone solo se la mesh/material topology reale le rende separabili senza asset falsi.
Priorità:
- corpo maglia;
- maniche;
- colletto;
- pantaloncini;
- calze.

Se maniche/colletto non sono separabili nel GLB corrente, mantenerli dentro maglia e registrare il limite; non blocca la prima produzione calcio se il resto è verde.

### P0-5 — Font
- Minimo 5 font visivamente distinti e license-safe/locali/system.
- Nome e numero devono usare lo stesso font selezionato salvo scelta esplicita futura.
- Font deve aggiornarsi live sul retro reale.

### P0-6 — Bleed/edge correctness
Chiudere D3D-02 con verifica reale:
- nessun colore fuori sagoma;
- nessuna contaminazione tra zone;
- mask edge fail-closed;
- verificare `materialZone()` contro i nomi/material index reali del GLB.

### P0-7 — Payload preventivo 3D
Esporre `window.__payload3d` deterministico e serializzabile.
Schema iniziale `v:1`:
- `v`;
- `sport: "football"`;
- `design`;
- `colors`;
- `personalization`;
- `graphics[]` con tipo, surface, x, y, scale, rotation e presenza immagine boolean;
- nessun filename/dataURL/Base64;
- nessun timestamp/UUID/dato cliente/prezzo.

Il payload deve ricostruire lo stato del configuratore eccetto i byte delle immagini, che devono essere ricaricati.

### P0-8 — Output cliente
Integrare nel 3D la funzionalità già chiusa nel 2D:
- riepilogo read-only;
- textarea payload readonly/live;
- copia con fallback fail-closed;
- mailto con `[ATTIVITA]`, `[EMAIL_ATTIVITA]`, `[TEL]`;
- nessun dato economico hardcoded.

### P0-9 — Self-contained deploy
Eliminare la dipendenza runtime critica da CDN per Three.js/OrbitControls/GLTFLoader.
Bundle/moduli locali versionati o altra soluzione self-contained zero-cost.
Nessun nuovo SaaS.

## Verifica obbligatoria
La prova deve avvenire in browser reale con WebGL/GPU sul Mac, non soltanto headless senza GPU.

Marker:
- `ASSET_LOAD=PASS`
- `GLB_LOAD=PASS`
- `ROTATION_360=PASS`
- `BACK_VIEW=PASS`
- `BACK_NAME_ABOVE_NUMBER=PASS`
- `FRONT_NUMBER_DEFAULT_OFF=PASS`
- `GRAPHICS_DYNAMIC_ADD_REMOVE=PASS`
- `PATCH_MULTI=PASS`
- `SPONSOR_MULTI=PASS`
- `GRAPHIC_SURFACE_FRONT=PASS`
- `GRAPHIC_SURFACE_BACK=PASS`
- `GRAPHIC_LEFT_SLEEVE=<PASS|TECH_LIMIT>`
- `GRAPHIC_RIGHT_SLEEVE=<PASS|TECH_LIMIT>`
- `GRAPHIC_SHORTS_LEFT=<PASS|TECH_LIMIT>`
- `GRAPHIC_SHORTS_RIGHT=<PASS|TECH_LIMIT>`
- `COLORS=PASS`
- `DESIGNS_12=PASS`
- `FONTS_5_DISTINCT=PASS`
- `D3D02_BLEED=PASS`
- `PAYLOAD3D_SCHEMA=PASS`
- `PAYLOAD3D_LIVE=PASS`
- `OUTPUT_CLIENTE=PASS`
- `THREE_RUNTIME_LOCAL=PASS`
- `MOBILE_390=PASS`

Screenshot/evidence minime:
- fronte 0°;
- tre quarti;
- retro 180° con nome sopra numero;
- patch multipla;
- sponsor multiplo;
- mobile 390×844.

## Non scope di questa unità
- ciclismo;
- prezzi/margini;
- backend ordini;
- login;
- database;
- Cloudflare deploy finale.

## Ciclismo — vincolo architetturale
Non implementarlo ora, ma il modello dati deve evitare nomi hardcoded che rendano impossibile il riuso.
Separare dove ragionevole:
- `sportAdapter`;
- `garmentZones`;
- `surfaces`;
- `designs`;
- `graphics[]`;
- `personalization`.

Dopo il calcio verde, il ciclismo deve essere un adapter/configurazione dello stesso motore 3D, non una seconda codebase duplicata.

## Gate
NON dichiarare FOOTBALL_READY finché tutti i P0 non sono PASS o i soli `TECH_LIMIT` ammessi sono quelli sulle sub-superfici non separabili della mesh.

Non mergiare automaticamente. Sol effettua review finale e merge con head pinning.