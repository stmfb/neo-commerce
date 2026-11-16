<template>
  <div class="rounded-xl border border-line bg-white p-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-dark-700 text-xs font-bold text-white">
          {{ initials }}
        </span>
        <div>
          <p class="flex items-center gap-1 text-sm font-bold text-primary-dark-900">
            {{ subOrder.merchantName }}
            <VerifiedBadge v-if="subOrder.merchantVerified" class="text-primary-500" />
          </p>
          <p class="text-xs text-primary-dark-400">{{ itemCount }} item{{ itemCount === 1 ? "" : "s" }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Pill :tone="status.tone">{{ status.label }}</Pill>
        <p class="text-sm font-bold text-primary-dark-900">{{ formatKobo(subOrder.subtotalKobo) }}</p>
      </div>
    </div>

    <ul class="mt-4 divide-y divide-line border-t border-line">
      <li v-for="item in subOrder.items" :key="item.cartItemId" class="flex items-center gap-3 py-3">
        <ShimmerImg :src="item.image" :alt="item.title" class="h-12 w-12 shrink-0 rounded-lg" img-class="h-full w-full rounded-lg object-cover">
          <template #fallback>
            <ImagePlaceholder class="h-12 w-12" />
          </template>
        </ShimmerImg>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-primary-dark-900">{{ item.title }}</p>
          <p class="text-xs text-primary-dark-400">
            <template v-if="item.variantLabel">{{ item.variantLabel }} · </template>Qty {{ item.quantity }}
          </p>
        </div>
        <p class="text-sm font-semibold text-primary-dark-800">{{ formatKobo(item.lineTotalKobo) }}</p>
      </li>
    </ul>

    <div class="flex items-center gap-4 border-t border-line pt-4">
      <div class="flex-1">
        <OrderTimeline :steps="subOrder.timeline" />
      </div>
      <NcButton v-if="subOrder.canConfirmDelivery && !askingPin" size="sm" @click="askingPin = true">Confirm delivery</NcButton>
    </div>

    <div v-if="subOrder.canConfirmDelivery && askingPin" class="mt-4 rounded-lg bg-primary-50 p-4 text-center">
      <p class="mb-3 text-sm font-medium text-primary-dark-700">Enter your NeoCash PIN to confirm it arrived</p>
      <PinInput v-model="pin" autofocus />
      <div class="mt-4 flex justify-center gap-2">
        <NcButton variant="secondary" size="sm" :disabled="confirming" @click="cancelPin">Cancel</NcButton>
        <NcButton size="sm" :disabled="pin.length !== 4" :loading="confirming" @click="confirm">Confirm</NcButton>
      </div>
    </div>
    <p v-if="error" class="mt-3 text-xs font-medium text-rose-600">
      {{ error }}
      <NuxtLink
        v-if="needsPin"
        :to="{ path: '/account/pin', query: { redirect: `/orders/${orderId}` } }"
        class="ml-1 font-semibold text-primary-600 hover:text-primary-700"
      >
        Set your PIN
      </NuxtLink>
    </p>

    <p v-if="subOrder.trackingRef" class="mt-3 text-xs text-primary-dark-400">Tracking {{ subOrder.trackingRef }}</p>
    <p v-if="support.email || support.phone" class="mt-3 text-xs text-primary-dark-400">
      Seller support:
      <a v-if="support.email" :href="`mailto:${support.email}`" class="font-medium text-primary-600">{{ support.email }}</a>
      <template v-if="support.email && support.phone"> · </template>
      <a v-if="support.phone" :href="`tel:${support.phone}`" class="font-medium text-primary-600">{{ support.phone }}</a>
      <template v-if="support.hours"> · {{ support.hours }}</template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ApiSubOrder } from "~/models/orders_model";

const props = defineProps<{ orderId: string; subOrder: ApiSubOrder }>();

const { confirmDelivery } = useOrders();

const support = computed(() => props.subOrder.merchantSupport);
const itemCount = computed(() => props.subOrder.items.reduce((sum, item) => sum + item.quantity, 0));
const initials = computed(() =>
  props.subOrder.merchantName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join(""),
);

const status = computed(() => {
  return {
    created: { label: "Processing", tone: "warning" },
    accepted: { label: "Accepted", tone: "warning" },
    dispatched: { label: "On the way", tone: "dark" },
    delivered: { label: "Delivered", tone: "success" },
    cancelled: { label: "Cancelled", tone: "error" },
  }[props.subOrder.status] as { label: string; tone: "warning" | "dark" | "success" | "error" };
});

const askingPin = ref(false);
// The PIN lives only here, in memory, and is cleared after every try.
const pin = ref("");
const confirming = ref(false);
const error = ref("");
/** The shopper has no PIN yet; the error links to setting one. */
const needsPin = ref(false);

function cancelPin() {
  askingPin.value = false;
  pin.value = "";
  error.value = "";
  needsPin.value = false;
}

async function confirm() {
  confirming.value = true;
  error.value = "";
  const result = await confirmDelivery(props.orderId, props.subOrder.subOrderId, pin.value);
  pin.value = "";
  needsPin.value = result.code === "pin_not_set";
  if (result.ok) askingPin.value = false;
  else error.value = result.message ?? "";
  confirming.value = false;
}
</script>
