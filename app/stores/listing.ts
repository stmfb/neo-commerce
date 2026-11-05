import { defineStore } from "pinia";
import type { ApiListingDetail } from "~/models/marketplace_model";

export const useListingStore = defineStore("listingStore", {
  state: () => ({
    listing: null as ApiListingDetail | null,
    loading: false,
    error: null as string | null,
    /** HTTP status of the last failure, so pages can tell "not found" from "broken". */
    errorStatus: null as number | null,
  }),

  actions: {
    async fetchListing(id: string) {
      // Already loaded (e.g. hydrated from SSR) — skip the round trip.
      if (this.listing?.listingId === id) return true;

      try {
        this.loading = true;
        this.error = null;
        this.errorStatus = null;
        this.listing = null;

        this.listing = await $fetch<ApiListingDetail>(`/api/listing/${encodeURIComponent(id)}`);
        return true;
      } catch (error: any) {
        this.errorStatus = error?.statusCode ?? error?.status ?? null;
        this.error = error?.data?.message || error?.statusMessage || "Something went wrong";
        return false;
      } finally {
        this.loading = false;
      }
    },
  },

  getters: {
    merchant: (state) => state.listing?.merchant ?? null,
    variants: (state) => state.listing?.variants ?? [],
    gallery: (state) => {
      const l = state.listing;
      if (!l) return [];
      if (l.gallery?.length) return l.gallery;
      return l.image ? [l.image] : [];
    },
  },
});
