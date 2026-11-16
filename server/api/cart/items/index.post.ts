import type { AddCartItemBody, ApiCart } from "~/models/cart_model";
import { createError, readBody } from "h3";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<AddCartItemBody>>(event);
  const quantity = Number(body?.quantity);
  if (typeof body?.listingId !== "string" || !body.listingId || !Number.isInteger(quantity) || quantity < 1) {
    throw createError({ statusCode: 400, statusMessage: "A listing and a quantity are required" });
  }
  return useApiFetch<ApiCart>(event, "/cart/items", {
    method: "POST",
    body: { listingId: body.listingId, variantId: body.variantId || undefined, quantity },
    requireToken: true,
  });
});
