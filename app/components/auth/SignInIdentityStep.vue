<template>
  <form class="space-y-5" novalidate @submit.prevent="submit">
    <div>
      <h1 class="text-2xl font-bold font-display text-primary-dark">Confirm who you are</h1>
      <p class="mt-1 text-sm text-primary-dark-400">Use your names exactly as they appear on your BVN.</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label v-for="field in fields" :key="field.key" class="block" :class="field.wide ? 'sm:col-span-2' : ''">
        <span class="text-xs font-semibold text-primary-dark-600">{{ field.label }}</span>
        <input
          v-model="form[field.key]"
          :type="field.type ?? 'text'"
          :inputmode="field.inputmode"
          :autocomplete="field.autocomplete"
          :maxlength="field.maxlength"
          :aria-invalid="Boolean(store.fields[field.key])"
          :disabled="store.busy"
          class="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none disabled:bg-slate-50"
        />
        <span v-if="store.fields[field.key]" class="mt-1 block text-xs text-rose-600">{{ store.fields[field.key] }}</span>
        <span v-else-if="field.hint" class="mt-1 block text-xs text-primary-dark-400">{{ field.hint }}</span>
      </label>
    </div>

    <StatusBanner v-if="store.error" :tone="dead ? 'error' : 'warning'" :title="store.error">
      <template v-if="store.errorCode === 'bvn_in_use'">Sign in with the phone number on that account instead.</template>
    </StatusBanner>

    <p v-if="store.busy" role="status" class="text-sm text-primary-dark-500">Checking your details. This can take a few seconds…</p>

    <NcButton v-if="dead" block size="lg" variant="secondary" @click="store.reset()">
      {{ store.errorCode === "bvn_in_use" ? "Use another number" : "Start again" }}
    </NcButton>
    <NcButton v-else type="submit" block size="lg" :disabled="!complete" :loading="store.busy">Continue</NcButton>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import type { IdentityInput } from "~/models/auth_model";

const store = useSignInStore();

const fields: {
  key: keyof IdentityInput;
  label: string;
  type?: string;
  inputmode?: "numeric" | "email";
  autocomplete: string;
  maxlength?: number;
  hint?: string;
  wide?: boolean;
}[] = [
  { key: "firstName", label: "First name", autocomplete: "given-name", maxlength: 60 },
  { key: "lastName", label: "Last name", autocomplete: "family-name", maxlength: 60 },
  { key: "email", label: "Email", type: "email", inputmode: "email", autocomplete: "email", maxlength: 120, wide: true },
  {
    key: "bvn",
    label: "BVN",
    inputmode: "numeric",
    autocomplete: "off",
    maxlength: 11,
    hint: "11 digits. Dial *565*0# on the phone linked to your bank to get it.",
    wide: true,
  },
];

const form = reactive<IdentityInput>({ firstName: "", lastName: "", email: "", bvn: "" });

const complete = computed(
  () => Boolean(form.firstName.trim() && form.lastName.trim() && /\S+@\S+\.\S+/.test(form.email)) && /^\d{11}$/.test(form.bvn),
);

/** Errors that fixing the form won't solve: the shopper has to start over (or call support). */
const dead = computed(() => ["face_mismatch", "identity_mismatch", "bvn_in_use"].includes(store.errorCode));

function submit() {
  if (!complete.value || store.busy) return;
  store.submitIdentity({
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    bvn: form.bvn.trim(),
  });
}
</script>
