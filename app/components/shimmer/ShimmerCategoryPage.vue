<template>
  <ShimmerRegion label="Loading category…">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <ShimmerFilterRail class="hidden self-start lg:block" />
      <div class="min-w-0 space-y-4">
        <div class="space-y-2" aria-hidden="true">
          <Shimmer class="h-7 w-48" />
          <Shimmer class="h-4 w-72 max-w-full" />
        </div>
        <ShimmerProductGrid :count="8" />
      </div>
    </div>
  </ShimmerRegion>
</template>
