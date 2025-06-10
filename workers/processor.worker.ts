import { packToBytes } from '~/utils/packToBytes'

self.onmessage = async (e: MessageEvent) => {
    const { imgBitmap, width, height, threshold } = e.data
    const off = new OffscreenCanvas(width, height)
    const ctx = off.getContext('2d')!
    ctx.drawImage(imgBitmap, 0, 0, width, height)

    const { data } = ctx.getImageData(0, 0, width, height)
    const bits = new Uint8ClampedArray(width * height)
    for (let i = 0; i < data.length; i += 4) {
        const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
        bits[i >> 2] = lum < threshold ? 1 : 0
    }
    const bytes = packToBytes(bits, width, height)
    const blob = await off.convertToBlob({ type: 'image/png' })
    self.postMessage({ bytes, blob }, [blob])
}
