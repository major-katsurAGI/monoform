export function packToBytes(bits: Uint8ClampedArray, w: number, h: number) {
    const cols = w, pages = h / 8
    const out = new Uint8Array(cols * pages)
    for (let x = 0; x < cols; x++)
    for (let p = 0; p < pages; p++) {
        let b = 0
        for (let y = 0; y < 8; y++) {
            const idx = (p * 8 + y) * cols + x
            b |= (bits[idx] ? 1 : 0) << y
        }
        out[p * cols + x] = b
    }
    return out
}
