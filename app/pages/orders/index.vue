<template>
  <div class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <Breadcrumb class="mb-4" :items="[{ label: 'Home', to: '/' }, { label: 'My orders' }]" />
    <h1 class="mb-5 text-2xl font-bold text-primary-dark-900">My orders</h1>

    <EmptyState
      v-if="orders.length === 0"
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

    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div class="space-y-4">
        <OrderCard v-for="order in orders" :key="order.id" :order="order" />
      </div>

      <aside v-if="activeOrder" class="h-fit rounded-xl border border-line bg-white p-5">
        <p class="text-sm font-bold text-primary-dark-900">Next payment</p>
        <p class="mt-2 text-2xl font-bold text-primary-dark-900">{{ formatNaira(activeOrder.monthlyAmount) }}</p>
        <p class="mt-1 text-xs text-primary-dark-400">Due next month · Order {{ activeOrder.id }}</p>
        <p class="mt-3 rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-700">
          You have {{ order2Count }} active order{{ order2Count > 1 ? "s" : "" }} on a Pay Small Small plan.
        </p>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { orders } = useOrders();

const activeOrder = computed(() => orders.value.find((order) => order.status === "partly-delivered"));
const order2Count = computed(() => orders.value.filter((order) => order.status === "partly-delivered").length);
</script>
