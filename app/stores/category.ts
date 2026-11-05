import { defineStore } from "pinia";
import type {
  ApiBreadcrumbItem,
  ApiCategoryFacets,
  ApiListing,
  CategoryListingsPage,
  ListingSort,
} from "~/models/marketplace_model";

const PAGE_SIZE = 20;

export const useCategoryStore = defineStore("categoryStore", {
  state: () => ({
    slug: "",
    sort: "relevance" as ListingSort,
    listings: [] as ApiListing[],
    breadcrumb: [] as ApiBreadcrumbItem[],
    facets: null as ApiCategoryFacets | null,
    total: 0,
    nextCursor: null as number | null,
    loading: false,
    loadingMore: false,
    error: null as string | null,
  }),

  actions: {
    fetchPage(cursor: number) {
      return $fetch<CategoryListingsPage>(`/api/category/${encodeURIComponent(this.slug)}`, {
        params: { sort: this.sort, limit: PAGE_SIZE, cursor },
      });
    },

    /** Loads the first page of a category, replacing whatever was loaded before. */
    async fetchListings(slug: string, sort: ListingSort = "relevance") {
      try {
        this.slug = slug;
        this.sort = sort;
        this.loading = true;
        this.error = null;

        const page = await this.fetchPage(0);
        this.listings = page.listings;
        this.breadcrumb = page.breadcrumb;
        this.facets = page.facets;
        this.total = page.page.total;
        this.nextCursor = page.nextCursor;
        return true;
      } catch (error: any) {
        this.listings = [];
        this.nextCursor = null;
        this.error = error?.data?.message || error?.statusMessage || "Something went wrong";
        return false;
      } finally {
        this.loading = false;
      }
    },

    /** Appends the next page to `listings`. */
    async loadMore() {
      if (this.nextCursor === null || this.loadingMore) return false;
      try {
        this.loadingMore = true;

        const page = await this.fetchPage(this.nextCursor);
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
    categoryName: (state) => state.breadcrumb.at(-1)?.label ?? null,
  },
});
