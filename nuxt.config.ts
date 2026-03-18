// https://nuxt.com/docs/api/configuration/nuxt-config

console.log("api key", process.env.NUXT_GOOGLE_GENERATIVE_AI_API_KEY);
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/mdc"],
  runtimeConfig: {
    googleGenerativeAiApiKey: "",
  },
});
