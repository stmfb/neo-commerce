<template>
  <svg
    class="inline-block shrink-0"
    :class="sizeClass"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="4" width="16" height="16" rx="5" fill="currentColor" />
    <rect x="4" y="4" width="16" height="16" rx="5" fill="currentColor" transform="rotate(45 12 12)" />
    <path
      d="M8.4 12.3l2.5 2.4 4.7-5"
      stroke="white"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{ size?: "sm" | "md" | "lg" }>(), { size: "sm" });

const sizeClass = computed(() => ({ sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" })[props.size]);
</script>
