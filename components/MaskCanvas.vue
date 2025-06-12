<template>
	<div class="flex justify-center gap-4 w-full pt-10">
        <!-- EFFECTS PREVIEW -->
        <div box-="square" shear-="top" class="box-muted">
            <div>
                <span is-="badge" variant-="background0"><p class="font-bold">Effects Preview</p></span>
            </div>

            <div class="relative w-[400px] h-[400px] select-none">
                <canvas ref="previewCanvas" :style="canvasStylePreview" />
                <div
                    data-canvas="preview"
                    class="absolute border-2 border-cyan-400 cursor-move z-10"
                    :style="maskStylePreview"
                    @mousedown="startDrag"
                />
            </div>
		</div>

        <!-- DISPLAY PREVIEW -->
        <div box-="square" shear-="top" class="box-muted">
            <div>
                <span is-="badge" variant-="background0"><p class="font-bold">Display Preview</p></span>
            </div>

            <div class="relative w-[400px] h-[400px] select-none">
                <canvas ref="monoCanvas" :style="canvasStyleMono" />
                <div
                    data-canvas="mono"
                    class="absolute border-2 border-cyan-400 cursor-move z-10"
                    :style="maskStyleMono"
                    @mousedown="startDrag"
                />
            </div>
        </div>
	</div>

    <div class="flex px-4 mt-auto">
        <!-- {{ drawMode }} -->
        <button @click="emitCode" class="w-full cursor-pointer">Generate</button>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'

import { generateCCode } from '@/handlers/generate'
import { clamp, debounce } from '@/handlers/helpers'
import { createDragHandlers } from '@/handlers/drag'

/* ───────── props ───────── */
interface Props {
	imageUrl?:      string | null
	threshold:      number
	contrast:       number
	displayWidth:   number
	displayHeight:  number
	scaleWidth:     number
	drawMode:       'horizontal' | 'vertical'
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e:'outputCode', code:string):void }>()

/* ───────── refs ───────── */
const previewCanvas	= ref<HTMLCanvasElement | null>(null)
const monoCanvas	= ref<HTMLCanvasElement | null>(null)
const image			= ref<HTMLImageElement | null>(null)

/* ───────── constants ───────── */
const BOX = 400 // css square

/* ───────── fit objects ───────── */
type Fit = { s:number; w:number; h:number; offX:number; offY:number }
const previewFit: Fit = reactive({ s:1, w:0, h:0, offX:0, offY:0 })
const monoFit	 : Fit = reactive({ s:1, w:1, h:1, offX:0, offY:0 })

/* ───────── scale + mask ───────── */
const scaleFactor = computed(() =>
	image.value ? props.scaleWidth / image.value.width : 1
)

const mask = reactive({
	x: 0,
	y: 0,
	get w() { return props.displayWidth  / scaleFactor.value },
	get h() { return props.displayHeight / scaleFactor.value }
})

/* ───────── helpers (define BEFORE first use) ───────── */
const clearAll = () => {
	previewCanvas.value?.getContext('2d')?.clearRect(0, 0, BOX, BOX)
	monoCanvas.value?.getContext('2d')?.clearRect(0, 0, BOX, BOX)
}
const clampMask = () => {
	if (!image.value) return
	mask.x = clamp(mask.x, 0, image.value.width  - mask.w)
	mask.y = clamp(mask.y, 0, image.value.height - mask.h)
}

const drawPreview = () => {
	if (!previewCanvas.value || !image.value) return
	const ctx = previewCanvas.value.getContext('2d')!
	ctx.filter = `contrast(${props.contrast}%)`
	ctx.clearRect(0, 0, image.value.width, image.value.height)
	ctx.drawImage(image.value, 0, 0)
	ctx.filter = 'none'
}

const drawMono = () => {
	if (!monoCanvas.value || !image.value || !props.scaleWidth) return
	const ctx = monoCanvas.value.getContext('2d')!
	ctx.filter = `contrast(${props.contrast}%)`
	ctx.drawImage(image.value, 0, 0, monoFit.w, monoFit.h)
	ctx.filter = 'none'

	const data = ctx.getImageData(0, 0, monoFit.w, monoFit.h)
	const d	 = data.data
	const thr = props.threshold * 2.55

	for (let i = 0; i < d.length; i += 4) {
		const g	 = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
		const bw = g < thr ? 0 : 255
		d[i] = d[i + 1] = d[i + 2] = bw
	}
	ctx.putImageData(data, 0, 0)
}

