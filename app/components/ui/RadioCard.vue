<template>
  <label
    class="block cursor-pointer rounded-xl border-2 p-4 transition-colors"
    :class="selected ? 'border-primary-500 bg-primary-50/50' : 'border-line bg-white hover:border-primary-200'"
  >
    <input type="radio" class="sr-only" :checked="selected" @change="$emit('select')" />
    <slot :selected="selected" />
  </label>
</template>

<script setup lang="ts">
defineProps<{ selected: boolean }>();
defineEmits<{ select: [] }>();
</script>
