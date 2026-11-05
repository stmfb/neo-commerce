<template>
  <ShimmerRegion label="Loading stores…">
    <!-- Mirrors MerchantTile (card variant) in the official-stores grid. -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <div v-for="n in count" :key="n" class="overflow-hidden rounded-xl border border-line bg-white" aria-hidden="true">
        <div class="shimmer flex h-24 items-center justify-center">
          <span class="relative z-10 h-12 w-12 rounded-full bg-white/70" />
        </div>
        <div class="flex items-center justify-between gap-2 px-4 py-3">
          <Shimmer class="h-3.5 w-2/3" />
          <Shimmer rounded="full" class="h-4 w-4" />
        </div>
      </div>
    </div>
  </ShimmerRegion>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 6 });
</script>
