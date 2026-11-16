import { firebaseConfigured, hasFirebaseSession } from "~/lib/firebase";

/**
 * Website sign-in: when this tab holds a Firebase session, keep the session cookie's ID
 * token fresh from it. Nothing loads otherwise, so neither the app webview nor a signed-out
 * visitor downloads the Firebase SDK.
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public.firebase;
  if (isInApp() || !firebaseConfigured(config) || !hasFirebaseSession(config)) return;
  // Not awaited: the page shouldn't wait on Firebase to start.
  void useAuthStore().syncWebSession();
});
