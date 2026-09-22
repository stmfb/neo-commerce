<template>
  <div class="inline-flex items-center rounded-lg border border-line">
    <button
      type="button"
      class="flex h-8 w-8 items-center justify-center text-primary-dark-500 hover:text-primary-dark-900 disabled:opacity-40"
      :disabled="modelValue <= min"
      @click="$emit('update:modelValue', modelValue - 1)"
    >
      &minus;
    </button>
    <span class="w-8 text-center text-sm font-semibold text-primary-dark-900">{{ modelValue }}</span>
    <button
      type="button"
      class="flex h-8 w-8 items-center justify-center text-primary-dark-500 hover:text-primary-dark-900 disabled:opacity-40"
      :disabled="modelValue >= max"
      @click="$emit('update:modelValue', modelValue + 1)"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ modelValue: number; min?: number; max?: number }>(), {
  min: 1,
  max: 99,
});

defineEmits<{ "update:modelValue": [value: number] }>();
</script>
