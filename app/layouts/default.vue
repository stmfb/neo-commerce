<template>
  <div class="flex min-h-screen flex-col bg-slate-50">
    <SiteHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <DevAuthToggle />
  </div>
</template>
