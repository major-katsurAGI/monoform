// plugins/highlight.client.ts
import { defineNuxtPlugin, useColorMode, watch } from '#imports'
import hljs from 'highlight.js'

/* resolved URLs, no <style> injection */
import latteUrl from '@catppuccin/highlightjs/css/catppuccin-latte.css?url'
import mochaUrl from '@catppuccin/highlightjs/css/catppuccin-mocha.css?url'

export default defineNuxtPlugin(nuxtApp => {
	const colorMode = useColorMode()
	const LINK_ID   = 'hljs-theme'                       // one link only

	const applyTheme = (dark: boolean) => {
		let link = document.getElementById(LINK_ID) as HTMLLinkElement | null
		if (!link) {
			link      = document.createElement('link')
			link.id   = LINK_ID
			link.rel  = 'stylesheet'
			document.head.appendChild(link)
		}
		link.href = dark ? mochaUrl : latteUrl            // swap source
	}

	/* initial + subsequent toggles */
	applyTheme(colorMode.value === 'dark')
	watch(() => colorMode.value, v => applyTheme(v === 'dark'))

	/* v-highlight directive */
	nuxtApp.vueApp.directive('highlight', {
		mounted (el: HTMLElement) { hljs.highlightElement(el) },
		updated (el: HTMLElement) { hljs.highlightElement(el) }
	})
})
