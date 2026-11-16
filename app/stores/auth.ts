import { defineStore } from "pinia";
import type { BridgeSession } from "~/utils/bridge";
import { firebaseConfigured, onFirebaseToken, signOutOfFirebase } from "~/lib/firebase";

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

    /** Swaps in a refreshed token for the same shopper; signed-in data stays as it is. */
    async refreshSession(token: string) {
      try {
        await $fetch("/api/session", { method: "POST", body: { token, firstName: this.firstName || undefined } });
        return true;
      } catch {
        return false;
      }
    },

    /**
     * Website only: keeps the session cookie's ID token fresh from Firebase while the tab is
     * open. On load, a cookie still in date needs nothing; later tokens are refreshes. A tab
     * whose cookie ran out while it was closed signs back in from Firebase's tab session.
     */
    async syncWebSession() {
      const config = useRuntimeConfig().public.firebase;
      if (isInApp() || !firebaseConfigured(config)) return;
      await onFirebaseToken(config, (token, initial) => {
        if (initial && this.signedIn) return;
        if (this.signedIn) this.refreshSession(token);
        else this.setSession({ token, firstName: this.firstName || undefined });
      });
    },

    /** Website sign-out: ends our session and Firebase's. In the app, the app signs out. */
    async signOut() {
      await this.clearSession();
      const config = useRuntimeConfig().public.firebase;
      if (firebaseConfigured(config)) await signOutOfFirebase(config).catch(() => {});
    },

    /**
     * The shopper needs to sign in (a Sign in button, an action that needs an account, or
     * the API rejected the session). The app's webview asks the app; the website goes to
     * its sign-in page and comes back here afterwards.
     */
    requestSession() {
      this.signedIn = false;
      if (!import.meta.client) return;
      if (isInApp()) return postToApp({ type: "session_required" });
      const route = useRouter().currentRoute.value;
      if (route.path !== "/sign-in") navigateTo({ path: "/sign-in", query: { redirect: route.fullPath } });
    },

    /**
     * A background load found the session gone. Shows signed out without taking the shopper
     * off the page; in the app, the app is still asked for a fresh session.
     */
    sessionExpired() {
      this.signedIn = false;
      if (isInApp()) postToApp({ type: "session_required" });
    },
  },
});
