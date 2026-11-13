/**
 * Reads a failed `$fetch("/api/…")`. Nitro wraps our server route's error, so the
 * upstream `{ code, message, fields }` arrive under `error.data.data`.
 */
export function apiError(error: any): {
  status: number | null;
  code: string | null;
  message: string;
  fields: Record<string, string>;
} {
  const upstream = error?.data?.data;
  return {
    status: error?.statusCode ?? error?.status ?? null,
    code: upstream?.code ?? null,
    message: upstream?.message || error?.data?.message || error?.statusMessage || "Something went wrong",
    fields: upstream?.fields ?? {},
  };
}
