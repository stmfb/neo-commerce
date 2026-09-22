<template>
  <div class="sticky top-28 rounded-xl border border-line bg-white p-5">
    <p class="text-sm font-bold text-primary-dark-900">Order summary</p>

    <div class="mt-4 space-y-2 text-sm">
      <div class="flex items-center justify-between text-primary-dark-500">
        <span>Items ({{ itemCount }})</span>
        <span>{{ formatNaira(subtotal) }}</span>
      </div>
      <div class="flex items-center justify-between text-primary-dark-500">
        <span>Tax</span>
        <span>Included</span>
      </div>
      <div class="flex items-center justify-between border-t border-line pt-2 font-bold text-primary-dark-900">
        <span>Basket total</span>
        <span>{{ formatNaira(subtotal) }}</span>
      </div>
    </div>

    <div class="mt-4 rounded-lg bg-primary-50 px-3 py-2.5">
      <p class="text-xs font-semibold text-primary-700">
        One plan, from {{ formatNaira(lowestMonthly) }}/mo
      </p>
      <p class="mt-0.5 text-xs text-primary-600">Covers all {{ sellerCount }} sellers shown on this screen.</p>
    </div>

    <NcButton :to="ctaTo" variant="primary" size="lg" block class="mt-4" :disabled="disabled">
      {{ ctaLabel }}
    </NcButton>

    <p class="mt-3 text-xs text-primary-dark-400">
      We'll re-check prices and stock before you pay. Each seller ships on their own timeline. This
      total is for the whole basket.
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    itemCount: number;
    subtotal: number;
    lowestMonthly: number;
    sellerCount: number;
    ctaLabel?: string;
    ctaTo?: string;
    disabled?: boolean;
  }>(),
  { ctaLabel: "Proceed to checkout", disabled: false },
);
</script>
