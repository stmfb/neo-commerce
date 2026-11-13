import type { BridgeSession } from "~/utils/bridge";

/**
 * Session handover from the NeoCash app, which shows the marketplace in a webview.
 * The app either opens the page with `#token=…&deviceId=…&firstName=…`, or calls
 * `window.NeoCashMarketplace.setSession({ token, deviceId, firstName })` on load and
 * whenever it refreshes the token. The page posts `{"type":"ready"}` once it can take
 * a session, and `{"type":"session_required"}` when it has none or the API rejects it.
 */
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore();

  (window as any).NeoCashMarketplace = {
    setSession: (session: BridgeSession) => auth.setSession(session),
    clearSession: () => auth.clearSession(),
  };

  // A fragment never reaches the server or its logs. Drop it from the address bar at once.
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const token = hash.get("token");
  if (token) {
    history.replaceState(history.state, "", window.location.pathname + window.location.search);
    await auth.setSession({
      token,
      deviceId: hash.get("deviceId") ?? undefined,
      firstName: hash.get("firstName") ?? undefined,
    });
  }

  postToApp({ type: "ready" });
});
