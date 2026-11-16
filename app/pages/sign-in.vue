<template>
  <div class="mx-auto max-w-[460px] px-4 py-8 sm:py-12">
    <StatusBanner v-if="!configured" tone="warning" title="Sign-in isn't available on this site yet">
      It needs this environment's Firebase web settings (NUXT_PUBLIC_FIREBASE_*).
    </StatusBanner>

    <StatusBanner v-if="configured && waitingItem && step !== 'done'" tone="info" class="mb-4" :title="`We'll add “${waitingItem}” to your cart`">
      As soon as you're signed in, or your new account is ready.
    </StatusBanner>

    <div v-if="configured" class="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
      <SignInPhoneStep v-if="step === 'phone'" />
      <SignInCodeStep v-else-if="step === 'otp'" />
      <SignInFaceStep v-else-if="step === 'liveness'" />
      <SignInIdentityStep v-else-if="step === 'identity'" />
      <div v-else class="flex flex-col items-center gap-3 py-10 text-center" role="status">
        <span class="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-500" aria-hidden="true" />
        <p class="text-sm text-primary-dark-500">Signing you in…</p>
      </div>
    </div>

    <p class="mt-6 text-center text-sm text-primary-dark-400">
      <NuxtLink :to="redirectTo" class="font-medium hover:text-primary-dark-700" @click="clearPendingCartAdd()">
        Keep browsing without signing in
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { firebaseConfigured } from "~/lib/firebase";

definePageMeta({ layout: "minimal" });
useHead({ title: "Sign in or create an account · NeoCash Marketplace" });

const route = useRoute();
const router = useRouter();
const { signedIn, requestSession } = useAuth();
const store = useSignInStore();
const { step } = storeToRefs(store);

const configured = firebaseConfigured(useRuntimeConfig().public.firebase);
/** Where the shopper was when sign-in was needed. */
const redirectTo = computed(() => {
  const path = safeRedirect(route.query.redirect);
  return path.startsWith("/sign-in") ? "/" : path;
});

/** The item they tapped "Add to cart" on before signing in, if any. Read in the browser only. */
const waitingItem = ref("");

onMounted(() => {
  waitingItem.value = readPendingCartAdd()?.title ?? "";
  // The app's webview signs in through the app; anyone already signed in has nothing to do here.
  if (isInApp()) {
    if (!signedIn.value) requestSession();
    router.replace(redirectTo.value);
  } else if (signedIn.value && step.value === "phone") {
    router.replace(redirectTo.value);
  }
});

watch(step, (next) => {
  if (next !== "done") return;
  // Checkout and delivery confirmation need a PIN, so a new shopper sets one first.
  router.replace(store.hasPin ? redirectTo.value : { path: "/account/pin", query: { redirect: redirectTo.value } });
});

// The sign-in token and face-capture credentials don't outlive this page.
onBeforeUnmount(() => store.reset());
</script>
