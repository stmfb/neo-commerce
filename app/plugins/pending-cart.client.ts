import { watch } from "vue";

/**
 * Finishes an "Add to cart" that had to wait for an account: as soon as the shopper is signed
 * in (website sign-in or sign-up, or a session from the app), the item goes into their cart.
 * Also on load, for a tab reloaded after signing in.
 */
export default defineNuxtPlugin(() => {
  const auth = useAuthStore();
  const cart = useCartStore();
  watch(
    () => auth.signedIn,
    (signedIn) => {
      if (signedIn) cart.addPendingItem();
    },
    { immediate: true },
  );
});
