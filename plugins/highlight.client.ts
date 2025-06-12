import { defineNuxtPlugin, useColorMode, watch } from '#imports'
import hljs from 'highlight.js'

const latteHref = new URL('@catppuccin/highlightjs/css/catppuccin-latte.css', import.meta.url).href
const mochaHref = new URL('@catppuccin/highlightjs/css/catppuccin-mocha.css', import.meta.url).href

export default defineNuxtPlugin(nuxtApp => {
    const colorMode = useColorMode()

    const link = document.createElement('link')
    link.id  = 'hljs-theme'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    const apply = () => link.href = colorMode.value === 'dark' ? mochaHref : latteHref

    apply()
    watch(() => colorMode.value, apply)

    nuxtApp.vueApp.directive('highlight', {
        mounted (el: HTMLElement) { hljs.highlightElement(el) },
        updated (el: HTMLElement) { hljs.highlightElement(el) }
    })
})
