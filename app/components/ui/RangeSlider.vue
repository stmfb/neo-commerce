<template>
  <input
    :value="modelValue"
    type="range"
    :min="min"
    :max="max"
    :step="step"
    class="h-1.5 w-full cursor-pointer appearance-none rounded-full"
    :style="{ background: trackBackground }"
    @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{ modelValue: number; min: number; max: number; step?: number }>(), {
  step: 1,
});

defineEmits<{ "update:modelValue": [value: number] }>();

const percent = computed(() => {
  if (props.max === props.min) return 0;
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100;
});

const trackBackground = computed(
  () => `linear-gradient(to right, #917CFF ${percent.value}%, #E2E4EC ${percent.value}%)`,
);
</script>
