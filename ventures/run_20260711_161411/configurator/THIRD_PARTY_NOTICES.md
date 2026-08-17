# Third-party notices — Sportswear 3D

## Three.js r160

Runtime files under `vendor/three-r160/` are vendored from the official Three.js project, tag `r160`, resolved commit:

`d04539a76736ff500cae883d6a38b3dd8643c548`

License: MIT.

Copyright © 2010-2023 three.js authors.

The complete MIT license text is included at:

`vendor/three-r160/LICENSE`

Vendored runtime used by the football configurator:
- `build/three.module.js`
- `examples/jsm/controls/OrbitControls.js`
- `examples/jsm/loaders/GLTFLoader.js`
- `examples/jsm/utils/BufferGeometryUtils.js`
- `examples/jsm/geometries/DecalGeometry.js`

`DecalGeometry.js` is the official Three.js r160 implementation from the pinned upstream commit.

## Customizer3D research reference

`senol41tr/Customizer3D` commit `c9a9f4b41e10fd2a6cc8c71d8b2317d18adb0fce` was evaluated during architecture research for product-surface and layer-editor patterns.

The current Sol-authored implementation does **not** vendor or import Customizer3D source and has no runtime dependency on that project.