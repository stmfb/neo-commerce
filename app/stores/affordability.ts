import { defineStore } from "pinia";
import type { ApiAffordability } from "~/models/marketplace_model";

/** Used until /me/affordability answers (or if it fails). Matches the API's current defaults. */
const FALLBACK = { minKobo: 500_000, maxKobo: 50_000_000, stepKobo: 500_000 };

/** Cookie (not localStorage) so SSR renders the same budget the browser shows — no flicker. */
const BUDGET_COOKIE = "nc_budget";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Read once when the store is created (always inside setup, so Nuxt context is available). */
const readBudgetCookie = () => {
  const value = useCookie<number | null>(BUDGET_COOKIE, { default: () => null }).value;
  return typeof value === "number" && value > 0 ? value : null;
};

/**
 * Written directly: budget changes come from browser event handlers / debounced timers,
 * where Nuxt composables like useCookie aren't reliably available.
 */
function writeBudgetCookie(kobo: number | null) {
  if (!import.meta.client) return;
  document.cookie =
    kobo === null
      ? `${BUDGET_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`
      : `${BUDGET_COOKIE}=${kobo}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
}

export const useAffordabilityStore = defineStore("affordabilityStore", {
  state: () => ({
    data: null as ApiAffordability | null,
    /** Monthly budget the shopper picked, in kobo. `null` = no budget filter. */
    budgetKobo: readBudgetCookie(),
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAffordability(force = false) {
      if (this.data && !force) return true;
      try {
        this.loading = true;
        this.error = null;
        this.data = await $fetch<ApiAffordability>("/api/me/affordability");
        // Keep a saved budget inside the (possibly new) slider range. State only: after an
        // `await` there's no Nuxt context, so the cookie can't be touched here.
        if (this.budgetKobo !== null) this.budgetKobo = this.normalise(this.budgetKobo);
        return true;
      } catch (error: any) {
        this.error = error?.data?.message || error?.statusMessage || "Something went wrong";
        return false;
      } finally {
        this.loading = false;
      }
    },

    /** Snaps to the slider step and range; the very top of an open range means "no budget". */
    normalise(kobo: number | null): number | null {
      if (kobo === null) return null;
      let next = Math.ceil(kobo / this.stepKobo) * this.stepKobo;
      next = Math.min(Math.max(next, this.minKobo), this.maxKobo);
      return next >= this.maxKobo && !this.known ? null : next;
    },

    /**
     * Sets (or clears, with `null`) the monthly budget used across header, home, category and
     * search. Call from user actions (event handlers), not after an `await`.
     */
    setBudget(kobo: number | null) {
      const next = this.normalise(kobo);
      this.budgetKobo = next;
      writeBudgetCookie(next);
    },

    clearBudget() {
      this.setBudget(null);
    },
  },

  getters: {
    known: (state) => state.data?.known === true,
    /** Shopper's approved monthly limit in kobo, when the API knows it. */
    limitKobo: (state): number | null =>
      state.data?.known === true ? (state.data.monthlyLimitKobo ?? null) : null,

    minKobo: (state) => state.data?.sliderMinKobo ?? FALLBACK.minKobo,
    stepKobo: (state) => state.data?.sliderStepKobo ?? FALLBACK.stepKobo,
    maxKobo(state): number {
      return this.limitKobo ?? state.data?.sliderMaxKobo ?? FALLBACK.maxKobo;
    },
    guidance: (state) =>
      state.data?.guidanceCopy ?? "Pick a monthly amount. You'll get your limit at checkout.",

    /** What results are capped at: the picked budget, else the known limit, else nothing. */
    capKobo(state): number | null {
      return state.budgetKobo ?? this.limitKobo;
    },

    // Naira versions for the UI (product prices in the app are in naira).
    budget: (state) => (state.budgetKobo === null ? null : koboToNaira(state.budgetKobo)),
    cap(): number | null {
      return this.capKobo === null ? null : koboToNaira(this.capKobo);
    },
    limit(): number | null {
      return this.limitKobo === null ? null : koboToNaira(this.limitKobo);
    },
    slider(): { min: number; max: number; step: number } {
      return { min: koboToNaira(this.minKobo), max: koboToNaira(this.maxKobo), step: koboToNaira(this.stepKobo) };
    },
  },
});
