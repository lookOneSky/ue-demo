<script setup lang="ts">
import { ref, reactive } from 'vue'
import { DasToolMeasurementArea } from './lib/Tool/DasToolMeasurementArea.js'

const tool = new DasToolMeasurementArea()
const isToolActive = ref(false)
const pointsList = ref<any[]>([])
const accurateLoading = ref(false)
const accurateResult = ref<{ areaM2: number; triangleCount: number } | null>(null)

// 颜色项（通用 + 面积专有）
const colorOptions = [
  { label: '普通点', key: 'normalPointColor' },
  { label: '悬停点', key: 'hoverPointColor' },
  { label: '标签文字', key: 'labelTextColor' },
  { label: '多边形线', key: 'lineColor' },
  { label: '标签背景', key: 'labelBackgroundColor' },
  { label: '裁剪三角面', key: 'clipMeshColor' }
]
const colors = reactive<Record<string, string>>({})
const lineStyle = reactive({ thickness: 2, ghostAlpha: 1, showLabels: true, showClipMesh: true })

// rgba字符串转[r,g,b,a]（0-1）
const rgbaToArray = (rgba: string) => {
  const [r, g, b, a = 1] = (rgba.match(/[\d.]+/g) || []).map(Number)
  return [r / 255, g / 255, b / 255, a]
}

// [r,g,b,a]（0-1）转rgba字符串
const arrayToRgba = (c: number[]) =>
  `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${c[3] ?? 1})`

const startTool = async () => {
  await tool.setToCurrent(() => {
    isToolActive.value = true
  })
}

const getPoints = async () => {
  await tool.getPointsLLH((result: any) => {
    pointsList.value = result?.pointsLLH || []
    isToolActive.value = false
  })
}

const clearPoints = async () => {
  await tool.clearAllPoints(() => {
    pointsList.value = []
    isToolActive.value = false
    accurateResult.value = null
  })
}

const calcAreaAccurate = async () => {
  accurateLoading.value = true
  await tool.calcAreaAccurate(async () => {
    await tool.getAccurateResult((result: any) => {
      accurateResult.value = result || null
      accurateLoading.value = false
    })
  })
}

const clearAccurateResult = async () => {
  await tool.clearAccurateResult(() => {
    accurateResult.value = null
  })
}

// 设置单个颜色
const setColor = async (key: string) => {
  if (!colors[key]) return
  await tool.setColors({ [key]: rgbaToArray(colors[key]) })
}

// 从UE读取全部样式
const loadStyle = async () => {
  await tool.getColors((result: any) => {
    colorOptions.forEach(o => { if (result?.[o.key]) colors[o.key] = arrayToRgba(result[o.key]) })
  })
  await tool.getLineThickness((result: any) => { lineStyle.thickness = result?.thickness ?? lineStyle.thickness })
  await tool.getGhostLineAlpha((result: any) => { lineStyle.ghostAlpha = result?.ghostAlpha ?? lineStyle.ghostAlpha })
  await tool.getShowLabels((result: any) => { lineStyle.showLabels = result?.showLabels ?? lineStyle.showLabels })
  await tool.getShowClipMesh((result: any) => { lineStyle.showClipMesh = result?.showClipMesh ?? lineStyle.showClipMesh })
}
</script>

<template>
  <div>
    <div class="title">面积测量</div>
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
      <el-button
        :loading="accurateLoading"
        @click="calcAreaAccurate"
        style="margin: 10px;">
        精确测量
      </el-button>
      <el-button
        :disabled="!accurateResult"
        @click="clearAccurateResult"
        style="margin: 10px;">
        清空精确结果
      </el-button>
    </div>

    <div class="status-panel" :class="{ active: isToolActive }">
      <p>状态：{{ isToolActive ? '测量中，单击添加点，双击结束并封闭' : '未激活' }}</p>
      <p v-if="pointsList.length > 0">顶点数：{{ pointsList.length }}</p>
    </div>

    <div v-if="pointsList.length > 0" class="points-panel">
      <p>顶点列表：</p>
      <div v-for="(pt, i) in pointsList" :key="i" class="point-item">
        <span>{{ i + 1 }}. 经：{{ pt.longitude.toFixed(6) }}  纬：{{ pt.latitude.toFixed(6) }}  高：{{ pt.height.toFixed(2) }}</span>
      </div>
    </div>

    <div v-if="accurateResult" class="result">
      <span>表面积：{{ accurateResult.areaM2.toFixed(2) }} m²　三角面数：{{ accurateResult.triangleCount }}</span>
    </div>

    <div class="result">
      <p>样式设置：</p>
      <el-form-item v-for="o in colorOptions" :key="o.key" :label="o.label">
        <el-color-picker v-model="colors[o.key]" show-alpha color-format="rgb" @change="setColor(o.key)"></el-color-picker>
      </el-form-item>
      <el-form-item label="线条粗细">
        <el-input-number v-model="lineStyle.thickness" :min="1" :step="1" @change="tool.setLineThickness(lineStyle.thickness)"></el-input-number>
      </el-form-item>
      <el-form-item label="遮挡线透明度">
        <el-slider v-model="lineStyle.ghostAlpha" :min="0" :max="1" :step="0.05" style="width: 200px;" @change="tool.setGhostLineAlpha(lineStyle.ghostAlpha)"></el-slider>
      </el-form-item>
      <el-form-item label="显示标签">
        <el-switch v-model="lineStyle.showLabels" @change="tool.setShowLabels(lineStyle.showLabels)"></el-switch>
      </el-form-item>
      <el-form-item label="显示裁剪面">
        <el-switch v-model="lineStyle.showClipMesh" @change="tool.setShowClipMesh(lineStyle.showClipMesh)"></el-switch>
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
