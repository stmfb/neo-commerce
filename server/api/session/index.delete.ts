import { clearShopperSession } from "~~/server/utils/session";

export default defineEventHandler((event) => {
  clearShopperSession(event);
  return { signedIn: false };
});
