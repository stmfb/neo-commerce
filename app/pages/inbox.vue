<template>
  <div class="mx-auto max-w-[760px] px-4 py-6 sm:px-6">
    <Breadcrumb class="mb-4" :items="[{ label: 'Home', to: '/' }, { label: 'Inbox' }]" />
    <div class="mb-5 flex items-end justify-between gap-3">
      <h1 class="text-3xl font-bold font-display text-primary-dark">Inbox</h1>
      <NcButton v-if="signedIn && unreadCount > 0" variant="secondary" size="sm" @click="markRead()">Mark all as read</NcButton>
    </div>

    <EmptyState v-if="!signedIn" title="Sign in to see your updates" description="Order approvals, deliveries and repayment news land here.">
      <template #actions>
        <NcButton @click="requestSession">Sign in</NcButton>
      </template>
    </EmptyState>

    <ShimmerRegion v-else-if="showShimmer" label="Loading your inbox…">
      <div class="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
        <div v-for="n in 4" :key="n" class="space-y-2 p-4">
          <Shimmer class="h-4 w-40" />
          <Shimmer class="h-3 w-72 max-w-full" />
        </div>
      </div>
    </ShimmerRegion>

    <EmptyState v-else-if="!notifications" title="We couldn't load your inbox" description="Please refresh to try again." />

    <EmptyState
      v-else-if="notifications.length === 0"
      title="No updates yet"
      description="We'll let you know here when an order is approved, ships or is delivered."
    >
      <template #icon>
        <svg class="h-6 w-6" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 8.5a5 5 0 0110 0v3.2l1.3 2.3H3.7L5 11.7V8.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
          <path d="M8.2 16.5a1.9 1.9 0 003.6 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>
      </template>
    </EmptyState>

    <template v-else>
      <ul class="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
        <li v-for="item in notifications" :key="item.id">
          <component
            :is="item.orderId ? NuxtLink : 'button'"
            v-bind="item.orderId ? { to: `/orders/${item.orderId}` } : { type: 'button' }"
            class="flex w-full gap-3 p-4 text-left transition-colors hover:bg-slate-50"
            :class="item.read ? '' : 'bg-primary-50/60'"
            @click="open(item)"
          >
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" :class="item.read ? 'bg-transparent' : 'bg-primary-500'" aria-hidden="true" />
            <span class="min-w-0 flex-1">
              <span class="flex items-baseline justify-between gap-3">
                <span class="text-sm text-primary-dark-900" :class="item.read ? 'font-medium' : 'font-bold'">
                  {{ item.title }}
                  <span v-if="!item.read" class="sr-only">(unread)</span>
                </span>
                <time :datetime="item.createdAt" class="shrink-0 text-xs text-primary-dark-400">{{ formatTimeAgo(item.createdAt) }}</time>
              </span>
              <!-- Plain text from the API; pre-line keeps its line breaks without rendering HTML. -->
              <span class="mt-1 block whitespace-pre-line text-sm text-primary-dark-500">{{ item.body }}</span>
              <span v-if="item.orderId" class="mt-2 inline-block text-xs font-semibold text-primary-600">View order</span>
            </span>
          </component>
        </li>
      </ul>

      <div v-if="hasMore || error" class="mt-4 flex flex-col items-center gap-2">
        <NcButton v-if="hasMore" variant="secondary" size="sm" :loading="loadingMore" @click="inboxStore.loadMore()">
          {{ loadingMore ? "Loading more…" : "Load more" }}
        </NcButton>
        <p v-if="error" class="text-xs text-rose-600">{{ error }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, resolveComponent } from "vue";
import type { ApiNotification } from "~/models/inbox_model";

useHead({ title: "Inbox · NeoCash Marketplace" });

const NuxtLink = resolveComponent("NuxtLink");
const { signedIn, sessionVersion, requestSession } = useAuth();
const inboxStore = useInboxStore();
const { notifications, unreadCount, loading, loadingMore, error, hasMore } = storeToRefs(inboxStore);

// Signed-in data: the session cookie only reaches our API from the browser, so skip SSR.
await useAsyncData("inbox", () => inboxStore.fetchInbox(), { lazy: true, server: false, watch: [sessionVersion] });

// Shimmer until the first page is here or the request has failed.
const showShimmer = computed(() => !notifications.value && (loading.value || !error.value));

const markRead = (ids?: string[]) => inboxStore.markRead(ids);

/** Opening an update marks it read; one about an order also goes to that order. */
function open(item: ApiNotification) {
  if (!item.read) markRead([item.id]);
}
</script>
