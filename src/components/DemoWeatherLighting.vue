<script setup>
import { watch } from 'vue'
import { Weather } from './lib/Scene/Weather.js'
import { requestUE } from '../utils/demoRpc.js'
import { weatherForm as form } from './weatherForm'
import WeatherSlider from './WeatherSlider.vue'

function formatTime(value) {
  const minutes = Math.min(1439, Math.round(value / 100 * 1440))
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
  return hours + ':' + String(minutes % 60).padStart(2, '0')
}

watch(() => form.timeOfDay, value => {
  requestUE(Weather.className, 'SetTimeOfDay', { timeOfDay: formatTime(value) }).catch(console.error)
})
watch(() => form.sunAngle, value => {
  requestUE(Weather.className, 'SetSunAngle', { angle: value / 100 * 360 }).catch(console.error)
})
watch(() => form.sunIntensity, value => {
  requestUE(Weather.className, 'SetSunIntensity', { intensity: 4 + value * 0.06 }).catch(console.error)
})
watch(() => form.moonScale, value => {
  Weather.SetMoonSacle(value / 100 * 10).catch(console.error)
})
watch(() => form.moonLightIntensity, value => {
  Weather.SetMoonLightIntensity(value / 100 * 10).catch(console.error)
})
watch(() => form.starIntensity, value => {
  Weather.SetStarIntensity(value / 100 * 10).catch(console.error)
})
watch(() => form.moonLightColor, color => {
  const channels = color?.match(/[\d.]+/g)
  if (channels?.length !== 4) return
  const [r, g, b, a] = channels.map(Number)
  Weather.SetMoonLightColor({ r: r / 255, g: g / 255, b: b / 255, a }).catch(console.error)
})

const nightMarks = { 0: '0', 50: '5.0', 100: '10.0' }
const formatNightValue = value => value / 10
</script>

<template>
  <div>
    <section class="control-section">
      <h4>时间与日照</h4>
      <WeatherSlider v-model="form.timeOfDay" label="时间设置"
        :format-tooltip="formatTime" :marks="{ 0: '0:00', 50: '12:00', 100: '23:59' }" />
      <WeatherSlider v-model="form.sunAngle" label="太阳角度"
        :format-tooltip="value => Number((value / 100 * 360).toFixed(1)) + '°'"
        :marks="{ 0: '0°', 50: '180°', 100: '360°' }" />
      <WeatherSlider v-model="form.sunIntensity" label="太阳强度"
        :format-tooltip="value => Number((4 + value * 0.06).toFixed(1))" :marks="{ 0: '4.0', 50: '7.0', 100: '10.0' }" />
    </section>
    <section class="control-section">
      <h4>夜空</h4>
      <WeatherSlider v-model="form.moonScale" label="月亮大小" :format-tooltip="formatNightValue" :marks="nightMarks" />
      <WeatherSlider v-model="form.moonLightIntensity" label="月光强度" :format-tooltip="formatNightValue" :marks="nightMarks" />
      <WeatherSlider v-model="form.starIntensity" label="星星强度" :format-tooltip="formatNightValue" :marks="nightMarks" />
      <div class="moon-color">
        <span class="slider-label">月光颜色</span>
        <el-color-picker :model-value="form.moonLightColor" show-alpha color-format="rgb" aria-label="月光颜色"
          @update:model-value="form.moonLightColor = $event || 'rgba(255, 255, 255, 1)'" />
        <span>{{ form.moonLightColor }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.moon-color { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
</style>
