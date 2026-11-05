<template>
  <div class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <Breadcrumb class="mb-4" :items="[{ label: 'Home', to: '/' }, { label: 'Search' }]" />

    <ShimmerCategoryPage v-if="initialLoading" />

    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <!-- Phones/tablets: filters collapse behind a toggle so results are visible first. -->
      <button
        type="button"
        class="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-primary-dark-900 lg:hidden"
        :aria-expanded="filtersOpen"
        aria-controls="search-filters"
        @click="filtersOpen = !filtersOpen"
      >
        <span class="flex items-center gap-2">
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M6 10h8M8.5 15h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          Filters
          <span v-if="chips.length" class="rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">
            {{ chips.length }}
          </span>
        </span>
        <svg class="h-4 w-4 transition-transform" :class="{ 'rotate-180': filtersOpen }" viewBox="0 0 20 20" fill="none">
          <path d="M5 8l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <SearchFilters
        id="search-filters"
        :class="filtersOpen ? 'block' : 'hidden lg:block'"
        :selected="query"
        :brands="searchStore.brands"
        :merchants="searchStore.merchants"
        :conditions="searchStore.conditions"
        :limit="approvedLimit"
        @change="update"
      />

      <div class="min-w-0">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div class="min-w-0">
            <h1 class="truncate text-2xl font-bold text-primary-dark-900">
              <template v-if="query.q">Results for “{{ query.q }}”</template>
              <template v-else>All products</template>
            </h1>
            <p class="mt-1 text-sm text-primary-dark-400">
              <template v-if="loading">Searching…</template>
              <template v-else>{{ total }} {{ total === 1 ? "result" : "results" }}</template>
            </p>
          </div>

          <label class="flex shrink-0 items-center gap-2 text-sm text-primary-dark-500">
            Sort by
            <select
              :value="query.sort ?? 'relevance'"
              class="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-primary-dark-900 focus:border-primary-500 focus:outline-none"
              @change="update({ sort: ($event.target as HTMLSelectElement).value as ListingSort })"
            >
              <option v-for="option in SEARCH_SORTS" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>

        <div v-if="chips.length" class="mb-4 flex flex-wrap items-center gap-2">
          <Pill v-for="chip in chips" :key="chip.key" tone="primary" removable @remove="update(chip.patch)">
            {{ chip.label }}
          </Pill>
          <button type="button" class="text-xs font-semibold text-primary-600 hover:text-primary-700" @click="clearFilters">
            Clear all
          </button>
        </div>

        <StatusBanner v-if="error" tone="warning" title="Search isn't working right now" class="mb-4">
          Please try again in a moment.
        </StatusBanner>

        <!-- Re-searching (filter/sort change): shimmer in place of the old results. -->
        <ShimmerProductGrid v-if="loading" :count="8" />

        <template v-else-if="productResults.length">
          <ProductGrid :products="productResults" demote-out-of-stock />
          <ShimmerProductGrid v-if="loadingMore" :count="4" class="mt-4" />
          <div v-if="hasMore" class="mt-6 flex justify-center">
            <NcButton variant="secondary" size="sm" :loading="loadingMore" @click="searchStore.loadMore()">
              {{ loadingMore ? "Loading more…" : "Load more" }}
            </NcButton>
          </div>
        </template>

        <EmptyState
          v-else-if="!error"
          :title="query.q ? `No results for “${query.q}”` : 'No results'"
          :description="empty?.message ?? 'Try a different search.'"
        >
          <template #icon>
            <svg class="h-6 w-6" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5" />
              <path d="M13.5 13.5L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </template>
          <template #actions>
            <NcButton v-if="chips.length" size="sm" @click="clearFilters">Clear filters</NcButton>
            <NcButton
              v-for="category in empty?.suggestedCategories ?? []"
              :key="category.slug"
              :to="`/category/${category.slug}`"
              variant="secondary"
              size="sm"
            >
              {{ category.name }}
            </NcButton>
          </template>
        </EmptyState>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ApiFacetOption, ListingSort, SearchQuery } from "~/models/marketplace_model";

const route = useRoute();
const router = useRouter();
const { approvedLimit } = useAuth();

const searchStore = useSearchStore();
const { loading, loadingMore, error, total, empty, hasMore } = storeToRefs(searchStore);

// The URL is the source of truth: shareable, bookmarkable, back-button friendly.
const query = computed(() => searchQueryFromRoute(route.query));
const queryKey = computed(() => searchQueryKey(query.value));

await useAsyncData(
  () => `search-${queryKey.value}`,
  () => searchStore.search(query.value),
  // lazy: client navigations switch page immediately and show the shimmer while loading.
  { watch: [queryKey], lazy: true },
);

useHead(() => ({ title: query.value.q ? `“${query.value.q}” · NeoCash Marketplace` : "Search · NeoCash Marketplace" }));

const productResults = computed(() => searchStore.listings.map((listing) => listingToProduct(listing)));
// Full-page shimmer only before the first results; later searches shimmer just the grid.
const initialLoading = computed(() => loading.value && !searchStore.loaded);

const filtersOpen = ref(false);
watch(() => query.value.q, () => (filtersOpen.value = false));

/** Merges a filter change into the URL; the watcher above runs the search. */
function update(patch: Partial<SearchQuery>) {
  router.replace({ path: "/search", query: searchQueryToRoute({ ...query.value, ...patch }) });
}

function clearFilters() {
  router.replace({ path: "/search", query: searchQueryToRoute({ q: query.value.q, sort: query.value.sort }) });
}

const labelFor = (options: ApiFacetOption[], id: string) => options.find((o) => o.id === id)?.label ?? id;

const chips = computed(() => {
  const q = query.value;
  const out: { key: string; label: string; patch: Partial<SearchQuery> }[] = [];
  for (const id of q.brand ?? []) {
    out.push({ key: `brand-${id}`, label: labelFor(searchStore.brands, id), patch: { brand: q.brand!.filter((v) => v !== id) } });
  }
  for (const id of q.merchant ?? []) {
    out.push({
      key: `merchant-${id}`,
      label: labelFor(searchStore.merchants, id),
      patch: { merchant: q.merchant!.filter((v) => v !== id) },
    });
  }
  for (const id of q.condition ?? []) {
    out.push({
      key: `condition-${id}`,
      label: labelFor(searchStore.conditions, id),
      patch: { condition: q.condition!.filter((v) => v !== id) },
    });
  }
  if (q.minPrice || q.maxPrice) {
    const min = q.minPrice ? formatNaira(koboToNaira(q.minPrice)) : null;
    const max = q.maxPrice ? formatNaira(koboToNaira(q.maxPrice)) : null;
    const label = min && max ? `${min} – ${max}` : min ? `From ${min}` : `Up to ${max}`;
    out.push({ key: "price", label, patch: { minPrice: undefined, maxPrice: undefined } });
  }
  if (q.maxMonthly) {
    out.push({
      key: "monthly",
      label: `Under ${formatNaira(koboToNaira(q.maxMonthly))}/mo`,
      patch: { maxMonthly: undefined },
    });
  }
  return out;
});
</script>
