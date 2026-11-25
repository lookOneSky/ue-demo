<script setup lang="ts">
import { onViewerSessionLeave } from '../utils/onViewerSessionLeave'
import { computed, ref } from 'vue'
import Scene from './lib/Scene/Scene.js'
import { DasModelTilesetLayer } from './lib/Layer/Tileset/DasModelTilesetLayer.js'

const longitude = ref(82.502502)
const latitude = ref(41.782873)
const height = ref(1090.457193)
const tilesetRoot = ref('file:////10.100.202.136/longmen2/kezier/3DTiles')

const dtLayer = ref<any>(null)
const kzeLayer = ref<any>(null)
const dtVisible = ref(true)
const kzeVisible = ref(true)
const dtAddHeight = ref(0)
const kzeAddHeight = ref(0)

const isSettingOrigin = ref(false)
const isLoading = ref(false)
const isClearing = ref(false)
const actionMessage = ref('未加载模型')

const hasLayers = computed(() => !!dtLayer.value || !!kzeLayer.value)

const setOrigin = async () => {
  isSettingOrigin.value = true
  try {
    const ok = await Scene.SetOriginLLH(longitude.value, latitude.value, height.value)
    actionMessage.value = ok ? '场景原点已设置' : '场景原点设置失败'
    return ok
  } catch (error) {
    console.error('设置场景原点失败:', error)
    actionMessage.value = '设置场景原点失败'
    return false
  } finally {
    isSettingOrigin.value = false
  }
}

const clearTilesets = async () => {
  isClearing.value = true
  try {
    if (dtLayer.value) {
      await dtLayer.value.removeInstance()
    }
    if (kzeLayer.value) {
      await kzeLayer.value.removeInstance()
    }
    dtLayer.value = null
    kzeLayer.value = null
    dtVisible.value = true
    kzeVisible.value = true
    actionMessage.value = '已清理 DT 与 KZE 模型'
  } catch (error) {
    console.error('清理模型失败:', error)
    actionMessage.value = '清理模型失败'
  } finally {
    isClearing.value = false
  }
}

const loadTilesets = async () => {
  const root = tilesetRoot.value.trim().replace(/\/+$/, '')
  if (!root) {
    actionMessage.value = '请先输入 3DTiles 根路径'
    return
  }

  isLoading.value = true
  try {
    if (hasLayers.value) {
      await clearTilesets()
    }

    const dt = await DasModelTilesetLayer.createInstance({
      param: {
        url: `${root}/DT/tileset.json`,
        addHeight: dtAddHeight.value
      }
    })

    const kze = await DasModelTilesetLayer.createInstance({
      param: {
        url: `${root}/KZE/tileset.json`,
        addHeight: kzeAddHeight.value
      }
    })

    if (!dt || !kze) {
      throw new Error('创建模型图层失败')
    }

    dtLayer.value = dt
    kzeLayer.value = kze
    dtVisible.value = true
    kzeVisible.value = true

    await kze.flyToThis()
    actionMessage.value = 'DT 与 KZE 模型已加载'
  } catch (error) {
    console.error('加载 3DTiles 模型失败:', error)
    actionMessage.value = '加载 3DTiles 模型失败'
  } finally {
    isLoading.value = false
  }
}

const setupScene = async () => {
  const ok = await setOrigin()
  if (!ok) return
  await loadTilesets()
}

const applyVisible = async (layer: any, visible: boolean, name: string) => {
  if (!layer) return
  try {
    await layer.setVisible(visible)
    actionMessage.value = `${name} 已${visible ? '显示' : '隐藏'}`
  } catch (error) {
    console.error(`设置${name}显隐失败:`, error)
    actionMessage.value = `设置${name}显隐失败`
  }
}

const applyAddHeight = async (layer: any, addHeight: number, name: string) => {
  if (!layer) return
  try {
    await layer.setAddHeight(addHeight)
    actionMessage.value = `${name} 高度偏移已设为 ${addHeight} 米`
  } catch (error) {
    console.error(`设置${name}高度偏移失败:`, error)
    actionMessage.value = `设置${name}高度偏移失败`
  }
}

const flyTo = async (layer: any, name: string) => {
  if (!layer) return
  try {
    await layer.flyToThis()
    actionMessage.value = `已飞向 ${name}`
  } catch (error) {
    console.error(`飞向${name}失败:`, error)
    actionMessage.value = `飞向${name}失败`
  }
}

onViewerSessionLeave(async () => {
  if (dtLayer.value) {
    await dtLayer.value.removeInstance()
  }
  if (kzeLayer.value) {
    await kzeLayer.value.removeInstance()
  }
})
</script>

