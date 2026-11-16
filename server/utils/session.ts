import type { H3Event } from "h3";
import { deleteCookie, getCookie, setCookie } from "h3";

/**
 * The shopper's NeoCash session. The app hands the web page its Firebase ID token
 * (see app/plugins/neocash-bridge.client.ts); we keep it in an httpOnly cookie so
 * page JavaScript never holds it, and forward it upstream on every API call.
 */
const TOKEN = "nc_token";
const DEVICE = "nc_device";
/** Readable by the page, so the header can greet the shopper. Holds no secret. */
const SIGNED_IN = "nc_signed_in";
const FIRST_NAME = "nc_name";

/** Firebase ID tokens last an hour; the app sends a fresh one before then. */
const TOKEN_MAX_AGE = 60 * 60;
const DEVICE_MAX_AGE = 60 * 60 * 24 * 30;

export function shopperAuth(event: H3Event) {
  return { token: getCookie(event, TOKEN), deviceId: getCookie(event, DEVICE) };
}

export function saveShopperSession(event: H3Event, token: string, deviceId?: string, firstName?: string) {
  const base = { path: "/", sameSite: "lax" as const, secure: !import.meta.dev };
  setCookie(event, TOKEN, token, { ...base, httpOnly: true, maxAge: TOKEN_MAX_AGE });
  if (deviceId) setCookie(event, DEVICE, deviceId, { ...base, httpOnly: true, maxAge: DEVICE_MAX_AGE });
  setCookie(event, SIGNED_IN, "1", { ...base, maxAge: TOKEN_MAX_AGE });
  setCookie(event, FIRST_NAME, firstName ?? "", { ...base, maxAge: DEVICE_MAX_AGE });
}

export function clearShopperSession(event: H3Event) {
  for (const name of [TOKEN, DEVICE, SIGNED_IN, FIRST_NAME]) deleteCookie(event, name, { path: "/" });
}
