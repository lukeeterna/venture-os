# Prompt aperto per Sol — Configuratore Kit 3D (MT-3D.x)

**Repo**: github.com/lukeeterna/venture-os  
**Branch**: master  
**File principale**: `ventures/run_20260711_161411/configurator/index.html`  
**Data**: 2026-07-31  

---

## Contesto

Hai scritto tu il configuratore 3D (commit `3815e9a`, autore GPT-5.6 Sol). CC ha integrato il codice, risolto il bug di path (B3D-01: `PHOTO_DIR` ora punta a `assets-photo/`), e poi il founder ha aperto il configuratore sul browser e segnalato due problemi visivi. Questo documento raccoglie tutto ciò che è successo e tutto ciò che il founder vuole: leggilo per intero, analizza il codice attuale, e produci una versione corretta e completa di `index.html`.

---

## Struttura disco (root = `ventures/run_20260711_161411/`)

```
run_20260711_161411/
├── configurator/                        ← document root del server (porta 8081)
│   ├── index.html                       ← il tuo codice, da aggiornare
│   ├── assets/
│   │   └── kit.glb                      ← mesh 3D del kit (2.74 MB)
│   └── assets-photo/                    ← aggiunto da CC dopo fix B3D-01
│       ├── shading_base.jpg             ← fotografia shading (1067×1600, 78 KB)
│       ├── mask_maglia.png              ← maschera alpha maglia (48 KB)
│       ├── mask_pantaloncini.png        ← maschera alpha pantaloncini (17 KB)
│       └── mask_calze.png              ← maschera alpha calze (20 KB)
└── configurator-2d/
    └── assets-mockup/derived/web/       ← source originale degli asset foto (identici)
```

**CDN attivi nel codice**:
- `three@0.160.0` da jsDelivr
- `OrbitControls` da jsDelivr
- `GLTFLoader` da jsDelivr

---

## Cosa funziona già (non toccare)

- Caricamento mesh GLB e applicazione shader photo-projected ✅
- 12 archetipi design (solid, righe, banda, chevron, ecc.) generati in shader ✅
- 3 zone colore indipendenti (maglia / pantaloncini / calze), primario + secondario ✅
- Overlay nome / numero / sponsor in RAM (FileReader, no disco) ✅
- Rotazione ±70° con OrbitControls e damping ✅
- Pulsanti vista rapida (Sinistra / Fronte / Destra) ✅
- Responsive layout mobile ✅
- `PHOTO_DIR = "assets-photo/"` ✅ (fix B3D-01 già applicato)

---

## Difetti da correggere

### D3D-01 — Retro mancante (priorità ALTA)

**Sintomo**: ruotando il kit verso il retro la rotazione si blocca a ±70°. Il retro non è mai visibile.

**Causa**: `minAzimuthAngle = -70°`, `maxAzimuthAngle = +70°` — scelta conservativa fatta quando non era disponibile la fotografia del retro.

**Richiesta del founder**: il kit deve poter ruotare a 360°. Il retro non ha una fotografia; è accettabile un **retro sintetico neutro**: per gli angoli oltre ±70° il capo appare con il colore primario della zona corrispondente, senza shading fotografico (colore piatto con leggera illuminazione diffusa dal vertex normal, stessa logica `neutralFold` già nel fragment shader). Non inventare pattern, non specchiare il fronte: colore piatto.

