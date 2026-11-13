import { defineStore } from "pinia";
import type { ApiOrderDetail, ApiOrderSummary, ApiOrders } from "~/models/orders_model";

/** The shopper's orders. Signed-in only, so pages load them in the browser. */
export const useOrdersStore = defineStore("orders", {
  state: () => ({
    /** null until the first page has loaded. */
    orders: null as ApiOrderSummary[] | null,
    nextCursor: null as string | null,
    order: null as ApiOrderDetail | null,
    loading: false,
    loadingMore: false,
    error: null as string | null,
    errorStatus: null as number | null,
  }),

  actions: {
    /** Records a failed load; a 401 means the session is gone, so ask the app for one. */
    fail(error: unknown) {
      const { status, message } = apiError(error);
      if (status === 401) useAuthStore().requestSession();
      this.error = message;
      this.errorStatus = status;
      return false;
    },

    /** Loads the first page of orders. */
    async fetchOrders() {
      if (!useAuthStore().signedIn) {
        useAuthStore().requestSession();
        return false;
      }
      try {
        this.loading = true;
        this.error = null;
        this.errorStatus = null;
        this.orders = null;

        const { orders, page } = await $fetch<ApiOrders>("/api/orders");
        this.orders = orders;
        this.nextCursor = page.nextCursor ?? null;
        return true;
      } catch (error) {
        return this.fail(error);
      } finally {
        this.loading = false;
      }
    },

    /** Appends the next page of orders. */
    async loadMore() {
      if (!this.orders || this.nextCursor === null || this.loadingMore) return false;
      try {
        this.loadingMore = true;
        this.error = null;

        const { orders, page } = await $fetch<ApiOrders>("/api/orders", { params: { cursor: this.nextCursor } });
        this.orders.push(...orders);
        this.nextCursor = page.nextCursor ?? null;
        return true;
      } catch (error) {
        return this.fail(error);
      } finally {
        this.loadingMore = false;
      }
    },

    /** Loads one order's detail. */
    async fetchOrder(id: string) {
      if (!useAuthStore().signedIn) {
        useAuthStore().requestSession();
        return false;
      }
      try {
        this.loading = true;
        this.error = null;
        this.errorStatus = null;
        this.order = null;

        this.order = await $fetch<ApiOrderDetail>(`/api/orders/${encodeURIComponent(id)}`);
        return true;
      } catch (error) {
        return this.fail(error);
      } finally {
        this.loading = false;
      }
    },

    /** Confirms a dispatched sub-order arrived, with the shopper's PIN. The caller shows any error. */
    async confirmDelivery(orderId: string, subOrderId: string, pin: string): Promise<{ ok: boolean; message?: string }> {
      try {
        const path = `/api/orders/${encodeURIComponent(orderId)}/sub-orders/${encodeURIComponent(subOrderId)}/confirm-delivery`;
        this.order = await $fetch<ApiOrderDetail>(path, { method: "POST", body: { pin } });
        return { ok: true };
      } catch (error) {
        const { status, message } = apiError(error);
        if (status === 401) useAuthStore().requestSession();
        return { ok: false, message };
      }
    },
  },

  getters: {
    hasMore: (state) => state.nextCursor !== null,
  },
});
