import { defineStore } from "pinia";
import type { ApiCart } from "~/models/cart_model";

/** Outcome of a cart change, for the button or row that made it. */
export interface CartResult {
  ok: boolean;
  code?: string | null;
  message?: string;
}

/** The shopper's cart lives on the server; every call returns the whole cart. */
export const useCartStore = defineStore("cart", {
  state: () => ({
    cart: null as ApiCart | null,
    loading: false,
    /** Number of cart changes in flight. */
    mutating: 0,
    error: null as string | null,
    errorCode: null as string | null,
    /** Guards against an older, slower response overwriting a newer cart. */
    requestId: 0,
    /**
     * The item added for the shopper straight after they signed in (they'd tapped "Add to
     * cart" while signed out), so its product page can say how that went.
     */
    addedAfterSignIn: null as { listingId: string; status: "adding" | "added" | "failed"; message?: string } | null,
  }),

  actions: {
    /** Runs one cart call and keeps its result unless a newer call has started since. */
    async run(call: () => Promise<ApiCart>, mutation = true): Promise<CartResult> {
      const requestId = ++this.requestId;
      try {
        if (mutation) this.mutating++;
        else this.loading = true;
        this.error = null;
        this.errorCode = null;

        const cart = await call();
        if (requestId === this.requestId) this.cart = cart;
        return { ok: true };
      } catch (error: any) {
        const { status, code, message } = apiError(error);
        if (status === 401) {
          this.cart = null;
          // A loading cart (the header's badge, on every page) mustn't send the shopper to sign in.
          if (mutation) useAuthStore().requestSession();
          else useAuthStore().sessionExpired();
        }
        // The cart changed elsewhere (another tab, a checkout): show the latest.
        if (code === "cart_version_conflict") await this.fetchCart();
        this.error = message;
        this.errorCode = code;
        return { ok: false, code, message };
      } finally {
        if (mutation) this.mutating--;
        else this.loading = false;
      }
    },

    fetchCart() {
      if (!useAuthStore().signedIn) {
        this.cart = null;
        return Promise.resolve<CartResult>({ ok: false, code: "unauthorized" });
      }
      return this.run(() => $fetch<ApiCart>("/api/cart"), false);
    },

    /** Re-checks prices and stock before checkout. */
    revalidate() {
      return this.run(() => $fetch<ApiCart>("/api/cart/revalidate", { method: "POST" }), false);
    },

    addItem(listingId: string, variantId: string | undefined, quantity: number) {
      return this.run(() =>
        $fetch<ApiCart>("/api/cart/items", { method: "POST", body: { listingId, variantId, quantity } }),
      );
    },

    /** Adds the item a signed-out shopper tapped "Add to cart" on, now that they're signed in. */
    async addPendingItem() {
      const pending = readPendingCartAdd();
      if (!pending || !useAuthStore().signedIn) return;
      // Once only, even if it fails: the product page shows why, and they can tap again.
      clearPendingCartAdd();
      this.addedAfterSignIn = { listingId: pending.listingId, status: "adding" };
      const result = await this.addItem(pending.listingId, pending.variantId, pending.quantity);
      this.addedAfterSignIn = result.ok
        ? { listingId: pending.listingId, status: "added" }
        : { listingId: pending.listingId, status: "failed", message: result.message ?? "We couldn't add it to your cart." };
      // Signing in also starts the header's cart load, which may answer last; show the cart as it is now.
      if (result.ok) await this.fetchCart();
    },

    updateQty(cartItemId: string, quantity: number) {
      if (quantity < 1) return this.removeItem(cartItemId);
      return this.run(() =>
        $fetch<ApiCart>(`/api/cart/items/${encodeURIComponent(cartItemId)}`, { method: "PATCH", body: { quantity } }),
      );
    },

    removeItem(cartItemId: string) {
      return this.run(() => $fetch<ApiCart>(`/api/cart/items/${encodeURIComponent(cartItemId)}`, { method: "DELETE" }));
    },

    /** Accepts the price and stock changes revalidation found, dropping any unavailable items. */
    acceptChanges() {
      const revalidation = this.cart?.revalidation;
      if (!this.cart || !revalidation?.revalidationId) return Promise.resolve<CartResult>({ ok: true });
      const body = {
        revalidationId: revalidation.revalidationId,
        cartVersion: this.cart.version,
        removeItemIds: this.flaggedItemIds,
      };
      return this.run(() => $fetch<ApiCart>("/api/cart/revalidation/ack", { method: "POST", body }));
    },
  },

  getters: {
    groups: (state) => state.cart?.groups ?? [],
    itemCount: (state) => state.cart?.total.itemCount ?? 0,
    sellerCount: (state) => state.cart?.groups.length ?? 0,
    totalKobo: (state) => state.cart?.total.totalKobo ?? 0,
    isEmpty: (state) => !state.cart?.groups.length,
    violations: (state) => state.cart?.violations ?? [],
    /** Changes found by the last re-check that the shopper hasn't accepted yet. */
    changes: (state) => (state.cart?.revalidation?.valid === false ? (state.cart.revalidation.changes ?? []) : []),
    flaggedItemIds: (state) =>
      (state.cart?.groups ?? []).flatMap((g) => g.items.filter((i) => i.flaggedForRemoval).map((i) => i.cartItemId)),
    /** Nothing stops checkout: no unaccepted changes, no broken basket limit. */
    canCheckout(state): boolean {
      return Boolean(state.cart?.groups.length) && !this.changes.length && !this.violations.length;
    },
  },
});
