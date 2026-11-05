<template>
  <div class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <Breadcrumb class="mb-4" :items="breadcrumbItems" />

    <ShimmerCategoryPage v-if="initialLoading" />

    <div v-else class="grid grid-cols-1 gap-6" :class="{ 'lg:grid-cols-[280px_1fr]': !notFound }">
      <FilterRail
        v-if="!notFound"
        v-model:max-monthly="maxMonthly"
        v-model:selected-sub-categories="selectedSubCategories"
        v-model:selected-sellers="selectedSellers"
        v-model:official-only="officialOnly"
        v-model:in-stock-only="inStockOnly"
        :limit="approvedLimit"
        :sub-categories="subCategoryOptions"
        :sellers="sellerOptions"
      />

      <div class="min-w-0">
        <div class="mb-4">
          <h1 class="text-2xl font-bold text-primary-dark-900">{{ categoryName }}</h1>
          <p v-if="!notFound" class="mt-1 text-sm text-primary-dark-400">
            {{ totalItems }} items from {{ sellerOptions.length }} sellers · filtered to
            {{ formatNaira(maxMonthly) }}/mo
          </p>
        </div>

        <div v-if="activeChips.length" class="mb-4 flex flex-wrap items-center gap-2">
          <Pill v-for="chip in activeChips" :key="chip.key" tone="primary" removable @remove="chip.remove">
            {{ chip.label }}
          </Pill>
          <button type="button" class="text-xs font-semibold text-primary-600 hover:text-primary-700" @click="clearAll">
            Clear all
          </button>
        </div>

        <EmptyState
          v-if="notFound"
          title="We couldn't find this category"
          description="It may have been renamed or removed. Try one of these instead."
        >
          <template #actions>
            <NcButton
              v-for="category in marketplaceStore.categories"
              :key="category.slug"
              :to="`/category/${category.slug}`"
              variant="secondary"
              size="sm"
            >
              {{ category.name }}
            </NcButton>
          </template>
        </EmptyState>

        <StatusBanner v-else-if="error" tone="warning" title="We couldn't load this category" class="mb-4">
          Please refresh to try again.
        </StatusBanner>

        <template v-if="filteredProducts.length">
          <ProductGrid :products="filteredProducts" demote-out-of-stock />
          <ShimmerProductGrid v-if="loadingMore" :count="4" class="mt-4" />
          <div v-if="nextCursor !== null" class="mt-6 flex justify-center">
            <NcButton variant="secondary" size="sm" :loading="loadingMore" @click="loadMore">
              {{ loadingMore ? "Loading more…" : "Load more" }}
            </NcButton>
          </div>
        </template>

        <EmptyState v-else-if="!error && !notFound" :title="emptyTitle" :description="emptyDescription">
          <template #icon>
            <svg class="h-6 w-6" viewBox="0 0 20 20" fill="none">
              <path d="M3 4h14l-5.5 6.5V16l-3 1.5v-7L3 4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
              <path d="M3 3l14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </template>
          <template #actions>
            <NcButton v-if="suggestedRaise" size="sm" @click="maxMonthly = suggestedRaise">
              Raise to {{ formatNaira(suggestedRaise) }}/mo
            </NcButton>
            <NcButton variant="secondary" size="sm" @click="clearAll">Clear all filters</NcButton>
          </template>
        </EmptyState>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getCategory } from "~/data/categories";
import type { Product } from "~/data/products";
import { getMerchant } from "~/data/merchants";

const route = useRoute();
const { approvedLimit } = useAuth();
const categoryStore = useCategoryStore();
const { loading: pending, loadingMore, error, errorStatus, nextCursor } = storeToRefs(categoryStore);
const notFound = computed(() => errorStatus.value === 404);
const initialLoading = computed(() => pending.value && !categoryProducts.value.length);

// Category list for the not-found suggestions. Shares the header nav's key, so it's one request.
const marketplaceStore = useMarketplaceStore();
await useAsyncData("marketplace-home", () => marketplaceStore.fetchHome());

const slug = computed(() => route.params.slug as string);
const categoryName = computed(() => {
  const fromApi = categoryStore.categoryName;
  if (fromApi) return fromApi;
  const known = getCategory(slug.value)?.name;
  if (known) return known;
  return slug.value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
});

await useAsyncData(
  () => `category-listings-${slug.value}`,
  () => categoryStore.fetchListings(slug.value),
  { watch: [slug] },
);

const loadMore = () => categoryStore.loadMore();

const categoryProducts = computed<Product[]>(() =>
  categoryStore.listings.map((listing) => listingToProduct(listing, slug.value)),
);

const totalItems = computed(() => categoryStore.total || categoryProducts.value.length);

