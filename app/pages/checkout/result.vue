<template>
  <div class="mx-auto max-w-[640px] px-4 py-10 sm:px-6">
    <ShimmerRegion v-if="loading" label="Loading your order">
      <Shimmer rounded="2xl" class="h-96" />
    </ShimmerRegion>

    <div v-else-if="result" class="rounded-2xl border border-line bg-white p-6 text-center sm:p-8">
      <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg class="h-7 w-7" viewBox="0 0 20 20" fill="none">
          <path d="M4 10.5l4 4 8-8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>

      <template v-if="result.subOrders.length > 1">
        <h1 class="mt-5 text-2xl font-bold text-primary-dark-900">
          We've created {{ result.subOrders.length }} orders — one with each seller
        </h1>
        <p class="mt-2 text-sm text-primary-dark-400">You're on one plan. Order {{ result.orderNumber }}.</p>

        <StatusBanner tone="dark" :title="`${result.subOrders.length} deliveries, one repayment`" class="mt-6 text-left">
          <template #icon>
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M3 7l7-4 7 4-7 4-7-4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
              <path d="M3 7v6l7 4 7-4V7" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
            </svg>
          </template>
          Each seller ships on their own timeline. Your schedule starts when the first item arrives — not
          today.
        </StatusBanner>
      </template>

      <template v-else>
        <h1 class="mt-5 text-2xl font-bold text-primary-dark-900">Your order is confirmed</h1>
        <p class="mt-2 text-sm text-primary-dark-400">Order {{ result.orderNumber }}</p>
      </template>

      <div class="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line text-left">
        <div v-for="sub in result.subOrders" :key="sub.subOrderId" class="flex items-center gap-3 px-4 py-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-dark-700 text-xs font-bold text-white">
            {{ initials(sub.merchantName) }}
          </span>
          <div>
            <p class="text-sm font-semibold text-primary-dark-900">{{ sub.merchantName }}</p>
            <p class="text-xs text-primary-dark-400">
              {{ sub.itemCount }} item{{ sub.itemCount > 1 ? "s" : "" }} · {{ formatEta(sub.fulfilmentEtaDays) }}
            </p>
          </div>
        </div>
        <div class="flex items-center justify-between bg-slate-50 px-4 py-3">
          <p class="text-sm font-bold text-primary-dark-900">Upfront payment</p>
          <p class="text-sm font-bold text-primary-dark-900">{{ formatKobo(result.downPaidKobo) }}</p>
        </div>
      </div>

      <div v-if="result.schedulePreview?.length" class="mt-5 rounded-lg bg-primary-50 px-4 py-3 text-left">
        <p class="text-sm font-bold text-primary-700">Your repayments</p>
        <p class="mt-0.5 text-xs text-primary-600">They start once your first item arrives, not today.</p>
        <dl class="mt-2 space-y-1 text-sm">
          <div v-for="instalment in result.schedulePreview" :key="instalment.seq" class="flex justify-between gap-3">
            <dt class="text-primary-600">{{ instalment.dueLabel }}</dt>
            <dd class="font-semibold text-primary-700">{{ formatKobo(instalment.amountKobo) }}</dd>
          </div>
        </dl>
      </div>

      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <NcButton :to="`/orders/${result.orderId}`" size="lg">View order</NcButton>
        <NcButton to="/" variant="secondary" size="lg">Keep shopping</NcButton>
      </div>
    </div>

    <div v-else-if="status?.state === 'declined'" class="rounded-2xl border border-line bg-white p-6 text-center sm:p-8">
      <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <svg class="h-7 w-7" viewBox="0 0 20 20" fill="none">
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </span>
      <h1 class="mt-5 text-2xl font-bold text-primary-dark-900">We couldn't approve this order</h1>
      <p class="mt-2 text-sm text-primary-dark-400">
        {{ status.declineReason?.message ?? "Your order didn't go through." }}
        <template v-if="status.cartPreserved">Your cart is saved, so you can change it and try again.</template>
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <NcButton to="/cart" size="lg">Back to cart</NcButton>
        <NcButton to="/" variant="secondary" size="lg">Keep shopping</NcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { formatEta } from "~/composables/useCheckout";

definePageMeta({ layout: "checkout" });

const router = useRouter();
const { fetchCart } = useCart();
const { checkoutId, status, fetchStatus } = useCheckout();

const loading = ref(true);
const result = computed(() => status.value?.result);

onMounted(async () => {
  if (!status.value && checkoutId.value) await fetchStatus();
  const state = status.value?.state;
  if (state !== "success" && state !== "declined") return router.replace(checkoutId.value ? "/checkout/processing" : "/orders");
  // A declined order may put the basket back.
  if (state === "declined") fetchCart();
  loading.value = false;
});

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
</script>
