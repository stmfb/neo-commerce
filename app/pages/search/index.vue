<template>
  <div class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <Breadcrumb class="mb-4" :items="[{ label: 'Home', to: '/' }, { label: 'Search' }]" />

    <div class="mb-5 rounded-xl border border-line bg-white p-4">
      <template v-if="rawQuery">
        <p class="text-sm text-primary-dark-500">
          Showing results for <span class="font-bold text-primary-dark-900">{{ correctedQuery }}</span>
        </p>
        <p class="mt-1 text-xs text-primary-dark-400">
          <template v-if="isCorrected">
            Search instead for
            <button type="button" class="font-semibold text-primary-600 hover:text-primary-700" @click="searchLiteral">
              {{ rawQuery }}
            </button>
            ·
          </template>
          {{ results.length }} results from {{ sellerCount }} sellers
        </p>
      </template>
      <p v-else class="text-sm text-primary-dark-500">Search for generators, phones, home appliances and more.</p>
    </div>

    <ProductGrid v-if="results.length" :products="results" demote-out-of-stock />

    <EmptyState v-else-if="rawQuery" :title="`No results for “${rawQuery}”`" description="Nothing matched, and we won't guess. Try one of these categories instead.">
      <template #icon>
        <svg class="h-6 w-6" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5" />
          <path d="M13.5 13.5L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </template>
      <template #actions>
        <NcButton v-for="category in suggestedCategories" :key="category.slug" :to="`/category/${category.slug}`" variant="secondary" size="sm">
          {{ category.name }}
        </NcButton>
      </template>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { products } from "~/data/products";
import { categories } from "~/data/categories";

const route = useRoute();
const router = useRouter();

const typoMap: Record<string, string> = {
  genrator: "generator",
  jenerator: "generator",
  fone: "phone",
};

const rawQuery = computed(() => (typeof route.query.q === "string" ? route.query.q : ""));
const forceLiteral = computed(() => route.query.literal === "1");
const isCorrected = computed(() => !forceLiteral.value && Boolean(typoMap[rawQuery.value.toLowerCase()]));
const correctedQuery = computed(() => (forceLiteral.value ? rawQuery.value : typoMap[rawQuery.value.toLowerCase()] ?? rawQuery.value));

const results = computed(() => {
  const term = correctedQuery.value.trim().toLowerCase();
  if (!term) return [];
  return products.filter((product) => product.name.toLowerCase().includes(term));
});

const sellerCount = computed(() => new Set(results.value.map((product) => product.merchantSlug)).size);

const suggestedCategories = computed(() => categories.slice(0, 3));

function searchLiteral() {
  router.push({ path: "/search", query: { q: rawQuery.value, literal: "1" } });
}
</script>
