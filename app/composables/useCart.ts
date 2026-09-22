export function useCart() {
  const store = useCartStore();
  const { items, groups, itemCount, sellerCount, subtotal, isEmpty } = storeToRefs(store);
  return {
    items,
    groups,
    itemCount,
    sellerCount,
    subtotal,
    isEmpty,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQty: store.updateQty,
    clear: store.clear,
  };
}
