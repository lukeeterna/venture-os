# Third-party notices — Sportswear 3D

## Three.js r160

Runtime files under `vendor/three-r160/` are vendored from the official Three.js project, tag `r160`, resolved commit:

`d04539a76736ff500cae883d6a38b3dd8643c548`

License: MIT.

Copyright © 2010-2023 three.js authors.

The complete MIT license text is included at:

`vendor/three-r160/LICENSE`

Runtime modules used by the football configurator:
- `build/three.module.js`
- `examples/jsm/controls/OrbitControls.js`
- `examples/jsm/loaders/GLTFLoader.js`
- `examples/jsm/utils/BufferGeometryUtils.js`
- `examples/jsm/environments/RoomEnvironment.js`

The final football runtime does not use `DecalGeometry`; customization overlays are Sol-authored conformal raycast grids.

## Shirt mesh — pmndrs/examples

Source repository: `pmndrs/examples`

Pinned commit:
`be95c387abb15d41d388bca4e2d1568690935a5c`

Runtime asset:
`assets/vendor/football-shirt.glb`

Upstream Git blob:
`9c7609eddfd597a70cb708f96bc19841766b3488`

License: MIT, under the upstream project license terms.

## Shorts and socks — madjin/asset-pallet

Source repository: `madjin/asset-pallet`

Pinned commit:
`7243319029382f5799f03162cc6bf10795f9951d`

Runtime assets and upstream Git blobs:
- `assets/vendor/football-shorts.glb` — `3222095f45778676f967c08bf1962af5306e111b`
- `assets/vendor/football-socks.glb` — `44667afdfc03d73aad1b556899d41f4af8a6f2e3`

License: MIT.

## Research-only references

`senol41tr/Customizer3D` commit `c9a9f4b41e10fd2a6cc8c71d8b2317d18adb0fce` was evaluated for surface/layer-editor patterns. No source from that project is vendored or imported at runtime.
