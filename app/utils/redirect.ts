/**
 * A `?redirect=` value that's safe to navigate to: a path on this site only. Anything else
 * (another origin, `//evil.com`, `/\evil.com`, `javascript:`) falls back.
 */
export function safeRedirect(value: unknown, fallback = "/"): string {
  const path = Array.isArray(value) ? value[0] : value;
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  return path;
}
