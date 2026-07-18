# tools/ — pipeline derivazione asset mockup (versionata)

Solo gli **script** sono versionati. Gli **output** (`assets-mockup/derived/`,
incluso `web/`) sono **gitignored**: il repo non contiene asset.

## Sorgente
`assets-mockup/FREEfullsoccerkitMockup/Football Kit.psd` (154 MB, gitignored).
Provenienza/licenza: vedi `../ASSET_LICENSE.md`.

## Pipeline
```
# 1. (diagnostica) albero layer del PSD
python3 tools/inspect_layers.py "assets-mockup/FREEfullsoccerkitMockup/Football Kit.psd"

# 2. maschere alpha per-capo (maglia/pantaloncini/calze) + composite_base.png
python3 tools/extract_masks.py "assets-mockup/FREEfullsoccerkitMockup/Football Kit.psd"

# 3. mappa shading (bianco=highlight, grigio=piega) dai capi
python3 tools/generate_shading.py

# 4. versioni web-ottimizzate (lato lungo <=1600px, totale <2.5MB)
python3 tools/optimize_web.py
```
Richiede un venv con `psd_tools`, `Pillow`, `numpy` (in `../lab/venv`).

## Formato canonico maschere
RGBA con **alpha = forma del capo** (RGB azzerato). Il configuratore le usa via
canvas `destination-in` (conta solo l'alpha). `generate_shading` e `optimize_web`
leggono il canale alpha.

## Zone
3 zone reali: **maglia, pantaloncini, calze**. `Neck`/`Right Arm`/`Left Arm`
sono layer separati nel PSD -> colletto/maniche estraibili come sub-zone in
futuro senza nuovo lavoro sul PSD (enhancement, non incluso in MT-2D.2).
