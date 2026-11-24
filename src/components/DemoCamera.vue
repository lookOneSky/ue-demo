<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import * as cameraModule from './lib/Scene/Camera.js'

const props = defineProps<{ ready: boolean }>()
const emit = defineEmits<{ snippet: [code: string]; result: [message: string] }>()
const methods = {
  flyToCameraPositionByName: { name: '飞行到点位', help: '通过预设点位名称，让相机在指定时间内飞行到目标视角。' },
  getCameraFlyInfoLLH: { name: '读取相机信息', help: '读取相机的位置与旋转，回填到「飞行到指定位置」的参数中。' },
  flyToLocationLongLat: { name: '经纬度飞行', help: '基于场景地形高度，飞向指定经纬度。' },
  flyToLocationLLH: { name: '飞行到指定位置', help: '使用经纬度、高度与欧拉角设置目标视角。' },
}
type Method = keyof typeof methods
interface CameraView {
  locationLLH: [number, number, number]
  rotationLLH: { pitch: number; yaw: number; roll: number }
}
interface CameraApi {
  flyToCameraPositionByName(name: string, duration: number): Promise<boolean>
  getCameraFlyInfoLLH(): Promise<Partial<CameraView>>
  flyToLocationLLH(location: CameraView['locationLLH'], rotation: CameraView['rotationLLH'], duration: number, heightScale: number | boolean): Promise<boolean>
  flyToLocationLongLat(longitude: number, latitude: number, yaw: number, pitch: number, duration: number, heightScale: number, extraHeight: number): Promise<boolean>
  forbitAddHeightOnFly(forbid: boolean): Promise<boolean>
}
const { Camera } = cameraModule as unknown as { Camera: CameraApi }

const method = ref<Method>('flyToCameraPositionByName')
const positionName = ref('相机点位1')
const flyDuration = ref(5)
const forbidAddHeight = ref(false)
const initialPose = { longitude: 0, latitude: 0, height: 0, pitch: 0, yaw: 0, roll: 0 }
const initialGroundTarget = { longitude: 0, latitude: 0, pitch: -30, yaw: 0, duration: 5, scale: 1, extraHeight: 0 }
const pose = reactive({ ...initialPose })
const ground = reactive({ ...initialGroundTarget })
const lastView = ref<CameraView | null>(null)
const isGroundFlight = computed(() => method.value === 'flyToLocationLongLat')
const usesCoordinates = computed(() => isGroundFlight.value || method.value === 'flyToLocationLLH')
const target = computed(() => isGroundFlight.value ? ground : pose)
const duration = computed({
  get: () => isGroundFlight.value ? ground.duration : flyDuration.value,
  set: (value: number) => {
    if (isGroundFlight.value) ground.duration = value
    else flyDuration.value = value
  }
})

function prepareCall<Args extends unknown[], Result>(fn: (...args: Args) => Promise<Result>, ...args: Args) {
  return { args, run: () => fn.apply(Camera, args) }
}
const call = computed(() => {
  switch (method.value) {
    case 'getCameraFlyInfoLLH': return prepareCall(Camera.getCameraFlyInfoLLH)
    case 'flyToCameraPositionByName': return prepareCall(Camera.flyToCameraPositionByName, positionName.value, flyDuration.value)
    case 'flyToLocationLLH': return prepareCall(Camera.flyToLocationLLH,
      [pose.longitude, pose.latitude, pose.height],
      { pitch: pose.pitch, yaw: pose.yaw, roll: pose.roll },
      flyDuration.value, true
    )
    case 'flyToLocationLongLat': return prepareCall(Camera.flyToLocationLongLat,
      ground.longitude, ground.latitude, ground.yaw, ground.pitch,
      ground.duration, ground.scale, ground.extraHeight
    )
  }
})

const snippet = computed(() => {
  if (method.value === 'getCameraFlyInfoLLH') return 'const view = await Camera.getCameraFlyInfoLLH();'
  const lines = []
  if (usesCoordinates.value) lines.push('await Camera.forbitAddHeightOnFly(' + forbidAddHeight.value + ');')
  lines.push('const arrived = await Camera.' + method.value + '(')
  lines.push('  ' + call.value.args.map(value => JSON.stringify(value)).join(',\n  '))
  lines.push(');')
  return lines.join('\n')
})
watch(snippet, code => emit('snippet', code), { immediate: true })

const busy = ref(false)
let runId = 0
let responseTimer: number | undefined
function invalidate() {
  window.clearTimeout(responseTimer)
  responseTimer = undefined
  runId++
  busy.value = false
}
function waitForReply(request: number, waitingFor: keyof CameraApi) {
  window.clearTimeout(responseTimer)
  responseTimer = window.setTimeout(() => {
    if (request !== runId) return
    invalidate()
    emit('result', '等待 Camera.' + waitingFor + ' 回包超时。15 秒内未收到 UE 的回复，执行结果未知，可重新运行。')
  }, 15_000)
}
watch(method, () => {
  invalidate()
  emit('result', '')
}, { flush: 'sync' })
watch(() => props.ready, connected => {
  if (!connected && busy.value) {
    invalidate()
    emit('result', '场景连接已断开，尚未收到本次调用的结果。')
  }
}, { flush: 'sync' })
onBeforeUnmount(invalidate)

