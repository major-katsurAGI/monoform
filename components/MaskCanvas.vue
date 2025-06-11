<!-- MaskCanvas.vue -->
<template>
  <div class="flex flex-col items-center gap-4 w-full">
    <!-- ── Preview canvas (full-res + contrast) ── -->
    <div class="relative w-[400px] h-[400px] select-none">
      <canvas ref="previewCanvas" :style="canvasStylePreview" />
      <div
        data-canvas="preview"
        class="absolute border-2 border-cyan-400 cursor-move z-10"
        :style="maskStylePreview"
        @mousedown="startDrag"
      />
    </div>

    <!-- ── Mono canvas (down-scaled, monochrome) ── -->
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
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onBeforeUnmount } from 'vue'

/* ───────── props ───────── */
const props = defineProps({
  imageUrl:      { type: String, default: null },
  threshold:     { type: Number, required: true },  // 0-100
  contrast:      { type: Number, required: true },  // %
  displayWidth:  { type: Number, required: true },  // OLED px
  displayHeight: { type: Number, required: true },
  scaleWidth:    { type: Number, required: true }   // mono internal px
})

/* ───────── constants ───────── */
const BOX = 400   // CSS side of square container

/* ───────── refs & state ───────── */
const previewCanvas = ref<HTMLCanvasElement|null>(null)
const monoCanvas    = ref<HTMLCanvasElement|null>(null)
const img           = ref<HTMLImageElement|null>(null)

/* fit metrics (CSS) for each canvas */
type Fit = { s:number,w:number,h:number,offX:number,offY:number }
const previewFit:Fit = reactive({ s:1,w:0,h:0,offX:0,offY:0 })
const monoFit   :Fit = reactive({ s:1,w:1,h:1,offX:0,offY:0 })

/* factor: image-px → mono internal px */
const scaleFactor = computed(() =>
  img.value ? props.scaleWidth / img.value.width : 1)

/* mask in *image* coordinate space */
const mask = reactive({
  x: 0, y: 0,
  get w () { return props.displayWidth  / scaleFactor.value },
  get h () { return props.displayHeight / scaleFactor.value }
})

/* drag helpers */
const dragging   = ref(false)
const dragOffset = reactive({ x: 0, y: 0 })
let activeBox:'preview'|'mono'|null = null   // which overlay started drag

/* ────────────────────────────────────────────────────────────────────
   IMAGE LOAD & FIT CALC
   ──────────────────────────────────────────────────────────────────── */
watch(() => props.imageUrl, loadImage, { immediate:true })

function loadImage () {
  if (!props.imageUrl) { clearAll(); return }
  const _img = new Image()
  _img.onload = () => {
    img.value = _img
    calcFits()
    clampMask()
    drawPreview()
    drawMono()
  }
  _img.src = props.imageUrl
}

function calcFits () {
  if (!img.value) return

  /* preview fit (letter-boxed) */
  previewFit.s    = Math.min(BOX / img.value.width, BOX / img.value.height)
  previewFit.w    = img.value.width  * previewFit.s
  previewFit.h    = img.value.height * previewFit.s
  previewFit.offX = (BOX - previewFit.w)  / 2
  previewFit.offY = (BOX - previewFit.h) / 2
  if (previewCanvas.value) {
    previewCanvas.value.width  = img.value.width
    previewCanvas.value.height = img.value.height
  }

  /* mono internal res & CSS fit */
  monoFit.w    = props.scaleWidth || 1
  monoFit.h    = Math.round(img.value.height * (monoFit.w / img.value.width))
  monoFit.s    = Math.min(BOX / monoFit.w, BOX / monoFit.h)
  monoFit.offX = (BOX - monoFit.w * monoFit.s) / 2
  monoFit.offY = (BOX - monoFit.h * monoFit.s) / 2
  if (monoCanvas.value) {
    monoCanvas.value.width  = monoFit.w
    monoCanvas.value.height = monoFit.h
  }
}

/* recalc on scale change + debounce heavy threshold draw */
let scaleTimer:ReturnType<typeof setTimeout>|null=null
watch(() => props.scaleWidth, () => {
  calcFits(); clampMask(); drawPreview()
  clearTimeout(scaleTimer as any)
  scaleTimer = setTimeout(drawMono, 80)
})

/* ────────────────────────────────────────────────────────────────────
   PREVIEW CANVAS
   ──────────────────────────────────────────────────────────────────── */
