<template>
  <span
    class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
    :class="selected ? 'border-primary-500' : 'border-primary-dark-200'"
  >
    <span v-if="selected" class="h-2.5 w-2.5 rounded-full bg-primary-500" />
  </span>
</template>

<script setup lang="ts">
defineProps<{ selected: boolean }>();
</script>
