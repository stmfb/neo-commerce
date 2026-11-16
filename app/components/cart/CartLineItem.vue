<template>
  <div class="flex items-start justify-between gap-4 px-4 py-4 sm:px-6" :class="{ 'bg-rose-50/40': item.flaggedForRemoval }">
    <NuxtLink :to="`/product/${item.listingId}`" class="flex min-w-0 items-start gap-3">
      <ShimmerImg :src="item.image" :alt="item.title" class="h-16 w-16 shrink-0 rounded-lg" img-class="h-full w-full rounded-lg object-cover">
        <template #fallback>
          <ImagePlaceholder class="h-16 w-16" />
        </template>
      </ShimmerImg>
      <div class="min-w-0">
        <p class="text-sm font-medium text-primary-dark-900">{{ item.title }}</p>
        <p v-if="item.variantLabel" class="mt-0.5 text-xs text-primary-dark-400">{{ item.variantLabel }}</p>
        <p class="mt-1 text-sm font-bold text-primary-dark-900">
          {{ formatKobo(item.unitPriceKobo) }}<span v-if="item.quantity > 1" class="ml-1 text-xs font-normal text-primary-dark-400">each</span>
        </p>
        <p v-if="item.flaggedForRemoval" class="mt-1 text-xs font-medium text-rose-600">
          No longer available. Remove it to continue.
        </p>
      </div>
    </NuxtLink>

    <div class="flex shrink-0 flex-col items-end gap-2">
      <QuantityStepper
        v-if="!item.flaggedForRemoval"
        :model-value="item.quantity"
        :max="Math.max(item.maxQuantity, 1)"
        @update:model-value="(qty) => $emit('update-qty', item.cartItemId, qty)"
      />
      <button type="button" class="text-xs font-medium text-primary-dark-400 hover:text-rose-600" @click="$emit('remove', item.cartItemId)">
        Remove
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiCartItem } from "~/models/cart_model";

defineProps<{ item: ApiCartItem }>();
defineEmits<{
  "update-qty": [id: string, qty: number];
  remove: [id: string];
}>();
</script>
