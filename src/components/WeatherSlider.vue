<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{ label: string }>()
const value = defineModel<number>({ required: true })
</script>

<template>
  <div class="weather-slider">
    <span class="slider-label">{{ label }}</span>
    <el-slider v-model="value" v-bind="$attrs" :aria-label="label" />
  </div>
</template>

<style scoped>
.weather-slider { padding: 0 12px 20px; }
.weather-slider + .weather-slider { margin-top: 10px; }
</style>
