import type { ApiOrderDetail } from "~/models/orders_model";
import { createError, getRouterParam } from "h3";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Order id is required" });
  return useApiFetch<ApiOrderDetail>(event, `/orders/${encodeURIComponent(id)}`, { requireToken: true });
});
