import { defineStore } from "pinia";
import type { ApiLivenessSession, ApiSignInStart, ApiSignInStep, IdentityInput } from "~/models/auth_model";
import { firebaseConfigured, signInWithFirebaseToken } from "~/lib/firebase";

export type SignInStep = "phone" | "otp" | "liveness" | "identity" | "finishing" | "done";

/** Wait before offering to resend the code: a phone only gets 5 starts an hour. */
export const RESEND_AFTER_MS = 30_000;

/**
 * Website sign-in, one step at a time: phone → code → face capture → identity → done.
 * Each step's answer names the next. Held in memory only (no persistence): the sign-in
 * token and face-capture credentials never reach storage. The page resets it on leaving.
 */
export const useSignInStore = defineStore("signIn", {
  state: () => ({
    step: "phone" as SignInStep,
    phone: "",
    signInToken: "",
    codeSentAt: 0,
    /** Tries left on the current step, after a failed one. */
    attemptsRemaining: null as number | null,
    liveness: null as ApiLivenessSession | null,
    /** From the identity step, to greet the shopper. Unknown when they already had a login. */
    firstName: "",
    /** From `done`: false means set a PIN next. */
    hasPin: true,
    busy: false,
    error: "",
    /** The API's code for `error`, e.g. `bvn_in_use`, so a step can offer the right way out. */
    errorCode: "",
    fields: {} as Record<string, string>,
  }),

  actions: {
    reset(message = "") {
      this.$reset();
      this.error = message;
    },

    /** Calls one step. Coded failures move the flow as the brief says; null means it failed. */
    async post<T>(step: string, body: Record<string, string>): Promise<T | null> {
      this.busy = true;
      this.error = "";
      this.errorCode = "";
      this.fields = {};
      try {
        // Typed by the caller: Nitro can't resolve a generic return type for a dynamic path.
        return (await $fetch(`/api/auth/${step}`, { method: "POST", body })) as T;
      } catch (error) {
        const { code, message, fields } = apiError(error);
        switch (code) {
          case "signin_expired":
            this.reset("Your sign-in timed out. Please start again.");
            break;
          case "wrong_step":
            this.reset("Something went out of order. Please start again.");
            break;
          case "too_many_attempts":
            // At the phone step it's the hourly limit; anywhere else, no tries are left.
            if (this.step === "phone") this.error = message;
            else this.reset(message);
            break;
          default:
            this.error = message;
            this.errorCode = code ?? "";
            this.fields = fields;
        }
        return null;
      } finally {
        this.busy = false;
      }
    },

    /** Texts a code to `phone`. Also how to resend one. */
    async start(phone: string) {
      const result = await this.post<ApiSignInStart>("start", { phone });
      if (!result) return false;
      this.phone = phone;
      this.signInToken = result.signInToken;
      this.codeSentAt = Date.now();
      this.attemptsRemaining = null;
      this.step = "otp";
      return true;
    },

    async verifyCode(code: string) {
      const result = await this.post<ApiSignInStep>("otp", { signInToken: this.signInToken, code });
      if (result) await this.advance(result);
    },

    /** A new face-capture session. Each capture needs its own; one can't be reused. */
    async startLiveness() {
      this.liveness = null;
      const result = await this.post<ApiLivenessSession>("liveness/start", { signInToken: this.signInToken });
      this.liveness = result;
      return Boolean(result);
    },

    /** The capture finished; ask for its result. */
    async finishLiveness() {
      const livenessSessionId = this.liveness?.livenessSessionId ?? "";
      this.liveness = null;
      const result = await this.post<ApiSignInStep>("liveness/result", { signInToken: this.signInToken, livenessSessionId });
      if (result) await this.advance(result);
    },

    async submitIdentity(input: IdentityInput) {
      this.firstName = input.firstName;
      const result = await this.post<ApiSignInStep>("identity", { signInToken: this.signInToken, ...input });
      if (result) await this.advance(result);
    },

    async advance(result: ApiSignInStep) {
      if (result.next === "done") return this.finish(result);
      const retry = result.next === this.step;
      this.attemptsRemaining = result.attemptsRemaining ?? null;
      this.step = result.next;
      if (retry && this.attemptsRemaining !== null) {
        const left = `${this.attemptsRemaining} ${this.attemptsRemaining === 1 ? "try" : "tries"} left.`;
        this.error =
          result.next === "otp" ? `That code isn't right. ${left}` : `We couldn't confirm the face check. ${left}`;
      }
    },

    /** Swaps the custom token for a Firebase session straight away (it expires in an hour), then signs in. */
    async finish(result: ApiSignInStep) {
      this.step = "finishing";
      this.busy = true;
      const auth = useAuthStore();
      try {
        const config = useRuntimeConfig().public.firebase;
        if (!result.customToken || !firebaseConfigured(config)) throw new Error("Sign-in isn't set up on this site yet.");
        const token = await signInWithFirebaseToken(config, result.customToken);
        if (!(await auth.setSession({ token, firstName: this.firstName || undefined }))) throw new Error(auth.error ?? "");
        // From here Firebase keeps the session's token fresh while the tab is open.
        void auth.syncWebSession();
        this.hasPin = result.hasPin !== false;
        this.signInToken = "";
        this.step = "done";
      } catch (error) {
        this.reset((error as Error).message || "We couldn't finish signing you in. Please try again.");
      } finally {
        this.busy = false;
      }
    },
  },
});
