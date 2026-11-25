<script setup lang="ts">
import { onViewerSessionLeave } from '../utils/onViewerSessionLeave'
import { ref, reactive } from 'vue'
import { DasToolMeasurementDistanceSurface } from './lib/Tool/DasToolMeasurementDistanceSurface.js'

const tool = new DasToolMeasurementDistanceSurface() // 表面距离测量工具
const isToolActive = ref(false) // 工具是否激活
const pointsList = ref<any[]>([]) // 测量点 LLH 列表
const surfaceLoading = ref(false) // 表面测量计算中
const surfaceResult = ref<{ surfaceDistanceM: number; sampleCount: number; sampleValidCount: number } | null>(null) // 表面测量结果

// 颜色项（通用 + 表面专有）
const colorOptions = [
  { label: '普通点', key: 'normalPointColor' },
  { label: '悬停点', key: 'hoverPointColor' },
  { label: '标签文字', key: 'labelTextColor' },
  { label: '表面线', key: 'surfaceLineColor' },
  { label: '表面距离标签背景', key: 'surfaceLabelBackgroundColor' }
]
const colors = reactive<Record<string, string>>({}) // 颜色选择器的值（rgba 字符串）
const surfaceStyle = reactive({ sampleDistanceM: 0.05, showSurfaceLine: true }) // 采样间距（m）、是否显示表面线

// rgba字符串转[r,g,b,a]（0-1）
const rgbaToArray = (rgba: string) => {
  const [r, g, b, a = 1] = (rgba.match(/[\d.]+/g) || []).map(Number)
  return [r / 255, g / 255, b / 255, a]
}

// [r,g,b,a]（0-1）转rgba字符串
const arrayToRgba = (c: number[]) =>
  `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${c[3] ?? 1})`

// 激活工具，单击取点，双击结束
const startTool = async () => {
  await tool.setToCurrent(() => {
    isToolActive.value = true
  })
}

// 获取测量点
const getPoints = async () => {
  await tool.getPointsLLH((result: any) => {
    pointsList.value = result?.measurementPointsLLH || []
    isToolActive.value = false
  })
}

// 清空测量点与表面结果
const clearPoints = async () => {
  await tool.clearAllPoints(() => {
    pointsList.value = []
    isToolActive.value = false
    surfaceResult.value = null
  })
}

// 表面测量：触发计算后读取结果
const calcSurfaceDistance = async () => {
  surfaceLoading.value = true
  try {
    await tool.calcSurfaceDistance()
    await tool.getSurfaceResult((result: any) => {
      surfaceResult.value = result || null
    })
  } finally {
    surfaceLoading.value = false
  }
}

// 清空表面测量结果与描边折线
const clearSurfaceResult = async () => {
  await tool.clearSurfaceResult(() => {
    surfaceResult.value = null
  })
}

// 设置单个颜色（surfaceLineColor 和 surfaceLabelBackgroundColor 也走 setColors）
const setColor = async (key: string) => {
  if (!colors[key]) return
  await tool.setColors({ [key]: rgbaToArray(colors[key]) })
}

// 从 UE 读取颜色、采样间距和表面线显隐
const loadStyle = async () => {
  await tool.getColors((result: any) => {
    colorOptions.forEach(o => { if (result?.[o.key]) colors[o.key] = arrayToRgba(result[o.key]) })
  })
  await tool.getSampleDistance((result: any) => { surfaceStyle.sampleDistanceM = result?.sampleDistanceM ?? surfaceStyle.sampleDistanceM })
  await tool.getShowSurfaceLine((result: any) => { surfaceStyle.showSurfaceLine = result?.showSurfaceLine ?? surfaceStyle.showSurfaceLine })
}
onViewerSessionLeave(() => {
  if (isToolActive.value) return tool.finishTool()
})
</script>

<template>
  <div>
    <div class="title">表面距离测量</div>
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
      <el-button :loading="surfaceLoading" @click="calcSurfaceDistance" style="margin: 10px;">表面测量</el-button>
      <el-button :disabled="!surfaceResult" @click="clearSurfaceResult" style="margin: 10px;">清空表面结果</el-button>
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

    <div v-if="surfaceResult" class="result">
      <span>表面距离：{{ surfaceResult.surfaceDistanceM.toFixed(2) }} m　采样点（命中/总数）：{{ surfaceResult.sampleValidCount }}/{{ surfaceResult.sampleCount }}</span>
    </div>

    <div class="result">
      <p>样式设置：</p>
      <el-form-item v-for="o in colorOptions" :key="o.key" :label="o.label">
        <el-color-picker v-model="colors[o.key]" show-alpha color-format="rgb" @change="setColor(o.key)"></el-color-picker>
      </el-form-item>
      <el-form-item label="采样间距(m)">
        <el-input-number v-model="surfaceStyle.sampleDistanceM" :min="0.001" :step="0.01" :precision="3" @change="tool.setSampleDistance(surfaceStyle.sampleDistanceM)"></el-input-number>
      </el-form-item>
      <el-form-item label="显示表面线">
        <el-switch v-model="surfaceStyle.showSurfaceLine" @change="tool.setShowSurfaceLine(surfaceStyle.showSurfaceLine)"></el-switch>
      </el-form-item>
      <el-button size="small" @click="loadStyle">读取当前样式</el-button>
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

.result {
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.1);
  color: #e1bb82;
  font-size: 13px;
}
</style>
