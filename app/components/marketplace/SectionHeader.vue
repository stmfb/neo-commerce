<template>
  <div class="mb-4 flex items-end justify-between gap-4">
    <div>
      <h2 class="text-xl font-bold text-primary-dark-900">{{ title }}</h2>
      <p v-if="subtitle" class="mt-0.5 text-sm text-primary-dark-400">{{ subtitle }}</p>
    </div>
    <NuxtLink v-if="actionLabel && actionTo" :to="actionTo" class="shrink-0 text-sm font-semibold text-primary-600 hover:text-primary-700">
      {{ actionLabel }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; actionLabel?: string; actionTo?: string }>();
</script>
