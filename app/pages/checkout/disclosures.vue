<template>
  <div class="mx-auto max-w-[720px] space-y-6 px-4 py-8 sm:px-6">
    <div>
      <h1 class="text-2xl font-bold text-primary-dark-900">Two things to confirm</h1>
      <p class="mt-1 text-sm text-primary-dark-400">These are separate agreements and we need each one on its own. Read both.</p>
    </div>

    <StatusBanner v-if="route.query.refreshed" tone="info" title="We refreshed your quote">
      It had expired, so we checked your basket again. Please confirm both agreements once more.
    </StatusBanner>

    <ShimmerRegion v-if="loading" label="Loading the agreements" class="space-y-6">
      <Shimmer rounded="xl" class="h-56" />
      <Shimmer rounded="xl" class="h-64" />
    </ShimmerRegion>

    <StatusBanner v-else-if="!disclosures" tone="error" title="We couldn't load the agreements">
      {{ error }}
      <template #actions>
        <NcButton size="sm" @click="load">Try again</NcButton>
      </template>
    </StatusBanner>

    <template v-else>
      <div class="rounded-xl border border-line bg-white p-5">
        <div class="mb-3 flex items-center gap-2.5">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
            <IconStore />
          </span>
          <p class="text-sm font-bold text-primary-dark-900">Who you're buying from</p>
        </div>

        <p class="text-sm leading-relaxed text-primary-dark-600">{{ disclosures.sellerLiability.summary }}</p>
        <button type="button" class="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700" @click="showFullStatement = !showFullStatement">
          {{ showFullStatement ? "Hide full statement" : "Read the full statement" }}
        </button>
        <p v-if="showFullStatement" class="mt-2 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-primary-dark-500">
          {{ disclosures.sellerLiability.fullText }}
        </p>

        <label class="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3.5 hover:border-primary-200">
          <Checkbox :model-value="sellerAccepted" />
          <input type="checkbox" class="sr-only" v-model="sellerAccepted" />
          <span class="text-sm text-primary-dark-700">{{ disclosures.sellerLiability.checkLabel }}</span>
        </label>
      </div>

      <div class="rounded-xl border border-line bg-white p-5">
        <div class="mb-3 flex items-center gap-2.5">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
            <IconDocument />
          </span>
          <p class="text-sm font-bold text-primary-dark-900">What you're borrowing</p>
        </div>

        <dl class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-primary-dark-400">Pay today</dt>
            <dd class="font-bold text-primary-dark-900">{{ formatKobo(plan.downPaymentKobo) }}</dd>
          </div>
          <div>
            <dt class="text-primary-dark-400">Then {{ plan.instalmentCount }} instalments of</dt>
            <dd class="font-bold text-primary-dark-900">
              {{ instalmentsVary(plan) ? "Up to " : "" }}{{ formatKobo(plan.instalmentKobo) }}
            </dd>
          </div>
          <div>
            <dt class="text-primary-dark-400">Total repayable</dt>
            <dd class="font-bold text-primary-dark-900">{{ formatKobo(plan.totalRepayableKobo) }}</dd>
          </div>
          <div>
            <dt class="text-primary-dark-400">Total cost of credit</dt>
            <dd class="font-bold text-primary-dark-900">{{ formatKobo(plan.totalCostOfCreditKobo) }}</dd>
          </div>
        </dl>

        <p class="mt-3 text-sm leading-relaxed text-primary-dark-600">{{ disclosures.creditAgreement.summary }}</p>
        <p class="mt-2 text-sm leading-relaxed text-primary-dark-600">
          This is one credit agreement covering all {{ sellerCount }} seller{{ sellerCount > 1 ? "s" : "" }}.
          Repayment starts when your first item is delivered, not today.
        </p>
        <button type="button" class="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700" @click="showAgreement = !showAgreement">
          {{ showAgreement ? "Hide credit agreement" : "Read the credit agreement" }}
        </button>
        <p v-if="showAgreement" class="mt-2 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-primary-dark-500">
          {{ disclosures.creditAgreement.fullText }}
        </p>

        <label class="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3.5 hover:border-primary-200">
          <Checkbox :model-value="creditAccepted" />
          <input type="checkbox" class="sr-only" v-model="creditAccepted" />
          <span class="text-sm text-primary-dark-700">{{ disclosures.creditAgreement.checkLabel }}</span>
        </label>
      </div>

      <div class="flex items-center justify-between gap-4 rounded-xl border border-line bg-white p-4">
        <p class="text-xs" :class="error ? 'text-rose-600' : 'text-primary-dark-400'">{{ error || "Both boxes are needed." }}</p>
        <NcButton size="lg" :disabled="!bothAccepted" :loading="busy" @click="continueToAuthorise">Continue</NcButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { instalmentsVary } from "~/composables/useCheckout";

definePageMeta({ layout: "checkout" });

const route = useRoute();
const router = useRouter();
const { quote, addressId, sellerCount, disclosures, fetchDisclosures, acknowledge } = useCheckout();

const loading = ref(true);
const busy = ref(false);
const error = ref("");
const sellerAccepted = ref(false);
const creditAccepted = ref(false);
const showFullStatement = ref(false);
const showAgreement = ref(false);

const bothAccepted = computed(() => sellerAccepted.value && creditAccepted.value);
// The plan as the agreement states it.
const plan = computed(() => disclosures.value!.plan);

onMounted(() => {
  if (!quote.value?.eligible || !addressId.value) return router.replace("/checkout/plan");
  load();
});

async function load() {
  loading.value = true;
  const res = await fetchDisclosures();
  error.value = res.ok ? "" : (res.message ?? "Something went wrong");
  loading.value = false;
}

async function continueToAuthorise() {
  if (!bothAccepted.value) return;
  busy.value = true;
  const res = await acknowledge();
  busy.value = false;
  if (res.ok) return router.push("/checkout/authorise");

  if (res.code === "address_not_serviceable" || res.fields?.addressId || res.fields?.planCode) {
    return router.push("/checkout/plan");
  }
  if (res.code === "already_submitted") return router.push("/checkout/processing");
  if (res.code === "disclosures_missing") {
    // The wording changed: show the current version to accept.
    sellerAccepted.value = creditAccepted.value = false;
    await load();
  }
  error.value = res.message ?? "Something went wrong";
}
</script>
