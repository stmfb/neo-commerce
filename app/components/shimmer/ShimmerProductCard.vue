<template>
  <!-- Mirrors ProductCard: square image, 2-line title, price, seller. -->
  <div class="flex flex-col overflow-hidden rounded-xl border border-line bg-white" aria-hidden="true">
    <div class="aspect-square p-3">
      <Shimmer rounded="xl" class="h-full w-full" />
    </div>
    <div class="flex flex-col gap-2 px-4 pb-4">
      <Shimmer class="h-3.5 w-11/12" />
      <Shimmer class="h-3.5 w-2/3" />
      <Shimmer class="mt-1 h-4 w-1/3" />
      <Shimmer class="h-3 w-1/2" />
    </div>
  </div>
</template>
