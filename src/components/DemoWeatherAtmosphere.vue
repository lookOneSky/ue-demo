<script setup>
import { watch } from 'vue'
import { Weather } from './lib/Scene/Weather.js'
import { weatherForm as form } from './weatherForm'
import WeatherSlider from './WeatherSlider.vue'

watch(() => form.windDirection, value => {
  Weather.SetWindDirection(value / 100 * 360).catch(console.error)
})
watch(() => form.windIntensity, value => {
  Weather.SetWindIntensity(value / 100 * 5).catch(console.error)
})
watch(() => form.cloudIntensity, value => {
  Weather.SetControlCloudIntensity(value / 100 * 10).catch(console.error)
})
watch(() => form.fogIntensity, value => {
  Weather.SetControlFogIntensity(value).catch(console.error)
})
</script>

<template>
  <div>
    <section class="control-section">
      <h4>风场</h4>
      <WeatherSlider v-model="form.windDirection" label="风向"
        :format-tooltip="value => Number((value / 100 * 360).toFixed(1)) + '°'"
        :marks="{ 0: '北', 25: '东', 50: '南', 75: '西', 100: '北' }" />
      <WeatherSlider v-model="form.windIntensity" label="风强度"
        :format-tooltip="value => Number((value / 100 * 5).toFixed(1))" :marks="{ 0: '0', 50: '2.5', 100: '5.0' }" />
    </section>
    <section class="control-section">
      <h4>云雾</h4>
      <WeatherSlider v-model="form.cloudIntensity" label="云层强度"
        :format-tooltip="value => value / 10" :marks="{ 0: '0', 50: '5.0', 100: '10.0' }" />
      <WeatherSlider v-model="form.fogIntensity" label="雾强度"
        :max="10" :marks="{ 0: '无', 5: '中', 10: '浓' }" show-stops />
    </section>
  </div>
</template>
