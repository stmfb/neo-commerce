export function useOrders() {
  const store = useOrdersStore();
  const { orders } = storeToRefs(store);
  return { orders, getOrder: store.getOrder, createOrderFromCart: store.createOrderFromCart };
}
