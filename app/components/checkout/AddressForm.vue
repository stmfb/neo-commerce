<template>
  <form class="mt-3 space-y-3 rounded-xl border border-line p-4" @submit.prevent="submit">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label v-for="field in fields" :key="field.key" class="block" :class="field.wide ? 'sm:col-span-2' : ''">
        <span class="text-xs font-semibold text-primary-dark-600">{{ field.label }}</span>
        <input
          v-model="form[field.key]"
          :type="field.key === 'phone' ? 'tel' : 'text'"
          :required="field.required"
          class="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        />
        <span v-if="errors[field.key]" class="mt-1 block text-xs text-rose-600">{{ errors[field.key] }}</span>
      </label>
    </div>
    <p v-if="message" class="text-sm text-rose-600">{{ message }}</p>
    <div class="flex gap-2">
      <NcButton type="submit" size="sm" :loading="busy">Save address</NcButton>
      <NcButton v-if="cancellable" variant="ghost" size="sm" @click="$emit('cancel')">Cancel</NcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import type { AddressInput } from "~/models/checkout_model";

withDefaults(defineProps<{ cancellable?: boolean }>(), { cancellable: true });
const emit = defineEmits<{ saved: []; cancel: [] }>();

const { addAddress } = useCheckout();

const fields: { key: keyof AddressInput; label: string; required?: boolean; wide?: boolean }[] = [
  { key: "line1", label: "Street address", required: true, wide: true },
  { key: "line2", label: "Apartment or landmark (optional)", wide: true },
  { key: "city", label: "City or area", required: true },
  { key: "state", label: "State", required: true },
  { key: "phone", label: "Phone (optional)" },
  { key: "label", label: "Name it, e.g. Home (optional)" },
];

const form = reactive<AddressInput>({ label: "", line1: "", line2: "", city: "", state: "Lagos", phone: "" });
const busy = ref(false);
const message = ref("");
const errors = ref<Record<string, string>>({});

async function submit() {
  busy.value = true;
  const res = await addAddress({ ...form });
  busy.value = false;
  errors.value = res.fields ?? {};
  // A field error already says what's wrong.
  message.value = res.ok || Object.keys(errors.value).length ? "" : (res.message ?? "");
  if (!res.data) return;
  // Saved either way; only a serviceable address gets selected.
  if (!res.data.check.serviceable) {
    message.value = res.data.check.message || "We don't deliver there yet.";
    return;
  }
  emit("saved");
}
</script>
