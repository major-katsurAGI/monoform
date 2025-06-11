<template>
    <div class="flex flex-col mx-auto max-w-[1400px] min-h-[100svh]">
        <div box-="square" class="flex items-center h-20">
            <div class="px-4">
                <h1>MONOFORM</h1>
            </div>
        </div>

        <div class="grid grid-cols-[400px_1fr] flex-1">
            <div box-="square" shear-="top">
                <div>
                    <span is-="badge" variant-="background0"><h2>Settings</h2></span>
                </div>

                <div class="flex">
                    <div box-="square" shear-="top" class="w-full">
                        <div>
                            <span is-="badge" class="justify-self-end ml-auto" variant-="background0">Threshold</span>
                        </div>

                        <div class="flex flex-col w-full px-2">
                            <p>{{ threshold }}</p>
                            <Slider v-model="threshold" />
                            <h3>Nigga</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div box-="square" shear-="top">
                <div class="flex justify-between">
                    <span is-="badge" variant-="background0">
                        <h2>Output</h2>
                    </span>
                </div>

                <div>
                    NIGGA
                </div>
            </div>
        </div>
    </div>

    <!-- <div class="p-2 max-w-4xl mx-auto mt-4"> -->
    <!--     <h1 class="mb-2">OLED Bitmap Generator</h1> -->
    <!---->
    <!--     <ImageUploader @loaded="handleLoaded" /> -->
    <!---->
    <!--     <div class="tui-box mt-1"> -->
    <!--         <label class="mr-1">Resolution:</label> -->
    <!--         <select v-model="res" class="tui-select"> -->
    <!--             <option v-for="r in resolutions" :key="r.label" :value="r"> -->
    <!--             {{ r.label }} -->
    <!--             </option> -->
    <!--         </select> -->
    <!--     </div> -->
    <!---->
    <!--     <ThresholdSlider v-model:threshold="threshold" /> -->
    <!--     <CropSelector v-if="upload" :src="upload.url" :aspect="res.w / res.h" @cropped="cropped = $event" /> -->
    <!--     <OutputPanel v-if="bytes && pngBlob" :bytes="bytes" :png="pngBlob" :width="res.w" :height="res.h" /> -->
    <!-- </div> -->
</template>

<script setup lang="ts">
import { resolutions } from '@/constants/resolutions'

const threshold = ref<number[]>([50])

const upload   = ref<{ bmp: ImageBitmap; url: string } | null>(null)
const cropped  = ref<ImageBitmap | null>(null)
const res      = ref(resolutions[0])

const { bytes, pngBlob, process } = useImageProcessor()

/* called by ImageUploader */
function handleLoaded(p: { bmp: ImageBitmap; url: string }) {
  upload.value = p
}

watch([cropped, res, threshold], () => {
    if (cropped.value) process(cropped.value, res.value.w, res.value.h, threshold.value)
})
</script>

