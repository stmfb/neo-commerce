export interface DeliveryAddress {
  id: string;
  label: string;
  detail: string;
}

export const deliveryAddresses: DeliveryAddress[] = [
  {
    id: "home",
    label: "Chidi Okafor — Home",
    detail: "14 Adeola Odeku Street, Victoria Island, Lagos · 0803 000 0000",
  },
  {
    id: "office",
    label: "Chidi Okafor — Office",
    detail: "3 Ligali Ayorinde, Victoria Island, Lagos · 0803 000 0000",
  },
];

export function useCheckout() {
  const store = useCheckoutStore();
  const {
    selectedMonths,
    selectedAddressId,
    sellerAgreementAccepted,
    creditAgreementAccepted,
    paymentMethod,
    bothAccepted,
  } = storeToRefs(store);

  return {
    selectedMonths,
    selectedAddressId,
    sellerAgreementAccepted,
    creditAgreementAccepted,
    paymentMethod,
    bothAccepted,
    resetCheckout: store.resetCheckout,
  };
}
