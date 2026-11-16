<template>
  <!-- Wraps a group of shimmer blocks so screen readers hear one "Loading" announcement. -->
  <div role="status" aria-busy="true" :aria-label="label">
    <span class="sr-only">{{ label }}</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: "Loading…" });
</script>
