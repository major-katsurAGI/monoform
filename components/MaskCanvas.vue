<template>
	<div class="flex justify-center w-full">
		<!-- EFFECTS PREVIEW -->
		<div box-="square" shear-="top" class="box-muted flex flex-col grow">
			<span is-="badge" variant-="background0"><h1 class="font-bold text-peach">Effects Preview</h1></span>

			<div class="relative w-full min-h-[150px] md:h-[400px] select-none my-2">
				<canvas
					ref="previewCanvas"
					:style="canvasStylePreview"
					class="border border-dashed border-background2"
				/>
				<div
					data-canvas="preview"
					class="absolute border-2 border-cyan-400 cursor-move z-10"
					:style="maskStylePreview"
					@mousedown="startDrag"
					@touchstart="startDrag"
				/>
			</div>
		</div>

		<!-- DISPLAY PREVIEW -->
		<div box-="square" shear-="top" class="box-muted flex flex-col grow">
			<span is-="badge" variant-="background0"><h1 class="font-bold text-green">Display Preview</h1></span>

			<div class="relative w-full min-h-[150px] md:h-[400px] select-none my-2">
				<canvas
					ref="monoCanvas"
					:style="canvasStyleMono"
					class="border border-dashed border-background2"
				/>
				<div
					data-canvas="mono"
					class="absolute border-2 border-cyan-400 cursor-move z-10"
					:style="maskStyleMono"
					@mousedown="startDrag"
					@touchstart="startDrag"
				/>
			</div>
		</div>
	</div>

	<div class="flex flex-col md:flex-row px-1.5 mb-4 gap-1.5">
		<button @click="handleGenerateCode" class="cursor-pointer h-12 bg-foreground0">Generate Code</button>
        <div class="flex gap-1.5 w-full md:w-auto">
            <button @click="handleDownloadPNG" class="cursor-pointer h-12 bg-foreground0 w-full md:w-auto">Download PNG</button>
            <button @click="handleDownloadFile" class="cursor-pointer h-12 bg-foreground0 w-full md:w-auto">Download Header</button>
        </div>
	</div>
</template>

<script setup lang="ts">
/* eslint-disable no-mixed-spaces-and-tabs */
import { ref, reactive, watch, computed, onMounted, onBeforeUnmount } from 'vue'

import { clamp } from '@/handlers/helpers'
import { createDragHandlers } from '@/handlers/drag'
import { generateHeaderCode } from '@/handlers/generate'
import { downloadBitmapHeader, downloadPNG } from '@/handlers/download'

import { createRenderer } from '@/handlers/render'
import type { Renderer } from '@/handlers/render'

import fragPreview   from '@/shaders/effects.frag.glsl?raw'
import fragThreshold from '@/shaders/threshold.frag.glsl?raw'

