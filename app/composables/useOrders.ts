export function useOrders() {
  const store = useOrdersStore();
  const { orders, order, loading, loadingMore, error, errorStatus, hasMore } = storeToRefs(store);
  return {
    orders,
    order,
    loading,
    loadingMore,
    error,
    errorStatus,
    hasMore,
    fetchOrders: store.fetchOrders,
    loadMore: store.loadMore,
    fetchOrder: store.fetchOrder,
    confirmDelivery: store.confirmDelivery,
  };
}
