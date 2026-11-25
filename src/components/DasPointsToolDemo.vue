<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { usePointPicking } from '../utils/usePointPicking'
import { DasPointsTool } from "./lib/Tool/DasPointsTool.js"
import { isUESuccess } from "./lib/ExcuteUEFun.js"
import { DasPointsLayer } from "./lib/Layer/DasPointsLayer.js"

// 工具状态
const { isToolActive, changingTool, startTool, stopTool } = usePointPicking()

// 图层相关状态
const getShareData = inject<(key: string) => unknown>('getShareData')!
type PointState = { layer?: DasPointsLayer; visible: boolean; pending: boolean; autoScale: boolean }
const session = getShareData('viewerSession') as { pointDrawing?: PointState } | null
if (session && !session.pointDrawing) session.pointDrawing = { visible: true, pending: false, autoScale: true }
const state = session?.pointDrawing
const currentLayer = computed(() => state?.layer)
const currentLayerId = computed(() => currentLayer.value?.id || '')
const layerVisible = computed(() => state?.visible ?? true)

// 工具参数
const toolParams = ref({
  texturePath: '',
  pointSize: [50, 50] as [number, number],
  enableDepthTest: true
})

// AutoScale参数
const autoScale = computed({
  get: () => state?.autoScale ?? true,
  set: (value: boolean) => { if (state) state.autoScale = value },
})

// 更新工具参数
const updateToolParams = async () => {
  try {
    const params = {
      texturePath: toolParams.value.texturePath,
      pointSize: toolParams.value.pointSize,
      enableDepthTest: toolParams.value.enableDepthTest
    }
    await DasPointsTool.updateAll(params)
    console.log('工具参数已更新:', params)
  } catch (error) {
    console.error('更新工具参数失败:', error)
  }
}

// 设置深度测试
const setDepthTest = async (value: boolean) => {
  try {
    toolParams.value.enableDepthTest = value
    await DasPointsTool.setDepthTest(value)
    console.log('深度测试设置已更新:', value)
  } catch (error) {
    console.error('设置深度测试失败:', error)
  }
}

// 获取工具参数并创建图层
const createLayerFromTool = async () => {
  if (!state || state.pending) return
  state.pending = true
  try {
    const info = await DasPointsTool.getAll()
    if (session !== getShareData('viewerSession')) return
    if (!Array.isArray(info.posLLH) || info.posLLH.length !== 3 || !info.posLLH.every(Number.isFinite)) {
      console.warn('请先在场景中拾取一个点')
      return
    }
    const result = await DasPointsLayer.createInstance({
      param: {
        posLLH: info.posLLH, texturePath: info.texturePath, pointSize: info.pointSize,
        enableDepthTest: info.enableDepthTest, IsSpread: true, autoScale: autoScale.value,
      }
    })
    if (!result?.id) return
    state.layer = result
    state.visible = true
    console.log('已从工具创建图层:', result)
  } catch (error) {
    console.error('创建图层失败:', error)
  } finally {
    state.pending = false
  }
}

// 设置图层AutoScale
const setLayerAutoScale = async (value: boolean) => {
  try {
    if (!currentLayer.value) {
      console.warn('请先创建图层')
      return
    }
    const layer = currentLayer.value
    const reply = await layer.setAutoScale(value)
    if (currentLayer.value !== layer || !isUESuccess(reply)) return
    autoScale.value = value
    console.log('图层AutoScale设置已更新:', value)
  } catch (error) {
    console.error('设置图层AutoScale失败:', error)
  }
}

// 获取图层AutoScale状态
const getLayerAutoScale = async () => {
  try {
    if (!currentLayer.value) {
      console.warn('请先创建图层')
      return
    }
    autoScale.value = await currentLayer.value.isAutoScale()
    console.log('图层AutoScale状态:', autoScale.value)
  } catch (error) {
    console.error('获取图层AutoScale状态失败:', error)
  }
}

// 定位图层
const locateLayer = async () => {
  await currentLayer.value?.flyToThis()
}

// 显隐图层
const toggleLayerVisibility = async () => {
  const layer = currentLayer.value
  if (!state || !layer || state.pending) return
  const visible = !layerVisible.value
  const response = await layer.setVisible(visible)
  if (currentLayer.value === layer && isUESuccess(response)) state.visible = visible
}

