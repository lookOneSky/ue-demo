<script setup>
import { watch } from 'vue'
import { Weather } from './lib/Scene/Weather.js'
import { requestUE } from '../utils/demoRpc.js'
import { weatherForm as form } from './weatherForm'
import WeatherSlider from './WeatherSlider.vue'

const weatherOptions = ['晴', '多云', '雾', '雨', '雪', '雷雨']
const seasonOptions = ['春天', '夏天', '秋天', '冬天']

watch(() => form.weatherType, type => {
  requestUE(Weather.className, 'SetWeatherType', { weatherType: type }).catch(console.error)
})
watch(() => form.season, season => {
  Weather.SetSeason(season).catch(console.error)
})
watch(() => form.rainIntensity, value => {
  requestUE(Weather.className, 'SetControlRainIntensity', { intensity: value }).catch(console.error)
})
watch(() => form.snowIntensity, value => {
  Weather.SetControlSnowIntensity(value).catch(console.error)
})
watch(() => form.snowOverlapIntensity, value => {
  Weather.SetControlSnowOverlapIntensity(value / 100).catch(console.error)
})
watch(() => form.thunderIntensity, value => {
  Weather.SetControlThunderIntensity(value).catch(console.error)
})
</script>

<template>
  <div>
    <el-form label-position="top">
      <el-form-item label="天气类型">
        <el-select v-model="form.weatherType">
          <el-option v-for="type in weatherOptions" :key="type" :value="type" :label="type" />
        </el-select>
      </el-form-item>
      <el-form-item label="季节">
        <el-select v-model="form.season">
          <el-option v-for="(season, index) in seasonOptions" :key="season" :value="index" :label="season" />
        </el-select>
      </el-form-item>
    </el-form>
    <section v-if="form.weatherType === '雨' || form.weatherType === '雷雨'" class="control-section">
      <h4>降雨</h4>
      <WeatherSlider v-model="form.rainIntensity" label="雨强度"
        :min="1000" :max="50000" :step="100" :marks="{ 1000: '小雨', 25000: '中雨', 50000: '暴雨' }" />
      <WeatherSlider v-if="form.weatherType === '雷雨'" v-model="form.thunderIntensity" label="雷强度"
        :max="20" :marks="{ 0: '无', 10: '中', 20: '强' }" show-stops />
    </section>
    <section v-if="form.weatherType === '雪'" class="control-section">
      <h4>降雪</h4>
      <WeatherSlider v-model="form.snowIntensity" label="雪强度"
        :min="1000" :max="50000" :step="100" :marks="{ 1000: '小雪', 25000: '中雪', 50000: '暴雪' }" />
      <WeatherSlider v-model="form.snowOverlapIntensity" label="雪覆盖强度"
        :format-tooltip="value => value / 100" :marks="{ 0: '0', 50: '0.5', 100: '1.0' }" />
    </section>
  </div>
</template>
