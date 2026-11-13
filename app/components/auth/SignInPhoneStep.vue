<template>
  <form class="space-y-5" novalidate @submit.prevent="submit">
    <div>
      <h1 class="text-2xl font-bold font-display text-primary-dark">Sign in or create an account</h1>
      <p class="mt-1 text-sm text-primary-dark-400">
        Enter your phone number and we'll text you a 6-digit code. New to NeoCash? We'll set up your account next, with a
        quick face check and your BVN.
      </p>
    </div>

    <label class="block">
      <span class="text-xs font-semibold text-primary-dark-600">Phone number</span>
      <input
        ref="input"
        v-model="phone"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        placeholder="0803 123 4567"
        :aria-invalid="Boolean(store.fields.phone)"
        class="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
      />
      <span v-if="store.fields.phone" class="mt-1 block text-xs text-rose-600">{{ store.fields.phone }}</span>
    </label>

    <p v-if="store.error" role="alert" class="text-sm text-rose-600">{{ store.error }}</p>

    <NcButton type="submit" block size="lg" :disabled="digits < 10" :loading="store.busy">Send code</NcButton>
  </form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const store = useSignInStore();
// Back from "Change number", the number they typed is still here.
const phone = ref(store.phone);
const input = ref<HTMLInputElement>();
const digits = computed(() => phone.value.replace(/\D/g, "").length);

onMounted(() => input.value?.focus());

function submit() {
  if (digits.value >= 10 && !store.busy) store.start(phone.value.trim());
}
</script>
