<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({ layout: "checkout" });

const router = useRouter();
const { isEmpty } = useCart();

router.replace(isEmpty.value ? "/cart" : "/checkout/plan");
</script>
