<template>
  <div class="flex shrink-0 items-center gap-3 rounded-xl border border-line bg-white px-4 py-2.5">
    <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="5" width="15" height="11" rx="2" stroke="currentColor" stroke-width="1.5" />
        <path d="M2.5 8.5h15" stroke="currentColor" stroke-width="1.5" />
        <path d="M5.5 12.5h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </span>
    <div class="leading-tight">
      <template v-if="signedIn">
        <p class="text-[11px] text-primary-dark-400">You can afford</p>
        <p class="text-sm font-bold text-primary-dark-900">{{ formatNaira(approvedLimit) }}/mo</p>
      </template>
      <template v-else>
        <p class="text-[11px] text-primary-dark-400">Set a monthly budget</p>
        <p class="text-sm font-bold text-primary-dark-900">Browse by what fits</p>
      </template>
    </div>
    <span class="ml-1 h-5 w-px shrink-0 bg-line" />
    <button type="button" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary-400 hover:bg-primary-50 hover:text-primary-600">
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
        <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="8" cy="6" r="1.6" fill="currentColor" />
        <circle cx="13" cy="10" r="1.6" fill="currentColor" />
        <circle cx="7" cy="14" r="1.6" fill="currentColor" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ signedIn: boolean; approvedLimit: number }>();
</script>
