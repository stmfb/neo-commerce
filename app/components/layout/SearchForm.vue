<template>
  <div ref="root" class="relative flex min-w-0 flex-1" @focusout="onFocusOut">
    <form
      role="search"
      class="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-xl border border-primary-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100"
      @submit.prevent="submit"
    >
      <div class="relative flex-1">
        <svg
          v-if="loading"
          class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary-500"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" />
          <path d="M17 10a7 7 0 0 0-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <svg
          v-else
          class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-dark-300"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.6" />
          <path d="M14 14l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
        <input
          ref="inputEl"
          v-model="query"
          type="text"
          role="combobox"
          aria-label="Search products"
          aria-autocomplete="list"
          :aria-expanded="showPanel"
          :aria-controls="showPanel ? listboxId : undefined"
          :aria-activedescendant="showPanel && activeOption ? optionId(activeIndex) : undefined"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          enterkeyhint="search"
          placeholder="Search generators, phones, home appliances…"
          class="w-full bg-white py-3 pl-11 pr-10 text-sm text-primary-dark-900 placeholder:text-primary-dark-300 focus:outline-none sm:py-3.5"
          @focus="open = true"
          @click="open = true"
          @input="open = true"
          @keydown="onKeydown"
        />
        <button
          v-if="query"
          type="button"
          aria-label="Clear search"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-primary-dark-300 hover:bg-slate-50 hover:text-primary-dark-600"
          @mousedown.prevent
          @click="clearQuery"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <button type="submit" class="shrink-0 bg-primary-500 px-5 text-sm font-semibold text-white hover:bg-primary-600 sm:px-7">
        Search
      </button>
    </form>

    <!-- mousedown.prevent keeps focus in the input, so picking an option doesn't blur-close the list first. -->
    <div
      v-if="showPanel"
      class="absolute inset-x-0 top-full z-40 mt-2 max-h-[min(70vh,34rem)] overflow-y-auto overscroll-contain rounded-xl border border-line bg-white py-2 shadow-popover"
      @mousedown.prevent
    >
      <div :id="listboxId" role="listbox" aria-label="Search suggestions">
        <div
          v-for="section in sections"
          :key="section.key"
          role="group"
          :aria-labelledby="`${uid}-${section.key}`"
          class="pb-1 transition-opacity"
          :class="stale && section.fromApi ? 'opacity-60' : ''"
        >
          <div class="flex items-center justify-between px-4 pb-1 pt-1.5">
            <p :id="`${uid}-${section.key}`" class="text-xs font-semibold uppercase tracking-wide text-primary-dark-400">
              {{ section.title }}
            </p>
            <button
              v-if="section.key === 'recent'"
              type="button"
              tabindex="-1"
              class="text-xs font-semibold text-primary-600 hover:text-primary-700"
              @click="recentStore.clear()"
            >
              Clear
            </button>
          </div>

          <NuxtLink
            v-for="option in section.options"
            :id="optionId(option.index)"
            :key="option.key"
            :to="option.to"
            role="option"
            tabindex="-1"
            :aria-selected="option.index === activeIndex"
            class="flex items-center gap-3 px-4 py-2 text-sm text-primary-dark-700"
            :class="option.index === activeIndex ? 'bg-primary-50' : ''"
            @mousemove="activeIndex = option.index"
            @click="pick(option)"
          >
            <ShimmerImg
              v-if="option.kind === 'store'"
              :src="option.store.logo"
              class="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-line"
              img-class="h-full w-full object-contain"
            >
              <template #fallback>
                <span class="flex h-full w-full items-center justify-center bg-primary-dark-950 text-[11px] font-semibold text-white">
                  {{ option.initials }}
                </span>
              </template>
            </ShimmerImg>
            <span v-else class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-primary-dark-400">
              <svg v-if="option.kind === 'recent'" class="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5" />
                <path d="M10 6v4l2.5 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg v-else-if="option.kind === 'query'" class="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5" />
                <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              <svg v-else class="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="5.5" height="5.5" rx="1.2" stroke="currentColor" stroke-width="1.5" />
                <rect x="11.5" y="3" width="5.5" height="5.5" rx="1.2" stroke="currentColor" stroke-width="1.5" />
                <rect x="3" y="11.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" stroke-width="1.5" />
                <rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" stroke-width="1.5" />
              </svg>
            </span>

            <span class="flex min-w-0 flex-1 items-center gap-1">
              <span class="truncate">
                <template v-for="(part, i) in option.parts" :key="i">
                  <strong v-if="part.match" class="font-semibold text-primary-dark-900">{{ part.text }}</strong>
                  <template v-else>{{ part.text }}</template>
                </template>
              </span>
              <VerifiedBadge v-if="option.kind === 'store' && option.store.verified" size="sm" class="shrink-0" />
            </span>
            <span v-if="option.kind === 'category'" class="shrink-0 text-xs text-primary-dark-300">Category</span>
            <span v-else-if="option.kind === 'store'" class="shrink-0 text-xs text-primary-dark-300">Store</span>
          </NuxtLink>
        </div>

        <!-- Announced through the live region below, so hidden from screen readers here. -->
        <div v-if="showSkeleton" aria-hidden="true" class="pb-1">
          <div v-for="width in skeletonWidths" :key="width" class="flex items-center gap-3 px-4 py-2">
            <Shimmer class="h-8 w-8 shrink-0" rounded="lg" />
            <Shimmer class="h-3.5" :style="{ width }" />
          </div>
        </div>
        <p v-else-if="error" aria-hidden="true" class="px-4 py-2 text-sm text-primary-dark-400">
          Suggestions aren't loading right now. You can still search.
        </p>

        <NuxtLink
          v-if="allOption"
          :id="optionId(allOption.index)"
          :to="allOption.to"
          role="option"
          tabindex="-1"
          :aria-selected="allOption.index === activeIndex"
          class="mt-1 flex items-center gap-3 border-t border-line px-4 py-2.5 text-sm font-semibold text-primary-600"
          :class="allOption.index === activeIndex ? 'bg-primary-50' : ''"
          @mousemove="activeIndex = allOption.index"
          @click="pick(allOption)"
        >
          <svg class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.6" />
            <path d="M14 14l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <span class="min-w-0 truncate">Search for “{{ allOption.term }}”</span>
        </NuxtLink>
      </div>
    </div>

    <p class="sr-only" aria-live="polite">{{ statusText }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from "vue";
import type { RouteLocationRaw } from "vue-router";
import type { ApiCategory, ApiOfficialStore } from "~/models/marketplace_model";

type TextPart = ReturnType<typeof highlightMatches>[number];
type OptionBase = { key: string; to: RouteLocationRaw; index: number; parts: TextPart[] };
/** A row inside one of the titled sections. */
type ListOption =
  | (OptionBase & { kind: "recent" | "query"; term: string })
  | (OptionBase & { kind: "category" })
  | (OptionBase & { kind: "store"; store: ApiOfficialStore; initials: string });
/** The "Search for …" row pinned at the bottom. */
type AllOption = Omit<OptionBase, "parts"> & { kind: "all"; term: string };
type SuggestionOption = ListOption | AllOption;

const MAX_CATEGORIES = 4;
const MAX_BROWSE = 6;
const skeletonWidths = ["55%", "40%", "48%"];

const route = useRoute();
const router = useRouter();
const marketplaceStore = useMarketplaceStore();
const recentStore = useRecentSearchesStore();

const root = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);
const uid = useId();
const listboxId = `${uid}-listbox`;
const optionId = (index: number) => `${uid}-option-${index}`;

