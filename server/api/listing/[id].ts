import type { ApiListingDetail } from "~/models/marketplace_model";
import { createError, getRouterParam } from "h3";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Listing id is required" });
  }

  return useApiFetch<ApiListingDetail>(event, `/listings/${encodeURIComponent(id)}`, {
    method: "GET",
  });
});
