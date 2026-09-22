<template>
  <div class="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
    <NuxtLink
      v-for="category in categories"
      :key="category.slug"
      :to="`/category/${category.slug}`"
      class="group overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-card"
    >
      <div class="h-16 transition-transform sm:h-20" :class="category.tileColor" />

      <p class="px-3 py-2.5 text-center text-xs font-semibold text-primary-dark-900 sm:text-sm">
        {{ category.name }}
      </p>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { categories } from "~/data/categories";
</script>
