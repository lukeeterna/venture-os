# SPORTSWEAR — Football 3D v2

Data: 2026-08-22
Implementatore: GPT-5.6 Sol
Working PR: #5
Branch: `sol/mt3d-football-production-20260816`

## Decisione prodotto

Il configuratore football 3D è il prodotto primario. La 2D resta fallback.

Requisiti correnti:
- resa 3D pulita e stabile con silhouette atletica;
- rotazione 360° reale;
- fronte e retro reali;
- nome sopra numero sul retro e orientamento leggibile;
- fantasie caricate dall'utente;
- nome e numero/caratteri liberi;
- font integrati + font caricabili;
- loghi, sponsor, patch e badge multipli;
- superfici fronte/retro/maniche/pantaloncini/calze;
- payload deterministico senza byte/file nel JSON.

## Motore 3D finale candidato

Runtime: `football-real-garment-v4-conformal`.

Three.js r160 è vendorizzato localmente. Il runtime usa mesh reali con licenza MIT:
- maglia da `pmndrs/examples`, commit `be95c387abb15d41d388bca4e2d1568690935a5c`, blob `9c7609eddfd597a70cb708f96bc19841766b3488`;
- pantaloncini da `madjin/asset-pallet`, commit `7243319029382f5799f03162cc6bf10795f9951d`, blob `3222095f45778676f967c08bf1962af5306e111b`;
- calze dallo stesso pin, blob `44667afdfc03d73aad1b556899d41f4af8a6f2e3`.

La maglia riceve all'avvio una deformazione deterministica di athletic-fit per ridurre la silhouette T-shirt senza sostituire la topologia reale del donor.

Nessun React, Fabric, SaaS, CDN o donor runtime.

## Proiezione personalizzazioni

Il runtime finale non usa `DecalGeometry`.

Nome, numero, logo, sponsor, patch e badge sono resi tramite griglie conformali costruite campionando con raycast la superficie semantica richiesta. Le griglie:
- seguono la superficie reale dell'indumento;
- mantengono UV rettangolari per evitare deformazioni volumetriche;
- riducono automaticamente la dimensione se una grafica uscirebbe dalla safe area;
- usano una safe area dedicata alle maniche;
- invertono U soltanto sul retro per rendere testo/grafiche leggibili dalla vista posteriore.

Superfici:
- `shirt-front`;
- `shirt-back`;
- `left-sleeve`;
- `right-sleeve`;
- `shorts-left`;
- `shorts-right`;
- `socks-left`;
- `socks-right`.

## Fantasie

Upload browser:
- PNG;
- JPG/JPEG;
- WebP;
- max 8 MB.

Formato raccomandato: PNG 1024×1024 square seamless/tileable.

Controlli per parte:
- repeat X/Y;
- rotation;
- offset X/Y.

## Nome, numero e font

`Nome / testo`: max 24 caratteri.

`Numero / caratteri`: testo libero, max 6 caratteri; non limitato ai soli numeri.

Font:
- 8 stack system/locali;
- upload runtime TTF, OTF, WOFF, WOFF2 fino a 8 MB.

Default:
- nome sopra numero sul retro;
- numero frontale OFF.

## Loghi / sponsor / patch / badge

Collection dinamica fino a 20 elementi.

File immagine: PNG/JPG/WebP fino a 8 MB.

Per ogni elemento:
- surface;
- x;
- y;
- scale;
- rotation;
- opacity;
- remove.

## Payload 3D

`window.__payload3d`, schema `v:3`.

Include:
- sport;
- model_source;
- colors;
- patterns con metadati;
- personalization;
- graphics[].

Esclude:
- filename;
- object URL;
- data URL;
- Base64;
- bytes;
- timestamp;
- UUID;
- prezzi.

## Gate

Gate automatico prima della preview founder:
- `node --check`;
- asset runtime presenti;
- Three.js revision 160;
- real garment meshes caricati;
- Chrome/Chromium WebGL reale;
- front/back/right render;
- nome + numero retro;
- free-text numero/caratteri;
- upload fantasia;
- upload patch manica;
- rotazione viste;
- nessun errore console bloccante;
- screenshot e runtime diagnostics come artifact.

L'automazione non sostituisce l'approvazione visuale founder. PR #5 resta Draft finché l'esatto head finale non viene aperto sul Mac founder in Chrome reale e approvato.
