# Teamwear benchmark — roster, sizing, pricing and approval

Date: 2026-08-22

This document records the product patterns selected for Sportswear. It is not marketing copy and does not imply compatibility with the referenced vendors.

## Patterns adopted

### Player-level roster instead of one global size
Kittd models team orders with player name, size and squad number and includes an approval path before supplier fulfilment. KIBI Sports exposes a player roster, size quantities, player preview, bulk paste and player import. Sportswear therefore stores name, number, role and garment sizes on every roster row and lets the user preview a selected player in 3D.

References:
- https://www.kittd.com/
- https://kibisports.com/

### Mixed demographic order
Spized and Ekipazo support teamwear across men, women and children, including mixed adult/youth ordering. Sportswear therefore keeps `men`, `women`, `boys` and `girls` as distinct categories inside the same team order rather than forcing one unisex size selector.

References:
- https://www.spized.com/en/teamwear/football
- https://ekipazofootball.com/

### Full-kit sizing
A player can need different sizes for shirt and shorts, and socks use footwear-size bands. Sportswear therefore records shirt, shorts and socks independently for each player.

### Size authority
Macron's teamwear size guide is used as the documented baseline: men's/unisex adult sizing through 5XL, women's sizing through 4XL, youth ages 3–14 and sock bands 29/34 through 47/50. Supplier/product availability remains authoritative: the backoffice can narrow a fabric's `sportswear_sizes` matrix without changing the front end.

Reference:
- https://www.macron.com/uk/size-guide

### Bulk roster operations
KIBI Sports' bulk player workflow is adopted as CSV import/export plus paste-in roster. Duplicate squad numbers are warned before quote/production handoff.

### Live price and quantity tiers
Real-time pricing is separated from visualization. Medusa 2.19 is the pricing authority. Its Pricing Module natively supports `min_quantity` / `max_quantity` tiers and Admin price lists, so quantity offers are not reimplemented in browser code.

References:
- https://docs.medusajs.com/resources/commerce-modules/pricing/price-rules
- https://docs.medusajs.com/user-guide/price-lists/create

### Fail-closed pricing
If a requested fabric or personalization has no price, the configurator shows the quote as incomplete. It never falls back to demo numbers. This is a deliberate production requirement.

## Features intentionally retained from the 3D configurator

- 360-degree garment preview;
- player-specific name/number preview;
- independent shirt/shorts/socks colors and pattern;
- logo, sponsor, patch and badge placement;
- physical typography presets with manual override;
- selectable collars;
- hidden reconstructable payload for backoffice handoff.

## Next production gate

No Sportswear build is GREEN until both the football-realism visual gate and the team-order/backoffice gates pass on the same exact branch head.
