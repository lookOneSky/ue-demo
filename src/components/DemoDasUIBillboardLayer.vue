<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef } from 'vue'
import billboardHtml from './billboardInteractive.html?raw'
import billboardUrl from './billboardInteractive.html?url'
import { usePointPicking } from '../utils/usePointPicking'
import { isUESuccess, onUEEvent } from '../utils/demoRpc.js'
import { DasPointsTool } from './lib/Tool/DasPointsTool.js'
import { DasUIBillboardLayer } from './lib/Layer/DasUIBillboardLayer.js'

const { isToolActive, changingTool, startTool, stopTool } = usePointPicking()
const layerVisible = ref(true)
const currentLayer = shallowRef<DasUIBillboardLayer | null>(null)
const creating = ref(false)
let mounted = true
let stopConsoleListener: (() => void) | undefined
const layerVisibilityStatus = ref('未知')

const billboardParams = ref({
  url: new URL(billboardUrl, document.baseURI).href,
  width: 400,
  height: 300,
  offsetX: 0,
  offsetY: 0,
  onlyWhenVisible: true,
  htmlContent: billboardHtml.replace(/\r\n?/g, '\n').trimEnd()
})

async function createBillboard(useHtml: boolean) {
  if (creating.value) return
  creating.value = true
  try {
    const posLLH = await DasPointsTool.getPointPosition()
    if (!mounted || !Array.isArray(posLLH) || posLLH.length < 3) return
    const options = billboardParams.value
    const layer = await DasUIBillboardLayer.createInstance({
      param: {
        ...(useHtml ? { fileData: options.htmlContent } : { url: options.url }),
        width: options.width,
        height: options.height,
        posLLH,
        x: options.offsetX,
        y: options.offsetY,
        onlyWhenVisible: options.onlyWhenVisible,
      } as Parameters<DasUIBillboardLayer['updateAll']>[0],
    })
    if (!layer?.id || !mounted) return
    stopConsoleListener?.()
    stopConsoleListener = onUEEvent(DasUIBillboardLayer.sClassName, 'consoleMessage', async message => {
      if (currentLayer.value !== layer || message.id !== layer.id) return
      const reply = await layer.setVisible(false)
      if (currentLayer.value === layer && isUESuccess(reply)) {
        layerVisible.value = false
        layerVisibilityStatus.value = '隐藏'
      }
    })
    layerVisibilityStatus.value = '未知'
    currentLayer.value = layer
    layerVisible.value = true
  } finally {
    creating.value = false
  }
}

async function toggleLayerVisibility() {
  const layer = currentLayer.value
  if (!layer) return
  const visible = !layerVisible.value
  const reply = await layer.setVisible(visible)
  if (currentLayer.value === layer && isUESuccess(reply)) {
    layerVisible.value = visible
    layerVisibilityStatus.value = visible ? '显示' : '隐藏'
  }
}

async function deleteLayer() {
  const layer = currentLayer.value
  if (!layer) return
  const reply = await layer.removeInstance(undefined)
  if (currentLayer.value === layer && isUESuccess(reply)) {
    stopConsoleListener?.()
    stopConsoleListener = undefined
    currentLayer.value = null
    layerVisibilityStatus.value = '未知'
  }
}

async function executeJavaScript() {
  await currentLayer.value?.excuteJavaScript("var button = document.querySelector('.debug-btn'); if (button) button.textContent = '查看详细信息'")
}

async function getLayerVisibility() {
  const layer = currentLayer.value
  if (!layer) return
  const visible = await layer.isVisible()
  if (currentLayer.value === layer) {
    layerVisible.value = visible
    layerVisibilityStatus.value = visible ? '显示' : '隐藏'
  }
}

onBeforeUnmount(() => {
  mounted = false
  stopConsoleListener?.()
})
</script>

