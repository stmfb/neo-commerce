import type { ApiCart } from "~/models/cart_model";
import { createError, getRouterParam } from "h3";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Cart item id is required" });
  return useApiFetch<ApiCart>(event, `/cart/items/${encodeURIComponent(id)}`, { method: "DELETE", requireToken: true });
});
