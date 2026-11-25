<script setup lang="ts">
import { ref } from 'vue'
import { DasCameraRoamingLayer } from "./lib/Layer/DasCameraRoamingLayer.js"

// 图层状态
const layerVisible = ref(true)
const currentLayer = ref<DasCameraRoamingLayer | null>(null)
const isFlying = ref(false)

// 相机点位数据
const cameraPositions = ref<any[]>([])
const selectedPositionIndex = ref(-1)

// 飞行参数
const flyDuration = ref(2.0)

// 创建相机漫游图层
const createCameraRoamingLayer = async () => {
  try {
    const result = await DasCameraRoamingLayer.createInstance({
      param: {
        positions: []
      }
    })
    currentLayer.value = result
    layerVisible.value = true
    console.log('已创建相机漫游图层:', result)
    await loadPositions()
  } catch (error) {
    console.error('创建相机漫游图层失败:', error)
  }
}

// 添加当前相机位置
const addCurrentCameraPosition = async () => {
  try {
    if (!currentLayer.value) return
    
    const layer = currentLayer.value
    await layer.addCurrentCameraPosition()
    console.log('已添加当前相机位置')
    await loadPositions()
  } catch (error) {
    console.error('添加当前相机位置失败:', error)
  }
}

// 更新指定索引的相机位置
const updateCameraPosition = async () => {
  try {
    if (!currentLayer.value) return
    
    if (selectedPositionIndex.value < 0) {
      console.warn('请先选择一个相机位置')
      return
    }
    
    const layer = currentLayer.value
    await layer.updateCameraPositionWithIndex(selectedPositionIndex.value)
    console.log(`已更新索引为 ${selectedPositionIndex.value} 的相机位置`)
    await loadPositions()
  } catch (error) {
    console.error('更新相机位置失败:', error)
  }
}

// 更新指定索引的飞行时间
const updateFlyDuration = async () => {
  try {
    if (!currentLayer.value) return
    
    if (selectedPositionIndex.value < 0) {
      console.warn('请先选择一个相机位置')
      return
    }
    
    const layer = currentLayer.value
    await layer.updateCameraFlyDurationWithIndex(selectedPositionIndex.value, flyDuration.value)
    console.log(`已更新索引为 ${selectedPositionIndex.value} 的飞行时间为 ${flyDuration.value}`)
    await loadPositions()
  } catch (error) {
    console.error('更新飞行时间失败:', error)
  }
}

// 删除指定索引的相机位置
const removeCameraPosition = async () => {
  try {
    if (!currentLayer.value) return
    
    if (selectedPositionIndex.value < 0) {
      console.warn('请先选择一个相机位置')
      return
    }
    
    const layer = currentLayer.value
    await layer.removeCameraPositionWithIndex(selectedPositionIndex.value)
    console.log(`已删除索引为 ${selectedPositionIndex.value} 的相机位置`)
    selectedPositionIndex.value = -1
    await loadPositions()
  } catch (error) {
    console.error('删除相机位置失败:', error)
  }
}

// 清除所有相机位置
const clearAllPositions = async () => {
  try {
    if (!currentLayer.value) return
    
    const layer = currentLayer.value
    await layer.clearCameraPosition()
    console.log('已清除所有相机位置')
    selectedPositionIndex.value = -1
    await loadPositions()
  } catch (error) {
    console.error('清除相机位置失败:', error)
  }
}

// 飞到指定索引的相机位置
const flyToPosition = async () => {
  try {
    if (!currentLayer.value) return
    
    if (selectedPositionIndex.value < 0) {
      console.warn('请先选择一个相机位置')
      return
    }
    
    const layer = currentLayer.value
    await layer.flyToCameraPositionWithIndex(selectedPositionIndex.value)
    console.log(`正在飞往索引为 ${selectedPositionIndex.value} 的相机位置`)
  } catch (error) {
    console.error('飞往相机位置失败:', error)
  }
}

// 开始全部飞行
const startFlightAll = async () => {
  try {
    if (!currentLayer.value) return
    
    const layer = currentLayer.value
    await layer.startFlightAll()
    isFlying.value = true
    console.log('已开始全部飞行')
  } catch (error) {
    console.error('开始全部飞行失败:', error)
  }
}

// 停止全部飞行
const stopFlightAll = async () => {
  try {
    if (!currentLayer.value) return
    
    const layer = currentLayer.value
    await layer.stopFlightAll()
    isFlying.value = false
    console.log('已停止全部飞行')
  } catch (error) {
    console.error('停止全部飞行失败:', error)
  }
}

// 获取所有点位信息
const loadPositions = async () => {
  try {
    if (!currentLayer.value) {
      cameraPositions.value = []
      return
    }
    
    const layer = currentLayer.value
    const positions = await layer.getAllPositionInfo()
    cameraPositions.value = positions
    console.log('已获取所有相机点位信息:', positions)
  } catch (error) {
    console.error('获取相机点位信息失败:', error)
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
    isFlying.value = false
    cameraPositions.value = []
    selectedPositionIndex.value = -1
  } catch (error) {
    console.error('删除图层失败:', error)
  }
}

// 选择点位
const selectPosition = (index: number) => {
  selectedPositionIndex.value = index
  if (cameraPositions.value[index] && cameraPositions.value[index].duration) {
    flyDuration.value = cameraPositions.value[index].duration
  }
}
</script>

