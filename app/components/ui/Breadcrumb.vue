<template>
  <nav class="flex flex-wrap items-center gap-1.5 text-sm text-primary-dark-400">
    <template v-for="(crumb, index) in items" :key="index">
      <NuxtLink
        v-if="crumb.to && index !== items.length - 1"
        :to="crumb.to"
        class="hover:text-primary-600"
      >
        {{ crumb.label }}
      </NuxtLink>
      <span v-else :class="index === items.length - 1 ? 'font-semibold text-primary-dark-900' : ''">
        {{ crumb.label }}
      </span>
      <span v-if="index !== items.length - 1" class="text-primary-dark-300">&rsaquo;</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
defineProps<{ items: { label: string; to?: string }[] }>();
</script>
