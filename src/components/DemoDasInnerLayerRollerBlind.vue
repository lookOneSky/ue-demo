<script setup lang="ts">
import { requestUE } from '../utils/demoRpc.js'
import { onViewerSessionLeave } from '../utils/onViewerSessionLeave'
import { computed, ref } from 'vue'
import { DasToolRollerBlind } from './lib/Tool/DasToolRollerBlind.js'
// @ts-ignore
import { DasGroupInnerLayer } from './lib/Layer/DasGroupInnerLayer.js'

const tool = new DasToolRollerBlind()
const isToolActive = ref(false)
const rollerBlindPosition = ref(0.5)
const isCreatingLeft = ref(false)
const isCreatingRight = ref(false)
const leftTagName = ref('Model_Old')
const rightTagName = ref('Model_Repaired')
const leftLayer = ref<any>(null)
const rightLayer = ref<any>(null)
const actionMessage = ref('未创建左右对比图层')
const isLoadingPosition = ref(false)
const lineTexturePath = ref('')
const lineTextureWidth = ref(4)
const hitThreshold = ref(20)
const movePaused = ref(false)

const tagNameOptions = [
  { label: 'Model_Old', value: 'Model_Old' },
  { label: 'Model_Repaired', value: 'Model_Repaired' },
]

const percentText = computed(() => `${Math.round(rollerBlindPosition.value * 100)}%`)
const leftLayerStatus = computed(() => leftLayer.value ? '已创建' : '未创建')
const rightLayerStatus = computed(() => rightLayer.value ? '已创建' : '未创建')

const createLeftLayer = async () => {
  isCreatingLeft.value = true
  try {
    const layer = await DasGroupInnerLayer.createInstance({ TagName: leftTagName.value })
    if (layer) {
      await layer.setRollerBlindRight(false)
      if (isToolActive.value) {
        await layer.setCastShadow(false)
        await layer.setVisible(true)
      }
      leftLayer.value = layer
      actionMessage.value = `左侧图层已创建（${leftTagName.value}）`
    }
  } catch (error) {
    console.error('创建左侧图层失败:', error)
    actionMessage.value = '创建左侧图层失败'
  } finally {
    isCreatingLeft.value = false
  }
}

const createRightLayer = async () => {
  isCreatingRight.value = true
  try {
    const layer = await DasGroupInnerLayer.createInstance({ TagName: rightTagName.value })
    if (layer) {
      await layer.setRollerBlindRight(true)
      if (isToolActive.value) {
        await layer.setCastShadow(false)
        await layer.setVisible(true)
      }
      rightLayer.value = layer
      actionMessage.value = `右侧图层已创建（${rightTagName.value}）`
    }
  } catch (error) {
    console.error('创建右侧图层失败:', error)
    actionMessage.value = '创建右侧图层失败'
  } finally {
    isCreatingRight.value = false
  }
}

// 设置左右对比图层的阴影投射开关
const setCompareLayersCastShadow = async (castShadow: boolean) => {
  if (leftLayer.value) {
    await leftLayer.value.setCastShadow(castShadow)
  }
  if (rightLayer.value) {
    await rightLayer.value.setCastShadow(castShadow)
  }
}

// 设置左右对比图层的显隐
const setCompareLayersVisible = async (visible: boolean) => {
  if (leftLayer.value) {
    await leftLayer.value.setVisible(visible)
  }
  if (rightLayer.value) {
    await rightLayer.value.setVisible(visible)
  }
}

const startTool = async () => {
  try {
    await requestUE(tool.className, 'setToCurrent')
    isToolActive.value = true
    await setCompareLayersCastShadow(false)
    await setCompareLayersVisible(true)
    actionMessage.value = '卷帘工具已激活'
  } catch (error) {
    console.error('启动卷帘工具失败:', error)
    actionMessage.value = '启动卷帘工具失败'
  }
}

const stopTool = async () => {
  try {
    await requestUE(tool.className, 'finishTool')
    isToolActive.value = false
    await setCompareLayersCastShadow(true)
    await setCompareLayersVisible(false)
    actionMessage.value = '卷帘工具已停止'
  } catch (error) {
    console.error('停止卷帘工具失败:', error)
    actionMessage.value = '停止卷帘工具失败'
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

// 读取当前卷帘分界线位置
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
})
</script>

<template>
  <div>
    <div class="title">Inner图层卷帘对比</div>
    <div class="split_line"></div>

    <div class="control-group">
      <h4 class="section-title">创建对比图层</h4>
      <div class="action-row">
        <el-select v-model="leftTagName" class="tag-select">
          <el-option
            v-for="option in tagNameOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-button type="success" :loading="isCreatingLeft" @click="createLeftLayer">
          创建左侧图层
        </el-button>
      </div>
      <div class="action-row">
        <el-select v-model="rightTagName" class="tag-select">
          <el-option
            v-for="option in tagNameOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-button type="success" :loading="isCreatingRight" @click="createRightLayer">
          创建右侧图层
        </el-button>
      </div>
      <div class="layer-status">
        <p>左侧图层：{{ leftLayerStatus }}</p>
        <p>右侧图层：{{ rightLayerStatus }}</p>
      </div>
    </div>

    <div class="control-group">
      <h4 class="section-title">卷帘工具</h4>
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
      <p>左侧图层：{{ leftLayerStatus }}（{{ leftTagName }}）</p>
      <p>右侧图层：{{ rightLayerStatus }}（{{ rightTagName }}）</p>
      <p>卷帘位置：{{ rollerBlindPosition.toFixed(2) }} / {{ percentText }}</p>
      <p>中间轴移动：{{ movePaused ? '已暂停' : '可移动' }}</p>
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
  margin: 10px 15px;
  flex-wrap: wrap;
}

.tag-select {
  width: 200px;
}

.layer-status {
  margin: 12px 0 0 15px;
  color: #e1bb82;
  font-size: 13px;

  p {
    margin: 4px 0;
  }
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
