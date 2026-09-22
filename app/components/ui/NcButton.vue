<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="!to && disabled"
    :aria-disabled="disabled"
    class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
    :class="[sizeClasses, variantClasses, block ? 'w-full' : '', disabled ? 'pointer-events-none opacity-50' : '']"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, resolveComponent } from "vue";

const NuxtLink = resolveComponent("NuxtLink");

const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "dark" | "ghost" | "danger" | "outline-light";
    size?: "sm" | "md" | "lg";
    to?: string;
    disabled?: boolean;
    block?: boolean;
    type?: "button" | "submit";
  }>(),
  {
    variant: "primary",
    size: "md",
    to: undefined,
    disabled: false,
    block: false,
    type: "button",
  },
);

const sizeClasses = computed(() => {
  return {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  }[props.size];
});

const variantClasses = computed(() => {
  return {
    primary: "bg-primary-500 text-white hover:bg-primary-600",
    secondary: "bg-white text-primary-dark-900 border border-line hover:border-primary-300 hover:bg-primary-50",
    dark: "bg-primary-dark text-white hover:bg-primary-dark-800",
    ghost: "bg-transparent text-primary-600 hover:bg-primary-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    "outline-light": "bg-transparent text-white border border-white/40 hover:bg-white/10",
  }[props.variant];
});
</script>
