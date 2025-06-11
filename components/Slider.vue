<template>
    <SliderRoot
        :model-value="modelValue"
        @update:model-value="v => emit('update:modelValue', v)"
        :min="min"
        :max="max"
        :step="step"
        class="relative flex w-full touch-none select-none items-center">

        <SliderTrack class="relative bg-stone-500/30 grow h-4 overflow-hidden w-full shrink-0">
            <SliderRange class="absolute bg-grass8 rounded-full h-full" />
        </SliderTrack>

        <SliderThumb class="block w-6 h-6 bg-flamingo hover:bg-stone-50 shadow-sm focus:outline-none focus:shadow-[0_0_0_2px] focus:shadow-grass9" />
    </SliderRoot>
</template>

<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'

const props = defineProps<{
  modelValue: number[]
  min?: number
  max?: number
  step?: number
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: number[]): void }>()

const bar = ref<HTMLElement>()
const min = computed(() => props.min ?? 0)
const max = computed(() => props.max ?? 100)
const step = computed(() => props.step ?? 1)
</script>
