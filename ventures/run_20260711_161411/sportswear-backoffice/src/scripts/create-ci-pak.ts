import type { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function createCiPublishableKey({ container }: ExecArgs) {
  if (process.env.CI !== "true") {
    throw new Error("create-ci-pak is CI-only")
  }
  const service = container.resolve(Modules.API_KEY)
  const key = await service.createApiKeys({
    title: `Sportswear CI ${Date.now()}`,
    type: "publishable",
    created_by: "",
  })
  console.log(`SPORTSWEAR_CI_PAK=${key.token}`)
}
