<template>
  <div class="mx-auto flex max-w-[420px] flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
    <template v-if="reviewing">
      <span class="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-500">
        <IconDocument />
      </span>
      <h1 class="mt-6 text-xl font-bold text-primary-dark-900">We're reviewing your order</h1>
      <p class="mt-2 text-sm text-primary-dark-400">
        Once your payment lands, our team approves your order. This can take a few hours. We'll notify you, and you
        can follow it in My orders.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <NcButton to="/orders" size="lg">My orders</NcButton>
        <NcButton to="/" variant="secondary" size="lg">Keep shopping</NcButton>
      </div>
    </template>

    <template v-else>
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
            ? "Taking longer than usual. Your payment is safe and we'll notify you the moment it's done."
            : "This takes a few seconds. Don't close this window."
        }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

definePageMeta({ layout: "checkout" });

// Staff approve orders by hand, which can take hours: poll briefly, backing off, then point to My orders.
const FIRST_DELAY_MS = 2000;
const MAX_DELAY_MS = 8000;
const TAKING_LONG_MS = 10_000;
const REVIEW_AFTER_MS = 30_000;

const router = useRouter();
const { checkoutId, fetchStatus } = useCheckout();

const takingLong = ref(false);
const reviewing = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
let stopped = false;

onMounted(() => {
  if (!checkoutId.value) return router.replace("/orders");
  poll(Date.now(), FIRST_DELAY_MS);
});

onBeforeUnmount(() => {
  stopped = true;
  clearTimeout(timer);
});

async function poll(startedAt: number, delay: number) {
  const res = await fetchStatus();
  if (stopped) return;

  const state = res.data?.state;
  if (state === "success" || state === "declined") return router.replace("/checkout/result");
  if (res.code === "not_submitted") return router.replace("/checkout/authorise");

  const elapsed = Date.now() - startedAt;
  takingLong.value = elapsed >= TAKING_LONG_MS;
  if (elapsed >= REVIEW_AFTER_MS || res.code === "unauthorized") {
    reviewing.value = true;
    return;
  }
  timer = setTimeout(() => poll(startedAt, Math.min(delay * 1.5, MAX_DELAY_MS)), delay);
}
</script>
