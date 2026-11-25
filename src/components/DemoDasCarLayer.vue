<script setup lang="ts">
import { onViewerSessionLeave } from '../utils/onViewerSessionLeave'
import { ref, reactive } from 'vue'
import { DasPolylineTool } from "./lib/Tool/DasPolylineTool.js"
import { DasPolylineLayer } from "./lib/Layer/DasPolylineLayer.js"
import { DasCarLayer } from "./lib/Layer/DasCarLayer.js"

// 工具状态
const createdLayers = new Set<DasCarLayer | DasPolylineLayer>()

const isToolActive = ref(false)

// 路线和车辆状态
const currentRouteLayer = ref<DasPolylineLayer | null>(null)
const currentCarLayer = ref<DasCarLayer | null>(null)
const hasRoute = ref(false)

// 可选的蓝图路径列表
const blueprintOptions = [
  {
    label: '货车',
    value: '/DasApplication/BluePrint/Vehicle/BP_DasPoseableVehicle_PickupTruck.BP_DasPoseableVehicle_PickupTruck_C'
  },
  {
    label: '轿车',
    value: '/DasApplication/BluePrint/Vehicle/BP_DasPoseableVehicle_Supercar.BP_DasPoseableVehicle_Supercar_C'
  },
  {
    label: 'SUV',
    value: '/DasApplication/BluePrint/Vehicle/BP_DasPoseableVehicle_SUV.BP_DasPoseableVehicle_SUV_C'
  },
  {
    label: '跑车',
    value: '/DasApplication/BluePrint/Vehicle/BP_DasPoseableVehicle_RaceCar.BP_DasPoseableVehicle_RaceCar_C'
  }
]

// 车辆参数
const carParams = reactive({
  blueprintPath: '/DasApplication/BluePrint/Vehicle/BP_DasPoseableVehicle_PickupTruck.BP_DasPoseableVehicle_PickupTruck_C', // 默认蓝图路径
  speed: 1000,
  lightOn: false,
  color: '#ff0000', // 使用十六进制颜色，后续转换
  transform: {
    translation: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    scale3D: [1, 1, 1]
  }
})

// 运动状态
const isMoving = ref(false)

// 将十六进制颜色转换为 RGBA 数组
const hexToRGBA = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
    a: 1.0
  } : { r: 1, g: 0, b: 0, a: 1 }
}

// 启动工具
const startTool = async () => {
  try {
    await DasPolylineTool.setToCurrent()
    
    // 设置工具为曲线模式
    await DasPolylineTool.setSplinePoint({
      enableSpline: true,
      interpolateCount: 20
    })
    
    // 设置默认线条样式
    await DasPolylineTool.setLineColor([0, 1, 0, 1]) // 绿色线条表示路径
    await DasPolylineTool.setLineThickness(3.0, true)
    
    isToolActive.value = true
    console.log('路径绘制工具已启动（曲线模式）')
  } catch (error) {
    console.error('启动路径绘制工具失败:', error)
  }
}

// 结束工具
const stopTool = async () => {
  try {
    isToolActive.value = false
    await DasPolylineTool.finishTool()
    console.log('路径绘制工具已停止')
  } catch (error) {
    console.error('停止路径绘制工具失败:', error)
  }
}

// 创建路线
const createRoute = async () => {
  try {
    // 检查工具是否有点位
    const hasPoints = await DasPolylineTool.hasPoints()
    if (!hasPoints) {
      console.warn('没有可用的点位，请先使用工具添加路径点')
      return
    }

    // 获取工具数据
    const toolData = await DasPolylineTool.getAll()
    console.log('路径数据:', toolData)
    
    // 创建路线图层
    const routeLayer = await DasPolylineLayer.createInstance({ "param": toolData })
    if (!routeLayer) return
    createdLayers.add(routeLayer)
    currentRouteLayer.value = routeLayer
    hasRoute.value = !!routeLayer
    
    console.log('路线创建成功:', routeLayer)
  } catch (error) {
    console.error('创建路线失败:', error)
  }
}

