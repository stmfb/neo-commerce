<template>
  <div class="flex flex-col rounded-2xl border border-line bg-white sm:flex-row">
    <div class="flex flex-1 items-start gap-3 p-5">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-500">
        <svg class="h-4.5 w-4.5" viewBox="0 0 20 20" fill="none">
          <rect x="2.5" y="5" width="15" height="11" rx="2" stroke="currentColor" stroke-width="1.4" />
          <path d="M2.5 8.5h15" stroke="currentColor" stroke-width="1.4" />
        </svg>
      </span>
      <div>
        <p class="text-sm font-semibold text-primary-dark-900">
          {{ signedIn ? "What can you afford?" : "See what you can afford" }}
        </p>
        <p class="mt-1 max-w-md text-sm text-primary-dark-400">
          {{
            signedIn
              ? `You're approved for ${formatNaira(approvedLimit)}/mo. Filter the whole marketplace to what fits.`
              : "Sign in and we'll show your monthly limit, or set your own budget to browse by. No hard number is shown until we know yours."
          }}
        </p>
      </div>
    </div>

    <span v-if="signedIn" class="hidden w-px shrink-0 self-center bg-line sm:block sm:h-14" />

    <div v-if="signedIn" class="flex flex-1 flex-wrap items-center gap-3 p-5">
      <span class="whitespace-nowrap text-sm text-primary-dark-500">Max monthly</span>
      <RangeSlider v-model="localValue" :min="5000" :max="approvedLimit" :step="1000" class="w-full min-w-[140px] flex-1" />
      <span class="whitespace-nowrap text-sm font-bold text-primary-dark-900">{{ formatNaira(localValue) }}</span>
      <NcButton size="sm" @click="$emit('apply', localValue)">Apply</NcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ signedIn: boolean; approvedLimit: number }>();
defineEmits<{ apply: [value: number] }>();
const localValue = ref(props.approvedLimit);
</script>
