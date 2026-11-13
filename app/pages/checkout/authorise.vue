<template>
  <div class="mx-auto max-w-[420px] space-y-6 px-4 py-8 sm:px-6">
    <ShimmerRegion v-if="!ready" label="Loading">
      <Shimmer rounded="xl" class="h-80" />
    </ShimmerRegion>

    <TransferDetails v-else-if="transfer" :transfer="transfer" @sent="router.push('/checkout/processing')" />

    <template v-else-if="plan">
      <div class="text-center">
        <p class="text-sm text-primary-dark-400">Pay today</p>
        <p class="mt-1 text-3xl font-bold text-primary-dark-900">{{ formatKobo(plan.downPaymentKobo) }}</p>
        <p class="mt-1 text-sm text-primary-dark-400">
          then {{ instalmentsVary(plan) ? "up to " : "" }}{{ formatKobo(plan.instalmentKobo) }} × {{ plan.instalmentCount }}
          · one plan, {{ sellerCount }} seller{{ sellerCount > 1 ? "s" : "" }}
        </p>
      </div>

      <div class="rounded-xl border border-line bg-white p-5">
        <EmploymentForm
          v-if="kycStep === 'employment'"
          :busy="busy"
          :fields="fields"
          :home-address="homeAddress"
          @submit="saveEmployment"
        />

        <div v-else-if="kycStep === 'bank_link'" class="text-center">
          <span class="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <IconBank />
          </span>
          <p class="mt-3 text-sm font-bold text-primary-dark-900">Connect your salary account</p>
          <p class="mt-1 text-xs text-primary-dark-400">
            We use Mono to read your recent statements. It's read-only, and you can revoke it any time.
          </p>
          <NcButton block size="lg" class="mt-5" :loading="busy" @click="connectBank">Connect my bank</NcButton>
        </div>

        <StatusBanner v-else-if="locked" tone="error" title="Your PIN is locked">{{ error }}</StatusBanner>

        <template v-else>
          <p class="mb-3 text-sm font-bold text-primary-dark-900">Pay with</p>
          <RadioCard selected>
            <div class="flex items-center gap-3">
              <RadioDot selected />
              <span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-600">
                <IconBank />
              </span>
              <div>
                <p class="text-sm font-medium text-primary-dark-900">Bank transfer</p>
                <p class="text-xs text-primary-dark-400">You'll get an account to pay into after you confirm</p>
              </div>
            </div>
          </RadioCard>

          <div class="mt-6 text-center">
            <p class="mb-3 text-sm font-medium text-primary-dark-700">Enter your NeoCash PIN</p>
            <PinInput v-model="pin" />
          </div>

          <NcButton block size="lg" class="mt-6" :disabled="pin.length !== 4" :loading="busy" @click="submit()">Confirm</NcButton>

          <p class="mt-3 text-center text-xs text-primary-dark-400">
            One authorisation covers all {{ sellerCount }} seller{{ sellerCount > 1 ? "s" : "" }}. If this doesn't go
            through, nothing is charged.
          </p>
        </template>

        <p v-if="error && !locked" class="mt-3 text-center text-sm text-rose-600">{{ error }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { ApiAuthoriseResult, EmploymentBody } from "~/models/checkout_model";
import type { CheckoutResult } from "~/stores/checkout";
import { instalmentsVary, openMonoConnect } from "~/composables/useCheckout";

definePageMeta({ layout: "checkout" });

const router = useRouter();
const { fetchCart } = useCart();
const { plan, address, sellerCount, transfer, authorise, requote, submitEmployment, linkBank } = useCheckout();

// The PIN lives only here, in memory. Every authorise call checks it, including the ones after a credit step.
const pin = ref("");
// The store is restored from storage in the browser, so render after mount.
const ready = ref(false);
const busy = ref(false);
const error = ref("");
const locked = ref(false);
const kycStep = ref<"employment" | "bank_link" | null>(null);
const fields = ref<Record<string, string>>({});

const homeAddress = computed(() =>
  address.value ? [address.value.line1, address.value.line2, address.value.city, address.value.state].filter(Boolean).join(", ") : "",
);

onMounted(() => {
  if (!transfer.value && !plan.value) return router.replace("/checkout/plan");
  ready.value = true;
});

/** Authorises with the PIN in memory. */
async function submit(retried = false) {
  busy.value = true;
  error.value = "";
  const res = await authorise(pin.value);
  busy.value = false;
  if (res.data) handle(res.data);
  else await handleError(res, retried);
  return res.data;
}

function handle(result: ApiAuthoriseResult) {
  kycStep.value = null;
  if (result.state === "auth_failed") {
    pin.value = "";
    const left = result.auth?.attemptsRemaining ?? 0;
    error.value = `That PIN isn't right. ${left} attempt${left === 1 ? "" : "s"} left.`;
    return;
  }
  if (result.state === "kyc_required") {
    kycStep.value = result.kyc?.step ?? null;
    return;
  }
  pin.value = "";
  // With a transfer to make, the store's `transfer` shows it here. Otherwise the status page takes over.
  if (!result.transfer) router.push("/checkout/processing");
}

async function handleError(res: CheckoutResult, retried: boolean) {
  switch (res.code) {
    case "session_expired":
      // The credit session timed out; authorising again opens a new one.
      if (!retried) return submit(true);
      break;
    case "quote_expired": {
      // A new quote means a new checkout, so the agreements need confirming again.
      const fresh = await requote();
      if (fresh.ok) return router.push({ path: "/checkout/disclosures", query: { refreshed: "1" } });
      error.value = fresh.message ?? "Something went wrong";
      return;
    }
    case "disclosures_missing":
      return router.push("/checkout/disclosures");
    case "address_not_serviceable":
      return router.push("/checkout/plan");
    case "revalidation_required":
    case "cart_version_conflict":
      await fetchCart();
      return router.push("/cart");
    case "already_submitted":
      return router.push("/checkout/processing");
    case "auth_locked":
      locked.value = true;
      pin.value = "";
      break;
    case "payment_setup_failed":
      // The order is placed; Confirm again (PIN still in memory) to get the transfer account.
      kycStep.value = null;
      break;
  }
  error.value = res.message ?? "Something went wrong";
}

async function saveEmployment(body: EmploymentBody) {
  busy.value = true;
  error.value = "";
  const res = await submitEmployment(body);
  busy.value = false;
  fields.value = res.fields ?? {};
  if (res.ok) await submit();
  else await handleError(res, false);
}

async function connectBank() {
  busy.value = true;
  error.value = "";
  const res = await linkBank();
  if (!res.data) {
    busy.value = false;
    return handleError(res, false);
  }
  // Without Mono set up (no key, or the stub's cus_test_ customer) the link is already done.
  if (res.data.publicKey && !res.data.customerId.startsWith("cus_test_")) {
    const linked = await openMonoConnect(res.data).catch((e: Error) => {
      error.value = e.message;
      return false;
    });
    if (!linked) {
      busy.value = false;
      return;
    }
  }
  // Mono tells the backend by webhook, so authorise may ask for the link a few more times.
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt) await new Promise((resolve) => setTimeout(resolve, 3000));
    const result = await submit();
    busy.value = true;
    if (result?.kyc?.step !== "bank_link") break;
  }
  busy.value = false;
  if (kycStep.value === "bank_link" && !error.value) {
    error.value = "We're still waiting for your bank to confirm. Give it a moment, then try again.";
  }
}
</script>
