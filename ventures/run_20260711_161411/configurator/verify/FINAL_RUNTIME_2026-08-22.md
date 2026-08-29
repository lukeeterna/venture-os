# Sportswear 3D — final runtime candidate

Date: 2026-08-22
Authority: GPT-5.6 Sol
PR: #5

## Runtime

- Three.js r160 vendored locally.
- Real garment assets: shirt from `pmndrs/examples` pinned at `be95c387abb15d41d388bca4e2d1568690935a5c`, Git blob `9c7609eddfd597a70cb708f96bc19841766b3488`; shorts and socks from `madjin/asset-pallet` pinned at `7243319029382f5799f03162cc6bf10795f9951d`, Git blobs `3222095f45778676f967c08bf1962af5306e111b` and `44667afdfc03d73aad1b556899d41f4af8a6f2e3`.
- Shirt receives a deterministic athletic-fit deformation at load time to reduce the loose T-shirt silhouette while retaining the donor topology and PBR surface.
- No React, Fabric, SaaS, CDN or donor runtime dependency.

## Customization projection

Runtime version: `football-real-garment-v4-conformal`.

Text, logos, sponsors, patches and badges use semantic-surface conformal grids built from raycast samples. The grid follows the garment surface while retaining rectangular UVs. It replaces the earlier volumetric DecalGeometry projection that could intersect multiple sleeve/body surfaces.

The back surface reverses U so text and graphics read normally from the rear camera. Sleeve overlays use a restricted upper-shirt safe region and shrink automatically if a requested graphic does not fit entirely on the garment.

## Product behavior

- unrestricted 360° OrbitControls plus front/back/left/right views;
- user pattern upload for shirt/shorts/socks with repeat, rotation and offset;
- free name text and free number/character text;
- eight built-in font stacks plus runtime font upload;
- rear name above number; front number disabled by default;
- up to 20 logos/sponsors/patches/badges across shirt front/back, sleeves, shorts and socks;
- deterministic `window.__payload3d` schema v3 without file names, object URLs, data URLs, Base64, bytes, timestamps, UUIDs or prices.

## Automated evidence

A real Chromium/WebGL workflow must pass syntax/runtime checks, load the real garment meshes, render front/back/right views, upload a pattern, upload a sleeve patch, accept free-text number characters and produce screenshots plus runtime diagnostics.

Automated PASS is not founder acceptance. PR #5 remains Draft until the exact final head is opened on the founder Mac in real Chrome and visually approved.
