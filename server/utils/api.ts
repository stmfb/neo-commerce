import type { H3Event } from "h3";
import { createError } from "h3";
import { friendlyErrorMessage } from "~~/shared/utils/error_messages";
import { apiHeader } from "./header";
import { shopperAuth } from "./session";

/** Longest we wait on the NeoCash API. Identity checks take a few seconds; nothing takes this long. */
const TIMEOUT_MS = 30_000;

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
  const method = options.method || "GET";

  try {
    const response = await $fetch(url, {
      method,
      headers: {
        ...apiHeader,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(deviceId ? { "device-id": deviceId } : {}),
        ...options.headers,
      },
      body: options.body,
      params: options.params,
      timeout: TIMEOUT_MS,
    });

    return (response as any)?.data ?? response;
  } catch (err: any) {
    const status: number | undefined = err.response?.status ?? err.status;
    const errData = err.data ?? err.response?._data;
    // The API's errors are JSON, `{ error: { code, message, fields, retryable } }`; a flat
    // `{ message }` or `{ error: "…" }` is tolerated too.
    const nested = errData && typeof errData.error === "object" ? errData.error : undefined;
    const flat = typeof errData?.message === "string" ? errData.message : typeof errData?.error === "string" ? errData.error : undefined;

    // The full story is for us, in the server log; the shopper only ever gets a message meant for them.
    const detail = typeof errData === "string" ? errData.slice(0, 300) : (errData ?? err.cause?.message ?? err.message);
    console.error(`[api] ${method} ${endpoint} failed: ${status ? `HTTP ${status}` : "no response"}`, detail);

    if (!status || !(nested || flat)) {
      // No answer (down, timed out), or one that isn't from the API (a tunnel's "offline" page, a
      // gateway error). It's an outage, so it mustn't pass for "not found" or the shopper's mistake.
      const message = friendlyErrorMessage(503);
      throw createError({
        statusCode: 503,
        statusMessage: message,
        data: { code: "service_unavailable", message, retryable: true },
      });
    }

    // The API writes its messages for shoppers (see the brief), so they're shown as they are.
    const message: string = nested?.message || flat || friendlyErrorMessage(status);
    throw createError({
      statusCode: status,
      statusMessage: message,
      // Reaches the browser as `error.data.data`; read it with `apiError()` (app/utils/api_error.ts).
      data: { code: nested?.code ?? null, message, fields: nested?.fields, retryable: nested?.retryable },
    });
  }
};
