import { ref, onBeforeUnmount, reactive } from 'vue'
import { clamp } from './helpers'

import type { Ref, ComputedRef } from 'vue'
type Fit = { s:number; offX:number; offY:number }

interface DragCtx {
	previewCanvas : Ref<HTMLCanvasElement | null>
	monoCanvas    : Ref<HTMLCanvasElement | null>
	mask          : { x:number; y:number; w:number; h:number }
	previewFit    : Fit
	monoFit       : Fit
	image         : Ref<HTMLImageElement | null>
	scaleFactor   : ComputedRef<number>
}

const createDragHandlers = (ctx: DragCtx) => {
	const dragging   = ref(false)
	const dragOffset = reactive({ x: 0, y: 0 })
	let activeBox: 'preview' | 'mono' | null = null

	/* ───────── helpers ───────── */
	const getXY = (e: MouseEvent | TouchEvent) => {
		if ('touches' in e) {
			const t = e.touches[0] ?? e.changedTouches[0]
			return { clientX: t.clientX, clientY: t.clientY }
		}
		return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY }
	}

	const toImage = (event: MouseEvent | TouchEvent, box:'preview'|'mono') => {
		if (!ctx.image.value) return null
		const rect = box === 'mono'
			? ctx.monoCanvas.value!.getBoundingClientRect()
			: ctx.previewCanvas.value!.getBoundingClientRect()

		const { clientX, clientY } = getXY(event)
		const cx = clientX - rect.left
		const cy = clientY - rect.top

		return box === 'mono'
			? {
					x:(cx - ctx.monoFit.offX) /
						(ctx.monoFit.s * ctx.scaleFactor.value),
					y:(cy - ctx.monoFit.offY) /
						(ctx.monoFit.s * ctx.scaleFactor.value)
			  }
			: {
					x:(cx - ctx.previewFit.offX) / ctx.previewFit.s,
					y:(cy - ctx.previewFit.offY) / ctx.previewFit.s
			  }
	}

	/* ───────── event handlers ───────── */
	const startDrag = (event: MouseEvent | TouchEvent) => {
		event.preventDefault()

		const box = (event.currentTarget as HTMLElement).dataset.canvas as 'preview'|'mono'
		const p   = toImage(event, box); if (!p) return

		activeBox      = box
		dragging.value = true
		dragOffset.x   = p.x - ctx.mask.x
		dragOffset.y   = p.y - ctx.mask.y

		window.addEventListener('mousemove', onDrag)
		window.addEventListener('mouseup',   stopDrag)
		window.addEventListener('touchmove', onDrag, { passive:false })
		window.addEventListener('touchend',  stopDrag)
	}

	const onDrag = (event: MouseEvent | TouchEvent) => {
		if (!dragging.value || !ctx.image.value || !activeBox) return
		event.preventDefault()

		const p = toImage(event, activeBox); if (!p) return
		ctx.mask.x = clamp(p.x - dragOffset.x, 0, ctx.image.value.width  - ctx.mask.w)
		ctx.mask.y = clamp(p.y - dragOffset.y, 0, ctx.image.value.height - ctx.mask.h)
	}

	const stopDrag = () => {
		if (!dragging.value) return
		dragging.value = false
		activeBox = null

		window.removeEventListener('mousemove', onDrag)
		window.removeEventListener('mouseup',   stopDrag)
		window.removeEventListener('touchmove', onDrag)
		window.removeEventListener('touchend',  stopDrag)
	}
	onBeforeUnmount(stopDrag)

	return { startDrag }
}

export { createDragHandlers }
