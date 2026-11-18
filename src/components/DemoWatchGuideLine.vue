<script setup lang="ts">
import { ref } from 'vue'
import { WatchGuideLine } from './lib/Scene/WatchGuideLine.js'

const routeName = ref('HCSRoad2')
const result = ref<boolean | null>(null)

const handleSetRouteName = async () => {
  result.value = await WatchGuideLine.setCurrentGuideLineRouteName(routeName.value)
}
</script>

<template>
  <div>
    <div class="title">引导路线</div>
    <div class="split_line"></div>
    <div class="sub-title">激活路线</div>
    <el-form-item label="路线名" class="ruihua">
      <el-input v-model="routeName" placeholder="请输入路线名" style="width:180px" />
    </el-form-item>
    <div style="margin-left:15px">
      <el-button type="primary" @click="handleSetRouteName" style="margin:10px">设置路线</el-button>
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
