<script setup lang="ts">
import DasElectron from './lib/Scene/DasElectron.js'

const closeApp = () => {
  DasElectron.closeElectronApp()
}
</script>

<template>
  <div>
    <div class="title">关闭应用</div>
    <div class="split_line"></div>
    <div class="control-panel">
      <button class="btn btn-danger" @click="closeApp">关闭 Electron 应用</button>
    </div>
  </div>
</template>
