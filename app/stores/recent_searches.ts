import { defineStore } from "pinia";

const MAX_RECENT = 6;

/** The shopper's last few searches, newest first. Saved in localStorage, on this device only. */
export const useRecentSearchesStore = defineStore("recentSearches", {
  state: () => ({
    terms: [] as string[],
  }),

  actions: {
    add(term: string) {
      const clean = term.trim().replace(/\s+/g, " ");
      if (!clean) return;
      const key = normaliseSearchTerm(clean);
      this.terms = [clean, ...this.terms.filter((t) => normaliseSearchTerm(t) !== key)].slice(0, MAX_RECENT);
    },

    clear() {
      this.terms = [];
    },
  },

  persist: true,
});
