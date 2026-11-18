<script setup lang="ts">
import { ref, watch } from 'vue'
import { Weather } from "./lib/Scene/Weather.js"

// 定义表单数据
const form = ref({ 
  timeOfDay: 37.5,       // 时间设置，默认值
  sunAngle: 50,          // 太阳角度
  sunIntensity: 50,      // 太阳强度
  useRealLight: false,   // 真实时区光照
  expHeightFog: false,   // 指数高度雾
  volumeFog: false,      // 体积雾
  fogIntensity: 3,      // 雾强度
  weatherType: "晴",     // 天气类型
  rainIntensity: 2000,      // 雨强度
  snowIntensity: 2000,      // 雪强度
  thunderIntensity: 0,   // 雷强度
  windDirection: 0,      // 风向
  windIntensity: 0,      // 风强度
  cloudIntensity: 0,     // 云层强度
  snowOverlapIntensity: 1, // 雪覆盖强度
  season: 0,            // 季节：0-春天, 1-夏天, 2-秋天, 3-冬天
  moonScale: 50,        // 月亮大小
  moonLightIntensity: 50, // 月光强度
  moonLightColor: '#FFFFFF', // 月光颜色
  starIntensity: 50     // 星星强度
})

// 天气类型选项
const weatherOptions = [
  { value: '晴', label: '☀️ 晴' },
  { value: '多云', label: '⛅ 多云' },
  { value: '雾', label: '🌫️ 雾' },
  { value: '雨', label: '🌧️ 雨' },
  { value: '雪', label: '❄️ 雪' },
  { value: '雷雨', label: '⛈️ 雷雨' }
]

// 季节选项
const seasonOptions = [
  { value: 0, label: '🌸 春天' },
  { value: 1, label: '☀️ 夏天' },
  { value: 2, label: '🍂 秋天' },
  { value: 3, label: '❄️ 冬天' }
]

// 监听时间设置变化
watch(() => form.value.timeOfDay, (newValue) => {
  const timeString = setTimeLabel(newValue)
  Weather.SetTimeOfDay(timeString)
  console.log('设置时间:', timeString)
})

// 监听太阳角度变化
watch(() => form.value.sunAngle, (newValue) => {
  const angle = newValue / 100 * 360
  Weather.SetSunAngle(angle)
  console.log('设置太阳角度:', angle)
})

// 监听太阳强度变化
watch(() => form.value.sunIntensity, (newValue) => {
  const intensity = 4 + newValue * 0.06
  Weather.SetSunIntensity(intensity)
  console.log('设置太阳强度:', intensity)
})

// 监听真实光照变化
watch(() => form.value.useRealLight, (newValue) => {
  console.log('设置真实时区光照:', newValue)
})

// 监听指数高度雾变化
watch(() => form.value.expHeightFog, (newValue) => {
  console.log('设置指数高度雾:', newValue)
})

// 监听体积雾变化
watch(() => form.value.volumeFog, (newValue) => {
  console.log('设置体积雾:', newValue)
})

// 监听雾强度变化
watch(() => form.value.fogIntensity, (newValue) => {
  Weather.SetControlFogIntensity(newValue)
  console.log('设置雾强度:', newValue)
})

// 监听天气类型变化
watch(() => form.value.weatherType, (newValue) => {
  Weather.SetWeatherType(newValue)
  console.log('设置天气类型:', newValue)
})

// 监听雨强度变化
watch(() => form.value.rainIntensity, (newValue) => {
  Weather.SetControlRainIntensity(newValue)
  console.log('设置雨强度:', newValue)
})

// 监听雪强度变化
watch(() => form.value.snowIntensity, (newValue) => {
  Weather.SetControlSnowIntensity(newValue)
  console.log('设置雪强度:', newValue)
})

// 监听雷强度变化
watch(() => form.value.thunderIntensity, (newValue) => {
  Weather.SetControlThunderIntensity(newValue)
  console.log('设置雷强度:', newValue)
})

// 监听风向变化
watch(() => form.value.windDirection, (newValue) => {
  const direction = newValue / 100 * 360
  Weather.SetWindDirection(direction)
  console.log('设置风向:', direction)
})

// 监听风强度变化
watch(() => form.value.windIntensity, (newValue) => {
  const intensity = newValue / 100 * 5
  Weather.SetWindIntensity(intensity)
  console.log('设置风强度:', intensity)
})

