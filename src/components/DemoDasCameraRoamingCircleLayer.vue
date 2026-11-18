<script setup lang="ts">
import { ref } from 'vue'
import { DasCameraRoamingCircleLayer } from "./lib/Layer/DasCameraRoamingCircleLayer.js"
import { DasGroupLayer } from "./lib/Layer/DasGroupLayer.js"
import { DasPointsTool } from "./lib/Tool/DasPointsTool.js"

// 图层状态
const layerVisible = ref(true)
const currentLayerId = ref(null)
const isFlying = ref(false)

// 工具状态
const isToolActive = ref(false)
const selectedPoint = ref<number[]>([])

// 环绕参数
const circleParams = ref({
  rotationRadius: 100, // 环绕半径（米）
  cameraPitch: 30,     // 相机俯仰角（度）
  flightTime: 20,      // 环绕一圈所需时间（秒）
  loopFlight: true,    // 是否循环飞行
  longitude: 0,        // 原点经度
  latitude: 0,         // 原点纬度
  height: 0            // 原点高度（米）
})

// 启动点工具
const startPointTool = async () => {
  try {
    DasPointsTool.setToCurrent()
    isToolActive.value = true
    console.log('点工具已启动')
  } catch (error) {
    console.error('启动点工具失败:', error)
  }
}

// 停止点工具
const stopPointTool = async () => {
  try {
    // 切换到默认工具
    DasPointsTool.finishTool()
    isToolActive.value = false
    console.log('点工具已停止')
  } catch (error) {
    console.error('停止点工具失败:', error)
  }
}

// 获取当前点位
const getCurrentPoint = async () => {
  try {
    const point = await DasPointsTool.getPointPosition()
    selectedPoint.value = point
    // 自动设置到环绕参数中
    if (point && point.length >= 3) {
      circleParams.value.longitude = point[0]
      circleParams.value.latitude = point[1]
      circleParams.value.height = point[2]
    }
    console.log('获取当前点位:', point)
  } catch (error) {
    console.error('获取当前点位失败:', error)
  }
}

// 清除点位
const clearPoints = async () => {
  try {
    selectedPoint.value = []
    console.log('已清除点位')
  } catch (error) {
    console.error('清除点位失败:', error)
  }
}

// 创建相机环绕图层
const createCircleLayer = async () => {
  try {
    // 如果有选中的点位，则使用该点位创建环绕图层
    if (selectedPoint.value.length > 0) {
      console.log('使用选中点位创建环绕图层:', selectedPoint.value)
    }
    
    const result = await DasCameraRoamingCircleLayer.createInstance({
      param: {
        rotationRadius: circleParams.value.rotationRadius,
        cameraPitch: circleParams.value.cameraPitch,
        flightTime: circleParams.value.flightTime,
        loopFlight: circleParams.value.loopFlight,
        longitude: circleParams.value.longitude,
        latitude: circleParams.value.latitude,
        height: circleParams.value.height,
        IsPermanentLayer: true
      }
    })
    currentLayerId.value = result
    console.log('已创建相机环绕图层:', result)
    await loadSettings()
  } catch (error) {
    console.error('创建相机环绕图层失败:', error)
  }
}

// 检查图层是否已创建
const checkLayerExists = () => {
  if (!currentLayerId.value) {
    console.warn('请先创建相机环绕图层')
    return false
  }
  return true
}

// 开始环绕飞行
const startCircleFlight = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.startCircleFlight()
    isFlying.value = true
    console.log('已开始环绕飞行')
  } catch (error) {
    console.error('开始环绕飞行失败:', error)
  }
}

// 停止环绕飞行
const stopCircleFlight = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.stopCircleFlight()
    isFlying.value = false
    console.log('已停止环绕飞行')
  } catch (error) {
    console.error('停止环绕飞行失败:', error)
  }
}

// 设置环绕半径
const setRotationRadius = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.setRotationRadius(circleParams.value.rotationRadius)
    console.log('已设置环绕半径:', circleParams.value.rotationRadius)
  } catch (error) {
    console.error('设置环绕半径失败:', error)
  }
}

// 设置相机俯仰角
const setCameraPitch = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.setCameraPitch(circleParams.value.cameraPitch)
    console.log('已设置相机俯仰角:', circleParams.value.cameraPitch)
  } catch (error) {
    console.error('设置相机俯仰角失败:', error)
  }
}

// 设置环绕一圈所需时间
const setFlightTime = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.setFlightTime(circleParams.value.flightTime)
    console.log('已设置环绕时间:', circleParams.value.flightTime)
  } catch (error) {
    console.error('设置环绕时间失败:', error)
  }
}

