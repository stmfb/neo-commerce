import type { Auth } from "firebase/auth";

/**
 * Firebase Auth for website sign-in. Browser only, and loaded on first use, so the SDK stays
 * out of the main bundle and out of the app webview (which gets its token from the app).
 */
export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}

export const firebaseConfigured = (config: FirebaseWebConfig) =>
  Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

let authPromise: Promise<Auth> | null = null;

export function loadFirebaseAuth(config: FirebaseWebConfig): Promise<Auth> {
  authPromise ??= (async () => {
    const [{ getApps, initializeApp }, { browserSessionPersistence, initializeAuth }] = await Promise.all([
      import("firebase/app"),
      import("firebase/auth"),
    ]);
    const app = getApps()[0] ?? initializeApp(config);
    // Tab-only persistence (sessionStorage): the brief rules out keeping tokens in localStorage.
    return initializeAuth(app, { persistence: browserSessionPersistence });
  })();
  return authPromise;
}

/** True when this tab holds a Firebase web session, without loading the SDK to find out. */
export function hasFirebaseSession(config: FirebaseWebConfig) {
  try {
    return sessionStorage.getItem(`firebase:authUser:${config.apiKey}:[DEFAULT]`) !== null;
  } catch {
    return false;
  }
}

/** Exchanges the custom token from sign-in for a Firebase ID token (our API's Bearer token). */
export async function signInWithFirebaseToken(config: FirebaseWebConfig, customToken: string) {
  const auth = await loadFirebaseAuth(config);
  const { signInWithCustomToken } = await import("firebase/auth");
  const { user } = await signInWithCustomToken(auth, customToken);
  return user.getIdToken();
}

let syncing = false;

/**
 * Calls `onToken` with every new ID token. Firebase refreshes the hour-long token a few
 * minutes before it expires while a listener is attached, so the session cookie stays valid
 * as long as the tab is open. `initial` marks the call made on subscribing.
 */
export async function onFirebaseToken(config: FirebaseWebConfig, onToken: (token: string, initial: boolean) => void) {
  if (syncing) return;
  syncing = true;
  const auth = await loadFirebaseAuth(config);
  const { onIdTokenChanged } = await import("firebase/auth");
  let initial = true;
  onIdTokenChanged(auth, async (user) => {
    const first = initial;
    initial = false;
    if (user) onToken(await user.getIdToken(), first);
  });
}

/** Ends the Firebase session in this tab, if there is one. */
export async function signOutOfFirebase(config: FirebaseWebConfig) {
  if (!authPromise && !hasFirebaseSession(config)) return;
  const auth = await loadFirebaseAuth(config);
  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}
