/** Default headers sent with every request to the upstream NeoCash API. */
export const apiHeader: Record<string, string> = {
  Accept: "application/json",
  // Bypasses the ngrok free-tier interstitial page; harmless on other hosts.
  "ngrok-skip-browser-warning": "true",
};
