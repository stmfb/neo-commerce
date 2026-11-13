<template>
  <button
    v-if="isDev"
    type="button"
    class="fixed bottom-5 right-5 z-40 max-w-[calc(100vw-2.5rem)] truncate rounded-full border border-line bg-white px-4 py-2.5 text-xs font-semibold text-primary-dark-700 shadow-popover transition-colors hover:border-primary-300"
    @click="toggle"
  >
    <span class="sm:hidden">{{ signedIn ? "Signed in · sign out" : "Guest · sign in" }}</span>
    <span class="hidden sm:inline">
      {{ signedIn ? "Dev: signed in — sign out" : "Dev: guest — paste a Firebase ID token to sign in" }}
    </span>
  </button>
</template>

<script setup lang="ts">
// Dev builds only. In the app, the webview gets its session through the bridge
// (app/plugins/neocash-bridge.client.ts).
const isDev = import.meta.dev;
const { signedIn, setSession, clearSession } = useAuth();

async function toggle() {
  if (signedIn.value) return clearSession();
  const token = window.prompt("Firebase ID token for a test customer")?.trim();
  if (token) await setSession({ token });
}
</script>
