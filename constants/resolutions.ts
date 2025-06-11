interface ResolutionType { 
    label: string,
    w: number,
    h: number
}

const resolutionPresets: ResolutionType[] = [
    { label: '128×64', w: 128, h: 64 },
    { label: '128×32', w: 128, h: 32 },
    { label: '96×16',  w:  96, h: 16 },
    { label: '64×48',  w:  64, h: 48 },
]

export { resolutionPresets }
export type { ResolutionType }
