<template>
  <div class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <Breadcrumb class="mb-4" :items="[{ label: 'Home', to: '/' }, { label: 'Cart' }]" />

    <h1 class="text-2xl font-bold text-primary-dark-900">
      Your cart <span class="font-normal text-primary-dark-400">{{ itemCount }} items from {{ sellerCount }} sellers</span>
    </h1>

    <EmptyState
      v-if="isEmpty"
      class="mt-6"
      title="Your cart is empty"
      description="Find something you can pay for small small. You can mix sellers freely — it's still one plan."
    >
      <template #icon>
        <svg class="h-6 w-6" viewBox="0 0 20 20" fill="none">
          <path d="M4 6h12l-1 9a2 2 0 01-2 1.8H7A2 2 0 015 15L4 6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
          <path d="M7 6V4.5A2.5 2.5 0 019.5 2h1A2.5 2.5 0 0113 4.5V6" stroke="currentColor" stroke-width="1.4" />
        </svg>
      </template>
      <template #actions>
        <NcButton to="/" size="md">Start browsing</NcButton>
      </template>
    </EmptyState>

    <template v-else>
      <StatusBanner v-if="sellerCount > 1" tone="dark" title="Three sellers, one plan" class="mb-6 mt-5">
        <template #icon>
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
            <path d="M3 7l7-4 7 4-7 4-7-4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
            <path d="M3 7v6l7 4 7-4V7" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
          </svg>
        </template>
        You'll authorise once and repay once. We split the order between the sellers behind the scenes —
        you don't choose how.
      </StatusBanner>

      <div class="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div class="overflow-hidden rounded-xl border border-line bg-white">
          <CartMerchantGroup
            v-for="group in groups"
            :key="group.merchantSlug"
            :group="group"
            @update-qty="updateQty"
            @remove="removeItem"
            @save-for-later="removeItem"
          />
        </div>

        <OrderSummary
          :item-count="itemCount"
          :subtotal="subtotal"
          :lowest-monthly="lowestMonthly"
          :seller-count="sellerCount"
          cta-to="/checkout/plan"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getPlanQuote } from "~/utils/quote";

const { groups, itemCount, sellerCount, subtotal, isEmpty, updateQty, removeItem } = useCart();

const lowestMonthly = computed(() => {
  if (subtotal.value === 0) return 0;
  return getPlanQuote(subtotal.value)[2].monthly;
});
</script>
