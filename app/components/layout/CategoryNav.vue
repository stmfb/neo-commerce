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
import { categories } from "~/data/categories";

defineProps<{ activeSlug?: string }>();
</script>
