<template>
  <StatusBanner v-if="mandate.status === 'failed'" tone="error" title="Your direct debit wasn't set up">
    {{ mandate.message }}
  </StatusBanner>

  <StatusBanner v-else tone="warning" title="Set up your direct debit">
    <template #icon>
      <IconBank />
    </template>
    Transfer {{ formatKobo(mandate.amountKobo) }} from your {{ mandate.salaryBankName }} account to {{ mandate.bankName }}
    <span class="font-semibold">{{ mandate.accountNumber }}</span> to set up your direct debit.
    <template #actions>
      <NcButton variant="secondary" size="sm" @click="copy">{{ copied ? "Copied" : "Copy account number" }}</NcButton>
    </template>
  </StatusBanner>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { ApiMandateAction } from "~/models/orders_model";

const props = defineProps<{ mandate: ApiMandateAction }>();

const copied = ref(false);

async function copy() {
  try {
    await navigator.clipboard.writeText(props.mandate.accountNumber);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // No clipboard access (e.g. some webviews): the number is on screen to copy by hand.
  }
}
</script>
