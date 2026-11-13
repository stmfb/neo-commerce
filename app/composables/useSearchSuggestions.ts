import { computed, onScopeDispose, ref, shallowRef, watch, type Ref } from "vue";
import type { SearchSuggestions } from "~/models/marketplace_model";

/** Wait for a pause in typing, so "iphone" typed quickly is one request, not six. */
const DEBOUNCE_MS = 250;

/**
 * Answers already fetched in this tab, so retyping or backspacing over a query is instant.
 * Module scope, so the header's desktop and mobile search boxes share it. Only written in
 * the browser (fetches start from typing), so SSR requests never share it.
 */
const cache = createTtlCache<SearchSuggestions>({ max: 50, ttlMs: 5 * 60_000 });

/**
 * Search-as-you-type for a search box, fetched only while `enabled` (the list is open).
 * Fetches are debounced and cached per query, and a newer query aborts the older request.
 * The previous suggestions stay up until new ones arrive (`stale` says so), so the list
 * doesn't flash empty on every keystroke.
 */
export function useSearchSuggestions(input: Ref<string>, enabled: Ref<boolean>) {
  const term = computed(() => normaliseSearchTerm(input.value));

  const suggestions = shallowRef<SearchSuggestions | null>(null);
  const loading = ref(false);
  const error = ref(false);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;

  function cancel() {
    clearTimeout(timer);
    controller?.abort();
    controller = undefined;
    loading.value = false;
  }

  async function load(q: string) {
    const current = (controller = new AbortController());
    try {
      const result = await $fetch<SearchSuggestions>("/api/search/suggest", {
        params: { q },
        signal: current.signal,
        // A retry would land after the shopper has typed on; the next keystroke asks again.
        retry: 0,
      });
      if (current.signal.aborted) return;
      cache.set(q, result);
      suggestions.value = result;
    } catch {
      if (!current.signal.aborted) error.value = true;
    } finally {
      if (controller === current) {
        controller = undefined;
        loading.value = false;
      }
    }
  }

  watch(
    [term, enabled],
    ([q, on]) => {
      cancel();
      if (!on || !import.meta.client) return;
      error.value = false;

      if (q.length < SUGGEST_MIN_CHARS) {
        suggestions.value = null;
        return;
      }
      const cached = cache.get(q);
      if (cached) {
        suggestions.value = cached;
        return;
      }
      loading.value = true;
      timer = setTimeout(() => load(q), DEBOUNCE_MS);
    },
    { immediate: true },
  );

  onScopeDispose(cancel);

  /** True while the suggestions on screen answer an earlier query. */
  const stale = computed(() => suggestions.value !== null && suggestions.value.q !== term.value);

  return { term, suggestions, loading, error, stale };
}
