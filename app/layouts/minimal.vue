<template>
  <!-- Just the logo: for flows like sign-in that shouldn't compete with the shop's header. -->
  <div class="flex min-h-screen flex-col bg-slate-50">
    <ShimmerRouteBar />
    <header class="border-b border-line bg-white">
      <div class="mx-auto flex max-w-[1320px] items-center justify-center px-4 py-4 sm:px-6">
        <NuxtLink to="/">
          <BrandLogo />
        </NuxtLink>
      </div>
    </header>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