/* ───────── props ───────── */
interface Props {
	imageUrl?:      string | null
	threshold:      number
	contrast:       number
	blur:           number
	grain:          number
	hue:            number
	brightness:     number
	grayscale:      number
	sepia:          number
	saturate:       number
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

/* WebGL renderers */
const rendererPreview = ref<Renderer | null>(null)
const rendererMono    = ref<Renderer | null>(null)

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

/* ───────── shader uniforms ───────── */
const previewUniforms = computed(() => ({
	u_blur       : (props.blur       / 100) * 0.05,   // 0‥0.05
	u_grain      :  props.grain      / 100,           // 0‥1
	u_hue        :  props.hue,                        // −180‥180  (already correct)

	u_brightness :  props.brightness / 100,           // 0‥2, neutral = 1
	u_contrast   :  props.contrast   / 100,           // 0‥2, neutral = 1
	u_saturate   :  props.saturate   / 100,           // 0‥2, neutral = 1

	u_grayscale  :  props.grayscale  / 100,           // 0‥1
	u_sepia      :  props.sepia      / 100            // 0‥1
}))
const monoUniforms = computed(() => ({
	u_threshold : props.threshold / 100
}))

/* ───────── helpers ───────── */
const clampMask = () => {
	if (!image.value) return
	mask.x = clamp(mask.x, 0, image.value.width  - mask.w)
	mask.y = clamp(mask.y, 0, image.value.height - mask.h)
}

const drawPreview = () => {
	if (rendererPreview.value && image.value)
		rendererPreview.value.draw(image.value, previewUniforms.value)
}

/* mono uses effects canvas as source */
const drawMono = () => {
	if (rendererMono.value && previewCanvas.value)
		rendererMono.value.draw(previewCanvas.value, monoUniforms.value)
}

/* render preview now + mono in next frame so GPU has finished */
const redrawAll = () => {
	drawPreview()
	requestAnimationFrame(drawMono)
}

/* ───────── fit calc ───────── */
const fitInBox = (bw:number, bh:number, rw:number, rh:number) => {
	const s     = Math.min(bw / rw, bh / rh)
	const offX  = (bw - rw * s) / 2
	const offY  = (bh - rh * s) / 2
	return { s, offX, offY }
}

const updateFits = () => {
	if (!image.value) return
	const img  = image.value
	const pBox = previewCanvas.value?.parentElement
	const mBox = monoCanvas.value?.parentElement
	if (!pBox || !mBox) return

	/* preview – keep raw dimensions */
	previewFit.w = img.width
	previewFit.h = img.height
	Object.assign(
		previewFit,
		{ ...previewFit, ...fitInBox(pBox.clientWidth, pBox.clientHeight, img.width, img.height) }
	)
	if (previewCanvas.value) {
		previewCanvas.value.width  = img.width
		previewCanvas.value.height = img.height
	}

	/* mono – scaled-down with scaleWidth */
	monoFit.w = props.scaleWidth || 1
	monoFit.h = Math.round(img.height * (monoFit.w / img.width))
	Object.assign(
		monoFit,
		{ ...monoFit, ...fitInBox(mBox.clientWidth, mBox.clientHeight, monoFit.w, monoFit.h) }
	)
	if (monoCanvas.value) {
		monoCanvas.value.width  = monoFit.w
		monoCanvas.value.height = monoFit.h
	}
}

/* ───────── load & watch ───────── */
const clearAll = () => { rendererPreview.value = rendererMono.value = null }

const loadImage = () => {
	if (!props.imageUrl) { clearAll(); return }
	const img = new Image()
	img.onload = () => {
		image.value = img
		updateFits()

		if (!rendererPreview.value && previewCanvas.value)
			rendererPreview.value = createRenderer(previewCanvas.value, fragPreview)

		if (!rendererMono.value && monoCanvas.value)
			rendererMono.value = createRenderer(monoCanvas.value, fragThreshold)

		redrawAll()
	}
	img.src = props.imageUrl
}
watch(() => props.imageUrl, loadImage, { immediate:true })

/* reactive uniforms */
watch(
	[
		() => props.blur, () => props.grain, () => props.hue,
		() => props.brightness, () => props.contrast, () => props.grayscale,
		() => props.sepia, () => props.saturate
	],
	redrawAll
)
watch(() => props.threshold, () => requestAnimationFrame(drawMono))
watch(() => props.scaleWidth, () => { updateFits(); redrawAll() })

/* ───────── resize ───────── */
let ro: ResizeObserver | null = null
onMounted(() => {
	if (previewCanvas.value) {
		ro = new ResizeObserver(() => { updateFits(); clampMask(); redrawAll() })
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
	width      : `${previewFit.w * previewFit.s}px`,
	height     : `${previewFit.h * previewFit.s}px`,
	marginLeft : `${previewFit.offX}px`,
	marginTop  : `${previewFit.offY}px`,
	display    : 'block'
}))
const canvasStyleMono = computed(() => ({
	width      : `${monoFit.w * monoFit.s}px`,
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

const handleDownloadPNG = () => {
    downloadPNG(
        monoCanvas.value!,
        Math.round(mask.x * scaleFactor.value),   // sx
        Math.round(mask.y * scaleFactor.value),   // sy
        props.displayWidth,                       // w
        props.displayHeight                       // h
    )
}

const getCodeString = () => {
	const sx   = Math.round(mask.x * scaleFactor.value)
	const sy   = Math.round(mask.y * scaleFactor.value)
	const syGL = monoFit.h - props.displayHeight - sy   // GL origin at bottom

	const buf = rendererMono.value!.readPixels(sx, syGL, props.displayWidth, props.displayHeight)
	const codeString = generateHeaderCode(
		buf,
		props.displayWidth,
		props.displayHeight,
		'image_bitmap',
		props.drawMode
	)

    return codeString
}

const handleGenerateCode = () => {
	if (!rendererMono.value || !previewCanvas.value) return
    let codeString = ''

	redrawAll()
	requestAnimationFrame(() => {
		codeString = getCodeString()
		emit('outputCode', codeString)
	})
}

const handleDownloadFile = () => {
    const codeString = getCodeString()
    downloadBitmapHeader(codeString)
}

</script>
