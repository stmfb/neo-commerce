<template>
  <div v-if="!signedIn" class="mx-auto max-w-[1320px] px-4 py-16 sm:px-6">
    <EmptyState title="Sign in to see this order" description="Your orders and repayments are linked to your NeoCash account.">
      <template #actions>
        <NcButton @click="requestSession">Sign in</NcButton>
      </template>
    </EmptyState>
  </div>

  <div v-else-if="order?.orderId === id" class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <Breadcrumb class="mb-4" :items="[{ label: 'Home', to: '/' }, { label: 'My orders', to: '/orders' }, { label: order.orderNumber }]" />

    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-3xl font-bold font-display text-primary-dark">Order {{ order.orderNumber }}</h1>
        <p class="mt-1 text-sm text-primary-dark-400">
          Placed {{ formatOrderDate(order.createdAt) }} · {{ sellerCount }} seller{{ sellerCount === 1 ? "" : "s" }} · one plan
        </p>
      </div>
      <NcButton v-if="help.email" :to="`mailto:${help.email}`" variant="secondary" size="sm">
        Get help with this order
      </NcButton>
    </div>

    <OrderMandateBanner v-if="order.mandate" :mandate="order.mandate" class="mb-5" />

    <StatusBanner v-if="order.fulfilment" tone="info" :title="order.fulfilment.label" class="mb-5">
      <template #icon>
        <img src="/package.png" alt="" class="h-6 w-6" />
      </template>
    </StatusBanner>

    <StatusBanner
      v-for="adjustment in order.adjustments"
      :key="adjustment.id"
      :title="`Your ${adjustment.merchantName} order was cancelled`"
      class="mb-5"
    >
      <template #icon>
        <IconReturn />
      </template>
      <!-- The generic reason only repeats the title. -->
      <template v-if="adjustment.reason.code !== 'cancelled'">{{ adjustment.reason.message }} </template>
      <template v-if="adjustment.kind === 'refunded'">
        {{ formatKobo(adjustment.refundKobo ?? 0) }} has been refunded to your NeoCash account.
      </template>
      <template v-else>Your plan is now {{ formatKobo(adjustment.newTotalKobo ?? 0) }}.</template>
    </StatusBanner>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div class="space-y-4">
        <SubOrderCard v-for="sub in order.subOrders" :key="sub.subOrderId" :order-id="order.orderId" :sub-order="sub" />
      </div>

      <aside class="h-fit space-y-4 lg:sticky lg:top-28">
        <div class="rounded-xl border border-line bg-white p-5">
          <p class="text-sm font-bold text-primary-dark-900">Your repayment schedule</p>
          <p class="mt-3 rounded-lg bg-primary-50 px-3 py-2.5 text-xs text-primary-dark-500">
            {{ order.repayment.activationNote }}
          </p>
          <ul class="mt-4 space-y-3">
            <li v-if="order.repayment.downPaidKobo" class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-3">
                <span class="h-6 w-6 shrink-0 rounded-full border-2 border-emerald-100 bg-emerald-100" />
                <div>
                  <p class="font-medium text-primary-dark-800">Upfront payment</p>
                  <p class="text-xs text-primary-dark-400">Paid</p>
                </div>
              </div>
              <p class="font-semibold text-primary-dark-800">{{ formatKobo(order.repayment.downPaidKobo) }}</p>
            </li>
            <li v-for="instalment in order.repayment.instalments" :key="instalment.seq" class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-3">
                <span class="h-6 w-6 shrink-0 rounded-full border-2 border-primary-dark-100 bg-white" />
                <div>
                  <p class="font-medium text-primary-dark-800">Instalment {{ instalment.seq }}</p>
                  <p class="text-xs text-primary-dark-400">
                    <time v-if="instalment.dueDate" :datetime="instalment.dueDate">{{ instalment.dueLabel }}</time>
                    <template v-else>{{ instalment.dueLabel }}</template>
                  </p>
                </div>
              </div>
              <p class="font-semibold text-primary-dark-800">{{ formatKobo(instalment.amountKobo) }}</p>
            </li>
          </ul>
          <div class="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm font-bold text-primary-dark-900">
            <span>Total repayable</span>
            <span>{{ formatKobo(order.repayment.totalRepayableKobo) }}</span>
          </div>
          <div v-if="order.repayment.activated" class="mt-1 flex items-center justify-between text-sm text-primary-dark-500">
            <span>Outstanding</span>
            <span>{{ formatKobo(order.repayment.outstandingKobo) }}</span>
          </div>
        </div>

        <div v-if="order.address.line1" class="rounded-xl border border-line bg-white p-5">
          <p class="text-sm font-bold text-primary-dark-900">Delivery address</p>
          <p class="mt-2 text-sm text-primary-dark-500">
            {{ order.address.line1 }}<template v-if="order.address.line2">, {{ order.address.line2 }}</template><br />
            {{ order.address.city }}, {{ order.address.state }}
          </p>
        </div>

        <div v-if="help.email || help.phone" class="rounded-xl border border-line bg-white p-5">
          <p class="text-sm font-bold text-primary-dark-900">Get help</p>
          <p class="mt-1 text-xs text-primary-dark-400">Contact the seller first. If they can't sort it out, NeoCash can help.</p>
          <a v-if="help.email" :href="`mailto:${help.email}`" class="mt-3 block text-sm font-medium text-primary-600">{{ help.email }}</a>
          <a v-if="help.phone" :href="`tel:${help.phone}`" class="mt-1 block text-sm font-medium text-primary-600">{{ help.phone }}</a>
        </div>
      </aside>
    </div>
  </div>

  <div v-else-if="showShimmer" class="mx-auto max-w-[1320px] px-4 py-6 sm:px-6">
    <ShimmerRegion label="Loading order…">
      <div class="space-y-5">
        <Shimmer class="h-4 w-56" />
        <Shimmer class="h-8 w-64 max-w-full" />
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div class="space-y-4">
            <Shimmer v-for="n in 2" :key="n" rounded="xl" class="h-56 w-full" />
          </div>
          <Shimmer rounded="xl" class="h-72 w-full" />
        </div>
      </div>
    </ShimmerRegion>
  </div>

  <div v-else class="mx-auto max-w-[1320px] px-4 py-16 sm:px-6">
    <EmptyState
      :title="notFound ? 'We could not find this order' : 'We could not load this order'"
      :description="notFound ? 'Check the link, or find it in your orders.' : 'Please refresh to try again.'"
    >
      <template #actions>
        <NcButton to="/orders" variant="secondary">My orders</NcButton>
      </template>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ApiSupportContact } from "~/models/orders_model";

const route = useRoute();
const id = computed(() => route.params.id as string);

const { signedIn, sessionVersion, requestSession } = useAuth();
const { order, loading, error, errorStatus, fetchOrder } = useOrders();

// Signed-in data: the session cookie only reaches our API from the browser, so skip SSR.
await useAsyncData(() => `order-${id.value}`, () => fetchOrder(id.value), {
  lazy: true,
  server: false,
  watch: [id, sessionVersion],
});

// Shimmer until the order is here or the request has failed.
const showShimmer = computed(() => loading.value || !error.value);
const notFound = computed(() => errorStatus.value === 404);

const sellerCount = computed(() => order.value?.subOrders.length ?? 0);
const help = computed<ApiSupportContact>(() => order.value?.neocashEscalation ?? {});
</script>
