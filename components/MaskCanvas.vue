<template>
    <div class="flex flex-col items-center gap-4 w-full">
        <!-- source preview canvas + draggable mask -->
        <div class="relative">
            <canvas
                ref="previewCanvas"
                :width="canvasWidth"
                :height="canvasHeight"
                class="border border-foreground2" />

            <div
                ref="maskDiv"
                class="absolute border-2 border-cyan-400 cursor-move"
                :style="{ width: mask.w + 'px', height: mask.h + 'px', top: mask.y + 'px', left: mask.x + 'px' }"
                @mousedown="startDrag"
                @mousemove="onDrag"
                @mouseup="stopDrag"
                @mouseleave="stopDrag" />
        </div>

        <!-- full‑image monochrome preview + synced overlay -->
        <div class="relative">
            <canvas
                ref="monoCanvas"
                :width="canvasWidth"
                :height="canvasHeight"
                class="border border-foreground2" />

            <div
                class="absolute border-2 border-cyan-400 pointer-events-none"
                :style="{ width: mask.w + 'px', height: mask.h + 'px', top: mask.y + 'px', left: mask.x + 'px' }" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { PropType } from 'vue'

/* ------------------ props -------------------------------------------- */
const props = defineProps({
    imageUrl:      { type: String, default: null },
    threshold:     { type: Array as PropType<number[]>, required: true },
    contrast:      { type: Array as PropType<number[]>, required: true },
    displayWidth:  { type: Number, required: true },
    displayHeight: { type: Number, required: true }
})

/* ------------------ canvas geometry ---------------------------------- */
const canvasWidth  = 400
const canvasHeight = 400

/* ------------------ refs & state ------------------------------------- */
const previewCanvas = ref<HTMLCanvasElement | null>(null)
const monoCanvas    = ref<HTMLCanvasElement | null>(null)
const img           = ref<HTMLImageElement | null>(null)

const mask = reactive({
    x: 0,
    y: 0,
    get w() { return props.displayWidth  },
    get h() { return props.displayHeight }
})

const dragging   = ref(false)
const dragOffset = reactive({ x: 0, y: 0 })

/* ------------------ watchers ----------------------------------------- */
watch(() => props.imageUrl, loadImage, { immediate: true })
watch([() => props.contrast[0], () => mask.x, () => mask.y], drawPreview)
watch([() => props.threshold[0], () => mask.x, () => mask.y], drawMono)
watch([() => props.displayWidth, () => props.displayHeight], onResolutionChange)

/* ------------------ funcs -------------------------------------------- */
function onResolutionChange () {
    mask.x = Math.min(mask.x, canvasWidth  - mask.w)
    mask.y = Math.min(mask.y, canvasHeight - mask.h)
    drawPreview()
    drawMono()
}

function loadImage () {
    if (!props.imageUrl) { clearCanvases(); return }
    const _img = new Image()
    _img.onload = () => {
        img.value = _img
        mask.x = mask.y = 0
        drawPreview()
        drawMono()
    }
    _img.src = props.imageUrl
}

function clearCanvases () {
    previewCanvas.value?.getContext('2d')?.clearRect(0,0,canvasWidth,canvasHeight)
    monoCanvas.value?.getContext('2d')?.clearRect(0,0,canvasWidth,canvasHeight)
}

function drawPreview () {
    if (!previewCanvas.value || !img.value) return
    const ctx = previewCanvas.value.getContext('2d')!
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    ctx.filter = `contrast(${props.contrast[0]}%)`
    ctx.drawImage(img.value, 0, 0, canvasWidth, canvasHeight)
    ctx.filter = 'none'
}

function drawMono () {
    if (!monoCanvas.value || !previewCanvas.value) return
    const srcCtx = previewCanvas.value.getContext('2d')!
    const dstCtx = monoCanvas.value.getContext('2d')!

    /* make sure preview is current */
    drawPreview()

    const imgData = srcCtx.getImageData(0, 0, canvasWidth, canvasHeight)
    const data = imgData.data
    const thr  = props.threshold[0] * 2.55

    for (let i = 0; i < data.length; i += 4) {
        const g  = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2]
        const bw = g < thr ? 0 : 255
        data[i] = data[i+1] = data[i+2] = bw
    }

    dstCtx.putImageData(imgData, 0, 0)
}

function startDrag (e: MouseEvent) {
    const rect = previewCanvas.value!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (x >= mask.x && x <= mask.x + mask.w && y >= mask.y && y <= mask.y + mask.h) {
        dragging.value = true
        dragOffset.x   = x - mask.x
        dragOffset.y   = y - mask.y
    }
}

function onDrag (e: MouseEvent) {
    if (!dragging.value) return
    const rect = previewCanvas.value!.getBoundingClientRect()
    mask.x = clamp(e.clientX - rect.left - dragOffset.x, 0, canvasWidth  - mask.w)
    mask.y = clamp(e.clientY - rect.top  - dragOffset.y, 0, canvasHeight - mask.h)
    drawPreview()
    drawMono()
}

function stopDrag () { dragging.value = false }

function clamp (v: number, min: number, max: number) {
    return Math.min(Math.max(v, min), max)
}
</script>