// 删除图层
const deleteLayer = async () => {
  const layer = currentLayer.value
  if (!state || !layer || state.pending) return
  const response = await layer.removeInstance()
  if (currentLayer.value !== layer || !isUESuccess(response)) return
  state.layer = undefined
}
</script>

<template>
  <div>
    <div class="title">点工具控制</div>
    <div class="split_line"></div>

    <!-- 工具状态控制 -->
    <div class="control-group">
      <el-button 
        :type="isToolActive ? 'danger' : 'primary'" 
        :loading="changingTool" @click="isToolActive ? stopTool() : startTool()"
        style="margin: 10px;">
        {{ isToolActive ? '停止工具' : '启动工具' }}
      </el-button>
      
      <el-button type="success" :disabled="!state || state.pending" @click="createLayerFromTool" style="margin: 10px;">
        创建图层
      </el-button>
    </div>
    
    <!-- 图层操作控制 -->
    <div class="layer-control-group">
      <el-button 
        type="primary" 
        @click="locateLayer" :disabled="!currentLayerId"
        style="margin: 10px;">
        定位图层
      </el-button>
      
      <el-button 
        :type="layerVisible ? 'warning' : 'success'" 
        @click="toggleLayerVisibility" 
        :disabled="!currentLayerId"
        style="margin: 10px;">
        {{ layerVisible ? '隐藏图层' : '显示图层' }}
      </el-button>
      
      <el-button 
        type="danger" 
        @click="deleteLayer" 
        :disabled="!currentLayerId"
        style="margin: 10px;">
        删除图层
      </el-button>
    </div>

    <!-- AutoScale控制组 -->
    <div class="autoscale-control-group" v-if="currentLayer">
      <el-form-item label="AutoScale设置" class="ruihua">
        <el-switch 
          :model-value="autoScale"
          active-text="开启" 
          inactive-text="关闭"
          style="margin-left: 15px;"
          active-color="#E1BB82"
          @change="setLayerAutoScale">
        </el-switch>
      </el-form-item>
      
      <el-button type="info" @click="getLayerAutoScale" style="margin: 10px;">
        获取AutoScale状态
      </el-button>
    </div>

    <!-- 工具参数设置 -->
    <div class="params-group">
      <el-form-item label="纹理路径" class="ruihua">
        <el-input v-model="toolParams.texturePath" style="width: 200px;"></el-input>
      </el-form-item>
      
      <el-form-item label="点大小-宽" class="ruihua">
        <el-input-number v-model="toolParams.pointSize[0]" :min="1" :max="500" style="width: 120px;"></el-input-number>
      </el-form-item>
      
      <el-form-item label="点大小-高" class="ruihua">
        <el-input-number v-model="toolParams.pointSize[1]" :min="1" :max="500" style="width: 120px;"></el-input-number>
      </el-form-item>
      
      <!-- 添加深度测试控制 -->
      <el-form-item label="深度测试" class="ruihua">
        <el-switch 
          v-model="toolParams.enableDepthTest"
          active-text="开启" 
          inactive-text="关闭"
          style="margin-left: 15px;"
          active-color="#E1BB82"
          @change="setDepthTest">
        </el-switch>
      </el-form-item>
      
      <el-button type="primary" @click="updateToolParams" style="margin: 15px;">
        更新参数
      </el-button>
    </div>

    <!-- 工具状态提示 -->
    <div class="status-panel" :class="{ 'active': isToolActive }">
      <p>当前状态: {{ isToolActive ? '工具已激活' : '工具未激活' }}</p>
      <p v-if="isToolActive">您可以在场景中点击添加标记点</p>
      <p>深度测试: {{ toolParams.enableDepthTest ? '开启' : '关闭' }}</p>
      <p v-if="currentLayerId">当前图层ID: {{ currentLayerId }}</p>
      <p v-if="currentLayer">AutoScale状态: {{ autoScale ? '开启' : '关闭' }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .params-group, .layer-control-group, .autoscale-control-group {
  margin: 15px 0;
}

.autoscale-control-group {
  padding: 15px;
  border: 1px solid rgba(225, 187, 130, 0.3);
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
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
</style>
