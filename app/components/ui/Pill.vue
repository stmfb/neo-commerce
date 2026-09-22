<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
    :class="toneClasses"
  >
    <slot />
    <button v-if="removable" type="button" class="ml-0.5 opacity-70 hover:opacity-100" @click="$emit('remove')">
      &times;
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    tone?: "dark" | "primary" | "warning" | "error" | "success" | "neutral" | "light";
    removable?: boolean;
  }>(),
  { tone: "neutral", removable: false },
);

defineEmits<{ remove: [] }>();

const toneClasses = computed(() => {
  return {
    dark: "bg-primary-dark text-white",
    primary: "bg-primary-100 text-primary-700",
    warning: "bg-amber-100 text-amber-800",
    error: "bg-rose-100 text-rose-700",
    success: "bg-emerald-100 text-emerald-700",
    neutral: "bg-slate-100 text-primary-dark-600",
    light: "bg-white/15 text-white",
  }[props.tone];
});
</script>