<template>
  <div>
    <div class="title">克孜尔场景加载</div>
    <div class="split_line"></div>

    <div class="control-group">
      <h4 class="section-title">场景原点</h4>
      <el-form-item label="经度" class="ruihua">
        <el-input-number v-model="longitude" :precision="6" :step="0.01" style="width: 180px;" />
      </el-form-item>
      <el-form-item label="纬度" class="ruihua">
        <el-input-number v-model="latitude" :precision="6" :step="0.01" style="width: 180px;" />
      </el-form-item>
      <el-form-item label="高度(m)" class="ruihua">
        <el-input-number v-model="height" :precision="6" :step="1" style="width: 180px;" />
      </el-form-item>
      <div class="action-row">
        <el-button type="info" :loading="isSettingOrigin" @click="setOrigin">设置原点</el-button>
        <el-button type="primary" :loading="isSettingOrigin || isLoading" @click="setupScene">
          一键设置并加载
        </el-button>
      </div>
    </div>

    <div class="control-group">
      <h4 class="section-title">3DTiles 模型</h4>
      <el-form-item label="根路径" class="ruihua">
        <el-input
          v-model="tilesetRoot"
          placeholder="file:////10.100.202.136/longmen2/kezier/3DTiles"
          style="width: 360px;" />
      </el-form-item>
      <div class="action-row">
        <el-button type="success" :loading="isLoading" @click="loadTilesets">加载模型</el-button>
        <el-button type="warning" :disabled="!hasLayers" :loading="isClearing" @click="clearTilesets">
          清理模型
        </el-button>
      </div>
    </div>

    <div class="control-group">
      <h4 class="section-title">DT 图层</h4>
      <el-form-item label="显示" class="ruihua">
        <el-switch
          v-model="dtVisible"
          :disabled="!dtLayer"
          @change="applyVisible(dtLayer, dtVisible, 'DT')" />
      </el-form-item>
      <el-form-item label="高度偏移(m)" class="ruihua">
        <el-input-number v-model="dtAddHeight" :precision="2" :step="1" :disabled="!dtLayer" style="width: 150px;" />
      </el-form-item>
      <div class="action-row">
        <el-button type="info" :disabled="!dtLayer" @click="applyAddHeight(dtLayer, dtAddHeight, 'DT')">
          应用
        </el-button>
        <el-button type="primary" :disabled="!dtLayer" @click="flyTo(dtLayer, 'DT')">飞向此处</el-button>
      </div>
    </div>

    <div class="control-group">
      <h4 class="section-title">KZE 图层</h4>
      <el-form-item label="显示" class="ruihua">
        <el-switch
          v-model="kzeVisible"
          :disabled="!kzeLayer"
          @change="applyVisible(kzeLayer, kzeVisible, 'KZE')" />
      </el-form-item>
      <el-form-item label="高度偏移(m)" class="ruihua">
        <el-input-number v-model="kzeAddHeight" :precision="2" :step="1" :disabled="!kzeLayer" style="width: 150px;" />
      </el-form-item>
      <div class="action-row">
        <el-button type="info" :disabled="!kzeLayer" @click="applyAddHeight(kzeLayer, kzeAddHeight, 'KZE')">
          应用
        </el-button>
        <el-button type="primary" :disabled="!kzeLayer" @click="flyTo(kzeLayer, 'KZE')">飞向此处</el-button>
      </div>
    </div>

    <div class="status-panel" :class="{ active: hasLayers }">
      <p>原点：{{ longitude }} , {{ latitude }} , {{ height }}</p>
      <p>根路径：{{ tilesetRoot || '未填写' }}</p>
      <p>DT：{{ dtLayer ? '已创建' : '未创建' }} / {{ dtVisible ? '显示' : '隐藏' }} / 偏移 {{ dtAddHeight }} m</p>
      <p>KZE：{{ kzeLayer ? '已创建' : '未创建' }} / {{ kzeVisible ? '显示' : '隐藏' }} / 偏移 {{ kzeAddHeight }} m</p>
      <p class="action-message">最近操作：{{ actionMessage }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title {
  color: #E1BB82;
  text-align: center;
  font-size: 24px;
  letter-spacing: 9.6px;
  margin-top: 15px;
}

.split_line {
  background-image: url('/src/assets/images/hl.png');
  background-size: 100% 100%;
  height: 12px;
  width: 180px;
  margin: 15px auto 20px;
}

.control-group {
  margin: 15px 0;
  padding: 12px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
}

.section-title {
  color: #E1BB82;
  margin: 0 0 12px 0;
  font-size: 15px;
  border-bottom: 1px solid rgba(225, 187, 130, 0.3);
  padding-bottom: 6px;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 15px;
  flex-wrap: wrap;
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
}

.action-message {
  color: rgba(225, 187, 130, 0.9);
}
</style>
