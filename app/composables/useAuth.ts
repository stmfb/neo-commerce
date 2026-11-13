export function useAuth() {
  const store = useAuthStore();
  const { signedIn, firstName, sessionVersion } = storeToRefs(store);
  return {
    signedIn,
    firstName,
    sessionVersion,
    setSession: store.setSession,
    clearSession: store.clearSession,
    requestSession: store.requestSession,
  };
}