const updateFits = () => {
	if (!image.value) return

	/* preview */
	previewFit.s	= Math.min(BOX / image.value.width, BOX / image.value.height)
	previewFit.w	= image.value.width  * previewFit.s
	previewFit.h	= image.value.height * previewFit.s
	previewFit.offX	= (BOX - previewFit.w) / 2
	previewFit.offY	= (BOX - previewFit.h) / 2
	if (previewCanvas.value) {
		previewCanvas.value.width	= image.value.width
		previewCanvas.value.height	= image.value.height
	}

	/* mono */
	monoFit.w		= props.scaleWidth || 1
	monoFit.h		= Math.round(image.value.height * (monoFit.w / image.value.width))
	monoFit.s		= Math.min(BOX / monoFit.w, BOX / monoFit.h)
	monoFit.offX	= (BOX - monoFit.w * monoFit.s) / 2
	monoFit.offY	= (BOX - monoFit.h * monoFit.s) / 2
	if (monoCanvas.value) {
		monoCanvas.value.width	= monoFit.w
		monoCanvas.value.height	= monoFit.h
	}
}

const loadImage = () => {
	if (!props.imageUrl) { clearAll(); return }
	const img = new Image()
	img.onload = () => {
		image.value = img
		updateFits()
		clampMask()
		drawPreview()
		drawMono()
	}
	img.src = props.imageUrl
}

/* ───────── initial watch registrations ───────── */
watch(() => props.imageUrl, loadImage, { immediate:true })
watch(() => props.contrast,	() => drawPreview())
watch([() => props.contrast, () => props.threshold], () => drawMono())

const debouncedMono = debounce(drawMono, 80)
watch(() => props.scaleWidth, () => {
	updateFits()
	clampMask()
	drawPreview()
	debouncedMono()
})

/* ───────── drag composable ───────── */
const { startDrag } = createDragHandlers({
	previewCanvas,
	monoCanvas,
	mask,
	previewFit,
	monoFit,
	image,
	scaleFactor
})

/* ───────── styles ───────── */
const canvasStylePreview = computed(() => ({
	position: 'absolute',
	width	: `${previewFit.w}px`,
	height	: `${previewFit.h}px`,
	left	: `${previewFit.offX}px`,
	top		: `${previewFit.offY}px`
}))
const canvasStyleMono = computed(() => ({
	position: 'absolute',
	width	: `${monoFit.w * monoFit.s}px`,
	height	: `${monoFit.h * monoFit.s}px`,
	left	: `${monoFit.offX}px`,
	top		: `${monoFit.offY}px`
}))

const overlayPreview = computed(() => ({
	w: mask.w * previewFit.s,
	h: mask.h * previewFit.s
}))
const overlayMono = computed(() => ({
	w: props.displayWidth  * monoFit.s,
	h: props.displayHeight * monoFit.s
}))

const maskStylePreview = computed(() => ({
	width : `${overlayPreview.value.w}px`,
	height: `${overlayPreview.value.h}px`,
	left  : `${previewFit.offX + mask.x * previewFit.s}px`,
	top   : `${previewFit.offY  + mask.y * previewFit.s}px`
}))
const maskStyleMono = computed(() => ({
	width : `${overlayMono.value.w}px`,
	height: `${overlayMono.value.h}px`,
	left  : `${monoFit.offX + mask.x * scaleFactor.value * monoFit.s}px`,
	top   : `${monoFit.offY  + mask.y * scaleFactor.value * monoFit.s}px`
}))

const emitCode = () => {
	if (!monoCanvas.value) return

	const ctx = monoCanvas.value.getContext('2d', { willReadFrequently:true })!
	const sx  = Math.round(mask.x * scaleFactor.value)
	const sy  = Math.round(mask.y * scaleFactor.value)

	const imgData = ctx.getImageData(sx, sy, props.displayWidth, props.displayHeight)

    const code = generateCCode(imgData, props.displayWidth, props.displayHeight, 'image_bitmap', props.drawMode)
    emit('outputCode', code)

	/* debug helper: auto-download cropped area as PNG */
	//const dbg = document.createElement('canvas')
	//dbg.width  = props.displayWidth
	//dbg.height = props.displayHeight
	//dbg.getContext('2d')!.putImageData(imgData, 0, 0)

	//dbg.toBlob(blob => {
	//	if (!blob) return
	//	const url = URL.createObjectURL(blob)
	//	const a   = document.createElement('a')
	//	a.href      = url
	//	a.download  = 'oled_crop.png'
	//	a.click()
	//	URL.revokeObjectURL(url)
	//}, 'image/png')
}
</script>