const query = ref(typeof route.query.q === "string" ? route.query.q : "");
watch(
  () => route.query.q,
  (q) => (query.value = typeof q === "string" ? q : ""),
);

const open = ref(false);
const activeIndex = ref(-1);
const { term, suggestions, loading, error, stale } = useSearchSuggestions(query, open);

/** What the shopper typed, as shown back to them (`term` is the normalised form). */
const typed = computed(() => query.value.trim().replace(/\s+/g, " "));
const searchTo = (q: string): RouteLocationRaw => ({ path: "/search", query: { q } });

const layout = computed(() => {
  // Options are numbered as they're built, in display order: the order the arrow keys walk.
  let index = 0;
  const sections: { key: string; title: string; fromApi: boolean; options: ListOption[] }[] = [];
  const addSection = (key: string, title: string, options: ListOption[], fromApi = false) => {
    if (options.length) sections.push({ key, title, fromApi, options });
  };
  const searchOption = (kind: "recent" | "query", t: string): ListOption => ({
    kind,
    key: `${kind}-${t}`,
    to: searchTo(t),
    term: t,
    parts: highlightMatches(t, term.value),
    index: index++,
  });
  const categoryOption = (category: ApiCategory): ListOption => ({
    kind: "category",
    key: `category-${category.slug}`,
    to: `/category/${category.slug}`,
    parts: highlightMatches(category.name, term.value),
    index: index++,
  });

  // Empty box: what they searched before, then somewhere to start browsing.
  if (!term.value) {
    addSection("recent", "Recent searches", recentStore.terms.map((t) => searchOption("recent", t)));
    addSection("browse", "Browse categories", marketplaceStore.categories.slice(0, MAX_BROWSE).map(categoryOption));
    return { sections, allOption: null };
  }

  const fromApi = suggestions.value;
  addSection(
    "queries",
    "Searches",
    (fromApi?.queries ?? []).map((q) => searchOption("query", q)),
    true,
  );

  // Category names also match locally, so they show from the first keystroke, before the API answers.
  const local = marketplaceStore.categories.filter((category) => matchesWordPrefixes(category.name, term.value));
  const categories = [...local, ...(fromApi?.categories ?? [])]
    .filter((category, i, all) => all.findIndex((c) => c.slug === category.slug) === i)
    .slice(0, MAX_CATEGORIES);
  addSection("categories", "Categories", categories.map(categoryOption));

  addSection(
    "stores",
    "Stores",
    (fromApi?.merchants ?? []).map(
      (store): ListOption => ({
        kind: "store",
        key: `store-${store.id}`,
        to: `/merchant/${store.id}`,
        store,
        // Shown when there's no logo, as on the store tiles.
        initials: storeToMerchant(store).initials,
        parts: highlightMatches(store.name, term.value),
        index: index++,
      }),
    ),
    true,
  );

  const allOption: AllOption = { kind: "all", key: "all", to: searchTo(typed.value), term: typed.value, index: index++ };
  return { sections, allOption };
});

