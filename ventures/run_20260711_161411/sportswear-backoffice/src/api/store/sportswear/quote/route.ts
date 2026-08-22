import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { calculateSportswearVariant, tierLabel, validateRosterSizes } from "../../../../lib/sportswear"
import { SportswearQuoteSchema } from "./validators"

type Input = z.infer<typeof SportswearQuoteSchema>

export async function POST(req: MedusaRequest<Input>, res: MedusaResponse) {
  const input = req.validatedBody
  const rosterQuantity = input.roster.reduce((sum, player) => sum + player.quantity, 0)
  if (rosterQuantity !== input.quantity) {
    return res.status(422).json({
      type: "invalid_data",
      message: `quantity (${input.quantity}) does not match roster quantity (${rosterQuantity})`,
    })
  }
  const sizeErrors = validateRosterSizes(input.roster)
  if (sizeErrors.length) {
    return res.status(422).json({ type: "invalid_data", message: "Invalid roster sizes", fields: sizeErrors })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
  const requested = [
    { sku: input.fabric_sku, unitsPerKit: 1, kind: "fabric" },
    ...input.feature_units.map((item) => ({ sku: item.sku, unitsPerKit: item.units_per_kit, kind: "personalization" })),
  ]
  const lines: any[] = []
  const missing: string[] = []
  let totalAmount = 0
  let originalTotalAmount = 0

  for (const item of requested) {
    const price = await calculateSportswearVariant(query, item.sku, input.currency_code, input.quantity)
    if (!price || price.amount == null) {
      missing.push(item.sku)
      continue
    }
    const units = input.quantity * item.unitsPerKit
    const total = price.amount * units
    const originalUnit = price.original_amount ?? price.amount
    const originalTotal = originalUnit * units
    totalAmount += total
    originalTotalAmount += originalTotal
    lines.push({
      sku: item.sku,
      title: price.title,
      kind: item.kind,
      units_per_kit: item.unitsPerKit,
      billable_units: units,
      unit_amount: price.amount,
      original_unit_amount: originalUnit,
      total_amount: total,
      tier: tierLabel(price),
    })
  }

  if (missing.length) {
    return res.json({
      quote_version: "sportswear-medusa-v1",
      priced: false,
      currency_code: input.currency_code.toLowerCase(),
      quantity: input.quantity,
      missing_skus: missing,
      lines,
    })
  }

  res.json({
    quote_version: "sportswear-medusa-v1",
    priced: true,
    currency_code: input.currency_code.toLowerCase(),
    quantity: input.quantity,
    total_amount: totalAmount,
    original_total_amount: originalTotalAmount,
    discount_amount: Math.max(0, originalTotalAmount - totalAmount),
    unit_average_amount: Math.round(totalAmount / input.quantity),
    lines,
  })
}