<template>
  <div>
    <div class="title">UI Billboard图层控制</div>
    <div class="split_line"></div>

    <!-- 工具状态控制 -->
    <div class="control-group">
      <el-button 
        :type="isToolActive ? 'danger' : 'primary'" 
        :disabled="changingTool" @click="isToolActive ? stopTool() : startTool()"
        style="margin: 10px;">
        {{ isToolActive ? '停止工具' : '启动工具' }}
      </el-button>
      
      <el-button type="success" :disabled="creating" @click="createBillboard(false)" style="margin: 10px;">
        创建URL UI Billboard
      </el-button>
      
      <el-button type="success" :disabled="creating" @click="createBillboard(true)" style="margin: 10px;">
        创建HTML UI Billboard
      </el-button>
    </div>
    
    <!-- 图层操作控制 -->
    <div class="layer-control-group">
      <el-button 
        type="primary" 
        :disabled="!currentLayer" @click="currentLayer?.flyToThis()"
        style="margin: 10px;">
        定位图层
      </el-button>
      
      <el-button 
        :type="layerVisible ? 'warning' : 'success'" 
        :disabled="!currentLayer" @click="toggleLayerVisibility"
        style="margin: 10px;">
        {{ layerVisible ? '隐藏图层' : '显示图层' }}
      </el-button>
      
      <el-button 
        type="info" 
        :disabled="!currentLayer" @click="getLayerVisibility"
        style="margin: 10px;">
        获取可见性状态
      </el-button>
      
      <el-button 
        type="danger" 
        :disabled="!currentLayer" @click="deleteLayer"
        style="margin: 10px;">
        删除图层
      </el-button>
      
      <el-button 
        type="primary" 
        :disabled="!currentLayer" @click="executeJavaScript"
        style="margin: 10px;">
        执行JS代码
      </el-button>
    </div>

    <!-- Billboard参数设置 -->
    <div class="params-group">
      <el-form-item label="网页URL" class="ruihua">
        <el-input v-model="billboardParams.url" style="width: 300px;"></el-input>
      </el-form-item>
      
      <el-form-item label="HTML内容" class="ruihua">
        <el-input 
          v-model="billboardParams.htmlContent" 
          type="textarea" 
          :rows="3" 
          style="width: 300px;">
        </el-input>
      </el-form-item>
      
      <el-form-item label="宽度" class="ruihua">
        <el-input-number v-model="billboardParams.width" :min="100" :max="2000" style="width: 120px;"></el-input-number>
      </el-form-item>
      
      <el-form-item label="高度" class="ruihua">
        <el-input-number v-model="billboardParams.height" :min="100" :max="2000" style="width: 120px;"></el-input-number>
      </el-form-item>
      
      <el-form-item label="X偏移" class="ruihua">
        <el-input-number 
          v-model="billboardParams.offsetX" 
          :min="-500" 
          :max="500" 
          style="width: 120px;"
          @change="currentLayer?.setScreenOffset(billboardParams.offsetX, billboardParams.offsetY)">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="Y偏移" class="ruihua">
        <el-input-number 
          v-model="billboardParams.offsetY" 
          :min="-500" 
          :max="500" 
          style="width: 120px;"
          @change="currentLayer?.setScreenOffset(billboardParams.offsetX, billboardParams.offsetY)">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="只在点位可见时显示" class="ruihua">
        <el-switch 
          v-model="billboardParams.onlyWhenVisible"
          active-text="开启" 
          inactive-text="关闭"
          style="margin-left: 15px;"
          active-color="#E1BB82"
          @change="currentLayer?.setOnlyVisibleWhenPointVisible(billboardParams.onlyWhenVisible)">
        </el-switch>
      </el-form-item>
    </div>

    <!-- 工具状态提示 -->
    <div class="status-panel" :class="{ 'active': isToolActive }">
      <p>当前状态: {{ isToolActive ? '工具已激活' : '工具未激活' }}</p>
      <p v-if="isToolActive">您可以在场景中点击添加UI Billboard</p>
      <p v-if="currentLayer">当前图层ID: {{ currentLayer.id }}</p>
      <p v-if="layerVisibilityStatus !== '未知'">图层可见性状态: 
        <span :style="{ color: layerVisibilityStatus === '显示' ? '#67C23A' : '#F56C6C' }">
          {{ layerVisibilityStatus }}
        </span>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .params-group, .layer-control-group {
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
</style>
