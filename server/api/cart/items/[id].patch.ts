import type { ApiCart } from "~/models/cart_model";
import { createError, getRouterParam, readBody } from "h3";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const quantity = Number((await readBody<{ quantity?: unknown }>(event))?.quantity);
  if (!id || !Number.isInteger(quantity) || quantity < 1) {
    throw createError({ statusCode: 400, statusMessage: "An item and a quantity are required" });
  }
  return useApiFetch<ApiCart>(event, `/cart/items/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { quantity },
    requireToken: true,
  });
});
