<script setup lang="ts">
import { computed, inject, onBeforeUnmount, reactive, ref } from 'vue'
import DemoDasGizmosAxisColors from './DemoDasGizmosAxisColors.vue'
import { DasCarLayer } from "./lib/Layer/DasCarLayer.js"
import { DasGizmosOperateTool } from "./lib/Tool/DasGizmosOperateTool.js"
import { DasGroupLayer } from "./lib/Layer/DasGroupLayer.js"
import { onUEEvent, requestUE } from '../utils/demoRpc.js'

// 当前车辆图层
const currentCarLayer = ref<any>(null)
const isEditMode = ref(false)
const getShareData = inject<(key: string) => unknown>('getShareData')
const owner = getShareData?.('viewerSession')
const ready = computed(() => Boolean(getShareData?.('viewerReady')))
const busy = ref(false)
const showAxisColors = ref(false)
let controlsBound = false
let stopTransformListener: (() => void) | undefined

// 固定的车辆参数
const fixedCarParams = {
  blueprintPath: '/DasApplication/BluePrint/Vehicle/BP_DasPoseableVehicle_PickupTruck.BP_DasPoseableVehicle_PickupTruck_C',
  param: {
    transform: {
      translation: [0, 0, 300],
      rotation: [0, 0, 0, 1],
      scale3D: [1, 1, 1]
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

const axes = ['x', 'y', 'z'] as const
const angles = ['pitch', 'yaw', 'roll'] as const
let mounted = true

// 操作类型选项
const operateTypeOptions = [
  { label: '无变换', value: 0 },
  { label: '平移', value: 1 },
  { label: '旋转', value: 2 },
  { label: '缩放', value: 3 }
]

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
  const x = cr * sp * sy - sr * cp * cy
  const y = -cr * sp * cy - sr * cp * sy
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

function readVehicleTransform(transform: any) {
  if (!transform) return
  const { translation, rotation, scale3D } = transform
  if (Array.isArray(translation) && translation.length >= 3) {
    gizmosParams.transform.translation = { x: translation[0], y: translation[1], z: translation[2] }
  }
  if (Array.isArray(rotation) && rotation.length >= 4) {
    const [x, y, z, w] = rotation
    gizmosParams.transform.rotation = { x, y, z, w }
    gizmosParams.eulerRotation = quaternionToEuler(x, y, z, w)
  }
  if (Array.isArray(scale3D) && scale3D.length >= 3) {
    gizmosParams.transform.scale3D = { x: scale3D[0], y: scale3D[1], z: scale3D[2] }
  }
}

// 创建车辆后显示其位置，并将相机移至车辆。
const createCarLayer = async () => {
  try {
    if (currentCarLayer.value) return
    const carLayer = await DasCarLayer.createInstance(fixedCarParams)
    if (!carLayer?.id) return
    if (!mounted) {
      if (owner && owner === getShareData?.('viewerSession')) await carLayer.removeInstance(undefined)
      return
    }
    currentCarLayer.value = carLayer
    readVehicleTransform(await carLayer.getVehicleTransform())
    if (mounted) await flyToVehicle()
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
    if (!currentCarLayer.value || controlsBound) return
    const layerInfo = currentCarLayer.value.writeObjectInfo()
    controlsBound = true
    await requestUE(DasGizmosOperateTool.className, 'setOperateLayer', { layer: layerInfo, saveLast: true })
    if (!mounted) return
    await requestUE(DasGizmosOperateTool.className, 'setOperateType', { type: gizmosParams.operateType })
    if (!mounted) return
    await requestUE(DasGizmosOperateTool.className, 'setRotateDegreeOnePixel', { value: gizmosParams.rotateDegreePerPixel })
    if (!mounted) return
    startTransformListener()
    isEditMode.value = true
  } catch (error) {
    console.error('启动编辑模式失败:', error)
  } finally {
    if (mounted && !isEditMode.value) await stopEditMode()
  }
}

// 停止编辑模式
const stopEditMode = async () => {
  if (!controlsBound) return
  controlsBound = false
  stopTransformListener?.()
  stopTransformListener = undefined
  isEditMode.value = false
  showAxisColors.value = false
  await DasGizmosOperateTool.setOperateType(0)
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

// 拖动场景中的 Gizmos 时，将回传的数组同步到数值编辑器。
const startTransformListener = () => {
  stopTransformListener = onUEEvent(DasGizmosOperateTool.className, 'transform', ({ transform }) => {
    if (!mounted || !transform) return
    readVehicleTransform(transform)
  })
}

// 获取车辆数据
const getCarData = async () => {
  try {
    const car = currentCarLayer.value
    if (!car) return
    const allData = await car.getAll()
    console.log('车辆所有参数:', allData)
    if (!mounted) return
    const transform = await car.getVehicleTransform()
    console.log('当前Transform:', transform)

    readVehicleTransform(transform)
  } catch (error) {
    console.error('获取车辆数据失败:', error)
  }
}

async function runAction(action: () => Promise<unknown>) {
  if (busy.value || !ready.value) return
  busy.value = true
  try {
    await action()
  } catch (error) {
    console.error('车辆操作失败:', error)
  } finally {
    busy.value = false
  }
}

async function removeCarLayer() {
  const car = currentCarLayer.value
  await stopEditMode()
  if (!car) return
  await requestUE(car.className, 'removeInstance', { id: car.id })
  if (currentCarLayer.value === car) currentCarLayer.value = null
}

async function clearAll() {
  await stopEditMode()
  if (!mounted) return
  const root = await DasGroupLayer.getRoot() as InstanceType<typeof DasGroupLayer> | null
  if (!root?.id || !mounted) return
  await requestUE(root.className, 'removeAllLayer', { id: root.id })
  currentCarLayer.value = null
}

onBeforeUnmount(() => {
  mounted = false
  const sameSession = owner && owner === getShareData?.('viewerSession')
  stopTransformListener?.()
  stopTransformListener = undefined
  if (sameSession) removeCarLayer().catch(error => console.error('移除示例车辆失败:', error))
})
</script>

<template>
  <div>
    <section class="control-section">
      <h4>车辆图层</h4>
      <div class="action-row">
        <el-button type="primary" :disabled="!ready || busy || !!currentCarLayer" @click="runAction(createCarLayer)">创建固定车辆</el-button>
        <el-button :disabled="!ready || busy || !currentCarLayer" @click="runAction(flyToVehicle)">飞入车辆</el-button>
        <el-button :disabled="!ready || busy || !currentCarLayer" @click="runAction(getCarData)">读取车辆数据</el-button>
        <el-button type="danger" :disabled="!ready || busy || !currentCarLayer" @click="runAction(removeCarLayer)">移除示例车辆</el-button>
      </div>
      <details>
        <summary>固定车辆参数</summary>
        <p>蓝色皮卡（PickupTruck），初始位置 (0, 0, 300)，速度 500，车灯开启。</p>
      </details>
    </section>

    <section class="control-section">
      <h4>交互变换</h4>
      <el-button :type="isEditMode ? 'warning' : 'primary'" :disabled="!ready || busy || !currentCarLayer"
        @click="runAction(isEditMode ? stopEditMode : startEditMode)">{{ isEditMode ? '停止编辑' : '开始编辑' }}</el-button>
      <p class="hint">开始编辑后，可拖动视口中的坐标轴，或在下方输入变换数值。</p>
      <el-form label-position="top" :disabled="!ready || busy || !isEditMode">
        <el-form-item label="操作类型">
          <el-select v-model="gizmosParams.operateType" @change="setOperateType">
            <el-option v-for="option in operateTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="旋转灵敏度（度/像素）">
          <el-input-number v-model="gizmosParams.rotateDegreePerPixel" :step="0.1" :precision="3" @change="updateRotateDegree" />
        </el-form-item>
        <div class="action-row">
          <el-button @click="autoRotate">自动旋转</el-button>
          <el-button @click="recoverOperate">恢复操作</el-button>
        </div>
      </el-form>
      <details v-if="isEditMode" @toggle="showAxisColors = ($event.target as HTMLDetailsElement).open">
        <summary>调整坐标轴配色</summary>
        <DemoDasGizmosAxisColors v-if="showAxisColors" />
      </details>
    </section>

    <section class="control-section">
      <h4>数值变换</h4>
      <el-form label-position="top" :disabled="!ready || busy || !isEditMode">
        <fieldset>
          <legend>位置</legend>
          <el-form-item v-for="axis in axes" :key="axis" :label="axis.toUpperCase()">
            <el-input-number v-model="gizmosParams.transform.translation[axis]" :precision="10" :step="1" @change="setTransform" />
          </el-form-item>
        </fieldset>
        <fieldset>
          <legend>旋转（欧拉角，度）</legend>
          <el-form-item v-for="angle in angles" :key="angle" :label="angle">
            <el-input-number v-model="gizmosParams.eulerRotation[angle]" :min="-180" :max="180" :step="1" @change="setTransform" />
          </el-form-item>
        </fieldset>
        <fieldset>
          <legend>缩放</legend>
          <el-form-item v-for="axis in axes" :key="axis" :label="axis.toUpperCase()">
            <el-input-number v-model="gizmosParams.transform.scale3D[axis]" :min="0.1" :max="10" :step="0.1" :precision="2"
              @change="setTransform" />
          </el-form-item>
        </fieldset>
        <el-button type="primary" @click="setTransform">应用变换</el-button>
      </el-form>
    </section>
    <details>
      <summary>场景级清理</summary>
      <p>将移除根图层下的所有可清理图层，包括其他示例创建的图层。</p>
      <el-button type="danger" :disabled="!ready || busy" @click="runAction(clearAll)">清空所有图层</el-button>
    </details>
  </div>
</template>

<style scoped>
.action-row { display: flex; flex-wrap: wrap; gap: 8px; }
details { margin-top: 10px; }
summary { cursor: pointer; }
fieldset { min-width: 0; margin: 0 0 12px; padding: 0; border: 0; }
legend { margin-bottom: 6px; font-weight: 600; }
</style>