// 设置是否循环飞行
const setLoopFlight = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.setLoopFlight(circleParams.value.loopFlight)
    console.log('已设置循环飞行:', circleParams.value.loopFlight)
  } catch (error) {
    console.error('设置循环飞行失败:', error)
  }
}

// 获取环绕飞行设置
const loadSettings = async () => {
  try {
    if (!checkLayerExists()) return
    
    const settings = await currentLayerId.value.getCircleFlightSettings()
    circleParams.value = {
      ...circleParams.value,
      ...settings
    }
    console.log('已获取环绕飞行设置:', settings)
  } catch (error) {
    console.error('获取环绕飞行设置失败:', error)
  }
}

// 设置原点坐标
const setOriginLLH = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.setOriginLLH(
      circleParams.value.longitude,
      circleParams.value.latitude,
      circleParams.value.height
    )
    console.log('已设置原点坐标:', {
      longitude: circleParams.value.longitude,
      latitude: circleParams.value.latitude,
      height: circleParams.value.height
    })
  } catch (error) {
    console.error('设置原点坐标失败:', error)
  }
}

// 获取原点坐标
const getOriginLLH = async () => {
  try {
    if (!checkLayerExists()) return
    
    const originLLH = await currentLayerId.value.getOriginLLH()
    circleParams.value.longitude = originLLH.longitude
    circleParams.value.latitude = originLLH.latitude
    circleParams.value.height = originLLH.height
    console.log('已获取原点坐标:', originLLH)
  } catch (error) {
    console.error('获取原点坐标失败:', error)
  }
}

// 更新所有参数
const updateAllSettings = async () => {
  try {
    if (!checkLayerExists()) return
    
    const params = {
      rotationRadius: circleParams.value.rotationRadius,
      cameraPitch: circleParams.value.cameraPitch,
      flightTime: circleParams.value.flightTime,
      loopFlight: circleParams.value.loopFlight,
      longitude: circleParams.value.longitude,
      latitude: circleParams.value.latitude,
      height: circleParams.value.height
    }
    
    await currentLayerId.value.updateAll(params)
    console.log('已更新所有环绕飞行参数:', params)
  } catch (error) {
    console.error('更新所有环绕飞行参数失败:', error)
  }
}

// 定位图层
const locateLayer = async () => {
  try {
    if (!checkLayerExists()) return
    
    const pRoot = await DasGroupLayer.getRoot()
    const allLayers = await pRoot.getAllLayer()
    if (allLayers && allLayers.length > 0) {
      await allLayers[0].flyToThis()
    }
  } catch (error) {
    console.error('定位图层失败:', error)
  }
}

// 显隐图层
const toggleLayerVisibility = async () => {
  try {
    if (!checkLayerExists()) return
    
    const pRoot = await DasGroupLayer.getRoot()
    layerVisible.value = !layerVisible.value
    await pRoot.setVisible(layerVisible.value)
  } catch (error) {
    console.error('切换图层可见性失败:', error)
  }
}

// 删除图层
const deleteLayer = async () => {
  try {
    if (!checkLayerExists()) return
    
    const pRoot = await DasGroupLayer.getRoot()
    await pRoot.removeAllLayer()
    currentLayerId.value = null
    isFlying.value = false
  } catch (error) {
    console.error('删除图层失败:', error)
  }
}
</script>

