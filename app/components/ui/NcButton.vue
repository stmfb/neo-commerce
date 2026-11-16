<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="!to && (disabled || loading)"
    :aria-disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :tabindex="to && (disabled || loading) ? -1 : undefined"
    class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
    :class="[
      sizeClasses,
      variantClasses,
      block ? 'w-full' : '',
      // Loading keeps the button's colours (only slightly dimmed) so the spinner stands out.
      loading ? 'pointer-events-none opacity-80' : disabled ? 'pointer-events-none opacity-50' : '',
    ]"
  >
    <svg
      v-if="loading"
      class="shrink-0 animate-spin motion-reduce:[animation-duration:1.5s]"
      :class="spinnerSize"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.3" stroke-width="3" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
    </svg>
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
    /** Shows a spinner and disables the button while an action is in flight. */
    loading?: boolean;
    block?: boolean;
    type?: "button" | "submit";
  }>(),
  {
    variant: "primary",
    size: "md",
    to: undefined,
    disabled: false,
    loading: false,
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

const spinnerSize = computed(() => ({ sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" })[props.size]);

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
