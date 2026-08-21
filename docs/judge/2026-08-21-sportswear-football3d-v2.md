# SPORTSWEAR — Football 3D v2

Data: 2026-08-21
Implementatore: GPT-5.6 Sol
Working PR: #5
Branch: `sol/mt3d-football-production-20260816`

## Decisione prodotto

Questa specifica sostituisce, per il configuratore football 3D corrente, le parti precedenti che assumevano come runtime principale `assets/kit.glb` e i 12 pattern hardcoded.

Il requisito corrente è:
- resa 3D pulita e stabile, coerente con la silhouette della divisa 2D approvata;
- rotazione 360°;
- nessuna dipendenza dal GLB che produceva geometria spezzata nella preview;
- fantasie caricate dall'utente tramite file universali;
- nome e numero/caratteri realmente personalizzabili;
- font integrati + font caricabili;
- loghi, sponsor, patch e badge multipli;
- superfici fronte/retro/maniche/pantaloncini/calze;
- payload deterministico senza byte/file nel JSON.

## Motore 3D

Il runtime usa Three.js r160 locale e costruisce una divisa parametrica stabile con mesh separate per:
- corpo maglia;
- manica sinistra;
- manica destra;
- colletto;
- cintura pantaloncini;
- pantaloncino sinistro;
- pantaloncino destro;
- calza sinistra;
- calza destra.

Personalizzazioni localizzate tramite `DecalGeometry` ufficiale Three.js r160.

Nessun React, Fabric, SaaS o CDN runtime.

## Fantasie

Non esiste più un catalogo obbligatorio di fantasie standard.

Ogni parte può ricevere una fantasia diversa caricata dal browser:
- PNG;
- JPG/JPEG;
- WebP.

Formato raccomandato:
- PNG 1024×1024;
- square;
- seamless/tileable;
- trasparenza facoltativa.

Limite 8 MB per file.

Controlli:
- repeat;
- rotation;
- offset X/Y;
- opacity.

## Nome, numero e caratteri

`Nome / testo`:
- testo libero stampabile, max 24 caratteri.

`Numero / caratteri`:
- non limitato ai soli numeri;
- testo libero stampabile, max 6 caratteri.

Font:
- 8 stack system/locali;
- upload runtime TTF, OTF, WOFF, WOFF2 fino a 5 MB.

Default:
- nome sopra numero sul retro;
- numero frontale OFF.

## Loghi / sponsor / patch / badge

Collection dinamica fino a 20 elementi.

Tipi:
- logo;
- sponsor;
- patch;
- badge.

File:
- PNG consigliato con trasparenza;
- JPG;
- WebP;
- max 8 MB.

Per ogni elemento:
- surface;
- x;
- y;
- scale;
- rotation;
- opacity;
- remove.

Superfici:
- shirt-front;
- shirt-back;
- left-sleeve;
- right-sleeve;
- shorts-left;
- shorts-right;
- socks-left;
- socks-right.

## Payload 3D

`window.__payload3d`, schema `v:2`.

Include:
- sport;
- model;
- colors;
- patterns con soli metadati ricostruibili;
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

Le immagini/font vanno ricaricati per ricostruire completamente una configurazione che li usa.

## Gate

Prima del merge sono obbligatori:
- syntax/static verification verde;
- preview reale Chrome/WebGL sul Mac founder;
- fronte/retro/360°;
- nome sopra numero sul retro;
- caricamento fantasia;
- caricamento font custom;
- almeno 2 sponsor e 2 patch contemporanei;
- patch manica;
- grafica pantaloncino;
- mobile 390×844;
- nessun errore console bloccante.

La PR resta Draft finché questi gate visuali non sono osservati.