// 监听云层强度变化
watch(() => form.value.cloudIntensity, (newValue) => {
  const intensity = newValue / 100 * 10
  Weather.SetControlCloudIntensity(intensity)
  console.log('设置云层强度:', intensity)
})

// 监听雪覆盖强度变化
watch(() => form.value.snowOverlapIntensity, (newValue) => {
  const intensity = newValue / 100 * 1
  Weather.SetControlSnowOverlapIntensity(intensity)
  console.log('设置雪覆盖强度:', intensity)
})

// 监听季节变化
watch(() => form.value.season, (newValue) => {
  Weather.SetSeason(newValue)
  console.log('设置季节:', newValue)
})

// 监听月亮大小变化
watch(() => form.value.moonScale, (newValue) => {
  const scale = newValue / 100 * 10
  Weather.SetMoonSacle(scale)
  console.log('设置月亮大小:', scale)
})

// 监听月光强度变化
watch(() => form.value.moonLightIntensity, (newValue) => {
  const intensity = newValue / 100 * 10
  Weather.SetMoonLightIntensity(intensity)
  console.log('设置月光强度:', intensity)
})

// 监听月光颜色变化
watch(() => form.value.moonLightColor, (newValue) => {
  //"rgba(255, 255, 255, 1)"
  const color1= newValue.replace('rgba(', '').replace(')', '').split(',')
  const color = {
    r: color1[0] * 1.0 / 255,
    g: color1[1] * 1.0 / 255,
    b: color1[2] * 1.0 / 255,
    a: color1[3]
  }
  // 调试输出，查看颜色格式
  console.log('原始颜色值:', newValue)
  console.log('转换后颜色对象:', color)
  console.log('颜色对象JSON:', JSON.stringify(color))
  Weather.SetMoonLightColor(color)
  console.log('设置月光颜色完成')
})

// 监听星星强度变化
watch(() => form.value.starIntensity, (newValue) => {
  const intensity = newValue / 100 * 10
  Weather.SetStarIntensity(intensity)
  console.log('设置星星强度:', intensity)
})

