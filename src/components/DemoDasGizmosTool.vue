<script setup lang="ts">
import { ref, reactive } from 'vue'
import { DasCarLayer } from "./lib/Layer/DasCarLayer.js"
import { DasGizmosOperateTool } from "./lib/Tool/DasGizmosOperateTool.js" 
import { DasGroupLayer } from "./lib/Layer/DasGroupLayer.js"

// 当前车辆图层
const currentCarLayer = ref<any>(null)
const isEditMode = ref(false)

// 固定的车辆参数
const fixedCarParams = {
  blueprintPath: '/DasApplication/BluePrint/Vehicle/BP_DasPoseableVehicle_PickupTruck.BP_DasPoseableVehicle_PickupTruck_C',
  param: {
    transform: {
      translation: { x: 0, y: 0, z: 300 }, // 固定位置
      rotation: { pitch: 0, yaw: 0, roll: 0 },
      scale3D: { x: 1, y: 1, z: 1 }
    },
    speed: 500,
    lightOn: true,
    color: { r: 0.2, g: 0.6, b: 1.0, a: 1.0 } // 蓝色
  }
}

// Gizmos操作参数
const gizmosParams = reactive({
  operateType: 1, // 默认平移模式
  rotateDegreePerPixel: 0.375,
  transform: {
    translation: { x: 0, y: 0, z: 300 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }, // 四元数格式
    scale3D: { x: 1, y: 1, z: 1 }
  },
  // UI用的欧拉角（度）
  eulerRotation: {
    pitch: 0,
    yaw: 0, 
    roll: 0
  }
})

// 操作类型选项
const operateTypeOptions = [
  { label: '无变换', value: 0 },
  { label: '平移', value: 1 },
  { label: '旋转', value: 2 },
  { label: '缩放', value: 3 }
]

// Gizmos轴颜色（颜色选择器使用rgba字符串）
const axisColors = reactive<Record<number, string>>({
  [DasGizmosOperateTool.AxisType.X]: 'rgba(255, 0, 0, 1)',
  [DasGizmosOperateTool.AxisType.Y]: 'rgba(0, 255, 0, 1)',
  [DasGizmosOperateTool.AxisType.Z]: 'rgba(0, 0, 255, 1)'
})

// 轴选项
const axisOptions = [
  { label: 'X轴', value: DasGizmosOperateTool.AxisType.X },
  { label: 'Y轴', value: DasGizmosOperateTool.AxisType.Y },
  { label: 'Z轴', value: DasGizmosOperateTool.AxisType.Z }
]

// rgba字符串转[r,g,b,a]（0-1）
const rgbaToArray = (rgba: string) => {
  const [r, g, b, a = 1] = (rgba.match(/[\d.]+/g) || []).map(Number)
  return [r / 255, g / 255, b / 255, a]
}

// [r,g,b,a]（0-1）转rgba字符串
const arrayToRgba = (c: number[]) =>
  `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${c[3] ?? 1})`

// 设置轴颜色
const setAxisColor = async (axis: number) => {
  if (!axisColors[axis]) return
  await DasGizmosOperateTool.setAxisColor(axis, rgbaToArray(axisColors[axis]))
}

// 从UE读取三个轴的颜色
const loadAxisColors = async () => {
  for (const opt of axisOptions) {
    axisColors[opt.value] = arrayToRgba(await DasGizmosOperateTool.getAxisColor(opt.value))
  }
}

// 角度规范化函数（对应UE的NormalizeAxis）
const normalizeAxis = (angle: number) => {
  // 将角度规范化到 [-180, 180] 范围
  angle = angle % 360
  if (angle > 180) {
    angle -= 360
  } else if (angle < -180) {
    angle += 360
  }
  return angle
}

// 欧拉角转四元数（角度转弧度再转四元数）
const eulerToQuaternion = (pitch: number, yaw: number, roll: number) => {
  // 角度转弧度
  const pitchRad = pitch * Math.PI / 180
  const yawRad = yaw * Math.PI / 180
  const rollRad = roll * Math.PI / 180
  
  // 计算四元数
  const cy = Math.cos(yawRad * 0.5)
  const sy = Math.sin(yawRad * 0.5)
  const cp = Math.cos(pitchRad * 0.5)
  const sp = Math.sin(pitchRad * 0.5)
  const cr = Math.cos(rollRad * 0.5)
  const sr = Math.sin(rollRad * 0.5)
  
  const w = cr * cp * cy + sr * sp * sy
  const x = sr * cp * cy - cr * sp * sy
  const y = cr * sp * cy + sr * cp * sy
  const z = cr * cp * sy - sr * sp * cy
  
  return { x, y, z, w }
}

