import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const PRICE_PLAN = {
  FABRIC_MATCH_145: [
    { amount: 3200, currency_code: "eur" },
    { amount: 2900, currency_code: "eur", min_quantity: 10, max_quantity: 19 },
    { amount: 2600, currency_code: "eur", min_quantity: 20 },
  ],
  CUSTOM_NAME: [
    { amount: 450, currency_code: "eur" },
    { amount: 350, currency_code: "eur", min_quantity: 10 },
  ],
  BACK_NUMBER: [
    { amount: 550, currency_code: "eur" },
    { amount: 450, currency_code: "eur", min_quantity: 10 },
  ],
} as const

export default async function seedCiTierPrices({ container }: ExecArgs) {
  if (process.env.CI !== "true") {
    throw new Error("seed-ci-tier-prices is CI-only and refuses to run without CI=true")
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any
  const link = container.resolve(ContainerRegistrationKeys.LINK) as any
  const pricing = container.resolve(Modules.PRICING) as any

  const skus = Object.keys(PRICE_PLAN)
  const { data } = await query.graph({
    entity: "variant",
    fields: ["id", "sku", "price_set.id"],
    filters: { sku: skus },
  })
  const bySku = new Map(data.map((variant: any) => [String(variant.sku), variant]))

  for (const sku of skus) {
    const variant: any = bySku.get(sku)
    if (!variant?.id) throw new Error(`Missing structural Sportswear variant ${sku}`)
    if (variant.price_set?.id) {
      console.log(`SPORTSWEAR_CI_PRICESET=${sku}:ALREADY_LINKED:${variant.price_set.id}`)
      continue
    }

    const created = await pricing.createPriceSets({
      prices: PRICE_PLAN[sku as keyof typeof PRICE_PLAN].map((price) => ({ ...price })),
    })
    const priceSet = Array.isArray(created) ? created[0] : created
    if (!priceSet?.id) throw new Error(`Pricing module did not return a price set for ${sku}`)

    await link.create({
      [Modules.PRODUCT]: { variant_id: variant.id },
      [Modules.PRICING]: { price_set_id: priceSet.id },
    })
    console.log(`SPORTSWEAR_CI_PRICESET=${sku}:CREATED:${priceSet.id}`)
  }

  console.log("SPORTSWEAR_CI_TIER_PRICES=READY")
}
