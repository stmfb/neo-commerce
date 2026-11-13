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
        <p v-else-if="variantMissing" class="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
          This combination isn't available. Pick another option to continue.
        </p>

        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-primary-dark-700">Quantity</span>
          <QuantityStepper v-model="quantity" :max="quantityMax" />
        </div>

        <NcButton block size="lg" :disabled="!canAddToCart" :loading="adding || afterSignIn?.status === 'adding'" @click="handleAdd">
          {{ justAdded ? "Added to cart ✓" : "Add to cart" }}
        </NcButton>
        <p v-if="afterSignIn?.status === 'added'" role="status" class="text-xs font-medium text-emerald-600">
          You're signed in, and it's in your cart.
          <NuxtLink to="/cart" class="font-semibold underline">View cart</NuxtLink>
        </p>
        <p v-else-if="!signedIn && canAddToCart" class="text-xs text-primary-dark-400">
          You'll sign in or create a NeoCash account first, then we'll add this to your cart.
        </p>
        <p v-if="addError" class="text-xs text-rose-600">{{ addError }}</p>

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
import { computed, onBeforeUnmount, ref, watch } from "vue";
import type { Product } from "~/data/products";
import { getMerchant, type Merchant } from "~/data/merchants";

const props = defineProps<{
  product: Product;
  selectedVariants: Record<string, string>;
  /** Merchant from the API; falls back to local demo data when omitted. */
  merchant?: Merchant;
  /** Per-order cap from the API (`maxQuantity`). */
  maxQuantity?: number;
  /** The API listing; local demo products have none and can't be added. */
  listingId?: string;
  variantId?: string;
  /** The listing has variants but none matches the picked options. */
  variantMissing?: boolean;
}>();

const affordabilityStore = useAffordabilityStore();
const cartStore = useCartStore();
const { addItem } = useCart();
const { signedIn, requestSession } = useAuth();

const merchant = computed(() => props.merchant ?? getMerchant(props.product.merchantSlug));
const quantityMax = computed(() => {
  const caps = [props.product.stockCount, props.maxQuantity].filter((n): n is number => typeof n === "number");
  return caps.length ? Math.min(...caps) : 10;
});
const quantity = ref(1);
const justAdded = ref(false);
const adding = ref(false);
const addError = ref<string | null>(null);

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

const canAddToCart = computed(
  () => Boolean(props.listingId) && props.product.stock !== "out" && !variantBlocked.value && !props.variantMissing,
);

const affordability = computed(() => {
  // Compare against the shopper's chosen budget, else their known limit.
  const budget = affordabilityStore.budget;
  const cap = affordabilityStore.cap;
  if (cap === null) {
    return { text: "Set a monthly budget to see if this fits", class: "text-primary-dark-400", dot: "bg-primary-dark-300" };
  }
  const noun = budget !== null ? "budget" : "limit";
  if (props.product.fromMonthly <= cap) {
    return { text: `Fits your ${formatNaira(cap)}/mo ${noun}`, class: "text-emerald-600", dot: "bg-emerald-500" };
  }
  return { text: `Above your ${formatNaira(cap)}/mo ${noun}`, class: "text-amber-600", dot: "bg-amber-500" };
});

/** How it went, when this item was added for the shopper right after they signed in. */
const afterSignIn = computed(() =>
  props.listingId && cartStore.addedAfterSignIn?.listingId === props.listingId ? cartStore.addedAfterSignIn : null,
);
watch(
  afterSignIn,
  (outcome) => {
    if (outcome?.status === "failed") addError.value = outcome.message ?? null;
  },
  { immediate: true },
);
// Said once: leaving the page clears it.
onBeforeUnmount(() => {
  if (afterSignIn.value) cartStore.addedAfterSignIn = null;
});

/** The cart needs an account, so the item waits while they sign in or sign up, then it's added. */
function addAfterSignIn() {
  savePendingCartAdd({
    listingId: props.listingId!,
    variantId: props.variantId,
    quantity: quantity.value,
    title: props.product.name,
  });
}

async function handleAdd() {
  if (!canAddToCart.value || !props.listingId) return;
  if (!signedIn.value) {
    addAfterSignIn();
    return requestSession();
  }
  adding.value = true;
  addError.value = null;
  const result = await addItem(props.listingId, props.variantId, quantity.value);
  adding.value = false;
  if (!result.ok) {
    // The session had run out: the cart store has already asked them to sign in again.
    if (result.code === "unauthorized") return addAfterSignIn();
    addError.value = result.message ?? "We couldn't add this to your cart.";
    return;
  }
  justAdded.value = true;
  setTimeout(() => (justAdded.value = false), 1600);
}
</script>
