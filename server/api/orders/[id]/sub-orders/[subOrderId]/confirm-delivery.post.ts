import type { ApiOrderDetail } from "~/models/orders_model";
import { createError, getRouterParam, readBody } from "h3";
import { useApiFetch } from "~~/server/utils/api";

/** The shopper says a dispatched sub-order arrived, with their PIN; returns the updated order. */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const subOrderId = getRouterParam(event, "subOrderId");
  const body = await readBody<{ pin?: unknown }>(event);
  if (!id || !subOrderId || typeof body?.pin !== "string" || !/^\d{4}$/.test(body.pin)) {
    throw createError({ statusCode: 400, statusMessage: "An order, a sub-order and a 4-digit PIN are required" });
  }
  return useApiFetch<ApiOrderDetail>(
    event,
    `/orders/${encodeURIComponent(id)}/sub-orders/${encodeURIComponent(subOrderId)}/confirm-delivery`,
    { method: "POST", body: { credential: { type: "pin", pin: body.pin } }, requireToken: true },
  );
});
