<template>
  <NuxtLink
    v-if="signedIn"
    to="/inbox"
    class="relative flex shrink-0 items-center rounded-lg p-2 text-primary-dark-900 hover:bg-slate-50"
    :aria-label="unreadCount ? `Inbox, ${unreadCount} unread` : 'Inbox'"
  >
    <svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 8.5a5 5 0 0110 0v3.2l1.3 2.3H3.7L5 11.7V8.5z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path d="M8.2 16.5a1.9 1.9 0 003.6 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <span
      v-if="unreadCount"
      aria-hidden="true"
      class="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white"
    >
      {{ unreadCount > 9 ? "9+" : unreadCount }}
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from "vue";

const route = useRoute();
const { signedIn, sessionVersion } = useAuth();
const inboxStore = useInboxStore();
const { unreadCount } = storeToRefs(inboxStore);

// Browser only: during SSR, $fetch to our own routes doesn't carry the session cookie.
// Again after each sign-in or sign-out.
await useAsyncData("inbox-unread", () => inboxStore.refreshUnread(true).then(() => true), {
  lazy: true,
  server: false,
  watch: [sessionVersion],
});

// Order reviews take hours, so re-check (at most once a minute) when the shopper moves
// around the site or comes back to the tab.
watch(() => route.path, () => inboxStore.refreshUnread());

function onVisibilityChange() {
  if (document.visibilityState === "visible") inboxStore.refreshUnread();
}
onMounted(() => document.addEventListener("visibilitychange", onVisibilityChange));
onBeforeUnmount(() => document.removeEventListener("visibilitychange", onVisibilityChange));
</script>
