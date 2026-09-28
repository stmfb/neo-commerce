<template>
  <div v-if="order" class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <Breadcrumb class="mb-4" :items="[{ label: 'Home', to: '/' }, { label: 'My orders', to: '/orders' }, { label: order.id }]" />

    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-3xl font-bold font-display text-primary-dark">Order {{ order.id }}</h1>
        <p class="mt-1 text-sm text-primary-dark-400">
          Placed {{ order.placedDate }} · {{ order.subOrders.length }} seller{{ order.subOrders.length > 1 ? "s" : "" }} · one plan
        </p>
      </div>
      <NcButton variant="secondary" size="sm">Get help with this order</NcButton>
    </div>

    <StatusBanner v-if="partialSummary" tone="info" :title="partialSummary.title" class="mb-5">
      <template #icon>
        <img src="/package.png" alt="" class="h-6 w-6" />
      </template>
      {{ partialSummary.description }}
    </StatusBanner>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div class="space-y-4">
        <div v-for="sub in order.subOrders" :key="sub.code" class="rounded-xl border border-line bg-white p-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" :class="tileColor(sub.merchantSlug)">
                {{ initials(sub.merchantSlug) }}
              </span>
              <div>
                <p class="text-sm font-bold text-primary-dark-900">{{ sub.merchantName }}</p>
                <p class="text-xs text-primary-dark-400">{{ sub.code }} · {{ sub.itemsLabel }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <Pill :tone="subTone(sub.status)">{{ subLabel(sub.status) }}</Pill>
              <p class="text-sm font-bold text-primary-dark-900">{{ formatNaira(sub.amount) }}</p>
            </div>
          </div>

          <div class="mt-4 flex items-center gap-4 border-t border-line pt-4">
            <div class="flex-1">
              <OrderTimeline :events="sub.events" :status="sub.status" />
            </div>
            <NcButton v-if="sub.status === 'delivered'" variant="secondary" size="sm">Start a return</NcButton>
            <NcButton v-else-if="sub.status === 'on-the-way'" variant="secondary" size="sm">Track delivery</NcButton>
          </div>

          <p v-if="sub.status === 'cancelled'" class="mt-3 text-xs text-primary-dark-400">{{ sub.deliveryNote }}</p>
          <p v-else-if="sub.trackingCode" class="mt-3 text-xs text-primary-dark-400">Tracking {{ sub.trackingCode }}</p>
        </div>
      </div>

      <aside class="h-fit space-y-4 lg:sticky lg:top-28">
        <div v-if="order.status === 'repaid'" class="rounded-xl border border-line bg-white p-5">
          <p class="text-sm font-bold text-primary-dark-900">Repaid in full</p>
          <p class="mt-1 text-xs text-primary-dark-400">Closed {{ order.closedDate }}</p>
          <p class="mt-3 text-2xl font-bold text-primary-dark-900">{{ formatNaira(order.totalRepayable) }}</p>
          <p class="mt-1 text-xs text-primary-dark-400">Paid across {{ order.repaymentSchedule.length }} instalments</p>
        </div>

        <div v-else class="rounded-xl border border-line bg-white p-5">
          <p class="text-sm font-bold text-primary-dark-900">Your repayment schedule</p>
          <p class="mt-3 rounded-lg bg-primary-50 px-3 py-2.5 text-xs text-primary-dark-500">
            {{ scheduleStartNote }}
          </p>
          <ul class="mt-4 space-y-3">
            <li v-for="entry in order.repaymentSchedule" :key="entry.label" class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-3">
                <span
                  class="h-6 w-6 shrink-0 rounded-full border-2"
                  :class="
                    entry.status === 'paid'
                      ? 'border-emerald-100 bg-emerald-100'
                      : entry.status === 'due'
                        ? 'border-[3px] border-primary-500 bg-white'
                        : 'border-primary-dark-100 bg-white'
                  "
                />
                <div>
                  <p class="font-medium text-primary-dark-800">{{ entry.label }}</p>
                  <p class="text-xs text-primary-dark-400">{{ entry.date }}</p>
                </div>
              </div>
              <p class="font-semibold text-primary-dark-800">{{ formatNaira(entry.amount) }}</p>
            </li>
          </ul>
          <div class="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm font-bold text-primary-dark-900">
            <span>One plan · {{ order.subOrders.length }} sellers</span>
            <span>{{ formatNaira(order.totalRepayable) }}</span>
          </div>
        </div>

        <StatusBanner v-if="order.planAdjustment" tone="warning" title="Your plan was adjusted">
          <template #icon>
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7.25" stroke="currentColor" stroke-width="1.4" />
              <path d="M10 9v4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <circle cx="10" cy="6.75" r="0.9" fill="currentColor" />
            </svg>
          </template>
          {{ order.planAdjustment.merchantName }} cancelled their part ({{ formatNaira(order.planAdjustment.removedAmount) }}). That
          amount came off your principal and your monthly payment dropped from {{ formatNaira(order.planAdjustment.previousMonthlyAmount) }}
          to {{ formatNaira(order.monthlyAmount) }}.
        </StatusBanner>

        <div class="rounded-xl border border-line bg-white p-5">
          <p class="text-sm font-bold text-primary-dark-900">Delivery address</p>
          <p class="mt-2 text-sm text-primary-dark-500">{{ order.deliveryAddress }}</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { getMerchant } from "~/data/merchants";
import type { SubOrderStatus } from "~/data/orders";

const route = useRoute();
const { getOrder } = useOrders();

const order = computed(() => getOrder(route.params.id as string));

function initials(slug: string) {
  return getMerchant(slug)?.initials ?? "";
}
function tileColor(slug: string) {
  return getMerchant(slug)?.tileColor ?? "bg-primary-dark-700";
}
function subLabel(status: SubOrderStatus) {
  return { delivered: "Delivered", "on-the-way": "On the way", cancelled: "Cancelled by seller", processing: "Processing" }[status];
}
function subTone(status: SubOrderStatus) {
  return { delivered: "success", "on-the-way": "dark", cancelled: "error", processing: "warning" }[status] as
    | "success"
    | "dark"
    | "error"
    | "warning";
}

const scheduleStartNote = computed(() => {
  if (!order.value) return "";
  const deliveredEvent = order.value.subOrders
    .flatMap((sub) => sub.events)
    .find((event) => event.label === "Delivered" && event.done);

  if (!deliveredEvent) return "Your schedule starts when the first item is delivered on this order.";

  return `Your schedule started when your first item was delivered on ${deliveredEvent.date} — not when you placed the order.`;
});

const partialSummary = computed(() => {
  if (!order.value) return null;
  const total = order.value.subOrders.length;
  const deliveredCount = order.value.subOrders.filter((sub) => sub.status === "delivered").length;
  if (deliveredCount === total) return null;

  const notes = order.value.subOrders
    .filter((sub) => sub.status !== "delivered")
    .map((sub) => {
      if (sub.status === "on-the-way") return `${sub.merchantName} is on the way.`;
      if (sub.status === "cancelled") return `${sub.merchantName} cancelled theirs, and your plan has been adjusted for it.`;
      return `${sub.merchantName} is being processed.`;
    });

  return {
    title: `${deliveredCount} of ${total} orders delivered`,
    description: notes.join(" "),
  };
});
</script>
