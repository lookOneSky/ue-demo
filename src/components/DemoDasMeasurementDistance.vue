<script setup lang="ts">
import { onViewerSessionLeave } from '../utils/onViewerSessionLeave'
import { requestUE } from '../utils/demoRpc.js'
import { ref, reactive } from 'vue'
import { DasToolMeasurementDistance } from './lib/Tool/DasToolMeasurementDistance.js'

const tool = new DasToolMeasurementDistance()
const isToolActive = ref(false)
const pointsList = ref<any[]>([])

// 颜色项（通用 + 距离专有）
const colorOptions = [
  { label: '普通点', key: 'normalPointColor' },
  { label: '悬停点', key: 'hoverPointColor' },
  { label: '标签文字', key: 'labelTextColor' },
  { label: '路径线', key: 'pathLineColor' },
  { label: '平距线', key: 'horizontalLineColor' },
  { label: '高差线', key: 'verticalLineColor' },
  { label: '距离标签背景', key: 'distanceLabelBackgroundColor' },
  { label: '平距标签背景', key: 'horizontalLabelBackgroundColor' },
  { label: '高差标签背景', key: 'heightDiffLabelBackgroundColor' }
]
const colors = reactive<Record<string, string>>({})

// rgba字符串转[r,g,b,a]（0-1）
const rgbaToArray = (rgba: string) => {
  const [r, g, b, a = 1] = (rgba.match(/[\d.]+/g) || []).map(Number)
  return [r / 255, g / 255, b / 255, a]
}

// [r,g,b,a]（0-1）转rgba字符串
const arrayToRgba = (c: number[]) =>
  `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${c[3] ?? 1})`

const startTool = async () => {
  await requestUE(tool.className, 'setToCurrent')
  isToolActive.value = true
}

const getPoints = async () => {
  await tool.getPointsLLH((result: any) => {
    pointsList.value = result?.measurementPointsLLH || []
    isToolActive.value = false
  })
}

const clearPoints = async () => {
  await requestUE(tool.className, 'clearAllPoints')
  pointsList.value = []
  isToolActive.value = false
}

// 设置单个颜色
const setColor = async (key: string) => {
  if (!colors[key]) return
  await requestUE(tool.className, 'setColors', { [key]: rgbaToArray(colors[key]) })
}

// 从UE读取全部颜色
const loadColors = async () => {
  await tool.getColors((result: any) => {
    colorOptions.forEach(o => { if (result?.[o.key]) colors[o.key] = arrayToRgba(result[o.key]) })
  })
}
onViewerSessionLeave(() => {
  if (isToolActive.value) return requestUE(tool.className, 'finishTool')
})
</script>

<template>
  <div>
    <div class="title">距离测量</div>
    <div class="split_line"></div>

    <div class="control-group">
      <el-button
        :type="isToolActive ? 'info' : 'primary'"
        @click="startTool"
        :disabled="isToolActive"
        style="margin: 10px;">
        {{ isToolActive ? '测量中（双击结束）' : '激活工具' }}
      </el-button>
      <el-button type="success" @click="getPoints" style="margin: 10px;">获取测量结果</el-button>
      <el-button type="warning" @click="clearPoints" style="margin: 10px;">清空</el-button>
    </div>

    <div class="status-panel" :class="{ active: isToolActive }">
      <p>状态：{{ isToolActive ? '测量中，单击添加点，双击结束' : '未激活' }}</p>
      <p v-if="pointsList.length > 0">测量点数：{{ pointsList.length }}</p>
    </div>

    <div v-if="pointsList.length > 0" class="points-panel">
      <p>测量点列表：</p>
      <div v-for="(pt, i) in pointsList" :key="i" class="point-item">
        <span>{{ i + 1 }}. 经：{{ pt.longitude.toFixed(6) }}  纬：{{ pt.latitude.toFixed(6) }}  高：{{ pt.height.toFixed(2) }}</span>
      </div>
    </div>

    <div class="style-panel">
      <p>样式设置：</p>
      <el-form-item v-for="o in colorOptions" :key="o.key" :label="o.label">
        <el-color-picker v-model="colors[o.key]" show-alpha color-format="rgb" @change="setColor(o.key)"></el-color-picker>
      </el-form-item>
      <el-button size="small" @click="loadColors">读取当前颜色</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group {
  margin: 15px 0;
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
}

.points-panel {
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
  color: #e1bb82;
  max-height: 200px;
  overflow-y: auto;

  .point-item {
    font-size: 12px;
    margin: 4px 0;
  }
}

.style-panel {
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.1);
  color: #e1bb82;
}
</style>
