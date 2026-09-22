export const useAuthStore = defineStore(
  "auth",
  () => {
    const signedIn = ref(true);
    const approvedLimit = ref(48000);
    const customerName = ref("Chidi Okafor");

    function toggleSignedIn() {
      signedIn.value = !signedIn.value;
    }

    return { signedIn, approvedLimit, customerName, toggleSignedIn };
  },
  { persist: true },
);
