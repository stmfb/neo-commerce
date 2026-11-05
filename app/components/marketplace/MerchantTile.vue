<template>
  <NuxtLink
    :to="`/merchant/${merchant.slug}`"
    class="flex flex-col items-center gap-2 text-center"
    v-if="variant === 'rail'"
  >
    <span class="flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-white" :class="merchant.tileColor">
      {{ merchant.initials }}
    </span>
    <span class="flex items-center gap-1 text-xs font-medium text-primary-dark-800 sm:text-sm">
      {{ merchant.name }}
      <VerifiedBadge v-if="merchant.verified" size="sm" />
    </span>
  </NuxtLink>

  <NuxtLink
    v-else
    :to="`/merchant/${merchant.slug}`"
    class="overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-card"
  >
    <div class="flex h-24 items-center justify-center" :class="merchant.tileColor">
      <span class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-primary-dark-900">
        <img v-if="merchant.logo && !logoFailed" :src="merchant.logo" :alt="merchant.name" class="h-full w-full object-cover" @error="logoFailed = true" />
        <template v-else>{{ merchant.initials }}</template>
      </span>
    </div>
    <div class="flex items-center justify-between gap-2 px-4 py-3 text-primary-500">
      <p class="text-sm font-semibold text-primary-dark-900">{{ merchant.name }}</p>
      <VerifiedBadge v-if="merchant.verified" size="sm" />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Merchant } from "~/data/merchants";

withDefaults(defineProps<{ merchant: Merchant; variant?: "rail" | "card" }>(), {
  variant: "card",
});

const logoFailed = ref(false);
</script>
