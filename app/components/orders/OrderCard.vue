<template>
  <div class="rounded-xl border border-line bg-white">
    <div class="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
      <div>
        <div class="flex items-center gap-2">
          <p class="text-sm font-bold text-primary-dark-900">Order {{ order.orderNumber }}</p>
          <Pill :tone="statusTone">{{ order.statusLabel }}</Pill>
        </div>
        <p class="mt-1 text-xs text-primary-dark-400">
          Placed {{ formatOrderDate(order.createdAt) }} · {{ order.merchantCount }} seller{{ order.merchantCount === 1 ? "" : "s" }} ·
          {{ order.itemCount }} item{{ order.itemCount === 1 ? "" : "s" }}
        </p>
      </div>
      <div class="text-right">
        <p class="text-sm font-bold text-primary-dark-900">{{ formatKobo(order.totalKobo) }}</p>
        <p class="text-xs text-primary-dark-400">One plan</p>
      </div>
      <NcButton :to="`/orders/${order.orderId}`" variant="secondary" size="sm">View order</NcButton>
    </div>
    <div class="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3 sm:px-5">
      <ShimmerImg
        v-for="src in order.thumbnails"
        :key="src"
        :src="src"
        class="h-9 w-9 shrink-0 rounded-lg"
        img-class="h-full w-full rounded-lg object-cover"
      >
        <template #fallback>
          <ImagePlaceholder class="h-9 w-9" />
        </template>
      </ShimmerImg>
      <span
        v-for="name in order.merchantNames"
        :key="name"
        class="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-primary-dark-700"
      >
        {{ name }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ApiOrderSummary } from "~/models/orders_model";

const props = defineProps<{ order: ApiOrderSummary }>();

const statusTone = computed(() => {
  return { in_progress: "primary", partially_delivered: "warning", delivered: "success", cancelled: "error" }[
    props.order.overallStatus
  ] as "primary" | "warning" | "success" | "error";
});
</script>
