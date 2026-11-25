<script setup lang="ts">
import { ref } from 'vue'
// @ts-ignore
import { DasLoadModelSubView } from "./lib/Layer/DasLoadModelSubView.js"

// 图层状态
const layerVisible = ref(true)
const currentLayer = ref<any>(null)
const isCapturing = ref(false)

// 模型参数
const modelParams = ref({
  textureWidth: 600,      // 纹理宽度
  textureHeight: 400,     // 纹理高度
  offsetX: 0,              // X轴偏移
  offsetY: 0,              // Y轴偏移
  rotationRadiusScale: 1.0, // 旋转半径缩放
  rotationTime: 10,        // 旋转时间(秒)
  rotationPitch: 30,        // 旋转俯仰角
  explodeAnimTime: 2.0,    // 炸开动画时长(秒)
  modelName: 'JD',         // 模型名称 - 默认选中第一个选项
  modelOptions: [          // 模型选项数组
    { label: '金顶', value: 'JD' },
  ]
})

// 创建模型加载器图层
const createLoadModelLayer = async () => {
  try {
    const result = await DasLoadModelSubView.createInstance({
      param: {
        width: modelParams.value.textureWidth,
        height: modelParams.value.textureHeight,
        offsetX: modelParams.value.offsetX,
        offsetY: modelParams.value.offsetY,
        RotaionRadiusScale: modelParams.value.rotationRadiusScale,
        RotationTime: modelParams.value.rotationTime,
        explodeAnimTime: modelParams.value.explodeAnimTime
      }
    })
    currentLayer.value = result
    layerVisible.value = true
    console.log('已创建模型加载器图层:', result)
    await loadAllParams()
  } catch (error) {
    console.error('创建模型加载器图层失败:', error)
  }
}

// 设置纹理大小
const setTextureSize = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.setTextureSize(modelParams.value.textureWidth, modelParams.value.textureHeight)
    console.log('已设置纹理大小:', modelParams.value.textureWidth, 'x', modelParams.value.textureHeight)
  } catch (error) {
    console.error('设置纹理大小失败:', error)
  }
}

// 设置纹理偏移
const setTextureOffset = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.setTextureOffset(modelParams.value.offsetX, modelParams.value.offsetY)
    console.log('已设置纹理偏移:', modelParams.value.offsetX, modelParams.value.offsetY)
  } catch (error) {
    console.error('设置纹理偏移失败:', error)
  }
}

// 设置旋转参数
const setRotationParams = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.setRotationParams(modelParams.value.rotationRadiusScale, modelParams.value.rotationTime)
    console.log('已设置旋转参数:', {
      rotationRadiusScale: modelParams.value.rotationRadiusScale,
      rotationTime: modelParams.value.rotationTime
    })
  } catch (error) {
    console.error('设置旋转参数失败:', error)
  }
}

// 开始捕获
const beginCapture = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.beginCapture()
    isCapturing.value = true
    console.log('已开始捕获')
  } catch (error) {
    console.error('开始捕获失败:', error)
  }
}

// 停止捕获
const stopCapture = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.stopCapture()
    isCapturing.value = false
    console.log('已停止捕获')
  } catch (error) {
    console.error('停止捕获失败:', error)
  }
}

// 异步加载模型
const loadModelAsync = async () => {
  try {
    if (!currentLayer.value) return
    
    if (!modelParams.value.modelName) {
      console.warn('请输入模型名称')
      return
    }
    
    await currentLayer.value.loadModelAsync(modelParams.value.modelName)
    console.log('已加载模型:', modelParams.value.modelName)
  } catch (error) {
    console.error('加载模型失败:', error)
  }
}

// 销毁所有模型
const destroyModels = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.destroyModels()
    console.log('已销毁所有模型')
  } catch (error) {
    console.error('销毁模型失败:', error)
  }
}

// 开始炸开动画
const startExplode = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.startExplode(modelParams.value.explodeAnimTime)
    console.log('已开始炸开动画，时长:', modelParams.value.explodeAnimTime)
  } catch (error) {
    console.error('开始炸开动画失败:', error)
  }
}

