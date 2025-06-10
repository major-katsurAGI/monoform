<script setup lang="ts">
import { Cropper } from 'vue-advanced-cropper'

const props = defineProps<{
  src: string          // <-- string URL, NOT ImageBitmap
  aspect: number
}>()

const emit = defineEmits<{ (e: 'cropped', bmp: ImageBitmap): void }>()

const refCropper = ref<any>()

async function confirm() {
  const canvas = refCropper.value.getResult().canvas as HTMLCanvasElement
  const bmp    = await createImageBitmap(canvas)
  emit('cropped', bmp)
}
</script>

<template>
  <div class="tui-box tui-border p-2 mt-2">
    <Cropper
      ref="refCropper"
      :src="props.src"
      :stencil-aspect-ratio="props.aspect"
      class="max-w-full h-64"
    />
    <button class="tui-button mt-2" @click="confirm">Confirm crop</button>
  </div>
</template>