function reset() {
  invalidate()
  switch (method.value) {
    case 'flyToCameraPositionByName':
      positionName.value = '相机点位1'
      flyDuration.value = 5
      break
    case 'getCameraFlyInfoLLH':
      lastView.value = null
      break
    case 'flyToLocationLongLat':
      Object.assign(ground, initialGroundTarget)
      forbidAddHeight.value = false
      break
    case 'flyToLocationLLH':
      Object.assign(pose, initialPose)
      flyDuration.value = 5
      forbidAddHeight.value = false
      break
  }
  emit('result', '')
}
defineExpose({ reset })

function isCameraView(value: Partial<CameraView> | boolean): value is CameraView {
  return Boolean(value && typeof value === 'object' && Array.isArray(value.locationLLH) && value.locationLLH.length === 3 &&
    value.locationLLH.every(Number.isFinite) && value.rotationLLH &&
    [value.rotationLLH.pitch, value.rotationLLH.yaw, value.rotationLLH.roll].every(Number.isFinite))
}

async function run() {
  if (!props.ready || busy.value) return
  const request = ++runId
  const api = method.value
  const submitted = call.value
  const submittedCode = snippet.value
  const blockHeight = forbidAddHeight.value
  busy.value = true
  emit('result', '正在等待 Camera.' + api + ' 返回…')
  try {
    if (usesCoordinates.value) {
      waitForReply(request, 'forbitAddHeightOnFly')
      const configured = await Camera.forbitAddHeightOnFly(blockHeight)
      if (request !== runId) return
      if (!configured) throw new Error('设置飞行高度选项失败。')
    }
    waitForReply(request, api)
    const result = await submitted.run()
    if (request !== runId) return
    if (api === 'getCameraFlyInfoLLH') {
      if (!isCameraView(result)) throw new Error('场景返回的相机信息缺少有效的位置或旋转数据。')
      lastView.value = result
      const [longitude, latitude, height] = result.locationLLH
      Object.assign(pose, result.rotationLLH, { longitude, latitude, height })
    }
    const status = result === false ? '调用失败，接口返回 false。' : '调用完成'
    emit('result', status + '\n' + JSON.stringify(result, null, 2) + '\n\n本次调用\n' + submittedCode)
  } catch (error) {
    if (request === runId) emit('result', '调用失败\n' + (error instanceof Error ? error.message : String(error)))
  } finally {
    if (request === runId) invalidate()
  }
}
</script>

