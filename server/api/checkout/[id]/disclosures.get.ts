import type { ApiDisclosures } from "~/models/checkout_model";
import { createError, getQuery, getRouterParam } from "h3";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Checkout id is required" });
  const { planCode } = getQuery(event);
  return useApiFetch<ApiDisclosures>(event, `/checkout/${encodeURIComponent(id)}/disclosures`, {
    params: { planCode: typeof planCode === "string" && planCode ? planCode : undefined },
    requireToken: true,
  });
});
