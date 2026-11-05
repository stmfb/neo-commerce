<template>
  <!-- Mirrors FilterRail: budget slider, then a couple of checkbox groups. -->
  <aside class="space-y-6 rounded-2xl border border-line bg-white p-5" aria-hidden="true">
    <div class="space-y-3">
      <Shimmer class="h-4 w-1/2" />
      <Shimmer rounded="full" class="h-2 w-full" />
      <div class="flex justify-between">
        <Shimmer class="h-3 w-12" />
        <Shimmer class="h-3 w-16" />
      </div>
    </div>
    <div v-for="group in 2" :key="group" class="space-y-3 border-t border-line pt-5">
      <Shimmer class="h-4 w-1/3" />
      <div v-for="row in 3" :key="row" class="flex items-center gap-3">
        <Shimmer rounded="sm" class="h-4 w-4" />
        <Shimmer class="h-3.5 flex-1" />
        <Shimmer class="h-3 w-6" />
      </div>
    </div>
  </aside>
</template>
