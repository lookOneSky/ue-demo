<script setup lang="ts">
import { ref, watch } from 'vue'
import { DasLightPointLayer } from "./lib/Layer/DasLightPointLayer.js"
import { DasLightTorchLayer } from "./lib/Layer/DasLightTorchLayer.js"
import { DasGizmosOperateTool } from "./lib/Tool/DasGizmosOperateTool.js"
import { Weather } from "./lib/Scene/Weather.js"
import { useLightDemoShowModel } from "../utils/useLightDemoShowModel"

useLightDemoShowModel()

const lightType = ref('point')
const activeLayer = ref<any>(null)
const createdLayers = ref<any[]>([])
const lightIntensity = ref(5)
const lightColor = ref({ r: 1, g: 0.8, b: 0.5, a: 1 })
const timeValue = ref(50) // 0~100 映射 0:00~23:59

let syncingActiveLayerState = false

const lightTypeOptions = [
  { label: '点光源', value: 'point' },
  { label: '火把光源', value: 'torch' }
]

// 时间值转显示字符串
const formatTime = (val: number): string => {
  const totalMinutes = Math.floor(val / 100 * 1439)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`
}

const getLayerClass = () => {
  return lightType.value === 'point' ? DasLightPointLayer : DasLightTorchLayer
}

const buildLightParam = (transform?: any) => {
  const param: any = {
    lightIntensity: lightIntensity.value,
    lightColor: { ...lightColor.value }
  }

  if (transform) {
    param.transform = transform
  }

  return { param }
}

const registerCreatedLayer = (layer: any) => {
  if (layer) createdLayers.value.push(layer)
}

const syncPanelFromLayer = async (layer: any) => {
  if (!layer) return

  syncingActiveLayerState = true
  try {
    lightIntensity.value = await layer.getIntensity()
    lightColor.value = await layer.getColor()
  } finally {
    syncingActiveLayerState = false
  }
}

const setActiveLayer = async (layer: any) => {
  activeLayer.value = layer
  await syncPanelFromLayer(layer)
}

const createDirectLight = async () => {
  const LayerClass = getLayerClass()
  const layer = await LayerClass.createInstance(buildLightParam())
  registerCreatedLayer(layer)
  await setActiveLayer(layer)
}

const startOperateLayer = async (layer: any) => {
  if (!layer) return

  const layerInfo = layer.writeObjectInfo()
  await DasGizmosOperateTool.setOperateLayer(layerInfo, true)
  await DasGizmosOperateTool.setOperateType(1)
}

const startActiveLayerEdit = async () => {
  await startOperateLayer(activeLayer.value)
}

const createLightFromEditedTransform = async () => {
  if (!activeLayer.value) return

  const transform = await activeLayer.value.getWorldTransform()
  const LayerClass = getLayerClass()
  const layer = await LayerClass.createInstance(buildLightParam(transform))
  registerCreatedLayer(layer)
  //await setActiveLayer(layer)
}

// 设置强度
watch(lightIntensity, async (val) => {
  if (!activeLayer.value || syncingActiveLayerState) return
  await activeLayer.value.setIntensity(val)
})

// 设置颜色
const updateColor = async () => {
  if (!activeLayer.value || syncingActiveLayerState) return
  await activeLayer.value.setColor({ ...lightColor.value })
}

// 设置时间
watch(timeValue, (val) => {
  Weather.SetTimeOfDay(formatTime(val))
})

// 清空所有
const clearAll = async () => {
  await DasGizmosOperateTool.setOperateType(0)
  for (const layer of [...createdLayers.value].reverse()) {
    await layer.removeInstance()
    createdLayers.value = createdLayers.value.filter(item => item !== layer)
    if (activeLayer.value === layer) activeLayer.value = null
  }
}
</script>

<template>
  <div>
    <div class="title">灯光图层控制</div>
    <div class="split_line"></div>

    <div class="control-group">
      <h4 class="section-title">基础参数</h4>
      <div class="step-section">
        <span class="step-label">灯光类型:</span>
        <el-select v-model="lightType" style="width: 160px;" size="small">
          <el-option v-for="opt in lightTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </div>
      <div class="step-section">
        <span class="step-label">当前状态:</span>
        <span class="step-value">当前活动灯光 {{ activeLayer ? '已绑定' : '未绑定' }}</span>
        <span class="step-value">已创建 {{ createdLayers.length }} 个</span>
      </div>
    </div>

    <div class="control-group">
      <h4 class="section-title">方式一：直接新建</h4>
      <div class="step-section">
        <span class="step-label">步骤1:</span>
        <el-button type="success" size="small" @click="createDirectLight">直接新建</el-button>
      </div>
      <div class="step-section">
        <span class="step-label">步骤2:</span>
        <el-button type="primary" size="small" :disabled="!activeLayer" @click="startActiveLayerEdit">
          开始编辑当前灯光
        </el-button>
        <span class="step-status" v-if="activeLayer">✓ 可进入 Gizmos 编辑</span>
      </div>
    </div>

    <div class="control-group">
      <h4 class="section-title">方式二：编辑后按 Transform 创建</h4>
      <div class="step-section">
        <span class="step-label">步骤1:</span>
        <el-button type="primary" size="small" :disabled="!activeLayer" @click="startActiveLayerEdit">
          开始编辑
        </el-button>
        <span class="step-hint">基于当前活动灯光调整位置</span>
      </div>
      <div class="step-section">
        <span class="step-label">步骤2:</span>
        <el-button type="warning" size="small" :disabled="!activeLayer" @click="createLightFromEditedTransform">
          按编辑结果创建副本
        </el-button>
        <span class="step-hint">通过 getWorldTransform + createInstance(param.transform) 复制 Transform</span>
      </div>
    </div>

    <div class="control-group">
      <h4 class="section-title">灯光属性</h4>
      <div class="step-section">
        <span class="step-label">作用对象:</span>
        <span class="step-value">{{ activeLayer ? '当前活动灯光' : '未选择灯光' }}</span>
      </div>
      <el-form-item label="强度" class="ruihua">
        <el-slider v-model="lightIntensity" :min="0" :max="50" :step="0.5" :disabled="!activeLayer" style="width: 280px;" />
      </el-form-item>
      <el-form-item label="R" class="ruihua">
        <el-slider v-model="lightColor.r" :min="0" :max="1" :step="0.01" :disabled="!activeLayer" style="width: 280px;" @change="updateColor" />
      </el-form-item>
      <el-form-item label="G" class="ruihua">
        <el-slider v-model="lightColor.g" :min="0" :max="1" :step="0.01" :disabled="!activeLayer" style="width: 280px;" @change="updateColor" />
      </el-form-item>
      <el-form-item label="B" class="ruihua">
        <el-slider v-model="lightColor.b" :min="0" :max="1" :step="0.01" :disabled="!activeLayer" style="width: 280px;" @change="updateColor" />
      </el-form-item>
      <div class="color-preview" :style="{ background: `rgb(${lightColor.r * 255},${lightColor.g * 255},${lightColor.b * 255})` }"></div>
    </div>

    <div class="control-group">
      <h4 class="section-title">时间设置</h4>
      <el-form-item :label="formatTime(timeValue)" class="ruihua">
        <el-slider v-model="timeValue" :min="0" :max="100" :step="1" style="width: 280px;" />
      </el-form-item>
    </div>

    <div class="control-group">
      <el-button type="danger" size="small" @click="clearAll">清空本示例</el-button>
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

.step-section {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.step-label {
  color: #E1BB82;
  width: 110px;
  font-size: 14px;
}

.step-status {
  color: #67C23A;
  font-size: 14px;
}

.step-hint,
.step-value {
  color: #d7c39f;
  font-size: 14px;
}

.color-preview {
  width: 280px;
  height: 20px;
  border-radius: 4px;
  margin-top: 8px;
  border: 1px solid rgba(225, 187, 130, 0.3);
}
</style>
