/** Clamp a number to the inclusive [min, max] range */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

/** Simple leading-edge debounce (executes fn after `delay` ms without calls) */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 100): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout> | null = null

    return (...args: Parameters<T>) => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}
