export const useCheckoutStore = defineStore("checkout", () => {
  const selectedMonths = ref(6);
  const selectedAddressId = ref("home");
  const sellerAgreementAccepted = ref(false);
  const creditAgreementAccepted = ref(false);
  const paymentMethod = ref<"card" | "transfer">("card");

  const bothAccepted = computed(() => sellerAgreementAccepted.value && creditAgreementAccepted.value);

  function resetCheckout() {
    selectedMonths.value = 6;
    selectedAddressId.value = "home";
    sellerAgreementAccepted.value = false;
    creditAgreementAccepted.value = false;
    paymentMethod.value = "card";
  }

  return {
    selectedMonths,
    selectedAddressId,
    sellerAgreementAccepted,
    creditAgreementAccepted,
    paymentMethod,
    bothAccepted,
    resetCheckout,
  };
});
