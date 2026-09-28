<template>
  <div class="relative overflow-hidden rounded-2xl bg-primary-dark px-6 py-7 sm:px-10 sm:py-9">
    <span class="pointer-events-none absolute -right-8 -top-16 h-52 w-52 rounded-full bg-primary-300/10 sm:h-64 sm:w-64" />
    <span class="pointer-events-none absolute -bottom-14 right-8 h-32 w-32 rounded-full bg-primary-500/35 sm:h-40 sm:w-40" />

    <div class="relative max-w-xl">
      <p v-if="variant === 'home'" class="text-xs font-medium tracking-[0.2em] text-butter-400">
        PAY SMALL SMALL
      </p>
      <h1 class="mt-2 font-display text-3xl font-bold leading-[1.1] text-white sm:text-[44px]">
        Buy from any seller.<br />Pay one plan.
      </h1>
      <p class="mt-3 text-sm text-white/70 sm:text-base">
        {{
          variant === "home"
            ? "Fill one cart across as many stores as you like. You still \n get one plan, one authorisation, one schedule."
            : "Browse freely. Sign in to see what you can afford each month."
        }}
      </p>
      <div v-if="variant === 'home'" class="mt-5 flex flex-wrap gap-3">
        <NcButton to="/category/generators-power" variant="primary" size="lg">Start shopping</NcButton>
        <NcButton variant="outline-light" size="lg">How it works</NcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ variant?: "home" | "directory" }>(), { variant: "home" });
</script>
