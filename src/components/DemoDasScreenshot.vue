<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue'
import { ScreenShotTileset, type ScreenShotTilesetProgress } from './lib/Scene/ScreenShotTileset.js'

const savePath = ref('')
const resolutionMultiplier = ref(1.0)
const tilesetMaxSSE = ref(1)
const minTileCount = ref(3)

const isStarting = ref(false)
const isCapturing = ref(false)
const isCancelling = ref(false)
const progressPercent = ref(0)
const finishedTileCount = ref(0)
const totalTileCount = ref(0)
const currentTileLoadProgress = ref(0)
const statusMessage = ref('等待开始')
const completedMessage = ref('')
const resultType = ref<'success' | 'error' | 'info'>('info')

let cancelRequested = false
let removeProgressListener: (() => void) | null = null
let removeCompletedListener: (() => void) | null = null

const toNumber = (value: unknown, fallback = 0) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

const updateProgress = (data: Partial<ScreenShotTilesetProgress>) => {
  const percent = data?.percent === undefined
    ? toNumber(data?.progress) * 100
    : toNumber(data.percent)

  progressPercent.value = clampPercent(percent)
  finishedTileCount.value = toNumber(data?.finishedTileCount)
  totalTileCount.value = toNumber(data?.totalTileCount)
  currentTileLoadProgress.value = clampPercent(toNumber(data?.currentTileLoadProgress))
}

// Demo：监听每秒推送的截图进度
const onScreenshotProgress = (data: ScreenShotTilesetProgress) => {
  updateProgress(data)
  isCapturing.value = true
  completedMessage.value = ''
  statusMessage.value = '正在等待瓦片加载并分块截图'
  resultType.value = 'info'
}

// Demo：监听成功、失败或取消后的统一完成通知
const onScreenshotCompleted = () => {
  isStarting.value = false
  isCapturing.value = false
  isCancelling.value = false

  if (cancelRequested) {
    statusMessage.value = '分块截图已取消'
    completedMessage.value = '已收到 screenshotCompleted 完成通知（取消）'
    resultType.value = 'info'
  } else {
    statusMessage.value = '分块截图流程已结束'
    completedMessage.value = '已收到 screenshotCompleted 完成通知'
    resultType.value = 'success'
  }
  cancelRequested = false
}

const refreshStatus = async () => {
  try {
    const status = await ScreenShotTileset.isCapturing()
    isCapturing.value = status.bCapturing
    updateProgress(status)
    statusMessage.value = status.bCapturing ? '分块截图正在进行' : '当前没有进行中的分块截图'
    resultType.value = 'info'
  } catch {
    statusMessage.value = '查询截图状态失败'
    resultType.value = 'error'
  }
}

const takeScreenshot = async () => {
  if (isStarting.value || isCapturing.value) return

  isStarting.value = true
  completedMessage.value = ''
  cancelRequested = false
  progressPercent.value = 0
  finishedTileCount.value = 0
  totalTileCount.value = 0
  currentTileLoadProgress.value = 0
  statusMessage.value = '正在启动分块截图'
  resultType.value = 'info'

  try {
    const result = await ScreenShotTileset.takeScreenshot(
      savePath.value,
      resolutionMultiplier.value,
      tilesetMaxSSE.value,
      minTileCount.value
    )
    isCapturing.value = result.bStarted || result.bCapturing

    if (result.bStarted) {
      statusMessage.value = '分块截图已启动，等待进度通知'
    } else if (result.bCapturing) {
      statusMessage.value = '已有分块截图正在进行'
      await refreshStatus()
    } else {
      statusMessage.value = '分块截图启动失败'
      resultType.value = 'error'
    }
  } catch {
    statusMessage.value = '分块截图请求失败'
    resultType.value = 'error'
  } finally {
    isStarting.value = false
  }
}

const cancelScreenshot = async () => {
  if (!isCapturing.value || isCancelling.value) return

  isCancelling.value = true
  try {
    const cancelled = await ScreenShotTileset.cancelScreenshot()
    if (cancelled) {
      cancelRequested = true
      statusMessage.value = '已发送取消请求，等待完成通知'
      resultType.value = 'info'
    } else {
      statusMessage.value = '没有可取消的分块截图'
      isCapturing.value = false
      resultType.value = 'error'
    }
  } catch {
    statusMessage.value = '取消分块截图失败'
    resultType.value = 'error'
  } finally {
    isCancelling.value = false
  }
}

const getShareData = inject<(key: string) => unknown>('getShareData')
onMounted(() => {
  if (!getShareData?.('viewerReady')) return
  removeProgressListener = ScreenShotTileset.onScreenshotProgress(onScreenshotProgress)
  removeCompletedListener = ScreenShotTileset.onScreenshotCompleted(onScreenshotCompleted)
  void refreshStatus()
})

