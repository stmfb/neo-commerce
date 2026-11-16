<template>
  <div class="flex flex-col rounded-2xl border border-[#E3DFFB] bg-[#F0EDFF] sm:flex-row sm:items-center">
    <div class="flex flex-1 items-start gap-3 p-5">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-500">
        <svg class="h-4.5 w-4.5" viewBox="0 0 20 20" fill="none">
          <rect x="2.5" y="5" width="15" height="11" rx="2" stroke="currentColor" stroke-width="1.4" />
          <path d="M2.5 8.5h15" stroke="currentColor" stroke-width="1.4" />
        </svg>
      </span>
      <div>
        <p class="text-sm font-semibold text-[#2D3261]">
          {{ store.known ? "What can you afford?" : "See what you can afford" }}
        </p>
        <p class="mt-1 max-w-md text-sm text-[#5B4FA8]">
          <template v-if="store.limit !== null">
            You're approved for {{ formatNaira(store.limit) }}/mo. Filter the whole marketplace to what fits.
          </template>
          <template v-else>{{ store.guidance }}</template>
        </p>
      </div>
    </div>

    <div class="flex flex-1 flex-wrap items-end gap-3 p-5 sm:pl-0">
      <BudgetSlider v-model="draft" class="min-w-[200px] flex-1" />
      <div class="flex gap-2">
        <NcButton size="sm" :disabled="!changed" @click="apply">Apply</NcButton>
        <NcButton v-if="store.budget !== null" variant="secondary" size="sm" @click="store.clearBudget()">Clear</NcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const store = useAffordabilityStore();

const draft = ref<number | null>(store.budget);
// Follow budget changes made elsewhere (header chip, filters).
watch(
  () => store.budget,
  (value) => (draft.value = value),
);

const changed = computed(() => draft.value !== store.budget);

function apply() {
  store.setBudget(draft.value === null ? null : nairaToKobo(draft.value));
}
</script>
