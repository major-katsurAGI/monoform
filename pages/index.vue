<script setup lang="ts">
import { resolutions } from '~/constants/resolutions'
const upload   = ref<{ bmp: ImageBitmap; url: string } | null>(null)
const cropped  = ref<ImageBitmap | null>(null)
const res      = ref(resolutions[0])
const threshold = ref(128)

const { bytes, pngBlob, process } = useImageProcessor()

/* called by ImageUploader */
function handleLoaded(p: { bmp: ImageBitmap; url: string }) {
  upload.value = p
}

watch([cropped, res, threshold], () => {
    if (cropped.value) process(cropped.value, res.value.w, res.value.h, threshold.value)
})
</script>

<template>
  <div class="tui-box tui-border p-2 max-w-4xl mx-auto mt-4">
    <h1 class="tui-text tui-bold mb-2">OLED Bitmap Generator</h1>

    <ImageUploader @loaded="handleLoaded" />

    <!-- resolution -->
    <div class="tui-box mt-1">
      <label class="mr-1">Resolution:</label>
      <select v-model="res" class="tui-select">
        <option v-for="r in resolutions" :key="r.label" :value="r">
          {{ r.label }}
        </option>
      </select>
    </div>

    <ThresholdSlider v-model:threshold="threshold" />

    <!-- cropper needs the URL string -->
    <CropSelector
      v-if="upload"
      :src="upload.url"
      :aspect="res.w / res.h"
      @cropped="cropped = $event"
    />

    <OutputPanel
      v-if="bytes && pngBlob"
      :bytes="bytes"
      :png="pngBlob"
      :width="res.w"
      :height="res.h"
    />
  </div>
</template>
