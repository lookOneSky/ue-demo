<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import Scene from './lib/Scene/Scene.js'
import { requestUE } from '../utils/demoRpc.js'

const savePath = ref('')
const resolutionMultiplier = ref(1.0)
const tilesScreenSpaceError = ref(0)
const isLoading = ref(false)
const lastResult = ref<string | null>(null)

let unsubscribe: (() => void) | undefined

function finishRequest(message: string) {
  lastResult.value = message
  isLoading.value = false
  unsubscribe?.()
  unsubscribe = undefined
}

onUnmounted(() => unsubscribe?.())

const takeScreenshot = async () => {
  if (isLoading.value) return
  isLoading.value = true
  lastResult.value = null
  try {
    const stop = Scene.onScreenshotCompleted(() => finishRequest('截图完成'))
    unsubscribe = () => stop()
    await requestUE(Scene.className, 'takeScreenshot', {
      savePath: savePath.value, resolutionMultiplier: resolutionMultiplier.value,
      '3DtilesScreenSpaceError': tilesScreenSpaceError.value,
    })
  } catch {
    finishRequest('截图请求失败')
  }
}
</script>

<template>
  <div>
    <div class="title">场景截图（原接口）</div>
    <div class="split_line"></div>

    <div class="control-panel">
      <div class="form-row">
        <label>保存路径</label>
        <el-input v-model="savePath" placeholder="留空则保存到默认目录" clearable />
      </div>

      <div class="form-row">
        <label>分辨率倍数</label>
        <el-slider v-model="resolutionMultiplier" :min="0.5" :max="4" :step="0.5" show-input />
      </div>

      <div class="form-row">
        <label>3DTiles 屏幕空间误差</label>
        <el-input-number v-model="tilesScreenSpaceError" :min="0" :max="64" :step="1" controls-position="right" />
      </div>

      <div class="button-group">
        <el-button type="primary" :loading="isLoading" @click="takeScreenshot">截图</el-button>
      </div>

      <div v-if="lastResult" class="result-tip" :class="{ error: lastResult.includes('失败') }">
        {{ lastResult }}
      </div>
    </div>

    <div class="info-panel">
      <div class="panel-header"><h3>说明</h3></div>
      <div class="info-content">
        <ul>
          <li><strong>保存路径：</strong>为空时保存到 UE 项目默认截图目录</li>
          <li><strong>分辨率倍数：</strong>1.0 为原始分辨率，越大图片越清晰</li>
          <li><strong>3DTiles 屏幕空间误差：</strong>0 为不调整；数值越小瓦片越精细，大场景下调小会明显卡顿</li>
          <li><strong>截图完成：</strong>UE 触发 screenshotCompleted 事件通知</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-panel {
  margin: 20px 0;
  padding: 20px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 8px;
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
  justify-content: center;
}

.result-tip {
  padding: 10px 14px;
  border-radius: 6px;
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
  font-size: 14px;
  text-align: center;

  &.error {
    background: rgba(245, 108, 108, 0.1);
    color: #f56c6c;
  }
}

.info-panel {
  margin: 20px 0;
  padding: 16px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 8px;
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

:deep(.el-slider__bar) {
  background: #e1bb82;
}

:deep(.el-slider__button) {
  border-color: #e1bb82;
}
</style>
