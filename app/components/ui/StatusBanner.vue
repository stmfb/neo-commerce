<template>
  <div class="flex items-start gap-3 rounded-xl border p-4" :class="toneClasses">
    <div v-if="$slots.icon" class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" :class="iconWrapClasses">
      <slot name="icon" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-sm font-semibold" :class="titleClasses">{{ title }}</p>
      <p v-if="$slots.default" class="mt-1 text-sm" :class="bodyClasses">
        <slot />
      </p>
      <div v-if="$slots.actions" class="mt-3 flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    tone?: "dark" | "info" | "warning" | "error" | "success" | "neutral";
    title: string;
  }>(),
  { tone: "neutral" },
);

const toneClasses = computed(() => {
  return {
    dark: "border-transparent bg-primary-dark text-white",
    info: "border-primary-100 bg-primary-50",
    warning: "border-amber-200 bg-amber-50",
    error: "border-rose-200 bg-rose-50",
    success: "border-emerald-200 bg-emerald-50",
    neutral: "border-line bg-white",
  }[props.tone];
});

const titleClasses = computed(() => {
  return {
    dark: "text-white",
    info: "text-primary-dark-900",
    warning: "text-amber-900",
    error: "text-rose-700",
    success: "text-emerald-800",
    neutral: "text-primary-dark-900",
  }[props.tone];
});

const bodyClasses = computed(() => {
  return {
    dark: "text-white/70",
    info: "text-primary-dark-500",
    warning: "text-amber-800",
    error: "text-rose-600",
    success: "text-emerald-700",
    neutral: "text-primary-dark-400",
  }[props.tone];
});

const iconWrapClasses = computed(() => {
  return {
    dark: "bg-white/15 text-white",
    info: "bg-primary-100 text-primary-600",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-rose-100 text-rose-600",
    success: "bg-emerald-100 text-emerald-700",
    neutral: "bg-slate-100 text-primary-dark-500",
  }[props.tone];
});
</script>
