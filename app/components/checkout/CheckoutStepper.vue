<template>
  <div class="border-b border-line bg-white">
    <div class="mx-auto flex max-w-[1320px] items-center justify-center gap-3 px-4 py-4 sm:gap-4 sm:px-6">
      <template v-for="(step, index) in steps" :key="step">
        <div class="flex items-center gap-2">
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            :class="stateFor(index + 1) === 'done' ? 'bg-primary-500 text-white' : stateFor(index + 1) === 'active' ? 'bg-primary-500 text-white' : 'border border-primary-dark-200 text-primary-dark-300'"
          >
            <svg v-if="stateFor(index + 1) === 'done'" class="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </span>
          <span
            class="hidden text-sm font-medium sm:inline"
            :class="stateFor(index + 1) === 'upcoming' ? 'text-primary-dark-300' : 'text-primary-dark-900'"
          >
            {{ step }}
          </span>
        </div>
        <span v-if="index !== steps.length - 1" class="h-px w-6 shrink-0 bg-line sm:w-10" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const steps = ["Plan", "Disclosures", "Authorise", "Done"];

const props = defineProps<{ currentStep: number }>();

function stateFor(step: number): "done" | "active" | "upcoming" {
  if (step < props.currentStep) return "done";
  if (step === props.currentStep) return "active";
  return "upcoming";
}
</script>
