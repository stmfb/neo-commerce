/** Session the NeoCash app hands the page. */
export interface BridgeSession {
  token: string;
  deviceId?: string;
  firstName?: string;
}

const IN_APP_KEY = "nc_in_app";

/**
 * True inside the NeoCash app's webview, where the app owns sign-in. Known from the app's
 * `NeoCashApp` channel, or from the app having handed this tab a session.
 */
export function isInApp() {
  if (!import.meta.client) return false;
  if ((window as any).NeoCashApp) return true;
  try {
    return sessionStorage.getItem(IN_APP_KEY) === "1";
  } catch {
    return false;
  }
}

/** Remembers, for this tab, that the app handed over the session. */
export function markInApp() {
  try {
    sessionStorage.setItem(IN_APP_KEY, "1");
  } catch {
    // Storage blocked: the NeoCashApp channel check still applies.
  }
}

/** Messages to the app, through its `NeoCashApp` JavaScript channel when it has one. */
export function postToApp(message: { type: "ready" | "session_required" }) {
  if (!import.meta.client) return;
  (window as any).NeoCashApp?.postMessage?.(JSON.stringify(message));
}
