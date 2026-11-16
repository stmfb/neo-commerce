<template>
  <nav class="border-b border-line bg-white">
    <div class="no-scrollbar mx-auto flex max-w-[1320px] items-center gap-6 overflow-x-auto px-4 py-3 sm:px-6">
      <button
        type="button"
        class="flex shrink-0 items-center gap-2 text-sm font-semibold text-primary-dark-900"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        All categories
      </button>
      <span class="h-4 w-px shrink-0 bg-line" />
      <ShimmerRegion v-if="loading && !categories.length" label="Loading categories…" class="flex items-center gap-6">
        <Shimmer v-for="width in shimmerWidths" :key="width" class="h-4 shrink-0" :style="{ width: `${width}px` }" />
      </ShimmerRegion>
      <NuxtLink
        v-for="category in categories"
        :key="category.slug"
        :to="`/category/${category.slug}`"
        class="shrink-0 text-sm transition-colors"
        :class="activeSlug === category.slug ? 'font-semibold text-primary-600' : 'text-primary-dark-500 hover:text-primary-dark-900'"
      >
        {{ category.name }}
      </NuxtLink>
      <NuxtLink to="/official-stores" class="shrink-0 text-sm font-semibold text-primary-dark-900 hover:text-primary-600 sm:ml-auto">
        Official Stores
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineProps<{ activeSlug?: string }>();

// The backend has no standalone categories endpoint; the list ships with the
// home payload. Same key as the home page, so it is fetched once and shared.
const marketplaceStore = useMarketplaceStore();
const { categories, loading } = storeToRefs(marketplaceStore);

// Varied widths so the placeholder reads like real category names.
const shimmerWidths = [56, 64, 40, 112, 48, 60];
await useAsyncData("marketplace-home", () => marketplaceStore.fetchHome(), { lazy: true });
</script>
