<script setup lang="ts">
import { ref, reactive } from 'vue'
import { DasToolMeasurementAngle } from './lib/Tool/DasToolMeasurementAngle.js'

const tool = new DasToolMeasurementAngle() // 角度测量工具
const isToolActive = ref(false) // 工具是否激活
const pointsList = ref<any[]>([]) // 测量点 LLH 列表，顺序为 边点、角点、另一边点
const angleResult = ref<{ angleDeg: number; valid: boolean } | null>(null) // 夹角结果
const pointNames = ['边点', '角点', '另一边点'] // 测量点名称

// 颜色项（通用 + 角度专有）
const colorOptions = [
  { label: '普通点', key: 'normalPointColor' },
  { label: '悬停点', key: 'hoverPointColor' },
  { label: '标签文字', key: 'labelTextColor' },
  { label: '边线', key: 'sideLineColor' },
  { label: '圆弧线', key: 'arcLineColor' },
  { label: '标签背景', key: 'labelBackgroundColor' }
]
const colors = reactive<Record<string, string>>({}) // 颜色选择器的值（rgba 字符串）
// 线条、标签与圆弧样式，初值为 UE 默认值
const lineStyle = reactive({
  thickness: 2, ghostAlpha: 1, ghostDashed: true, solidDashed: false,
  showLabels: true, showArc: true, arcRadiusRatio: 0.25, arcSegmentCount: 32, labelPixelOffset: 10
})

// rgba字符串转[r,g,b,a]（0-1）
const rgbaToArray = (rgba: string) => {
  const [r, g, b, a = 1] = (rgba.match(/[\d.]+/g) || []).map(Number)
  return [r / 255, g / 255, b / 255, a]
}

// [r,g,b,a]（0-1）转rgba字符串
const arrayToRgba = (c: number[]) =>
  `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${c[3] ?? 1})`

// 激活工具，依次单击边点、角点、另一边点
const startTool = async () => {
  await tool.setToCurrent(() => {
    isToolActive.value = true
  })
}

// 停止工具
const stopTool = async () => {
  await tool.finishTool(() => {
    isToolActive.value = false
  })
}

// 获取测量点与夹角
const getResult = async () => {
  await tool.getPointsLLH((result: any) => {
    pointsList.value = result?.pointsLLH || []
  })
  await tool.getAngle((result: any) => {
    angleResult.value = result || null
  })
}

// 清空测量点与夹角结果
const clearPoints = async () => {
  await tool.clearAllPoints(() => {
    pointsList.value = []
    angleResult.value = null
  })
}

// 设置单个颜色（sideLineColor、arcLineColor、labelBackgroundColor 也走 setColors）
const setColor = async (key: string) => {
  if (!colors[key]) return
  await tool.setColors({ [key]: rgbaToArray(colors[key]) })
}

// 从 UE 读取颜色、线条、标签与圆弧样式
const loadStyle = async () => {
  await tool.getColors((result: any) => {
    colorOptions.forEach(o => { if (result?.[o.key]) colors[o.key] = arrayToRgba(result[o.key]) })
  })
  await tool.getLineThickness((result: any) => { lineStyle.thickness = result?.thickness ?? lineStyle.thickness })
  await tool.getGhostLineAlpha((result: any) => { lineStyle.ghostAlpha = result?.ghostAlpha ?? lineStyle.ghostAlpha })
  await tool.getGhostLineDashed((result: any) => { lineStyle.ghostDashed = result?.ghostDashed ?? lineStyle.ghostDashed })
  await tool.getSolidLineDashed((result: any) => { lineStyle.solidDashed = result?.solidDashed ?? lineStyle.solidDashed })
  await tool.getShowLabels((result: any) => { lineStyle.showLabels = result?.showLabels ?? lineStyle.showLabels })
  await tool.getShowArc((result: any) => { lineStyle.showArc = result?.showArc ?? lineStyle.showArc })
  await tool.getArcRadiusRatio((result: any) => { lineStyle.arcRadiusRatio = result?.arcRadiusRatio ?? lineStyle.arcRadiusRatio })
  await tool.getArcSegmentCount((result: any) => { lineStyle.arcSegmentCount = result?.arcSegmentCount ?? lineStyle.arcSegmentCount })
  await tool.getLabelPixelOffset((result: any) => { lineStyle.labelPixelOffset = result?.labelPixelOffset ?? lineStyle.labelPixelOffset })
}
</script>

<template>
  <div>
    <div class="title">角度测量</div>
    <div class="split_line"></div>

    <div class="control-group">
      <el-button
        :type="isToolActive ? 'danger' : 'primary'"
        @click="isToolActive ? stopTool() : startTool()"
        style="margin: 10px;">
        {{ isToolActive ? '停止工具' : '激活工具' }}
      </el-button>
      <el-button type="success" @click="getResult" style="margin: 10px;">获取测量结果</el-button>
      <el-button type="warning" @click="clearPoints" style="margin: 10px;">清空</el-button>
    </div>

    <div class="status-panel" :class="{ active: isToolActive }">
      <p>状态：{{ isToolActive ? '测量中，依次单击边点、角点、另一边点，第 4 次单击重新开始' : '未激活' }}</p>
      <p v-if="angleResult">夹角：{{ angleResult.valid ? angleResult.angleDeg.toFixed(2) + '°' : '无效（点数不足或边退化）' }}</p>
    </div>

    <div v-if="pointsList.length > 0" class="points-panel">
      <p>测量点列表：</p>
      <div v-for="(pt, i) in pointsList" :key="i" class="point-item">
        <span>{{ pointNames[i] }}：经：{{ pt.longitude.toFixed(6) }}  纬：{{ pt.latitude.toFixed(6) }}  高：{{ pt.height.toFixed(2) }}</span>
      </div>
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
      <el-form-item label="遮挡线虚线">
        <el-switch v-model="lineStyle.ghostDashed" @change="tool.setGhostLineDashed(lineStyle.ghostDashed)"></el-switch>
      </el-form-item>
      <el-form-item label="可见线虚线">
        <el-switch v-model="lineStyle.solidDashed" @change="tool.setSolidLineDashed(lineStyle.solidDashed)"></el-switch>
      </el-form-item>
      <el-form-item label="显示标签">
        <el-switch v-model="lineStyle.showLabels" @change="tool.setShowLabels(lineStyle.showLabels)"></el-switch>
      </el-form-item>
      <el-form-item label="显示圆弧">
        <el-switch v-model="lineStyle.showArc" @change="tool.setShowArc(lineStyle.showArc)"></el-switch>
      </el-form-item>
      <el-form-item label="圆弧半径比例">
        <el-slider v-model="lineStyle.arcRadiusRatio" :min="0" :max="1" :step="0.05" style="width: 200px;" @change="tool.setArcRadiusRatio(lineStyle.arcRadiusRatio)"></el-slider>
      </el-form-item>
      <el-form-item label="圆弧分段数">
        <el-input-number v-model="lineStyle.arcSegmentCount" :min="1" :step="1" @change="tool.setArcSegmentCount(lineStyle.arcSegmentCount)"></el-input-number>
      </el-form-item>
      <el-form-item label="标签像素偏移">
        <el-input-number v-model="lineStyle.labelPixelOffset" :min="0" :step="1" @change="tool.setLabelPixelOffset(lineStyle.labelPixelOffset)"></el-input-number>
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
