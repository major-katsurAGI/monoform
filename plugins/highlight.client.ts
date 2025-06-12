import { defineNuxtPlugin } from '#app'
import hljs from 'highlight.js'

import '@catppuccin/highlightjs/css/catppuccin-frappe.css'

export default defineNuxtPlugin(nuxtApp => {
	nuxtApp.vueApp.directive('highlight', {
		mounted(el: HTMLElement)   { hljs.highlightElement(el) },
		updated (el: HTMLElement)  { hljs.highlightElement(el) }
	})
})
