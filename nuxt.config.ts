// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    devtools: { enabled: true },
    css: ['@/assets/css/main.css', '@/assets/css/webtui.colors.css'],
    modules: ['@nuxt/image', '@nuxtjs/color-mode', '@nuxtjs/tailwindcss'],
    vite: {
        worker: { format: 'es' } // needed for TS worker imports
    },
    colorMode: {
        preference: 'dark',
    },
    app: {
        head: {
            title: 'Monoform | A nifty little tool for converting images into OLED-ready bitmaps',
            htmlAttrs: { lang: 'en' },
            meta: [
                { charset: 'UTF-8' }, // Updated from 'utf-8' for consistency with your HTML
                { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }, // Updated to match your HTML
                { name: 'description', content: 'A nifty little tool for converting images into crisp, black-and-white OLED-ready byte arrays for microcontrollers.' },
                { name: 'theme-color', content: '#1E1E2E' },

                // Open Graph Meta Tags
                { property: 'og:title', content: 'Monoform | A nifty little tool for converting images into OLED-ready bitmaps' },
                { property: 'og:description', content: 'A nifty little tool for converting images into crisp, black-and-white OLED-ready byte arrays for microcontrollers.' },
                { property: 'og:image', content: '/meta-image.png' },
                { property: 'og:url', content: 'https://monoform.dev' },

                // Twitter Meta Tags
                { name: 'twitter:title', content: 'Monoform | A nifty little tool for converting images into OLED-ready bitmaps' },
                { name: 'twitter:domain', content: 'monoform.dev' },
                { name: 'twitter:url', content: 'https://monoform.dev' },
                { name: 'twitter:description', content: 'A nifty little tool for converting images into crisp, black-and-white OLED-ready byte arrays for microcontrollers.' },
                { name: 'twitter:image', content: '/meta-image.png' },
                { name: 'twitter:card', content: 'summary_large_image' },

                // Pinterest Meta Tags
                { name: 'pinterest:description', content: 'A nifty little tool for converting images into crisp, black-and-white OLED-ready byte arrays for microcontrollers.' },
                { name: 'pinterest:image', content: '/meta-image.png' },
            ],
            link: [
                { rel: 'icon', href: '/favicon.png' },
            ]
        },
    },
})
