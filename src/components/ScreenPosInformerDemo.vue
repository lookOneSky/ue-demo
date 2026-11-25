<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ScreenPosInformer } from './lib/Scene/ScreenPosInformer.js'

interface RegisteredPoint {
  id: string
  position: number[]
  screenPos: number[]
  isVisible: boolean
}

const getShareData = inject<(key: string) => unknown>('getShareData')!
const session = computed(() => getShareData('viewerSession'))
const registeredPoints = ref<RegisteredPoint[]>([])
const unsubscribe = new Map<string, () => void>()
const isActive = ref(false)
const clearing = ref(false)
const selectedId = ref('')
const popupContent = computed(() => registeredPoints.value.find(point => point.id === selectedId.value))
const coordinates = ref([0, 0])
const pointParams = ref({ longitude: 111.0222729132209, latitude: 32.426901590203755, height: 790.6391397648027 })
const animationParams = ref({ moveDelay: 300, smoothDuration: 500, smoothEnabled: true, delayEnabled: true })
const popupStyle = computed(() => ({
  left: coordinates.value[0] + 'px',
  top: coordinates.value[1] + 'px',
  transitionDuration: (animationParams.value.smoothEnabled ? animationParams.value.smoothDuration : 0) + 'ms',
}))
let generation = 0
let timeout: ReturnType<typeof setTimeout> | undefined
let observer: ResizeObserver | undefined

function updatePopupPosition() {
  const point = popupContent.value
  const video = document.querySelector<HTMLVideoElement>('#streamingVideo')
  const player = document.querySelector('#player')
  if (!point || !video?.videoWidth || !video.videoHeight || !player) return
  const rect = video.getBoundingClientRect()
  const host = player.getBoundingClientRect()
  const scale = Math.min(rect.width / video.videoWidth, rect.height / video.videoHeight)
  coordinates.value = [
    rect.left - host.left + (rect.width - video.videoWidth * scale) / 2 + point.screenPos[0] * scale,
    rect.top - host.top + (rect.height - video.videoHeight * scale) / 2 + point.screenPos[1] * scale,
  ]
}

function closePopup() {
  clearTimeout(timeout)
  timeout = undefined
  selectedId.value = ''
}

function showPointPopup(point: RegisteredPoint) {
  closePopup()
  selectedId.value = point.id
  updatePopupPosition()
}

function updatePoint(id: string, screenPos: number[], visible?: boolean) {
  const point = registeredPoints.value.find(entry => entry.id === id)
  const video = document.querySelector<HTMLVideoElement>('#streamingVideo')
  if (!point || !video) return
  point.screenPos = screenPos
  point.isVisible = visible !== false && video.videoWidth > 0 && video.videoHeight > 0 &&
    screenPos[0] >= 0 && screenPos[0] <= video.videoWidth && screenPos[1] >= 0 && screenPos[1] <= video.videoHeight
  if (id !== selectedId.value) return
  if (!point.isVisible) return closePopup()
  if (!animationParams.value.delayEnabled) return updatePopupPosition()
  if (timeout === undefined) {
    timeout = setTimeout(() => {
      timeout = undefined
      updatePopupPosition()
    }, animationParams.value.moveDelay)
  }
}

async function registerPoint() {
  const startingSession = session.value
  if (!isActive.value || !startingSession || clearing.value) return
  const version = generation
  const { longitude, latitude, height } = pointParams.value
  const id = await ScreenPosInformer.RegisterPoint(longitude, latitude, height)
  if (!id || startingSession !== session.value) return
  if (version !== generation) {
    await ScreenPosInformer.RemovePoint(id)
    return
  }
  registeredPoints.value.push({ id, position: [longitude, latitude, height], screenPos: [0, 0], isVisible: false })
  unsubscribe.set(id, ScreenPosInformer.addScreenPositionsChangedListener(id, point => {
    updatePoint(id, point.screenPos, point.isVisible)
  }))
}