watch(() => props.contrast, drawPreview)
function drawPreview () {
  if (!previewCanvas.value || !img.value) return
  const ctx = previewCanvas.value.getContext('2d')!
  ctx.filter = `contrast(${props.contrast}%)`
  ctx.clearRect(0,0,img.value.width,img.value.height)
  ctx.drawImage(img.value,0,0)
  ctx.filter = 'none'
}

/* ────────────────────────────────────────────────────────────────────
   MONO CANVAS
   ──────────────────────────────────────────────────────────────────── */
watch([() => props.contrast, () => props.threshold], drawMono)
function drawMono () {
  if (!monoCanvas.value || !img.value || !props.scaleWidth) return
  const ctx = monoCanvas.value.getContext('2d')!

  /* contrast + scale */
  ctx.filter = `contrast(${props.contrast}%)`
  ctx.drawImage(img.value,0,0,monoFit.w,monoFit.h)
  ctx.filter = 'none'

  /* threshold */
  const data = ctx.getImageData(0,0,monoFit.w,monoFit.h)
  const d = data.data, thr = props.threshold*2.55
  for (let i=0;i<d.length;i+=4){
    const g=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]
    const bw=g<thr?0:255
    d[i]=d[i+1]=d[i+2]=bw
  }
  ctx.putImageData(data,0,0)
}

/* ────────────────────────────────────────────────────────────────────
   CANVAS & MASK CSS STYLES
   ──────────────────────────────────────────────────────────────────── */
const canvasStylePreview = computed(() => ({
  position:'absolute',
  width :`${previewFit.w}px`,
  height:`${previewFit.h}px`,
  left  :`${previewFit.offX}px`,
  top   :`${previewFit.offY}px`
}))
const canvasStyleMono = computed(() => ({
  position:'absolute',
  width :`${monoFit.w*monoFit.s}px`,
  height:`${monoFit.h*monoFit.s}px`,
  left  :`${monoFit.offX}px`,
  top   :`${monoFit.offY}px`
}))

/* overlay sizes - compute individually so hit-test matches overlay */
const overlayPreview = computed(() => ({
  w: mask.w * previewFit.s,
  h: mask.h * previewFit.s
}))
const overlayMono = computed(() => ({
  w: props.displayWidth  * monoFit.s,
  h: props.displayHeight * monoFit.s
}))

const maskStylePreview = computed(() => ({
  width :`${overlayPreview.value.w}px`,
  height:`${overlayPreview.value.h}px`,
  left  :`${previewFit.offX + mask.x*previewFit.s}px`,
  top   :`${previewFit.offY  + mask.y*previewFit.s}px`
}))
const maskStyleMono = computed(() => ({
  width :`${overlayMono.value.w}px`,
  height:`${overlayMono.value.h}px`,
  left  :`${monoFit.offX + mask.x*scaleFactor.value*monoFit.s}px`,
  top   :`${monoFit.offY  + mask.y*scaleFactor.value*monoFit.s}px`
}))

/* ────────────────────────────────────────────────────────────────────
   DRAGGING
   ──────────────────────────────────────────────────────────────────── */
function getImageCoords (e:MouseEvent, box:'preview'|'mono'){
  if(!img.value) return null
  const rect = box === 'mono' ? monoCanvas.value!.getBoundingClientRect() : previewCanvas.value!.getBoundingClientRect()

  const cx = e.clientX-rect.left, cy = e.clientY-rect.top
  return box==='mono'
    ? {
        x:(cx-monoFit.offX)/(monoFit.s*scaleFactor.value),
        y:(cy-monoFit.offY)/(monoFit.s*scaleFactor.value)
      }
    : {
        x:(cx-previewFit.offX)/previewFit.s,
        y:(cy-previewFit.offY )/previewFit.s
      }
}

onBeforeUnmount(stopDrag)

/* ────────────────────────────────────────────────────────────────────
   UTIL
   ──────────────────────────────────────────────────────────────────── */
function clamp(v:number,min:number,max:number){return Math.min(Math.max(v,min),max)}
function clearAll(){
  previewCanvas.value?.getContext('2d')?.clearRect(0,0,BOX,BOX)
  monoCanvas.value?.getContext('2d')?.clearRect(0,0,BOX,BOX)
}
function clampMask(){
  if(!img.value) return
  mask.x = clamp(mask.x, 0, img.value.width  - mask.w)
  mask.y = clamp(mask.y, 0, img.value.height - mask.h)
}
</script>
