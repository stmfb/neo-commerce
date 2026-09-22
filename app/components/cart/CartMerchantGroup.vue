<template>
  <div class="border-b border-line last:border-b-0">
    <div class="flex items-center justify-between bg-slate-50 px-4 py-3 sm:px-6">
      <div class="flex items-center gap-2.5">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" :class="tileColor">
          {{ group.merchantSlug ? initials : "" }}
        </span>
        <div>
          <p class="text-sm font-semibold text-primary-dark-900">{{ group.merchantName }}</p>
          <p class="text-xs text-primary-dark-400">{{ group.deliveryEta }}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-[11px] uppercase tracking-wide text-primary-dark-300">Subtotal</p>
        <p class="text-sm font-bold text-primary-dark-900">{{ formatNaira(group.subtotal) }}</p>
      </div>
    </div>
    <div class="divide-y divide-line">
      <CartLineItem
        v-for="item in group.items"
        :key="item.id"
        :item="item"
        @update-qty="(id, qty) => $emit('update-qty', id, qty)"
        @remove="(id) => $emit('remove', id)"
        @save-for-later="(id) => $emit('save-for-later', id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CartMerchantGroup } from "~/stores/cart";
import { getMerchant } from "~/data/merchants";

const props = defineProps<{ group: CartMerchantGroup }>();
defineEmits<{
  "update-qty": [id: string, qty: number];
  remove: [id: string];
  "save-for-later": [id: string];
}>();

const merchant = computed(() => getMerchant(props.group.merchantSlug));
const initials = computed(() => merchant.value?.initials ?? "");
const tileColor = computed(() => merchant.value?.tileColor ?? "bg-primary-dark-700");
</script>
