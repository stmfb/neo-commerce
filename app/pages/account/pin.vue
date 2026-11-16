<template>
  <div class="mx-auto max-w-[420px] px-4 py-10 sm:px-6">
    <EmptyState v-if="!signedIn" title="Sign in to set your PIN" description="Your PIN is linked to your NeoCash account.">
      <template #actions>
        <NcButton @click="requestSession">Sign in</NcButton>
      </template>
    </EmptyState>

    <div v-else-if="done" class="rounded-xl border border-line bg-white p-6 text-center">
      <span class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <h1 class="mt-3 text-xl font-bold text-primary-dark-900">Your PIN is set</h1>
      <p class="mt-1 text-sm text-primary-dark-400">Use it to approve checkouts and confirm deliveries.</p>
      <NcButton block size="lg" class="mt-6" :to="redirectTo">Continue</NcButton>
    </div>

    <form v-else class="rounded-xl border border-line bg-white p-6 text-center" @submit.prevent="next">
      <span class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="4" y="9" width="12" height="8" rx="1.8" stroke="currentColor" stroke-width="1.5" />
          <path d="M7 9V6.5a3 3 0 016 0V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </span>
      <h1 class="mt-3 text-xl font-bold text-primary-dark-900">
        {{ step === "create" ? "Create your NeoCash PIN" : "Confirm your PIN" }}
      </h1>
      <p class="mt-1 text-sm text-primary-dark-400">
        {{ step === "create" ? "You'll use these 4 digits to approve checkouts and confirm deliveries." : "Enter the same 4 digits again." }}
      </p>

      <!-- Keyed, so the confirm step mounts a fresh input that takes focus. -->
      <PinInput :key="step" v-model="current" autofocus class="mt-6" />

      <p v-if="error" role="alert" class="mt-4 text-sm text-rose-600">{{ error }}</p>

      <div class="mt-6 flex gap-2">
        <NcButton v-if="step === 'confirm'" type="button" variant="secondary" size="lg" block :disabled="busy" @click="restart()">
          Back
        </NcButton>
        <NcButton type="submit" size="lg" block :disabled="current.length !== 4" :loading="busy">
          {{ step === "create" ? "Continue" : "Set PIN" }}
        </NcButton>
      </div>
      <NuxtLink v-if="redirectTo !== '/'" :to="redirectTo" class="mt-4 inline-block text-sm font-medium text-primary-dark-400 hover:text-primary-dark-700">
        Not now
      </NuxtLink>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

useHead({ title: "Set your PIN · NeoCash Marketplace" });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { signedIn, requestSession } = useAuth();

/** Where to go once the PIN is set, e.g. back to checkout. */
const redirectTo = computed(() => safeRedirect(route.query.redirect));

// Both entries live only here, in memory, and are cleared after every try.
const step = ref<"create" | "confirm">("create");
const first = ref("");
const second = ref("");
const busy = ref(false);
const error = ref("");
const done = ref(false);

const current = computed({
  get: () => (step.value === "create" ? first.value : second.value),
  set: (value: string) => (step.value === "create" ? (first.value = value) : (second.value = value)),
});

// Moves on as soon as the 4th digit is in, like the app's PIN screens.
watch(current, (value) => {
  if (value.length === 4 && !busy.value) next();
});

function restart(message = "") {
  first.value = "";
  second.value = "";
  step.value = "create";
  error.value = message;
}

async function next() {
  if (current.value.length !== 4 || busy.value) return;
  if (step.value === "create") {
    error.value = "";
    step.value = "confirm";
    return;
  }
  if (second.value !== first.value) return restart("Those PINs didn't match. Start again.");

  busy.value = true;
  const result = await authStore.setPin(first.value);
  busy.value = false;
  if (!result.ok) return restart(result.message ?? "We couldn't set your PIN. Please try again.");

  restart();
  // Straight back to what needed the PIN (checkout, an order); otherwise say it's done.
  if (redirectTo.value !== "/") router.replace(redirectTo.value);
  else done.value = true;
}
</script>
