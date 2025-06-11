export const generateCCode = (imgData: ImageData, bufW: number, bufH: number, displayW: number, displayH: number): string => {
	const rows  = Math.ceil(bufH / 8)          // pages
	const bytes: number[] = []

    for (let page = 0; page < rows; page++) {
        for (let x = 0; x < bufW; x++) {
            let byte = 0
            for (let bit = 0; bit < 8; bit++) {
                const y = page * 8 + bit
                if (y >= bufH) continue
                const idx = (y * bufW + x) * 4
                /* 1 = white pixel, bit0 = TOP */
                if (imgData.data[idx] !== 0) byte |= 1 << bit
            }
            bytes.push(byte)
        }
    }

	/* pretty print: 16 bytes / line */
	const lines = bytes
		.map(v => `0x${v.toString(16).padStart(2, '0').toUpperCase()}`)
		.reduce<string[]>((acc, val, i) => {
			if (i % 16 === 0) acc.push(val)
			else acc[acc.length - 1] += `, ${val}`
			return acc
		}, [])
		.join(',\n\t')

	const arrName = `img${bufW}x${bufH}`

	return `
/* ${bufW}×${bufH} mono bitmap, page-major */
static const uint8_t ${arrName}[] = {
\t${lines}
};

ssd1306_init(&dev, ${displayW}, ${displayH});
ssd1306_clear_screen(&dev, false);
ssd1306_display_image(&dev, 0, 0, ${arrName}, sizeof(${arrName}));
`.trim()
}
