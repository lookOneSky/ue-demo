<script setup lang="ts">
import { ref } from 'vue'
import { ThirdPersonCamera } from './lib/Scene/ThirdPersonCamera.js'
import skeletalConfig from '../../Skeletal.json'

const selectedFeet = ref('')
const selectedHair = ref('')
const selectedBottomBody = ref('')
const selectedUpperBody = ref('')
const isLoading = ref(false)

const changeFeet = async (path: string) => {
  await ThirdPersonCamera.setFeet(path)
}

const changeHair = async (path: string) => {
  await ThirdPersonCamera.setHair(path)
}

const changeBottomBody = async (path: string) => {
  await ThirdPersonCamera.setBottomBody(path)
}

const changeUpperBody = async (path: string) => {
  await ThirdPersonCamera.setUpperBody(path)
}

const applyAll = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await ThirdPersonCamera.updateAll({
      feetName: selectedFeet.value,
      hairName: selectedHair.value,
      bottomBodyName: selectedBottomBody.value,
      upperBodyName: selectedUpperBody.value,
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <div class="title">人物换装</div>
    <div class="split_line"></div>

    <div class="control-panel">
      <div class="row">
        <span class="label">脚部</span>
        <el-select v-model="selectedFeet" placeholder="选择脚部" @change="changeFeet">
          <el-option v-for="item in skeletalConfig.Feet" :key="item.path" :label="item.name" :value="item.name" />
        </el-select>
      </div>
      <div class="row">
        <span class="label">头发</span>
        <el-select v-model="selectedHair" placeholder="选择头发" @change="changeHair">
          <el-option v-for="item in skeletalConfig.Hair" :key="item.path" :label="item.name" :value="item.name" />
        </el-select>
      </div>
      <div class="row">
        <span class="label">下身</span>
        <el-select v-model="selectedBottomBody" placeholder="选择下身" @change="changeBottomBody">
          <el-option v-for="item in skeletalConfig.BottomBody" :key="item.path" :label="item.name" :value="item.name" />
        </el-select>
      </div>
      <div class="row">
        <span class="label">上身</span>
        <el-select v-model="selectedUpperBody" placeholder="选择上身" @change="changeUpperBody">
          <el-option v-for="item in skeletalConfig.UpperBody" :key="item.path" :label="item.name" :value="item.name" />
        </el-select>
      </div>

      <el-button type="primary" :loading="isLoading" @click="applyAll" style="margin-top:16px;width:100%">
        一键应用
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-panel {
  margin: 16px 0;
  padding: 16px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;

  .label {
    color: #e1bb82;
    font-size: 14px;
    width: 40px;
    flex-shrink: 0;
  }

  .el-select {
    flex: 1;
  }
}
</style>
