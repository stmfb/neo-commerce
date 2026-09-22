export function useAuth() {
  const store = useAuthStore();
  const { signedIn, approvedLimit, customerName } = storeToRefs(store);
  return { signedIn, approvedLimit, customerName, toggleSignedIn: store.toggleSignedIn };
}
