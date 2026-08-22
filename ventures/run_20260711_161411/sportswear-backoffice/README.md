# Sportswear Backoffice — Medusa 2.19

Base upstream: `medusajs/dtc-starter` pinned at `7d0d4767a314a3ece4c2cd4e881e52f5f9cce845` (MIT). The package versions intentionally match the pinned official backend.

## Purpose

This service is the pricing authority for the football configurator. The browser never owns production prices. It receives:

- fabric/quality variants and their supported size matrix;
- personalization service SKUs;
- calculated prices selected by Medusa;
- quantity tiers and price-list discounts;
- an explicit `priced:false` result when any required SKU has no valid price.

## First start

1. Copy `.env.template` to `.env` and replace JWT/cookie secrets.
2. Create the PostgreSQL database in `DATABASE_URL`.
3. `npm install`
4. `npm run db:migrate`
5. `npm run init:sportswear`
6. `npm run dev`
7. Create the first Admin user at `/app`.
8. In Admin, set real prices for Sportswear variants. No production price is seeded.
9. Create a publishable API key in Settings and expose it to the configurator as `window.__SPORTSWEAR_PUBLISHABLE_KEY`.

## Price entry

The custom `/app/sportswear` page is a shortcut/dashboard. Actual price editing uses Medusa's production-grade native UI:

- **Products** → edit base prices for fabric and personalization variants.
- **Price Lists** → add special prices and quantity tiers (`min_quantity` / `max_quantity`).

This deliberately reuses Medusa's pricing engine rather than duplicating price logic in Venture OS.

## API consumed by the configurator

- `GET /store/sportswear/catalog?currency_code=eur`
- `POST /store/sportswear/quote`

Both are Store routes and therefore require `x-publishable-api-key`, as normal for Medusa Store APIs.

A quote is fail-closed: roster quantity must match the requested quantity; category sizes are validated; every SKU must have a calculable price. If any price is absent the API returns `priced:false` and `missing_skus` instead of inventing a number.

## Product structure

`npm run init:sportswear` idempotently creates the two structural products and SKUs **without prices**:

- `sportswear-fabrics`: `FABRIC_MATCH_145`, `FABRIC_PRO_130`, `FABRIC_ECO_160`;
- `sportswear-personalizations`: name, numbers, graphics, pattern and collar services.

Fabric size availability is stored in metadata key `sportswear_sizes` and returned by the catalog API, so a supplier can narrow availability without changing configurator code.
