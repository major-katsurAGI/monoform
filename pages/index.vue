<template>
    <div class="flex flex-col mx-auto max-w-[1600px] h-[100svh]">
        <div box-="square" class="box-muted flex items-center h-16">
            <div class="flex items-center justify-between grow px-2">
                <div class="flex items-center gap-1.5">
                    <img src="/favicon.png" alt="" class="h-8">
                    <h1 class="text-mauve text-lg before:content-['']">MONOFORM</h1>
                </div>

                <div class="flex gap-3">
                    <a href="https://github.com/major-katsurAGI/monoform" class="flex hover:underline">
                        <span class="font-nerd mr-1.5">&#xf09b;</span>
                        Github
                    </a>
                    <!-- <a href="https://github.com/major-katsurAGI/monoform"> -->
                    <!--     <span class="font-nerd">&#xf09b;</span> -->
                    <!--     Github -->
                    <!-- </a> -->

                    <button @click="toggleTheme" size-="small" title="Toggle theme" class="cursor-pointer">
                        <span class="font-nerd mr-1.5">&#xf00df;</span>
                        <span v-if="colorMode.value === 'light'">Dark</span>
                        <span v-else>Light</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="flex flex-col md:grid md:grid-cols-[450px_1fr] grow">
            <div box-="square" shear-="top" class="box-muted flex flex-col">
                <div>
                    <span is-="badge" variant-="background0">
                        <h1 class="font-bold"><span class="font-nerd mr-2">&#xe690;</span>Settings</h1>
                    </span>
                </div>

                <div class="flex flex-col px-1 pt-1">
                    <div class="flex md:flex-col">
                        <div box-="square" shear-="top" class="box-muted flex flex-col grow">
                            <div class="flex justify-between text-sm">
                                <span is-="badge" variant-="background0"><span class="font-nerd mr-2">&#xf0e07;</span>Source</span>
                            </div>

                            <div class="flex flex-col items-center justify-center grow px-2 pt-1 pb-0.5 md:min-h-32">
                                <input id="source_upload" type="file" accept="image/*" class="hidden" @change="onFileChange" />

                                <label for="source_upload" class="cursor-pointer flex items-center justify-center w-full h-full hover:bg-overlay1/20 transition-colors">
                                    <span v-if="!imageUrl" class="font-nerd text-xl">&#xf05e;</span>
                                    <img v-else :src="imageUrl" class="object-contain max-h-[78px] md:max-h-[30svh]" alt="Source preview" />
                                </label>
                            </div>
                        </div>

                        <div class="flex flex-col grow">
                            <div box-="square" shear-="top" class="box-muted">
                                <div class="flex justify-between text-sm">
                                    <span is-="badge" variant-="background0"><span class="font-nerd mr-2">&#xf00ca;</span>Threshold</span>
                                    <span is-="badge" class="justify-self-end ml-auto" variant-="background0">{{ threshold[0] }}</span>
                                </div>

                                <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                                    <Slider v-model="threshold" :min="0" :max="100" />
                                </div>
                            </div>

                            <div box-="square" shear-="top" class="box-muted" :class="{ 'opacity-40': !imageLoaded }">
                                <div class="flex justify-between text-sm">
                                    <span is-="badge" variant-="background0"><span class="font-nerd mr-2">&#xf0c8e;</span>Scale</span>
                                    <span is-="badge" class="justify-self-end ml-auto" variant-="background0">{{ scaleWidth[0] }}</span>
                                </div>

                                <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                                    <Slider v-model="scaleWidth" :min="displayWidth" :max="originalWidth" :disabled="!imageLoaded" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-2 text-sm">
                        <div box-="square" shear-="top" class="box-muted mt-1">
                            <div class="flex justify-between">
                                <span is-="badge" variant-="background0"><span class="font-nerd mr-2">&#xf0196;</span>Contrast</span>
                                <span is-="badge" class="justify-self-end ml-auto" variant-="background0">{{ contrast[0] }}</span>
                            </div>

                            <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                                <Slider v-model="contrast" :min="0" :max="200" />
                            </div>
                        </div>

                        <div box-="square" shear-="top" class="box-muted mt-1">
                            <div class="flex justify-between">
                                <span is-="badge" variant-="background0"><span class="font-nerd mr-2">&#xf03e;</span>Blur</span>
                                <span is-="badge" class="ml-auto" variant-="background0">{{ blur[0] }}</span>
                            </div>
                            <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                                <Slider v-model="blur" :min="0" :max="100" />
                            </div>
                        </div>

                        <div box-="square" shear-="top" class="box-muted mt-1">
                            <div class="flex justify-between">
                                <span is-="badge" variant-="background0"><span class="font-nerd mr-2">&#xf0cc3;</span>Grain</span>
                                <span is-="badge" class="ml-auto" variant-="background0">{{ grain[0] }}</span>
                            </div>
                            <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                                <Slider v-model="grain" :min="0" :max="100" />
                            </div>
                        </div>

                        <div box-="square" shear-="top" class="box-muted mt-1">
                            <div class="flex justify-between">
                                <span is-="badge" variant-="background0"><span class="font-nerd mr-2">&#xf03e2;</span>Hue</span>
                                <span is-="badge" class="ml-auto" variant-="background0">{{ hue[0] }}</span>
                            </div>
                            <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                                <Slider v-model="hue" :min="-180" :max="180" />
                            </div>
                        </div>

                        <div box-="square" shear-="top" class="box-muted mt-1">
                            <div class="flex justify-between">
                                <span is-="badge" variant-="background0"><span class="font-nerd mr-2">&#xf03e9;</span>Brightness</span>
                                <span is-="badge" class="ml-auto" variant-="background0">{{ brightness[0] }}</span>
                            </div>
                            <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                                <Slider v-model="brightness" :min="0" :max="200" />
                            </div>
                        </div>

                        <div box-="square" shear-="top" class="box-muted mt-1">
                            <div class="flex justify-between">
                                <span is-="badge" variant-="background0"><span class="font-nerd mr-2">&#xf0e39;</span>Grayscale</span>
                                <span is-="badge" class="ml-auto" variant-="background0">{{ grayscale[0] }}</span>
                            </div>
                            <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                                <Slider v-model="grayscale" :min="0" :max="100" />
                            </div>
                        </div>

                        <div box-="square" shear-="top" class="box-muted mt-1">
                            <div class="flex justify-between">
                                <span is-="badge" variant-="background0"><span class="font-nerd mr-2">&#xf0cf3;</span>Sepia</span>
                                <span is-="badge" class="ml-auto" variant-="background0">{{ sepia[0] }}</span>
                            </div>
                            <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                                <Slider v-model="sepia" :min="0" :max="100" />
                            </div>
                        </div>

                        <div box-="square" shear-="top" class="box-muted mt-1">
                            <div class="flex justify-between">
                                <span is-="badge" variant-="background0"><span class="font-nerd mr-2">&#xf0cfe;</span>Saturate</span>
                                <span is-="badge" class="ml-auto" variant-="background0">{{ saturate[0] }}</span>
                            </div>
                            <div class="flex flex-col w-full px-2 pt-1 pb-0.5">
                                <Slider v-model="saturate" :min="0" :max="200" />
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-2 text-sm">
                        <div box-="square" shear-="top" class="box-muted z-5000 grow">
                            <div class="flex justify-between">
                                <span is-="badge" variant-="background0"><span class="font-nerd mr-2">&#xF50C;</span>Resolution</span>
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

                        <div box-="square" shear-="top" class="box-muted grow z-4900">
                            <div class="flex justify-between">
                                <span is-="badge" variant-="background0"><span class="font-nerd mr-2">&#xf1353;</span>Draw Mode</span>
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
            </div>

            <div v-if="!imageUrl" box-="square" shear-="top" class="box-muted flex flex-col p-3 pl-5 grow">
                <div class="flex justify-between">
                    <span is-="badge" variant-="background0">
                        <h1 class="text-blue"><span class="font-nerd mr-2">&#xf0e07;</span>Upload</h1>
                    </span>
                </div>

                <div class="flex flex-col p-2 grow">
                    <label v-if="!imageUrl" for="source_upload" class="cursor-pointer flex items-center justify-center border-dashed md:border border-background2 grow md:h-44 hover:bg-overlay1/20 transition-colors">
                        Click To Upload
                    </label>
                </div>
            </div>

            <div v-else class="flex flex-col">
                <div class="flex flex-col">
                    <div class="flex flex-col px-1 grow">
                        <MaskCanvas
                            :image-url="imageUrl"
                            :display-width="displayWidth"
                            :display-height="displayHeight"
                            :threshold="threshold[0]"
                            :contrast="contrast[0]"
                            :blur="blur[0]"
                            :grain="grain[0]"
                            :hue="hue[0]"
                            :brightness="brightness[0]"
                            :grayscale="grayscale[0]"
                            :sepia="sepia[0]"
                            :saturate="saturate[0]"
                            :scale-width="scaleWidth[0]"
                            :draw-mode="drawMode"
                            @output-code="setCode"
                        />
                    </div>
                </div>

                <div box-="square" shear-="top" class="box-muted overflow-hidden max-w-[100svw]">
                    <div class="flex justify-between">
                        <span is-="badge" variant-="background0">
                            <h1 class="text-yellow"><span class="font-nerd mr-2">&#xf121;</span>Code</h1>
                        </span>
                        <span is-="badge" variant-="background0" class="flex">
                            <p @click="handleCodeCopy" class="bg-foreground0 text-background0 px-2 cursor-pointer"><span class="font-nerd mr-2 text-sm">&#xf4bb;</span>Copy</p>
                        </span>
                    </div>

                    <div v-if="outputCode" class="flex flex-col p-2 overflow-auto">
                        <code class="language-c p-2 md:p-6 whitespace-pre" v-highlight>
                            {{ outputCode }}
                        </code>
                    </div>

                    <div v-else class="flex p-3 pl-5">
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


const colorMode = useColorMode()
const toggleTheme = () => colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'

/* ------------------ existing state ------------------------------------- */
const imageUrl           = ref<string | null>(null)
const outputCode         = ref<string>('')
const threshold          = ref<number[]>([50])
const contrast           = ref<number[]>([100])
const blur       = ref<number[]>([0])
const grain      = ref<number[]>([0])
const hue        = ref<number[]>([0])
const brightness = ref<number[]>([100])
const grayscale  = ref<number[]>([0])
const sepia      = ref<number[]>([0])
const saturate   = ref<number[]>([100])

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
