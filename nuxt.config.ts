// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/mdc'],
  runtimeConfig: {
    googleGenerativeAiApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
  }
})
