import type { ApiSearchSuggest, SearchSuggestions } from "~/models/marketplace_model";
import { getQuery, setResponseHeader } from "h3";
import { useApiFetch } from "~~/server/utils/api";
import { createTtlCache } from "~~/shared/utils/ttl_cache";
import { normaliseSearchTerm, SUGGEST_MIN_CHARS } from "~~/shared/utils/search_term";

const MAX_QUERIES = 6;
const MAX_CATEGORIES = 4;
const MAX_MERCHANTS = 4;
const CACHE_SECONDS = 60;

/**
 * Shoppers typing the same prefixes ("ph", "sam") send the same queries, so answers are
 * shared between shoppers for a minute. Safe because suggest is a browse route: it's called
 * without the shopper's credentials, so the cache only ever holds catalogue data.
 * Capped so a stream of unique queries can't grow memory without limit.
 */
const cache = createTtlCache<SearchSuggestions>({ max: 500, ttlMs: CACHE_SECONDS * 1000 });
/** Concurrent requests for the same query share one upstream call. */
const pending = new Map<string, Promise<SearchSuggestions>>();

const empty = (q: string): SearchSuggestions => ({ q, queries: [], categories: [], merchants: [] });

/** Search-as-you-type for the header search box: completed queries, categories and stores. */
export default defineEventHandler(async (event): Promise<SearchSuggestions> => {
  const query = getQuery(event);
  const q = normaliseSearchTerm(typeof query.q === "string" ? query.q : "");
  if (q.length < SUGGEST_MIN_CHARS) return empty(q);

  let result = cache.get(q);
  if (!result) {
    let request = pending.get(q);
    if (!request) {
      request = useApiFetch<Partial<ApiSearchSuggest>>(event, "/search/suggest", {
        method: "GET",
        params: { q },
        anonymous: true,
      })
        .then((data) => {
          // Upstream may omit an empty list; cap each so the dropdown stays short.
          const fresh: SearchSuggestions = {
            q,
            queries: (data.queries ?? []).slice(0, MAX_QUERIES),
            categories: (data.categories ?? []).slice(0, MAX_CATEGORIES),
            merchants: (data.merchants ?? []).slice(0, MAX_MERCHANTS),
          };
          cache.set(q, fresh);
          return fresh;
        })
        .finally(() => pending.delete(q));
      pending.set(q, request);
    }
    result = await request;
  }

  // Anonymous catalogue data, so browsers (and any CDN in front) may reuse it too.
  setResponseHeader(event, "Cache-Control", `public, max-age=${CACHE_SECONDS}`);
  return result;
});
