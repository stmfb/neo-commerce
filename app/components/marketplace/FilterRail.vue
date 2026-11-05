<template>
  <aside class="space-y-5">
    <div class="rounded-xl border border-line bg-white p-4">
      <p class="text-sm font-bold text-primary-dark-900">What you can afford</p>
      <BudgetSlider v-model="maxMonthly" class="mt-2" />
      <p class="mt-3 rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-700">
        <template v-if="cap !== null">Showing items you could repay at {{ formatNaira(cap) }}/mo or less.</template>
        <template v-else>{{ guidance }}</template>
      </p>
    </div>

    <div class="rounded-xl border border-line bg-white p-4">
      <p class="mb-3 text-sm font-bold text-primary-dark-900">Sub-category</p>
      <ul class="space-y-2.5">
        <li v-for="option in subCategories" :key="option.label">
          <label class="flex cursor-pointer items-center justify-between gap-2 text-sm">
            <span class="flex items-center gap-2 text-primary-dark-700">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-primary-dark-200 text-primary-500 focus:ring-primary-400"
                :checked="selectedSubCategories.includes(option.label)"
                @change="toggle(selectedSubCategories, option.label)"
              />
              {{ option.label }}
            </span>
            <span class="text-xs text-primary-dark-300">{{ option.count }}</span>
          </label>
        </li>
      </ul>
    </div>

    <div class="rounded-xl border border-line bg-white p-4">
      <p class="mb-3 text-sm font-bold text-primary-dark-900">Seller</p>
      <ul class="space-y-2.5">
        <li v-for="option in sellers" :key="option.label">
          <label class="flex cursor-pointer items-center justify-between gap-2 text-sm">
            <span class="flex items-center gap-2 text-primary-dark-700">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-primary-dark-200 text-primary-500 focus:ring-primary-400"
                :checked="selectedSellers.includes(option.label)"
                @change="toggle(selectedSellers, option.label)"
              />
              {{ option.label }}
            </span>
            <span class="text-xs text-primary-dark-300">{{ option.count }}</span>
          </label>
        </li>
      </ul>
    </div>

    <div class="rounded-xl border border-line bg-white p-4">
      <p class="mb-3 text-sm font-bold text-primary-dark-900">Other</p>
      <label class="flex cursor-pointer items-center gap-2 text-sm text-primary-dark-700">
        <input v-model="officialOnly" type="checkbox" class="h-4 w-4 rounded border-primary-dark-200 text-primary-500 focus:ring-primary-400" />
        Official stores only
      </label>
      <label class="mt-2.5 flex cursor-pointer items-center gap-2 text-sm text-primary-dark-700">
        <input v-model="inStockOnly" type="checkbox" class="h-4 w-4 rounded border-primary-dark-200 text-primary-500 focus:ring-primary-400" />
        In stock only
      </label>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  /** Effective monthly cap in naira (budget, else known limit), or null for none. */
  cap: number | null;
  guidance: string;
  subCategories: { label: string; count: number }[];
  sellers: { label: string; count: number }[];
}>();

const maxMonthly = defineModel<number | null>("maxMonthly", { required: true });
const selectedSubCategories = defineModel<string[]>("selectedSubCategories", { required: true });
const selectedSellers = defineModel<string[]>("selectedSellers", { required: true });
const officialOnly = defineModel<boolean>("officialOnly", { required: true });
const inStockOnly = defineModel<boolean>("inStockOnly", { required: true });

function toggle(list: string[], value: string) {
  const index = list.indexOf(value);
  if (index === -1) {
    list.push(value);
  } else {
    list.splice(index, 1);
  }
}
</script>
