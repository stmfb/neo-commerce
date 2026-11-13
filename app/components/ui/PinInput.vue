<template>
  <div class="relative mx-auto flex w-fit justify-center gap-3" @click="input?.focus()">
    <span
      v-for="n in 4"
      :key="n"
      class="h-3.5 w-3.5 rounded-full transition-colors"
      :class="pin.length >= n ? 'bg-primary-dark' : 'border-2 border-primary-dark-200'"
    />
    <input
      ref="input"
      v-model="pin"
      type="tel"
      inputmode="numeric"
      maxlength="4"
      autocomplete="off"
      aria-label="NeoCash PIN"
      class="absolute inset-0 h-full w-full cursor-default opacity-0"
      @input="pin = pin.replace(/\D/g, '').slice(0, 4)"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

/** The 4-digit NeoCash PIN as dots. The PIN lives only in the parent's memory. */
const props = defineProps<{ autofocus?: boolean }>();
const pin = defineModel<string>({ required: true });
const input = ref<HTMLInputElement>();

onMounted(() => {
  if (props.autofocus) input.value?.focus();
});
</script>
