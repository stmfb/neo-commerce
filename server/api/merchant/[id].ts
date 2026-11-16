import type { ApiMerchantDetail, MerchantPage } from "~/models/marketplace_model";
import { createError, getQuery, getRouterParam } from "h3";
import { useApiFetch } from "~~/server/utils/api";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export default defineEventHandler(async (event): Promise<MerchantPage> => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Merchant id is required" });
  }

  const query = getQuery(event);
  const rawLimit = Number(query.limit);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), MAX_LIMIT) : DEFAULT_LIMIT;
  const cursor = typeof query.cursor === "string" && query.cursor ? query.cursor : undefined;

  const data = await useApiFetch<ApiMerchantDetail>(event, `/merchants/${encodeURIComponent(id)}`, {
    method: "GET",
    params: { limit, cursor },
  });

  return { ...data, nextCursor: data.page.nextCursor ?? null };
});
