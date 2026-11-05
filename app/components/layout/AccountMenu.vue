<template>
  <div class="relative shrink-0">
    <button
      type="button"
      class="flex items-center gap-1.5 whitespace-nowrap rounded-lg p-2 text-sm font-medium text-primary-dark-900 hover:bg-slate-50"
      @click="open = !open"
    >
      <svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="6.5" r="3" stroke="currentColor" stroke-width="1.5" />
        <path d="M3.5 17c1-3.3 3.8-5 6.5-5s5.5 1.7 6.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <span class="sr-only min-[400px]:not-sr-only">{{ signedIn ? firstName : "Sign in" }}</span>
      <svg class="hidden h-3.5 w-3.5 shrink-0 text-primary-dark-400 min-[400px]:block" viewBox="0 0 20 20" fill="none">
        <path d="M5 8l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-popover"
      @click="open = false"
    >
      <template v-if="signedIn">
        <NuxtLink to="/orders" class="block px-4 py-2 text-sm text-primary-dark-700 hover:bg-slate-50">My orders</NuxtLink>
        <NuxtLink to="/cart" class="block px-4 py-2 text-sm text-primary-dark-700 hover:bg-slate-50">My cart</NuxtLink>
        <button type="button" class="block w-full px-4 py-2 text-left text-sm text-primary-dark-700 hover:bg-slate-50" @click="toggleSignedIn">
          Sign out
        </button>
      </template>
      <button v-else type="button" class="block w-full px-4 py-2 text-left text-sm text-primary-dark-700 hover:bg-slate-50" @click="toggleSignedIn">
        Sign in
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const { signedIn, customerName, toggleSignedIn } = useAuth();
const open = ref(false);
const firstName = computed(() => customerName.value.split(" ")[0]);
</script>
