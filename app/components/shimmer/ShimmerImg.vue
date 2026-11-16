<template>
  <div class="relative" :class="showShimmer ? 'shimmer' : ''">
    <img
      v-if="src && !failed"
      ref="img"
      :src="src"
      :alt="alt"
      :loading="loading"
      class="transition-opacity duration-300"
      :class="[imgClass, loaded ? 'opacity-100' : 'opacity-0']"
      @load="loaded = true"
      @error="onError"
    />
    <slot v-else name="fallback" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

/**
 * <img> that shows a shimmer until the image has loaded, then fades it in.
 * Renders the `fallback` slot when there is no src or the image fails to load.
 * Size the wrapper with `class`; style the image itself with `img-class`.
 */
const props = withDefaults(
  defineProps<{ src?: string; alt?: string; imgClass?: string; loading?: "lazy" | "eager" }>(),
  { src: undefined, alt: "", imgClass: "", loading: "lazy" },
);
const emit = defineEmits<{ error: [] }>();

const img = ref<HTMLImageElement | null>(null);
const loaded = ref(false);
const failed = ref(false);
const showShimmer = computed(() => Boolean(props.src) && !loaded.value && !failed.value);

function onError() {
  failed.value = true;
  emit("error");
}

// SSR-rendered images can finish loading before hydration attaches @load.
onMounted(() => {
  if (img.value?.complete) {
    if (img.value.naturalWidth > 0) loaded.value = true;
    else onError();
  }
});

watch(
  () => props.src,
  () => {
    loaded.value = false;
    failed.value = false;
  },
);
</script>
