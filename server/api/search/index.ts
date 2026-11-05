import type { ApiSearchResults, ListingSort, SearchPage, SearchQuery } from "~/models/marketplace_model";
import { getQuery } from "h3";
import { useApiFetch } from "~~/server/utils/api";

const SORTS: readonly ListingSort[] = ["relevance", "price_asc", "price_desc", "newest"];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_LIST = 20;

/** `?brand=A&brand=B` arrives as an array, `?brand=A` as a string. Normalise to a clean list. */
function toList(value: unknown): string[] | undefined {
  const raw = Array.isArray(value) ? value : value == null ? [] : [value];
  const list = raw
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, MAX_LIST);
  return list.length ? [...new Set(list)] : undefined;
}

function toPositiveInt(value: unknown): number | undefined {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export default defineEventHandler(async (event): Promise<SearchPage> => {
  const query = getQuery(event);

  // Whitelist + validate everything, so a hand-edited URL can't trigger an upstream 400.
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 200) : undefined;
  const sort = SORTS.includes(query.sort as ListingSort) ? (query.sort as ListingSort) : undefined;
  const limit = Math.min(toPositiveInt(query.limit) ?? DEFAULT_LIMIT, MAX_LIMIT);
  const cursor = typeof query.cursor === "string" && query.cursor ? query.cursor : undefined;

  const params: SearchQuery = {
    q: q || undefined,
    sort,
    brand: toList(query.brand),
    merchant: toList(query.merchant),
    condition: toList(query.condition),
    minPrice: toPositiveInt(query.minPrice),
    maxPrice: toPositiveInt(query.maxPrice),
    maxMonthly: toPositiveInt(query.maxMonthly),
    limit,
    cursor,
  };

  // Arrays serialise as repeated params (brand=A&brand=B), which is what upstream expects.
  const data = await useApiFetch<ApiSearchResults>(event, "/search", { method: "GET", params });

  return {
    ...data,
    facets: data.facets ?? {},
    nextCursor: data.page?.nextCursor ?? null,
  };
});
