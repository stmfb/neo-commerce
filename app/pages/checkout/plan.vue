<template>
  <div class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div class="space-y-6">
        <StatusBanner v-if="sellerCount > 1" tone="dark" :title="`One plan for all ${sellerCount} sellers`">
          <template #icon>
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M3 7l7-4 7 4-7 4-7-4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
              <path d="M3 7v6l7 4 7-4V7" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
            </svg>
          </template>
          Whatever you pick below covers the whole basket. You will not have {{ sellerCount }} loans.
        </StatusBanner>

        <div class="rounded-xl border border-line bg-white p-5">
          <div class="mb-4 flex items-center justify-between">
            <p class="text-sm font-bold text-primary-dark-900">Choose how you pay</p>
            <p class="text-xs text-primary-dark-300">All figures backend-supplied — no client math</p>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <RadioCard
              v-for="plan in plans"
              :key="plan.months"
              :selected="selectedMonths === plan.months"
              @select="selectedMonths = plan.months"
            >
              <template #default="{ selected }">
                <div class="mb-3 flex items-center gap-2">
                  <RadioDot :selected="selected" />
                  <span class="text-sm font-semibold text-primary-dark-900">{{ plan.months }} months</span>
                </div>
                <p class="text-lg font-bold text-primary-dark-900">{{ formatNaira(plan.monthly) }}/mo</p>
                <dl class="mt-3 space-y-1.5 text-xs text-primary-dark-400">
                  <div class="flex justify-between">
                    <dt>Pay today</dt>
                    <dd class="font-semibold text-primary-dark-700">{{ formatNaira(plan.payToday) }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt>Total repayable</dt>
                    <dd class="font-semibold text-primary-dark-700">{{ formatNaira(plan.totalRepayable) }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="font-semibold text-primary-dark-600">Cost of credit</dt>
                    <dd class="font-semibold text-primary-dark-700">{{ formatNaira(plan.costOfCredit) }}</dd>
                  </div>
                </dl>
              </template>
            </RadioCard>
          </div>

          <p class="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-primary-dark-400">
            Total cost of credit is always shown in Naira, never as a percentage alone. Every figure here
            comes from the checkout quote — the frontend never computes or rounds them.
          </p>
        </div>

        <div class="rounded-xl border border-line bg-white p-5">
          <p class="mb-4 text-sm font-bold text-primary-dark-900">Delivery address</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <RadioCard
              v-for="address in deliveryAddresses"
              :key="address.id"
              :selected="selectedAddressId === address.id"
              @select="selectedAddressId = address.id"
            >
              <template #default="{ selected }">
                <div class="flex items-start gap-2.5">
                  <RadioDot :selected="selected" />
                  <div>
                    <p class="text-sm font-semibold text-primary-dark-900">{{ address.label }}</p>
                    <p class="mt-0.5 text-xs text-primary-dark-400">{{ address.detail }}</p>
                  </div>
                </div>
              </template>
            </RadioCard>
          </div>
          <button type="button" class="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700">
            Add a new address
          </button>
        </div>
      </div>

      <aside class="h-fit space-y-4 lg:sticky lg:top-28">
        <div class="rounded-xl border border-line bg-white p-5">
          <p class="text-sm font-bold text-primary-dark-900">Your basket</p>
          <div class="mt-3 space-y-3">
            <div v-for="group in groups" :key="group.merchantSlug" class="flex items-center justify-between text-sm">
              <div>
                <p class="font-semibold text-primary-dark-800">{{ group.merchantName }}</p>
                <p class="text-xs text-primary-dark-400">{{ group.deliveryEta }}</p>
              </div>
              <p class="font-semibold text-primary-dark-800">{{ formatNaira(group.subtotal) }}</p>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm font-bold text-primary-dark-900">
            <span>Basket total</span>
            <span>{{ formatNaira(subtotal) }}</span>
          </div>
          <NcButton block size="lg" class="mt-4" @click="continueToDisclosures">Continue</NcButton>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { getPlanQuote } from "~/utils/quote";
import { deliveryAddresses } from "~/composables/useCheckout";

definePageMeta({ layout: "checkout" });

const router = useRouter();
const { groups, sellerCount, subtotal, isEmpty } = useCart();
const { selectedMonths, selectedAddressId } = useCheckout();

const plans = computed(() => getPlanQuote(subtotal.value));

onMounted(() => {
  if (isEmpty.value) router.replace("/cart");
});

function continueToDisclosures() {
  router.push("/checkout/disclosures");
}
</script>
