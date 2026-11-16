<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-2xl font-bold font-display text-primary-dark">Quick face check</h1>
      <p class="mt-1 text-sm text-primary-dark-400">
        It shows us a real person is signing in, and it's the face we match to your BVN photo. It takes about 10 seconds.
      </p>
    </div>

    <div v-if="checking" class="flex flex-col items-center gap-3 py-10 text-center" role="status">
      <span class="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-500" aria-hidden="true" />
      <p class="text-sm text-primary-dark-500">Checking your face capture…</p>
    </div>

    <FaceLivenessCheck
      v-else-if="store.liveness"
      :key="store.liveness.livenessSessionId"
      :session="store.liveness"
      @complete="complete"
      @error="failed"
      @cancel="cancel"
    />

    <template v-else>
      <ul class="space-y-2 rounded-xl bg-slate-50 p-4 text-sm text-primary-dark-600">
        <li v-for="tip in tips" :key="tip" class="flex gap-2">
          <svg class="mt-0.5 h-4 w-4 shrink-0 text-primary-500" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ tip }}
        </li>
      </ul>

      <p v-if="message" role="alert" class="text-sm text-rose-600">{{ message }}</p>

      <NcButton block size="lg" :loading="store.busy" @click="begin">
        {{ message ? "Try again" : "Start face check" }}
      </NcButton>
      <p class="text-center text-xs text-primary-dark-400">Your browser will ask to use your camera.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const store = useSignInStore();
/** Waiting on our API for the capture's result. */
const checking = ref(false);
/** Why the last capture stopped, before it reached our API. */
const captureError = ref("");
const message = computed(() => captureError.value || store.error);

const tips = [
  "Find good, even light, with no bright window behind you.",
  "Take off glasses, a hat or a face mask.",
  "Hold your phone upright, at eye level.",
];

/** Amplify's error types, in words the shopper can act on. */
const CAPTURE_ERRORS: Record<string, string> = {
  CAMERA_ACCESS_ERROR: "We need your camera for this. Allow camera access for this site in your browser settings, then try again.",
  CAMERA_FRAMERATE_ERROR: "Your camera isn't fast enough for the check. Try another device.",
  MOBILE_LANDSCAPE_ERROR: "Turn your phone upright, then try again.",
  MULTIPLE_FACES_ERROR: "Make sure only your face is in view.",
  FACE_DISTANCE_ERROR: "Hold your phone a little further away, then try again.",
  TIMEOUT: "We couldn't see your face clearly in time. Find better light and try again.",
  FRESHNESS_TIMEOUT: "We couldn't see your face clearly in time. Find better light and try again.",
};

// Start downloading the face-capture code while the shopper reads the tips; it isn't prefetched
// with the page (see nuxt.config.ts), and only new shoppers get this far.
onMounted(() => {
  import("~/lib/face_liveness").catch(() => {});
});

async function begin() {
  captureError.value = "";
  await store.startLiveness();
}

async function complete() {
  checking.value = true;
  await store.finishLiveness();
  checking.value = false;
}

function failed(state: string) {
  store.liveness = null;
  captureError.value = CAPTURE_ERRORS[state] ?? "The face check stopped before it finished. Please try again.";
}

function cancel() {
  store.liveness = null;
  captureError.value = "";
}
</script>
