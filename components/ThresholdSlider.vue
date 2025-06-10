<script setup lang="ts">
const threshold = defineModel<number>('threshold', { default: 128 })
</script>

<template>
    <div class="tui-box mt-1">
        <span class="tui-text">Threshold: {{ threshold }}</span>
        <input type="range" min="0" max="255" v-model="threshold" />
    </div>
</template>
