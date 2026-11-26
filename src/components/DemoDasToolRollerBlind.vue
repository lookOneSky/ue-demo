<script setup lang="ts">
import { requestUE } from '../utils/demoRpc.js'
import { onViewerSessionLeave } from '../utils/onViewerSessionLeave'
import { computed, ref } from 'vue'
import { DasToolRollerBlind } from './lib/Tool/DasToolRollerBlind.js'
import { DasModelTilesetLayer } from './lib/Layer/Tileset/DasModelTilesetLayer.js'

const tool = new DasToolRollerBlind()
const isToolActive = ref(false)
const rollerBlindPosition = ref(0.5)
const isLoadingPosition = ref(false)
const isCreatingModels = ref(false)
const isClearingModels = ref(false)
const tilesetPath = ref('file:///D:/data/九华山/5cm/3Dtiles/tileset.json')
const leftLayer = ref<any>(null)
const rightLayer = ref<any>(null)
const rightLayerUnlight = ref(false)
const actionMessage = ref('未创建卷帘对比模型')
const lineTexturePath = ref('')
const lineTextureWidth = ref(4)
const hitThreshold = ref(20)
const movePaused = ref(false)

const percentText = computed(() => `${Math.round(rollerBlindPosition.value * 100)}%`)
const hasCompareLayers = computed(() => !!leftLayer.value && !!rightLayer.value)
const leftLayerStatus = computed(() => leftLayer.value ? '已创建' : '未创建')
const rightLayerStatus = computed(() => rightLayer.value ? '已创建' : '未创建')

const bindCompareLayers = async () => {
  if (!leftLayer.value || !rightLayer.value) return

  await requestUE(tool.className, 'setRollerBlindRight', { layer: leftLayer.value.writeObjectInfo(), rollerBlindRight: false })
  await requestUE(tool.className, 'setRollerBlindRight', { layer: rightLayer.value.writeObjectInfo(), rollerBlindRight: true })
  actionMessage.value = '左右卷帘模型已绑定'
}

const startTool = async () => {
  try {
    await requestUE(tool.className, 'setToCurrent')
    isToolActive.value = true
    if (hasCompareLayers.value) {
      await bindCompareLayers()
    }
    await applyPosition()
    actionMessage.value = hasCompareLayers.value
      ? '卷帘工具已激活，并重新绑定左右模型'
      : '卷帘工具已激活'
  } catch (error) {
    console.error('启动卷帘对比工具失败:', error)
    actionMessage.value = '启动卷帘对比工具失败'
  }
}

const stopTool = async () => {
  try {
    await requestUE(tool.className, 'finishTool')
    isToolActive.value = false
    actionMessage.value = '卷帘工具已停止'
  } catch (error) {
    console.error('停止卷帘对比工具失败:', error)
    actionMessage.value = '停止卷帘对比工具失败'
  }
}

const applyPosition = async () => {
  if (!isToolActive.value) return

  try {
    await requestUE(tool.className, 'setRollerBlindPosition', { rollerBlindPosition: rollerBlindPosition.value })
    actionMessage.value = `卷帘位置已更新到 ${rollerBlindPosition.value.toFixed(2)}`
  } catch (error) {
    console.error('设置卷帘位置失败:', error)
    actionMessage.value = '设置卷帘位置失败'
  }
}

const getCurrentPosition = async () => {
  isLoadingPosition.value = true
  try {
    await tool.getRollerBlindPosition((result: { rollerBlindPosition?: number }) => {
      if (typeof result?.rollerBlindPosition === 'number') {
        rollerBlindPosition.value = result.rollerBlindPosition
      }
    })
    actionMessage.value = `已读取当前位置 ${rollerBlindPosition.value.toFixed(2)}`
  } catch (error) {
    console.error('获取卷帘位置失败:', error)
    actionMessage.value = '获取卷帘位置失败'
  } finally {
    isLoadingPosition.value = false
  }
}

const clearCompareLayers = async () => {
  isClearingModels.value = true
  try {
    if (leftLayer.value) {
      await requestUE(leftLayer.value.className, 'removeInstance', { id: leftLayer.value.id })
      leftLayer.value = null
    }
    if (rightLayer.value) {
      await requestUE(rightLayer.value.className, 'removeInstance', { id: rightLayer.value.id })
      rightLayer.value = null
      rightLayerUnlight.value = false
    }
    actionMessage.value = '已清理当前 Demo 创建的卷帘对比模型'
  } catch (error) {
    console.error('清理卷帘对比模型失败:', error)
    actionMessage.value = '清理卷帘对比模型失败'
  } finally {
    isClearingModels.value = false
  }
}

