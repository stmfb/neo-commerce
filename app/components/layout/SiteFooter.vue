<template>
  <footer class="border-t border-line bg-white">
    <div class="mx-auto flex max-w-[1320px] flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <BrandLogo size="sm" />
      <p class="text-primary-dark-400">Buy from any seller. Pay one plan. Delivery across Lagos.</p>
      <p class="text-primary-dark-300">&copy; {{ year }} NeoCash. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
</script>
