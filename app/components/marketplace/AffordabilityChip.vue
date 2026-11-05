<template>
  <div ref="root" class="relative">
    <div class="flex shrink-0 items-center gap-3 rounded-xl border border-line bg-white px-4 py-2.5">
      <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
          <rect x="2.5" y="5" width="15" height="11" rx="2" stroke="currentColor" stroke-width="1.5" />
          <path d="M2.5 8.5h15" stroke="currentColor" stroke-width="1.5" />
          <path d="M5.5 12.5h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </span>

      <div class="min-w-0 flex-1 leading-tight">
        <template v-if="store.budget !== null">
          <p class="text-[11px] text-primary-dark-400">Your monthly budget</p>
          <p class="text-sm font-bold text-primary-dark-900">{{ formatNaira(store.budget) }}/mo</p>
        </template>
        <template v-else-if="store.limit !== null">
          <p class="text-[11px] text-primary-dark-400">You can afford</p>
          <p class="text-sm font-bold text-primary-dark-900">{{ formatNaira(store.limit) }}/mo</p>
        </template>
        <template v-else>
          <p class="text-[11px] text-primary-dark-400">Set a monthly budget</p>
          <p class="text-sm font-bold text-primary-dark-900">Browse by what fits</p>
        </template>
      </div>

      <span class="ml-1 h-5 w-px shrink-0 bg-line" />
      <button
        type="button"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary-400 hover:bg-primary-50 hover:text-primary-600"
        :aria-expanded="open"
        aria-haspopup="dialog"
        aria-label="Set monthly budget"
        @click="toggle"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
          <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <circle cx="8" cy="6" r="1.6" fill="currentColor" />
          <circle cx="13" cy="10" r="1.6" fill="currentColor" />
          <circle cx="7" cy="14" r="1.6" fill="currentColor" />
        </svg>
      </button>
    </div>

    <div
      v-if="open"
      role="dialog"
      aria-label="Monthly budget"
      class="absolute right-0 top-full z-40 mt-2 w-full min-w-[280px] rounded-xl border border-line bg-white p-4 shadow-popover sm:w-80"
    >
      <p class="text-sm font-bold text-primary-dark-900">What can you pay each month?</p>
      <p class="mt-1 text-xs text-primary-dark-400">
        <template v-if="store.limit !== null">You're approved for {{ formatNaira(store.limit) }}/mo.</template>
        <template v-else>{{ store.guidance }}</template>
      </p>

      <BudgetSlider v-model="draft" class="mt-4" />

      <div class="mt-4 flex gap-2">
        <NcButton size="sm" class="flex-1" @click="apply">Apply</NcButton>
        <NcButton v-if="store.budget !== null" variant="secondary" size="sm" @click="clear">Clear</NcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

/** Header chip: shows the shopper's budget/limit and lets them set a budget used site-wide. */
const store = useAffordabilityStore();

const open = ref(false);
const draft = ref<number | null>(store.budget);
const root = ref<HTMLElement | null>(null);

function toggle() {
  draft.value = store.budget;
  open.value = !open.value;
}

function apply() {
  store.setBudget(draft.value === null ? null : nairaToKobo(draft.value));
  open.value = false;
}

function clear() {
  store.clearBudget();
  open.value = false;
}

function onDocumentClick(event: MouseEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false;
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") open.value = false;
}
onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onKeydown);
});
</script>