const createCompareLayers = async () => {
  const path = tilesetPath.value.trim()
  if (!path) {
    actionMessage.value = '请先输入 tileset.json 路径'
    return
  }

  isCreatingModels.value = true
  try {
    if (leftLayer.value || rightLayer.value) {
      await clearCompareLayers()
      if (leftLayer.value || rightLayer.value) return
    }

    const left = await DasModelTilesetLayer.createInstance({
      param: {
        url: path
      }
    })

    if (!left?.id) throw new Error('创建左侧模型图层失败')
    leftLayer.value = left
    const right = await DasModelTilesetLayer.createInstance({
      param: {
        url: path
      }
    })

    if (!right?.id) throw new Error('创建右侧模型图层失败')
    rightLayer.value = right
    await right.setUnlight(true)
    rightLayerUnlight.value = true

    await bindCompareLayers()
    await left.flyToThis()

    if (isToolActive.value) {
      await applyPosition()
    }

    actionMessage.value = '卷帘对比模型已创建，右侧为 Unlight 材质'
  } catch (error) {
    console.error('创建卷帘对比模型失败:', error)
    actionMessage.value = '创建卷帘对比模型失败'
  } finally {
    isCreatingModels.value = false
  }
}

// 设置分界线贴图与宽度（路径为空或宽度<=0时UE不修改对应项）
const applyLineTexture = async () => {
  try {
    await requestUE(tool.className, 'setRollerBlindLineTexture', { texturePath: lineTexturePath.value.trim(), textureWidth: lineTextureWidth.value })
    actionMessage.value = '分界线贴图已更新'
  } catch (error) {
    console.error('设置分界线贴图失败:', error)
    actionMessage.value = '设置分界线贴图失败'
  }
}

// 设置分界线拖拽命中宽度
const applyHitThreshold = async () => {
  try {
    await requestUE(tool.className, 'setRollerBlindHitThreshold', { hitThreshold: hitThreshold.value })
    actionMessage.value = `拖拽热区已更新到 ${hitThreshold.value}`
  } catch (error) {
    console.error('设置拖拽热区失败:', error)
    actionMessage.value = '设置拖拽热区失败'
  }
}

// 暂停或继续移动中间轴
const toggleMovePaused = async () => {
  const paused = !movePaused.value
  try {
    await requestUE(tool.className, 'setRollerBlindMovePaused', { movePaused: paused })
    movePaused.value = paused
    actionMessage.value = paused ? '已暂停移动中间轴' : '已继续移动中间轴'
  } catch (error) {
    console.error('设置暂停移动失败:', error)
    actionMessage.value = '设置暂停移动失败'
  }
}

// 读取是否暂停移动中间轴
const getMovePaused = async () => {
  try {
    await tool.getRollerBlindMovePaused((result: { movePaused?: boolean }) => {
      if (typeof result?.movePaused === 'boolean') {
        movePaused.value = result.movePaused
      }
    })
    actionMessage.value = `当前${movePaused.value ? '已暂停' : '未暂停'}移动中间轴`
  } catch (error) {
    console.error('读取暂停状态失败:', error)
    actionMessage.value = '读取暂停状态失败'
  }
}

onViewerSessionLeave(async () => {
  if (isToolActive.value) {
    await requestUE(tool.className, 'finishTool')
  }
  if (leftLayer.value) {
    await requestUE(leftLayer.value.className, 'removeInstance', { id: leftLayer.value.id })
  }
  if (rightLayer.value) {
    await requestUE(rightLayer.value.className, 'removeInstance', { id: rightLayer.value.id })
  }
})
</script>