// 四元数转欧拉角（使用UE标准算法）
const quaternionToEuler = (x: number, y: number, z: number, w: number) => {
  const SingularityTest = z * x - w * y
  const YawY = 2.0 * (w * z + x * y)
  const YawX = (1.0 - 2.0 * (y * y + z * z))

  const SINGULARITY_THRESHOLD = 0.4999995
  const RAD_TO_DEG = (180.0 / Math.PI)
  let Pitch: number, Yaw: number, Roll: number

  if (SingularityTest < -SINGULARITY_THRESHOLD) {
    Pitch = -90.0
    Yaw = (Math.atan2(YawY, YawX) * RAD_TO_DEG)
    Roll = normalizeAxis(-Yaw - (2.0 * Math.atan2(x, w) * RAD_TO_DEG))
  } else if (SingularityTest > SINGULARITY_THRESHOLD) {
    Pitch = 90.0
    Yaw = (Math.atan2(YawY, YawX) * RAD_TO_DEG)
    Roll = normalizeAxis(Yaw - (2.0 * Math.atan2(x, w) * RAD_TO_DEG))
  } else {
    Pitch = (Math.asin(2.0 * SingularityTest) * RAD_TO_DEG)
    Yaw = (Math.atan2(YawY, YawX) * RAD_TO_DEG)
    Roll = (Math.atan2(-2.0 * (w * x + y * z), (1.0 - 2.0 * (x * x + y * y))) * RAD_TO_DEG)
  }

  return {
    pitch: Pitch,
    yaw: Yaw,
    roll: Roll
  }
}

// 更新四元数（从欧拉角）
const updateQuaternionFromEuler = () => {
  const quat = eulerToQuaternion(
    gizmosParams.eulerRotation.pitch,
    gizmosParams.eulerRotation.yaw,
    gizmosParams.eulerRotation.roll
  )
  gizmosParams.transform.rotation = quat
}

// 创建固定参数的车辆图层
const createCarLayer = async () => {
  try {
    console.log('创建车辆参数:', fixedCarParams)
    const carLayer = await DasCarLayer.createInstance(fixedCarParams)
    currentCarLayer.value = carLayer
    
    // 更新gizmos参数为当前车辆的transform
    const transform = await carLayer.getVehicleTransform()
    console.log('车辆当前Transform:', transform)
    
    // 更新界面显示的数据
    if (transform) {
      // 更新位置
      if (transform.translation) {
        gizmosParams.transform.translation.x = transform.translation.x || 0
        gizmosParams.transform.translation.y = transform.translation.y || 0
        gizmosParams.transform.translation.z = transform.translation.z || 0
      }
      
      // 更新缩放
      if (transform.scale3D) {
        gizmosParams.transform.scale3D.x = transform.scale3D.x || 1
        gizmosParams.transform.scale3D.y = transform.scale3D.y || 1
        gizmosParams.transform.scale3D.z = transform.scale3D.z || 1
      }
      
      // 更新旋转（如果是四元数格式，转换为欧拉角）
      if (transform.rotation && typeof transform.rotation.x !== 'undefined') {
        const euler = quaternionToEuler(
          transform.rotation.x,
          transform.rotation.y,
          transform.rotation.z,
          transform.rotation.w
        )
        gizmosParams.eulerRotation = euler
        gizmosParams.transform.rotation = transform.rotation
      }
    }
    
    console.log('车辆图层创建成功:', carLayer)
    
    // 创建成功后自动飞入车辆
    await flyToVehicle()
  } catch (error) {
    console.error('创建车辆图层失败:', error)
  }
}

// 飞入车辆
const flyToVehicle = async () => {
  try {
    if (!currentCarLayer.value) {
      console.warn('请先创建车辆图层')
      return
    }
    
    await currentCarLayer.value.flyToThis()
    console.log('已飞入车辆位置')
  } catch (error) {
    console.error('飞入车辆失败:', error)
  }
}

