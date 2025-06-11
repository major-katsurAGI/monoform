import type { Config } from 'tailwindcss'
import webTUIColorPlugin from './tailwind/webtui.colors'

export default <Partial<Config>>{
    content: [
        './components/**/*.{vue,js,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './app.vue',
    ],
    theme: {
        extend: {},
    },
    plugins: [webTUIColorPlugin],
}
