import { reactive } from 'vue'

// 天气面板共用同一份表单，切换示例时保留已调节的参数。
export const weatherForm = reactive({
  weatherType: '晴',
  season: 0,
  rainIntensity: 2000,
  snowIntensity: 2000,
  snowOverlapIntensity: 1,
  thunderIntensity: 0,
  windDirection: 0,
  windIntensity: 0,
  cloudIntensity: 0,
  fogIntensity: 3,
  timeOfDay: 37.5,
  sunAngle: 50,
  sunIntensity: 50,
  moonScale: 50,
  moonLightIntensity: 50,
  moonLightColor: 'rgba(255, 255, 255, 1)',
  starIntensity: 50,
})
