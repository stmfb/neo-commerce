<template>
  <span class="inline-flex items-baseline font-bold font-display text-primary-dark" :class="sizeClass">
    neocash<span class="ml-0.5 font-semibold text-primary-500" :class="tagSizeClass">shop</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{ size?: "sm" | "md" }>(), { size: "md" });

const sizeClass = computed(() => (props.size === "md" ? "text-2xl" : "text-xl"));
const tagSizeClass = computed(() => (props.size === "md" ? "text-xs" : "text-[11px]"));
</script>
