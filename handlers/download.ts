import { saveFile } from './helpers'

const downloadBitmapHeader = (codeString: string, fileName: string = `image_bitmap.h`) => {
	const blob = new Blob([codeString], { type: 'text/x-c' })
	saveFile(blob, fileName)
}

const downloadPNG = async (
	mono: HTMLCanvasElement,
	sx: number,          // crop X in mono-px
	sy: number,          // crop Y
	w: number,          // crop width
	h: number,          // crop height
	fileName = 'monoform_output.png'
): Promise<void> => {

	/* 1 ▸ make a target canvas that only lives in memory */
	const target = new OffscreenCanvas(w, h)

	/* 2 ▸ blit area → target (GPU-side, very fast) */
	target.getContext('2d')!.drawImage(
		mono,            // src canvas
		sx, sy, w, h,    // src rect
		0, 0, w, h       // dst rect (full canvas)
	)

	/* 3 ▸ encode PNG */
	const blob: Blob = 'convertToBlob' in target
		? await (target as OffscreenCanvas).convertToBlob({ type: 'image/png' })
		: await new Promise<Blob>(res =>
				(target as HTMLCanvasElement).toBlob(b => res(b!), 'image/png')
		  )

	/* 4 ▸ trigger save */
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = fileName
	a.style.display = 'none'
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}

export { downloadBitmapHeader, downloadPNG }
