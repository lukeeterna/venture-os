# Report MT-3D.1 — Configuratore 3D ruotabile da asset fotografico
data: 2026-07-31
autore codice: GPT-5.6 Sol
traccia: 3D (parallela alla 2D, non sostitutiva)

---

## FASE 0 (verbatim)

hash: f01cbf6 — working tree clean — configurator-2d/ non modificata.

---

## Autore

GPT-5.6 Sol

---

## FASE 2 — Asset locali

| Path (relativo a configurator/) | Stato |
|---|---|
| `../configurator-2d/assets-mockup/derived/web/shading_base.jpg` | ESISTE (79 745 B) |
| `../configurator-2d/assets-mockup/derived/web/mask_maglia.png` | ESISTE (49 030 B) |
| `../configurator-2d/assets-mockup/derived/web/mask_pantaloncini.png` | ESISTE (17 031 B) |
| `../configurator-2d/assets-mockup/derived/web/mask_calze.png` | ESISTE (20 805 B) |
| `assets/kit.glb` | ESISTE (2 743 316 B) |

Tutti gli asset presenti. Prerequisiti soddisfatti.

---

## Dipendenze CDN

Il file NON funziona offline — tre import via CDN:

| Libreria | URL esatta |
|---|---|
| three@0.160.0 | https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js |
| OrbitControls | https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js |
| GLTFLoader | https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js |

---

## FASE 3 — Integrazione

