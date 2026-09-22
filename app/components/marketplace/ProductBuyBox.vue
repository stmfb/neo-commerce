<template>
  <aside class="h-fit space-y-4 lg:sticky lg:top-28">
    <div class="rounded-xl border border-line bg-white p-5">
      <p class="text-2xl font-bold text-primary-dark-900">{{ formatNaira(product.price) }}</p>

      <div v-if="product.stock === 'out'" class="mt-4 space-y-3">
        <StatusBanner tone="warning" :title="`Out of stock at ${merchant?.name}`">
          We'll tell you when it's back.
        </StatusBanner>
        <NcButton block size="lg" disabled>Add to cart</NcButton>
        <NcButton block size="sm" variant="secondary" disabled>Notify me when available</NcButton>
        <NuxtLink :to="`/category/${product.categorySlug}`" class="block text-center text-sm font-semibold text-primary-600 hover:text-primary-700">
          Browse similar {{ product.subCategory.toLowerCase() }}
        </NuxtLink>
      </div>

      <div v-else-if="!product.bnplEligible" class="mt-4 space-y-3">
        <StatusBanner tone="warning" title="Not available on Pay Small Small">
          This seller hasn't enabled Pay Small Small on this item, so it can't be added to a NeoCash cart.
          You can still browse it and see the seller's details.
        </StatusBanner>
        <NuxtLink :to="`/category/${product.categorySlug}`" class="block text-center text-sm font-semibold text-primary-600 hover:text-primary-700">
          Browse eligible items
        </NuxtLink>
      </div>

      <div v-else class="mt-4 space-y-4">
        <div class="rounded-lg bg-primary-50 px-3 py-2.5">
          <p class="text-xs font-medium text-primary-600">Pay small small from</p>
          <p class="text-lg font-bold text-primary-700">{{ formatNaira(product.fromMonthly) }}/mo</p>
        </div>

        <p class="flex items-center gap-1.5 text-xs font-medium" :class="affordability.class">
          <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="affordability.dot" />
          {{ affordability.text }}
        </p>

        <p v-if="variantBlocked" class="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
          {{ blockedGroupName }} — {{ blockedOptionLabel }} is out of stock. Pick another option to continue.
        </p>

        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-primary-dark-700">Quantity</span>
          <QuantityStepper v-model="quantity" :max="product.stockCount ?? 10" />
        </div>

        <NcButton block size="lg" :disabled="!canAddToCart" @click="handleAdd">
          {{ justAdded ? "Added to cart ✓" : "Add to cart" }}
        </NcButton>
        <NcButton block size="sm" variant="secondary">Save for later</NcButton>

        <div class="space-y-1.5 border-t border-line pt-3 text-xs text-primary-dark-400">
          <p>{{ merchant?.deliveryEta }}</p>
          <p>{{ merchant?.returnsNote }}</p>
          <p>{{ merchant?.name }} is the seller. NeoCash finances this purchase.</p>
        </div>
      </div>
    </div>

    <NuxtLink v-if="merchant" :to="`/merchant/${merchant.slug}`" class="flex items-center gap-3 rounded-xl border border-line bg-white p-4">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" :class="merchant.tileColor">
        {{ merchant.initials }}
      </span>
      <span class="min-w-0 flex-1">
        <span class="flex items-center gap-1 text-sm font-semibold text-primary-dark-900">
          {{ merchant.name }}
          <VerifiedBadge v-if="merchant.verified" size="sm" />
        </span>
        <span class="text-xs text-primary-600">Visit store</span>
      </span>
      <span class="text-primary-dark-300">&rsaquo;</span>
    </NuxtLink>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { Product } from "~/data/products";
import { getMerchant } from "~/data/merchants";

const props = defineProps<{ product: Product; selectedVariants: Record<string, string> }>();

const { signedIn, approvedLimit } = useAuth();
const { addItem } = useCart();

const merchant = computed(() => getMerchant(props.product.merchantSlug));
const quantity = ref(1);
const justAdded = ref(false);

const blockedGroup = computed(() => {
  for (const group of props.product.variants ?? []) {
    const option = group.options.find((item) => item.label === props.selectedVariants[group.name]);
    if (option && !option.inStock) return { group: group.name, option: option.label };
  }
  return null;
});
const variantBlocked = computed(() => blockedGroup.value !== null);
const blockedGroupName = computed(() => blockedGroup.value?.group ?? "");
const blockedOptionLabel = computed(() => blockedGroup.value?.option ?? "");

const canAddToCart = computed(() => props.product.stock !== "out" && !variantBlocked.value);

const affordability = computed(() => {
  if (!signedIn.value) {
    return { text: "Sign in to see if this fits your budget", class: "text-primary-dark-400", dot: "bg-primary-dark-300" };
  }
  if (props.product.fromMonthly <= approvedLimit.value) {
    return { text: `Fits your ${formatNaira(approvedLimit.value)}/mo limit`, class: "text-emerald-600", dot: "bg-emerald-500" };
  }
  return { text: `Above your ${formatNaira(approvedLimit.value)}/mo limit`, class: "text-amber-600", dot: "bg-amber-500" };
});

function handleAdd() {
  if (!canAddToCart.value) return;
  const variantLabel = Object.values(props.selectedVariants).join(" · ") || undefined;
  addItem(props.product, variantLabel, quantity.value);
  justAdded.value = true;
  setTimeout(() => (justAdded.value = false), 1600);
}
</script>
