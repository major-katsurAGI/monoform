<script setup lang="ts">
import { saveAs } from 'file-saver'

const props = defineProps<{
  bytes: Uint8Array
  png: Blob
  width: number
  height: number
}>()

function copyCArray() {
  const cArr = Array.from(props.bytes).map(b =>
    '0x' + b.toString(16).padStart(2, '0'),
  )
  const text = `const uint8_t oledBitmap[${props.bytes.length}] = {\n  ${cArr.join(
    ', ',
  )}\n};`
  navigator.clipboard.writeText(text)
}

function downloadPng() {
  saveAs(props.png, 'oled-preview.png')
}
</script>

<template>
  <div class="tui-box tui-border p-1 mt-1">
    <h3 class="tui-text tui-bold mb-1">Output</h3>

    <textarea
      class="tui-textarea"
      :value="props.bytes.join(',')"
      rows="4"
      readonly
    />

    <div class="mt-1 flex gap-1">
      <button class="tui-button" @click="copyCArray">Copy C array</button>
      <button class="tui-button" @click="downloadPng">Download PNG</button>
    </div>
  </div>
</template>
