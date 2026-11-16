<template>
  <div class="space-y-6">
    <div class="text-center">
      <p class="text-sm text-primary-dark-400">Transfer your upfront payment</p>
      <p class="mt-1 text-3xl font-bold text-primary-dark-900">{{ formatKobo(transfer.amountKobo) }}</p>
      <p class="mt-1 text-sm text-primary-dark-400">Send this exact amount by {{ formatCheckoutTime(transfer.expiresAt) }}.</p>
    </div>

    <StatusBanner v-if="expired" tone="error" title="This payment window has closed">
      Don't send money to this account. Check your orders for the latest on this one.
      <template #actions>
        <NcButton to="/orders" size="sm">My orders</NcButton>
      </template>
    </StatusBanner>

    <div class="rounded-xl border border-line bg-white p-5">
      <dl class="space-y-3 text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-primary-dark-400">Bank</dt>
          <dd class="text-right font-semibold text-primary-dark-900">{{ transfer.bankName }}</dd>
        </div>
        <div class="flex items-center justify-between gap-4">
          <dt class="text-primary-dark-400">Account number</dt>
          <dd class="flex items-center gap-2">
            <span class="text-base font-bold tracking-wider text-primary-dark-900">{{ transfer.accountNumber }}</span>
            <button type="button" class="text-sm font-semibold text-primary-600 hover:text-primary-700" @click="copy">
              {{ copied ? "Copied" : "Copy" }}
            </button>
          </dd>
        </div>
        <div v-if="transfer.accountName" class="flex justify-between gap-4">
          <dt class="text-primary-dark-400">Account name</dt>
          <dd class="text-right font-semibold text-primary-dark-900">{{ transfer.accountName }}</dd>
        </div>
        <div class="flex justify-between gap-4 border-t border-line pt-3">
          <dt class="text-primary-dark-400">Amount</dt>
          <dd class="font-bold text-primary-dark-900">{{ formatKobo(transfer.amountKobo) }}</dd>
        </div>
      </dl>

      <NcButton block size="lg" class="mt-6" :disabled="expired" @click="$emit('sent')">I've sent it</NcButton>
      <p class="mt-3 text-center text-xs text-primary-dark-400">
        Once your payment lands, we review your order and notify you. If it doesn't arrive in time, the order is
        cancelled.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { ApiTransferDetails } from "~/models/checkout_model";
import { formatCheckoutTime } from "~/composables/useCheckout";

const props = defineProps<{ transfer: ApiTransferDetails }>();
defineEmits<{ sent: [] }>();

// Rendered in the browser only, so reading the clock here is safe.
const expired = new Date(props.transfer.expiresAt) < new Date();
const copied = ref(false);

async function copy() {
  try {
    await navigator.clipboard.writeText(props.transfer.accountNumber);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // No clipboard in this webview; the number is on screen to copy by hand.
  }
}
</script>
