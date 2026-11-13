import { createError, readBody } from "h3";
import { useApiFetch } from "~~/server/utils/api";

/**
 * Sets the shopper's transaction PIN, which checkout and delivery confirmation need.
 * Upstream answers 204, or `pin_rejected` (bad format, or a PIN is already set).
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ pin?: unknown }>(event);
  if (typeof body?.pin !== "string" || !/^\d{4}$/.test(body.pin)) {
    throw createError({ statusCode: 400, statusMessage: "Choose a 4-digit PIN." });
  }
  await useApiFetch(event, "/me/pin", { method: "POST", body: { pin: body.pin }, requireToken: true });
  return { ok: true };
});
