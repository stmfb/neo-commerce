import { defineStore } from "pinia";
import type { ApiListing, MerchantPage } from "~/models/marketplace_model";

const PAGE_SIZE = 20;

type MerchantProfile = Omit<MerchantPage, "listings" | "page" | "nextCursor">;

export const useMerchantStore = defineStore("merchantStore", {
  state: () => ({
    merchant: null as MerchantProfile | null,
    listings: [] as ApiListing[],
    total: 0,
    nextCursor: null as string | null,
    loading: false,
    loadingMore: false,
    error: null as string | null,
    errorStatus: null as number | null,
  }),

  actions: {
    fetchPage(id: string, cursor?: string) {
      return $fetch<MerchantPage>(`/api/merchant/${encodeURIComponent(id)}`, {
        params: { limit: PAGE_SIZE, cursor },
      });
    },

    /** Loads a merchant's profile and first page of listings. */
    async fetchMerchant(id: string) {
      // Already loaded (e.g. hydrated from SSR) — skip the round trip.
      if (this.merchant?.id === id) return true;

      try {
        this.loading = true;
        this.error = null;
        this.errorStatus = null;
        this.merchant = null;
        this.listings = [];

        const { listings, page, nextCursor, ...profile } = await this.fetchPage(id);
        this.merchant = profile;
        this.listings = listings;
        this.total = page.total;
        this.nextCursor = nextCursor;
        return true;
      } catch (error: any) {
        this.errorStatus = error?.statusCode ?? error?.status ?? null;
        this.error = error?.data?.message || error?.statusMessage || "Something went wrong";
        return false;
      } finally {
        this.loading = false;
      }
    },

    /** Appends the merchant's next page of listings. */
    async loadMore() {
      if (!this.merchant || this.nextCursor === null || this.loadingMore) return false;
      try {
        this.loadingMore = true;

        const page = await this.fetchPage(this.merchant.id, this.nextCursor);
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
    isLive: (state) => state.merchant?.status === "live",
  },
});
