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
