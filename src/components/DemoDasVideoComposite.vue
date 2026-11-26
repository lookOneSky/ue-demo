<script setup lang="ts">
import { requestUE } from '../utils/demoRpc.js'
import { computed, inject, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { DasVideoCompositeLayer } from "./lib/Layer/DasVideoCompositeLayer.js"
import { DasPointsTool } from "./lib/Tool/DasPointsTool.js"

interface ViewerSession {
  videoComposite?: { layer: any; visible: boolean; capturing: boolean }
}

const getShareData = inject<(key: string) => unknown>('getShareData')
const session = computed(() => getShareData?.('viewerSession') as ViewerSession | undefined)
const video = computed(() => session.value?.videoComposite)
const currentLayer = computed(() => video.value?.layer)
const layerVisible = computed(() => video.value?.visible ?? true)
const isCapturing = computed(() => video.value?.capturing ?? false)
const creating = computed(() => !!video.value && !currentLayer.value)

// 工具状态
const isToolActive = ref(false)
const selectedPoint = ref<number[]>([])
const rotationAxes = ['pitch', 'yaw', 'roll'] as const
let pointToolSession: ViewerSession | undefined

// 视频合成参数
const videoParams = ref({
  // Transform 参数
  transform: {
    translation: [0, 0, 0],     // [x, y, z]
    rotation: [0, 0, 0, 1],     // 四元数 [x, y, z, w]
    scale3D: [1, 1, 1]          // [x, y, z]
  },
  // UI用的欧拉角（度）
  eulerRotation: {
    pitch: 0,
    yaw: 0, 
    roll: 0
  },
  // 视频参数
  videoUrl: 'https://gisearth-1301434080.cos.ap-nanjing.myqcloud.com/MapData/ExamplesData/file/video/pinjie.mp4',               // 视频URL
  // 相机参数
  fov: 90,                    // 视场角（度）
  nearClipPlane: 1,           // 近裁剪面距离
  farClipPlane: 10000,        // 远裁剪面距离
  aspectRatio: 1.77,          // 宽高比（16:9）
  frustumVisible: true        // 视椎体组件可见性
})

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
  
  return [x, y, z, w]
}

// 四元数转欧拉角（四元数转弧度再转角度）
const quaternionToEuler = (x: number, y: number, z: number, w: number) => {
  // 计算欧拉角（弧度）
  const sinr_cosp = 2 * (w * x + y * z)
  const cosr_cosp = 1 - 2 * (x * x + y * y)
  const roll = Math.atan2(-sinr_cosp, cosr_cosp)
  
  const sinp = 2 * (z * x - w * y)
  const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp)
  
  const siny_cosp = 2 * (w * z + x * y)
  const cosy_cosp = 1 - 2 * (y * y + z * z)
  const yaw = Math.atan2(siny_cosp, cosy_cosp)
  
  // 弧度转角度
  return {
    pitch: pitch * 180 / Math.PI,
    yaw: yaw * 180 / Math.PI,
    roll: roll * 180 / Math.PI
  }
}

// 更新四元数（从欧拉角）
const updateQuaternionFromEuler = () => {
  const quat = eulerToQuaternion(
    videoParams.value.eulerRotation.pitch,
    videoParams.value.eulerRotation.yaw,
    videoParams.value.eulerRotation.roll
  )
  videoParams.value.transform.rotation = quat
}

// 启动点工具
const startPointTool = async () => {
  const owner = session.value
  if (!owner || pointToolSession === owner) return
  pointToolSession = owner
  try {
    await requestUE(DasPointsTool.className, 'setToCurrent')
    if (pointToolSession !== owner || session.value !== owner) return
    isToolActive.value = true
    console.log('点工具已启动')
  } catch (error) {
    if (pointToolSession === owner) pointToolSession = undefined
    console.error('启动点工具失败:', error)
  }
}

// 停止点工具
const stopPointTool = async () => {
  const owner = pointToolSession
  if (!owner || session.value !== owner) return
  try {
    await requestUE(DasPointsTool.className, 'finishTool')
    if (pointToolSession !== owner || session.value !== owner) return
    pointToolSession = undefined
    isToolActive.value = false
    console.log('点工具已停止')
  } catch (error) {
    console.error('停止点工具失败:', error)
  }
}

