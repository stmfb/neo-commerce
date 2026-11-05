<template>
  <ShimmerRegion label="Loading store…">
    <div class="space-y-6">
      <Shimmer class="h-4 w-56" />
      <!-- Mirrors the merchant header card: banner, overlapping logo, name, stats. -->
      <div class="overflow-hidden rounded-2xl border border-line bg-white" aria-hidden="true">
        <Shimmer rounded="sm" class="h-24 w-full sm:h-28" />
        <div class="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <div class="-mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-4">
              <div class="relative h-20 w-20 shrink-0 rounded-2xl border-4 border-white bg-white">
                <Shimmer rounded="xl" class="h-full w-full" />
              </div>
              <Shimmer class="mb-1 h-7 w-48" />
            </div>
            <div class="mt-3 space-y-2 sm:ml-24">
              <Shimmer class="h-3.5 w-80 max-w-full" />
              <div class="flex gap-2 pt-1">
                <Shimmer v-for="n in 3" :key="n" rounded="full" class="h-6 w-16" />
              </div>
            </div>
          </div>
          <div class="grid shrink-0 grid-cols-3 gap-3 border-t border-line pt-4 sm:flex sm:gap-6 sm:border-0 sm:pt-0">
            <div v-for="n in 3" :key="n" class="space-y-2">
              <Shimmer class="h-7 w-14" />
              <Shimmer class="h-3 w-20" />
            </div>
          </div>
        </div>
      </div>
      <ShimmerProductGrid :count="8" />
    </div>
  </ShimmerRegion>
</template>
