<template>
  <NuxtLink
    :to="`/product/${product.slug}`"
    class="group flex flex-col overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-card"
    :class="isOut ? 'opacity-70' : ''"
  >
    <div class="relative aspect-square p-3">
      <ShimmerImg
        :src="product.image"
        :alt="product.name"
        class="h-full w-full rounded-xl"
        img-class="h-full w-full rounded-xl object-contain"
      >
        <template #fallback>
          <ImagePlaceholder class="h-full w-full" />
        </template>
      </ShimmerImg>
      <span
        v-if="isOut"
        class="absolute left-4 top-4 rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-primary-dark-600"
      >
        Out of stock
      </span>
      <span
        v-else-if="product.bnplEligible && product.fromMonthly"
        class="absolute left-4 top-4 rounded-full bg-primary-dark px-2.5 py-1 text-[11px] font-semibold text-white"
      >
        from {{ formatNaira(product.fromMonthly) }}/mo
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-1 px-4 pb-4">
      <p class="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-primary-dark-900">
        {{ product.name }}
      </p>
      <p class="text-sm font-bold" :class="isOut ? 'text-primary-dark-300 line-through' : 'text-primary-dark-900'">
        {{ formatNaira(product.price) }}
      </p>
      <p class="flex items-center gap-1 text-xs font-semibold text-primary-600">
        Sold by {{ merchantName }}
        <VerifiedBadge v-if="merchantVerified" size="sm" />
      </p>
      <p v-if="product.stock === 'low'" class="text-xs font-medium text-rose-600">
        {{ product.stockCount ? `Only ${product.stockCount} left` : "Low stock" }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Product } from "~/data/products";
import { getMerchant } from "~/data/merchants";

const props = defineProps<{ product: Product }>();

const merchant = computed(() => getMerchant(props.product.merchantSlug));
const merchantName = computed(() => props.product.merchantName ?? merchant.value?.name);
const merchantVerified = computed(() => props.product.merchantVerified ?? merchant.value?.verified);
const isOut = computed(() => props.product.stock === "out");
</script>
