import { QueryContext } from "@medusajs/framework/utils"

export const SPORTSWEAR_HANDLES = Object.freeze({
  fabrics: "sportswear-fabrics",
  personalizations: "sportswear-personalizations",
})

export const SPORTSWEAR_CATEGORIES = Object.freeze({
  men: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
  women: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
  boys: ["5XS", "4XS", "3XS", "XXS", "XS", "S"],
  girls: ["5XS", "4XS", "3XS", "XXS", "XS", "S"],
})

export const SPORTSWEAR_SOCK_SIZES = Object.freeze(["29/34", "35/38", "39/42", "43/46", "47/50"])

export type SportswearQuery = {
  graph: (input: Record<string, unknown>) => Promise<{ data: any[] }>
}

export type CalculatedSportswearPrice = {
  id: string
  sku: string
  title: string
  product_title: string
  metadata: Record<string, unknown>
  amount: number | null
  original_amount: number | null
  currency_code: string
  min_quantity: number | null
  max_quantity: number | null
}

export function parseSizeMatrix(metadata: Record<string, unknown> | null | undefined) {
  const raw = metadata?.sportswear_sizes
  if (!raw) return SPORTSWEAR_CATEGORIES
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
    if (!parsed || typeof parsed !== "object") return SPORTSWEAR_CATEGORIES
    const result: Record<string, string[]> = {}
    for (const [category, fallback] of Object.entries(SPORTSWEAR_CATEGORIES)) {
      const candidate = (parsed as Record<string, unknown>)[category]
      result[category] = Array.isArray(candidate) && candidate.every((v) => typeof v === "string") ? candidate : [...fallback]
    }
    return result
  } catch {
    return SPORTSWEAR_CATEGORIES
  }
}

export function validateRosterSizes(roster: any[]) {
  const errors: string[] = []
  roster.forEach((player, index) => {
    const category = String(player?.category || "") as keyof typeof SPORTSWEAR_CATEGORIES
    const sizes = SPORTSWEAR_CATEGORIES[category]
    if (!sizes) {
      errors.push(`players[${index}].category`)
      return
    }
    if (!sizes.includes(String(player?.shirt_size || ""))) errors.push(`players[${index}].shirt_size`)
    if (!sizes.includes(String(player?.shorts_size || ""))) errors.push(`players[${index}].shorts_size`)
    if (!SPORTSWEAR_SOCK_SIZES.includes(String(player?.socks_size_eu || ""))) errors.push(`players[${index}].socks_size_eu`)
  })
  return errors
}

export async function findSportswearProduct(query: SportswearQuery, handle: string) {
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "status", "metadata", "variants.id", "variants.title", "variants.sku", "variants.metadata", "variants.prices.*"],
    filters: { handle },
  })
  return data[0] || null
}

export async function calculateSportswearVariant(
  query: SportswearQuery,
  sku: string,
  currencyCode: string,
  quantity: number
): Promise<CalculatedSportswearPrice | null> {
  const first = await query.graph({
    entity: "variant",
    fields: ["id", "sku", "title", "metadata", "product.id", "product.title"],
    filters: { sku },
  })
  const base = first.data[0]
  if (!base?.id) return null

  // Medusa's pricing module evaluates min_quantity/max_quantity from the
  // calculated_price QueryContext itself. Keep quantity at the top level,
  // matching the official cart pricing workflow.
  const context = QueryContext({
    currency_code: currencyCode.toLowerCase(),
    quantity: Math.max(1, Math.floor(Number(quantity) || 1)),
  })
  const priced = await query.graph({
    entity: "variant",
    fields: ["id", "sku", "title", "metadata", "product.title", "prices.*", "calculated_price.*"],
    filters: { id: base.id },
    context: { calculated_price: context },
  })
  const variant = priced.data[0]
  if (!variant) return null
  const calculated = variant.calculated_price || null
  const amount = Number.isFinite(calculated?.calculated_amount) ? Number(calculated.calculated_amount) : null
  const originalAmount = Number.isFinite(calculated?.original_amount) ? Number(calculated.original_amount) : amount
  const rawPrices = Array.isArray(variant.prices) ? variant.prices : []
  const tier = amount === null ? null : rawPrices.find((price: any) =>
    String(price.currency_code || "").toLowerCase() === currencyCode.toLowerCase() &&
    Number(price.amount) === amount &&
    (price.min_quantity == null || quantity >= Number(price.min_quantity)) &&
    (price.max_quantity == null || quantity <= Number(price.max_quantity))
  )
  return {
    id: variant.id,
    sku: String(variant.sku || sku),
    title: String(variant.title || sku),
    product_title: String(variant.product?.title || "Sportswear"),
    metadata: variant.metadata || {},
    amount,
    original_amount: originalAmount,
    currency_code: String(calculated?.currency_code || currencyCode).toLowerCase(),
    min_quantity: tier?.min_quantity == null ? null : Number(tier.min_quantity),
    max_quantity: tier?.max_quantity == null ? null : Number(tier.max_quantity),
  }
}

export function tierLabel(price: CalculatedSportswearPrice) {
  if (price.min_quantity != null && price.max_quantity != null) return `${price.min_quantity}–${price.max_quantity} pezzi`
  if (price.min_quantity != null) return `${price.min_quantity}+ pezzi`
  if (price.max_quantity != null) return `fino a ${price.max_quantity} pezzi`
  return null
}
