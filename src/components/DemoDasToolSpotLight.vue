<script setup lang="ts">
import { onViewerSessionLeave } from '../utils/onViewerSessionLeave'
import { ref, watch } from 'vue'
import { DasToolSpotLight } from './lib/Tool/DasToolSpotLight.js'
import { Weather } from './lib/Scene/Weather.js'
import { useLightDemoShowModel } from '../utils/useLightDemoShowModel'

useLightDemoShowModel()

// 工具实例
const spotLightTool = new DasToolSpotLight()

// 工具状态
const isToolActive = ref(false)

// 时间值（0-100映射到0:00-23:59，83约为20:00）
const timeValue = ref(83)

// 灯光参数
const lightParams = ref({
  intensity: 5000,
  color: { r: 1, g: 1, b: 1, a: 1 },
  distance: 5000,
  radius: 30
})

// 时间值转显示字符串
const formatTime = (val: number): string => {
  const totalMinutes = Math.floor(val / 100 * 1439)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`
}

// 启动工具
const startTool = async () => {
  try {
    await spotLightTool.setToCurrent()
    isToolActive.value = true
    // 自动设置为晚上
    await Weather.SetTimeOfDay(formatTime(timeValue.value))
    console.log('聚光灯工具已启动，时间设置为:', formatTime(timeValue.value))
  } catch (error) {
    console.error('启动聚光灯工具失败:', error)
  }
}

// 停止工具
const stopTool = async () => {
  try {
    await spotLightTool.finishTool()
    isToolActive.value = false
    console.log('聚光灯工具已停止')
  } catch (error) {
    console.error('停止聚光灯工具失败:', error)
  }
}

// 时间变化监听
watch(timeValue, (val) => {
  if (isToolActive.value) {
    Weather.SetTimeOfDay(formatTime(val))
  }
})

// 更新亮度
const updateIntensity = async () => {
  if (!isToolActive.value) return
  try {
    await spotLightTool.setLightIntensity(lightParams.value.intensity)
  } catch (error) {
    console.error('更新亮度失败:', error)
  }
}

// 更新颜色
const updateColor = async () => {
  if (!isToolActive.value) return
  try {
    await spotLightTool.setLightColor({ ...lightParams.value.color })
  } catch (error) {
    console.error('更新颜色失败:', error)
  }
}

// 更新距离
const updateDistance = async () => {
  if (!isToolActive.value) return
  try {
    await spotLightTool.setLightDistance(lightParams.value.distance)
  } catch (error) {
    console.error('更新距离失败:', error)
  }
}

// 更新半径
const updateRadius = async () => {
  if (!isToolActive.value) return
  try {
    await spotLightTool.setLightRadius(lightParams.value.radius)
  } catch (error) {
    console.error('更新半径失败:', error)
  }
}

// 亮度变化监听
watch(() => lightParams.value.intensity, updateIntensity)

// 距离变化监听
watch(() => lightParams.value.distance, updateDistance)

// 半径变化监听
watch(() => lightParams.value.radius, updateRadius)
onViewerSessionLeave(() => {
  if (isToolActive.value) return spotLightTool.finishTool()
})
</script>

<template>
  <div>
    <div class="title">聚光灯工具控制</div>
    <div class="split_line"></div>

    <!-- 工具控制区 -->
    <div class="control-group">
      <h4 class="section-title">工具控制</h4>
      <el-button
        :type="isToolActive ? 'danger' : 'primary'"
        @click="isToolActive ? stopTool() : startTool()"
        size="small">
        {{ isToolActive ? '停止工具' : '启动工具' }}
      </el-button>
      <span class="step-status" v-if="isToolActive">✓ 工具已激活</span>
    </div>

    <!-- 时间设置区 -->
    <div class="control-group">
      <h4 class="section-title">时间设置</h4>
      <el-form-item :label="formatTime(timeValue)" class="ruihua">
        <el-slider
          v-model="timeValue"
          :min="0"
          :max="100"
          :step="1"
          :disabled="!isToolActive"
          style="width: 280px;" />
      </el-form-item>
    </div>

    <!-- 灯光参数控制区 -->
    <div class="control-group">
      <h4 class="section-title">灯光参数</h4>

      <!-- 亮度 -->
      <el-form-item label="亮度 (Lumen)" class="ruihua">
        <el-slider
          v-model="lightParams.intensity"
          :min="0"
          :max="10000"
          :step="100"
          :disabled="!isToolActive"
          style="width: 280px;" />
        <span class="param-value">{{ lightParams.intensity }}</span>
      </el-form-item>

      <!-- 颜色 R -->
      <el-form-item label="R" class="ruihua">
        <el-slider
          v-model="lightParams.color.r"
          :min="0"
          :max="1"
          :step="0.01"
          :disabled="!isToolActive"
          style="width: 280px;"
          @change="updateColor" />
      </el-form-item>

      <!-- 颜色 G -->
      <el-form-item label="G" class="ruihua">
        <el-slider
          v-model="lightParams.color.g"
          :min="0"
          :max="1"
          :step="0.01"
          :disabled="!isToolActive"
          style="width: 280px;"
          @change="updateColor" />
      </el-form-item>

      <!-- 颜色 B -->
      <el-form-item label="B" class="ruihua">
        <el-slider
          v-model="lightParams.color.b"
          :min="0"
          :max="1"
          :step="0.01"
          :disabled="!isToolActive"
          style="width: 280px;"
          @change="updateColor" />
      </el-form-item>

      <!-- 颜色预览 -->
      <div
        class="color-preview"
        :style="{
          background: `rgb(${lightParams.color.r * 255},${lightParams.color.g * 255},${lightParams.color.b * 255})`
        }">
      </div>

      <!-- 距离 -->
      <el-form-item label="距离 (cm)" class="ruihua" style="margin-top: 15px;">
        <el-input-number
          v-model="lightParams.distance"
          :min="100"
          :max="50000"
          :step="100"
          :disabled="!isToolActive"
          style="width: 150px;" />
      </el-form-item>

      <!-- 半径 -->
      <el-form-item label="半径 (度)" class="ruihua">
        <el-input-number
          v-model="lightParams.radius"
          :min="1"
          :max="90"
          :step="1"
          :disabled="!isToolActive"
          style="width: 150px;" />
      </el-form-item>
    </div>

    <!-- 状态显示区 -->
    <div class="status-panel" :class="{ 'active': isToolActive }">
      <p>当前状态: {{ isToolActive ? '工具已激活' : '工具未激活' }}</p>
      <p v-if="isToolActive">当前时间: {{ formatTime(timeValue) }}</p>
      <p v-if="isToolActive">亮度: {{ lightParams.intensity }} Lumen</p>
      <p v-if="isToolActive">距离: {{ lightParams.distance }} cm</p>
      <p v-if="isToolActive">半径: {{ lightParams.radius }}°</p>
      <p v-if="isToolActive" class="hint">💡 在场景中移动鼠标查看聚光灯效果</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group {
  margin: 15px 0;
  padding: 15px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
}

.section-title {
  color: #E1BB82;
  margin: 0 0 15px 0;
  font-size: 16px;
  border-bottom: 1px solid #E1BB82;
  padding-bottom: 5px;
}

.step-status {
  color: #67C23A;
  font-size: 14px;
  margin-left: 10px;
}

.param-value {
  color: #E1BB82;
  font-size: 14px;
  margin-left: 10px;
}

.color-preview {
  width: 280px;
  height: 30px;
  border-radius: 4px;
  margin-top: 8px;
  border: 1px solid rgba(225, 187, 130, 0.3);
}

.status-panel {
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.1);
  color: #e1bb82;

  &.active {
    background: rgba(225, 187, 130, 0.2);
  }

  p {
    margin: 5px 0;
  }

  .hint {
    color: rgba(225, 187, 130, 0.8);
    font-style: italic;
    margin-top: 10px;
  }
}
</style>
