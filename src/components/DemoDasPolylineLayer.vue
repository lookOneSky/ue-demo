<script setup>
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { DasPolylineLayer } from './lib/Layer/DasPolylineLayer.js'
import { DasGroupLayer } from './lib/Layer/DasGroupLayer.js'
import PolylineStrokeFields from './PolylineStrokeFields.vue'
import { isUESuccess } from '../utils/demoRpc.js'
import { createLayerStyle, usePolylineDemo } from '../utils/usePolylineDemo'

const { ready, lastLayerId, drafts, selectExample, status, run } = usePolylineDemo()
const style = ref(createLayerStyle())
const layers = shallowRef([])
const currentLayer = computed(() => layers.value.find(layer => layer.id === lastLayerId.value))
const busy = ref(false)
let revision = 0

watch(currentLayer, layer => {
  if (!layer) {
    style.value = createLayerStyle()
    return
  }
  if (!drafts.has(layer.id)) drafts.set(layer.id, createLayerStyle())
  style.value = drafts.get(layer.id)
}, { flush: 'sync' })

async function refreshLayers() {
  const request = ++revision
  busy.value = true
  try {
    const root = await DasGroupLayer.getRoot()
    if (request !== revision || !root?.id) return
    const children = await root.getAllLayer()
    if (request !== revision) return
    const found = await Promise.all(children.map(async child => {
      if (child.getClassName() !== 'DasPolylineLayer' && await child.requestClassName() !== 'DasPolylineLayer') return null
      const layer = new DasPolylineLayer()
      layer.id = child.id
      return layer
    }))
    if (request !== revision) return
    layers.value = found.filter(Boolean)
    if (!currentLayer.value) lastLayerId.value = layers.value[0]?.id || ''
  } finally {
    if (request === revision) busy.value = false
  }
}

async function deleteLayer() {
  const layer = currentLayer.value
  const request = ++revision
  busy.value = true
  try {
    if (!isUESuccess(await layer.removeInstance())) throw new Error('UE 删除多段线图层失败。')
    drafts.delete(layer.id)
    if (request !== revision) return
    layers.value = layers.value.filter(item => item.id !== layer.id)
    lastLayerId.value = layers.value[0]?.id || ''
  } finally {
    if (request === revision) busy.value = false
  }
}

function locateLayer() {
  return currentLayer.value.flyToThis()
}

function showLayer(visible) {
  return currentLayer.value.setVisible(visible)
}

const apply = {
  color: () => currentLayer.value.setColor(style.value.color),
  thickness: () => currentLayer.value.setThickness(style.value.thickness),
  depth: () => currentLayer.value.setDepthTest(style.value.enableDepthTest),
  offset: () => currentLayer.value.setDepthOffset(style.value.depthOffset),
  brightness: () => currentLayer.value.setBrightness(style.value.brightness),
  spline() {
    const { enableSpline, interpolateCount } = style.value
    return currentLayer.value.setSplinePoint({ enableSpline, interpolateCount })
  },
  async halo() {
    const layer = currentLayer.value
    const { enableHalo, haloWidth, haloIntensity } = style.value
    const request = revision
    await layer.setHalo({ enableHalo, haloWidth, haloIntensity })
    if (enableHalo && request === revision && currentLayer.value === layer) {
      style.value.brightness = 50
      await layer.setBrightness(50)
    }
  },
  all: () => currentLayer.value.updateAll({ ...style.value }),
}

watch(ready, connected => {
  if (connected) {
    void run(refreshLayers)
  } else {
    revision++
    layers.value = []
    busy.value = false
  }
}, { immediate: true })
onBeforeUnmount(() => { revision++ })
</script>

<template>
  <div>
    <section class="control-section">
      <h4>目标图层</h4>
      <el-select v-if="layers.length" v-model="lastLayerId" :disabled="busy" aria-label="选择多段线图层">
        <el-option v-for="layer in layers" :key="layer.id" :label="String(layer.id)" :value="layer.id" />
      </el-select>
      <p v-else class="hint">{{ !ready ? '连接 UE 后可查看场景中的多段线图层。' :
        busy ? '正在读取多段线图层…' : '当前没有多段线图层。进入绘制示例后，可以将视口中的折线保存为图层。' }}</p>
      <el-button type="primary" @click="selectExample('polylineTool')">绘制多段线</el-button>
      <el-button :disabled="!ready || busy" @click="run(refreshLayers)">刷新图层</el-button>
    </section>
    <p v-if="status" class="status-panel" role="status">{{ status }}</p>
    <section class="control-section">
      <h4>图层操作</h4>
      <el-button :disabled="!currentLayer || busy" @click="run(locateLayer)">定位</el-button>
      <el-button :disabled="!currentLayer || busy" @click="run(() => showLayer(true))">显示</el-button>
      <el-button :disabled="!currentLayer || busy" @click="run(() => showLayer(false))">隐藏</el-button>
      <el-button :disabled="!currentLayer || busy" type="danger" @click="run(deleteLayer)">删除所选图层</el-button>
    </section>
    <el-form class="control-section" :disabled="!currentLayer || busy">
      <h4>图层样式</h4>
      <PolylineStrokeFields v-model="style"
        @color="run(apply.color)" @thickness="run(apply.thickness)" @depth="run(apply.depth)" @spline="run(apply.spline)" />
      <el-form-item label="深度偏移">
        <el-input-number v-model="style.depthOffset" :min="0" :max="1" :step="0.01" @change="run(apply.offset)" />
      </el-form-item>
      <el-form-item label="光晕">
        <el-switch v-model="style.enableHalo" @change="run(apply.halo)" />
      </el-form-item>
      <template v-if="style.enableHalo">
        <el-form-item label="光晕宽度">
          <el-input-number v-model="style.haloWidth" :min="1" :max="20" :step="0.5" @change="run(apply.halo)" />
        </el-form-item>
        <el-form-item label="光晕强度">
          <el-input-number v-model="style.haloIntensity" :min="0" :max="2" :step="0.1" @change="run(apply.halo)" />
        </el-form-item>
      </template>
      <el-form-item label="亮度">
        <el-input-number v-model="style.brightness" :min="0.1" :max="100" :step="0.5" @change="run(apply.brightness)" />
      </el-form-item>
      <el-button @click="run(apply.all)">批量应用图层样式</el-button>
    </el-form>
  </div>
</template>
