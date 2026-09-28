<template>
  <div class="relative flex items-start">
    <div class="pointer-events-none absolute inset-x-0 top-[7px] h-0.5">
      <span
        v-for="index in TOTAL_SLOTS - 1"
        :key="index"
        class="absolute h-0.5"
        :style="segmentStyle(index - 1)"
        :class="lineClass(index - 1)"
      />
    </div>
    <template v-for="(slot, index) in slots" :key="index">
      <div class="flex flex-1 flex-col items-center gap-1.5 text-center">
        <span v-if="slot" class="z-10 h-3.5 w-3.5 rounded-full border-2" :class="dotClass(index)" />
        <span v-else class="h-3.5 w-3.5" />
        <template v-if="slot">
          <span class="text-xs font-semibold" :class="slot.done ? 'text-primary-dark-900' : 'text-primary-dark-300'">
            {{ slot.label }}
          </span>
          <span class="text-[11px] text-primary-dark-300">{{ slot.date }}</span>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { OrderTimelineEvent, SubOrderStatus } from "~/data/orders";

const TOTAL_SLOTS = 4;

const props = defineProps<{ events: OrderTimelineEvent[]; status: SubOrderStatus }>();

// Cancelled sub-orders only ever carry a "Created" + terminal "Cancelled" event. Rather than
// bunching them into the first two slots, the terminal dot sits at the second-to-last slot so
// it lines up with where "Dispatched" would sit on a full 4-step timeline.
const slots = computed<(OrderTimelineEvent | null)[]>(() => {
  if (props.status === "cancelled" && props.events.length < TOTAL_SLOTS) {
    const result: (OrderTimelineEvent | null)[] = Array(TOTAL_SLOTS).fill(null);
    result[0] = props.events[0] ?? null;
    result[TOTAL_SLOTS - 2] = props.events[props.events.length - 1] ?? null;
    return result;
  }
  const padded: (OrderTimelineEvent | null)[] = [...props.events];
  while (padded.length < TOTAL_SLOTS) padded.push(null);
  return padded;
});

const terminalIndex = computed(() => slots.value.findLastIndex((slot) => slot !== null));

// The connecting line is drawn independently of the dot columns, spanning exactly from one
// dot's horizontal center to the next. This keeps it touching the dots even though each dot
// sits centered in a wider column (to stay centered above its label).
function segmentStyle(index: number) {
  const left = ((index + 0.5) / TOTAL_SLOTS) * 100;
  const right = 100 - ((index + 1.5) / TOTAL_SLOTS) * 100;
  return { left: `${left}%`, right: `${right}%` };
}

function dotClass(index: number) {
  const event = slots.value[index];
  if (!event) return "";
  if (props.status === "cancelled" && index === terminalIndex.value) {
    return "border-rose-500 bg-rose-500";
  }
  if (event.done) return "border-emerald-500 bg-emerald-500";
  return "border-primary-dark-200 bg-white";
}

function lineClass(index: number) {
  if (props.status === "cancelled") {
    return index < terminalIndex.value ? "bg-rose-300" : "bg-transparent";
  }
  const [current, next] = [slots.value[index], slots.value[index + 1]];
  if (!current || !next) return "bg-transparent";
  return current.done && next.done ? "bg-emerald-500" : "bg-primary-dark-100";
}
</script>
