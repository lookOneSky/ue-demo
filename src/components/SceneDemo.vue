<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import Scene from './lib/Scene/Scene.js'
import { Camera } from './lib/Scene/Camera.js'

interface Level {
  name: string
  cameraPosition: string
  visible: boolean
  loaded: boolean
  pending?: boolean
  error?: string
}

const getShareData = inject<(key: string) => unknown>('getShareData')!
const session = computed(() => getShareData('viewerSession') as { levels?: Level[] } | null)
const levels = ref<Level[]>([])
watch(session, current => {
  levels.value = current?.levels ?? [
    { name: 'WholeMoutain', cameraPosition: '全山', visible: true, loaded: false },
    { name: 'YuXuGong', cameraPosition: '相机点位2', visible: true, loaded: false },
    { name: 'YuZhenGong', cameraPosition: '遇真宫', visible: true, loaded: false },
  ]
  if (current) current.levels = levels.value
}, { immediate: true })

async function changeLevel(level: Level, load: boolean, fly = false) {
  if (!session.value || level.pending || level.loaded === load) return
  level.pending = true
  level.error = ''
  try {
    if (fly) void Camera.flyToCameraPositionByName(level.cameraPosition, 0).catch(console.error)
    const accepted = load ? await Scene.loadLevel(level.name, level.visible) : await Scene.unloadLevel(level.name)
    if (accepted) level.loaded = load
    else level.error = load ? '加载请求失败' : '卸载请求失败'
  } catch (error) {
    level.error = error instanceof Error ? error.message : String(error)
  } finally {
    level.pending = false
  }
}

function switchToLevel(level: Level) {
  return Scene.loadNextLevel(level.name)
}

function changeAllLevels(load: boolean) {
  return Promise.all(levels.value.map(level => changeLevel(level, load)))
}
</script>

<template>
  <div class="scene-demo-panel">
    <div class="action-row">
      <el-button type="primary" :disabled="!session || !levels.some(level => !level.loaded && !level.pending)" @click="changeAllLevels(true)">加载所有关卡</el-button>
      <el-button type="danger" :disabled="!session || !levels.some(level => level.loaded && !level.pending)" @click="changeAllLevels(false)">卸载所有关卡</el-button>
    </div>
    <div v-for="level in levels" :key="level.name" class="control-section">
      <h4>{{ level.name }}</h4>
      <div class="level-controls">
        <el-switch v-model="level.visible" :disabled="level.loaded || level.pending" active-text="可见" inactive-text="不可见" :aria-label="level.name + ' 加载时可见'" />
        <span class="level-status" :class="{ loaded: level.loaded }">{{ level.error || (level.loaded ? '已请求加载' : '未加载') }}</span>
      </div>
      <div class="action-row">
        <el-button size="small" type="warning" :disabled="!session || level.pending" @click="switchToLevel(level)">顺序切换</el-button>
        <el-button size="small" :type="level.loaded ? 'danger' : 'primary'" :disabled="!session" :loading="level.pending" @click="changeLevel(level, !level.loaded, !level.loaded)">
          {{ level.loaded ? '卸载' : '加载' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.action-row, .level-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.scene-demo-panel > .action-row, .level-controls { margin-bottom: 12px; }
.level-status { font-size: 12px; }
</style>