// 获取当前点位
const getCurrentPoint = async () => {
  const owner = pointToolSession
  try {
    const point = await DasPointsTool.getPointPosition()
    if (!owner || owner !== session.value || owner !== pointToolSession || !Array.isArray(point)) return
    selectedPoint.value = point
    // 自动设置到Transform的位置中
    if (point && point.length >= 3) {
      videoParams.value.transform.translation[0] = point[0]
      videoParams.value.transform.translation[1] = point[1]
      videoParams.value.transform.translation[2] = point[2]
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

// 创建视频合成图层
const createVideoCompositeLayer = async () => {
  const owner = session.value
  if (!owner || owner.videoComposite) return
  const state = reactive({ layer: null as any, visible: true, capturing: false })
  owner.videoComposite = state
  try {
    updateQuaternionFromEuler()
    const result = await DasVideoCompositeLayer.createInstance({
      param: {
        transform: videoParams.value.transform,
        videoUrl: videoParams.value.videoUrl,
        fov: videoParams.value.fov,
        nearClipPlane: videoParams.value.nearClipPlane,
        farClipPlane: videoParams.value.farClipPlane,
        aspectRatio: videoParams.value.aspectRatio,
        visible: videoParams.value.frustumVisible
      }
    })
    if (session.value !== owner || result?.id == null || result.id === '') return
    state.layer = result
    console.log('已创建视频合成图层:', result)
  } catch (error) {
    console.error('创建视频合成图层失败:', error)
  } finally {
    if (owner.videoComposite === state && !state.layer) delete owner.videoComposite
  }
}

// 检查图层是否已创建
const checkLayerExists = () => {
  if (!currentLayer.value) {
    console.warn('请先创建视频合成图层')
    return false
  }
  return true
}

// 设置Actor的Transform
const setActorTransform = async () => {
  try {
    if (!checkLayerExists()) return
    
    // 先从欧拉角更新四元数
    updateQuaternionFromEuler()
    
    await currentLayer.value.setActorTransform(videoParams.value.transform)
    console.log('已设置Actor Transform:', videoParams.value.transform)
  } catch (error) {
    console.error('设置Actor Transform失败:', error)
  }
}

// 获取Actor的Transform
const getActorTransform = async () => {
  try {
    if (!checkLayerExists()) return
    
    const layer = currentLayer.value
    const transform = await layer.getActorTransform()
    if (currentLayer.value !== layer) return
    videoParams.value.transform = transform
    
    // 同步更新欧拉角显示
    if (transform.rotation && transform.rotation.length >= 4) {
      const euler = quaternionToEuler(
        transform.rotation[0],
        transform.rotation[1], 
        transform.rotation[2],
        transform.rotation[3]
      )
      videoParams.value.eulerRotation = euler
    }
    
    console.log('已获取Actor Transform:', transform)
  } catch (error) {
    console.error('获取Actor Transform失败:', error)
  }
}

// 开始视频捕获
const startVideoCapture = async () => {
  try {
    if (!checkLayerExists()) return
    
    const state = video.value!
    await state.layer.startVideoCapture()
    state.capturing = true
    console.log('已开始视频捕获')
  } catch (error) {
    console.error('开始视频捕获失败:', error)
  }
}

// 停止视频捕获
const stopVideoCapture = async () => {
  try {
    if (!checkLayerExists()) return
    
    const state = video.value!
    await state.layer.stopVideoCapture()
    state.capturing = false
    console.log('已停止视频捕获')
  } catch (error) {
    console.error('停止视频捕获失败:', error)
  }
}

// 聚焦到此相机
const focusToThis = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayer.value.focusToThis()
    console.log('已聚焦到此相机')
  } catch (error) {
    console.error('聚焦到此相机失败:', error)
  }
}

// 设置视椎体组件可见性
const setFrustumComponentVisible = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayer.value.setFrustumComponentVisible(videoParams.value.frustumVisible)
    console.log('已设置视椎体组件可见性:', videoParams.value.frustumVisible)
  } catch (error) {
    console.error('设置视椎体组件可见性失败:', error)
  }
}

// 设置视频URL
const setVideoUrl = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayer.value.setVideoUrl(videoParams.value.videoUrl)
    console.log('已设置视频URL:', videoParams.value.videoUrl)
  } catch (error) {
    console.error('设置视频URL失败:', error)
  }
}

// 设置视场角
const setFOV = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayer.value.setFOV(videoParams.value.fov)
    console.log('已设置视场角:', videoParams.value.fov)
  } catch (error) {
    console.error('设置视场角失败:', error)
  }
}

// 设置近裁剪面
const setNearClipPlane = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayer.value.setNearClipPlane(videoParams.value.nearClipPlane)
    console.log('已设置近裁剪面:', videoParams.value.nearClipPlane)
  } catch (error) {
    console.error('设置近裁剪面失败:', error)
  }
}

