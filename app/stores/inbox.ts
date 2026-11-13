import { defineStore } from "pinia";
import type { ApiNotification, ApiNotifications } from "~/models/inbox_model";

/** The header's unread count re-checks at most this often as the shopper moves around. */
const UNREAD_REFRESH_MS = 60_000;

/** The shopper's inbox. Signed-in only, so it loads in the browser. */
export const useInboxStore = defineStore("inbox", {
  state: () => ({
    /** null until the first page has loaded. */
    notifications: null as ApiNotification[] | null,
    unreadCount: 0,
    nextCursor: null as string | null,
    loading: false,
    loadingMore: false,
    error: null as string | null,
    /** When the unread count was last fetched, to throttle re-checks. */
    checkedAt: 0,
  }),

  getters: {
    hasMore: (state) => state.nextCursor !== null,
  },

  actions: {
    reset() {
      this.notifications = null;
      this.unreadCount = 0;
      this.nextCursor = null;
      this.error = null;
      this.checkedAt = 0;
    },

    /** Loads the first page. */
    async fetchInbox() {
      const auth = useAuthStore();
      if (!auth.signedIn) {
        this.reset();
        auth.requestSession();
        return false;
      }
      try {
        this.loading = true;
        this.error = null;
        const page = await $fetch<ApiNotifications>("/api/me/notifications");
        this.notifications = page.notifications;
        this.nextCursor = page.page.nextCursor ?? null;
        this.unreadCount = page.unreadCount;
        this.checkedAt = Date.now();
        return true;
      } catch (error) {
        const { status, message } = apiError(error);
        if (status === 401) auth.requestSession();
        this.error = message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    /** Appends the next page. */
    async loadMore() {
      if (!this.notifications || this.nextCursor === null || this.loadingMore) return false;
      try {
        this.loadingMore = true;
        this.error = null;
        const page = await $fetch<ApiNotifications>("/api/me/notifications", { params: { cursor: this.nextCursor } });
        this.notifications.push(...page.notifications);
        this.nextCursor = page.page.nextCursor ?? null;
        this.unreadCount = page.unreadCount;
        return true;
      } catch (error) {
        this.error = apiError(error).message;
        return false;
      } finally {
        this.loadingMore = false;
      }
    },

    /**
     * Refreshes the header's unread count, at most once a minute unless `force`. A background
     * check: failures (even a 401) are left for the shopper's next real action to surface.
     */
    async refreshUnread(force = false) {
      if (!useAuthStore().signedIn) {
        this.reset();
        return false;
      }
      if (!force && Date.now() - this.checkedAt < UNREAD_REFRESH_MS) return true;
      this.checkedAt = Date.now();
      try {
        const page = await $fetch<ApiNotifications>("/api/me/notifications");
        this.unreadCount = page.unreadCount;
        // An inbox showing only its first page can take the fresh one as is.
        if (this.notifications && this.nextCursor === (page.page.nextCursor ?? null) && !this.loadingMore) {
          this.notifications = page.notifications;
        }
        return true;
      } catch {
        return false;
      }
    },

    /**
     * Marks the given updates read, or all of them without `ids`. The list and badge change
     * at once and roll back if the call fails.
     */
    async markRead(ids?: string[]) {
      const targets = ids ? new Set(ids) : null;
      const changed = (this.notifications ?? []).filter((n) => !n.read && (!targets || targets.has(n.id)));
      if (targets && !changed.length) return true;

      const previousCount = this.unreadCount;
      for (const n of changed) n.read = true;
      this.unreadCount = targets ? Math.max(0, this.unreadCount - changed.length) : 0;

      try {
        const page = await $fetch<ApiNotifications>("/api/me/notifications/read", { method: "POST", body: { ids: ids ?? [] } });
        this.unreadCount = page.unreadCount;
        this.checkedAt = Date.now();
        return true;
      } catch (error) {
        for (const n of changed) n.read = false;
        this.unreadCount = previousCount;
        const { status, message } = apiError(error);
        if (status === 401) useAuthStore().requestSession();
        this.error = message;
        return false;
      }
    },
  },
});
