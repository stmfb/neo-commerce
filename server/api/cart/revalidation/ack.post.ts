import type { AcceptCartChangesBody, ApiCart } from "~/models/cart_model";
import { createError, readBody } from "h3";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<AcceptCartChangesBody>>(event);
  const cartVersion = Number(body?.cartVersion);
  if (typeof body?.revalidationId !== "string" || !body.revalidationId || !Number.isInteger(cartVersion)) {
    throw createError({ statusCode: 400, statusMessage: "A revalidation id and cart version are required" });
  }
  const removeItemIds = Array.isArray(body.removeItemIds) ? body.removeItemIds.filter((id) => typeof id === "string") : [];
  return useApiFetch<ApiCart>(event, "/cart/revalidation/ack", {
    method: "POST",
    body: { revalidationId: body.revalidationId, cartVersion, removeItemIds },
    requireToken: true,
  });
});
