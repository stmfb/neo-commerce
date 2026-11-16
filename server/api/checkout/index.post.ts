import type { ApiQuote, QuoteBody } from "~/models/checkout_model";
import { createError, readBody } from "h3";
import { useApiFetch } from "~~/server/utils/api";

/** Quotes the cart and mints the `checkoutId` every later checkout call uses. */
export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<QuoteBody>>(event);
  const cartVersion = Number(body?.cartVersion);
  if (typeof body?.cartId !== "string" || !body.cartId || !Number.isInteger(cartVersion)) {
    throw createError({ statusCode: 400, statusMessage: "A cart id and version are required" });
  }
  return useApiFetch<ApiQuote>(event, "/checkout", {
    method: "POST",
    body: { cartId: body.cartId, cartVersion },
    requireToken: true,
  });
});
