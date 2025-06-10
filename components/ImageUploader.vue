<script setup lang="ts">
const emit = defineEmits<{
  (
    e: 'loaded',
    payload: { bmp: ImageBitmap; url: string },
  ): void
}>()

async function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  /* ImageBitmap for fast worker transfer … */
  const bmp = await createImageBitmap(file)

  /* …and an Object-URL for <img>/<cropper> sources */
  const url = URL.createObjectURL(file)

  emit('loaded', { bmp, url })
}
</script>

<template>
  <div class="tui-box tui-border p-2">
    <label class="tui-text tui-bold mb-1 block">Upload image / GIF</label>
    <input type="file" accept="image/*,.gif" @change="onFile" />
  </div>
</template>
