<template>
  <div class="flex flex-col items-center rounded-2xl border border-line bg-white px-6 py-16 text-center">
    <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-primary-dark-400">
      <slot name="icon" />
    </div>
    <h3 class="text-base font-semibold text-primary-dark-900">{{ title }}</h3>
    <p v-if="description" class="mt-1.5 max-w-sm text-sm text-primary-dark-400">{{ description }}</p>
    <div v-if="$slots.actions" class="mt-5 flex flex-wrap items-center justify-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>