<template>
  <div>
    <div class="title">卷帘对比工具</div>
    <div class="split_line"></div>

    <div class="control-group">
      <el-button
        :type="isToolActive ? 'danger' : 'primary'"
        @click="isToolActive ? stopTool() : startTool()"
        style="margin: 10px;">
        {{ isToolActive ? '停止工具' : '激活工具' }}
      </el-button>

      <el-button
        type="info"
        @click="getCurrentPosition"
        :loading="isLoadingPosition"
        style="margin: 10px;">
        获取当前位置
      </el-button>
    </div>

    <div class="control-group">
      <h4 class="section-title">模型卷帘对比</h4>
      <el-form-item label="Tileset 路径" class="ruihua">
        <el-input
          v-model="tilesetPath"
          placeholder="file:///D:/data/九华山/5cm/3Dtiles/tileset.json"
          style="width: 360px;" />
      </el-form-item>
      <div class="action-row">
        <el-button
          type="success"
          :loading="isCreatingModels"
          @click="createCompareLayers">
          创建对比模型
        </el-button>
        <el-button
          type="warning"
          :disabled="!hasCompareLayers"
          :loading="isClearingModels"
          @click="clearCompareLayers">
          清理对比模型
        </el-button>
      </div>
      <div class="layer-status">
        <p>左侧模型：{{ leftLayerStatus }}</p>
        <p>右侧模型：{{ rightLayerStatus }}</p>
        <p>右侧 Unlight：{{ rightLayerUnlight ? '已设置' : '未设置' }}</p>
      </div>
    </div>

    <div class="control-group">
      <h4 class="section-title">卷帘位置</h4>
      <el-form-item :label="`卷帘位置 ${percentText}`" class="ruihua">
        <el-slider
          v-model="rollerBlindPosition"
          :min="0"
          :max="1"
          :step="0.01"
          :disabled="!isToolActive"
          style="width: 300px;"
          @input="applyPosition" />
      </el-form-item>
      <div class="position-text">
        当前数值：{{ rollerBlindPosition.toFixed(2) }}
      </div>
    </div>

    <div class="control-group">
      <h4 class="section-title">分界线设置</h4>
      <el-form-item label="贴图路径" class="ruihua">
        <el-input
          v-model="lineTexturePath"
          placeholder="本地路径 / base64 / http(s) URL，留空不修改"
          style="width: 360px;" />
      </el-form-item>
      <el-form-item label="贴图宽度" class="ruihua">
        <el-input-number v-model="lineTextureWidth" :min="0" :step="1" />
        <el-button
          type="primary"
          :disabled="!isToolActive"
          @click="applyLineTexture"
          style="margin-left: 10px;">
          应用贴图
        </el-button>
      </el-form-item>
      <el-form-item label="拖拽热区" class="ruihua">
        <el-input-number v-model="hitThreshold" :min="1" :step="1" />
        <el-button
          type="primary"
          :disabled="!isToolActive"
          @click="applyHitThreshold"
          style="margin-left: 10px;">
          应用热区
        </el-button>
      </el-form-item>
      <div class="action-row">
        <el-button
          :type="movePaused ? 'success' : 'warning'"
          :disabled="!isToolActive"
          @click="toggleMovePaused">
          {{ movePaused ? '继续移动' : '暂停移动' }}
        </el-button>
        <el-button
          type="info"
          :disabled="!isToolActive"
          @click="getMovePaused">
          读取暂停状态
        </el-button>
      </div>
    </div>

    <div class="status-panel" :class="{ active: isToolActive }">
      <p>当前状态：{{ isToolActive ? '工具已激活' : '工具未激活' }}</p>
      <p>Tileset 路径：{{ tilesetPath || '未填写' }}</p>
      <p>左侧默认材质模型：{{ leftLayerStatus }}</p>
      <p>右侧 Unlight 模型：{{ rightLayerStatus }}</p>
      <p>右侧 Unlight 状态：{{ rightLayerUnlight ? '已设置' : '未设置' }}</p>
      <p>卷帘位置：{{ rollerBlindPosition.toFixed(2) }} / {{ percentText }}</p>
      <p>中间轴移动：{{ movePaused ? '已暂停' : '可移动' }}</p>
      <p v-if="isToolActive">拖动滑块即可调整卷帘分界线位置</p>
      <p class="action-message">最近操作：{{ actionMessage }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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

.layer-status {
  margin: 12px 0 0 15px;
  color: #e1bb82;
  font-size: 13px;

  p {
    margin: 4px 0;
  }
}

.position-text {
  margin-left: 15px;
  color: #e1bb82;
  font-size: 13px;
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
