<template>
  <span
    class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors"
    :class="modelValue ? 'border-primary-500 bg-primary-500' : 'border-primary-dark-200 bg-white'"
  >
    <svg v-if="modelValue" class="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </span>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>();
</script>
