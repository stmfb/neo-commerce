export function useAuth() {
  const store = useAuthStore();
  const { signedIn, customerName } = storeToRefs(store);
  return { signedIn, customerName, toggleSignedIn: store.toggleSignedIn };
}
