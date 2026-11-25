<script setup lang="ts">
import DasElectron from './lib/Scene/DasElectron.js'

const host = window as Window & { electronAPI?: { bridge?: { send?: unknown } } }
const canCloseApp = typeof host.electronAPI?.bridge?.send === 'function'

const closeApp = () => {
  if (!canCloseApp) return
  DasElectron.closeElectronApp()
}
</script>

<template>
  <div>
    <div class="title">关闭应用</div>
    <div class="split_line"></div>
    <div class="control-panel">
      <button class="btn btn-danger" :disabled="!canCloseApp" @click="closeApp">关闭 Electron 应用</button>
      <p v-if="!canCloseApp" class="hint">请在提供 Electron 桥接的桌面应用中使用此功能。</p>
    </div>
  </div>
</template>
