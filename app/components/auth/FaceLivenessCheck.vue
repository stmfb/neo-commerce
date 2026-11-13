<template>
  <div>
    <p v-if="loading" class="flex h-64 items-center justify-center text-sm text-primary-dark-400">Opening your camera…</p>
    <div ref="host" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import type { ApiLivenessSession } from "~/models/auth_model";

/**
 * AWS Amplify's face-liveness detector for one capture session. It's a React component,
 * loaded (with React) only when this mounts; see app/lib/face_liveness.ts.
 * Key this by the session id: each capture needs a new session.
 */
const props = defineProps<{ session: ApiLivenessSession }>();
const emit = defineEmits<{ complete: []; error: [state: string, message: string]; cancel: [] }>();

const host = ref<HTMLElement | null>(null);
const loading = ref(true);
let unmount: (() => void) | undefined;
let disposed = false;

onMounted(async () => {
  try {
    const { mountFaceLiveness } = await import("~/lib/face_liveness");
    if (disposed || !host.value) return;
    unmount = mountFaceLiveness(host.value, props.session, {
      onComplete: () => emit("complete"),
      onError: (state, message) => emit("error", state, message),
      onCancel: () => emit("cancel"),
    });
  } catch (error) {
    emit("error", "LOAD_ERROR", (error as Error).message);
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  disposed = true;
  unmount?.();
});
</script>
