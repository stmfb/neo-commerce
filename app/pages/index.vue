<template>
  <div class="mx-auto max-w-[1320px] space-y-8 px-4 py-6 sm:px-6">
    <div class="grid grid-cols-1 gap-4" :class="signedIn ? 'lg:grid-cols-[1fr_320px]' : ''">
      <HeroBanner :variant="signedIn ? 'home' : 'directory'" />
      <div v-if="signedIn" class="flex flex-col gap-4">
        <PromoCard
          title="Under ₦50,000"
          description="Everything you can start paying from ₦4,200/mo"
          to="/category/generators-power"
          tone="blue"
        />
        <PromoCard
          title="New this week"
          description="Fresh listings from 40 official stores"
          to="/official-stores"
          tone="purple"
        />
      </div>
    </div>

    <HomeAffordabilityWidget
      :signed-in="signedIn"
      :approved-limit="approvedLimit"
      @apply="applyBudget"
      @sign-in="toggleSignedIn"
    />

    <StatusBanner v-if="homeError" tone="warning" title="We couldn't load the latest listings">
      Please refresh to try again.
    </StatusBanner>

    <section v-if="homeCategories.length">
      <SectionHeader title="Shop by category" />
      <CategoryTileGrid :categories="homeCategories" />
    </section>
    <section v-else-if="pending">
      <ShimmerSectionHeader />
      <ShimmerCategoryGrid />
    </section>

    <ShimmerHomeRails v-if="pending && !displayedRails.length" />

    <section v-for="rail in displayedRails" :key="rail.id">
      <SectionHeader
        :title="rail.title"
        :subtitle="appliedBudget ? `Showing items you could repay at ${formatNaira(appliedBudget)}/mo or less.` : undefined"
      />
      <ProductGrid v-if="rail.products.length" :products="rail.products" :columns="6" demote-out-of-stock />
      <p v-else class="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-primary-dark-400">
        Nothing in this range fits {{ formatNaira(appliedBudget ?? 0) }}/mo yet.
      </p>
    </section>

    <section v-if="officialMerchants.length" class="rounded-2xl border border-line bg-white p-5">
      <SectionHeader title="Official stores" action-label="See all stores" action-to="/official-stores" />
      <div class="grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-3 lg:grid-cols-6">
        <MerchantTile v-for="merchant in officialMerchants" :key="merchant.slug" :merchant="merchant" variant="card" />
      </div>
    </section>
    <section v-else-if="pending" class="rounded-2xl border border-line bg-white p-5">
      <ShimmerSectionHeader action />
      <div class="border-t border-line pt-4">
        <ShimmerMerchantGrid />
      </div>
    </section>

    <section v-if="signedIn" class="rounded-2xl border border-line bg-white p-5">
      <SectionHeader title="Recently viewed" />
      <div class="border-t border-line pt-4">
        <RecentlyViewedRail :products="recentlyViewed" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { products } from "~/data/products";
import type { Category } from "~/data/categories";


const { signedIn, approvedLimit, toggleSignedIn } = useAuth();
const marketplaceStore = useMarketplaceStore();
const { loading: pending, error: homeError } = storeToRefs(marketplaceStore);

// Runs on the server for SSR; Pinia state is hydrated to the client, so no refetch.
await useAsyncData("marketplace-home", () => marketplaceStore.fetchHome(), { lazy: true });

const appliedBudget = ref<number | null>(null);

function applyBudget(value: number) {
  appliedBudget.value = value;
}

const rails = computed(() =>
  marketplaceStore.rails.map((rail) => ({
    id: rail.id,
    title: rail.title,
    products: rail.listings.map((listing) => listingToProduct(listing)),
  })),
);

const displayedRails = computed(() => {
  const budget = appliedBudget.value;
  if (!budget) return rails.value;
  return rails.value.map((rail) => ({
    ...rail,
    products: rail.products.filter((product) => product.fromMonthly <= budget),
  }));
});

const homeCategories = computed<Category[]>(() =>
  marketplaceStore.categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    image: category.image,
    tileColor: "bg-slate-100",
  })),
);

const officialMerchants = computed(() => marketplaceStore.officialStores.map(storeToMerchant));

// Still local until there is a recently-viewed endpoint.
const recentlyViewed = computed(() =>
  ["p1", "p3", "p5", "p4", "p2", "p18"].map((id) => products.find((product) => product.id === id)!),
);
</script>
