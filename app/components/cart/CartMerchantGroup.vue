<template>
  <div class="border-b border-line last:border-b-0">
    <div class="flex items-center justify-between bg-slate-50 px-4 py-3 sm:px-6">
      <div class="flex items-center gap-2.5">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-dark-700 text-xs font-bold text-white">
          {{ initials }}
        </span>
        <div>
          <p class="flex items-center gap-1 text-sm font-semibold text-primary-dark-900">
            {{ group.merchantName }}
            <VerifiedBadge v-if="group.merchantVerified" size="sm" />
          </p>
          <p class="text-xs text-primary-dark-400">{{ deliveryEta }}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-[11px] uppercase tracking-wide text-primary-dark-300">Subtotal</p>
        <p class="text-sm font-bold text-primary-dark-900">{{ formatKobo(group.subtotalKobo) }}</p>
      </div>
    </div>
    <div class="divide-y divide-line">
      <CartLineItem
        v-for="item in group.items"
        :key="item.cartItemId"
        :item="item"
        @update-qty="(id, qty) => $emit('update-qty', id, qty)"
        @remove="(id) => $emit('remove', id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ApiCartGroup } from "~/models/cart_model";

const props = defineProps<{ group: ApiCartGroup }>();
defineEmits<{
  "update-qty": [id: string, qty: number];
  remove: [id: string];
}>();

const initials = computed(() =>
  props.group.merchantName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join(""),
);
const deliveryEta = computed(() => {
  const eta = props.group.fulfilmentEtaDays;
  if (!eta) return "Delivery time varies by seller";
  return eta.min === eta.max ? `Delivery in ${eta.min} days` : `Delivery in ${eta.min}–${eta.max} days`;
});
</script>
