<script setup lang="ts">
import { ref } from 'vue'
import Scene from './lib/Scene/Scene.js'

const screenX = ref(0)
const screenY = ref(0)
const result = ref('')
let latestQuery = 0

async function getWorldPosition() {
  const query = ++latestQuery
  result.value = ''
  if (!Number.isFinite(screenX.value) || !Number.isFinite(screenY.value)) {
    result.value = '请输入有效的屏幕坐标'
    return
  }
  try {
    const position = await Scene.screenToWorld(screenX.value, screenY.value)
    if (query !== latestQuery) return
    const llh = Array.isArray(position) ? position.slice(0, 3) : []
    result.value = llh.length === 3 && llh.every(Number.isFinite)
      ? '世界坐标：' + llh.map(value => value.toFixed(4)).join(', ')
      : '未获取到该位置的世界坐标'
  } catch (error) {
    if (query === latestQuery) result.value = error instanceof Error ? error.message : String(error)
  }
}
</script>

<template>
  <div>
    <el-form label-position="top" @submit.prevent="getWorldPosition">
      <el-form-item label="屏幕 X 坐标">
        <el-input-number v-model="screenX" :step="1" />
      </el-form-item>
      <el-form-item label="屏幕 Y 坐标">
        <el-input-number v-model="screenY" :step="1" />
      </el-form-item>
      <el-button native-type="submit" type="primary">获取世界坐标</el-button>
    </el-form>
    <p v-if="result" class="result-display" role="status">{{ result }}</p>
  </div>
</template>
