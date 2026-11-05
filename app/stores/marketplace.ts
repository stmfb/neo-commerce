import { defineStore } from "pinia";
import type { MarketplaceHome } from "~/models/marketplace_model";

export const useMarketplaceStore = defineStore("marketplaceStore", {
  state: () => ({
    home: null as MarketplaceHome | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchHome() {
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
      }
    },
  },

  getters: {
    rails: (state) => state.home?.rails ?? [],
    categories: (state) => state.home?.categories ?? [],
    officialStores: (state) => state.home?.officialStores ?? [],
  },
});
