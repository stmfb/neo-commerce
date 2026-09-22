<template>
  <div class="flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
    <div class="flex min-w-0 items-start gap-3">
      <ImagePlaceholder class="h-16 w-16 shrink-0" />
      <div class="min-w-0">
        <p class="text-sm font-medium text-primary-dark-900">{{ item.name }}</p>
        <p v-if="item.variantLabel" class="mt-0.5 text-xs text-primary-dark-400">{{ item.variantLabel }}</p>
        <p class="mt-1 text-sm font-bold text-primary-dark-900">
          {{ formatNaira(item.unitPrice) }}<span v-if="item.qty > 1" class="ml-1 text-xs font-normal text-primary-dark-400">each</span>
        </p>
        <p class="mt-1 text-sm font-semibold text-primary-dark-800">Sold by {{ item.merchantName }}</p>
      </div>
    </div>

    <div class="flex shrink-0 flex-col items-end gap-2">
      <QuantityStepper :model-value="item.qty" @update:model-value="(qty) => $emit('update-qty', item.id, qty)" />
      <div class="flex items-center gap-3 text-xs font-medium">
        <button type="button" class="text-primary-600 hover:text-primary-700" @click="$emit('save-for-later', item.id)">
          Save for later
        </button>
        <button type="button" class="text-primary-dark-400 hover:text-rose-600" @click="$emit('remove', item.id)">
          Remove
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CartItem } from "~/stores/cart";

defineProps<{ item: CartItem }>();
defineEmits<{
  "update-qty": [id: string, qty: number];
  remove: [id: string];
  "save-for-later": [id: string];
}>();
</script>
