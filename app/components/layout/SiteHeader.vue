<template>
  <header class="z-30 sm:sticky sm:top-0">
    <PromoBar />
    <div class="border-b border-line bg-white">
      <div class="mx-auto max-w-[1320px] px-4 py-4 sm:px-6 sm:py-5">
        <div class="flex min-w-0 items-center gap-2 sm:gap-4">
          <NuxtLink to="/" class="min-w-0 shrink">
            <BrandLogo />
          </NuxtLink>

          <SearchForm class="hidden sm:flex" />

          <AffordabilityChip class="hidden sm:flex" :signed-in="signedIn" :approved-limit="approvedLimit" />

          <div class="ml-auto flex shrink-0 items-center gap-0.5 sm:ml-0 sm:gap-2">
            <AccountMenu />
            <CartIndicator />
          </div>
        </div>

        <div class="mt-3 flex flex-col gap-3 sm:hidden">
          <SearchForm />
          <AffordabilityChip :signed-in="signedIn" :approved-limit="approvedLimit" />
        </div>
      </div>
    </div>
    <CategoryNav :active-slug="activeCategorySlug" />
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { signedIn, approvedLimit } = useAuth();
const route = useRoute();

const activeCategorySlug = computed(() => {
  if (route.name === "category-slug" || route.path.startsWith("/category/")) {
    return route.params.slug as string;
  }
  return undefined;
});
</script>
