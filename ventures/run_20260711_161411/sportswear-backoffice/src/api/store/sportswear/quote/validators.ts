import { z } from "@medusajs/framework/zod"

export const SportswearQuoteSchema = z.object({
  currency_code: z.string().trim().min(3).max(3).default("eur"),
  fabric_sku: z.string().trim().min(1).max(120),
  quantity: z.number().int().min(1).max(2000),
  feature_units: z.array(z.object({
    sku: z.string().trim().min(1).max(120),
    units_per_kit: z.number().int().min(1).max(20),
  })).max(50).default([]),
  roster: z.array(z.object({
    id: z.union([z.string(), z.number()]).optional(),
    name: z.string().max(32).default(""),
    number: z.string().max(6).default(""),
    category: z.enum(["men", "women", "boys", "girls"]),
    role: z.enum(["player", "goalkeeper"]).default("player"),
    shirt_size: z.string().min(1).max(8),
    shorts_size: z.string().min(1).max(8),
    socks_size_eu: z.string().min(1).max(8),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(500),
})

export type SportswearQuoteInput = z.infer<typeof SportswearQuoteSchema>
