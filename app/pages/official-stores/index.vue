<template>
  <div class="mx-auto max-w-[1320px] space-y-6 px-4 py-6 sm:px-6">
    <Breadcrumb :items="[{ label: 'Home', to: '/' }, { label: 'Official Stores' }]" />

    <HeroBanner variant="directory" />

    <ShimmerMerchantGrid v-if="loading && !groups.length" :count="10" />

    <EmptyState v-else-if="error && !groups.length" title="We could not load the stores" description="Please refresh to try again." />

    <section v-for="(group, index) in groups" :key="group.category.slug" class="space-y-3">
      <div class="rounded-lg px-4 py-2.5" :class="index === 0 ? 'bg-butter-500' : 'bg-primary-100'">
        <p class="text-sm font-bold" :class="index === 0 ? 'text-primary-dark-900' : 'text-primary-dark-800'">
          {{ group.category.name }}
        </p>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <MerchantTile v-for="merchant in group.merchants" :key="merchant.id" :merchant="storeToMerchant(merchant)" variant="card" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const directoryStore = useDirectoryStore();
const { groups, loading, error } = storeToRefs(directoryStore);

// lazy: client navigations switch page immediately and show the shimmer while loading.
await useAsyncData("official-stores", () => directoryStore.fetchDirectory(), { lazy: true });
</script>