onUnmounted(() => {
  removeProgressListener?.()
  removeCompletedListener?.()
})
</script>

<template>
  <div>
    <div class="title">3DTiles 分块高清出图</div>
    <div class="split_line"></div>

    <div class="control-panel">
      <div class="form-row">
        <label>保存路径</label>
        <el-input v-model="savePath" placeholder="留空保存到 ScreenShot/TilesetShot/tile_shot.png" clearable />
      </div>

      <div class="form-row">
        <label>分辨率倍数</label>
        <el-slider v-model="resolutionMultiplier" :min="0.5" :max="8" :step="0.5" show-input />
      </div>

      <div class="form-row">
        <label>3DTiles 最大屏幕空间误差</label>
        <el-input-number v-model="tilesetMaxSSE" :min="0" :max="64" :step="1" controls-position="right" />
      </div>

      <div class="form-row">
        <label>每边最少分块数</label>
        <el-input-number v-model="minTileCount" :min="0" :max="32" :step="1" controls-position="right" />
      </div>

      <div class="button-group">
        <el-button type="primary" :loading="isStarting" :disabled="isCapturing" @click="takeScreenshot">
          开始分块截图
        </el-button>
        <el-button type="danger" plain :loading="isCancelling" :disabled="!isCapturing" @click="cancelScreenshot">
          取消截图
        </el-button>
        <el-button :disabled="isStarting" @click="refreshStatus">刷新状态</el-button>
      </div>
    </div>

    <div class="event-panel">
      <div class="panel-header"><h3>进度事件 Demo</h3></div>
      <div class="progress-label">
        <span>整体进度</span>
        <span>{{ finishedTileCount }} / {{ totalTileCount || '-' }} 块</span>
      </div>
      <el-progress :percentage="progressPercent" :stroke-width="12" />
      <div class="progress-label current-tile">
        <span>当前块 3DTiles 加载进度</span>
        <span>{{ currentTileLoadProgress.toFixed(0) }}%</span>
      </div>
      <el-progress :percentage="currentTileLoadProgress" :stroke-width="8" :show-text="false" />
      <div class="status-tip" :class="resultType">{{ statusMessage }}</div>
    </div>

    <div class="event-panel">
      <div class="panel-header"><h3>完成事件 Demo</h3></div>
      <div v-if="completedMessage" class="completed-tip">{{ completedMessage }}</div>
      <div v-else class="waiting-tip">等待 screenshotCompleted 通知</div>
    </div>

    <div class="info-panel">
      <div class="panel-header"><h3>说明</h3></div>
      <div class="info-content">
        <ul>
          <li><strong>分块出图：</strong>跨多帧逐块渲染，每块等待 3DTiles 加载完成后截图</li>
          <li><strong>分辨率倍数：</strong>同时影响最终分辨率与分块数量，数值越大耗时越长</li>
          <li><strong>参数为 0：</strong>最大屏幕空间误差和最少分块数保持 UE 侧配置</li>
          <li><strong>取消截图：</strong>中止后已经写入磁盘的分块会保留</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-panel,
.event-panel,
.info-panel {
  margin: 20px 0;
  padding: 16px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 8px;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    color: #e1bb82;
    font-size: 13px;
  }
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;

  :deep(.el-button) {
    margin-left: 0;
  }
}

.panel-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(225, 187, 130, 0.2);

  h3 {
    margin: 0;
    color: #e1bb82;
    font-size: 16px;
    font-weight: 600;
  }
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;

  &.current-tile {
    margin-top: 16px;
  }
}

.status-tip,
.completed-tip,
.waiting-tip {
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  text-align: center;
}

.status-tip,
.waiting-tip {
  background: rgba(144, 147, 153, 0.1);
  color: #c0c4cc;
}

.status-tip.success,
.completed-tip {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.status-tip.error {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.info-content ul {
  margin: 0;
  padding-left: 20px;

  li {
    margin: 8px 0;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.5;

    strong {
      color: #e1bb82;
    }
  }
}

:deep(.el-input__wrapper) {
  background: rgba(33, 32, 29, 0.8);
  border: 1px solid rgba(225, 187, 130, 0.3);
  box-shadow: none;
}

:deep(.el-input__inner) {
  color: #fff;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-slider__runway) {
  background: rgba(225, 187, 130, 0.2);
}

:deep(.el-slider__bar),
:deep(.el-progress-bar__inner) {
  background: #e1bb82;
}

:deep(.el-slider__button) {
  border-color: #e1bb82;
}

:deep(.el-progress__text) {
  color: #e1bb82;
}
</style>
