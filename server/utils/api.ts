import type { H3Event } from "h3";
import { createError } from "h3";
import { apiHeader } from "./header";
import { shopperAuth } from "./session";

export const useApiFetch = async <T>(
  event: H3Event,
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: any;
    params?: any;
    headers?: Record<string, string>;
    /** Fail with 401 before calling upstream when the shopper has no session. */
    requireToken?: boolean;
  } = {},
): Promise<T> => {
  // Private (server-only) config — set via NUXT_API_BASE, never shipped to the browser.
  const config = useRuntimeConfig(event);
  const { token, deviceId } = shopperAuth(event);

  if (options.requireToken && !token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Please sign in again.",
      data: { code: "unauthorized", message: "Please sign in again.", retryable: false },
    });
  }

  const url = `${config.apiBase}${endpoint}`;

  try {
    const response = await $fetch(url, {
      method: options.method || "GET",
      headers: {
        ...apiHeader,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(deviceId ? { "device-id": deviceId } : {}),
        ...options.headers,
      },
      body: options.body,
      params: options.params,
    });

    return (response as any)?.data ?? response;
  } catch (err: any) {
    const errData = err.data ?? err.response?._data;
    // Upstream errors look like `{ error: { code, message, fields, retryable } }`,
    // but tolerate a flat `{ message }` / `{ error: "..." }` too.
    const nested = typeof errData?.error === "object" ? errData.error : undefined;
    const errMessage: string =
      errData?.message ||
      nested?.message ||
      (typeof errData?.error === "string" ? errData.error : undefined) ||
      err.statusMessage ||
      `Failed to fetch ${endpoint}`;
    const errStatus = err.status ?? err.response?.status ?? 500;

    console.error(`Failed to fetch ${endpoint}:`, errData || err.message);

    throw createError({
      statusCode: errStatus,
      statusMessage: errMessage,
      // Reaches the browser as `error.data.data`; read it with `apiError()` (app/utils/api_error.ts).
      data: nested
        ? { code: nested.code, message: nested.message, fields: nested.fields, retryable: nested.retryable }
        : undefined,
    });
  }
};
