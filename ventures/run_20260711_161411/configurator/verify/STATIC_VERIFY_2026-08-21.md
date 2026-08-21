# Sportswear Football 3D v2 — static verification

Data: 2026-08-21
Implementatore/verificatore: GPT-5.6 Sol

Verifiche eseguite sul sorgente prima della pubblicazione:

- `node --check src/app.js` → PASS
- parsing HTML con parser standard Python → PASS
- tutti gli ID DOM referenziati dal motore esistono in `index.html` → PASS
- nessun import/uso `GLTFLoader` → PASS
- nessuna dipendenza runtime da `assets/kit.glb` → PASS
- `DecalGeometry` ufficiale usato per testo/loghi/patch → PASS
- OrbitControls senza limiti azimuth (`-Infinity` / `Infinity`) → PASS
- numero/caratteri è input `text`, max 6, non numeric-only → PASS
- upload fantasia PNG/JPG/WebP → PASS
- upload font TTF/OTF/WOFF/WOFF2 → PASS
- superfici front/back/sleeves/shorts/socks presenti → PASS
- tipi grafici logo/sponsor/patch/badge presenti → PASS
- payload allowlist non contiene `objectUrl`, `dataUrl`, filename, Base64 o bytes → PASS

Marker:

```text
STATIC_TESTS=PASS
DOM_IDS=PASS
NO_GLB_DEPENDENCY=PASS
ROTATION_360_CODE=PASS
CUSTOM_PATTERN_UPLOAD=PASS
CUSTOM_FONT_UPLOAD=PASS
MULTI_GRAPHICS_SURFACES=PASS
PAYLOAD_PRIVACY=PASS
NODE_CHECK=PASS
```

## Gate ancora da osservare

La verifica statica non sostituisce il gate visivo WebGL. Prima del merge occorre sincronizzare questa branch sul Mac founder e osservare in Chrome reale:
- geometria completa e coerente;
- 360°;
- retro;
- testo retro;
- fantasia caricata;
- font custom;
- loghi/patch multi-superficie;
- mobile 390×844;
- console senza errori bloccanti.
