<template>
  <!-- Placeholder for the home page product rails: SectionHeader + 6-column grid. -->
  <div class="space-y-8">
    <section v-for="n in rails" :key="n">
      <ShimmerSectionHeader />
      <ShimmerProductGrid :count="6" :columns="6" />
    </section>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ rails?: number }>(), { rails: 2 });
</script>
