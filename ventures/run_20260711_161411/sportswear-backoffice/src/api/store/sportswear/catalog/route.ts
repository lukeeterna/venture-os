import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { findSportswearProduct, parseSizeMatrix, SPORTSWEAR_HANDLES } from "../../../../lib/sportswear"

function baseCurrencyPrice(variant: any, currencyCode: string) {
  const prices = Array.isArray(variant?.prices) ? variant.prices : []
  const direct = prices.find((price: any) =>
    String(price.currency_code || "").toLowerCase() === currencyCode &&
    price.min_quantity == null && price.max_quantity == null && price.price_list_id == null
  )
  return Number.isFinite(direct?.amount) ? Number(direct.amount) : null
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const currencyCode = String(req.query.currency_code || "eur").toLowerCase()
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
  const [fabricProduct, personalizationProduct] = await Promise.all([
    findSportswearProduct(query, SPORTSWEAR_HANDLES.fabrics),
    findSportswearProduct(query, SPORTSWEAR_HANDLES.personalizations),
  ])

  const fabrics = (fabricProduct?.variants || []).map((variant: any) => ({
    id: variant.id,
    sku: variant.sku,
    title: variant.title,
    unit_amount: baseCurrencyPrice(variant, currencyCode),
    metadata: variant.metadata || {},
    size_matrix: parseSizeMatrix(variant.metadata || fabricProduct?.metadata),
  }))
  const personalizations = (personalizationProduct?.variants || []).map((variant: any) => ({
    id: variant.id,
    sku: variant.sku,
    title: variant.title,
    unit_amount: baseCurrencyPrice(variant, currencyCode),
    metadata: variant.metadata || {},
  }))

  res.json({
    version: "sportswear-catalog-v1",
    currency_code: currencyCode,
    fabrics,
    personalizations,
    admin_managed: true,
  })
}
