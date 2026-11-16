/**
 * Reads a failed `$fetch("/api/…")`. Nitro wraps our server route's error, so the
 * upstream `{ code, message, fields }` arrive under `error.data.data`.
 *
 * `message` is always fit to show a shopper: the API's own message, or a plain fallback for
 * the status. Never Nitro's raw text, which can name an endpoint or say "Internal Server Error".
 * No status at all means the request never reached our server: the shopper is offline.
 */
export function apiError(error: any): {
  status: number | null;
  code: string | null;
  message: string;
  fields: Record<string, string>;
} {
  const upstream = error?.data?.data;
  const status: number | null = error?.statusCode ?? error?.status ?? error?.response?.status ?? null;
  return {
    status,
    code: upstream?.code ?? null,
    message: upstream?.message || friendlyErrorMessage(status),
    fields: upstream?.fields ?? {},
  };
}