// 开始编辑模式
const startEditMode = async () => {
  try {
    if (!currentCarLayer.value) {
      console.warn('请先创建车辆图层')
      return
    }
    
    // 设置操作图层
    const layerInfo = await currentCarLayer.value.writeObjectInfo()
    await DasGizmosOperateTool.setOperateLayer(layerInfo, true)
    
    // 设置操作类型
    await DasGizmosOperateTool.setOperateType(gizmosParams.operateType)
    
    // 设置旋转度数每像素
    await DasGizmosOperateTool.setRotateDegreeOnePixel(gizmosParams.rotateDegreePerPixel)

    // 读取当前轴颜色
    await loadAxisColors()

    isEditMode.value = true
    console.log('Gizmos编辑模式已启动')
    
    // 监听变换变化
    startTransformListener()
  } catch (error) {
    console.error('启动编辑模式失败:', error)
  }
}

// 停止编辑模式
const stopEditMode = async () => {
  try {
    // 设置操作类型为无变换
    await DasGizmosOperateTool.setOperateType(0)
    
    isEditMode.value = false
    console.log('Gizmos编辑模式已停止')
  } catch (error) {
    console.error('停止编辑模式失败:', error)
  }
}

// 设置操作类型
const setOperateType = async () => {
  try {
    if (!isEditMode.value) return
    
    await DasGizmosOperateTool.setOperateType(gizmosParams.operateType)
    
    const typeName = operateTypeOptions.find(opt => opt.value === gizmosParams.operateType)?.label
    console.log('操作类型已设置为:', typeName)
  } catch (error) {
    console.error('设置操作类型失败:', error)
  }
}

// 更新旋转度数每像素
const updateRotateDegree = async () => {
  try {
    if (!isEditMode.value) return
    
    await DasGizmosOperateTool.setRotateDegreeOnePixel(gizmosParams.rotateDegreePerPixel)
    console.log('旋转度数每像素已更新:', gizmosParams.rotateDegreePerPixel)
  } catch (error) {
    console.error('更新旋转度数失败:', error)
  }
}

// 手动设置变换
const setTransform = async () => {
  try {
    if (!currentCarLayer.value) return
    
    // 先从欧拉角更新四元数
    updateQuaternionFromEuler()
    
    // 转换为Gizmos工具期望的数组格式
    const gizmosTransform = {
      translation: [
        gizmosParams.transform.translation.x,
        gizmosParams.transform.translation.y,
        gizmosParams.transform.translation.z
      ],
      rotation: [
        gizmosParams.transform.rotation.x,
        gizmosParams.transform.rotation.y,
        gizmosParams.transform.rotation.z,
        gizmosParams.transform.rotation.w
      ],
      scale3D: [
        gizmosParams.transform.scale3D.x,
        gizmosParams.transform.scale3D.y,
        gizmosParams.transform.scale3D.z
      ]
    }
    
    await DasGizmosOperateTool.setTransform(gizmosTransform)
    console.log('变换已设置:', gizmosTransform)
  } catch (error) {
    console.error('设置变换失败:', error)
  }
}

// 自动旋转
const autoRotate = async () => {
  try {
    await DasGizmosOperateTool.autoRotate()
    console.log('自动旋转执行完成')
  } catch (error) {
    console.error('自动旋转失败:', error)
  }
}

// 恢复操作
const recoverOperate = async () => {
  try {
    await DasGizmosOperateTool.recoverOperate()
    console.log('操作已恢复')
  } catch (error) {
    console.error('恢复操作失败:', error)
  }
}

// 监听变换变化
const startTransformListener = () => {
   DasGizmosOperateTool.addCallBack((obj: any) => {
    console.log('变换变化:', obj)
    
    if (obj && obj.transform) {
      const transform = obj.transform
      
      // 处理位置数据 (3元素数组)
      if (transform.translation && Array.isArray(transform.translation) && transform.translation.length >= 3) {
        gizmosParams.transform.translation.x = transform.translation[0]
        gizmosParams.transform.translation.y = transform.translation[1]
        gizmosParams.transform.translation.z = transform.translation[2]
      }
      
      // 处理旋转数据 (4元素数组 - 四元数)
      if (transform.rotation && Array.isArray(transform.rotation) && transform.rotation.length >= 4) {
        // 存储四元数数据 [x, y, z, w]
        gizmosParams.transform.rotation = {
          x: transform.rotation[0],
          y: transform.rotation[1], 
          z: transform.rotation[2],
          w: transform.rotation[3]
        }
        
        // 转换为欧拉角显示
        const euler = quaternionToEuler(
          transform.rotation[0],
          transform.rotation[1],
          transform.rotation[2],
          transform.rotation[3]
        )
        gizmosParams.eulerRotation = euler
      }
      
      // 处理缩放数据 (4元素数组，使用前3个)
      if (transform.scale3D && Array.isArray(transform.scale3D) && transform.scale3D.length >= 3) {
        gizmosParams.transform.scale3D.x = transform.scale3D[0]
        gizmosParams.transform.scale3D.y = transform.scale3D[1]
        gizmosParams.transform.scale3D.z = transform.scale3D[2]
        // 第4个元素暂时忽略或记录日志
        if (transform.scale3D.length > 3) {
          console.log('Scale3D第4个元素:', transform.scale3D[3])
        }
      }
    }
   })
}

