import textureVert from '@/shaders/texture.vert.glsl?raw'

export interface Renderer {
	draw(img: HTMLImageElement, uniforms?: Record<string, number | number[]>): void
	readPixels(x: number, y: number, w: number, h: number): Uint8Array
}

export function createRenderer(canvas: HTMLCanvasElement, fragSrc: string): Renderer {
    const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true }) as WebGL2RenderingContext
	if (!gl) throw new Error('WebGL2 not supported')

	/* ───────── compile & link ───────── */
	const compile = (src: string, type: number) => {
		const sh = gl.createShader(type)!
		gl.shaderSource(sh, src)
		gl.compileShader(sh)
		if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
			throw String(gl.getShaderInfoLog(sh))
		return sh
	}

	const prog = gl.createProgram()!
	gl.attachShader(prog, compile(textureVert, gl.VERTEX_SHADER))
	gl.attachShader(prog, compile(fragSrc,    gl.FRAGMENT_SHADER))
	gl.linkProgram(prog)
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
		throw String(gl.getProgramInfoLog(prog))
	gl.useProgram(prog)

	/* ───────── fullscreen triangle ───────── */
	const vbo = gl.createBuffer()!
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-1, -1, 3, -1, -1, 3]),
		gl.STATIC_DRAW
	)
	const locPos = 0 /* layout(location=0) in vertex shader */
	gl.enableVertexAttribArray(locPos)
	gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0)

	/* ───────── texture ───────── */
	const tex = gl.createTexture()!
	gl.bindTexture(gl.TEXTURE_2D, tex)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

	/* ───────── uniform cache ───────── */
	const locs = new Map<string, WebGLUniformLocation>()
	{
		const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS) as number
		for (let i = 0; i < n; ++i) {
			const info = gl.getActiveUniform(prog, i)
			if (info) locs.set(info.name, gl.getUniformLocation(prog, info.name)!)
		}
	}
	const setUniform = (name: string, v: number | number[]) => {
		const l = locs.get(name)
		if (!l) return
		if (typeof v === 'number') gl.uniform1f(l, v)
		else {
			switch (v.length) {
				case 2: gl.uniform2f(l, v[0], v[1]); break
				case 3: gl.uniform3f(l, v[0], v[1], v[2]); break
				case 4: gl.uniform4f(l, v[0], v[1], v[2], v[3]); break
			}
		}
	}

	/* remember last bitmap so we don’t re-upload every frame */
	let lastImg: HTMLImageElement | null = null

	/* ───────── public API ───────── */
	const draw = (img: HTMLImageElement, uniforms: Record<string, number | number[]> = {}) => {
		if (!canvas.width || !canvas.height) return   /* size is controlled outside */

		gl.viewport(0, 0, canvas.width, canvas.height)
		gl.useProgram(prog)

		/* upload bitmap only if it changed */
		if (img !== lastImg) {
			gl.bindTexture(gl.TEXTURE_2D, tex)
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
			lastImg = img
		}

		/* automatic resolution uniform */
		if (locs.has('u_resolution'))
			setUniform('u_resolution', [img.width, img.height])

		/* user-supplied uniforms */
		for (const [k, v] of Object.entries(uniforms))
			setUniform(k, v)

		gl.drawArrays(gl.TRIANGLES, 0, 3)
	}

	const readPixels = (x: number, y: number, w: number, h: number) => {
		const buf = new Uint8Array(w * h * 4)
		gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf)
		return buf
	}

	return { draw, readPixels }
}
