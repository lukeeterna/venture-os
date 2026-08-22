import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http"
import { SportswearQuoteSchema } from "./store/sportswear/quote/validators"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/sportswear/quote",
      method: ["POST"],
      middlewares: [validateAndTransformBody(SportswearQuoteSchema)],
    },
  ],
})
