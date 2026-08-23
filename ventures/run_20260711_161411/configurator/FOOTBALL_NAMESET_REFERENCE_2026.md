# Football nameset reference — 2026-08-23

This document is the evidence contract for the default football name/number layout. It exists because a prior CI gate proved physical text height but did **not** prove the rendered placement relationship. That gate was insufficient and its old GREEN must not be used as a production verdict.

## Regulatory constraints — UEFA Equipment Regulations, effective 1 June 2026

Primary source: UEFA Equipment Regulations.

- Article 7 — Shirt structure / number zone: https://documents.uefa.com/r/G4ozoVUlyB6CEGZ1efpJPg/LDio7VEndV6g0ecePojHog
  - the back number zone extends 2 cm above the number and 3 cm below it;
  - that zone is reserved for the shirt number.
- Article 10 — Numbers: https://documents.uefa.com/r/G4ozoVUlyB6CEGZ1efpJPg/_xmVDZGRigAabXoSDMpTsw
  - back number centered horizontally;
  - men's back digits 25–35 cm high;
  - women's back digits 20–35 cm high;
  - digit stroke width 2–5 cm;
  - front-shirt numbers, when used in representative-team competitions, 10–15 cm high.
- Article 11 — Player shirt names: https://documents.uefa.com/r/G4ozoVUlyB6CEGZ1efpJPg/6~b5EJW11Isr9ctgKcfk9A
  - name on the back above the number;
  - letters no more than 7.5 cm high.

These rules constrain size, centering and clearance. They do **not** prescribe one universal club/team vertical coordinate, so the default placement below is reference-matched rather than falsely labelled as a UEFA-mandated coordinate.

## Official product visual reference

Official adidas product reference used to cross-check the visual family and player nameset on an authentic national-team shirt:

- adidas Argentina 24 Long Sleeve Messi Home Authentic Jersey, product JN1508: https://www.adidas.com/us/argentina-24-long-sleeve-messi-home-authentic-jersey/JN1508.html

Founder visual QA also supplied a front/back official-shirt reference image in the review conversation. The image itself is not committed to the repository.

### Normalized measurement method

The shirt-body vertical extent in the supplied reference was normalized to 0% at the upper body/collar edge and 100% at the lower hem. Pixel bounds of the visible player-name and number glyphs were measured relative to that body extent. Values are rounded and used as deterministic *reference-match targets*, not as claims that a federation mandates those exact coordinates.

Derived default targets:

| Item | Physical target | Vertical center on shirt body |
|---|---:|---:|
| Player name | 4.9 cm | 14.8% |
| Back number | 27.0 cm | 42.3% |
| Front number | 11.5 cm | 38.4% |
| Name → number clear gap | ~4.5 cm | n/a |

The 27 cm back number and 11.5 cm front number sit inside the UEFA 2026 allowed ranges. The ~4.5 cm visual gap also clears the UEFA number zone's 2 cm exclusion above the number.

## CI acceptance — what must be measured from rendered geometry

A GREEN Visual CI must obtain the values from the actual Three.js meshes, not merely from input state:

- back name center: 14.8% ± 1.5 percentage points;
- back number center: 42.3% ± 1.5 percentage points;
- front number center: 38.4% ± 1.5 percentage points;
- back name glyph height: 4.9 cm ± 0.45 cm;
- back number glyph height: 27.0 cm ± 0.85 cm;
- front number glyph height: 11.5 cm ± 0.65 cm;
- name-to-number gap: target 4.5 cm ± 1.4 cm and never below 2 cm;
- old legacy text meshes hidden while the reference-match authority is active;
- crest-in-number projection remains vertically aligned with the authoritative number.

The CI must also store front/back screenshots for founder inspection. Automated numeric acceptance is necessary but is not a substitute for final human visual approval.

## Simpler interaction model / permissive open-source reference

UI interaction was simplified using patterns from **pmndrs/leva**, MIT licensed:

- repository: https://github.com/pmndrs/leva
- license: https://github.com/pmndrs/leva/blob/main/LICENSE

Leva's useful patterns are strong defaults, grouped/foldered controls, keyboard-friendly controls, controlled state and the ability to hide/collapse advanced controls. Sportswear adapts those interaction ideas to the existing vanilla-JS panel; it does not add React/Leva as a runtime dependency and does not copy unlicensed configurator code.

Default customer flow is therefore:
1. Kit
2. Name & number
3. Logos
4. Roster & quote

Fine X/Y/scale/rotation, raw realism presets, CSV/bulk utilities and other expert controls remain available under **Advanced options**.
