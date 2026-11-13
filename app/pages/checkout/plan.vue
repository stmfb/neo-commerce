<template>
  <div class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <ShimmerRegion v-if="loading" label="Getting your plans" class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <Shimmer rounded="xl" class="h-72" />
      <Shimmer rounded="xl" class="h-56" />
    </ShimmerRegion>

    <StatusBanner v-else-if="error || !quote" tone="error" title="We couldn't get your plans">
      {{ error }}
      <template #actions>
        <NcButton size="sm" @click="load">Try again</NcButton>
        <NcButton to="/cart" variant="secondary" size="sm">Back to cart</NcButton>
      </template>
    </StatusBanner>

    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div class="space-y-6">
        <StatusBanner v-if="quote.declineReason" tone="warning" title="Pay Small Small isn't available right now">
          {{ quote.declineReason.message }}
        </StatusBanner>

        <StatusBanner v-if="quote.ineligibleItems?.length" tone="warning" title="Not included in this checkout">
          {{ quote.ineligibleItems.map((item) => `${item.title}: ${item.reason}`).join(". ") }}
        </StatusBanner>

        <StatusBanner v-if="quote.eligible && sellerCount > 1" tone="dark" :title="`One plan for all ${sellerCount} sellers`">
          <template #icon>
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
              <path d="M3 7l7-4 7 4-7 4-7-4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
              <path d="M3 7v6l7 4 7-4V7" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
            </svg>
          </template>
          Whatever you pick below covers the whole basket. You will not have {{ sellerCount }} loans.
        </StatusBanner>

        <template v-if="quote.eligible">
          <div class="rounded-xl border border-line bg-white p-5">
            <div class="mb-4 flex items-center justify-between">
              <p class="text-sm font-bold text-primary-dark-900">Choose how you pay</p>
              <p class="text-xs text-primary-dark-300">Repayments start after delivery</p>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <RadioCard
                v-for="plan in quote.plans"
                :key="plan.planCode"
                :selected="planCode === plan.planCode"
                @select="planCode = plan.planCode"
              >
                <template #default="{ selected }">
                  <div class="mb-3 flex items-center gap-2">
                    <RadioDot :selected="selected" />
                    <span class="text-sm font-semibold text-primary-dark-900">{{ plan.label }}</span>
                  </div>
                  <p class="text-lg font-bold text-primary-dark-900">
                    <span v-if="instalmentsVary(plan)" class="text-xs font-semibold text-primary-dark-400">Up to</span>
                    {{ formatKobo(plan.instalmentKobo) }}
                  </p>
                  <p class="text-xs text-primary-dark-400">
                    × {{ plan.instalmentCount }} instalment{{ plan.instalmentCount > 1 ? "s" : "" }}
                  </p>
                  <dl class="mt-3 space-y-1.5 text-xs text-primary-dark-400">
                    <div class="flex justify-between">
                      <dt>Pay today</dt>
                      <dd class="font-semibold text-primary-dark-700">{{ formatKobo(plan.downPaymentKobo) }}</dd>
                    </div>
                    <div class="flex justify-between">
                      <dt>Total repayable</dt>
                      <dd class="font-semibold text-primary-dark-700">{{ formatKobo(plan.totalRepayableKobo) }}</dd>
                    </div>
                    <div class="flex justify-between">
                      <dt class="font-semibold text-primary-dark-600">Cost of credit</dt>
                      <dd class="font-semibold text-primary-dark-700">{{ formatKobo(plan.totalCostOfCreditKobo) }}</dd>
                    </div>
                  </dl>
                </template>
              </RadioCard>
            </div>

            <p class="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-primary-dark-400">
              Total cost of credit is always shown in Naira, never as a percentage alone. Instalments can differ
              slightly; where they do, we show the largest.
            </p>
          </div>

          <div class="rounded-xl border border-line bg-white p-5">
            <p class="mb-4 text-sm font-bold text-primary-dark-900">Delivery address</p>
            <p v-if="addressError" class="mb-3 text-sm text-rose-600">{{ addressError }}</p>
            <div v-if="addresses.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <RadioCard
                v-for="option in addresses"
                :key="option.id"
                :selected="addressId === option.id"
                @select="pickAddress(option)"
              >
                <template #default="{ selected }">
                  <div class="flex items-start gap-2.5">
                    <RadioDot :selected="selected" />
                    <div>
                      <p class="text-sm font-semibold text-primary-dark-900">{{ option.label }}</p>
                      <p class="mt-0.5 text-xs text-primary-dark-400">{{ formatAddress(option) }}</p>
                      <p v-if="!option.serviceable" class="mt-1 text-xs font-semibold text-rose-600">
                        We deliver within Lagos for now
                      </p>
                    </div>
                  </div>
                </template>
              </RadioCard>
            </div>
            <AddressForm
              v-if="addingAddress || !addresses.length"
              :cancellable="addresses.length > 0"
              @saved="addingAddress = false"
              @cancel="addingAddress = false"
            />
            <button
              v-else
              type="button"
              class="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700"
              @click="addingAddress = true"
            >
              Add a new address
            </button>
          </div>
        </template>
      </div>

      <aside class="h-fit space-y-4 lg:sticky lg:top-28">
        <div class="rounded-xl border border-line bg-white p-5">
          <p class="text-sm font-bold text-primary-dark-900">Your basket</p>
          <div class="mt-3 space-y-3">
            <div v-for="group in quote.summary" :key="group.merchantId" class="flex items-center justify-between text-sm">
              <div>
                <p class="font-semibold text-primary-dark-800">{{ group.merchantName }}</p>
                <p class="text-xs text-primary-dark-400">{{ formatEta(group.fulfilmentEtaDays) }}</p>
              </div>
              <p class="font-semibold text-primary-dark-800">{{ formatKobo(group.subtotalKobo) }}</p>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm font-bold text-primary-dark-900">
            <span>Basket total</span>
            <span>{{ formatKobo(quote.totalKobo) }}</span>
          </div>
          <NcButton block size="lg" class="mt-4" :disabled="!canContinue" @click="router.push('/checkout/disclosures')">
            Continue
          </NcButton>
          <NcButton v-if="!quote.eligible" to="/cart" variant="secondary" block size="lg" class="mt-2">Back to cart</NcButton>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { ApiAddress } from "~/models/checkout_model";
import { formatAddress, formatEta, instalmentsVary } from "~/composables/useCheckout";

definePageMeta({ layout: "checkout" });

const router = useRouter();
const { cart, canCheckout, fetchCart } = useCart();
const { quote, planCode, addresses, addressId, address, sellerCount, startQuote, fetchAddresses } = useCheckout();

const loading = ref(true);
const error = ref("");
const addressError = ref("");
const addingAddress = ref(false);

const canContinue = computed(() => Boolean(quote.value?.eligible && planCode.value && address.value?.serviceable));

// Signed-in data loads in the browser only.
onMounted(load);

async function load() {
  loading.value = true;
  error.value = "";
  if (!cart.value) await fetchCart();
  if (!cart.value || !canCheckout.value) return router.replace("/cart");

  const [res, addressRes] = await Promise.all([startQuote(cart.value), fetchAddresses()]);
  if (res.code === "cart_version_conflict" || res.code === "revalidation_required") {
    await fetchCart();
    return router.replace("/cart");
  }
  error.value = res.ok ? "" : (res.message ?? "Something went wrong");
  addressError.value = addressRes.ok ? "" : (addressRes.message ?? "");
  loading.value = false;
}

function pickAddress(option: ApiAddress) {
  if (option.serviceable) addressId.value = option.id;
}
</script>