// 设置炸开动画时长
const setExplodeAnimTime = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.setExplodeAnimTime(modelParams.value.explodeAnimTime)
    console.log('已设置炸开动画时长:', modelParams.value.explodeAnimTime)
  } catch (error) {
    console.error('设置炸开动画时长失败:', error)
  }
}

// 设置旋转半径缩放
const setRotationRadiusScale = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.setRotationRadiusScale(modelParams.value.rotationRadiusScale)
    console.log('已设置旋转半径缩放:', modelParams.value.rotationRadiusScale)
  } catch (error) {
    console.error('设置旋转半径缩放失败:', error)
  }
}

// 设置旋转时间
const setRotationTime = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.setRotationTime(modelParams.value.rotationTime)
    console.log('已设置旋转时间:', modelParams.value.rotationTime)
  } catch (error) {
    console.error('设置旋转时间失败:', error)
  }
}

// 设置旋转俯仰角
const setRotationPitch = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.setRotationPitch(modelParams.value.rotationPitch)
    console.log('已设置旋转俯仰角:', modelParams.value.rotationPitch)
  } catch (error) {
    console.error('设置旋转俯仰角失败:', error)
  }
}

// 设置视口参数
const setViewportParams = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.setViewportParams(
      modelParams.value.textureWidth,
      modelParams.value.textureHeight,
      modelParams.value.offsetX,
      modelParams.value.offsetY
    )
    console.log('已设置视口参数:', {
      width: modelParams.value.textureWidth,
      height: modelParams.value.textureHeight,
      offsetX: modelParams.value.offsetX,
      offsetY: modelParams.value.offsetY
    })
  } catch (error) {
    console.error('设置视口参数失败:', error)
  }
}

// 获取所有参数
const loadAllParams = async () => {
  try {
    if (!currentLayer.value) return
    
    const allParams = await currentLayer.value.getAll()
    console.log('已获取所有参数:', allParams)
    
    // 更新界面参数
    if (allParams.explodeAnimTime !== undefined) {
      modelParams.value.explodeAnimTime = allParams.explodeAnimTime
    }
    if (allParams.RotaionRadiusScale !== undefined) {
      modelParams.value.rotationRadiusScale = allParams.RotaionRadiusScale
    }
    if (allParams.RotationTime !== undefined) {
      modelParams.value.rotationTime = allParams.RotationTime
    }
    if (allParams.RotationPitch !== undefined) {
      modelParams.value.rotationPitch = allParams.RotationPitch
    }
  } catch (error) {
    console.error('获取所有参数失败:', error)
  }
}

// 更新所有参数
const updateAllParams = async () => {
  try {
    if (!currentLayer.value) return
    
    const params = {
      explodeAnimTime: modelParams.value.explodeAnimTime,
      RotaionRadiusScale: modelParams.value.rotationRadiusScale,
      RotationTime: modelParams.value.rotationTime,
      RotationPitch: modelParams.value.rotationPitch,
      width: modelParams.value.textureWidth,
      height: modelParams.value.textureHeight,
      offsetX: modelParams.value.offsetX,
      offsetY: modelParams.value.offsetY
    }
    
    await currentLayer.value.updateAll(params)
    console.log('已更新所有参数:', params)
  } catch (error) {
    console.error('更新所有参数失败:', error)
  }
}

// 定位图层
const locateLayer = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.flyToThis()
  } catch (error) {
    console.error('定位图层失败:', error)
  }
}

// 显隐图层
const toggleLayerVisibility = async () => {
  try {
    if (!currentLayer.value) return
    
    const visible = !layerVisible.value
    await currentLayer.value.setVisible(visible)
    layerVisible.value = visible
  } catch (error) {
    console.error('切换图层可见性失败:', error)
  }
}

// 删除图层
const deleteLayer = async () => {
  try {
    if (!currentLayer.value) return
    
    await currentLayer.value.removeInstance()
    layerVisible.value = true
    currentLayer.value = null
    isCapturing.value = false
  } catch (error) {
    console.error('删除图层失败:', error)
  }
}
</script>

