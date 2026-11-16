import type { ApiCheckoutStatus } from "~/models/checkout_model";
import { createError, getRouterParam } from "h3";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Checkout id is required" });
  return useApiFetch<ApiCheckoutStatus>(event, `/checkout/${encodeURIComponent(id)}/status`, { requireToken: true });
});
