import { createError, getRouterParam, readBody } from "h3";
import { useApiFetch } from "~~/server/utils/api";

/** The web sign-in steps, and the only body fields each one passes upstream. */
const STEPS: Record<string, readonly string[]> = {
  start: ["phone"],
  otp: ["signInToken", "code"],
  "liveness/start": ["signInToken"],
  "liveness/result": ["signInToken", "livenessSessionId"],
  identity: ["signInToken", "firstName", "lastName", "email", "bvn"],
};
const MAX_FIELD = 512;

/**
 * Web sign-in (POST /v1/auth/*), step by step. These routes take no shopper session, so
 * they're called anonymously; the sign-in token travels in the body, never in a cookie.
 * Upstream validates the values and answers with `next`, or a coded error.
 */
export default defineEventHandler(async (event) => {
  const step = getRouterParam(event, "step") ?? "";
  const fields = STEPS[step];
  if (!fields) throw createError({ statusCode: 404, statusMessage: "Not found" });

  const raw = (await readBody<Record<string, unknown>>(event).catch(() => null)) ?? {};
  const body: Record<string, string> = {};
  for (const field of fields) {
    const value = raw[field];
    if (typeof value === "string") body[field] = value.trim().slice(0, MAX_FIELD);
  }

  return useApiFetch(event, `/auth/${step}`, { method: "POST", body, anonymous: true });
});
