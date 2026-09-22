<template>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
    <ProductCard v-for="product in sortedProducts" :key="product.id" :product="product" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Product } from "~/data/products";

const props = withDefaults(
  defineProps<{ products: Product[]; demoteOutOfStock?: boolean }>(),
  { demoteOutOfStock: false },
);

const sortedProducts = computed(() => {
  if (!props.demoteOutOfStock) return props.products;
  return [...props.products].sort((a, b) => {
    const aOut = a.stock === "out" ? 1 : 0;
    const bOut = b.stock === "out" ? 1 : 0;
    return aOut - bOut;
  });
});
</script>
