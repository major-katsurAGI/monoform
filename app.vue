<template>
	<NuxtPage />
</template>

<script setup lang="ts">
const colorMode = useColorMode()

/* reactive head – switches the data attribute whenever the mode changes */
useHead(() => ({
	htmlAttrs: {
		'data-webtui-theme': colorMode.value === 'dark' ? 'catppuccin-mocha' : 'catppuccin-latte'
	}
}))
</script>
