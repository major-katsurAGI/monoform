<template>
    <div class="flex flex-col mx-auto max-w-[1400px] min-h-[100svh]">
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

                    <div box-="square" shear-="top" class="box-muted">
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
                                <input v-model="displayWidth" type="text" class="w-auto min-w-0">
                                x
                                <input v-model="displayHeight" type="text" class="w-auto min-w-0">
                            </div>
                        </div>
                    </div>

                    <div class="flex px-2 mt-auto">
                        <button class="w-full cursor-pointer">Generate</button>
                    </div>
                </div>
            </div>

            <div box-="square" shear-="top" class="box-muted">
                <div class="flex justify-between">
                    <span is-="badge" variant-="background0">
                        <h1>Output</h1>
                    </span>
                </div>

                <div class="flex px-1">

                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { resolutionPresets } from '@/constants/resolutions'
import type { ResolutionType } from '@/constants/resolutions'

const imageUrl = ref<string | null>(null)
const threshold = ref<number[]>([50])
const contrast = ref<number[]>([100])
const resolutionMode = ref<'preset' | 'custom'>('preset')
const selectedResolution = ref<ResolutionType>(resolutionPresets[0])

const displayWidth = ref<number>(resolutionPresets[0].w)
const displayHeight = ref<number>(resolutionPresets[0].h)

const setResolution = (resolution: ResolutionType) => {
    selectedResolution.value = resolution
    resolutionMode.value = 'preset'
}

function onFileChange(e: Event) {
    const files = (e.target as HTMLInputElement).files
    if (!files || !files[0]) return

    if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
    imageUrl.value = URL.createObjectURL(files[0])
}
</script>
