<template>
  <div v-if="product" class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <Breadcrumb class="mb-4" :items="breadcrumbItems" />

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[380px_minmax(0,1fr)_300px]">
      <div>
        <ImagePlaceholder class="aspect-square w-full" />
        <div class="mt-3 grid grid-cols-5 gap-2">
          <ImagePlaceholder v-for="n in 5" :key="n" class="aspect-square w-full" />
        </div>
      </div>

      <div class="space-y-5">
        <div>
          <h1 class="text-2xl font-bold text-primary-dark-900">{{ product.name }}</h1>
          <div class="mt-2 flex items-center gap-2">
            <span :class="product.stock === 'out' ? 'text-primary-dark-300 line-through' : 'text-primary-dark-900'" class="text-2xl font-bold">
              {{ formatNaira(product.price) }}
            </span>
            <span v-if="product.bnplEligible && product.fromMonthly" class="rounded-full bg-primary-dark px-2.5 py-1 text-xs font-semibold text-white">
              from {{ formatNaira(product.fromMonthly) }}/mo
            </span>
          </div>
          <NuxtLink :to="`/merchant/${merchant?.slug}`" class="mt-2 flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
            Sold by {{ merchant?.name }}
            <VerifiedBadge v-if="merchant?.verified" size="sm" />
            <span>&rsaquo;</span>
          </NuxtLink>
          <p class="mt-1 text-xs text-primary-dark-400">
            {{ merchant?.name }} is the seller. NeoCash finances your purchase.
          </p>
        </div>

        <div class="space-y-2 border-y border-line py-4 text-sm">
          <p v-if="product.stock === 'low'" class="flex items-center gap-2 text-rose-600">
            <IconBox /> Only {{ product.stockCount }} left in stock
          </p>
          <p class="flex items-center gap-2 text-primary-dark-700">
            <IconTruck /> {{ merchant?.deliveryEta }}
          </p>
          <p class="flex items-center gap-2 text-primary-dark-700">
            <IconReturn /> {{ merchant?.returnsNote }}
          </p>
        </div>

        <div v-for="group in product.variants ?? []" :key="group.name">
          <p class="mb-2 text-sm font-semibold text-primary-dark-900">{{ group.name }}</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in group.options"
              :key="option.label"
              type="button"
              :disabled="!option.inStock"
              class="rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:text-primary-dark-300 disabled:line-through"
              :class="
                selectedVariants[group.name] === option.label
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-line text-primary-dark-700 hover:border-primary-300'
              "
              @click="selectedVariants[group.name] = option.label"
            >
              {{ option.label }}
            </button>
          </div>
          <p v-if="outOfStockOptions(group).length" class="mt-2 text-xs text-primary-dark-400">
            {{ outOfStockOptions(group).join(", ") }} {{ outOfStockOptions(group).length > 1 ? "are" : "is" }} out of
            stock. {{ inStockOptionsLabel(group) }} {{ group.options.filter((o) => o.inStock).length > 1 ? "are" : "is" }} available.
          </p>
        </div>

        <div v-if="product.description" class="rounded-xl border border-line bg-white p-4">
          <p class="text-sm font-bold text-primary-dark-900">About this item</p>
          <p class="mt-2 text-sm leading-relaxed text-primary-dark-600">{{ product.description }}</p>
          <dl v-if="product.specs?.length" class="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 text-sm">
            <div v-for="spec in product.specs" :key="spec.label">
              <dt class="text-primary-dark-400">{{ spec.label }}</dt>
              <dd class="font-semibold text-primary-dark-900">{{ spec.value }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <ProductBuyBox :product="product" :selected-variants="selectedVariants" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import { getProduct, type ProductVariantGroup } from "~/data/products";
import { getMerchant } from "~/data/merchants";
import { getCategory } from "~/data/categories";

const route = useRoute();
const product = computed(() => getProduct(route.params.slug as string));
const merchant = computed(() => (product.value ? getMerchant(product.value.merchantSlug) : undefined));
const category = computed(() => (product.value ? getCategory(product.value.categorySlug) : undefined));

const selectedVariants = reactive<Record<string, string>>({});

if (product.value?.variants) {
  for (const group of product.value.variants) {
    const firstAvailable = group.options.find((option) => option.inStock) ?? group.options[0];
    selectedVariants[group.name] = firstAvailable.label;
  }
}

const breadcrumbItems = computed(() => {
  if (!product.value) return [{ label: "Home", to: "/" }];
  return [
    { label: "Home", to: "/" },
    { label: category.value?.name ?? "Category", to: `/category/${product.value.categorySlug}` },
    { label: product.value.subCategory },
    { label: product.value.name },
  ];
});

function outOfStockOptions(group: ProductVariantGroup) {
  return group.options.filter((option) => !option.inStock).map((option) => option.label);
}
function inStockOptionsLabel(group: ProductVariantGroup) {
  return group.options
    .filter((option) => option.inStock)
    .map((option) => option.label)
    .join(" and ");
}
</script>