**Come implementare**:
1. Rimuovi i limiti `minAzimuthAngle` / `maxAzimuthAngle` (o portali a `-Math.PI` / `+Math.PI`).
2. Nel fragment shader, calcola `float isFront = step(dot(vWorldNormal, vec3(0,0,1)), 0.0)` (o usa l'angolo di camera). Per i fragment sul retro (normale Z negativa rispetto alla camera), bypassa il campionamento delle texture foto e usa solo `neutralFold` con `maskAlpha = 1.0` e il colore di zona.
3. Alternativa più semplice: usa `THREE.DoubleSide` già presente + controlla `gl_FrontFacing` nel GLSL per switchare tra shader fotografico (fronte) e colore piatto (retro).

---

### D3D-02 — Sbavature di colore (priorità ALTA)

**Sintomo**: colori delle zone (maglia blu, pantaloncini bianchi) che "sbavano" fuori dai bordi del capo, visibili sullo sfondo scuro.

**Possibili cause** (verifica quale ispezionando il codice):

1. **`smoothstep` troppo largo**: il fragment shader usa `smoothstep(0.025, 0.19, maskAlpha)` per pesare la componente fotografica. Il range 0.025–0.19 è ampio: pixel con alpha bassissima (bordi sfumati della maschera PNG) ricevono comunque colore. Restringere a `smoothstep(0.08, 0.14, maskAlpha)` e aggiungere `if (maskAlpha < 0.04) discard;` eliminerebbe i pixel completamente fuori dal capo.

2. **UV che escono dall'intervallo**: se la proiezione object-space produce UV fuori da `uMaskRect`, la `clamp(q, 0.0, 1.0)` nel fragment shader fissa i valori al bordo della maschera invece di scartarli. Aggiungere `discard` sui pixel con `q` ai bordi estremi (es. `if (any(lessThan(q, vec2(0.01))) || any(greaterThan(q, vec2(0.99)))) discard;`).

3. **Zone mesh mal assegnate**: `materialZone()` usa nomi e `materialIndex` per assegnare i triangoli. Se il GLB non ha nomi standard, triangoli della maglia potrebbero essere assegnati a pantaloncini e viceversa. Ispeziona `window.__kit3d.projectionBounds` in console per verificare che le bounding box delle tre zone siano plausibili (maglia = parte alta, pantaloncini = parte media, calze = parte bassa).

**Azione richiesta**: scegli la causa più probabile in base all'ispezione del codice, applica il fix corretto, spiega la scelta.

---

## Output atteso da Sol

Produci il file `index.html` completo e corretto con:

1. **D3D-01 risolto**: rotazione 360°, retro sintetico neutro con colore piatto per angoli oltre ±70° (o approccio `gl_FrontFacing`).
2. **D3D-02 risolto**: sbavature eliminate con il metodo che ritieni corretto.
3. **Tutto il resto invariato**: nessuna regressione su quanto già funziona (elenco sopra).
4. **`PHOTO_DIR = "assets-photo/";`** — non cambiare questo path, gli asset ci sono già.
5. **Nessun path assoluto di macchina, nessuna email, nessun valore economico, nessun nome club reale** nel codice.

CC applicherà il tuo output esattamente come hai fatto con MT-3D.1: lo scriverà in `incoming/MT-3D.2.html`, farà i check di integrità, e lo copierà su `index.html`. Non serve che tu gestisca i file fisici: solo il codice HTML completo.

---

## Verifica che CC eseguirà dopo il tuo output

```bash
# 1. HTTP 200 su tutti gli asset
curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/assets-photo/shading_base.jpg   # atteso: 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/assets/kit.glb                  # atteso: 200

# 2. Nessun path esterno alla root nel codice
grep -c "\.\./configurator-2d" index.html   # atteso: 0

# 3. Gate estetico founder: apre http://localhost:8081/
#    - kit 3D appare senza errori
#    - rotazione arriva al retro (>±70°)
#    - nessuna sbavatura di colore sui bordi
```

---

## Note aggiuntive

- Il file `kit.glb` non è ispeziionabile da qui. Se hai bisogno di sapere la struttura dei materiali per risolvere D3D-02, indica a CC quali console log aggiungere temporaneamente (`window.__kit3d.projectionBounds`, dump dei `material.name` nel traverse) e CC li eseguirà e ti riporterà i risultati prima che tu produca il fix finale.
- Il gate estetico finale appartiene al founder: non dichiarare l'unità approvata.
- Unità successiva sarà `MT-3D.2` — incrementale, non riscrivi da zero se non è necessario.
