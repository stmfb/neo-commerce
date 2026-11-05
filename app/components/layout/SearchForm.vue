<template>
  <form
    class="flex flex-1 items-stretch overflow-hidden rounded-xl border border-primary-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100"
    @submit.prevent="submit"
  >
    <div class="relative flex-1">
      <svg class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-dark-300" viewBox="0 0 20 20" fill="none">
        <circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.6" />
        <path d="M14 14l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
      <input
        v-model="query"
        type="text"
        placeholder="Search generators, phones, home appliances…"
        class="w-full bg-white py-3 pl-11 pr-4 text-sm text-primary-dark-900 placeholder:text-primary-dark-300 focus:outline-none sm:py-3.5"
      />
    </div>
    <button type="submit" class="shrink-0 bg-primary-500 px-5 text-sm font-semibold text-white hover:bg-primary-600 sm:px-7">
      Search
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const route = useRoute();
const router = useRouter();
const query = ref(typeof route.query.q === "string" ? route.query.q : "");
watch(
  () => route.query.q,
  (q) => (query.value = typeof q === "string" ? q : ""),
);

function submit() {
  router.push({ path: "/search", query: query.value ? { q: query.value } : {} });
}
</script>
