<template>
  <div>
    <p class="font-sans text-2xl font-bold text-primary-dark-900">
      <template v-if="modelValue !== null">
        {{ formatNaira(modelValue) }}<span class="text-sm font-medium text-primary-dark-400">/mo</span>
      </template>
      <template v-else>{{ store.known ? `${formatNaira(slider.max)}/mo` : "Any budget" }}</template>
    </p>
    <RangeSlider
      :model-value="modelValue ?? slider.max"
      :min="slider.min"
      :max="slider.max"
      :step="slider.step"
      class="mt-3"
      :aria-label="ariaLabel"
      @update:model-value="onInput"
    />
    <div class="mt-1 flex justify-between text-[11px] text-primary-dark-300">
      <span>{{ formatNaira(slider.min) }}</span>
      <span>{{ formatNaira(slider.max) }}{{ store.known ? " limit" : "+" }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

/**
 * Monthly budget slider with bounds from /me/affordability.
 * v-model is in naira; `null` means "no budget" (slider at the top of the range).
 */
withDefaults(defineProps<{ modelValue: number | null; ariaLabel?: string }>(), {
  ariaLabel: "Maximum monthly repayment",
});
const emit = defineEmits<{ "update:modelValue": [value: number | null] }>();

const store = useAffordabilityStore();
const slider = computed(() => store.slider);

function onInput(value: number) {
  emit("update:modelValue", value >= slider.value.max && !store.known ? null : value);
}
</script>