// 获取车辆数据
const getCarData = async () => {
  try {
    if (!currentCarLayer.value) {
      console.warn('请先创建车辆图层')
      return
    }
    
    const allData = await currentCarLayer.value.getAll()
    console.log('车辆所有参数:', allData)
    
    const transform = await currentCarLayer.value.getVehicleTransform()
    console.log('当前Transform:', transform)
    
    // 更新界面显示的数据
    if (transform) {
      if (transform.translation) {
        gizmosParams.transform.translation.x = transform.translation.x || 0
        gizmosParams.transform.translation.y = transform.translation.y || 0
        gizmosParams.transform.translation.z = transform.translation.z || 0
      }
      
      if (transform.scale3D) {
        gizmosParams.transform.scale3D.x = transform.scale3D.x || 1
        gizmosParams.transform.scale3D.y = transform.scale3D.y || 1
        gizmosParams.transform.scale3D.z = transform.scale3D.z || 1
      }
      
      if (transform.rotation && typeof transform.rotation.x !== 'undefined') {
        const euler = quaternionToEuler(
          transform.rotation.x,
          transform.rotation.y,
          transform.rotation.z,
          transform.rotation.w
        )
        gizmosParams.eulerRotation = euler
        gizmosParams.transform.rotation = transform.rotation
      }
    }
  } catch (error) {
    console.error('获取车辆数据失败:', error)
  }
}

// 清空所有
const clearAll = async () => {
  try {
    // 停止编辑模式
    if (isEditMode.value) {
      await stopEditMode()
    }
    
    // 删除所有图层
    const pRoot = await DasGroupLayer.getRoot()
    await pRoot.removeAllLayer()
    
    // 重置状态
    currentCarLayer.value = null
    
    console.log('已清空所有内容')
  } catch (error) {
    console.error('清空失败:', error)
  }
}
</script>

