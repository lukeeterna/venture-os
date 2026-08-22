# Football realism defaults — research basis (1990–2026/27)

Date: 2026-08-22
Scope: incremental realism layer for `configurator/`, preserving the approved real-garment 3D runtime.

## Authority order

1. Current UEFA Equipment Regulations (enforcement 1 June 2026) for measurable placement/legibility defaults.
2. Historical UEFA kit regulations for historically valid options no longer expressed the same way in the current text.
3. Official competition sources (Premier League) for modern name/number and sleeve-badge practice.
4. Teamwear catalogues and documented European kit examples for collar taxonomy and era variants.

These are design defaults, not a claim that every domestic league uses identical rules. Every graphic remains manually adjustable by X/Y/rotation/scale.

## Typography defaults

Current UEFA Equipment Regulations:

- Article 11: player name, when used, is on the back above the number; each letter is no more than 7.5 cm high.
  https://documents.uefa.com/r/G4ozoVUlyB6CEGZ1efpJPg/6~b5EJW11Isr9ctgKcfk9A
- Article 10: men's back numbers are 25–35 cm high, with a 2–5 cm stroke width; short numbers are 10–15 cm high.
  https://documents.uefa.com/r/G4ozoVUlyB6CEGZ1efpJPg/_xmVDZGRigAabXoSDMpTsw
- Premier League 2023/24: the fourth league-wide redesign increased number height and integrated the league graphic pattern to improve visibility.
  https://www.premierleague.com/en/news/3614236

Chosen default target in the configurator: 7.0 cm name and 30 cm back number. The current conformal projection remains percentage-based, so the preset stores the physical target and uses calibrated projection percentages rather than pretending that screen/world units are centimetres.

## Crest / manufacturer / sponsor / badges

Current UEFA Equipment Regulations:

- Article 14: team emblem on shirt front at chest height, above sponsor advertising, max 100 cm².
  https://documents.uefa.com/r/G4ozoVUlyB6CEGZ1efpJPg/2dWICY3_T9o~YJ2WnRZ3VA
- Article 22: one manufacturer identification on the chest, above sponsor advertising, max 20 cm².
  https://documents.uefa.com/r/G4ozoVUlyB6CEGZ1efpJPg/FPcbDIH~rQanNup5Vcg3YQ
- Article 28: front sponsor is positioned in the centre of the torso, max 200 cm²; a second sponsor may use the left sleeve free zone subject to the regulation.
  https://documents.uefa.com/r/G4ozoVUlyB6CEGZ1efpJPg/jT6ByA7x9dsfPye5Rz1z6w
- Article 36: UEFA campaign badge uses the sleeve free zone; in club competitions it is on the right sleeve below the competition badge.
  https://documents.uefa.com/r/G4ozoVUlyB6CEGZ1efpJPg/IRM_Xso84eUb15_nuoebkQ
- UEFA U21 2025–27 Article 37: competition badge right sleeve; campaign badge left sleeve.
  https://documents.uefa.com/r/Regulations-of-the-UEFA-European-Under-21-Championship-2025-27/Article-37-Badges-in-the-final-tournament-Online
- Article 34: match-related/commemorative match information is at chest height on the torso, max 50 cm².
  https://documents.uefa.com/r/G4ozoVUlyB6CEGZ1efpJPg/QKAS7IxLYS29iCPmW6OY7A

Historical examples also show anniversary marks integrated with or adjacent to the crest (Chelsea 2025/26 anniversary crest, Wolfsburg 2025/26 anniversary crest) and centenary badges at centre chest (Athletic Club 1997/98). Therefore the configurator uses an upper-centre chest preset for a generic commemorative/match badge while keeping full manual override.

## Crest inside the number

Historical UEFA Kit Regulations explicitly allowed the club emblem to be incorporated at the bottom of each individual figure of the player's number (Article 14.04 in the historical edition surfaced by UEFA).

https://www.uefa.com/MultimediaFiles/Download/Regulations/uefa/Others/72/77/76/727776_DOWNLOAD.pdf

Modern league typography also uses embedded competition branding: Premier League 2023/24 names/numbers integrate the league graphic pattern, and official shirt numbers visibly carry the league lion mark near the base.

https://www.premierleague.com/en/news/3614236

Implementation: optional, OFF by default. When enabled it uses the first uploaded crest/logo and masks it into the lower part of each character of the back number, rather than floating an unrelated logo over the shirt.

## Collar library

Castore Teamwear 2024 MTO Football catalogue, p.12, lists eight football neckline constructions: crew, V-neck, fold-over polo and tapered, each in self-fabric and ribbed variants.

https://admdirect.co.uk/wp-content/uploads/2024/09/Castore-Teamwear-2024.pdf

UEFA's historical overview of football shirts describes the long evolution from laced crew necks to polo necks and V-necks.

https://it.uefa.com/MultimediaFiles/Download/EuroExperience/uefaorg/Publications/02/45/38/88/2453888_DOWNLOAD.pdf

Documented kit examples used to keep the variants era-plausible include early-1990s Italy/Northern Ireland polo collars, 1990s wide/retro collars, and modern open-V/polo hybrids such as Fiorentina 2024/25.

The UI exposes: original mesh, crew rib, V rib, fold-over polo, button polo, tapered, split-V, retro-wide and modern hybrid. `original` remains the default so the founder-approved garment silhouette is not degraded unless a collar option is deliberately selected.

## Lower body / footwear

The existing donor socks remain the primary garment asset. The realism layer forces the full socks visible by default and adds a small sock-foot/ankle completion plus football boots below them. The default boot is neutral dark with an azzurro detail matching the current 2D reference palette (`#9bbcf0` shirt, white shorts), and both boot and accent colours remain editable.

No third-party boot model or new runtime dependency is introduced; the boot geometry is generated locally with Three.js primitives, so licensing/runtime guarantees of the approved v4 garment base remain unchanged.

## Non-regression constraints

- Existing real shirt/shorts/socks GLBs are untouched.
- Existing 360° OrbitControls, front/back/left/right views and conformal overlays remain untouched.
- Existing name/number text, custom font loading and pattern uploads remain untouched.
- Existing manual graphic controls remain the authority after preset creation.
- No CDN, SaaS, React or new donor runtime dependency.
- PR stays Draft pending founder visual approval.
