<template>
  <div class="flex min-h-screen flex-col bg-slate-50">
    <header class="border-b border-line bg-white">
      <div class="mx-auto flex max-w-[1320px] items-center justify-center px-4 py-4 sm:px-6">
        <NuxtLink to="/">
          <BrandLogo />
        </NuxtLink>
      </div>
    </header>
    <CheckoutStepper :current-step="currentStep" />
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();

const stepByName: Record<string, number> = {
  "checkout-plan": 1,
  "checkout-disclosures": 2,
  "checkout-authorise": 3,
  "checkout-processing": 3,
  "checkout-result": 4,
};

const currentStep = computed(() => stepByName[route.name as string] ?? 1);
</script>
