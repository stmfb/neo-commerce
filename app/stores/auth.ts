export const useAuthStore = defineStore(
  "auth",
  () => {
    const signedIn = ref(true);
    const customerName = ref("Chidi Okafor");

    function toggleSignedIn() {
      signedIn.value = !signedIn.value;
    }

    return { signedIn, customerName, toggleSignedIn };
  },
  { persist: true },
);
