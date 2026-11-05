import type { LocationQuery, LocationQueryRaw } from "vue-router";
import type { ListingSort, SearchQuery } from "~/models/marketplace_model";

export const SEARCH_SORTS: { value: ListingSort; label: string }[] = [
  { value: "relevance", label: "Most relevant" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
];

const list = (value: LocationQuery[string] | undefined) =>
  (Array.isArray(value) ? value : value ? [value] : []).filter((v): v is string => Boolean(v));

const int = (value: LocationQuery[string] | undefined) => {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
};

/**
 * Reads search filters from the page URL. The URL uses the API's own param names and
 * kobo amounts, e.g. /search?q=phone&brand=Tecno&maxPrice=50000000&sort=price_asc
 */
export function searchQueryFromRoute(query: LocationQuery): SearchQuery {
  const sort = SEARCH_SORTS.some((s) => s.value === query.sort) ? (query.sort as ListingSort) : undefined;
  return {
    q: typeof query.q === "string" && query.q.trim() ? query.q.trim() : undefined,
    sort,
    brand: list(query.brand),
    merchant: list(query.merchant),
    condition: list(query.condition),
    minPrice: int(query.minPrice),
    maxPrice: int(query.maxPrice),
    maxMonthly: int(query.maxMonthly),
  };
}

/** Inverse of `searchQueryFromRoute`; drops empty values so URLs stay short. */
export function searchQueryToRoute(query: SearchQuery): LocationQueryRaw {
  const out: LocationQueryRaw = {};
  if (query.q) out.q = query.q;
  if (query.sort && query.sort !== "relevance") out.sort = query.sort;
  if (query.brand?.length) out.brand = query.brand;
  if (query.merchant?.length) out.merchant = query.merchant;
  if (query.condition?.length) out.condition = query.condition;
  if (query.minPrice) out.minPrice = String(query.minPrice);
  if (query.maxPrice) out.maxPrice = String(query.maxPrice);
  if (query.maxMonthly) out.maxMonthly = String(query.maxMonthly);
  return out;
}

/** Stable key for caching / useAsyncData. */
export function searchQueryKey(query: SearchQuery) {
  return JSON.stringify(searchQueryToRoute(query));
}

export const nairaToKobo = (naira: number) => Math.round(naira * 100);
