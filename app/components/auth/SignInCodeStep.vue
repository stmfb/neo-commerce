<template>
  <form class="space-y-5" novalidate @submit.prevent="submit">
    <div>
      <h1 class="text-2xl font-bold font-display text-primary-dark">Enter your code</h1>
      <p class="mt-1 text-sm text-primary-dark-400">
        We texted a 6-digit code to <span class="font-semibold text-primary-dark-700">{{ store.phone }}</span>.
        <button type="button" class="font-semibold text-primary-600 hover:text-primary-700" @click="changeNumber">Change number</button>
      </p>
    </div>

    <label class="block">
      <span class="sr-only">6-digit code</span>
      <input
        ref="input"
        v-model="code"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="6"
        placeholder="••••••"
        class="w-full rounded-lg border border-line px-3 py-3 text-center font-mono text-2xl tracking-[0.5em] focus:border-primary-500 focus:outline-none"
        @input="code = code.replace(/\D/g, '').slice(0, 6)"
      />
    </label>

    <p v-if="store.error" role="alert" class="text-sm text-rose-600">{{ store.error }}</p>

    <NcButton type="submit" block size="lg" :disabled="code.length !== 6" :loading="store.busy">Continue</NcButton>

    <p class="text-center text-sm text-primary-dark-400">
      Didn't get it?
      <button
        v-if="resendIn === 0"
        type="button"
        class="font-semibold text-primary-600 hover:text-primary-700"
        :disabled="store.busy"
        @click="resend"
      >
        Send a new code
      </button>
      <span v-else>You can ask for a new one in {{ resendIn }}s.</span>
    </p>
  </form>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const store = useSignInStore();
const code = ref("");
const input = ref<HTMLInputElement>();

// Ticks once a second for the resend countdown.
const now = ref(Date.now());
let timer: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  input.value?.focus();
  timer = setInterval(() => (now.value = Date.now()), 1000);
});
onBeforeUnmount(() => clearInterval(timer));
const resendIn = computed(() => Math.max(0, Math.ceil((store.codeSentAt + RESEND_AFTER_MS - now.value) / 1000)));

// The 6th digit (typed, pasted or autofilled from the SMS) submits.
watch(code, (value) => {
  if (value.length === 6) submit();
});

async function submit() {
  if (code.value.length !== 6 || store.busy) return;
  await store.verifyCode(code.value);
  // Still here means it wasn't accepted: clear it for the next try.
  if (store.step === "otp") {
    code.value = "";
    input.value?.focus();
  }
}

/** A new code means a new sign-in token; the old code stops working. */
async function resend() {
  code.value = "";
  if (await store.start(store.phone)) input.value?.focus();
}

function changeNumber() {
  store.error = "";
  store.step = "phone";
}
</script>
