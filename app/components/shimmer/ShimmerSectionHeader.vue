<template>
  <!-- Mirrors SectionHeader: title on the left, optional action link on the right. -->
  <div class="mb-4 flex items-end justify-between gap-4" aria-hidden="true">
    <Shimmer class="h-6 w-48" />
    <Shimmer v-if="action" class="h-4 w-20" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ action?: boolean }>(), { action: false });
</script>
