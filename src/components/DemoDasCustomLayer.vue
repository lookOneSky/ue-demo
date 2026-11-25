<script setup lang="ts">
import { ref, watch } from 'vue'
import { DasCustomLayer } from './lib/Layer/DasCustomLayer.js'
import { DasGizmosOperateTool } from './lib/Tool/DasGizmosOperateTool.js'

const assetOptions = [
  { label: 'Guide', value: 'Guide' }
]

const defaultAssetName = assetOptions[0].value

const selectedAssetName = ref(defaultAssetName)
const currentAssetName = ref(defaultAssetName)
const activeLayer = ref<any>(null)
const complexLayers = ref<any[]>([])
const isCreating = ref(false)
const isCreatingComplexLayer = ref(false)
const isSwitchingAsset = ref(false)

const bindLayerToGizmos = async (layer: any) => {
  await DasGizmosOperateTool.setOperateLayer(layer.writeObjectInfo(), true)
  await DasGizmosOperateTool.setOperateType(1)
}

const createAndEditLayer = async () => {
  if (activeLayer.value || isCreating.value) return

  isCreating.value = true
  try {
    const layer = await DasCustomLayer.createInstance({
      param: {
        assetName: selectedAssetName.value
      }
    })

    if (!layer) return

    activeLayer.value = layer
    currentAssetName.value = selectedAssetName.value
    await bindLayerToGizmos(layer)
  } catch (error) {
    console.error('创建自定义图层失败:', error)
  } finally {
    isCreating.value = false
  }
}

const createComplexLayerFromCurrent = async () => {
  if (!activeLayer.value || isCreatingComplexLayer.value) return

  isCreatingComplexLayer.value = true
  try {
    const assetName = await activeLayer.value.getCurrentAssetName()
    const transform = await activeLayer.value.getWorldTransform()
    const layer = await DasCustomLayer.createInstance({
      param: {
        assetName,
        transform
      }
    })

    if (!layer) return

    complexLayers.value.push(layer)
    currentAssetName.value = assetName
  } catch (error) {
    console.error('创建复杂图层失败:', error)
  } finally {
    isCreatingComplexLayer.value = false
  }
}

watch(selectedAssetName, async (assetName) => {
  if (!activeLayer.value || isSwitchingAsset.value) return

  isSwitchingAsset.value = true
  try {
    await activeLayer.value.setAssetName(assetName)
    currentAssetName.value = assetName
  } catch (error) {
    console.error('切换资产失败:', error)
  } finally {
    isSwitchingAsset.value = false
  }
})

const clearAll = async () => {
  try {
    await DasGizmosOperateTool.setOperateType(0)
    for (const layer of [...complexLayers.value]) {
      await layer.removeInstance()
      complexLayers.value = complexLayers.value.filter(item => item !== layer)
    }
    if (activeLayer.value) await activeLayer.value.removeInstance()
    activeLayer.value = null
    selectedAssetName.value = defaultAssetName
    currentAssetName.value = defaultAssetName
  } catch (error) {
    console.error('清空自定义图层失败:', error)
  }
}
</script>

<template>
  <div>
    <div class="title">自定义图层控制</div>
    <div class="split_line"></div>

    <div class="control-group">
      <h4 class="section-title">基础参数</h4>
      <div class="step-section">
        <span class="step-label">资产名:</span>
        <el-select v-model="selectedAssetName" style="width: 180px;" size="small">
          <el-option v-for="item in assetOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <span class="step-hint" v-if="activeLayer">切换后会直接作用于当前编辑图层</span>
      </div>
      <div class="step-section">
        <span class="step-label">当前状态:</span>
        <span class="step-value">编辑图层 {{ activeLayer ? '已创建' : '未创建' }}</span>
        <span class="step-value">当前资产 {{ currentAssetName }}</span>
        <span class="step-value">复杂图层 {{ complexLayers.length }} 个</span>
      </div>
    </div>

    <div class="control-group">
      <h4 class="section-title">编辑图层预览</h4>
      <div class="step-section">
        <span class="step-label">步骤1:</span>
        <el-button
          type="primary"
          size="small"
          :disabled="!!activeLayer || isCreating"
          @click="createAndEditLayer">
          新建并编辑当前图层
        </el-button>
        <span class="step-status" v-if="activeLayer">✓ 已进入 Gizmos 平移编辑</span>
      </div>
      <div class="step-section">
        <span class="step-label">说明:</span>
        <span class="step-hint">预览阶段始终编辑当前图层，若需重新开始请先清空所有</span>
      </div>
    </div>

    <div class="control-group">
      <h4 class="section-title">复杂图层创建</h4>
      <div class="step-section">
        <span class="step-label">步骤1:</span>
        <span class="step-value">使用 Gizmos 调整当前编辑图层的位置与姿态</span>
      </div>
      <div class="step-section">
        <span class="step-label">步骤2:</span>
        <el-button
          type="warning"
          size="small"
          :disabled="!activeLayer || isCreatingComplexLayer"
          @click="createComplexLayerFromCurrent">
          按当前图层属性创建复杂图层
        </el-button>
        <span class="step-hint">读取当前图层的 assetName 和 transform 创建副本</span>
      </div>
      <div class="step-section">
        <span class="step-label">结果:</span>
        <span class="step-hint">复杂图层创建后不会接管 Gizmos，当前编辑对象保持不变</span>
      </div>
    </div>

    <div class="control-group">
      <h4 class="section-title">清理</h4>
      <div class="step-section">
        <el-button type="danger" size="small" @click="clearAll">清空本示例</el-button>
      </div>
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
</style>
