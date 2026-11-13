import type { ApiBankLink } from "~/models/checkout_model";
import { createError, getRouterParam } from "h3";
import { useApiFetch } from "~~/server/utils/api";

/** Mono Connect details for linking the salary account. */
export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Checkout id is required" });
  return useApiFetch<ApiBankLink>(event, `/checkout/${encodeURIComponent(id)}/bank-link`, {
    method: "POST",
    requireToken: true,
  });
});