<template>
  <div>
    <div class="title">Gizmos变换工具控制</div>
    <div class="split_line"></div>

    <!-- 创建流程控制 -->
    <div class="control-group">
      <h4 class="section-title">创建流程</h4>
      
      <!-- 第一步：创建固定参数车辆 -->
      <div class="step-section">
        <span class="step-label">1. 创建车辆:</span>
        <el-button 
          type="success" 
          @click="createCarLayer" 
          size="small">
          创建固定车辆
        </el-button>
        <span class="step-status" v-if="currentCarLayer">✓ 已创建</span>
      </div>
      
      <!-- 第二步：开始编辑 -->
      <div class="step-section">
        <span class="step-label">2. 开始编辑:</span>
        <el-button 
          :type="isEditMode ? 'danger' : 'primary'" 
          @click="isEditMode ? stopEditMode() : startEditMode()"
          :disabled="!currentCarLayer"
          size="small">
          {{ isEditMode ? '停止编辑' : '开始编辑' }}
        </el-button>
        <span class="step-hint" v-if="isEditMode">可使用Gizmos工具变换车辆</span>
      </div>
    </div>

    <!-- 固定车辆参数显示 -->
    <div class="params-display">
      <h4 class="section-title">固定车辆参数</h4>
      <div class="param-item">
        <span class="param-label">蓝图路径:</span>
        <span class="param-value">货车 (PickupTruck)</span>
      </div>
      <div class="param-item">
        <span class="param-label">初始位置:</span>
        <span class="param-value">X: 0, Y: 0, Z: 300</span>
      </div>
      <div class="param-item">
        <span class="param-label">速度:</span>
        <span class="param-value">500</span>
      </div>
      <div class="param-item">
        <span class="param-label">灯光:</span>
        <span class="param-value">开启</span>
      </div>
      <div class="param-item">
        <span class="param-label">颜色:</span>
        <span class="param-value">蓝色</span>
      </div>
    </div>

    <!-- Gizmos操作参数 -->
    <div class="gizmos-params">
      <h4 class="section-title">Gizmos操作参数</h4>
      
      <el-form-item label="操作类型" class="ruihua">
        <el-select 
          v-model="gizmosParams.operateType" 
          @change="setOperateType"
          :disabled="!isEditMode"
          style="width: 200px;">
          <el-option
            v-for="option in operateTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value">
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="旋转度数/像素" class="ruihua">
        <el-input-number 
          v-model="gizmosParams.rotateDegreePerPixel" 
          :step="0.1"
          :precision="1"
          :disabled="!isEditMode"
          style="width: 200px;"
          @change="updateRotateDegree">
        </el-input-number>
      </el-form-item>

      <el-form-item v-for="opt in axisOptions" :key="opt.value" :label="opt.label + '颜色'" class="ruihua">
        <el-color-picker
          v-model="axisColors[opt.value]"
          show-alpha
          color-format="rgb"
          :disabled="!isEditMode"
          @change="setAxisColor(opt.value)">
        </el-color-picker>
      </el-form-item>

      <el-button size="small" :disabled="!isEditMode" @click="loadAxisColors">读取当前颜色</el-button>
    </div>

    <!-- 当前变换显示 -->
    <div class="transform-display">
      <h4 class="section-title">当前变换</h4>
      <div class="transform-section">
        <span class="transform-label">位置:</span>
        <span class="transform-value">
          X: {{ gizmosParams.transform.translation.x.toFixed(2) }}, 
          Y: {{ gizmosParams.transform.translation.y.toFixed(2) }}, 
          Z: {{ gizmosParams.transform.translation.z.toFixed(2) }}
        </span>
      </div>
      <div class="transform-section">
        <span class="transform-label">旋转:</span>
        <span class="transform-value">
          Pitch: {{ gizmosParams.eulerRotation.pitch.toFixed(2) }}°, 
          Yaw: {{ gizmosParams.eulerRotation.yaw.toFixed(2) }}°, 
          Roll: {{ gizmosParams.eulerRotation.roll.toFixed(2) }}°
        </span>
      </div>
      <div class="transform-section">
        <span class="transform-label">缩放:</span>
        <span class="transform-value">
          X: {{ gizmosParams.transform.scale3D.x.toFixed(2) }}, 
          Y: {{ gizmosParams.transform.scale3D.y.toFixed(2) }}, 
          Z: {{ gizmosParams.transform.scale3D.z.toFixed(2) }}
        </span>
      </div>
    </div>

    <!-- 手动设置Transform -->
    <div class="manual-transform">
      <h4 class="section-title">手动设置变换</h4>
      
      <!-- 位置设置 -->
      <div class="param-section">
        <h5 style="color: #E1BB82; margin: 10px 0;">位置 (Translation)</h5>
        <el-form-item label="X" class="ruihua">
          <el-input-number 
            v-model="gizmosParams.transform.translation.x" 
            :precision="10"
            :step="1" 
            style="width: 300px;"
            @change="setTransform">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="Y" class="ruihua">
          <el-input-number 
            v-model="gizmosParams.transform.translation.y" 
            :precision="10"
            :step="1" 
            style="width: 300px;"
            @change="setTransform">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="Z" class="ruihua">
          <el-input-number 
            v-model="gizmosParams.transform.translation.z" 
            :precision="10"
            :step="1" 
            style="width: 300px;"
            @change="setTransform">
          </el-input-number>
        </el-form-item>
      </div>
      
      <!-- 旋转设置 -->
      <div class="param-section">
        <h5 style="color: #E1BB82; margin: 10px 0;">旋转 (欧拉角)</h5>
        <el-form-item label="Pitch" class="ruihua">
          <el-input-number 
            v-model="gizmosParams.eulerRotation.pitch" 
            :min="-180" 
            :max="180" 
            :step="1" 
            style="width: 300px;"
            @change="setTransform">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="Yaw" class="ruihua">
          <el-input-number 
            v-model="gizmosParams.eulerRotation.yaw" 
            :min="-180" 
            :max="180" 
            :step="1" 
            style="width: 300px;"
            @change="setTransform">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="Roll" class="ruihua">
          <el-input-number 
            v-model="gizmosParams.eulerRotation.roll" 
            :min="-180" 
            :max="180" 
            :step="1" 
            style="width: 300px;"
            @change="setTransform">
          </el-input-number>
        </el-form-item>
      </div>
      
      <!-- 缩放设置 -->
      <div class="param-section">
        <h5 style="color: #E1BB82; margin: 10px 0;">缩放 (Scale3D)</h5>
        <el-form-item label="X" class="ruihua">
          <el-input-number 
            v-model="gizmosParams.transform.scale3D.x" 
            :min="0.1" 
            :max="10" 
            :step="0.1" 
            :precision="2"
            style="width: 300px;"
            @change="setTransform">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="Y" class="ruihua">
          <el-input-number 
            v-model="gizmosParams.transform.scale3D.y" 
            :min="0.1" 
            :max="10" 
            :step="0.1" 
            :precision="2"
            style="width: 300px;"
            @change="setTransform">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="Z" class="ruihua">
          <el-input-number 
            v-model="gizmosParams.transform.scale3D.z" 
            :min="0.1" 
            :max="10" 
            :step="0.1" 
            :precision="2"
            style="width: 300px;"
            @change="setTransform">
          </el-input-number>
        </el-form-item>
      </div>
      
      <el-button 
        type="primary" 
        @click="setTransform" 
        :disabled="!isEditMode"
        style="margin: 15px;">
        应用变换
      </el-button>
    </div>

    <!-- 操作控制 -->
    <div class="operation-control">
      <h4 class="section-title">操作控制</h4>
      
      <el-button 
        type="warning" 
        @click="autoRotate"
        :disabled="!isEditMode"
        style="margin: 10px;">
        自动旋转
      </el-button>
      
      <el-button 
        type="info" 
        @click="recoverOperate"
        :disabled="!isEditMode"
        style="margin: 10px;">
        恢复操作
      </el-button>
      
      <el-button 
        type="primary" 
        @click="flyToVehicle"
        :disabled="!currentCarLayer"
        style="margin: 10px;">
        飞入车辆
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
        清空所有
      </el-button>
    </div>

    <!-- 状态提示 -->
    <div class="status-panel">
      <p>车辆状态: {{ currentCarLayer ? '已创建' : '未创建' }}</p>
      <p>编辑模式: {{ isEditMode ? '编辑中' : '未开始' }}</p>
      <p>当前操作: {{ operateTypeOptions.find(opt => opt.value === gizmosParams.operateType)?.label }}</p>
      <p>旋转敏感度: {{ gizmosParams.rotateDegreePerPixel }}度/像素</p>
    </div>

    <!-- 使用说明 -->
    <div class="help-panel">
      <h4 class="section-title">使用说明</h4>
      <ol>
        <li>点击"创建固定车辆"按钮创建预设参数的车辆图层</li>
        <li>车辆创建成功后会自动飞入到车辆位置</li>
        <li>点击"开始编辑"启动Gizmos变换工具</li>
        <li>选择操作类型（平移、旋转、缩放）</li>
        <li>在Gizmos操作参数中可分别设置X/Y/Z轴颜色</li>
        <li>在场景中使用Gizmos工具拖拽变换车辆</li>
        <li>实时查看当前变换参数的变化</li>
        <li>可手动输入变换参数并点击"应用变换"</li>
        <li>使用"飞入车辆"按钮随时回到车辆位置</li>
        <li>使用"自动旋转"和"恢复操作"等功能</li>
      </ol>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .params-display, .gizmos-params, .transform-display, .operation-control, .manual-transform {
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

.param-item, .transform-section {
  margin: 8px 0;
  display: flex;
  align-items: center;
}

.param-label, .transform-label {
  color: #E1BB82;
  width: 120px;
  font-size: 14px;
}

.param-value, .transform-value {
  color: #fff;
  font-size: 14px;
  font-family: monospace;
}

.status-panel, .help-panel {
  padding: 15px;
  margin: 15px 0;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.1);
  color: #e1bb82;
  
  p {
    margin: 5px 0;
    font-size: 14px;
  }
  
  ol {
    margin: 10px 0;
    padding-left: 20px;
    
    li {
      margin: 5px 0;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}

:deep(.el-form-item) {
  margin-bottom: 15px;
}

:deep(.el-input-number) {
  .el-input__inner {
    text-align: center;
    font-size: 14px;
    font-family: 'Consolas', 'Monaco', monospace;
    color: #E1BB82;
  }
  
  .el-input-number__increase,
  .el-input-number__decrease {
    color: #E1BB82;
  }
}

:deep(.el-select .el-input__inner) {
  color: #E1BB82;
}

.param-section {
  margin: 10px 0;
  padding: 10px;
  background: rgba(225, 187, 130, 0.05);
  border-radius: 4px;
  
  h5 {
    font-size: 14px;
    font-weight: 600;
  }
}
</style> 