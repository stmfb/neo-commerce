<template>
  <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
    <NuxtLink
      v-for="category in categories"
      :key="category.slug"
      :to="`/category/${category.slug}`"
      class="group overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-card"
    >
      <div class="flex h-16 items-center justify-center sm:h-20" :class="category.tileColor">
        <img
          v-if="category.image && !failed.has(category.slug)"
          :src="category.image"
          :alt="category.name"
          loading="lazy"
          class="h-full w-full object-contain p-2"
          @error="failed.add(category.slug)"
        />
      </div>

      <p class="px-3 py-2.5 text-center text-xs font-semibold text-primary-dark-900 sm:text-sm">
        {{ category.name }}
      </p>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import { categories as fallbackCategories, type Category } from "~/data/categories";

const props = defineProps<{ categories?: Category[] }>();
const categories = computed(() => props.categories ?? fallbackCategories);
const failed = reactive(new Set<string>());
</script>