// 设置远裁剪面
const setFarClipPlane = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayer.value.setFarClipPlane(videoParams.value.farClipPlane)
    console.log('已设置远裁剪面:', videoParams.value.farClipPlane)
  } catch (error) {
    console.error('设置远裁剪面失败:', error)
  }
}

// 设置宽高比
const setAspectRatio = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayer.value.setAspectRatio(videoParams.value.aspectRatio)
    console.log('已设置宽高比:', videoParams.value.aspectRatio)
  } catch (error) {
    console.error('设置宽高比失败:', error)
  }
}

const projectionFields = [
  { key: 'fov', label: '视场角（度）', min: 1, max: 179, step: 1, precision: undefined, apply: setFOV },
  { key: 'nearClipPlane', label: '近裁剪面', min: 0.1, max: 1000, step: 0.1, precision: undefined, apply: setNearClipPlane },
  { key: 'farClipPlane', label: '远裁剪面', min: 10, max: 100000, step: 10, precision: undefined, apply: setFarClipPlane },
  { key: 'aspectRatio', label: '宽高比', min: 0.1, max: 10, step: 0.01, precision: 2, apply: setAspectRatio },
] as const

// 获取所有参数
const loadAllSettings = async () => {
  try {
    if (!checkLayerExists()) return
    
    const layer = currentLayer.value
    const allParams = await layer.getAll()
    if (currentLayer.value !== layer) return
    videoParams.value = {
      ...videoParams.value,
      transform: allParams.transform,
      videoUrl: allParams.videoUrl,
      fov: allParams.fov,
      nearClipPlane: allParams.nearClipPlane,
      farClipPlane: allParams.farClipPlane,
      aspectRatio: allParams.aspectRatio,
      frustumVisible: allParams.frustumVisible
    }
    
    // 同步更新欧拉角显示
    if (allParams.transform?.rotation && allParams.transform.rotation.length >= 4) {
      const euler = quaternionToEuler(
        allParams.transform.rotation[0],
        allParams.transform.rotation[1],
        allParams.transform.rotation[2],
        allParams.transform.rotation[3]
      )
      videoParams.value.eulerRotation = euler
    }
    
    console.log('已获取所有参数:', allParams)
  } catch (error) {
    console.error('获取所有参数失败:', error)
  }
}

