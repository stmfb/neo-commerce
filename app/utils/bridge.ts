/** Session the NeoCash app hands the page. */
export interface BridgeSession {
  token: string;
  deviceId?: string;
  firstName?: string;
}

/** Messages to the app, through its `NeoCashApp` JavaScript channel when it has one. */
export function postToApp(message: { type: "ready" | "session_required" }) {
  if (!import.meta.client) return;
  (window as any).NeoCashApp?.postMessage?.(JSON.stringify(message));
}
