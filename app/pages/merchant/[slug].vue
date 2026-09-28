<template>
  <div v-if="merchant" class="mx-auto max-w-[1320px] space-y-6 px-4 py-6 sm:px-6">
    <Breadcrumb
      :items="[{ label: 'Home', to: '/' }, { label: 'Official Stores', to: '/official-stores' }, { label: merchant.name }]" />

    <div class="overflow-hidden rounded-2xl border border-line bg-white">
      <div class="h-24 bg-primary-dark sm:h-28" />
      <div class="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <div class="-mt-10 flex items-end gap-4">
            <span
              class="font-display flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white text-xl font-bold text-white"
              :class="merchant.tileColor">
              {{ merchant.initials }}
            </span>
            <div class="font-display font-bold flex items-center gap-2 pb-1">
              <h1 class="text-2xl font-bold text-primary-dark">{{ merchant.name }}</h1>
              <VerifiedBadge v-if="merchant.verified" size="md" class="text-primary-500" />
              <Pill v-if="merchant.official" tone="success">Official store</Pill>
            </div>
          </div>
          <p class="mt-2 max-w-xl text-sm text-primary-dark-400 sm:ml-24">
            {{ merchant.tagline }} {{ merchant.deliveryEta }}. {{ merchant.returnsNote }}.
          </p>
        </div>
        <div class="flex shrink-0 gap-6">
          <div class="text-left">
            <p class="text-2xl font-bold text-primary-dark-900">{{ listings.length }}</p>
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

    <ProductGrid v-if="listings.length" :products="listings" demote-out-of-stock />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getMerchant } from "~/data/merchants";
import { getProductsByMerchant } from "~/data/products";

const route = useRoute();
const merchant = computed(() => getMerchant(route.params.slug as string));
const listings = computed(() => getProductsByMerchant(route.params.slug as string));

const deliveryWindow = computed(() => {
  const range = merchant.value?.deliveryEta.match(/(\d+\s*[–-]\s*\d+|\d+)\s*days?/i)?.[1];
  return range ? `${range.replace(/\s+/g, "")} days` : "Varies";
});

const returnsWindow = computed(() => {
  const days = merchant.value?.returnsNote.match(/(\d+)-day/i)?.[1];
  return days ? `${days} days` : "See policy";
});
</script>
