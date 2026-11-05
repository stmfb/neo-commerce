<template>
  <ShimmerRegion label="Loading product…">
    <div class="space-y-4" aria-hidden="true">
      <Shimmer class="h-4 w-64 max-w-full" />
      <!-- Same three columns as the product page: gallery, details, buy box. -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[380px_minmax(0,1fr)_300px]">
        <div>
          <Shimmer rounded="xl" class="aspect-square w-full" />
          <div class="mt-3 grid grid-cols-5 gap-2">
            <Shimmer v-for="n in 5" :key="n" rounded="lg" class="aspect-square w-full" />
          </div>
        </div>

        <div class="space-y-5">
          <div class="space-y-3">
            <Shimmer class="h-7 w-4/5" />
            <div class="flex items-center gap-2">
              <Shimmer class="h-7 w-32" />
              <Shimmer rounded="full" class="h-6 w-28" />
            </div>
            <Shimmer class="h-4 w-40" />
          </div>
          <div class="space-y-3 border-y border-line py-4">
            <Shimmer class="h-4 w-1/2" />
            <Shimmer class="h-4 w-2/5" />
          </div>
          <div class="space-y-2">
            <Shimmer class="h-4 w-16" />
            <div class="flex gap-2">
              <Shimmer v-for="n in 3" :key="n" rounded="lg" class="h-10 w-14" />
            </div>
          </div>
          <div class="space-y-2 rounded-xl border border-line bg-white p-4">
            <Shimmer class="h-4 w-32" />
            <Shimmer class="h-3.5 w-full" />
            <Shimmer class="h-3.5 w-11/12" />
            <Shimmer class="h-3.5 w-3/4" />
          </div>
        </div>

        <div class="space-y-4 self-start rounded-2xl border border-line bg-white p-5">
          <Shimmer class="h-4 w-3/4" />
          <Shimmer rounded="lg" class="h-10 w-full" />
          <Shimmer rounded="xl" class="h-11 w-full" />
          <div class="space-y-2 border-t border-line pt-4">
            <Shimmer class="h-3.5 w-2/3" />
            <Shimmer class="h-3.5 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  </ShimmerRegion>
</template>