async function removePoint(id: string) {
  if (session.value && !await ScreenPosInformer.RemovePoint(id)) return
  unsubscribe.get(id)?.()
  unsubscribe.delete(id)
  registeredPoints.value = registeredPoints.value.filter(point => point.id !== id)
  if (selectedId.value === id) closePopup()
}

async function clearAllPoints() {
  generation++
  closePopup()
  clearing.value = true
  try {
    await Promise.all(registeredPoints.value.map(point => removePoint(point.id)))
  } finally {
    clearing.value = false
  }
}

function startDemo() {
  if (session.value) isActive.value = true
}

async function stopDemo() {
  await clearAllPoints()
  if (!registeredPoints.value.length) isActive.value = false
}

function releaseListeners() {
  for (const stop of unsubscribe.values()) stop()
  unsubscribe.clear()
}

watch(session, () => {
  generation++
  releaseListeners()
  closePopup()
  registeredPoints.value = []
  isActive.value = false
}, { flush: 'sync' })

onMounted(() => {
  const player = document.querySelector('#player')
  if (player) {
    observer = new ResizeObserver(updatePopupPosition)
    observer.observe(player)
  }
})
onBeforeUnmount(() => {
  observer?.disconnect()
  releaseListeners()
  void clearAllPoints().catch(console.error)
})
</script>

<template>
  <div>
    <div class="title">屏幕位置信息器</div>
    <div class="split_line"></div>

    <!-- 控制按钮 -->
    <div class="control-group">
      <el-button :type="isActive ? 'danger' : 'primary'" :disabled="!session || clearing" @click="isActive ? stopDemo() : startDemo()"
        style="margin: 10px;">
        {{ isActive ? '结束演示' : '开始演示' }}
      </el-button>

      <el-button type="warning" @click="clearAllPoints" :disabled="clearing || !isActive || !registeredPoints.length"
        style="margin: 10px;">
        清除所有点位
      </el-button>
    </div>

    <!-- 点位参数设置 -->
    <div class="params-group" v-if="isActive">
      <el-form-item label="经度" class="ruihua">
        <el-input-number v-model="pointParams.longitude" :step="0.1" style="width: 120px;"></el-input-number>
      </el-form-item>

      <el-form-item label="纬度" class="ruihua">
        <el-input-number v-model="pointParams.latitude" :step="0.1" style="width: 120px;"></el-input-number>
      </el-form-item>

      <el-form-item label="高度" class="ruihua">
        <el-input-number v-model="pointParams.height" :step="1" style="width: 120px;"></el-input-number>
      </el-form-item>

      <el-button type="success" :disabled="clearing" @click="registerPoint" style="margin: 15px;">
        注册点位
      </el-button>
    </div>

    <!-- 动画参数设置 -->
    <div class="animation-params" v-if="isActive">
      <div class="params-header">弹窗动画设置</div>

      <el-form-item label="启用平滑移动" class="ruihua">
        <el-switch v-model="animationParams.smoothEnabled" active-color="#E1BB82">
        </el-switch>
      </el-form-item>

      <el-form-item label="平滑移动时间(ms)" class="ruihua" :disabled="!animationParams.smoothEnabled">
        <el-input-number v-model="animationParams.smoothDuration" :min="100" :max="2000" :step="100"
          :disabled="!animationParams.smoothEnabled" style="width: 120px;">
        </el-input-number>
      </el-form-item>

      <el-form-item label="启用延迟移动" class="ruihua">
        <el-switch v-model="animationParams.delayEnabled" active-color="#E1BB82">
        </el-switch>
      </el-form-item>

      <el-form-item label="延迟时间(ms)" class="ruihua" :disabled="!animationParams.delayEnabled">
        <el-input-number v-model="animationParams.moveDelay" :min="0" :max="1000" :step="50"
          :disabled="!animationParams.delayEnabled" style="width: 120px;">
        </el-input-number>
      </el-form-item>
    </div>

    <!-- 已注册点位列表 -->
    <div class="points-list" v-if="isActive && registeredPoints.length > 0">
      <div class="points-header">
        <span>已注册点位</span>
      </div>
      <div class="points-container">
        <div v-for="point in registeredPoints" :key="point.id" class="point-item"
          :class="{ 'visible': point.isVisible }" @click="point.isVisible && showPointPopup(point)">
          <div class="point-info">
            <div>ID: {{ point.id.substring(0, 8) }}...</div>
            <div>经度: {{ point.position[0].toFixed(2) }}</div>
            <div>纬度: {{ point.position[1].toFixed(2) }}</div>
            <div>高度: {{ point.position[2].toFixed(2) }}</div>
            <div>状态: {{ point.isVisible ? '可见' : '不可见' }}</div>
          </div>
          <el-button type="danger" size="small" @click.stop="removePoint(point.id)" style="margin-left: auto;">
            删除
          </el-button>
        </div>
      </div>
    </div>
  </div>

  <teleport v-if="popupContent" to="#player">
    <div class="point-popup" :style="popupStyle">
      <div class="popup-header">
        <span>点位信息</span>
        <span class="popup-close" @click="closePopup">×</span>
      </div>
      <div class="popup-content">
        <div>ID: {{ popupContent.id.substring(0, 8) }}...</div>
        <div>经度: {{ popupContent.position[0].toFixed(4) }}</div>
        <div>纬度: {{ popupContent.position[1].toFixed(4) }}</div>
        <div>高度: {{ popupContent.position[2].toFixed(2) }}</div>
        <div>屏幕X: {{ popupContent.screenPos[0].toFixed(0) }}</div>
        <div>屏幕Y: {{ popupContent.screenPos[1].toFixed(0) }}</div>
      </div>
    </div>
  </teleport>
