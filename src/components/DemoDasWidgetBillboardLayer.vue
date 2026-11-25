<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef } from 'vue'
import billboardHtml from '../assets/billboard.html?raw'
import billboardUrl from '../assets/billboard.html?url'
import { usePointPicking } from '../utils/usePointPicking'
import { DasPointsTool } from './lib/Tool/DasPointsTool.js'
import { DasWidgetBillboardLayer } from './lib/Layer/DasWidgetBillboardLayer.js'

const { isToolActive, changingTool, startTool, stopTool } = usePointPicking()
const layerVisible = ref(true)
const currentLayer = shallowRef<DasWidgetBillboardLayer | null>(null)
const creating = ref(false)
let mounted = true

const billboardParams = ref({
  url: new URL(billboardUrl, document.baseURI).href,
  width: 100,
  height: 100,
  autoScale: true,
  depthOffsetRate: 0,
  blendMode: 'Transparent',
  htmlContent: billboardHtml.replace(/\r\n?/g, '\n').trimEnd()
})
const screenOffsetParams = ref({ offsetX: 0, offsetY: 0 })

async function createBillboard(useHtml: boolean) {
  if (creating.value) return
  creating.value = true
  try {
    const posLLH = await DasPointsTool.getPointPosition()
    if (!mounted || !Array.isArray(posLLH) || posLLH.length < 3) return
    const options = billboardParams.value
    const layer = await DasWidgetBillboardLayer.createInstance({
      param: {
        ...(useHtml ? { fileData: options.htmlContent } : { url: options.url }),
        width: options.width,
        height: options.height,
        posLLH,
        offsetX: screenOffsetParams.value.offsetX,
        offsetY: screenOffsetParams.value.offsetY,
        autoScale: options.autoScale,
        rate: options.depthOffsetRate,
        blendMode: options.blendMode,
      },
    })
    if (!layer || !mounted) return
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
  await layer.setVisible(visible)
  if (currentLayer.value === layer) {
    layerVisible.value = visible
  }
}

async function deleteLayer() {
  const layer = currentLayer.value
  if (!layer) return
  await layer.removeInstance()
  if (currentLayer.value === layer) {
    currentLayer.value = null
  }
}

async function getScreenOffset() {
  const layer = currentLayer.value
  if (!layer) return
  const offset = await layer.getScreenOffset()
  if (currentLayer.value === layer && offset?.length >= 2) {
    screenOffsetParams.value = { offsetX: offset[0], offsetY: offset[1] }
  }
}

onBeforeUnmount(() => {
  mounted = false
})
</script>

<template>
  <div>
    <div class="title">Billboard图层控制</div>
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
        创建URL Billboard
      </el-button>
      
      <el-button type="success" :disabled="creating" @click="createBillboard(true)" style="margin: 10px;">
        创建HTML Billboard
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
        type="danger" 
        :disabled="!currentLayer" @click="deleteLayer"
        style="margin: 10px;">
        删除图层
      </el-button>
    </div>

    <!-- 屏幕偏移控制组 -->
    <div class="screen-offset-control-group">
      <div class="section-title">屏幕偏移设置</div>
      
      <el-form-item label="X轴偏移" class="ruihua">
        <el-input-number 
          v-model="screenOffsetParams.offsetX" 
          :min="-1000" 
          :max="1000" 
          style="width: 120px;">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="Y轴偏移" class="ruihua">
        <el-input-number 
          v-model="screenOffsetParams.offsetY" 
          :min="-1000" 
          :max="1000" 
          style="width: 120px;">
        </el-input-number>
      </el-form-item>
      
      <el-button type="primary" @click="currentLayer?.setScreenOffset(screenOffsetParams.offsetX, screenOffsetParams.offsetY)" style="margin: 10px;">
        设置屏幕偏移
      </el-button>
      
      <el-button type="info" @click="getScreenOffset" style="margin: 10px;">
        获取屏幕偏移
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
        <el-input-number v-model="billboardParams.width" :min="100" :max="2000" style="width: 120px;" @change="currentLayer?.setBillboardSize(billboardParams.width, billboardParams.height)"></el-input-number>
      </el-form-item>

      <el-form-item label="高度" class="ruihua">
        <el-input-number v-model="billboardParams.height" :min="100" :max="2000" style="width: 120px;" @change="currentLayer?.setBillboardSize(billboardParams.width, billboardParams.height)"></el-input-number>
      </el-form-item>
      
      <el-form-item label="自动缩放" class="ruihua">
        <el-switch 
          v-model="billboardParams.autoScale"
          active-text="开启" 
          inactive-text="关闭"
          style="margin-left: 15px;"
          active-color="#E1BB82"
          @change="currentLayer?.setAutoScale(billboardParams.autoScale)">
        </el-switch>
      </el-form-item>
      
      <el-form-item label="深度偏移系数" class="ruihua">
        <el-input-number 
          v-model="billboardParams.depthOffsetRate" 
          :min="0" 
          :max="10" 
          :step="0.1" 
          style="width: 120px;"
          @change="currentLayer?.setDepthOffsetRate(billboardParams.depthOffsetRate)">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="混合模式" class="ruihua">
        <el-select 
          v-model="billboardParams.blendMode" 
          style="width: 120px;"
          @change="currentLayer?.setBlendMode(billboardParams.blendMode)">
          <el-option label="不透明" value="Opaque"></el-option>
          <el-option label="遮罩" value="Masked"></el-option>
          <el-option label="透明" value="Transparent"></el-option>
        </el-select>
      </el-form-item>
    </div>

    <!-- 工具状态提示 -->
    <div class="status-panel" :class="{ 'active': isToolActive }">
      <p>当前状态: {{ isToolActive ? '工具已激活' : '工具未激活' }}</p>
      <p v-if="isToolActive">您可以在场景中点击添加Billboard</p>
      <p v-if="currentLayer">当前图层ID: {{ currentLayer.id }}</p>
      <p v-if="currentLayer">屏幕偏移: X={{ screenOffsetParams.offsetX }}, Y={{ screenOffsetParams.offsetY }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .params-group, .layer-control-group, .screen-offset-control-group {
  margin: 15px 0;
}

.screen-offset-control-group {
  padding: 15px;
  border: 1px solid rgba(225, 187, 130, 0.3);
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
}

.section-title {
  font-size: 16px;
  color: #e1bb82;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(225, 187, 130, 0.3);
  padding-bottom: 5px;
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
