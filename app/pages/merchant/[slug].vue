<template>
  <div v-if="pending && !merchant" class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <ShimmerMerchantPage />
  </div>

  <div v-else-if="merchant" class="mx-auto max-w-[1320px] space-y-6 px-4 py-6 sm:px-6">
    <Breadcrumb
      :items="[{ label: 'Home', to: '/' }, { label: 'Official Stores', to: '/official-stores' }, { label: merchant.name }]" />

    <div class="overflow-hidden rounded-2xl border border-line bg-white">
      <ShimmerImg
        :src="banner"
        :alt="`${merchant.name} banner`"
        loading="eager"
        class="h-24 w-full sm:h-28"
        img-class="h-full w-full object-cover"
      >
        <template #fallback>
          <div class="h-full w-full bg-primary-dark" />
        </template>
      </ShimmerImg>
      <div class="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <div class="-mt-10 flex items-end gap-4">
            <ShimmerImg
              :src="merchant.logo"
              :alt="`${merchant.name} logo`"
              loading="eager"
              class="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white"
              img-class="h-full w-full object-cover"
            >
              <template #fallback>
                <span
                  class="font-display flex h-full w-full items-center justify-center text-xl font-bold text-white"
                  :class="merchant.tileColor">
                  {{ merchant.initials }}
                </span>
              </template>
            </ShimmerImg>
            <div class="font-display font-bold flex items-center gap-2 pb-1">
              <h1 class="text-2xl font-bold text-primary-dark">{{ merchant.name }}</h1>
              <VerifiedBadge v-if="merchant.verified" size="md" class="text-primary-500" />
              <Pill v-if="merchant.official" tone="success">Official store</Pill>
            </div>
          </div>
          <p class="mt-2 max-w-xl text-sm text-primary-dark-400 sm:ml-24">
            <template v-if="merchant.tagline">{{ merchant.tagline }} </template>
            {{ merchant.deliveryEta }}. {{ returnsPolicy ?? `${merchant.returnsNote}.` }}
          </p>
          <div v-if="categories.length" class="mt-3 flex flex-wrap gap-2 sm:ml-24">
            <NuxtLink
              v-for="category in categories"
              :key="category.slug"
              :to="`/category/${category.slug}`"
              class="rounded-full border border-line px-3 py-1 text-xs font-semibold text-primary-dark-700 hover:border-primary-300 hover:text-primary-700">
              {{ category.name }}
            </NuxtLink>
          </div>
        </div>
        <div class="flex shrink-0 gap-6">
          <div class="text-left">
            <p class="text-2xl font-bold text-primary-dark-900">{{ totalListings }}</p>
            <p class="text-xs text-primary-dark-400">listings</p>
          </div>
          <div class="text-left">
            <p class="text-2xl font-bold text-primary-dark-900">{{ deliveryWindow }}</p>
            <p class="text-xs text-primary-dark-400">typical delivery</p>
          </div>
          <div class="text-left">
            <p class="text-2xl font-bold text-primary-dark-900">{{ returnsWindow }}</p>
            <p class="text-xs text-primary-dark-400">returns window</p>
          </div>
        </div>
      </div>
    </div>

    <StatusBanner v-if="merchant.unavailable" tone="warning" :title="`${merchant.name} isn't taking orders right now`">
      You can still browse their listings, but nothing can be added to your cart until they're back. Orders
      already placed with them are unaffected.
    </StatusBanner>

    <template v-if="listings.length">
      <ProductGrid :products="listings" demote-out-of-stock />
      <ShimmerProductGrid v-if="loadingMore" :count="4" />
      <div v-if="hasMore" class="flex justify-center">
        <NcButton variant="secondary" size="sm" :loading="loadingMore" @click="merchantStore.loadMore()">
          {{ loadingMore ? "Loading more…" : "Load more" }}
        </NcButton>
      </div>
    </template>
  </div>

  <div v-else class="mx-auto max-w-[1320px] px-4 py-16 sm:px-6">
    <EmptyState
      :title="notFound ? 'This store does not exist' : 'We could not load this store'"
      :description="notFound ? 'It may have closed or moved.' : 'Please refresh to try again.'" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getMerchant } from "~/data/merchants";
import { getProductsByMerchant } from "~/data/products";

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const merchantStore = useMerchantStore();
const { loading: pending, loadingMore, errorStatus, hasMore } = storeToRefs(merchantStore);
const notFound = computed(() => errorStatus.value === 404);

// Local demo merchants still resolve without an API call.
const localMerchant = computed(() => getMerchant(slug.value));

await useAsyncData(
  () => `merchant-${slug.value}`,
  () => (localMerchant.value ? Promise.resolve(true) : merchantStore.fetchMerchant(slug.value)),
  { watch: [slug] },
);

const apiMerchant = computed(() =>
  merchantStore.merchant?.id === slug.value ? merchantStore.merchant : null,
);

const merchant = computed(() =>
  localMerchant.value ?? (apiMerchant.value ? merchantDetailToMerchant(apiMerchant.value) : undefined),
);

const listings = computed(() =>
  apiMerchant.value
    ? merchantStore.listings.map((listing) => listingToProduct(listing))
    : getProductsByMerchant(slug.value),
);
const totalListings = computed(() => (apiMerchant.value ? merchantStore.total : listings.value.length));

const banner = computed(() => apiMerchant.value?.banner);
const categories = computed(() => apiMerchant.value?.categories ?? []);
const returnsPolicy = computed(() => apiMerchant.value?.returnsPolicy || undefined);

const deliveryWindow = computed(() => {
  const eta = apiMerchant.value?.fulfilmentEtaDays;
  if (eta) return eta.min === eta.max ? `${eta.min} days` : `${eta.min}–${eta.max} days`;
  const range = merchant.value?.deliveryEta.match(/(\d+\s*[–-]\s*\d+|\d+)\s*days?/i)?.[1];
  return range ? `${range.replace(/\s+/g, "")} days` : "Varies";
});

const returnsWindow = computed(() => {
  const apiDays = apiMerchant.value?.returnsWindow;
  if (apiDays !== undefined) return apiDays > 0 ? `${apiDays} days` : "No returns";
  const days = merchant.value?.returnsNote.match(/(\d+)-day/i)?.[1];
  return days ? `${days} days` : "See policy";
});
</script>
