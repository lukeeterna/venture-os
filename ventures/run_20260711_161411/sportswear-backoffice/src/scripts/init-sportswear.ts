import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { SPORTSWEAR_CATEGORIES, SPORTSWEAR_HANDLES } from "../lib/sportswear"

const sizeMatrix = JSON.stringify(SPORTSWEAR_CATEGORIES)

export default async function initSportswear({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: [SPORTSWEAR_HANDLES.fabrics, SPORTSWEAR_HANDLES.personalizations] },
  })
  const handles = new Set(existing.map((product: any) => product.handle))
  const products: any[] = []

  if (!handles.has(SPORTSWEAR_HANDLES.fabrics)) {
    const fabrics = [
      ["FABRIC_MATCH_145", "Match 145 g"],
      ["FABRIC_PRO_130", "Pro 130 g"],
      ["FABRIC_ECO_160", "Eco 160 g"],
    ]
    products.push({
      title: "Sportswear — Tessuti",
      handle: SPORTSWEAR_HANDLES.fabrics,
      status: "published",
      metadata: { sportswear_kind: "fabric", sportswear_sizes: sizeMatrix },
      options: [{ title: "Tessuto", values: fabrics.map(([, title]) => title) }],
      variants: fabrics.map(([sku, title]) => ({
        title,
        sku,
        manage_inventory: false,
        options: { Tessuto: title },
        metadata: { sportswear_kind: "fabric", sportswear_sizes: sizeMatrix },
      })),
    })
  }

  if (!handles.has(SPORTSWEAR_HANDLES.personalizations)) {
    const services = [
      ["CUSTOM_NAME", "Nome giocatore"],
      ["BACK_NUMBER", "Numero retro"],
      ["FRONT_NUMBER", "Numero fronte"],
      ["GRAPHIC_LOGO", "Stemma / logo"],
      ["GRAPHIC_SPONSOR", "Sponsor"],
      ["GRAPHIC_PATCH", "Patch"],
      ["GRAPHIC_BADGE", "Badge"],
      ["CUSTOM_PATTERN", "Fantasia personalizzata"],
      ["CUSTOM_COLLAR", "Colletto speciale"],
    ]
    products.push({
      title: "Sportswear — Personalizzazioni",
      handle: SPORTSWEAR_HANDLES.personalizations,
      status: "published",
      metadata: { sportswear_kind: "personalization" },
      options: [{ title: "Servizio", values: services.map(([, title]) => title) }],
      variants: services.map(([sku, title]) => ({
        title,
        sku,
        manage_inventory: false,
        options: { Servizio: title },
        metadata: { sportswear_kind: "personalization" },
      })),
    })
  }

  if (!products.length) {
    console.log("SPORTSWEAR_CATALOG=ALREADY_PRESENT")
    return
  }
  const { result } = await createProductsWorkflow(container).run({ input: { products } })
  console.log(`SPORTSWEAR_CATALOG=CREATED PRODUCTS=${result.length}`)
  console.log("SPORTSWEAR_PRICES=UNSET_BY_DESIGN — enter real prices in Admin before publishing quotes")
}