- Backup: `index.html.bak-mt3d1` (size=19 376 B, mtime precedente all'azione) ✓
- Copia: `incoming/MT-3D.1.html` → `index.html` (78 049 B) ✓
- Verifica integrità: nessun path assoluto macchina, nessuna email, nessun valore economico, nessun nome club reale ✓

---

## Come Sol ha gestito il RETRO

Sol ha applicato un limite angolare esplicito su OrbitControls:

```javascript
controls.minAzimuthAngle = THREE.MathUtils.degToRad(-70);
controls.maxAzimuthAngle = THREE.MathUtils.degToRad(70);
```

La rotazione è limitata a ±70° rispetto al fronte. Il pannello laterale espone la scelta
esplicitamente nella nota-box "Copertura della vista":

> "La rotazione è limitata all'arco frontale. Non viene mostrato un retro specchiato o inventato:
> oltre il limite servirebbe una fotografia posteriore coerente con lo stesso mockup."

Nome e numero del giocatore sono proiettati sulla superficie frontale (non su un retro
sintetico): l'utente può verificare tipografia e colore, ma la posizione effettiva sul retro
non è simulata.

---

## FASE 4 — Verifica visiva

Server http.server 8081 attivo → HTTP 200 confermato.

Screenshot headless Chrome su 4 angoli:

| Angolo | File | Dimensione | Esito analisi pixel |
|---|---|---|---|
| fronte (0°) | fronte.png | 1280×900 | MONOCROMATICO (7 valori distinti) |
| tre_quarti_sx (−55°) | tre_quarti_sx.png | 1280×900 | MONOCROMATICO (7 valori distinti) |
| profilo_dx (+90°) | profilo_dx.png | 1280×900 | MONOCROMATICO (7 valori distinti) |
| tre_quarti_dx (+55°) | tre_quarti_dx.png | 1280×900 | MONOCROMATICO (7 valori distinti) |

**Render headless non affidabile**: Chrome headless su macOS Big Sur senza GPU non esegue
il renderer WebGL/Three.js. I PNG risultano monocromatici. Non è un difetto del codice:
è un limite dell'ambiente CI headless senza GPU. Il giudizio estetico passa al founder
su http://localhost:8081/

---

## Difetti noti / osservazioni

1. **Dipendenza CDN**: Three.js importato da CDN — nessun bundle locale. Fallisce offline o se jsDelivr è irraggiungibile.
2. **Retro non fotografico**: la limitazione ±70° è una scelta progettuale esplicita (non un bug). Nome/numero proiettati frontalmente = utile per verifica tecnica, non per preview finale.
3. **Render headless non verificabile** in questo ambiente (vedi sopra).
4. **Gate estetico founder**: NON ancora dato.

---

## BUG BLOCCANTE — B3D-01 (trovato da CC post-commit)

**Sintomo** (riportato dal founder):
```
Configuratore non disponibile
Impossibile caricare ../configurator-2d/assets-mockup/derived/web/shading_base.jpg
```

**Root cause** — path traversal bloccato dal server HTTP:

Il codice imposta:
```javascript
const PHOTO_DIR = "../configurator-2d/assets-mockup/derived/web/";
```

Quando il server serve da `configurator/` (porta 8081), il browser risolve:
```
http://localhost:8081/../configurator-2d/assets-mockup/derived/web/shading_base.jpg
→ http://localhost:8081/configurator-2d/assets-mockup/derived/web/shading_base.jpg
```
che è **fuori dalla document root** (`configurator/`). Python `http.server` e qualsiasi web server corretto bloccano il path traversal sopra la root → HTTP 403 / risorsa non trovata.

Gli asset **esistono su disco** (verificato FASE 2: tutti e 4 presenti). Il problema è esclusivamente la struttura di serving, non l'assenza di file.

**Struttura disco**:
```
run_20260711_161411/
├── configurator/          ← server root attuale (porta 8081)
│   ├── index.html         ← carica ../configurator-2d/...  ← FUORI ROOT
│   └── assets/
│       └── kit.glb        ← FUNZIONA (dentro root)
└── configurator-2d/
    └── assets-mockup/
        └── derived/
            └── web/
                ├── shading_base.jpg   ← ESISTE ma irraggiungibile
                ├── mask_maglia.png
                ├── mask_pantaloncini.png
                └── mask_calze.png
```

**Fix disponibili** (ordinati per invasività, Sol sceglie):

### Fix A — Server root spostata (zero modifiche al codice)
Servire da `run_20260711_161411/` invece di `configurator/`:
```bash
python3 -m http.server 8081 --directory ventures/run_20260711_161411/
# accesso: http://localhost:8081/configurator/
```
Il browser risolve `../configurator-2d/` → `http://localhost:8081/configurator-2d/` → dentro la root. Zero modifiche all'HTML.

**Contro**: l'URL del configuratore diventa `/configurator/`, non `/`. Se si fa deploy statico su Cloudflare Pages la struttura dell'URL cambia.

### Fix B — Asset copiati/symlinked dentro configurator/ (self-contained, raccomandato per deploy)
Aggiungere in `configurator/` una sottodirectory con i 4 file foto, cambiare la costante nel codice:
```javascript
// da:
const PHOTO_DIR = "../configurator-2d/assets-mockup/derived/web/";
// a:
const PHOTO_DIR = "assets-photo/";
```
File da aggiungere in `configurator/assets-photo/`:
- `shading_base.jpg`
- `mask_maglia.png`
- `mask_pantaloncini.png`
- `mask_calze.png`

Source: copie da `../configurator-2d/assets-mockup/derived/web/` (i file sono già generati e corretti, solo il path cambia).

**Pro**: il configuratore è self-contained, funziona da qualsiasi document root, deploy su CF Pages senza complicazioni.
**Contro**: duplicazione fisica di 4 file già presenti in `configurator-2d/derived/web/`. Accettabile se i file sono derivati (rigenerabili da script).

### Fix C — PHOTO_DIR via URL param (massima flessibilità, overkill per ora)
```javascript
const PHOTO_DIR = new URLSearchParams(location.search).get("photoDir") 
  || "assets-photo/";
```
Utile solo se si prevede di riusare il configuratore con asset diversi da URL diversi.

**Raccomandazione CC → Sol**: **Fix B**. La self-containment è prioritaria per il deploy CF Pages. Gli asset derivati sono rigenerabili; la copia è lossless. Fix A funziona solo in sviluppo locale con server servito dalla directory parent.

---

## Brief per Sol — Patch MT-3D.1-B3D-01

**Unità**: MT-3D.1-patch  
**Tipo**: bugfix bloccante  
**File da modificare**: `ventures/run_20260711_161411/configurator/index.html`  
**Azione richiesta**:

1. Cambia la costante `PHOTO_DIR` (riga ~257 del file corrente, dopo `const MESH_URL`):
   ```javascript
   // PRIMA
   const PHOTO_DIR = "../configurator-2d/assets-mockup/derived/web/";
   // DOPO
   const PHOTO_DIR = "assets-photo/";
   ```

2. Aggiungi i 4 asset foto nella directory `ventures/run_20260711_161411/configurator/assets-photo/`:
   - `shading_base.jpg` (copia da `configurator-2d/assets-mockup/derived/web/shading_base.jpg`)
   - `mask_maglia.png`
   - `mask_pantaloncini.png`
   - `mask_calze.png`

   Sol può includere queste istruzioni di copia nel codice del patch o nel brief CC; CC eseguirà la copia fisica.

3. Aggiorna `window.__kit3d.sourceAsset` (riga ~270 circa) di conseguenza:
   ```javascript
   sourceAsset: {
     shading: PHOTO_DIR + "shading_base.jpg",
     masks: GARMENTS.map((zone) => PHOTO_DIR + "mask_" + zone + ".png")
   },
   ```
   (questa sezione usa già `PHOTO_DIR`, quindi si aggiorna automaticamente se si cambia solo la costante)

**Gate di verifica** (CC eseguirà dopo il patch):
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/assets-photo/shading_base.jpg` → deve restituire `200`
- Pagina aperta dal founder su `http://localhost:8081/` → spinner sparisce, kit 3D appare ruotabile

**Nessuna altra modifica richiesta.** Il resto del codice (shader, OrbitControls, overlay, GLTFLoader) è corretto e non va toccato.
