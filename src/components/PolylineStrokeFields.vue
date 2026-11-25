<script setup>
const style = defineModel({ type: Object, required: true })
const emit = defineEmits(['color', 'thickness', 'depth', 'spline'])
</script>

<template>
  <el-form-item label="线条颜色">
    <el-input-number v-for="(channel, index) in ['R', 'G', 'B', 'A']" :key="channel"
      v-model="style.color[index]" :aria-label="channel" :min="0" :max="1" :step="0.1" :controls="false" />
    <el-button @click="emit('color')">应用颜色</el-button>
  </el-form-item>
  <el-form-item label="线条粗细">
    <el-input-number v-model="style.thickness" :min="0.1" :max="20" :step="0.1" @change="emit('thickness')" />
  </el-form-item>
  <el-form-item label="深度测试">
    <el-switch v-model="style.enableDepthTest" @change="emit('depth')" />
  </el-form-item>
  <el-form-item label="样条插值">
    <el-switch v-model="style.enableSpline" @change="emit('spline')" />
  </el-form-item>
  <el-form-item v-if="style.enableSpline" label="插值数量">
    <el-input-number v-model="style.interpolateCount" :min="5" :max="50" @change="emit('spline')" />
  </el-form-item>
</template>

<style scoped>
.el-input-number.is-without-controls { width: 60px; }
</style>
