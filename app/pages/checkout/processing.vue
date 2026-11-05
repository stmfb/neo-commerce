<template>
  <div class="mx-auto flex max-w-[420px] flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
    <!-- Shimmering order-summary card: the order being assembled. -->
    <ShimmerRegion label="Setting up your order" class="w-full">
      <div class="w-full space-y-4 rounded-2xl border border-line bg-white p-5 text-left" aria-hidden="true">
        <div class="flex items-center gap-3">
          <Shimmer rounded="xl" class="h-12 w-12 shrink-0" />
          <div class="flex-1 space-y-2">
            <Shimmer class="h-4 w-3/4" />
            <Shimmer class="h-3 w-1/2" />
          </div>
        </div>
        <div class="space-y-2 border-t border-line pt-4">
          <div v-for="row in 3" :key="row" class="flex justify-between gap-6">
            <Shimmer class="h-3.5 w-1/3" />
            <Shimmer class="h-3.5 w-1/4" />
          </div>
        </div>
        <Shimmer rounded="xl" class="h-10 w-full" />
      </div>
    </ShimmerRegion>
    <h1 class="mt-6 text-xl font-bold text-primary-dark-900">
      {{ takingLong ? "Still working on it" : "Setting up your order" }}
    </h1>
    <p class="mt-2 text-sm text-primary-dark-400">
      {{
        takingLong
          ? "Taking longer than usual. Your down payment is safe and we'll notify you the moment it's done."
          : "This takes a few seconds. Don't close this window."
      }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getPlanQuote } from "~/utils/quote";
import { deliveryAddresses } from "~/composables/useCheckout";

definePageMeta({ layout: "checkout" });

const router = useRouter();
const { groups, subtotal, clear, isEmpty } = useCart();
const { selectedMonths, selectedAddressId, resetCheckout } = useCheckout();
const { createOrderFromCart } = useOrders();

const takingLong = ref(false);

onMounted(() => {
  if (isEmpty.value) {
    router.replace("/cart");
    return;
  }

  const longTimer = setTimeout(() => (takingLong.value = true), 4000);

  setTimeout(() => {
    clearTimeout(longTimer);
    const plan = getPlanQuote(subtotal.value).find((entry) => entry.months === selectedMonths.value)!;
    const address =
      deliveryAddresses.find((entry) => entry.id === selectedAddressId.value)?.detail ?? "Lagos, Nigeria";
    const order = createOrderFromCart(groups.value, plan, address);
    clear();
    resetCheckout();
    router.replace({ path: "/checkout/result", query: { order: order.id } });
  }, 1800);
});
</script>