<template>
  <div>
    <div class="title">相机环绕图层控制</div>
    <div class="split_line"></div>

    <!-- 点工具控制 -->
    <div class="tool-control-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">点工具控制</h4>
      
      <div style="margin: 15px 0; display: flex; flex-wrap: wrap;">
        <el-button 
          :type="isToolActive ? 'danger' : 'primary'" 
          @click="isToolActive ? stopPointTool() : startPointTool()"
          style="margin: 5px;">
          {{ isToolActive ? '停止点工具' : '启动点工具' }}
        </el-button>
        
        <el-button 
          type="primary" 
          @click="getCurrentPoint"
          :disabled="!isToolActive"
          style="margin: 5px;">
          获取当前点位
        </el-button>
        
        <el-button 
          type="danger" 
          @click="clearPoints"
          :disabled="!isToolActive || selectedPoint.length === 0"
          style="margin: 5px;">
          清除点位
        </el-button>
      </div>
      
      <div v-if="selectedPoint.length > 0" class="point-info">
        <p>当前选中点位: [{{ selectedPoint.join(', ') }}]</p>
      </div>
    </div>

    <!-- 图层操作控制 -->
    <div class="layer-control-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">图层控制</h4>
      
      <div style="margin: 15px 0; display: flex; flex-wrap: wrap;">
        <el-button 
          type="primary" 
          @click="createCircleLayer" 
          style="margin: 5px;">
          创建环绕图层
        </el-button>
        
        <el-button 
          type="primary" 
          @click="locateLayer" 
          style="margin: 5px;"
          :disabled="!currentLayerId">
          定位图层
        </el-button>
        
        <el-button 
          :type="layerVisible ? 'warning' : 'success'" 
          @click="toggleLayerVisibility"
          style="margin: 5px;"
          :disabled="!currentLayerId">
          {{ layerVisible ? '隐藏图层' : '显示图层' }}
        </el-button>
        
        <el-button 
          type="danger" 
          @click="deleteLayer"
          style="margin: 5px;"
          :disabled="!currentLayerId">
          删除图层
        </el-button>
      </div>
    </div>

    <!-- 飞行控制 -->
    <div class="flight-control-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">飞行控制</h4>
      
      <div style="margin: 15px 0; display: flex; flex-wrap: wrap;">
        <el-button 
          :type="isFlying ? 'danger' : 'success'" 
          @click="isFlying ? stopCircleFlight() : startCircleFlight()"
          :disabled="!currentLayerId"
          style="margin: 5px;">
          {{ isFlying ? '停止环绕飞行' : '开始环绕飞行' }}
        </el-button>
      </div>
    </div>

    <!-- 参数设置 -->
    <div class="params-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">环绕参数设置</h4>
      
      <el-form-item label="原点经度" class="ruihua">
        <el-input-number 
          v-model="circleParams.longitude" 
          :precision="6"
          :step="0.000001" 
          style="width: 150px;">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="原点纬度" class="ruihua">
        <el-input-number 
          v-model="circleParams.latitude" 
          :precision="6"
          :step="0.000001" 
          style="width: 150px;">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="原点高度(米)" class="ruihua">
        <el-input-number 
          v-model="circleParams.height" 
          :min="-100000000000" 
          :max="10000000000000" 
          :step="1" 
          style="width: 120px;">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="环绕半径(米)" class="ruihua">
        <el-input-number 
          v-model="circleParams.rotationRadius" 
          :min="1" 
          :max="1000000000000" 
          :step="10" 
          style="width: 120px;">
        </el-input-number>
        <el-button 
          type="primary" 
          size="small" 
          @click="setRotationRadius" 
          style="margin-left: 10px;"
          :disabled="!currentLayerId">
          应用
        </el-button>
      </el-form-item>
      
      <el-form-item label="相机俯仰角(度)" class="ruihua">
        <el-input-number 
          v-model="circleParams.cameraPitch" 
          :min="-90" 
          :max="90" 
          :step="5" 
          style="width: 120px;">
        </el-input-number>
        <el-button 
          type="primary" 
          size="small" 
          @click="setCameraPitch" 
          style="margin-left: 10px;"
          :disabled="!currentLayerId">
          应用
        </el-button>
      </el-form-item>
      
      <el-form-item label="环绕时间(秒)" class="ruihua">
        <el-input-number 
          v-model="circleParams.flightTime" 
          :min="1" 
          :max="100" 
          :step="1" 
          style="width: 120px;">
        </el-input-number>
        <el-button 
          type="primary" 
          size="small" 
          @click="setFlightTime" 
          style="margin-left: 10px;"
          :disabled="!currentLayerId">
          应用
        </el-button>
      </el-form-item>
      
      <el-form-item label="循环飞行" class="ruihua">
        <el-switch 
          v-model="circleParams.loopFlight"
          active-text="开启" 
          inactive-text="关闭"
          style="margin-left: 15px;"
          active-color="#E1BB82"
          @change="setLoopFlight">
        </el-switch>
      </el-form-item>
      
      <el-button 
        type="primary" 
        @click="updateAllSettings" 
        style="margin: 15px;"
        :disabled="!currentLayerId">
        更新所有参数
      </el-button>
    </div>

    <!-- 状态提示 -->
    <div class="status-panel" :class="{ 'active': isFlying }">
      <p v-if="currentLayerId">当前图层ID: {{ currentLayerId.id }}</p>
      <p v-else>未创建图层</p>
      <p v-if="isToolActive">点工具已激活</p>
      <p>飞行状态: {{ isFlying ? '正在环绕飞行' : '未飞行' }}</p>
      <p>循环飞行: {{ circleParams.loopFlight ? '开启' : '关闭' }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tool-control-group, .layer-control-group, .flight-control-group, .params-group {
  margin: 15px 0;
}

.point-info {
  margin: 10px 0;
  padding: 10px;
  background: rgba(225, 187, 130, 0.1);
  border-radius: 4px;
  color: #e1bb82;
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