// 时间格式设置 - 返回HH:MM格式的24小时制时间
const setTimeLabel = (value: number): string => {
  const totalMinutes = Math.floor(value / 100 * 1439)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`
}

// 将十六进制颜色转换为 RGBA 对象
const hexToRGBA = (hex: string) => {
  // 处理带透明度的8位十六进制颜色
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex)
  if (result) {
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
      a: result[4] ? parseInt(result[4], 16) / 255 : 1.0
    }
  }
  
  // 处理3位或4位简写形式
  result = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i.exec(hex)
  if (result) {
    return {
      r: parseInt(result[1] + result[1], 16) / 255,
      g: parseInt(result[2] + result[2], 16) / 255,
      b: parseInt(result[3] + result[3], 16) / 255,
      a: result[4] ? parseInt(result[4] + result[4], 16) / 255 : 1.0
    }
  }
  
  // 默认返回白色
  return { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }
}

</script>

<template>
  <div class="weather-demo">
    <div class="demo-header">
      <h3>天气设置</h3>
      <div class="header-line"></div>
    </div>

    <div class="demo-content">
      <!-- 时间和光照控制 -->
      <div class="control-section">
        <h4>🌅 时间和光照</h4>
        <div class="control-grid">
          <div class="slider-group">
            <div class="slider-label">时间设置</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.timeOfDay" 
                :format-tooltip="(value: number) => setTimeLabel(value)" 
                :marks="{ 0: '0:00', 50: '12:00', 100: '23:59' }"
                :show-stops="false"
              />
            </div>
          </div>

          <div class="slider-group">
            <div class="slider-label">太阳角度</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.sunAngle" 
                :format-tooltip="(value: number) => parseFloat((value / 100 * 360).toFixed(1)) + '°'"
                :marks="{ 0: '0°', 50: '180°', 100: '360°' }"
                :show-stops="false"
              />
            </div>
          </div>

          <div class="slider-group">
            <div class="slider-label">太阳强度</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.sunIntensity" 
                :format-tooltip="(value: number) => parseFloat((4 + value * 0.06).toFixed(1))"
                :marks="{ 0: '4.0', 50: '7.0', 100: '10.0' }"
                :show-stops="false"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 天气类型控制 -->
      <div class="control-section">
        <h4>🌤️ 天气类型</h4>
        <div class="weather-selector">
          <el-select v-model="form.weatherType" placeholder="选择天气类型" class="weather-select">
            <el-option 
              v-for="option in weatherOptions" 
              :key="option.value" 
              :value="option.value" 
              :label="option.label"
            />
          </el-select>
        </div>
      </div>

      <!-- 季节控制 -->
      <div class="control-section">
        <h4>🌱 季节设置</h4>
        <div class="weather-selector">
          <el-select v-model="form.season" placeholder="选择季节" class="weather-select">
            <el-option 
              v-for="option in seasonOptions" 
              :key="option.value" 
              :value="option.value" 
              :label="option.label"
            />
          </el-select>
        </div>
      </div>

      <!-- 风力控制 -->
      <div class="control-section">
        <h4>💨 风力控制</h4>
        <div class="control-grid">
          <div class="slider-group">
            <div class="slider-label">风向</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.windDirection" 
                :format-tooltip="(value: number) => parseFloat((value / 100 * 360).toFixed(1)) + '°'"
                :marks="{ 0: '北', 25: '东', 50: '南', 75: '西', 100: '北' }"
                :show-stops="false"
              />
            </div>
          </div>

          <div class="slider-group">
            <div class="slider-label">风强度</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.windIntensity" 
                :format-tooltip="(value: number) => parseFloat((value / 100 * 5).toFixed(1))"
                :marks="{ 0: '0', 50: '2.5', 100: '5.0' }"
                :show-stops="false"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 云层和雾效 -->
      <div class="control-section">
        <h4>☁️ 云层和雾效</h4>
        <div class="control-grid">
          <div class="slider-group">
            <div class="slider-label">云层强度</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.cloudIntensity" 
                :format-tooltip="(value: number) => parseFloat((value / 100 * 10).toFixed(1))"
                :marks="{ 0: '0', 50: '5.0', 100: '10.0' }"
                :show-stops="false"
              />
            </div>
          </div>

          <div class="slider-group">
            <div class="slider-label">雾强度</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.fogIntensity" 
                :min="0" 
                :max="10" 
                :step="1"
                :marks="{ 0: '无', 5: '中', 10: '浓' }"
                :show-stops="true"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 降水控制 -->
      <div class="control-section" v-if="['雨', '雪', '雷雨'].includes(form.weatherType)">
        <h4 v-if="form.weatherType === '雨' || form.weatherType === '雷雨'">🌧️ 降雨控制</h4>
        <h4 v-if="form.weatherType === '雪'">❄️ 降雪控制</h4>
        
        <div class="control-grid">
          <div class="slider-group" v-if="form.weatherType === '雨' || form.weatherType === '雷雨'">
            <div class="slider-label">雨强度</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.rainIntensity" 
                :min="1000" 
                :max="50000" 
                :step="100"
                :format-tooltip="(value: number) => value.toString()"
                :marks="{ 1000: '小雨', 25000: '中雨', 50000: '暴雨' }"
                :show-stops="false"
              />
            </div>
          </div>

          <div class="slider-group" v-if="form.weatherType === '雪'">
            <div class="slider-label">雪强度</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.snowIntensity" 
                :min="1000" 
                :max="50000" 
                :step="100"
                :format-tooltip="(value: number) => value.toString()"
                :marks="{ 1000: '小雪', 25000: '中雪', 50000: '暴雪' }"
                :show-stops="false"
              />
            </div>
          </div>

          <div class="slider-group" v-if="form.weatherType === '雪'">
            <div class="slider-label">雪覆盖强度</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.snowOverlapIntensity" 
                :format-tooltip="(value: number) => parseFloat((value / 100 * 1).toFixed(2))"
                :marks="{ 0: '0', 50: '0.5', 100: '1.0' }"
                :show-stops="false"
              />
            </div>
          </div>

          <div class="slider-group" v-if="form.weatherType === '雷雨'">
            <div class="slider-label">雷强度</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.thunderIntensity" 
                :min="0" 
                :max="20" 
                :step="1"
                :marks="{ 0: '无', 10: '中', 20: '强' }"
                :show-stops="true"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 夜空控制 -->
      <div class="control-section">
        <h4>🌙 夜空设置</h4>
        <div class="control-grid">
          <div class="slider-group">
            <div class="slider-label">月亮大小</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.moonScale" 
                :format-tooltip="(value: number) => parseFloat((value / 100 * 10).toFixed(1))"
                :marks="{ 0: '0', 50: '5.0', 100: '10.0' }"
                :show-stops="false"
              />
            </div>
          </div>

          <div class="slider-group">
            <div class="slider-label">月光强度</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.moonLightIntensity" 
                :format-tooltip="(value: number) => parseFloat((value / 100 * 10).toFixed(1))"
                :marks="{ 0: '0', 50: '5.0', 100: '10.0' }"
                :show-stops="false"
              />
            </div>
          </div>

          <div class="slider-group">
            <div class="slider-label">月光颜色</div>
            <div style="display: flex; align-items: center; padding: 0 12px;">
              <el-color-picker 
                v-model="form.moonLightColor"
                show-alpha
                size="large">
              </el-color-picker>
              <span style="margin-left: 10px; color: #ffffff; font-size: 12px;">{{ form.moonLightColor }}</span>
            </div>
          </div>

          <div class="slider-group">
            <div class="slider-label">星星强度</div>
            <div class="slider-container">
              <el-slider 
                v-model="form.starIntensity" 
                :format-tooltip="(value: number) => parseFloat((value / 100 * 10).toFixed(1))"
                :marks="{ 0: '0', 50: '5.0', 100: '10.0' }"
                :show-stops="false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.weather-demo {
  width: 100%;
  height: 100%;
  padding: 0;
}

.demo-header {
  margin-bottom: 24px;
  text-align: center;

  h3 {
    color: #E1BB82;
    font-family: "Source Han Serif CN";
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 12px;
  }
}

.header-line {
  height: 2px;
  width: 120px;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, #E1BB82, transparent);
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-section {
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 8px;
  padding: 16px;

  h4 {
    color: #E1BB82;
    font-family: "Source Han Sans CN";
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    display: flex;
    align-items: center;

    &::before {
      content: '';
      width: 4px;
      height: 16px;
      background: #E1BB82;
      margin-right: 8px;
      border-radius: 2px;
    }
  }
}

.control-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slider-group {
  .slider-label {
    color: #ffffff;
    font-family: "Source Han Sans CN";
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }

  .slider-container {
    padding: 0 12px;
  }
}

.weather-selector {
  .weather-select {
    width: 100%;
    max-width: 200px;
  }
}

// Element Plus 滑块样式覆盖
:deep(.el-slider) {
  .el-slider__runway {
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(225, 187, 130, 0.2);
    height: 6px;
  }

  .el-slider__bar {
    background: linear-gradient(90deg, rgba(225, 187, 130, 0.8), #E1BB82);
    height: 6px;
  }

  .el-slider__button {
    width: 16px;
    height: 16px;
    background: #E1BB82;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(225, 187, 130, 0.3);

    &:hover {
      transform: scale(1.1);
    }
  }

  .el-slider__stop {
    background-color: rgba(225, 187, 130, 0.6);
    width: 4px;
    height: 4px;
    border-radius: 50%;
  }

  .el-slider__marks-text {
    color: rgba(255, 255, 255, 0.7);
    font-family: "Source Han Sans CN";
    font-size: 11px;
  }
}

// Element Plus 选择器样式覆盖
:deep(.el-select) {
  .el-select__wrapper {
    background-color: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(225, 187, 130, 0.3);
    border-radius: 6px;

    &:hover {
      border-color: rgba(225, 187, 130, 0.6);
    }

    &.is-focused {
      border-color: #E1BB82;
      box-shadow: 0 0 0 2px rgba(225, 187, 130, 0.2);
    }
  }

  .el-select__selected-item {
    color: #ffffff;
    font-family: "Source Han Sans CN";
  }

  .el-select__placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .el-select__caret {
    color: rgba(225, 187, 130, 0.8);
  }
}

:deep(.el-select-dropdown) {
  background-color: rgba(33, 32, 29, 0.95);
  border: 1px solid rgba(225, 187, 130, 0.3);
  backdrop-filter: blur(8px);

  .el-select-dropdown__item {
    color: #ffffff;
    font-family: "Source Han Sans CN";

    &:hover {
      background-color: rgba(225, 187, 130, 0.1);
    }

    &.is-selected {
      background-color: rgba(225, 187, 130, 0.2);
      color: #E1BB82;
    }
  }
}

// Element Plus 颜色选择器样式覆盖
:deep(.el-color-picker) {
  .el-color-picker__trigger {
    width: 60px;
    height: 36px;
    border: 1px solid rgba(225, 187, 130, 0.3);
    border-radius: 6px;

    &:hover {
      border-color: rgba(225, 187, 130, 0.6);
    }
  }
}
</style> 