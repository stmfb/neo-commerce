export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    // Server-only: upstream NeoCash API. Overridden by NUXT_API_BASE in .env.
    // The browser only ever talks to our own /api/** routes (see server/api).
    apiBase: "",
  },
  components: [{ path: "~/components", pathPrefix: false }],
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
