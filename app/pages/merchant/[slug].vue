<template>
  <div v-if="merchant" class="mx-auto max-w-[1320px] space-y-6 px-4 py-6 sm:px-6">
    <Breadcrumb :items="[{ label: 'Home', to: '/' }, { label: 'Official Stores', to: '/official-stores' }, { label: merchant.name }]" />

    <div class="overflow-hidden rounded-2xl border border-line bg-white">
      <div class="h-24 bg-primary-dark sm:h-28" />
      <div class="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div class="-mt-10 flex items-end gap-4">
          <span class="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white text-xl font-bold text-white" :class="merchant.tileColor">
            {{ merchant.initials }}
          </span>
          <div class="pb-1">
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold text-primary-dark-900">{{ merchant.name }}</h1>
              <VerifiedBadge v-if="merchant.verified" size="md" class="text-primary-500" />
              <Pill v-if="merchant.official" tone="success">Official store</Pill>
            </div>
            <p class="mt-1 max-w-xl text-sm text-primary-dark-400">
              {{ merchant.tagline }} {{ merchant.deliveryEta }}. {{ merchant.returnsNote }}, handled by the seller.
            </p>
          </div>
        </div>
        <div class="shrink-0 text-right">
          <p class="text-2xl font-bold text-primary-dark-900">{{ listings.length }}</p>
          <p class="text-xs text-primary-dark-400">listings</p>
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
</script>
