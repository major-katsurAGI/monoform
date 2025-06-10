// composables/useImageProcessor.ts
import { shallowRef, onMounted } from 'vue'

export function useImageProcessor() {
    const bytes    = shallowRef<Uint8Array>()
    const pngBlob  = shallowRef<Blob>()
    let   worker: Worker | undefined   // declared here, created later

    onMounted(() => {
        // now we're safely on the client
        worker = new Worker(new URL('~/workers/processor.worker.ts', import.meta.url), { type: 'module' })
        worker.onmessage = e => {
            bytes.value   = e.data.bytes
            pngBlob.value = e.data.blob
        }
    })

    function process(
        bmp: ImageBitmap,
        w: number,
        h: number,
        threshold = 128,
    ) {
        // post only if the worker exists (i.e. after mount)
        worker?.postMessage({ imgBitmap: bmp, width: w, height: h, threshold }, [bmp])
    }

    return { bytes, pngBlob, process }
}
