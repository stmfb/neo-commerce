<template>
  <div class="sticky top-28 rounded-xl border border-line bg-white p-5">
    <p class="text-sm font-bold text-primary-dark-900">Order summary</p>

    <div class="mt-4 space-y-2 text-sm">
      <div class="flex items-center justify-between text-primary-dark-500">
        <span>Items ({{ total.itemCount }})</span>
        <span>{{ formatKobo(total.itemsKobo) }}</span>
      </div>
      <div class="flex items-center justify-between text-primary-dark-500">
        <span>Tax</span>
        <span>{{ total.taxKobo ? formatKobo(total.taxKobo) : "Included" }}</span>
      </div>
      <div class="flex items-center justify-between border-t border-line pt-2 font-bold text-primary-dark-900">
        <span>Basket total</span>
        <span>{{ formatKobo(total.totalKobo) }}</span>
      </div>
    </div>

    <div class="mt-4 rounded-lg bg-primary-50 px-3 py-2.5">
      <p class="text-xs font-semibold text-primary-700">One plan for the whole basket</p>
      <p class="mt-0.5 text-xs text-primary-600">
        You'll see your monthly options at checkout. Covers all {{ sellerCount }} seller{{ sellerCount > 1 ? "s" : "" }}.
      </p>
    </div>

    <NcButton variant="primary" size="lg" block class="mt-4" :disabled="disabled" @click="$emit('checkout')">
      {{ ctaLabel }}
    </NcButton>

    <p class="mt-3 text-xs text-primary-dark-400">
      We'll re-check prices and stock before you pay. Each seller ships on their own timeline. This
      total is for the whole basket.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ApiCart } from "~/models/cart_model";

withDefaults(
  defineProps<{
    total: ApiCart["total"];
    sellerCount: number;
    ctaLabel?: string;
    disabled?: boolean;
  }>(),
  { ctaLabel: "Proceed to checkout", disabled: false },
);
defineEmits<{ checkout: [] }>();
</script>
