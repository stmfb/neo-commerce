import { createError, getHeader, readBody } from "h3";
import { saveShopperSession } from "~~/server/utils/session";

/** Stores the session the app hands over. JSON only, so another site can't post a form here. */
export default defineEventHandler(async (event) => {
  if (!getHeader(event, "content-type")?.includes("application/json")) {
    throw createError({ statusCode: 415, statusMessage: "Send JSON" });
  }
  const body = await readBody<{ token?: unknown; deviceId?: unknown; firstName?: unknown }>(event);
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!token || token.length > 4096) {
    throw createError({ statusCode: 400, statusMessage: "A token is required" });
  }
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);
  saveShopperSession(event, token, str(body.deviceId, 200), str(body.firstName, 60));
  return { signedIn: true };
});
