<template>
  <div class="rounded-xl border border-line bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
      <div>
        <div class="flex items-center gap-2">
          <p class="text-sm font-bold text-primary-dark-900">Order {{ order.id }}</p>
          <Pill :tone="statusTone">{{ statusLabel }}</Pill>
        </div>
        <p class="mt-1 text-xs text-primary-dark-400">
          Placed {{ order.placedDate }} · {{ order.subOrders.length }} seller{{ order.subOrders.length > 1 ? "s" : "" }} · one plan
        </p>
      </div>
      <div class="text-right">
        <p class="text-sm font-bold text-primary-dark-900">{{ formatNaira(order.totalRepayable) }}</p>
        <p v-if="order.status !== 'repaid'" class="text-xs text-primary-dark-400">{{ formatNaira(order.monthlyAmount) }}/mo</p>
        <p v-else class="text-xs text-primary-dark-400">Closed {{ order.closedDate }}</p>
      </div>
      <NcButton :to="`/orders/${order.id}`" variant="secondary" size="sm">View order</NcButton>
    </div>
    <div class="flex flex-wrap gap-2 border-t border-line px-4 py-3 sm:px-5">
      <span
        v-for="sub in order.subOrders"
        :key="sub.code"
        class="flex items-center gap-1.5 rounded-full bg-slate-50 py-1 pl-1 pr-3 text-xs font-medium"
      >
        <span class="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" :class="tileColor(sub.merchantSlug)">
          {{ initials(sub.merchantSlug) }}
        </span>
        <span class="text-primary-dark-700">{{ sub.merchantName }}</span>
        <span :class="subStatusClass(sub.status)">{{ subStatusLabel(sub.status) }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Order, SubOrderStatus } from "~/data/orders";
import { getMerchant } from "~/data/merchants";

const props = defineProps<{ order: Order }>();

const statusLabel = computed(() => {
  return { "partly-delivered": "Partly delivered", delivered: "Delivered", repaid: "Repaid in full" }[props.order.status];
});

const statusTone = computed(() => {
  return { "partly-delivered": "warning", delivered: "success", repaid: "dark" }[props.order.status] as
    | "warning"
    | "success"
    | "dark";
});

function initials(slug: string) {
  return getMerchant(slug)?.initials ?? "";
}
function tileColor(slug: string) {
  return getMerchant(slug)?.tileColor ?? "bg-primary-dark-700";
}
function subStatusLabel(status: SubOrderStatus) {
  return { delivered: "Delivered", "on-the-way": "Dispatched", cancelled: "Cancelled", processing: "Processing" }[status];
}
function subStatusClass(status: SubOrderStatus) {
  return {
    delivered: "text-emerald-600",
    "on-the-way": "text-primary-600",
    cancelled: "text-rose-600",
    processing: "text-amber-600",
  }[status];
}
</script>
