import { defineStore } from "pinia";
import type { ApiDirectory } from "~/models/marketplace_model";

export const useDirectoryStore = defineStore("directoryStore", {
  state: () => ({
    groups: [] as ApiDirectory["groups"],
    loaded: false,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchDirectory() {
      // Already loaded (e.g. hydrated from SSR) — skip the round trip.
      if (this.loaded) return true;
      try {
        this.loading = true;
        this.error = null;
        this.groups = (await $fetch<ApiDirectory>("/api/merchant")).groups;
        this.loaded = true;
        return true;
      } catch (error: any) {
        this.error = apiError(error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
