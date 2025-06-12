const copyText = async (text: string): Promise<void> => {
	try {
		/* modern API (Chromium, FF, Edge, Safari 14+) */
		await navigator.clipboard.writeText(text)
	} catch {
		/* fallback – create a hidden textarea */
		const ta = document.createElement('textarea')
		ta.value = text
		ta.style.position   = 'fixed'
		ta.style.opacity    = '0'
		ta.style.pointerEvents = 'none'
		document.body.appendChild(ta)
		ta.select()
		try { document.execCommand('copy') } finally {
			document.body.removeChild(ta)
		}
	}
}

export { copyText }