// 创建车辆
const createCar = async () => {
  try {
    if (!hasRoute.value || !currentRouteLayer.value) {
      console.warn('请先创建路线')
      return
    }
    
    // 准备车辆参数
    const routeLayer = await currentRouteLayer.value.writeObjectInfo()
    const params = {
      blueprintPath: carParams.blueprintPath,
      param: {
        transform: carParams.transform,
        speed: carParams.speed,
        lightOn: carParams.lightOn,
        color: hexToRGBA(carParams.color),
        polyline: routeLayer // 设置路线
      }
    }
    
    // 创建车辆图层
    const carLayer = await DasCarLayer.createInstance(params)
    if (!carLayer) return
    createdLayers.add(carLayer)
    currentCarLayer.value = carLayer
    
    console.log('车辆创建成功:', carLayer)
  } catch (error) {
    console.error('创建车辆失败:', error)
  }
}

// 开始运动
const startMovement = async () => {
  try {
    if (!currentCarLayer.value) {
      console.warn('请先创建车辆')
      return
    }
    
    await currentCarLayer.value.startMovement()
    isMoving.value = true
    console.log('车辆开始运动')
  } catch (error) {
    console.error('开始运动失败:', error)
  }
}

// 停止运动
const stopMovement = async () => {
  try {
    if (!currentCarLayer.value) return
    
    await currentCarLayer.value.stopMovement()
    isMoving.value = false
    console.log('车辆停止运动')
  } catch (error) {
    console.error('停止运动失败:', error)
  }
}

// 更新速度
const updateSpeed = async () => {
  try {
    if (!currentCarLayer.value) return
    
    await currentCarLayer.value.setSpeed(carParams.speed)
    console.log('速度已更新:', carParams.speed)
  } catch (error) {
    console.error('更新速度失败:', error)
  }
}

// 更新灯光
const updateLight = async () => {
  try {
    if (!currentCarLayer.value) return
    
    await currentCarLayer.value.setLight(carParams.lightOn)
    console.log('灯光状态已更新:', carParams.lightOn)
  } catch (error) {
    console.error('更新灯光失败:', error)
  }
}

// 更新颜色
const updateColor = async () => {
  try {
    if (!currentCarLayer.value) return
    
    const color = hexToRGBA(carParams.color)
    await currentCarLayer.value.setColor(color)
    console.log('颜色已更新:', color)
  } catch (error) {
    console.error('更新颜色失败:', error)
  }
}

// 定位车辆
const locateCar = async () => {
  try {
    if (!currentCarLayer.value) {
      console.warn('请先创建车辆')
      return
    }
    
    await currentCarLayer.value.flyToThis()
    console.log('已定位到车辆')
  } catch (error) {
    console.error('定位车辆失败:', error)
  }
}

// 清空所有
const clearAll = async () => {
  try {
    // 停止运动
    if (isMoving.value) {
      await stopMovement()
    }
    
    for (const layer of [...createdLayers].reverse()) {
      await layer.removeInstance()
      createdLayers.delete(layer)
    }
    
    // 重置状态
    currentRouteLayer.value = null
    currentCarLayer.value = null
    hasRoute.value = false
    
    console.log('已清空所有内容')
  } catch (error) {
    console.error('清空失败:', error)
  }
}

// 获取车辆所有参数（调试用）
const getCarData = async () => {
  try {
    if (!currentCarLayer.value) {
      console.warn('请先创建车辆')
      return
    }
    
    const allData = await currentCarLayer.value.getAll()
    console.log('车辆所有参数:', allData)
    
    const speed = await currentCarLayer.value.getSpeed()
    console.log('当前速度:', speed)
    
    const lightOn = await currentCarLayer.value.getLight()
    console.log('灯光状态:', lightOn)
    
    const color = await currentCarLayer.value.getColor()
    console.log('当前颜色:', color)
    
    const transform = await currentCarLayer.value.getVehicleTransform()
    console.log('当前Transform:', transform)
  } catch (error) {
    console.error('获取车辆数据失败:', error)
  }
}
onViewerSessionLeave(() => {
  if (isToolActive.value) return DasPolylineTool.finishTool()
})
</script>

