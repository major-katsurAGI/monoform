<template>
    <div class="flex flex-col mx-auto max-w-[1600px] h-[100svh]">
        <div box-="square" class="box-muted flex items-center h-20">
            <div class="px-4">
                <h1 class="text-mauve text-lg">MONOFORM</h1>
            </div>
        </div>

        <div class="grid grid-cols-[400px_1fr] flex-1">
            <div box-="square" shear-="top" class="box-muted flex flex-col">
                <div>
                    <span is-="badge" variant-="background0"><p class="font-bold">Settings</p></span>
                </div>

                <div class="flex flex-col px-1 pt-1 grow">
                    <div box-="square" shear-="top" class="box-muted">
                        <div class="flex justify-between">
                            <span is-="badge" variant-="background0">Source</span>
                        </div>

                        <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                            <input id="source_upload" type="file" accept="image/*" class="hidden" @change="onFileChange" />

                            <label v-if="!imageUrl" for="source_upload" class="cursor-pointer flex items-center justify-center border-dashed border-2 border-foreground2 p-3 hover:bg-overlay1/20 transition-colors">
                                <span class="icon-[lucide--upload] mr-2" />
                                Upload Image
                            </label>

                            <img v-else :src="imageUrl" class="w-full object-contain max-h-[30svh]" alt="Source preview" />
                        </div>
                    </div>

                    <div box-="square" shear-="top" class="box-muted">
                        <div class="flex justify-between">
                            <span is-="badge" variant-="background0">Threshold</span>
                            <span is-="badge" class="justify-self-end ml-auto" variant-="background0">{{ threshold }}</span>
                        </div>

                        <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                            <Slider v-model="threshold" :min="0" :max="100" />
                        </div>
                    </div>

                    <div box-="square" shear-="top" class="box-muted">
                        <div class="flex justify-between">
                            <span is-="badge" variant-="background0">Contrast</span>
                            <span is-="badge" class="justify-self-end ml-auto" variant-="background0">{{ contrast }}</span>
                        </div>

                        <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                            <Slider v-model="contrast" :min="0" :max="200" />
                        </div>
                    </div>

                    <div box-="square" shear-="top" class="box-muted" :class="{ 'opacity-40': !imageLoaded }">
                        <div class="flex justify-between">
                            <span is-="badge" variant-="background0">Scale</span>
                            <span is-="badge" class="justify-self-end ml-auto" variant-="background0">{{ scaleWidth }}</span>
                        </div>

                        <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                            <Slider v-model="scaleWidth" :min="displayWidth" :max="originalWidth" :disabled="!imageLoaded" />
                        </div>
                    </div>

                    <div box-="square" shear-="top" class="box-muted z-50">
                        <div class="flex justify-between">
                            <span is-="badge" variant-="background0">Resolution</span>
                        </div>

                        <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                            <details is-="popover">
                                <summary class="w-full bg-background1 cursor-pointer">{{ resolutionMode === 'preset' ? selectedResolution.label : 'Custom' }}</summary>
                                <ul marker-="open tree" class="bg-background0 pt-1 pl-1 w-full">
                                    <li 
                                        v-for="resolutionItem of resolutionPresets"
                                        class="cursor-pointer" 
                                        :class="{ 'bg-foreground0 text-background0 font-semibold underline': selectedResolution.label === resolutionItem.label && resolutionMode !== 'custom' }"
                                        @click="setResolution(resolutionItem)">
                                        {{ resolutionItem.label }}
                                    </li>
                                    <li 
                                        class="cursor-pointer" 
                                        :class="{ 'bg-foreground0 text-background0 font-semibold underline': resolutionMode === 'custom' }"
                                        @click="resolutionMode = 'custom'">
                                        Custom
                                    </li>
                                </ul>
                            </details>

                            <div v-if="resolutionMode === 'custom'" class="flex items-center gap-1.5 mt-1.5">
                                <input v-model="displayWidth" type="text" class="w-auto min-w-0">x<input v-model="displayHeight" type="text" class="w-auto min-w-0">
                            </div>
                        </div>
                    </div>

                    <div box-="square" shear-="top" class="box-muted">
                        <div class="flex justify-between">
                            <span is-="badge" variant-="background0">Draw Mode</span>
                        </div>

                        <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                            <details is-="popover">
                                <summary class="w-full bg-background1 cursor-pointer capitalize">{{ drawMode }}</summary>
                                <ul marker-="open tree" class="bg-background0 pt-1 pl-1 w-full">
                                    <li 
                                        class="cursor-pointer" 
                                        :class="{ 'bg-foreground0 text-background0 font-semibold underline': drawMode === 'horizontal' }"
                                        @click="drawMode = 'horizontal'">
                                        Horizontal
                                    </li>
                                    <li 
                                        class="cursor-pointer" 
                                        :class="{ 'bg-foreground0 text-background0 font-semibold underline': drawMode === 'vertical' }"
                                        @click="drawMode = 'vertical'">
                                        Vertical
                                    </li>
                                </ul>
                            </details>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col">
                <div box-="square" shear-="top" class="box-muted flex flex-col grow">
                    <div class="flex justify-between">
                        <span is-="badge" variant-="background0">
                            <h1>Preview</h1>
                        </span>
                    </div>

                    <div v-if="imageUrl" class="flex flex-col px-1 pt-1 grow">
                        <MaskCanvas
                            :image-url="imageUrl"
                            :display-width="displayWidth"
                            :display-height="displayHeight"
                            :threshold="threshold[0]"
                            :contrast="contrast[0]"
                            :scale-width="scaleWidth[0]"
                            :draw-mode="drawMode"
                            @output-code="setCode"
                        />
                    </div>

                    <div v-else class="flex items-center p-3 pl-5">
                        <p>Add An Image To The Left</p> 
                    </div>
                </div>

                <div box-="square" shear-="top" class="box-muted overflow-hidden">
                    <div class="flex justify-between">
                        <span is-="badge" variant-="background0">
                            <h1>Code</h1>
                        </span>
                        <span is-="badge" variant-="background0" class="flex">
                            <p @click="handleCodeCopy" class="bg-foreground0 text-background0 px-2 cursor-pointer">Copy</p>
                        </span>
                    </div>

                    <div v-if="outputCode" class="flex flex-col p-2 h-[300px] overflow-auto">
                        <code class="language-c p-6 whitespace-pre" v-highlight>
                            {{ outputCode }}
                        </code>
                    </div>

                    <div v-else class="flex p-3 pl-5 h-[300px]">
                        <p>Code to copy and paste will show up here</p> 
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import MaskCanvas from '@/components/MaskCanvas.vue'

