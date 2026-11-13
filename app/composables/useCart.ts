export function useCart() {
  const store = useCartStore();
  const { cart, groups, itemCount, sellerCount, totalKobo, isEmpty, violations, changes, canCheckout, loading, mutating, error } =
    storeToRefs(store);
  return {
    cart,
    groups,
    itemCount,
    sellerCount,
    totalKobo,
    isEmpty,
    violations,
    changes,
    canCheckout,
    loading,
    mutating,
    error,
    fetchCart: store.fetchCart,
    revalidate: store.revalidate,
    addItem: store.addItem,
    updateQty: store.updateQty,
    removeItem: store.removeItem,
    acceptChanges: store.acceptChanges,
  };
}
