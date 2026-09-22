<template>
  <div class="mx-auto max-w-[420px] space-y-6 px-4 py-8 sm:px-6">
    <div class="text-center">
      <p class="text-sm text-primary-dark-400">Pay today</p>
      <p class="mt-1 text-3xl font-bold text-primary-dark-900">{{ formatNaira(plan.payToday) }}</p>
      <p class="mt-1 text-sm text-primary-dark-400">
        then {{ formatNaira(plan.monthly) }}/mo · one plan, {{ sellerCount }} seller{{ sellerCount > 1 ? "s" : "" }}
      </p>
    </div>

    <div class="rounded-xl border border-line bg-white p-5">
      <p class="mb-3 text-sm font-bold text-primary-dark-900">Pay with</p>
      <div class="space-y-2.5">
        <RadioCard :selected="paymentMethod === 'card'" @select="paymentMethod = 'card'">
          <template #default="{ selected }">
            <div class="flex items-center gap-3">
              <RadioDot :selected="selected" />
              <span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-600">
                <IconCard />
              </span>
              <span class="text-sm font-medium text-primary-dark-900">GTBank card &middot;&middot;&middot;&middot; 4412</span>
            </div>
          </template>
        </RadioCard>
        <RadioCard :selected="paymentMethod === 'transfer'" @select="paymentMethod = 'transfer'">
          <template #default="{ selected }">
            <div class="flex items-center gap-3">
              <RadioDot :selected="selected" />
              <span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-600">
                <IconBank />
              </span>
              <span class="text-sm font-medium text-primary-dark-900">Bank transfer</span>
            </div>
          </template>
        </RadioCard>
      </div>

      <div class="mt-6 text-center">
        <p class="mb-3 text-sm font-medium text-primary-dark-700">Enter your NeoCash PIN</p>
        <div class="relative mx-auto flex w-fit justify-center gap-3" @click="focusPin">
          <span
            v-for="n in 4"
            :key="n"
            class="h-3.5 w-3.5 rounded-full transition-colors"
            :class="pin.length >= n ? 'bg-primary-dark' : 'border-2 border-primary-dark-200'"
          />
          <input
            ref="pinInput"
            v-model="pin"
            type="tel"
            inputmode="numeric"
            maxlength="4"
            class="absolute inset-0 h-full w-full cursor-default opacity-0"
            @input="pin = pin.replace(/\D/g, '').slice(0, 4)"
          />
        </div>
        <button type="button" class="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700">
          Use fingerprint instead
        </button>
      </div>

      <NcButton block size="lg" class="mt-6" :disabled="pin.length !== 4" @click="submit">Pay &amp; confirm</NcButton>

      <p class="mt-3 text-center text-xs text-primary-dark-400">
        One authorisation covers all {{ sellerCount }} seller{{ sellerCount > 1 ? "s" : "" }}. If this doesn't go
        through, nothing is charged.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { getPlanQuote } from "~/utils/quote";

definePageMeta({ layout: "checkout" });

const router = useRouter();
const { sellerCount, subtotal, isEmpty } = useCart();
const { selectedMonths, paymentMethod } = useCheckout();

const pin = ref("");
const pinInput = ref<HTMLInputElement>();

const plan = computed(() => {
  const quote = getPlanQuote(subtotal.value).find((entry) => entry.months === selectedMonths.value);
  return quote ?? getPlanQuote(subtotal.value)[0];
});

if (import.meta.client && isEmpty.value) {
  router.replace("/cart");
}

function focusPin() {
  pinInput.value?.focus();
}

function submit() {
  if (pin.value.length !== 4) return;
  router.push("/checkout/processing");
}
</script>
