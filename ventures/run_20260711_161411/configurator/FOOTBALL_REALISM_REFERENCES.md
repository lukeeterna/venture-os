# Football realism references — v6 physical calibration

Date: 2026-08-22
Runtime: `football-realism-v6-physical-20260822`

This file records the evidence used for defaults. A regulatory maximum/range is never presented as a measured club value.

## 1. Current UEFA dimensions

UEFA Equipment Regulations, effective 1 June 2026:

- player name, when shown, is on the back above the number;
- each name letter is at most **7.5 cm** high;
- men's back numbers are **25–35 cm** high;
- digit stroke width is **2–5 cm**;
- front-shirt numbers, when used, are **10–15 cm** high;
- a team emblem may occupy at most **5 cm²** at the bottom of each digit.

Official sources:
- https://documents.uefa.com/r/G4ozoVUlyB6CEGZ1efpJPg/_xmVDZGRigAabXoSDMpTsw
- https://documents.uefa.com/r/G4ozoVUlyB6CEGZ1efpJPg/6~b5EJW11Isr9ctgKcfk9A

The `uefa-2026` preset uses 30 cm for the back number, 6 cm for the name and 12.5 cm for an optional front number. These are deliberately labelled **range-derived defaults**, not mandatory UEFA values.

## 2. Serie A current range

Lega Serie A `Regolamento Divise da Gioco 2024–2027`, Article 6:

- back digits centred;
- back digit height **25–30 cm**;
- shorts numbers **10–15 cm**;
- a team emblem/symbol may appear at the bottom of each back digit up to **5 cm²**.

Source:
- https://img.legaseriea.it/vimages/686538c6/1%20-%20Regolamento%20Divise%20da%20Gioco%202024-2027.pdf

The Serie A preset uses 27.5 cm, the midpoint of the official 25–30 cm range. The UI says this explicitly.

## 3. Measured real Premier League references

Historical Premier League namesets provide concrete real-world dimensions rather than only regulatory maxima:

- Manchester City 2022/23, `HAALAND 9`: number **23 cm**, letters **4.9 cm**;
- Manchester City 2017–23 / Chelsea 2017–19 references: number **23 cm**, letters **5 cm**;
- Arsenal 2013/14, `BENDTNER 23`: number **26 cm**, letters **5 cm**.

References:
- https://www.kitroomfootball.com/shop/2022-23-manchester-city-premier-league-home-name-number-set-9-haaland-repro/
- https://www.kitroomfootball.com/shop/2017-23-manchester-city-navy-blue-name-number-set-17-de-bruyne-premier-repro/
- https://www.kitroomfootball.com/shop/2013-14-arsenal-home-name-number-set-23-bendtner-premier-league-repro/

Avery Dennison is the official Premier League supplier of names, numbers and sleeve badges. Its 2023 redesign increased number height after visibility testing, which is why historical PL dimensions are kept as explicitly dated presets rather than treated as the 2026/27 standard.

Official context:
- https://www.averydennison.com/en/home/news/press-releases/avery-dennison-and-the-premier-league-present-the-name-behind-the-numbers.html

## 4. Physical scale calibration against the 3D shirt

The previous implementation stored arbitrary overlay percentages. That was the source of the visibly undersized `ROSSI` and number.

The v6 runtime converts centimetres into the actual Three.js donor-shirt bounds. It uses a documented adult replica back length as the physical reference:

- Fulham 2026/27 adult adidas replica, size L: back length **74.5 cm**.

Source:
- https://shop.fulhamfc.com/kit/homeadultkit/homeadultkit/6906_fulham-2627-adult-home-shirt.html

The mapping is deterministic:

1. compute donor shirt world-space height;
2. divide by 74.5 cm to obtain world-units/cm;
3. compensate for the existing text-canvas glyph fill ratio;
4. derive the existing overlay `scale` value needed for the requested physical glyph height;
5. keep X/Y/rotation/scale editable afterwards.

This preserves the approved conformal-text renderer while replacing guessed size percentages with a physical calibration.

## 5. Collar library

The old v5 collar system used tubes/solid primitives floating above the garment and is retired.

The v6 collar system projects thin fabric ribbons/panels onto the **actual shirt surface** with raycasts. It exposes these historically common constructions:

- original garment neckline;
- crew rib;
- V-neck rib;
- fold-over polo;
- button polo;
- split-V modern;
- wide 1990s polo.

Taxonomy references:
- UEFA historical football-shirt overview: https://it.uefa.com/MultimediaFiles/Download/EuroExperience/uefaorg/Publications/02/45/38/88/2453888_DOWNLOAD.pdf
- Castore Teamwear 2024 football catalogue: https://admdirect.co.uk/wp-content/uploads/2024/09/Castore-Teamwear-2024.pdf

These are construction families, not claims that one exact mesh reproduces a specific club's proprietary 3D pattern.

## 6. Lower body and footwear

The donor socks remain visible by default as the complete lower-body garment component.

**Procedural boots have been removed completely.** No boot mesh, boot control, boot payload option or footwear claim remains in v6.

## 7. Visible payload/code

The configuration object remains available internally as `window.__payload3d` / `window.__sportswear3d.payload()` for quotation and backoffice integration, but the raw JSON textarea and “copy code” control are hidden from the customer UI.

## 8. Release rule

A static syntax pass is insufficient. A candidate can only be called green after the real Chromium/WebGL acceptance covers physical name/number targets, no footwear remnants, hidden raw payload UI, every collar variant, visual collar screenshots, crest-in-number non-transparent pixels, pattern/patch upload, free-text number, rotation and zero browser/page errors.
