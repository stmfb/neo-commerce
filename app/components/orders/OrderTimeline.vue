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
        <span v-if="slot" class="z-10 h-3.5 w-3.5 rounded-full border-2" :class="dotClass(slot)" />
        <span v-else class="h-3.5 w-3.5" />
        <template v-if="slot">
          <span class="text-xs font-semibold" :class="slot.state === 'pending' ? 'text-primary-dark-300' : 'text-primary-dark-900'">
            {{ slot.label }}
          </span>
          <span v-if="slot.at" class="text-[11px] text-primary-dark-300">{{ formatOrderDate(slot.at) }}</span>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ApiTimelineStep } from "~/models/orders_model";

const TOTAL_SLOTS = 4;

const props = defineProps<{ steps: ApiTimelineStep[] }>();

// A cancelled sub-order ends in a "branch" step. Rather than bunching a short timeline into the
// first slots, the branch sits no earlier than the second-to-last slot, where "On the way" would
// sit on a full timeline.
const branched = computed(() => props.steps.at(-1)?.state === "branch");
const slots = computed<(ApiTimelineStep | null)[]>(() => {
  const result: (ApiTimelineStep | null)[] = [...props.steps];
  if (branched.value && result.length < TOTAL_SLOTS - 1) result.splice(-1, 0, null);
  while (result.length < TOTAL_SLOTS) result.push(null);
  return result;
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

function dotClass(step: ApiTimelineStep) {
  return {
    done: "border-emerald-500 bg-emerald-500",
    current: "border-primary-500 bg-white",
    pending: "border-primary-dark-200 bg-white",
    branch: "border-rose-500 bg-rose-500",
  }[step.state];
}

function lineClass(index: number) {
  if (branched.value) {
    return index < terminalIndex.value ? "bg-rose-300" : "bg-transparent";
  }
  const [current, next] = [slots.value[index], slots.value[index + 1]];
  if (!current || !next) return "bg-transparent";
  return current.state === "done" && next.state === "done" ? "bg-emerald-500" : "bg-primary-dark-100";
}
</script>
