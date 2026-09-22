<template>
  <div class="flex items-start">
    <template v-for="(event, index) in events" :key="event.label">
      <div class="flex flex-1 flex-col items-center gap-1.5 text-center">
        <span class="h-3.5 w-3.5 rounded-full border-2" :class="dotClass(event, index)" />
        <span class="text-xs font-semibold" :class="event.done ? 'text-primary-dark-900' : 'text-primary-dark-300'">
          {{ event.label }}
        </span>
        <span class="text-[11px] text-primary-dark-300">{{ event.date }}</span>
      </div>
      <span v-if="index !== events.length - 1" class="mt-[7px] h-0.5 flex-1" :class="lineClass(index)" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { OrderTimelineEvent, SubOrderStatus } from "~/data/orders";

const props = defineProps<{ events: OrderTimelineEvent[]; status: SubOrderStatus }>();

function dotClass(event: OrderTimelineEvent, index: number) {
  if (props.status === "cancelled" && index === props.events.length - 1) {
    return "border-rose-500 bg-rose-500";
  }
  if (event.done) return "border-emerald-500 bg-emerald-500";
  return "border-primary-dark-200 bg-white";
}

function lineClass(index: number) {
  if (props.status === "cancelled") return "bg-rose-300";
  const bothDone = props.events[index].done && props.events[index + 1]?.done;
  return bothDone ? "bg-emerald-500" : "bg-primary-dark-100";
}
</script>
