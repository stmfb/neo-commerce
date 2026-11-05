import { defineStore } from "pinia";
import type {
  ApiCategoryFacets,
  ApiListing,
  ApiSearchEmpty,
  SearchPage,
  SearchQuery,
} from "~/models/marketplace_model";

const PAGE_SIZE = 20;

/** True when anything other than the text query / sort narrows the results. */
export function hasActiveFilters(query: SearchQuery) {
  return Boolean(
    query.brand?.length ||
      query.merchant?.length ||
      query.condition?.length ||
      query.minPrice ||
      query.maxPrice ||
      query.maxMonthly,
  );
}

export const useSearchStore = defineStore("searchStore", {
  state: () => ({
    /** Filters the current results were fetched with (without paging). */
    query: {} as SearchQuery,
    listings: [] as ApiListing[],
    facets: {} as Partial<ApiCategoryFacets>,
    total: 0,
    nextCursor: null as string | null,
    empty: null as ApiSearchEmpty | null,
    /** Becomes true after the first search settles (success or failure). */
    loaded: false,
    loading: false,
    loadingMore: false,
    error: null as string | null,
    /** Guards against an older, slower response overwriting a newer search. */
    requestId: 0,
  }),

  actions: {
    fetchPage(query: SearchQuery, cursor?: string) {
      return $fetch<SearchPage>("/api/search", {
        params: { ...query, limit: PAGE_SIZE, cursor },
      });
    },

    /** Runs a new search, replacing the current results. */
    async search(query: SearchQuery) {
      const requestId = ++this.requestId;
      try {
        this.query = query;
        this.loading = true;
        this.error = null;

        const page = await this.fetchPage(query);
        if (requestId !== this.requestId) return false;

        this.listings = page.listings;
        // When filters match nothing, upstream sends `facets: {}`. Keep the previous options
        // so the user can still untick the filter that emptied the results.
        const hasFacets = Object.keys(page.facets).length > 0;
        if (hasFacets || !hasActiveFilters(query)) this.facets = page.facets;
        this.total = page.page.total;
        this.nextCursor = page.nextCursor;
        this.empty = page.empty ?? null;
        return true;
      } catch (error: any) {
        if (requestId !== this.requestId) return false;
        this.listings = [];
        this.facets = {};
        this.total = 0;
        this.nextCursor = null;
        this.empty = null;
        this.error = error?.data?.message || error?.statusMessage || "Something went wrong";
        return false;
      } finally {
        if (requestId === this.requestId) {
          this.loading = false;
          this.loaded = true;
        }
      }
    },

    /** Appends the next page of the current search. */
    async loadMore() {
      if (this.nextCursor === null || this.loadingMore || this.loading) return false;
      const requestId = this.requestId;
      try {
        this.loadingMore = true;

        const page = await this.fetchPage(this.query, this.nextCursor);
        if (requestId !== this.requestId) return false;

        this.listings.push(...page.listings);
        this.nextCursor = page.nextCursor;
        return true;
      } catch (error: any) {
        this.error = error?.data?.message || error?.statusMessage || "Something went wrong";
        return false;
      } finally {
        this.loadingMore = false;
      }
    },
  },

  getters: {
    hasMore: (state) => state.nextCursor !== null,
    brands: (state) => state.facets.brands ?? [],
    merchants: (state) => state.facets.merchants ?? [],
    conditions: (state) => state.facets.conditions ?? [],
  },
});
