<script setup lang="ts">
import { ref } from 'vue'
import { DasPointsTool } from "./lib/Tool/DasPointsTool.js"
import { DasUtilsCalCircleLook } from "./lib/Scene/DasUtilsCalCircleLook.js"
import { Camera } from './lib/Scene/Camera.js'

// 工具状态
const isToolActive = ref(false)

// 中心点（洞窟中心默认值）
const circleLLH = ref({
  longitude: 110.97058312379704,
  latitude: 34.557115885400158,
  height: 162.53895368069888
})

// 观察距离（米），默认1m
const distance = ref(1)

// 飞行时间（秒）
const duration = ref(3)

// 计算结果
const lookResult = ref<any>(null)

// 启动点工具
const startTool = async () => {
  await DasPointsTool.setToCurrent()
  isToolActive.value = true
}

// 停止点工具
const stopTool = async () => {
  await DasPointsTool.finishTool()
  isToolActive.value = false
}

// 取点工具第一点，计算位姿后飞入
const flyToFirstPoint = async () => {
  const info = await DasPointsTool.getAll()
  const arrTarget = info?.posLLH
  if (!arrTarget || arrTarget.length < 3) {
    console.warn('请先在场景中拾取一个点')
    return
  }

  const arrCircle = [circleLLH.value.longitude, circleLLH.value.latitude, circleLLH.value.height]
  const objLook = await DasUtilsCalCircleLook.calcLookTransform(arrTarget, arrCircle, distance.value * 100)
  if (!objLook.locationLLH) {
    console.warn('位姿计算失败')
    return
  }
  lookResult.value = objLook

  // addHeightScale 传0，洞窟内飞行不抬高
  await Camera.flyToLocationLLH(objLook.locationLLH, objLook.rotationLLH, duration.value, 0)
}
</script>

<template>
  <div>
    <div class="title">洞窟内相机定位</div>
    <div class="split_line"></div>

    <div class="control-group">
      <el-button
        :type="isToolActive ? 'danger' : 'primary'"
        @click="isToolActive ? stopTool() : startTool()"
        style="margin: 10px;">
        {{ isToolActive ? '停止点工具' : '启动点工具' }}
      </el-button>

      <el-button type="success" @click="flyToFirstPoint" style="margin: 10px;">
        第一点飞入
      </el-button>
    </div>

    <div class="params-group">
      <el-form-item label="中心点经度" class="ruihua">
        <el-input-number v-model="circleLLH.longitude" :precision="8" :step="0.0001" style="width: 200px;" />
      </el-form-item>
      <el-form-item label="中心点纬度" class="ruihua">
        <el-input-number v-model="circleLLH.latitude" :precision="8" :step="0.0001" style="width: 200px;" />
      </el-form-item>
      <el-form-item label="中心点高度(m)" class="ruihua">
        <el-input-number v-model="circleLLH.height" :precision="2" :step="1" style="width: 200px;" />
      </el-form-item>
      <el-form-item label="距离(m)" class="ruihua">
        <el-input-number v-model="distance" :min="0.1" :step="0.5" :precision="2" style="width: 150px;" />
      </el-form-item>
      <el-form-item label="飞行时间(s)" class="ruihua">
        <el-input-number v-model="duration" :min="0" :step="1" style="width: 150px;" />
      </el-form-item>
    </div>

    <div class="status-panel" :class="{ 'active': isToolActive }">
      <p>当前状态: {{ isToolActive ? '工具已激活，可在场景中拾取点' : '工具未激活' }}</p>
      <p v-if="lookResult">相机位置: {{ lookResult.locationLLH }}</p>
      <p v-if="lookResult">相机姿态: {{ lookResult.rotationLLH }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .params-group {
  margin: 15px 0;
}

.status-panel {
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.1);
  color: #e1bb82;

  &.active {
    background: rgba(225, 187, 130, 0.2);
  }
}
</style>