</template>

<style lang="scss" scoped>
.control-group,
.params-group {
  margin: 15px 0;
}

.points-list {
  margin: 15px;
  border-radius: 5px;
  border: 1px solid rgba(225, 187, 130, 0.3);
  background: rgba(33, 32, 29, 0.6);
}

.points-header {
  padding: 10px 15px;
  background: rgba(225, 187, 130, 0.1);
  color: #e1bb82;
  font-weight: bold;
  border-bottom: 1px solid rgba(225, 187, 130, 0.3);
}

.points-container {
  max-height: 200px;
  overflow-y: auto;
  padding: 5px;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #E1BB82;
    border-radius: 5px;
  }
}

.point-item {
  display: flex;
  align-items: center;
  margin: 5px 0;
  padding: 10px;
  border-radius: 3px;
  background: rgba(225, 187, 130, 0.05);
  color: #aaa;
  cursor: not-allowed;

  &.visible {
    background: rgba(225, 187, 130, 0.1);
    color: #fff;
    cursor: pointer;

    &:hover {
      background: rgba(225, 187, 130, 0.2);
    }
  }
}

.point-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
}

.point-popup {
  position: absolute;
  z-index: 3;
  transition-property: left, top;
  width: 200px;
  border-radius: 5px;
  background: rgba(33, 32, 29, 0.9);
  border: 1px solid #E1BB82;
  color: #fff;
  transform: translate(-50%, -100%);
  margin-top: -10px;
  pointer-events: auto;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #E1BB82;
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(225, 187, 130, 0.3);
  background: rgba(225, 187, 130, 0.1);
  color: #e1bb82;
  font-weight: bold;
}

.popup-close {
  cursor: pointer;
  font-size: 16px;

  &:hover {
    color: #fff;
  }
}

.popup-content {
  padding: 10px;
  font-size: 12px;

  >div {
    margin-bottom: 5px;
  }
}

.animation-params {
  margin: 15px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid rgba(225, 187, 130, 0.3);
  background: rgba(33, 32, 29, 0.6);
}

.params-header {
  margin-bottom: 10px;
  padding-bottom: 8px;
  color: #e1bb82;
  font-weight: bold;
  border-bottom: 1px solid rgba(225, 187, 130, 0.3);
}
</style>