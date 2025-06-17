import { defineNuxtPlugin, useColorMode, watch } from '#imports'
import hljs from 'highlight.js'

export default defineNuxtPlugin(nuxtApp => {
	nuxtApp.vueApp.directive('highlight', {
		mounted: el => import.meta.client && hljs.highlightElement(el as HTMLElement),
		updated: el => import.meta.client && hljs.highlightElement(el as HTMLElement)
	})

	if (import.meta.client) {
		const colorMode = useColorMode()

		const link = document.createElement('link')
		link.id = 'hljs-theme'
		link.rel = 'stylesheet'
		document.head.appendChild(link)

		const latte = new URL('@catppuccin/highlightjs/css/catppuccin-latte.css', import.meta.url).href
		const mocha = new URL('@catppuccin/highlightjs/css/catppuccin-mocha.css', import.meta.url).href

		const apply = () => { link.href = colorMode.value === 'dark' ? mocha : latte }
		apply()
		watch(() => colorMode.value, apply)
	}
})
