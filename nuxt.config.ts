// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    devtools: { enabled: true },
    css: ['@/assets/css/main.css', '@/assets/css/webtui.colors.css'],
    modules: ['@nuxt/image', '@nuxtjs/color-mode', '@nuxtjs/tailwindcss'],
    vite: {
        worker: { format: 'es' } // needed for TS worker imports
    }
})
