<template>
	<div class="flex justify-center w-full">
		<!-- EFFECTS PREVIEW -->
		<div box-="square" shear-="top" class="box-muted flex flex-col grow">
			<div>
				<span is-="badge" variant-="background0"><p class="font-bold">Effects Preview</p></span>
			</div>

			<div class="relative w-full min-h-[150px] md:h-[400px] select-none my-2">
				<canvas ref="previewCanvas" :style="canvasStylePreview" class="border border-dashed border-background2" />
				<div
					data-canvas="preview"
					class="absolute border-2 border-cyan-400 cursor-move z-10"
					:style="maskStylePreview"
					@mousedown="startDrag"
				/>
			</div>
		</div>

		<!-- DISPLAY PREVIEW -->
		<div box-="square" shear-="top" class="box-muted flex flex-col grow">
			<div>
				<span is-="badge" variant-="background0"><p class="font-bold">Display Preview</p></span>
			</div>

			<div class="relative w-full min-h-[150px] md:h-[400px] select-none my-2">
				<canvas ref="monoCanvas" :style="canvasStyleMono" class="border border-dashed border-background2"/>
				<div
					data-canvas="mono"
					class="absolute border-2 border-cyan-400 cursor-move z-10"
					:style="maskStyleMono"
					@mousedown="startDrag"
				/>
			</div>
		</div>
	</div>

	<div class="flex px-1.5 mt-auto">
		<button @click="emitCode" class="w-full cursor-pointer">Generate</button>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, onBeforeUnmount } from 'vue'

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
const emit  = defineEmits<{ (e:'outputCode', code:string):void }>()

/* ───────── refs ───────── */
const previewCanvas = ref<HTMLCanvasElement | null>(null)
const monoCanvas    = ref<HTMLCanvasElement | null>(null)
const image         = ref<HTMLImageElement | null>(null)

/* ───────── fit objects ───────── */
type Fit = { s:number; w:number; h:number; offX:number; offY:number }
const previewFit: Fit = reactive({ s:1, w:0, h:0, offX:0, offY:0 })
const monoFit   : Fit = reactive({ s:1, w:1, h:1, offX:0, offY:0 })

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

/* ───────── helpers ───────── */
const clearCanvas = (c: HTMLCanvasElement | null) => {
	if (!c) return
	const ctx = c.getContext('2d'); if (!ctx) return
	ctx.clearRect(0, 0, c.width, c.height)
}
const clearAll = () => { clearCanvas(previewCanvas.value); clearCanvas(monoCanvas.value) }
const clampMask = () => {
	if (!image.value) return
	mask.x = clamp(mask.x, 0, image.value.width  - mask.w)
	mask.y = clamp(mask.y, 0, image.value.height - mask.h)
}

/* ───────── drawing ───────── */
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
	const d    = data.data
	const thr  = props.threshold * 2.55

	for (let i = 0; i < d.length; i += 4) {
		const g  = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
		const bw = g < thr ? 0 : 255
		d[i] = d[i + 1] = d[i + 2] = bw
	}
	ctx.putImageData(data, 0, 0)
}

/* ───────── fit calc ───────── */
const fitInBox = (boxW:number, boxH:number, rawW:number, rawH:number) => {
	const s     = Math.min(boxW / rawW, boxH / rawH)
	const offX  = (boxW - rawW * s) / 2
	const offY  = (boxH - rawH * s) / 2
	return { s, offX, offY }
}

const updateFits = () => {
	if (!image.value) return
	const img = image.value
	const pBox = previewCanvas.value?.parentElement
	const mBox = monoCanvas.value?.parentElement
	if (!pBox || !mBox) return

	/* preview 🆕 keep w/h = RAW image dims */
	previewFit.w     = img.width
	previewFit.h     = img.height
	Object.assign(previewFit, { ...previewFit, ...fitInBox(pBox.clientWidth, pBox.clientHeight, img.width, img.height) })
	if (previewCanvas.value) {
		previewCanvas.value.width  = img.width
		previewCanvas.value.height = img.height
	}

	/* mono 🆕 keep w/h = props.scaleWidth-reduced dims */
	monoFit.w = props.scaleWidth || 1
	monoFit.h = Math.round(img.height * (monoFit.w / img.width))
	Object.assign(monoFit, { ...monoFit, ...fitInBox(mBox.clientWidth, mBox.clientHeight, monoFit.w, monoFit.h) })
	if (monoCanvas.value) {
		monoCanvas.value.width  = monoFit.w
		monoCanvas.value.height = monoFit.h
	}
}

/* ───────── load & watch ───────── */
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

watch(() => props.imageUrl, loadImage, { immediate:true })
watch(() => props.contrast, () => drawPreview())
watch([() => props.contrast, () => props.threshold], () => drawMono())

const debouncedMono = debounce(drawMono, 80)
watch(() => props.scaleWidth, () => {
	updateFits()
	clampMask()
	drawPreview()
	debouncedMono()
})

/* ───────── react to container resize ───────── */
let ro: ResizeObserver | null = null
onMounted(() => {
	if (previewCanvas.value) {
		ro = new ResizeObserver(() => {
			updateFits()
			clampMask()
			drawPreview()
			drawMono()
		})
		ro.observe(previewCanvas.value.parentElement!)
		ro.observe(monoCanvas.value!.parentElement!)
	}
})
onBeforeUnmount(() => ro?.disconnect())

/* ───────── drag ───────── */
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
	width      : `${previewFit.w * previewFit.s}px`,   // 🆕 scaled, not raw
	height     : `${previewFit.h * previewFit.s}px`,
	marginLeft : `${previewFit.offX}px`,
	marginTop  : `${previewFit.offY}px`,
	display    : 'block'
}))
const canvasStyleMono = computed(() => ({
	width      : `${monoFit.w * monoFit.s}px`,         // 🆕 scaled, not raw
	height     : `${monoFit.h * monoFit.s}px`,
	marginLeft : `${monoFit.offX}px`,
	marginTop  : `${monoFit.offY}px`,
	display    : 'block'
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

/* ───────── emit ───────── */
const emitCode = () => {
	if (!monoCanvas.value) return

	const ctx = monoCanvas.value.getContext('2d', { willReadFrequently:true })!
	const sx  = Math.round(mask.x * scaleFactor.value)
	const sy  = Math.round(mask.y * scaleFactor.value)

	const imgData = ctx.getImageData(sx, sy, props.displayWidth, props.displayHeight)

	const code = generateCCode(imgData, props.displayWidth, props.displayHeight, 'image_bitmap', props.drawMode)
	emit('outputCode', code)

	/* debug helper: auto-download cropped area as PNG */
	// const dbg = document.createElement('canvas')
	// dbg.width  = props.displayWidth
	// dbg.height = props.displayHeight
	// dbg.getContext('2d')!.putImageData(imgData, 0, 0)

	// dbg.toBlob(blob => {
	// 	if (!blob) return
	// 	const url = URL.createObjectURL(blob)
	// 	const a   = document.createElement('a')
	// 	a.href     = url
	// 	a.download = 'oled_crop.png'
	// 	a.click()
	// 	URL.revokeObjectURL(url)
	// }, 'image/png')
}
</script>
