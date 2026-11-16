import { defineStore } from "pinia";
import type { ApiCart } from "~/models/cart_model";
import type {
  AcknowledgeBody,
  AddressInput,
  ApiAddress,
  ApiAuthoriseResult,
  ApiBankLink,
  ApiCheckoutStatus,
  ApiDisclosures,
  ApiQuote,
  ApiTransferDetails,
  ApiValidatedAddress,
  EmploymentBody,
} from "~/models/checkout_model";

/** Outcome of a checkout call, for the page that made it. */
export interface CheckoutResult<T = unknown> {
  ok: boolean;
  data?: T;
  code?: string | null;
  message?: string;
  fields?: Record<string, string>;
}

/** Runs one call. A 401 means the session is gone (a failed biometric is 401 `auth_failed`). */
async function call<T>(fn: () => Promise<T>): Promise<CheckoutResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error: any) {
    const { status, code, message, fields } = apiError(error);
    if (status === 401 && code !== "auth_failed") useAuthStore().requestSession();
    return { ok: false, code, message, fields };
  }
}

/** One checkout, from quote to result. Every figure comes from the API; the PIN is never kept here. */
export const useCheckoutStore = defineStore("checkout", {
  state: () => ({
    quote: null as ApiQuote | null,
    /** Cart version the quote was taken at. */
    cartVersion: null as number | null,
    planCode: "",
    addressId: "",
    addresses: [] as ApiAddress[],
    disclosures: null as ApiDisclosures | null,
    /** Where to send the upfront payment, once authorised. */
    transfer: null as ApiTransferDetails | null,
    status: null as ApiCheckoutStatus | null,
  }),

  getters: {
    checkoutId: (state) => state.quote?.checkoutId ?? "",
    plan: (state) => state.quote?.plans.find((p) => p.planCode === state.planCode) ?? null,
    address: (state) => state.addresses.find((a) => a.id === state.addressId) ?? null,
    sellerCount: (state) => state.quote?.summary.length ?? 0,
  },

  actions: {
    /** Quotes the cart, reusing a live, eligible quote for the same cart unless `fresh`. Keeps the chosen plan if still offered. */
    async startQuote(cart: ApiCart, fresh = false): Promise<CheckoutResult<ApiQuote>> {
      const q = this.quote;
      if (!fresh && q?.eligible && this.cartVersion === cart.version && new Date(q.expiresAt) > new Date()) {
        return { ok: true, data: q };
      }

      const planCode = this.planCode;
      this.$patch({ quote: null, cartVersion: null, planCode: "", disclosures: null, transfer: null, status: null });
      const res = await call(() =>
        $fetch<ApiQuote>("/api/checkout", { method: "POST", body: { cartId: cart.cartId, cartVersion: cart.version } }),
      );
      const quote = res.data;
      if (quote) {
        this.quote = quote;
        this.cartVersion = cart.version;
        const offered = quote.plans.some((p) => p.planCode === planCode);
        this.planCode = offered ? planCode : (quote.defaultPlanCode ?? quote.plans[0]?.planCode ?? "");
      }
      return res;
    },

    /** After `quote_expired`: re-quotes the latest cart. */
    async requote(): Promise<CheckoutResult<ApiQuote>> {
      const cart = useCartStore();
      await cart.fetchCart();
      if (!cart.cart) return { ok: false, message: cart.error ?? "We couldn't load your cart." };
      return this.startQuote(cart.cart, true);
    },

    async fetchAddresses() {
      const res = await call(() => $fetch<ApiAddress[]>("/api/me/addresses"));
      if (res.data) {
        this.addresses = res.data;
        if (!this.address?.serviceable) this.addressId = res.data.find((a) => a.serviceable)?.id ?? "";
      }
      return res;
    },

    /** Saves a new address and selects it if we deliver there. */
    async addAddress(input: AddressInput) {
      const res = await call(() => $fetch<ApiValidatedAddress>("/api/addresses/validate", { method: "POST", body: input }));
      if (res.data) {
        const { check, ...address } = res.data;
        this.addresses.unshift(address);
        if (check.serviceable) this.addressId = address.id;
      }
      return res;
    },

    async fetchDisclosures() {
      this.disclosures = null;
      const res = await call(() =>
        $fetch<ApiDisclosures>(`/api/checkout/${this.checkoutId}/disclosures`, { params: { planCode: this.planCode } }),
      );
      if (res.data) this.disclosures = res.data;
      return res;
    },

    /** Records the plan, the address and both disclosures at the versions shown. */
    acknowledge(): Promise<CheckoutResult> {
      const d = this.disclosures;
      if (!d) return Promise.resolve({ ok: false, code: "disclosures_missing" });
      const acceptedAt = new Date().toISOString();
      const body: AcknowledgeBody = {
        planCode: this.planCode,
        addressId: this.addressId,
        acknowledgements: [d.sellerLiability, d.creditAgreement].map((x) => ({ disclosureId: x.id, version: x.version, acceptedAt })),
      };
      return call(() => $fetch(`/api/checkout/${this.checkoutId}/acknowledgements`, { method: "POST", body }));
    },

    /** The page keeps the PIN in memory and passes it on every call, since each one checks it. */
    async authorise(pin: string) {
      const res = await call(() =>
        $fetch<ApiAuthoriseResult>(`/api/checkout/${this.checkoutId}/authorise`, {
          method: "POST",
          body: { planCode: this.planCode, pin },
        }),
      );
      const state = res.data?.state;
      if (res.data?.transfer) this.transfer = res.data.transfer;
      // A placed order empties the cart.
      if (state === "pending" || state === "success") useCartStore().fetchCart();
      return res;
    },

    submitEmployment(body: EmploymentBody): Promise<CheckoutResult> {
      return call(() => $fetch(`/api/checkout/${this.checkoutId}/employment`, { method: "POST", body }));
    },

    linkBank() {
      return call(() => $fetch<ApiBankLink>(`/api/checkout/${this.checkoutId}/bank-link`, { method: "POST" }));
    },

    async fetchStatus() {
      const res = await call(() => $fetch<ApiCheckoutStatus>(`/api/checkout/${this.checkoutId}/status`));
      if (res.data) this.status = res.data;
      return res;
    },
  },

  // Survives a reload, e.g. when the shopper leaves for their bank app to make the transfer.
  persist: { pick: ["quote", "cartVersion", "planCode", "addressId", "transfer"] },
});
