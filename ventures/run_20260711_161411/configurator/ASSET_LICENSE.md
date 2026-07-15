# ASSET_LICENSE — kit.glb (MT1c VIA 2, asset auto-prodotto)

## Base anatomica usata

- **Asset**: MakeHuman base mesh `base.obj` (`basemesh hm08`).
- **Fonte**: `https://raw.githubusercontent.com/makehumancommunity/makehuman/master/makehuman/data/3dobjs/base.obj`
- **Scaricato**: 2026-07-15 in `ventures/run_20260711_161411/.tools/base.obj` (19.158 vertici / 18.486 facce). NON versionato in git.

## Licenza — CC0 (verbatim dall'header del file `base.obj`)

Testo riprodotto verbatim dall'intestazione del file scaricato (fonte
autoritativa, in-file):

```
# This is a mesh file for MakeHuman
#
# This asset was explicitly released as CC0 in september 2020. The license
# text for CC0 can be found in the root of this repository.
#
# The copyright holders at the point of the release to CC0 were:
#
# Copyright (C) 2020 Data Collection AB, https://www.datacollection.se
# Copyright (C) 2020 Joel Palmius
# Copyright (C) 2020 Jonas Hauquier
#
# The primary legal contact for MakeHuman is Data Collection AB.
#
# For more information, see homepage at http://www.makehumancommunity.org
#
# basemesh hm08
```

- **Testo legale completo CC0 1.0 Universal**:
  `https://raw.githubusercontent.com/makehumancommunity/makehuman/master/LICENSE.md`
  (Creative Commons Zero — public domain dedication; nessun obbligo di
  attribuzione, uso commerciale consentito).

## Dichiarazione di auto-produzione

- Lo **script di costruzione** `configurator/tools/kit_build.py` è opera
  originale prodotta in questa sessione (nessun codice di terzi).
- La **mesh derivata** `configurator/assets/kit.glb` è generata dallo script:
  seleziona per regione anatomica le facce della base CC0 (torso+braccia
  superiori → maglia+maniche+colletto; bacino → pantaloncini; polpacci →
  calzettoni), le separa, applica solidify + subsurf, 5 slot-materiale
  nominati, UV cilindrica. Nessuna primitiva geometrica three.js. Nessun asset
  di terzi non-CC0 incorporato.
- Essendo la base CC0 (public domain), l'opera derivata non eredita vincoli di
  licenza; può essere usata, modificata e distribuita liberamente, anche a fini
  commerciali, nel prodotto sportswear.

## Toolchain

- Blender 3.6.23 LTS (macOS x64), download ufficiale
  `https://download.blender.org/release/Blender3.6/blender-3.6.23-macos-x64.dmg`,
  eseguito headless da `ventures/run_20260711_161411/.tools/Blender.app`
  (NON versionato). Build min macOS 10.15 → compatibile Big Sur 11.7.10.
