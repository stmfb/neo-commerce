<template>
  <div class="mx-auto max-w-[720px] space-y-6 px-4 py-8 sm:px-6">
    <div>
      <h1 class="text-2xl font-bold text-primary-dark-900">Two things to confirm</h1>
      <p class="mt-1 text-sm text-primary-dark-400">These are separate agreements and we need each one on its own. Read both.</p>
    </div>

    <div class="rounded-xl border border-line bg-white p-5">
      <div class="mb-3 flex items-center gap-2.5">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500">
          <IconStore />
        </span>
        <p class="text-sm font-bold text-primary-dark-900">Who you're buying from</p>
      </div>

      <p class="text-sm leading-relaxed text-primary-dark-600">
        Your items are sold by <strong class="text-primary-dark-900">{{ sellerNames }}</strong>. Each of them is
        the seller of the items you bought from them, and each is responsible for delivering your item, its
        condition, and any return or refund.
      </p>
      <p class="mt-2 text-sm leading-relaxed text-primary-dark-600">
        NeoCash finances your purchase. We are not the seller. We are not liable for refunds, returns, or
        product condition. If something is wrong with an item, you deal with the seller of that item first.
      </p>
      <button type="button" class="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700" @click="showFullStatement = !showFullStatement">
        {{ showFullStatement ? "Hide full statement" : "Read the full statement" }}
      </button>
      <p v-if="showFullStatement" class="mt-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-primary-dark-500">
        NeoCash Technologies Limited acts solely as a financing provider. All product listings, pricing,
        fulfilment, warranty and after-sales support are the responsibility of the seller named on each item.
        Disputes about product condition, delivery or refunds should be raised with that seller first, and
        with NeoCash support if it remains unresolved.
      </p>

      <label class="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3.5 hover:border-primary-200">
        <Checkbox :model-value="sellerAgreementAccepted" />
        <input type="checkbox" class="sr-only" v-model="sellerAgreementAccepted" />
        <span class="text-sm text-primary-dark-700">
          I understand {{ sellerNames }} {{ sellerNamesCount > 1 ? "are" : "is" }} the seller{{ sellerNamesCount > 1 ? "s" : "" }}
          — not NeoCash — and they handle delivery, returns and refunds.
        </span>
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
          <dd class="font-bold text-primary-dark-900">{{ formatNaira(plan.payToday) }}</dd>
        </div>
        <div>
          <dt class="text-primary-dark-400">Then per month</dt>
          <dd class="font-bold text-primary-dark-900">{{ formatNaira(plan.monthly) }}</dd>
        </div>
        <div>
          <dt class="text-primary-dark-400">Total repayable</dt>
          <dd class="font-bold text-primary-dark-900">{{ formatNaira(plan.totalRepayable) }}</dd>
        </div>
        <div>
          <dt class="text-primary-dark-400">Total cost of credit</dt>
          <dd class="font-bold text-primary-dark-900">{{ formatNaira(plan.costOfCredit) }}</dd>
        </div>
      </dl>

      <p class="mt-3 text-sm leading-relaxed text-primary-dark-600">
        This is one credit agreement covering all {{ sellerNamesCount }} seller{{ sellerNamesCount > 1 ? "s" : "" }}.
        Repayment starts when your first item is delivered, not today.
      </p>
      <button type="button" class="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700" @click="showAgreement = !showAgreement">
        {{ showAgreement ? "Hide credit agreement" : "Read the credit agreement" }}
      </button>
      <p v-if="showAgreement" class="mt-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-primary-dark-500">
        This agreement covers a {{ plan.months }}-month repayment plan of {{ formatNaira(plan.monthly) }} per
        month following an initial payment of {{ formatNaira(plan.payToday) }}. Missed instalments may affect
        your NeoCash limit and future eligibility.
      </p>

      <label class="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3.5 hover:border-primary-200">
        <Checkbox :model-value="creditAgreementAccepted" />
        <input type="checkbox" class="sr-only" v-model="creditAgreementAccepted" />
        <span class="text-sm text-primary-dark-700">I agree to this credit agreement and the repayment schedule above.</span>
      </label>
    </div>

    <div class="flex items-center justify-between gap-4 rounded-xl border border-line bg-white p-4">
      <p class="text-xs text-primary-dark-400">Both boxes are needed. Nothing is shown as an error until you try — the button is simply not available yet.</p>
      <NcButton size="lg" :disabled="!bothAccepted" @click="continueToAuthorise">Continue</NcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { getPlanQuote } from "~/utils/quote";

definePageMeta({ layout: "checkout" });

const router = useRouter();
const { groups, subtotal, isEmpty } = useCart();
const { selectedMonths, sellerAgreementAccepted, creditAgreementAccepted, bothAccepted } = useCheckout();

const showFullStatement = ref(false);
const showAgreement = ref(false);

const plan = computed(() => {
  const quote = getPlanQuote(subtotal.value).find((entry) => entry.months === selectedMonths.value);
  return quote ?? getPlanQuote(subtotal.value)[0];
});

const sellerNamesCount = computed(() => groups.value.length);
const sellerNames = computed(() => {
  const names = groups.value.map((group) => group.merchantName);
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
});

if (import.meta.client && isEmpty.value) {
  router.replace("/cart");
}

function continueToAuthorise() {
  if (!bothAccepted.value) return;
  router.push("/checkout/authorise");
}
</script>
