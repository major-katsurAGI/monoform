export const generateCCode = (
	imageData: ImageData,
	displayWidth: number,
	displayHeight: number,
	varName = 'image_bitmap',
	drawMode: 'horizontal' | 'vertical' = 'horizontal'
): string => {
	const bytes: number[] = []

	if (drawMode === 'horizontal') {
		/* ---------- ROW-MAJOR ---------- */
		for (let y = 0; y < displayHeight; y++) {
			for (let xByte = 0; xByte < Math.ceil(displayWidth / 8); xByte++) {
				let byte = 0
				for (let bit = 0; bit < 8; bit++) {
					const x = xByte * 8 + bit
					if (x >= displayWidth) continue
					const idx = (y * displayWidth + x) * 4
					const on  = imageData.data[idx] !== 0          // white → 1
					if (on) byte |= 0x80 >> bit                  // MS-bit = leftmost
				}
				bytes.push(byte)
			}
		}
	} else {
		/* ---------- PAGE-MAJOR (vertical) ---------- */
		const pages = Math.ceil(displayHeight / 8)
		for (let page = 0; page < pages; page++) {
			for (let x = 0; x < displayWidth; x++) {
				let byte = 0
				for (let bit = 0; bit < 8; bit++) {
					const y = page * 8 + bit
					if (y >= displayHeight) continue
					const idx = (y * displayWidth + x) * 4
					const on  = imageData.data[idx] !== 0
					if (on) byte |= 1 << bit                    // bit0 = top
				}
				bytes.push(byte)
			}
		}
	}

	/* pretty-print: 16 bytes / line */
	const body = bytes
		.map(b => `0x${b.toString(16).padStart(2, '0').toUpperCase()}`)
		.reduce<string[]>((acc, v, i) => {
			if (i % 16 === 0) acc.push(v)
			else acc[acc.length - 1] += `, ${v}`
			return acc
		}, [])
		.join(',\n\t')

	const guard = `_${varName.toUpperCase()}_H_`

	return `\
#ifndef ${guard}
#define ${guard}

#include <stdint.h>

/* bitmap size : ${displayWidth}×${displayHeight} px, ${bytes.length} bytes (${drawMode}) */
#define ${varName.toUpperCase()}_WIDTH   ${displayWidth}
#define ${varName.toUpperCase()}_HEIGHT  ${displayHeight}
#define ${varName.toUpperCase()}_LEN     ${bytes.length}

static const uint8_t ${varName}[${bytes.length}] = {
\t${body}
};

#endif /* ${guard} */
`.trimEnd()
}
