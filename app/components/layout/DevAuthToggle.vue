<template>
  <button
    type="button"
    class="fixed bottom-5 right-5 z-40 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-primary-dark-700 shadow-popover transition-colors hover:border-primary-300"
    @click="toggleSignedIn"
  >
    {{ signedIn ? "Viewing as: signed in — switch to guest" : "Viewing as: guest — switch to signed in" }}
  </button>
</template>

<script setup lang="ts">
const { signedIn, toggleSignedIn } = useAuth();
</script>
