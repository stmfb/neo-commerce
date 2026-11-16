<template>
  <div class="shimmer" :class="roundedClass" aria-hidden="true" />
</template>

<script setup lang="ts">
import { computed } from "vue";

/**
 * Base shimmer block. Size it with classes, e.g. `<Shimmer class="h-4 w-1/2" />`.
 */
const props = withDefaults(defineProps<{ rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" }>(), {
  rounded: "md",
});

const roundedClass = computed(
  () =>
    ({
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      full: "rounded-full",
    })[props.rounded],
);
</script>
