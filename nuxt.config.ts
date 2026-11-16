export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  // Nothing here is secret. Any value can still be replaced when the server starts (no rebuild)
  // with an environment variable: NUXT_API_BASE, NUXT_PUBLIC_FIREBASE_API_KEY, _AUTH_DOMAIN,
  // _PROJECT_ID and _APP_ID.
  runtimeConfig: {
    // Server-only: upstream NeoCash API. The browser only ever talks to our own /api/** routes
    // (see server/api).
    apiBase: "https://8676-35-246-179-39.ngrok-free.app/v1",
    public: {
      // Firebase web config for phone sign-in on the website (the app webview gets its token
      // from the app instead). Public by design: Firebase web keys ship to every browser.
      firebase: {
        apiKey: "AIzaSyBa3KvM7J5DJXlEZcRik79YJCyPm66BaV8",
        authDomain: "pocketbanc.firebaseapp.com",
        projectId: "pocketbanc",
        appId: "1:351723537194:web:15a9dcc55ed9c3bd2bd453",
      },
    },
  },
  components: [{ path: "~/components", pathPrefix: false }],
  hooks: {
    // The face-capture code (React + AWS liveness, ~380 kB gzipped) is only needed by new
    // shoppers, at that step. Don't let the sign-in page prefetch it on everyone's mobile data;
    // the face step starts the download when it opens (see SignInFaceStep.vue).
    "build:manifest"(manifest) {
      const skip = new Set<string>();
      const visit = (key: string) => {
        const entry = manifest[key];
        if (!entry || entry.isEntry || skip.has(key)) return;
        skip.add(key);
        for (const next of [...(entry.imports ?? []), ...(entry.dynamicImports ?? [])]) visit(next);
      };
      for (const key of Object.keys(manifest)) if (key.endsWith("lib/face_liveness.ts")) visit(key);
      for (const key of skip) manifest[key]!.prefetch = false;
    },
  },
  app: {
    head: {
      title: "NeoCash Marketplace",
      meta: [
        {
          name: "description",
          content: "Pay small small on everything. Delivery across Lagos.",
        },
      ],
      link: [
        // Icons (public/): the SVG for modern browsers, .ico (16 and 32 px) for the rest, the
        // home-screen icon for iOS, and the manifest's 192/512 px icons for Android.
        { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&display=swap",
        },
        { rel: "preconnect", href: "https://api.fontshare.com" },
        {
          rel: "stylesheet",
          href: "https://api.fontshare.com/v2/css?f[]=clash-grotesk@400,500,600,700&display=swap",
        },
      ],
    },
  },
});
