<script setup lang="ts">
import { ref } from 'vue'
import Scene from './lib/Scene/Scene.js'

const longitude = ref(114)
const latitude = ref(30)
const height = ref(0)
const result = ref<boolean | null>(null)

const handleSetOrigin = async () => {
  result.value = await Scene.SetOriginLLH(longitude.value, latitude.value, height.value)
}
</script>

<template>
  <div>
    <div class="title">场景原点设置</div>
    <div class="split_line"></div>
    <div class="sub-title">地理原点（经纬高）</div>
    <el-form-item label="经度" class="ruihua">
      <el-input-number v-model="longitude" :precision="6" :step="0.01" style="width:150px" />
    </el-form-item>
    <el-form-item label="纬度" class="ruihua">
      <el-input-number v-model="latitude" :precision="6" :step="0.01" style="width:150px" />
    </el-form-item>
    <el-form-item label="高度(m)" class="ruihua">
      <el-input-number v-model="height" :precision="2" :step="1" style="width:150px" />
    </el-form-item>
    <div style="margin-left:15px">
      <el-button type="primary" @click="handleSetOrigin" style="margin:10px">设置原点</el-button>
    </div>
    <div v-if="result !== null" class="result-panel">
      <p :style="{ color: result ? '#67c23a' : '#f56c6c' }">
        {{ result ? '设置成功' : '设置失败' }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title { color:#e1bb82; text-align:center; font-size:24px; letter-spacing:9.6px; margin-top:15px; }
.split_line { background-image:url('/src/assets/images/hl.png'); background-size:100% 100%; height:12px; width:180px; margin:15px auto 20px; }
.sub-title { color:#e1bb82; font-size:16px; font-weight:600; margin:20px 0 10px 15px; padding-left:10px; border-left:3px solid #e1bb82; }
.result-panel { margin:10px; padding:10px; background:rgba(225,187,130,0.1); border-radius:5px; }
</style>
