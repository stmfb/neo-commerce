import type { H3Event } from "h3";
import { createError } from "h3";
import { apiHeader } from "./header";

export const useApiFetch = async <T>(
  event: H3Event,
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: any;
    params?: any;
    requireToken?: boolean;
  } = {},
): Promise<T> => {
  // Private (server-only) config — set via NUXT_API_BASE, never shipped to the browser.
  const config = useRuntimeConfig(event);
  const token = event.context.params?.token || getRouterParam(event, "token");

  if (options.requireToken && !token) {
    throw createError({
      statusCode: 400,
      statusMessage: "Token is required",
    });
  }

  const url = `${config.apiBase}${endpoint}`;

  try {
    const response = await $fetch(url, {
      method: options.method || "GET",
      headers: apiHeader,
      body: options.body,
      params: options.params,
    });

    return (response as any)?.data ?? response;
  } catch (err: any) {
    const errData = err.data ?? err.response?._data;
    const errMessage =
      errData?.message ||
      errData?.error ||
      err.statusMessage ||
      `Failed to fetch ${endpoint}`;
    const errStatus = err.status ?? err.response?.status ?? 500;

    console.error(`Failed to fetch ${endpoint}:`, errData || err.message);

    throw createError({
      statusCode: errStatus,
      statusMessage: errMessage,
    });
  }
};