<template>
  <div>
    <div class="title">相机漫游图层控制</div>
    <div class="split_line"></div>

    <!-- 图层操作控制 -->
    <div class="layer-control-group">
      <el-button 
        type="primary" 
        @click="createCameraRoamingLayer" 
        style="margin: 10px;">
        创建相机漫游图层
      </el-button>
      
      <el-button 
        type="primary" 
        @click="locateLayer" 
        style="margin: 10px;"
        :disabled="!currentLayer">
        定位图层
      </el-button>
      
      <el-button 
        :type="layerVisible ? 'warning' : 'success'" 
        @click="toggleLayerVisibility"
        style="margin: 10px;"
        :disabled="!currentLayer">
        {{ layerVisible ? '隐藏图层' : '显示图层' }}
      </el-button>
      
      <el-button 
        type="danger" 
        @click="deleteLayer"
        style="margin: 10px;"
        :disabled="!currentLayer">
        删除图层
      </el-button>
    </div>

    <!-- 相机位置控制 -->
    <div class="camera-control-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">相机位置控制</h4>
      
      <div style="margin: 15px 0; display: flex; flex-wrap: wrap;">
        <el-button 
          type="primary" 
          @click="addCurrentCameraPosition"
          style="margin: 5px;">
          添加当前相机位置
        </el-button>
        
        <el-button 
          type="warning" 
          @click="updateCameraPosition"
          :disabled="selectedPositionIndex < 0 || !currentLayer"
          style="margin: 5px;">
          更新选中位置
        </el-button>
        
        <el-button 
          type="danger" 
          @click="removeCameraPosition"
          :disabled="selectedPositionIndex < 0 || !currentLayer"
          style="margin: 5px;">
          删除选中位置
        </el-button>
        
        <el-button 
          type="danger" 
          @click="clearAllPositions"
          :disabled="!currentLayer || cameraPositions.length === 0"
          style="margin: 5px;">
          清除所有位置
        </el-button>
      </div>
      
      <!-- 飞行控制 -->
      <div style="margin: 15px 0;">
        <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">飞行控制</h4>
        
        <el-form-item label="飞行时间(秒)" class="ruihua">
          <el-input-number 
            v-model="flyDuration" 
            :min="0" :max="10000" :step="0.1" 
            style="width: 120px;">
          </el-input-number>
          
          <el-button 
            type="success" 
            @click="updateFlyDuration"
            :disabled="selectedPositionIndex < 0 || !currentLayer"
            style="margin-left: 10px;">
            更新飞行时间
          </el-button>
        </el-form-item>
        
        <div style="margin: 15px 0; display: flex; flex-wrap: wrap;">
          <el-button 
            type="primary" 
            @click="flyToPosition"
            :disabled="selectedPositionIndex < 0 || !currentLayer"
            style="margin: 5px;">
            飞到选中位置
          </el-button>
          
          <el-button 
            :type="isFlying ? 'danger' : 'success'" 
            @click="isFlying ? stopFlightAll() : startFlightAll()"
            :disabled="!currentLayer || cameraPositions.length === 0"
            style="margin: 5px;">
            {{ isFlying ? '停止全部飞行' : '开始全部飞行' }}
          </el-button>
        </div>
      </div>
      
      <!-- 相机位置列表 -->
      <div class="position-list">
        <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">相机位置列表</h4>
        
        <div v-if="cameraPositions.length === 0" class="empty-list">
          暂无相机位置，请添加位置
        </div>
        
        <div v-else class="position-items">
          <div 
            v-for="(position, index) in cameraPositions" 
            :key="index"
            class="position-item"
            :class="{ 'selected': selectedPositionIndex === index }"
            @click="selectPosition(index)">
            <div class="position-index">{{ index + 1 }}</div>
            <div class="position-info">
              <div class="position-name">{{ position.name || `位置 ${index + 1}` }}</div>
              <div class="position-details">
                <span>飞行时间: {{ position.duration }}秒</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态提示 -->
    <div class="status-panel">
      <p v-if="currentLayer">当前图层ID: {{ currentLayer.id }}</p>
      <p v-else>未创建图层</p>
      <p v-if="selectedPositionIndex >= 0">已选择位置: {{ selectedPositionIndex + 1 }}</p>
      <p v-if="isFlying">飞行状态: 正在飞行</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layer-control-group, .camera-control-group {
  margin: 15px 0;
}

.status-panel {
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.1);
  color: #e1bb82;
}

.position-list {
  margin: 15px 0;
  padding: 10px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  max-height: 300px;
  overflow-y: auto;
}

.empty-list {
  color: #999;
  text-align: center;
  padding: 20px;
}

.position-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.position-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  background: rgba(225, 187, 130, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(225, 187, 130, 0.2);
  }
  
  &.selected {
    background: rgba(225, 187, 130, 0.3);
    border-left: 3px solid #E1BB82;
  }
}

.position-index {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(225, 187, 130, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: bold;
  color: #E1BB82;
}

.position-info {
  flex: 1;
}

.position-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.position-details {
  font-size: 12px;
  color: #999;
}

:deep(.el-input-number) {
  .el-input__inner {
    text-align: center;
    font-size: 12px;
  }
}
</style> 