// 更新所有参数
const updateAllSettings = async () => {
  try {
    if (!checkLayerExists()) return
    
    // 先从欧拉角更新四元数
    updateQuaternionFromEuler()
    
    const params = {
      transform: videoParams.value.transform,
      videoUrl: videoParams.value.videoUrl,
      fov: videoParams.value.fov,
      nearClipPlane: videoParams.value.nearClipPlane,
      farClipPlane: videoParams.value.farClipPlane,
      aspectRatio: videoParams.value.aspectRatio,
      visible: videoParams.value.frustumVisible
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
    if (!checkLayerExists()) return
    
    await currentLayer.value.flyToThis()
  } catch (error) {
    console.error('定位图层失败:', error)
  }
}

// 显隐图层
const toggleLayerVisibility = async () => {
  try {
    if (!checkLayerExists()) return
    
    const state = video.value!
    const visible = !layerVisible.value
    await state.layer.setVisible(visible)
    state.visible = visible
  } catch (error) {
    console.error('切换图层可见性失败:', error)
  }
}

// 删除图层
const deleteLayer = async () => {
  try {
    if (!checkLayerExists()) return
    
    const owner = session.value!
    const state = owner.videoComposite!
    await requestUE(state.layer.className, 'removeInstance', { id: state.layer.id })
    if (owner.videoComposite === state) delete owner.videoComposite
  } catch (error) {
    console.error('删除图层失败:', error)
  }
}
watch(currentLayer, layer => {
  if (layer) loadAllSettings()
}, { immediate: true })
watch(session, () => {
  pointToolSession = undefined
  isToolActive.value = false
  selectedPoint.value = []
}, { flush: 'sync' })
onBeforeUnmount(stopPointTool)
</script>

<template>
  <div>
    <section class="control-section">
      <h4>视频源与创建</h4>
      <el-form-item label="视频 URL">
        <el-input v-model="videoParams.videoUrl" aria-label="视频 URL" placeholder="请输入视频 URL" />
        <el-button size="small" :disabled="!currentLayer" @click="setVideoUrl">应用视频地址</el-button>
      </el-form-item>

      <details class="settings">
        <summary>取点与空间变换</summary>
        <div class="action-row">
          <el-button :type="isToolActive ? 'danger' : 'primary'" :disabled="!session" @click="isToolActive ? stopPointTool() : startPointTool()">
            {{ isToolActive ? '停止点工具' : '启动点工具' }}
          </el-button>
          <el-button :disabled="!isToolActive" @click="getCurrentPoint">获取当前点位</el-button>
          <el-button :disabled="!isToolActive || !selectedPoint.length" @click="clearPoints">清除点位</el-button>
        </div>
        <p v-if="selectedPoint.length">已选点位 [{{ selectedPoint.join(', ') }}]</p>

        <fieldset>
          <legend>位置</legend>
          <div class="vector">
            <div v-for="(axis, index) in ['X', 'Y', 'Z']" :key="axis">
              <span>{{ axis }}</span>
              <el-input-number v-model="videoParams.transform.translation[index]" :aria-label="'位置 ' + axis"
                :precision="6" :step="0.1" controls-position="right" />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>旋转（度）</legend>
          <div class="vector">
            <div v-for="axis in rotationAxes" :key="axis">
              <span>{{ axis }}</span>
              <el-input-number v-model="videoParams.eulerRotation[axis]" :aria-label="'旋转 ' + axis"
                :min="-180" :max="180" :step="1" controls-position="right" />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>缩放</legend>
          <div class="vector">
            <div v-for="(axis, index) in ['X', 'Y', 'Z']" :key="axis">
              <span>{{ axis }}</span>
              <el-input-number v-model="videoParams.transform.scale3D[index]" :aria-label="'缩放 ' + axis"
                :min="0.1" :max="10" :step="0.1" controls-position="right" />
            </div>
          </div>
        </fieldset>
        <div class="action-row">
          <el-button :disabled="!currentLayer" @click="setActorTransform">应用空间变换</el-button>
          <el-button :disabled="!currentLayer" @click="getActorTransform">读取空间变换</el-button>
        </div>
      </details>

      <details class="settings">
        <summary>相机投影与裁剪</summary>
        <el-form-item v-for="field in projectionFields" :key="field.key" :label="field.label">
          <el-input-number v-model="videoParams[field.key]" :aria-label="field.label"
            :min="field.min" :max="field.max" :step="field.step" :precision="field.precision" controls-position="right" />
          <el-button size="small" :aria-label="'应用' + field.label" :disabled="!currentLayer" @click="field.apply">应用</el-button>
        </el-form-item>
        <el-form-item label="视锥体">
          <el-switch v-model="videoParams.frustumVisible" aria-label="视锥体可见性" active-text="可见" inactive-text="隐藏"
            @change="currentLayer && setFrustumComponentVisible()" />
        </el-form-item>
      </details>

      <div class="action-row">
        <el-button type="primary" :disabled="!session || !!video" :loading="creating" @click="createVideoCompositeLayer">创建视频合成图层</el-button>
        <el-button :disabled="!currentLayer" @click="updateAllSettings">更新所有参数</el-button>
        <el-button :disabled="!currentLayer" @click="loadAllSettings">获取所有参数</el-button>
      </div>
    </section>

    <section class="control-section">
      <h4>捕获与图层操作</h4>
      <div class="status-panel" :class="{ active: isCapturing }">
        <p>{{ currentLayer ? '当前图层 ID ' + currentLayer.id : '未创建图层' }}</p>
        <p>视频捕获状态：{{ isCapturing ? '正在捕获' : '未捕获' }}</p>
        <p v-if="isToolActive">点工具已激活</p>
      </div>
      <div class="action-row">
        <el-button :type="isCapturing ? 'danger' : 'success'" :disabled="!currentLayer" @click="isCapturing ? stopVideoCapture() : startVideoCapture()">
          {{ isCapturing ? '停止视频捕获' : '开始视频捕获' }}
        </el-button>
        <el-button :disabled="!currentLayer" @click="focusToThis">聚焦到此相机</el-button>
        <el-button :disabled="!currentLayer" @click="locateLayer">定位图层</el-button>
        <el-button :disabled="!currentLayer" @click="toggleLayerVisibility">{{ layerVisible ? '隐藏图层' : '显示图层' }}</el-button>
        <el-button type="danger" :disabled="!currentLayer" @click="deleteLayer">删除图层</el-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.settings { margin: 12px 0; border-block-start: 1px solid var(--line); }
.settings summary { padding: 10px 0; color: var(--ink); font-weight: 600; cursor: pointer; }
.settings summary:focus-visible { outline: 2px solid var(--blue); }
.action-row { display: flex; flex-wrap: wrap; gap: 8px; }
fieldset { min-width: 0; margin: 12px 0; padding: 0; border: 0; }
legend { margin-bottom: 4px; padding: 0; font-weight: 600; }
.vector { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 105px), 1fr)); gap: 8px; }
.vector span { display: block; margin-bottom: 3px; font-size: 12px; }
.vector .el-input-number { width: 100%; }
</style>
