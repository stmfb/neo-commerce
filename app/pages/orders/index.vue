<template>
  <div class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <Breadcrumb class="mb-4" :items="[{ label: 'Home', to: '/' }, { label: 'My orders' }]" />
    <h1 class="mb-5 text-3xl font-bold font-display text-primary-dark">My orders</h1>

    <EmptyState v-if="!signedIn" title="Sign in to see your orders" description="Your orders and repayments are linked to your NeoCash account.">
      <template #actions>
        <NcButton @click="requestSession">Sign in</NcButton>
      </template>
    </EmptyState>

    <ShimmerRegion v-else-if="showShimmer" label="Loading orders…">
      <div class="space-y-4">
        <div v-for="n in 3" :key="n" class="space-y-3 rounded-xl border border-line bg-white p-5">
          <Shimmer class="h-4 w-48" />
          <Shimmer class="h-3 w-64 max-w-full" />
          <div class="flex gap-2 pt-1">
            <Shimmer v-for="m in 3" :key="m" rounded="lg" class="h-9 w-9" />
          </div>
        </div>
      </div>
    </ShimmerRegion>

    <EmptyState v-else-if="!orders" title="We could not load your orders" description="Please refresh to try again." />

    <EmptyState
      v-else-if="orders.length === 0"
      title="Your orders will appear here"
      description="Every purchase, with tracking for each seller and one repayment schedule per order."
    >
      <template #icon>
        <svg class="h-6 w-6" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="4" width="14" height="13" rx="1.5" stroke="currentColor" stroke-width="1.4" />
          <path d="M3 8h14M7 4V2.5M13 4V2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>
      </template>
      <template #actions>
        <NcButton to="/">Start browsing</NcButton>
      </template>
    </EmptyState>

    <div v-else class="space-y-4">
      <OrderCard v-for="order in orders" :key="order.orderId" :order="order" />
      <div v-if="hasMore" class="flex flex-col items-center gap-2">
        <NcButton variant="secondary" size="sm" :loading="loadingMore" @click="loadMore()">
          {{ loadingMore ? "Loading more…" : "Load more" }}
        </NcButton>
        <p v-if="error" class="text-xs text-rose-600">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { signedIn, sessionVersion, requestSession } = useAuth();
const { orders, loading, loadingMore, error, hasMore, fetchOrders, loadMore } = useOrders();

// Signed-in data: the session cookie only reaches our API from the browser, so skip SSR.
await useAsyncData("orders", fetchOrders, { lazy: true, server: false, watch: [sessionVersion] });

// Shimmer until the first page is here or the request has failed.
const showShimmer = computed(() => !orders.value && (loading.value || !error.value));
</script>
