<template>
  <form class="space-y-3" @submit.prevent="submit">
    <div>
      <p class="text-sm font-bold text-primary-dark-900">Tell us about your work</p>
      <p class="mt-1 text-xs text-primary-dark-400">We need this once to set up your credit. It takes about a minute.</p>
    </div>
    <label v-for="field in inputs" :key="field.key" class="block">
      <span class="text-xs font-semibold text-primary-dark-600">{{ field.label }}</span>
      <input
        v-model="form[field.key]"
        type="text"
        :inputmode="field.key === 'salary' ? 'numeric' : undefined"
        required
        class="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
      />
      <span v-if="errors[field.key]" class="mt-1 block text-xs text-rose-600">{{ errors[field.key] }}</span>
    </label>
    <NcButton type="submit" block size="lg" :loading="busy">Continue</NcButton>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import type { EmploymentBody } from "~/models/checkout_model";

const props = defineProps<{ busy: boolean; fields?: Record<string, string>; homeAddress?: string }>();
const emit = defineEmits<{ submit: [body: EmploymentBody] }>();

const inputs = [
  { key: "employer", label: "Employer" },
  { key: "role", label: "Your role" },
  { key: "salary", label: "Monthly salary (₦)" },
  { key: "officeAddress", label: "Office address" },
  { key: "homeAddress", label: "Home address" },
] as const;

const form = reactive({ employer: "", role: "", salary: "", officeAddress: "", homeAddress: props.homeAddress ?? "" });
const salaryError = ref("");
const errors = computed<Record<string, string>>(() => ({
  ...props.fields,
  salary: salaryError.value || props.fields?.monthlySalaryKobo || "",
}));

function submit() {
  const naira = Number(form.salary.replace(/[,\s₦]/g, ""));
  salaryError.value = Number.isInteger(naira) && naira > 0 ? "" : "Enter your monthly salary in whole naira";
  if (salaryError.value) return;
  emit("submit", {
    employer: form.employer,
    role: form.role,
    // Typed naira to kobo: the one money conversion the client does.
    monthlySalaryKobo: naira * 100,
    officeAddress: form.officeAddress,
    homeAddress: form.homeAddress,
  });
}
</script>