<template>
  <div>
    <div class="title">模型加载器图层控制</div>
    <div class="split_line"></div>

    <!-- 图层操作控制 -->
    <div class="layer-control-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">图层控制</h4>
      
      <div style="margin: 15px 0; display: flex; flex-wrap: wrap;">
        <el-button 
          type="primary" 
          @click="createLoadModelLayer" 
          style="margin: 5px;">
          创建模型加载器图层
        </el-button>
        
        <el-button :disabled="!currentLayer" @click="locateLayer">定位图层</el-button>
        <el-button 
          :type="layerVisible ? 'warning' : 'success'" 
          @click="toggleLayerVisibility"
          style="margin: 5px;"
          :disabled="!currentLayer">
          {{ layerVisible ? '隐藏图层' : '显示图层' }}
        </el-button>
        
        <el-button 
          type="danger" 
          @click="deleteLayer"
          style="margin: 5px;"
          :disabled="!currentLayer">
          删除图层
        </el-button>
      </div>
    </div>

    <!-- 捕获控制 -->
    <div class="capture-control-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">捕获控制</h4>
      
      <div style="margin: 15px 0; display: flex; flex-wrap: wrap;">
        <el-button 
          :type="isCapturing ? 'danger' : 'success'" 
          @click="isCapturing ? stopCapture() : beginCapture()"
          :disabled="!currentLayer"
          style="margin: 5px;">
          {{ isCapturing ? '停止捕获' : '开始捕获' }}
        </el-button>
      </div>
    </div>

    <!-- 模型控制 -->
    <div class="model-control-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">模型控制</h4>
      
      <el-form-item label="模型名称" class="ruihua">
        <el-select 
          v-model="modelParams.modelName" 
          placeholder="请选择模型"
          style="width: 200px;">
          <el-option
            v-for="(item, index) in modelParams.modelOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :selected="index === 0">
          </el-option>
        </el-select>
        <el-button 
          type="primary" 
          size="small" 
          @click="loadModelAsync" 
          style="margin-left: 10px;"
          :disabled="!currentLayer || !modelParams.modelName">
          加载模型
        </el-button>
      </el-form-item>
      
      <div style="margin: 15px 0; display: flex; flex-wrap: wrap;">
        <el-button 
          type="danger" 
          @click="destroyModels"
          :disabled="!currentLayer"
          style="margin: 5px;">
          销毁所有模型
        </el-button>
        
        <el-button 
          type="warning" 
          @click="startExplode"
          :disabled="!currentLayer"
          style="margin: 5px;">
          开始炸开动画
        </el-button>
      </div>
    </div>

    <!-- 纹理参数设置 -->
    <div class="texture-params-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">纹理参数设置</h4>
      
      <el-form-item label="纹理宽度" class="ruihua">
        <el-input-number 
          v-model="modelParams.textureWidth" 
          :min="1" 
          :max="10000" 
          :step="10" 
          style="width: 120px;">
        </el-input-number>
        <el-button 
          type="primary" 
          size="small" 
          @click="setTextureSize" 
          style="margin-left: 10px;"
          :disabled="!currentLayer">
          应用尺寸
        </el-button>
      </el-form-item>
      
      <el-form-item label="纹理高度" class="ruihua">
        <el-input-number 
          v-model="modelParams.textureHeight" 
          :min="1" 
          :max="10000" 
          :step="10" 
          style="width: 120px;">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="X轴偏移" class="ruihua">
        <el-input-number 
          v-model="modelParams.offsetX" 
          :step="1" 
          style="width: 120px;">
        </el-input-number>
        <el-button 
          type="primary" 
          size="small" 
          @click="setTextureOffset" 
          style="margin-left: 10px;"
          :disabled="!currentLayer">
          应用偏移
        </el-button>
      </el-form-item>
      
      <el-form-item label="Y轴偏移" class="ruihua">
        <el-input-number 
          v-model="modelParams.offsetY" 
          :step="1" 
          style="width: 120px;">
        </el-input-number>
      </el-form-item>
      
      <el-button 
        type="primary" 
        @click="setViewportParams" 
        style="margin: 15px;"
        :disabled="!currentLayer">
        设置视口参数
      </el-button>
    </div>

    <!-- 旋转参数设置 -->
    <div class="rotation-params-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">旋转参数设置</h4>
      
      <el-form-item label="旋转半径缩放" class="ruihua">
        <el-input-number 
          v-model="modelParams.rotationRadiusScale" 
          :min="0.1" 
          :max="10" 
          :step="0.1" 
          :precision="2"
          style="width: 120px;">
        </el-input-number>
        <el-button 
          type="primary" 
          size="small" 
          @click="setRotationRadiusScale" 
          style="margin-left: 10px;"
          :disabled="!currentLayer">
          应用
        </el-button>
      </el-form-item>
      
      <el-form-item label="旋转时间(秒)" class="ruihua">
        <el-input-number 
          v-model="modelParams.rotationTime" 
          :min="1" 
          :max="100" 
          :step="1" 
          style="width: 120px;">
        </el-input-number>
        <el-button 
          type="primary" 
          size="small" 
          @click="setRotationTime" 
          style="margin-left: 10px;"
          :disabled="!currentLayer">
          应用
        </el-button>
      </el-form-item>

      <el-form-item label="旋转俯仰角" class="ruihua">
        <el-input-number 
          v-model="modelParams.rotationPitch" 
          :min="-90" 
          :max="90" 
          :step="1" 
          style="width: 120px;">
        </el-input-number>
        <el-button 
          type="primary" 
          size="small" 
          @click="setRotationPitch" 
          style="margin-left: 10px;"
          :disabled="!currentLayer">
          应用
        </el-button>
      </el-form-item>
      
      <el-button 
        type="primary" 
        @click="setRotationParams" 
        style="margin: 15px;"
        :disabled="!currentLayer">
        设置旋转参数
      </el-button>
    </div>

    <!-- 动画参数设置 -->
    <div class="animation-params-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">动画参数设置</h4>
      
      <el-form-item label="炸开动画时长(秒)" class="ruihua">
        <el-input-number 
          v-model="modelParams.explodeAnimTime" 
          :min="0.1" 
          :max="10" 
          :step="0.1" 
          :precision="1"
          style="width: 120px;">
        </el-input-number>
        <el-button 
          type="primary" 
          size="small" 
          @click="setExplodeAnimTime" 
          style="margin-left: 10px;"
          :disabled="!currentLayer">
          应用
        </el-button>
      </el-form-item>
    </div>

    <!-- 参数操作 -->
    <div class="params-operations-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">参数操作</h4>
      
      <div style="margin: 15px 0; display: flex; flex-wrap: wrap;">
        <el-button 
          type="primary" 
          @click="loadAllParams" 
          style="margin: 5px;"
          :disabled="!currentLayer">
          获取所有参数
        </el-button>
        
        <el-button 
          type="success" 
          @click="updateAllParams" 
          style="margin: 5px;"
          :disabled="!currentLayer">
          更新所有参数
        </el-button>
      </div>
    </div>

    <!-- 状态提示 -->
    <div class="status-panel" :class="{ 'active': isCapturing }">
      <p v-if="currentLayer">当前图层ID: {{ currentLayer.id }}</p>
      <p v-else>未创建图层</p>
      <p>捕获状态: {{ isCapturing ? '正在捕获' : '未捕获' }}</p>
      <p>纹理尺寸: {{ modelParams.textureWidth }} x {{ modelParams.textureHeight }}</p>
      <p>纹理偏移: ({{ modelParams.offsetX }}, {{ modelParams.offsetY }})</p>
      <p>旋转参数: 缩放={{ modelParams.rotationRadiusScale }}, 时间={{ modelParams.rotationTime }}秒, 俯仰角={{ modelParams.rotationPitch }}</p>
      <p>炸开动画时长: {{ modelParams.explodeAnimTime }}秒</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layer-control-group, 
.capture-control-group, 
.model-control-group, 
.texture-params-group, 
.rotation-params-group, 
.animation-params-group, 
.params-operations-group {
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

:deep(.el-input-number) {
  .el-input__inner {
    text-align: center;
    font-size: 12px;
  }
}
</style> 