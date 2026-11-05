import { defineStore } from "pinia";
import type { MarketplaceHome } from "~/models/marketplace_model";

// In-flight request per store instance (one store per SSR request / per browser tab), so
// concurrent callers — header nav + page — share one fetch. Not in state: promises can't
// be serialised, and a plain module variable would leak across SSR requests.
const inflight = new WeakMap<object, Promise<boolean>>();

export const useMarketplaceStore = defineStore("marketplaceStore", {
  state: () => ({
    home: null as MarketplaceHome | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    /**
     * Loads the home payload. It is also the only source of the category list
     * (used by the header nav), so it is skipped when already loaded unless `force`.
     */
    fetchHome(force = false): Promise<boolean> {
      if (this.home && !force) return Promise.resolve(true);

      const existing = inflight.get(this);
      if (existing) return existing;

      const request = (async () => {
        try {
          this.loading = true;
          this.error = null;

          const data = await $fetch<MarketplaceHome>("/api/marketplace/get_home");
          this.home = data;
          return true;
        } catch (error: any) {
          this.error = error?.data?.message || error?.statusMessage || "Something went wrong";
          return false;
        } finally {
          this.loading = false;
          inflight.delete(this);
        }
      })();

      inflight.set(this, request);
      return request;
    },
  },

  getters: {
    rails: (state) => state.home?.rails ?? [],
    categories: (state) => state.home?.categories ?? [],
    officialStores: (state) => state.home?.officialStores ?? [],
  },
});