const breadcrumbItems = computed(() => {
  const trail = categoryStore.breadcrumb.length
    ? categoryStore.breadcrumb
    : [{ label: categoryName.value, slug: slug.value }];
  return [
    { label: "Home", to: "/" },
    ...trail.map((crumb, i) =>
      i === trail.length - 1 ? { label: crumb.label } : { label: crumb.label, to: `/category/${crumb.slug}` },
    ),
  ];
});

const sellerName = (product: Product) =>
  product.merchantName ?? getMerchant(product.merchantSlug)?.name ?? product.merchantSlug;

const maxMonthly = ref(approvedLimit.value);
const selectedSubCategories = ref<string[]>([]);
const selectedSellers = ref<string[]>([]);
const officialOnly = ref(false);
const inStockOnly = ref(false);

watch(slug, () => {
  maxMonthly.value = approvedLimit.value;
  selectedSubCategories.value = [];
  selectedSellers.value = [];
  officialOnly.value = false;
  inStockOnly.value = false;
});

const subCategoryOptions = computed(() => {
  const counts = new Map<string, number>();
  for (const product of categoryProducts.value) {
    if (!product.subCategory) continue;
    counts.set(product.subCategory, (counts.get(product.subCategory) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
});

// Facets cover the whole category, not just the pages loaded so far.
const sellerOptions = computed(() => {
  const facets = categoryStore.facets?.merchants;
  if (facets?.length) return facets.map(({ label, count }) => ({ label, count }));
  const counts = new Map<string, number>();
  for (const product of categoryProducts.value) {
    const name = sellerName(product);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
});

function matchesEverythingExceptBudget(product: (typeof categoryProducts.value)[number]) {
  const merchant = getMerchant(product.merchantSlug);
  if (selectedSubCategories.value.length && !selectedSubCategories.value.includes(product.subCategory)) return false;
  if (selectedSellers.value.length && !selectedSellers.value.includes(sellerName(product))) return false;
  if (officialOnly.value && !(merchant?.official ?? product.merchantVerified)) return false;
  if (inStockOnly.value && product.stock === "out") return false;
  return true;
}

const filteredProducts = computed(() =>
  categoryProducts.value.filter(
    (product) => matchesEverythingExceptBudget(product) && product.fromMonthly <= maxMonthly.value,
  ),
);

const suggestedRaise = computed(() => {
  if (filteredProducts.value.length) return null;
  const candidates = categoryProducts.value
    .filter((product) => matchesEverythingExceptBudget(product) && product.fromMonthly > maxMonthly.value)
    .sort((a, b) => a.fromMonthly - b.fromMonthly);
  return candidates[0]?.fromMonthly ?? null;
});

const raisedCount = computed(() => {
  if (!suggestedRaise.value) return 0;
  return categoryProducts.value.filter(
    (product) => matchesEverythingExceptBudget(product) && product.fromMonthly <= suggestedRaise.value!,
  ).length;
});

const emptyTitle = computed(() =>
  suggestedRaise.value ? "Nothing matches your filters" : "Nothing matches all your filters",
);

const emptyDescription = computed(() => {
  if (!suggestedRaise.value) return "Try clearing a filter to see more items in this category.";
  return `Your ${formatNaira(maxMonthly.value)}/mo budget is the tightest one. Raising it to ${formatNaira(suggestedRaise.value)}/mo would show ${raisedCount.value} items in this category.`;
});

const activeChips = computed(() => {
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (maxMonthly.value < approvedLimit.value) {
    chips.push({
      key: "budget",
      label: `Under ${formatNaira(maxMonthly.value)}/mo`,
      remove: () => (maxMonthly.value = approvedLimit.value),
    });
  }
  for (const sub of selectedSubCategories.value) {
    chips.push({
      key: `sub-${sub}`,
      label: sub,
      remove: () => (selectedSubCategories.value = selectedSubCategories.value.filter((item) => item !== sub)),
    });
  }
  for (const seller of selectedSellers.value) {
    chips.push({
      key: `seller-${seller}`,
      label: seller,
      remove: () => (selectedSellers.value = selectedSellers.value.filter((item) => item !== seller)),
    });
  }
  if (officialOnly.value) {
    chips.push({ key: "official", label: "Official stores only", remove: () => (officialOnly.value = false) });
  }
  if (inStockOnly.value) {
    chips.push({ key: "stock", label: "In stock only", remove: () => (inStockOnly.value = false) });
  }
  return chips;
});

function clearAll() {
  maxMonthly.value = approvedLimit.value;
  selectedSubCategories.value = [];
  selectedSellers.value = [];
  officialOnly.value = false;
  inStockOnly.value = false;
}
</script>
