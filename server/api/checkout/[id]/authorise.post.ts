import type { ApiAuthoriseResult, AuthoriseBody } from "~/models/checkout_model";
import { createError, getRouterParam, readBody } from "h3";
import { useApiFetch } from "~~/server/utils/api";

/**
 * Authorises with the shopper's PIN; the upfront payment is by transfer only for now.
 * The idempotency key is the checkout id, so a repeat returns the first result.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody<{ planCode?: unknown; pin?: unknown }>(event);
  if (!id || typeof body?.planCode !== "string" || !body.planCode || typeof body.pin !== "string" || !/^\d{4}$/.test(body.pin)) {
    throw createError({ statusCode: 400, statusMessage: "A plan and a 4-digit PIN are required" });
  }
  const upstream: AuthoriseBody = {
    planCode: body.planCode,
    paymentMethod: { type: "transfer" },
    credential: { type: "pin", pin: body.pin },
  };
  return useApiFetch<ApiAuthoriseResult>(event, `/checkout/${encodeURIComponent(id)}/authorise`, {
    method: "POST",
    body: upstream,
    headers: { "Idempotency-Key": id },
    requireToken: true,
  });
});
