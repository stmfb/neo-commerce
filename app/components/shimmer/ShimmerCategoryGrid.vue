<template>
  <ShimmerRegion label="Loading categories…">
    <!-- Same grid as CategoryTileGrid. -->
    <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      <div v-for="n in count" :key="n" class="overflow-hidden rounded-xl border border-line bg-white" aria-hidden="true">
        <Shimmer rounded="sm" class="h-16 w-full sm:h-20" />
        <div class="flex justify-center px-3 py-3">
          <Shimmer class="h-3.5 w-3/4" />
        </div>
      </div>
    </div>
  </ShimmerRegion>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 7 });
</script>
