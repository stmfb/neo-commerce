<template>
  <ShimmerRegion label="Loading products…">
    <!-- Same breakpoints as ProductGrid so nothing jumps when real cards arrive. -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3" :class="columns === 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-4'">
      <ShimmerProductCard v-for="n in count" :key="n" />
    </div>
  </ShimmerRegion>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number; columns?: 4 | 6 }>(), { count: 8, columns: 4 });
</script>
