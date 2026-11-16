<template>
  <aside class="space-y-5">
    <!-- Monthly budget -->
    <div class="rounded-xl border border-line bg-white p-4">
      <p class="text-sm font-bold text-primary-dark-900">What you can afford</p>
      <BudgetSlider v-model="monthlyDraft" class="mt-2" />
      <p class="mt-3 rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-700">
        <template v-if="monthlyDraft !== null">Showing items you could repay at {{ formatNaira(monthlyDraft) }}/mo or less.</template>
        <template v-else>{{ guidance }}</template>
      </p>
    </div>

    <!-- Price range -->
    <form class="rounded-xl border border-line bg-white p-4" @submit.prevent="applyPrice">
      <p class="mb-3 text-sm font-bold text-primary-dark-900">Price</p>
      <div class="flex items-center gap-2">
        <label class="min-w-0 flex-1">
          <span class="sr-only">Minimum price in naira</span>
          <input
            v-model.number="minDraft"
            type="number"
            min="0"
            inputmode="numeric"
            placeholder="Min ₦"
            class="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </label>
        <span class="text-primary-dark-300">–</span>
        <label class="min-w-0 flex-1">
          <span class="sr-only">Maximum price in naira</span>
          <input
            v-model.number="maxDraft"
            type="number"
            min="0"
            inputmode="numeric"
            placeholder="Max ₦"
            class="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </label>
      </div>
      <p v-if="priceInvalid" class="mt-2 text-xs text-rose-600">Minimum can't be more than maximum.</p>
      <NcButton type="submit" variant="secondary" size="sm" block class="mt-3" :disabled="priceInvalid">Apply</NcButton>
    </form>

    <!-- Facets -->
    <div
      v-for="group in groups"
      :key="group.key"
      class="rounded-xl border border-line bg-white p-4"
    >
      <p class="mb-3 text-sm font-bold text-primary-dark-900">{{ group.title }}</p>
      <ul class="space-y-2.5">
        <li v-for="option in group.options" :key="option.id">
          <button
            type="button"
            class="flex w-full items-start gap-3 text-left text-sm text-primary-dark-700"
            role="checkbox"
            :aria-checked="isSelected(group.key, option.id)"
            @click="toggle(group.key, option.id)"
          >
            <Checkbox :model-value="isSelected(group.key, option.id)" />
            <span class="flex-1">{{ option.label }}</span>
            <span class="text-xs text-primary-dark-300">{{ option.count }}</span>
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ApiFacetOption, SearchQuery } from "~/models/marketplace_model";

type FacetKey = "brand" | "merchant" | "condition";

const props = defineProps<{
  selected: SearchQuery;
  brands: ApiFacetOption[];
  merchants: ApiFacetOption[];
  conditions: ApiFacetOption[];
  guidance: string;
}>();

const emit = defineEmits<{ change: [patch: Partial<SearchQuery>] }>();

/**
 * Options come from the API facets, but a selected value is always listed even if the
 * current results don't include it, so it can be unticked.
 */
function withSelected(options: ApiFacetOption[], selected: string[] = []): ApiFacetOption[] {
  const known = new Set(options.map((o) => o.id));
  const missing = selected
    .filter((id) => !known.has(id))
    .map((id) => ({ id, label: id, count: 0, selected: true }));
  return [...options, ...missing];
}

const groups = computed(() =>
  (
    [
      { key: "brand", title: "Brand", options: withSelected(props.brands, props.selected.brand) },
      { key: "merchant", title: "Seller", options: withSelected(props.merchants, props.selected.merchant) },
      { key: "condition", title: "Condition", options: withSelected(props.conditions, props.selected.condition) },
    ] as const
  ).filter((group) => group.options.length > 0),
);

function isSelected(key: FacetKey, id: string) {
  return props.selected[key]?.includes(id) ?? false;
}

function toggle(key: FacetKey, id: string) {
  const current = props.selected[key] ?? [];
  const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
  emit("change", { [key]: next });
}

// Monthly budget: slider is in naira (null = any); the URL/API use kobo. Debounced so
// dragging doesn't fire a search per pixel.
const monthlyFromProps = () => (props.selected.maxMonthly ? koboToNaira(props.selected.maxMonthly) : null);
const monthlyDraft = ref<number | null>(monthlyFromProps());
watch(() => props.selected.maxMonthly, () => (monthlyDraft.value = monthlyFromProps()));

let monthlyTimer: ReturnType<typeof setTimeout> | undefined;
watch(monthlyDraft, (value) => {
  if (value === monthlyFromProps()) return;
  clearTimeout(monthlyTimer);
  monthlyTimer = setTimeout(() => {
    emit("change", { maxMonthly: value === null ? undefined : nairaToKobo(value) });
  }, 400);
});

// Price range: applied explicitly so half-typed numbers don't trigger searches.
const toDraft = (kobo?: number) => (kobo ? koboToNaira(kobo) : undefined);
const minDraft = ref<number | undefined>(toDraft(props.selected.minPrice));
const maxDraft = ref<number | undefined>(toDraft(props.selected.maxPrice));
watch(
  () => [props.selected.minPrice, props.selected.maxPrice],
  () => {
    minDraft.value = toDraft(props.selected.minPrice);
    maxDraft.value = toDraft(props.selected.maxPrice);
  },
);

const validNumber = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n > 0 ? n : undefined);
const priceInvalid = computed(() => {
  const min = validNumber(minDraft.value);
  const max = validNumber(maxDraft.value);
  return min !== undefined && max !== undefined && min > max;
});

function applyPrice() {
  if (priceInvalid.value) return;
  const min = validNumber(minDraft.value);
  const max = validNumber(maxDraft.value);
  emit("change", {
    minPrice: min ? nairaToKobo(min) : undefined,
    maxPrice: max ? nairaToKobo(max) : undefined,
  });
}
</script>
