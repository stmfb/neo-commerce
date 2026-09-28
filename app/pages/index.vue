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

    <section>
      <SectionHeader title="Shop by category" />
      <CategoryTileGrid />
    </section>

    <section>
      <SectionHeader
        :title="signedIn ? `Fits your ${formatNaira(appliedBudget ?? approvedLimit)}/mo` : 'Popular this week'"
        :subtitle="appliedBudget ? `Showing items you could repay at ${formatNaira(appliedBudget)}/mo or less.` : undefined"
      />
      <ProductGrid :products="displayedProducts" :columns="6" />
    </section>

    <section class="rounded-2xl border border-line bg-white p-5">
      <SectionHeader title="Official stores" action-label="See all 40 stores" action-to="/official-stores" />
      <div class="grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-3 lg:grid-cols-6">
        <MerchantTile v-for="merchant in officialMerchants" :key="merchant.slug" :merchant="merchant" variant="card" />
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
import { merchants } from "~/data/merchants";

const { signedIn, approvedLimit, toggleSignedIn } = useAuth();

const appliedBudget = ref<number | null>(null);

function applyBudget(value: number) {
  appliedBudget.value = value;
}

const featuredProducts = computed(() =>
  ["p1", "p2", "p3", "p4", "p5", "p6"].map((id) => products.find((product) => product.id === id)!),
);

const displayedProducts = computed(() => {
  if (!appliedBudget.value) return featuredProducts.value;
  return featuredProducts.value.filter((product) => product.fromMonthly <= appliedBudget.value!);
});

const recentlyViewed = computed(() =>
  ["p1", "p3", "p5", "p4", "p2", "p18"].map((id) => products.find((product) => product.id === id)!),
);

const officialMerchants = computed(() => merchants.filter((merchant) => merchant.official));
</script>
