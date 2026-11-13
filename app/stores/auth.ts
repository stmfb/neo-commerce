import { defineStore } from "pinia";
import type { BridgeSession } from "~/utils/bridge";

/** Cookie values are plain strings; skip useCookie's JSON parsing. */
const readCookie = (name: string) => useCookie<string | null>(name, { decode: (v) => decodeURIComponent(v ?? "") }).value;

/**
 * Whether a shopper session is in place. The token itself lives in an httpOnly cookie
 * the page can't read (see server/utils/session.ts); these flags come from cookies set
 * alongside it.
 */
export const useAuthStore = defineStore("auth", {
  state: () => ({
    signedIn: readCookie("nc_signed_in") === "1",
    firstName: readCookie("nc_name") ?? "",
    /** Bumped on each sign-in and sign-out, so signed-in data (cart, orders) reloads. */
    sessionVersion: 0,
    error: null as string | null,
  }),

  actions: {
    async setSession(session: BridgeSession) {
      try {
        this.error = null;
        await $fetch("/api/session", { method: "POST", body: session });
        this.signedIn = true;
        this.firstName = session.firstName ?? "";
        this.sessionVersion++;
        return true;
      } catch (error: any) {
        this.error = apiError(error).message;
        return false;
      }
    },

    async clearSession() {
      try {
        await $fetch("/api/session", { method: "DELETE" });
      } finally {
        this.signedIn = false;
        this.firstName = "";
        this.sessionVersion++;
      }
    },

    /** Sets the transaction PIN. The PIN is only passed through, never kept. */
    async setPin(pin: string): Promise<{ ok: boolean; code?: string | null; message?: string }> {
      try {
        await $fetch("/api/me/pin", { method: "POST", body: { pin } });
        return { ok: true };
      } catch (error) {
        const { status, code, message } = apiError(error);
        if (status === 401) this.requestSession();
        return { ok: false, code, message };
      }
    },

    /** No session, or the API rejected it: show signed out and ask the app for one. */
    requestSession() {
      this.signedIn = false;
      postToApp({ type: "session_required" });
    },
  },
});
