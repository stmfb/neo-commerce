/** The screen to show next in web sign-in. */
export type SignInNext = "otp" | "liveness" | "identity" | "done";

/** What every sign-in step after `start` returns. */
export interface ApiSignInStep {
  next: SignInNext;
  /** Only after a failed try: tries left on this step. */
  attemptsRemaining?: number;
  /** Only with `done`: exchange it with Firebase straight away (it lasts an hour). */
  customToken?: string;
  /** With `done`: `false` means show the set-PIN screen next. */
  hasPin?: boolean;
}

/** POST /auth/start: texts an OTP. The token lasts 30 minutes; keep it in memory only. */
export interface ApiSignInStart {
  signInToken: string;
}

/** POST /auth/liveness/start: a one-use face-capture session for Amplify's liveness detector. */
export interface ApiLivenessSession {
  livenessSessionId: string;
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    expiration: string;
  };
}

/** POST /auth/identity body (plus the sign-in token). Names must match the BVN. */
export interface IdentityInput {
  firstName: string;
  lastName: string;
  email: string;
  bvn: string;
}
