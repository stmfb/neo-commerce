<template>
  <div v-if="order" class="mx-auto max-w-[640px] px-4 py-10 sm:px-6">
    <div class="rounded-2xl border border-line bg-white p-6 text-center sm:p-8">
      <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg class="h-7 w-7" viewBox="0 0 20 20" fill="none">
          <path d="M4 10.5l4 4 8-8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>

      <template v-if="order.subOrders.length > 1">
        <h1 class="mt-5 text-2xl font-bold text-primary-dark-900">
          We've created {{ order.subOrders.length }} orders — one with each seller
        </h1>
        <p class="mt-2 text-sm text-primary-dark-400">
          You're on one plan of {{ formatNaira(order.monthlyAmount) }}/mo. Order {{ order.id }}.
        </p>

        <StatusBanner tone="dark" title="Three deliveries, one repayment" class="mt-6 text-left">
          <template #icon>
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M3 7l7-4 7 4-7 4-7-4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
              <path d="M3 7v6l7 4 7-4V7" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
            </svg>
          </template>
          Each seller ships on their own timeline. Your schedule starts when the first item arrives — not
          today.
        </StatusBanner>

        <div class="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line text-left">
          <div v-for="sub in order.subOrders" :key="sub.code" class="flex items-center justify-between gap-3 px-4 py-3">
            <div class="flex items-center gap-3">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" :class="tileColor(sub.merchantSlug)">
                {{ initials(sub.merchantSlug) }}
              </span>
              <div>
                <p class="text-sm font-semibold text-primary-dark-900">{{ sub.merchantName }}</p>
                <p class="text-xs text-primary-dark-400">{{ sub.itemsLabel }} · {{ sub.deliveryNote }}</p>
              </div>
            </div>
            <p class="text-sm font-semibold text-primary-dark-800">{{ formatNaira(sub.amount) }}</p>
          </div>
          <div class="flex items-center justify-between bg-slate-50 px-4 py-3">
            <p class="text-sm font-bold text-primary-dark-900">One plan · one authorisation</p>
            <p class="text-sm font-bold text-primary-dark-900">{{ formatNaira(order.totalRepayable) }}</p>
          </div>
        </div>
      </template>

      <template v-else>
        <h1 class="mt-5 text-2xl font-bold text-primary-dark-900">Your order is confirmed</h1>
        <p class="mt-2 text-sm text-primary-dark-400">
          Order {{ order.id }} · {{ order.subOrders[0].merchantName }} will deliver in
          {{ order.subOrders[0].deliveryNote.replace("Usually delivered in ", "") }}.
        </p>
        <div class="mt-5 rounded-lg bg-primary-50 px-4 py-3 text-left">
          <p class="text-sm font-bold text-primary-700">{{ formatNaira(order.monthlyAmount) }}/mo, starting after delivery</p>
          <p class="mt-0.5 text-xs text-primary-600">First instalment is scheduled once your item arrives, not today.</p>
        </div>
      </template>

      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <NcButton :to="`/orders/${order.id}`" size="lg">View order{{ order.subOrders.length > 1 ? "s" : "" }}</NcButton>
        <NcButton to="/" variant="secondary" size="lg">Keep shopping</NcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getMerchant } from "~/data/merchants";

definePageMeta({ layout: "checkout" });

const route = useRoute();
const { getOrder } = useOrders();

const order = computed(() => getOrder(route.query.order as string));

function initials(slug: string) {
  return getMerchant(slug)?.initials ?? "";
}
function tileColor(slug: string) {
  return getMerchant(slug)?.tileColor ?? "bg-primary-dark-700";
}
</script>
