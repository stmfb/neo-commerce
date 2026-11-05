<template>
  <NuxtLink to="/cart" class="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg p-2 text-sm font-medium text-primary-dark-900 hover:bg-slate-50">
    <svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h2l1.2 8.4a1.5 1.5 0 001.5 1.3h6.6a1.5 1.5 0 001.5-1.3L17 7H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="8.5" cy="17" r="1.1" fill="currentColor" />
      <circle cx="14.5" cy="17" r="1.1" fill="currentColor" />
    </svg>
    <span class="sr-only min-[400px]:not-sr-only">Cart</span>
    <span v-if="itemCount > 0" class="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary-500 px-1 text-xs font-bold text-white">
      {{ itemCount }}
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
const { itemCount } = useCart();
</script>
