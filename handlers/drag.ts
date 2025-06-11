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

export const createDragHandlers = (ctx: DragCtx) => {
	const dragging	 = ref(false)
	const dragOffset = reactive({ x: 0, y: 0 })
	let activeBox: 'preview' | 'mono' | null = null

	const toImage = (event: MouseEvent, box:'preview'|'mono') => {
		if (!ctx.image.value) return null
		const rect = box === 'mono'
			? ctx.monoCanvas.value!.getBoundingClientRect()
			: ctx.previewCanvas.value!.getBoundingClientRect()

		const cx = event.clientX - rect.left
		const cy = event.clientY - rect.top

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

	const startDrag = (event: MouseEvent) => {
		const box = (event.currentTarget as HTMLElement).dataset.canvas as 'preview'|'mono'
		const p = toImage(event, box); if (!p) return

		// if (
		// 	p.x >= ctx.mask.x && p.x <= ctx.mask.x + ctx.mask.w &&
		// 	p.y >= ctx.mask.y && p.y <= ctx.mask.y + ctx.mask.h
		// ) {
			activeBox		= box
			dragging.value	= true
			dragOffset.x	= p.x - ctx.mask.x
			dragOffset.y	= p.y - ctx.mask.y

			window.addEventListener('mousemove', onDrag)
			window.addEventListener('mouseup', stopDrag)
		// }
	}

	const onDrag = (event: MouseEvent) => {
		if (!dragging.value || !ctx.image.value || !activeBox) return
		const p = toImage(event, activeBox); if (!p) return

		ctx.mask.x = clamp(p.x - dragOffset.x, 0, ctx.image.value.width  - ctx.mask.w)
		ctx.mask.y = clamp(p.y - dragOffset.y, 0, ctx.image.value.height - ctx.mask.h)
	}

	const stopDrag = () => {
		if (!dragging.value) return
		dragging.value = false
		activeBox = null
		window.removeEventListener('mousemove', onDrag)
		window.removeEventListener('mouseup', stopDrag)
	}
	onBeforeUnmount(stopDrag)

	return { startDrag }
}