import { copyText } from '@/handlers/copy'
import { resolutionPresets } from '@/constants/resolutions'

import type { ResolutionType } from '@/constants/resolutions'

/* ------------------ existing state ------------------------------------- */
const imageUrl           = ref<string | null>(null)
const outputCode         = ref<string>('')
const threshold          = ref<number[]>([50])
const contrast           = ref<number[]>([100])

const drawMode = ref<'horizontal' | 'vertical'>('horizontal')
const resolutionMode     = ref<'preset' | 'custom'>('preset')
const selectedResolution = ref<ResolutionType>(resolutionPresets[0])

const displayWidth       = ref<number>(resolutionPresets[0].w)
const displayHeight      = ref<number>(resolutionPresets[0].h)

/* ------------------ new scale-related refs ----------------------------- */
const scaleWidth    = ref<number[]>([0])   // array with one entry, like other sliders
const originalWidth = ref<number>(0)       // natural width of img (px)
const imageLoaded   = ref<boolean>(false)  // gate for enabling slider

/* ------------------ settings helpers ----------------------------------- */
const setCode = (code: string) => outputCode.value = code
const setResolution = (resolution: ResolutionType) => {
    selectedResolution.value = resolution
    resolutionMode.value = 'preset'
    displayWidth.value = resolution.w
    displayHeight.value = resolution.h
}

/* ------------------ source upload handler ------------------------------ */
function onFileChange(e: Event) {
    const files = (e.target as HTMLInputElement).files
    if (!files || !files[0]) return

    if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
    imageUrl.value = URL.createObjectURL(files[0])

    /* preload to fetch native dims for scale slider */
    const probe = new Image()
    probe.onload = () => {
        originalWidth.value = probe.naturalWidth
        scaleWidth.value    = [displayWidth.value]
        imageLoaded.value   = true
    }
    probe.src = imageUrl.value
}

const handleCodeCopy = async () => await copyText(outputCode.value)

/* ------------------ keep scale ≥ displayWidth -------------------------- */
watch(displayWidth, (w) => {
    if (scaleWidth.value[0] < w) scaleWidth.value = [w]
})
</script>