<template>
  <div>
    <div class="title">车辆图层控制</div>
    <div class="split_line"></div>

    <!-- 创建流程控制 -->
    <div class="control-group">
      <h4 class="section-title">创建流程</h4>
      
      <!-- 第一步：绘制路径 -->
      <div class="step-section">
        <span class="step-label">1. 绘制路径:</span>
        <el-button 
          :type="isToolActive ? 'danger' : 'primary'" 
          @click="isToolActive ? stopTool() : startTool()"
          size="small">
          {{ isToolActive ? '停止绘制' : '开始绘制' }}
        </el-button>
        <span class="step-hint" v-if="isToolActive">点击场景添加路径点</span>
      </div>
      
      <!-- 第二步：创建路线 -->
      <div class="step-section">
        <span class="step-label">2. 创建路线:</span>
        <el-button 
          type="success" 
          @click="createRoute" 
          size="small">
          创建路线
        </el-button>
        <span class="step-status" v-if="hasRoute">✓ 已创建</span>
      </div>
      
      <!-- 第三步：创建车辆 -->
      <div class="step-section">
        <span class="step-label">3. 创建车辆:</span>
        <el-button 
          type="success" 
          @click="createCar" 
          :disabled="!hasRoute"
          size="small">
          创建车辆
        </el-button>
        <span class="step-status" v-if="currentCarLayer">✓ 已创建</span>
      </div>
    </div>

    <!-- 车辆参数设置 -->
    <div class="params-group">
      <h4 class="section-title">车辆参数</h4>
      
      <el-form-item label="资产路径" class="ruihua">
        <el-select 
          v-model="carParams.blueprintPath" 
          placeholder="选择车辆资产"
          style="width: 300px;">
          <el-option
            v-for="option in blueprintOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value">
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="行驶速度" class="ruihua">
        <el-input-number 
          v-model="carParams.speed" 
          placeholder="输入行驶速度"
          style="width: 200px;"
          @change="updateSpeed">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="车辆颜色" class="ruihua">
        <el-color-picker 
          v-model="carParams.color"
          show-alpha
          @change="updateColor">
        </el-color-picker>
      </el-form-item>
      
      <el-form-item label="车灯开关" class="ruihua">
        <el-switch 
          v-model="carParams.lightOn"
          active-text="开启" 
          inactive-text="关闭"
          active-color="#E1BB82"
          @change="updateLight">
        </el-switch>
      </el-form-item>
    </div>

    <!-- 运动控制 -->
    <div class="movement-control">
      <h4 class="section-title">运动控制</h4>
      
      <el-button 
        :type="isMoving ? 'danger' : 'success'" 
        @click="isMoving ? stopMovement() : startMovement()"
        :disabled="!currentCarLayer"
        style="margin: 10px;">
        {{ isMoving ? '停止运动' : '开始运动' }}
      </el-button>
      
      <el-button 
        type="primary" 
        @click="locateCar"
        :disabled="!currentCarLayer"
        style="margin: 10px;">
        定位车辆
      </el-button>
      
      <el-button 
        type="info" 
        @click="getCarData"
        :disabled="!currentCarLayer"
        style="margin: 10px;">
        调试数据
      </el-button>
      
      <el-button 
        type="danger" 
        @click="clearAll"
        style="margin: 10px;">
        清空本示例
      </el-button>
    </div>

    <!-- 状态提示 -->
    <div class="status-panel">
      <p>绘制状态: {{ isToolActive ? '正在绘制路径' : '未开始' }}</p>
      <p>路线状态: {{ hasRoute ? '已创建路线' : '未创建' }}</p>
      <p>车辆状态: {{ currentCarLayer ? (isMoving ? '运动中' : '已停止') : '未创建' }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .params-group, .movement-control {
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
}

.step-label {
  color: #E1BB82;
  width: 100px;
  font-size: 14px;
}

.step-hint {
  color: #999;
  font-size: 12px;
  margin-left: 10px;
}

.step-status {
  color: #67C23A;
  font-size: 14px;
  margin-left: 10px;
}

.status-panel {
  padding: 15px;
  margin: 15px 0;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.1);
  color: #e1bb82;
  
  p {
    margin: 5px 0;
    font-size: 14px;
  }
}

:deep(.el-form-item) {
  margin-bottom: 15px;
}

:deep(.el-color-picker__trigger) {
  width: 60px;
  height: 36px;
}
</style> 