const sections = computed(() => layout.value.sections);
const allOption = computed(() => layout.value.allOption);
const flatOptions = computed(() => [
  ...sections.value.flatMap((section) => section.options),
  ...(allOption.value ? [allOption.value] : []),
]);
const activeOption = computed(() => flatOptions.value[activeIndex.value] ?? null);

const showSkeleton = computed(() => loading.value && !suggestions.value && term.value.length >= SUGGEST_MIN_CHARS);
const showPanel = computed(() => open.value && (flatOptions.value.length > 0 || showSkeleton.value));

const statusText = computed(() => {
  if (!showPanel.value || !term.value) return "";
  if (showSkeleton.value) return "Loading suggestions…";
  if (error.value) return "Suggestions aren't loading right now.";
  const count = flatOptions.value.length - 1; // not counting the "Search for" row
  return count > 0 ? `${count} ${count === 1 ? "suggestion" : "suggestions"}. Use the arrow keys to browse.` : "No suggestions.";
});

// New query or new results: the old highlight no longer points at the same thing.
watch([term, suggestions], () => (activeIndex.value = -1));

watch(activeIndex, async (index) => {
  if (index < 0) return;
  await nextTick();
  document.getElementById(optionId(index))?.scrollIntoView({ block: "nearest" });
});

watch(() => route.fullPath, close);

function close() {
  open.value = false;
  activeIndex.value = -1;
}

/** Closes when focus leaves the box and its list (Tab away, tap elsewhere). */
function onFocusOut(event: FocusEvent) {
  if (!root.value?.contains(event.relatedTarget as Node | null)) close();
}

function onKeydown(event: KeyboardEvent) {
  if (event.isComposing) return;
  const count = flatOptions.value.length;

  switch (event.key) {
    case "ArrowDown":
    case "ArrowUp": {
      event.preventDefault();
      if (!open.value) {
        open.value = true;
        return;
      }
      if (!count) return;
      // -1 is the input itself: arrowing past either end comes back to what was typed.
      let next = activeIndex.value + (event.key === "ArrowDown" ? 1 : -1);
      if (next >= count) next = -1;
      else if (next < -1) next = count - 1;
      activeIndex.value = next;
      break;
    }
    case "Enter":
      // With nothing highlighted, Enter falls through to the form's submit.
      if (showPanel.value && activeOption.value) {
        event.preventDefault();
        const option = activeOption.value;
        pick(option);
        navigateTo(option.to);
      }
      break;
    case "Escape":
      if (open.value) {
        event.preventDefault();
        close();
      }
      break;
    case "Tab":
      close();
      break;
  }
}

/** Shared by click (the link navigates itself) and Enter (navigates after). */
function pick(option: SuggestionOption) {
  if (option.kind === "recent" || option.kind === "query" || option.kind === "all") {
    recentStore.add(option.term);
    query.value = option.term;
  }
  close();
  // Drops the on-screen keyboard on phones so the results are visible.
  inputEl.value?.blur();
}

function clearQuery() {
  query.value = "";
  open.value = true;
  inputEl.value?.focus();
}

function submit() {
  const q = typed.value;
  if (q) recentStore.add(q);
  close();
  inputEl.value?.blur();
  router.push({ path: "/search", query: q ? { q } : {} });
}
</script>
