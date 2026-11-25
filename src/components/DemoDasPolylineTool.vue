<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { DasPolylineTool } from './lib/Tool/DasPolylineTool.js'
import { DasPolylineLayer } from './lib/Layer/DasPolylineLayer.js'
import PolylineStrokeFields from './PolylineStrokeFields.vue'
import { createLayerStyle, createStrokeStyle, usePolylineDemo } from '../utils/usePolylineDemo'

const { ready, lastLayerId, drafts, selectExample, status, run } = usePolylineDemo()
const style = ref({ ...createStrokeStyle(), screenSpace: true, visible: true })
const drawing = ref(false)
const busy = ref(false)
const toolData = ref(null)
let session = 0

async function saveLayer() {
  const activeSession = session
  const hasPoints = await DasPolylineTool.hasPoints()
  if (activeSession !== session) return
  if (!hasPoints) {
    status.value = '请先启动绘制，并在视口中点击添加折线节点。'
    return
  }
  const param = await DasPolylineTool.getAll()
  if (activeSession !== session) return
  const layer = await DasPolylineLayer.createInstance({ param })
  if (!layer?.id) throw new Error('UE 未返回新建的图层 ID。')
  drafts.set(layer.id, createLayerStyle({ ...style.value, ...param }))
  if (activeSession !== session) return
  lastLayerId.value = layer.id
  status.value = '已创建多段线图层 ' + layer.id
}

async function toggleDrawing() {
  const start = !drawing.value
  const activeSession = session
  drawing.value = start
  try {
    if (start) await DasPolylineTool.setToCurrent()
    else await DasPolylineTool.finishTool()
  } catch (error) {
    if (activeSession === session) drawing.value = !start
    throw error
  }
}

async function runDrawingAction(action) {
  if (busy.value) return
  const activeSession = session
  busy.value = true
  try { await run(action) }
  finally { if (activeSession === session) busy.value = false }
}

async function readToolData() {
  const activeSession = session
  const [data, hasPoints, color, thickness] = await Promise.all([
    DasPolylineTool.getAll(), DasPolylineTool.hasPoints(),
    DasPolylineTool.getLineColor(), DasPolylineTool.getLineThickness(),
  ])
  if (activeSession === session) toolData.value = { data, hasPoints, color, thickness }
}

const apply = {
  color: () => DasPolylineTool.setLineColor(style.value.color),
  thickness: () => DasPolylineTool.setLineThickness(style.value.thickness, style.value.screenSpace),
  depth: () => DasPolylineTool.setDepthTest(style.value.enableDepthTest),
  visible: () => DasPolylineTool.setLineVisible(style.value.visible),
  spline() {
    const { enableSpline, interpolateCount } = style.value
    return DasPolylineTool.setSplinePoint({ enableSpline, interpolateCount })
  },
  all: () => DasPolylineTool.updateAll({ ...style.value }),
}

watch(ready, connected => {
  if (connected) return
  session++
  drawing.value = false
  busy.value = false
  toolData.value = null
})
onBeforeUnmount(() => {
  session++
  if (drawing.value && ready.value) void DasPolylineTool.finishTool().catch(console.error)
})
</script>

<template>
  <div>
    <section class="control-section">
      <h4>绘制与保存</h4>
      <p class="hint">启动绘制后，在视口中依次点击折线节点。</p>
      <el-button :type="drawing ? 'default' : 'primary'" :disabled="!ready || busy"
        @click="runDrawingAction(toggleDrawing)">{{ drawing ? '停止绘制' : '启动绘制' }}</el-button>
      <el-button :disabled="!ready || busy" @click="runDrawingAction(saveLayer)">保存为图层</el-button>
      <el-button :disabled="busy" @click="selectExample('polylineLayer')">管理多段线图层</el-button>
    </section>
    <p v-if="status" class="status-panel" role="status">{{ status }}</p>
    <el-form class="control-section" :disabled="!ready || busy">
      <h4>绘制线样式</h4>
      <PolylineStrokeFields v-model="style"
        @color="run(apply.color)" @thickness="run(apply.thickness)" @depth="run(apply.depth)" @spline="run(apply.spline)" />
      <el-form-item label="绘制线可见">
        <el-switch v-model="style.visible" @change="run(apply.visible)" />
      </el-form-item>
      <el-button @click="run(apply.all)">批量应用绘制样式</el-button>
    </el-form>
    <section class="control-section">
      <el-button :disabled="!ready || busy" @click="run(readToolData)">读取工具数据</el-button>
      <pre v-if="toolData">{{ JSON.stringify(toolData, null, 2) }}</pre>
    </section>
  </div>
</template>
