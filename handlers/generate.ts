const generateHeaderCode = (
    rgbaBuf   : Uint8Array,                    // result of readPixels
    width     : number,
    height    : number,
    varName   = 'image_bitmap',
    drawMode  : 'horizontal' | 'vertical' = 'vertical'
): string => {

    /* ------------ flip Y in a single pass ------------ */
    const row     = width * 4
    const flipped = new Uint8ClampedArray(rgbaBuf.length)

    for (let y = 0; y < height; ++y) {
        flipped.set(
            rgbaBuf.subarray((height - 1 - y) * row, (height - y) * row),
            y * row
        )
    }

    const imgData = new ImageData(flipped, width, height)

    /* ------------ bitmap encoding (unchanged) -------- */
    const bytes:number[] = []

    if (drawMode === 'horizontal') {
        /* row-major */
        for (let y=0; y<height; y++){
            for (let xb=0; xb<Math.ceil(width/8); xb++){
                let b=0
                for(let bit=0;bit<8;bit++){
                    const x=xb*8+bit
                    if(x>=width) continue
                    const idx=(y*width+x)*4
                    if(imgData.data[idx]!==0) b |= 0x80>>bit
                }
                bytes.push(b)
            }
        }
    } else {
        /* page-major (vertical) */
        const pages=Math.ceil(height/8)
        for(let p=0;p<pages;p++){
            for(let x=0;x<width;x++){
                let b=0
                for(let bit=0;bit<8;bit++){
                    const y=p*8+bit
                    if(y>=height) continue
                    const idx=(y*width+x)*4
                    if(imgData.data[idx]!==0) b|=1<<bit
                }
                bytes.push(b)
            }
        }
    }

    /* pretty-print 16 bytes / line */
    const body = bytes
        .map(b=>`0x${b.toString(16).padStart(2,'0').toUpperCase()}`)
        .reduce<string[]>((acc,v,i)=>{
            if(i%16===0) acc.push(v); else acc[acc.length-1]+=`, ${v}`
            return acc
        },[])
        .join(',\n\t')

    const guard = `_${varName.toUpperCase()}_H_`

    return `#ifndef ${guard}
#define ${guard}

#include <stdint.h>

/* bitmap size : ${width}×${height}px, ${bytes.length} bytes (${drawMode}) */
#define ${varName.toUpperCase()}_WIDTH  ${width}
#define ${varName.toUpperCase()}_HEIGHT ${height}
#define ${varName.toUpperCase()}_LEN    ${bytes.length}

static const uint8_t ${varName}[${bytes.length}] = {
\t${body}
};

#endif /* ${guard} */`
}

export { generateHeaderCode }
