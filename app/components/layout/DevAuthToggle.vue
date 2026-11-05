<template>
  <button
    type="button"
    class="fixed bottom-5 right-5 z-40 max-w-[calc(100vw-2.5rem)] truncate rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-primary-dark-700 shadow-popover transition-colors hover:border-primary-300"
    @click="toggleSignedIn"
  >
    <span class="sm:hidden">{{ signedIn ? "Signed in · switch" : "Guest · switch" }}</span>
    <span class="hidden sm:inline">
      {{ signedIn ? "Viewing as: signed in — switch to guest" : "Viewing as: guest — switch to signed in" }}
    </span>
  </button>
</template>

<script setup lang="ts">
const { signedIn, toggleSignedIn } = useAuth();
</script>
