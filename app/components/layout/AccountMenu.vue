<template>
  <div class="relative shrink-0">
    <button
      type="button"
      class="flex items-center gap-1.5 whitespace-nowrap rounded-lg p-2 text-sm font-medium text-primary-dark-900 hover:bg-slate-50"
      :aria-label="signedIn ? undefined : 'Sign in or create an account'"
      @click="open = !open"
    >
      <svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="6.5" r="3" stroke="currentColor" stroke-width="1.5" />
        <path d="M3.5 17c1-3.3 3.8-5 6.5-5s5.5 1.7 6.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <span v-if="signedIn" class="sr-only min-[400px]:not-sr-only">{{ firstName || "Account" }}</span>
      <!-- New customers need to see they can join here too; the long form only where the header has room. -->
      <span v-else class="sr-only min-[400px]:not-sr-only">Sign in<span class="hidden lg:inline"> or create account</span></span>
      <svg class="hidden h-3.5 w-3.5 shrink-0 text-primary-dark-400 min-[400px]:block" viewBox="0 0 20 20" fill="none">
        <path d="M5 8l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-popover"
      :class="signedIn ? 'w-48' : 'w-64'"
      @click="open = false"
    >
      <template v-if="signedIn">
        <NuxtLink to="/orders" class="block px-4 py-2 text-sm text-primary-dark-700 hover:bg-slate-50">My orders</NuxtLink>
        <NuxtLink to="/inbox" class="block px-4 py-2 text-sm text-primary-dark-700 hover:bg-slate-50">Inbox</NuxtLink>
        <NuxtLink to="/cart" class="block px-4 py-2 text-sm text-primary-dark-700 hover:bg-slate-50">My cart</NuxtLink>
        <button
          v-if="canSignOut"
          type="button"
          class="mt-1 block w-full border-t border-line px-4 py-2 pt-2.5 text-left text-sm text-primary-dark-700 hover:bg-slate-50"
          @click="signOut"
        >
          Sign out
        </button>
      </template>
      <button v-else type="button" class="block w-full px-4 py-2 text-left hover:bg-slate-50" @click="requestSession">
        <span class="block text-sm font-medium text-primary-dark-900">Sign in or create account</span>
        <span class="mt-0.5 block text-xs text-primary-dark-400">New to NeoCash? Start with your phone number.</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

// In the app's webview the app owns sign-in and sign-out, so "Sign in" asks it for a session.
// On the website, "Sign in" opens the sign-in page and "Sign out" is offered here.
const { signedIn, firstName, requestSession } = useAuth();
const authStore = useAuthStore();
const open = ref(false);
const canSignOut = ref(false);
onMounted(() => (canSignOut.value = !isInApp()));

async function signOut() {
  // Leave signed-in pages first, so they don't react to the sign-out by asking to sign in again.
  await navigateTo("/");
  await authStore.signOut();
}
</script>
