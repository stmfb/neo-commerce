<template>
  <div class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <Breadcrumb class="mb-4" :items="[{ label: 'Home', to: '/' }, { label: 'Cart' }]" />

    <h1 class="text-2xl font-bold text-primary-dark-900">
      Your cart
      <span v-if="!isEmpty" class="font-normal text-primary-dark-400">
        {{ itemCount }} item{{ itemCount > 1 ? "s" : "" }} from {{ sellerCount }} seller{{ sellerCount > 1 ? "s" : "" }}
      </span>
    </h1>

    <EmptyState
      v-if="!signedIn"
      class="mt-6"
      title="Sign in to see your cart"
      description="Your cart is saved to your NeoCash account. New here? You can create one with your phone number."
    >
      <template #actions>
        <NcButton size="md" @click="requestSession">Sign in or create account</NcButton>
      </template>
    </EmptyState>

    <div v-else-if="loading && !cart" class="mt-6 space-y-3">
      <Shimmer v-for="n in 3" :key="n" rounded="xl" class="h-24 w-full" />
    </div>

    <EmptyState
      v-else-if="isEmpty"
      class="mt-6"
      title="Your cart is empty"
      description="Find something you can pay for small small. You can mix sellers freely — it's still one plan."
    >
      <template #icon>
        <svg class="h-6 w-6" viewBox="0 0 20 20" fill="none">
          <path d="M4 6h12l-1 9a2 2 0 01-2 1.8H7A2 2 0 015 15L4 6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
          <path d="M7 6V4.5A2.5 2.5 0 019.5 2h1A2.5 2.5 0 0113 4.5V6" stroke="currentColor" stroke-width="1.4" />
        </svg>
      </template>
      <template #actions>
        <NcButton to="/" size="md">Start browsing</NcButton>
      </template>
    </EmptyState>

    <template v-else-if="cart">
      <div class="mb-6 mt-5 space-y-3">
        <StatusBanner v-if="sellerCount > 1" tone="dark" :title="`${sellerCount} sellers, one plan`">
          <template #icon>
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M3 7l7-4 7 4-7 4-7-4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
              <path d="M3 7v6l7 4 7-4V7" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
            </svg>
          </template>
          You'll authorise once and repay once. We split the order between the sellers behind the scenes —
          you don't choose how.
        </StatusBanner>

        <StatusBanner v-if="changes.length" tone="warning" title="Some things changed since you added them">
          <ul class="mt-1 space-y-0.5">
            <li v-for="change in changes" :key="change.cartItemId">{{ changeText(change) }}</li>
          </ul>
          <NcButton size="sm" class="mt-3" :loading="mutating > 0" @click="acceptChanges">Accept changes</NcButton>
        </StatusBanner>

        <StatusBanner v-for="rule in violations" :key="rule.code" tone="error" :title="rule.message" />
        <StatusBanner v-if="error" tone="error" :title="error" />
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div class="overflow-hidden rounded-xl border border-line bg-white">
          <CartMerchantGroup
            v-for="group in groups"
            :key="group.merchantId"
            :group="group"
            @update-qty="updateQty"
            @remove="removeItem"
          />
        </div>

        <OrderSummary
          :total="cart.total"
          :seller-count="sellerCount"
          :disabled="checking || mutating > 0 || Boolean(violations.length)"
          @checkout="proceed"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { ApiCartChange } from "~/models/cart_model";

const router = useRouter();
const { signedIn, requestSession } = useAuth();
const {
  cart,
  groups,
  itemCount,
  sellerCount,
  isEmpty,
  violations,
  changes,
  canCheckout,
  loading,
  mutating,
  error,
  revalidate,
  updateQty,
  removeItem,
  acceptChanges,
} = useCart();

const checking = ref(false);

/** Re-checks prices and stock first; any changes stay on screen for the shopper to accept. */
async function proceed() {
  checking.value = true;
  const { ok } = await revalidate();
  checking.value = false;
  if (ok && canCheckout.value) router.push("/checkout/plan");
}

function changeText(change: ApiCartChange) {
  const what = `${change.title} (${change.merchantName})`;
  switch (change.type) {
    case "price_increased":
      return `${what} went up from ${formatKobo(change.from ?? 0)} to ${formatKobo(change.to ?? 0)}.`;
    case "price_decreased":
      return `${what} dropped from ${formatKobo(change.from ?? 0)} to ${formatKobo(change.to ?? 0)}.`;
    case "stock_reduced":
      return `Only ${change.to ?? 0} of ${what} left. Accepting lowers your quantity to ${change.to ?? 0}.`;
    default:
      return `${what} is no longer available and will be removed.`;
  }
}
</script>
