import plugin from 'tailwindcss/plugin'

const webTUIColors = [
    'rosewater', 'flamingo', 'pink', 'mauve', 'red', 'maroon', 'peach',
    'yellow', 'green', 'teal', 'sky', 'sapphire', 'blue', 'lavender',
    'text', 'subtext1', 'subtext0', 'overlay2', 'overlay1', 'overlay0',
    'surface2', 'surface1', 'surface0', 'base', 'mantle', 'crust',
    'background0', 'background1', 'background2', 'background3',
    'foreground0', 'foreground1', 'foreground2'
]

export default plugin(({ addUtilities }) => {
    const utils: Record<string, Record<string, string>> = {}

    for (const name of webTUIColors) {
        utils[`.bg-${name}`]    = { backgroundColor: `var(--${name})` }
        utils[`.text-${name}`]  = { color:           `var(--${name})` }
        utils[`.border-${name}`]= { borderColor:     `var(--${name})` }
    }

    // Prints once when Tailwind boots (watch your **terminal**, not the browser console)
    console.log('[webTUI] color utilities loaded')

    addUtilities(utils)           // utilities layer by default
})
