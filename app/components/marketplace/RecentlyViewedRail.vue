<template>
  <div class="no-scrollbar flex gap-x-8 overflow-x-auto pb-1">
    <NuxtLink
      v-for="product in products"
      :key="product.id"
      :to="`/product/${product.slug}`"
      class="flex w-[200px] shrink-0 items-center gap-3"
    >
      <ImagePlaceholder class="h-12 w-12 shrink-0" />
      <div class="min-w-0">
        <p class="line-clamp-2 text-sm text-primary-dark-800">{{ product.name }}</p>
        <p class="mt-1 text-sm font-bold text-primary-dark-900">{{ formatNaira(product.price) }}</p>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/data/products";

defineProps<{ products: Product[] }>();
</script>
