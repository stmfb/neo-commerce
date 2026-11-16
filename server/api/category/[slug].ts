import type {
  ApiCategoryListings,
  CategoryListingsPage,
  ListingSort,
} from "~/models/marketplace_model";
import { createError, getQuery, getRouterParam } from "h3";
import { useApiFetch } from "~~/server/utils/api";

const SORTS: readonly ListingSort[] = ["relevance", "price_asc", "price_desc", "newest"];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export default defineEventHandler(async (event): Promise<CategoryListingsPage> => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Category slug is required" });
  }

  const query = getQuery(event);
  const sort = SORTS.includes(query.sort as ListingSort) ? (query.sort as ListingSort) : "relevance";
  const rawLimit = Number(query.limit);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), MAX_LIMIT) : DEFAULT_LIMIT;
  const rawCursor = Number(query.cursor);
  const cursor = Number.isInteger(rawCursor) && rawCursor > 0 ? rawCursor : 0;

  const data = await useApiFetch<ApiCategoryListings>(
    event,
    `/categories/${encodeURIComponent(slug)}/listings`,
    { method: "GET", params: { sort, limit, cursor } },
  );

  // Upstream paginates by offset and reports `page.total` but no next cursor.
  const loaded = cursor + data.listings.length;
  const nextCursor = data.listings.length > 0 && loaded < data.page.total ? loaded : null;

  return { ...data, nextCursor };
});