<template>
  <form class="camera-parameters" @submit.prevent="run">
    <label class="cam-field">
      <span>接口方法</span>
      <select v-model="method">
        <option v-for="(item, key) in methods" :key="key" :value="key">{{ item.name }}</option>
      </select>
    </label>
    <p class="cam-help">{{ methods[method].help }}</p>
    <div class="cam-fields">
      <label v-if="method === 'flyToCameraPositionByName'" class="cam-field">
        <span>点位名称</span>
        <input v-model="positionName" required placeholder="请输入点位名称" />
      </label>
      <div v-if="usesCoordinates" class="cam-grid">
        <label class="cam-field"><span>经度（°）</span><input v-model.number="target.longitude" type="number" step="any" required /></label>
        <label class="cam-field"><span>纬度（°）</span><input v-model.number="target.latitude" type="number" step="any" required /></label>
        <label v-if="!isGroundFlight" class="cam-field"><span>高度（m）</span><input v-model.number="pose.height" type="number" step="any" required /></label>
        <label class="cam-field"><span>偏航角 Yaw（°）</span><input v-model.number="target.yaw" type="number" min="-360" max="360" step="any" required /></label>
        <label class="cam-field"><span>俯仰角 Pitch（°）</span><input v-model.number="target.pitch" type="number" min="-90" max="90" step="any" required /></label>
        <label v-if="!isGroundFlight" class="cam-field"><span>滚转角 Roll（°）</span><input v-model.number="pose.roll" type="number" min="-180" max="180" step="any" required /></label>
      </div>
      <div v-if="method !== 'getCameraFlyInfoLLH'" class="cam-field">
        <label for="camera-duration-number">飞行时间</label>
        <div class="cam-duration">
          <input v-model.number="duration" type="range" min="0.1" max="60" step="0.1" aria-label="滑动调整飞行时间（秒）" :style="{ '--fill': (duration - 0.1) / 59.9 * 100 + '%' }" />
          <span class="cam-duration-value"><input id="camera-duration-number" v-model.number="duration" type="number" min="0.1" max="60" step="0.1" required /><span>s</span></span>
        </div>
      </div>
      <template v-if="isGroundFlight">
        <div class="cam-grid">
          <label class="cam-field"><span>高度缩放系数</span><input v-model.number="ground.scale" type="number" min="0" step="any" required /></label>
          <label class="cam-field"><span>附加观察高度（m）</span><input v-model.number="ground.extraHeight" type="number" step="any" required /></label>
        </div>
        <p class="cam-help">当前 SDK 向引擎传递前六个参数，附加观察高度仅保留在调用示例中。</p>
      </template>
      <label v-if="usesCoordinates" class="cam-check"><input v-model="forbidAddHeight" type="checkbox" />飞行时禁止添加高度</label>
      <dl v-if="method === 'getCameraFlyInfoLLH' && lastView" class="cam-view">
        <dt>位置 · 经度 / 纬度 / 高度</dt><dd>{{ lastView.locationLLH.join(', ') }}</dd>
        <dt>旋转 · Pitch / Yaw / Roll</dt><dd>{{ lastView.rotationLLH.pitch }}° / {{ lastView.rotationLLH.yaw }}° / {{ lastView.rotationLLH.roll }}°</dd>
      </dl>
    </div>
    <div class="cam-actions">
      <p v-if="!ready" id="cam-offline" class="cam-help">连接 UE 场景后即可运行示例。</p>
      <button type="submit" class="cam-run" :disabled="!ready || busy" :aria-describedby="!ready ? 'cam-offline' : undefined">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 4 13 8-13 8z" /></svg>
        {{ busy ? '正在运行…' : '运行示例' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.camera-parameters {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  height: 100%;
  color: #172e4c;
  font-family: inherit;
  text-align: left;
  color-scheme: light;
}
.camera-parameters, .camera-parameters * { box-sizing: border-box; }
.cam-field { display: grid; min-width: 0; gap: 7px; }
.cam-field > span, .cam-field > label, .cam-check { color: #334d6c; font-size: 13px; line-height: 1.4; font-weight: 550; }
.cam-field input:not([type=range]), .cam-field select {
  width: 100%; height: 37px; min-width: 0; border: 1px solid #cbd8e8; border-radius: 5px;
  padding: 0 9px; background: #fff; color: #203957; font: inherit; font-size: 13px;
}
.cam-field select { padding-right: 5px; }
.cam-field input:focus-visible, .cam-field select:focus-visible, .cam-run:focus-visible { outline: 2px solid #548fff; outline-offset: 2px; }
.cam-help { margin: 0; color: #5f738b; font-size: 12px; line-height: 1.6; }
.cam-fields { display: grid; gap: 15px; margin: 6px 0 0; }
.cam-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.cam-duration { display: flex; align-items: center; gap: 12px; }
.cam-duration input[type=range] { flex: 1; width: 100%; min-width: 16px; height: 24px; margin: 0; appearance: none; cursor: pointer; background: transparent; }
.cam-duration input[type=range]::-webkit-slider-runnable-track { height: 4px; border-radius: 3px; background: linear-gradient(to right, #245cdb var(--fill), #dbe5f5 var(--fill)); }
.cam-duration input[type=range]::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; margin-top: -5px; background: #245cdb; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 0 1px #245cdb; }
.cam-duration input[type=range]::-moz-range-track { height: 4px; border-radius: 3px; background: #dbe5f5; }
.cam-duration input[type=range]::-moz-range-progress { height: 4px; border-radius: 3px; background: #245cdb; }
.cam-duration input[type=range]::-moz-range-thumb { width: 10px; height: 10px; border: 2px solid white; border-radius: 50%; background: #245cdb; box-shadow: 0 0 0 1px #245cdb; }
.cam-duration-value { display: flex; align-items: center; flex: 0 0 74px; gap: 4px; padding-right: 8px; border: 1px solid #cbd8e8; border-radius: 5px; font: 12px Consolas, monospace; color: #5f738b; }
.cam-duration .cam-duration-value input { height: 34px; border: none; font-family: Consolas, monospace; }
.cam-check { display: flex; align-items: center; gap: 7px; }
.cam-check input { margin: 0; accent-color: #245cdb; }
.cam-view { margin: 0; padding: 12px; border-radius: 6px; background: #f3f6fb; font-size: 12px; }
.cam-view dt { color: #566a84; }
.cam-view dd { margin: 3px 0 7px; font-family: Consolas, monospace; overflow-wrap: anywhere; }
.cam-view dd:last-child { margin-bottom: 0; }
.cam-actions { display: grid; gap: 7px; padding-top: 13px; margin-top: auto; }
.camera-parameters .cam-run { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; min-height: 38px; padding: 8px 12px; border: 0; border-radius: 5px; background: #245cdb; color: #fff; cursor: pointer; font: inherit; font-size: 14px; line-height: 1.4; font-weight: 600; }
.cam-run svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linejoin: round; }
.camera-parameters .cam-run:hover:enabled { background: #194dc6; }
.camera-parameters .cam-run:disabled { cursor: not-allowed; background: #526faa; }
</style>
