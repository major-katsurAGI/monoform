const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max)

const debounce = <T extends (...args: any[]) => void>(fn: T, delay = 100): ((...args: Parameters<T>) => void) => {
	let timer: ReturnType<typeof setTimeout> | null = null
	return (...args: Parameters<T>) => {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => fn(...args), delay)
	}
}

const saveFile = (data: Blob | string, filename: string) => {
	const blob = data instanceof Blob ? data : new Blob([data], { type: 'text/plain' })

	const url = URL.createObjectURL(blob)
	const a   = document.createElement('a')
	a.href     = url
	a.download = filename
	a.style.display = 'none'
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}


export { clamp, debounce, saveFile }
