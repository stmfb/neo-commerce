<template>
  <NuxtLink :to="to" class="flex flex-1 flex-col justify-center rounded-2xl p-5 transition-colors" :class="toneClass">
    <p class="font-display text-lg font-bold text-white">{{ title }}</p>
    <p class="mt-1 text-sm text-white/80">{{ description }}</p>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{ title: string; description: string; to: string; tone?: "blue" | "purple" }>(), {
  tone: "blue",
});

const toneClass = computed(() =>
  props.tone === "blue" ? "bg-blue-700 hover:bg-blue-800" : "bg-primary-500 hover:bg-primary-600",
);
</script>
