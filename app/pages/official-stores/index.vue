<template>
  <div class="mx-auto max-w-[1320px] space-y-6 px-4 py-6 sm:px-6">
    <Breadcrumb :items="[{ label: 'Home', to: '/' }, { label: 'Official Stores' }]" />

    <HeroBanner variant="directory" />

    <section v-for="group in groups" :key="group.slug" class="space-y-3">
      <div class="rounded-lg px-4 py-2.5" :class="group.barColor">
        <p class="text-sm font-bold" :class="group.slug === 'phones-tablets' ? 'text-primary-dark-900' : 'text-primary-dark-800'">
          {{ group.label }}
        </p>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <MerchantTile v-for="merchant in group.merchants" :key="merchant.slug" :merchant="merchant" variant="card" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { categories } from "~/data/categories";
import { merchants } from "~/data/merchants";

const groupLabels: Record<string, string> = {
  "phones-tablets": "Phones & Accessories Brands",
  "generators-power": "Generators & Power Brands",
  "home-kitchen": "Home & Living Brands",
};

const groups = computed(() =>
  categories
    .map((category) => ({
      slug: category.slug,
      label: groupLabels[category.slug] ?? `${category.name} Brands`,
      barColor: category.barColor,
      merchants: merchants.filter((merchant) => merchant.categorySlug === category.slug),
    }))
    .filter((group) => group.merchants.length > 0),
);
</script>
