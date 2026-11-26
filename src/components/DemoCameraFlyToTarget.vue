<script setup lang="ts">
import { ref } from 'vue'
import { usePointPicking } from '../utils/usePointPicking'
import { DasPointsTool } from './lib/Tool/DasPointsTool.js'
import { Camera } from './lib/Scene/Camera.js'
import { isLLH } from '../utils/cameraDemoView'
import { isUESuccess, requestUE } from '../utils/demoRpc.js'

const { isToolActive, changingTool, startTool, stopTool } = usePointPicking() // 点工具是否激活
const targetLLH = ref([0, 0, 0]) // 目标点[经度,纬度,高度]
const heightToTarget = ref(100) // 相机比目标点高的高度（米）
const pitch = ref(-30) // 相机俯仰角（度，俯视为负）
const offsetScreen = ref([0, 0]) // 目标点在屏幕上的偏移像素[x,y]（X右Y下）
const duration = ref(5) // 飞行时间（秒）
const addHeightScale = ref(1) // 飞行时增加高度的缩放系数
const flyResult = ref<boolean | null>(null) // 飞行结果

// 把点工具取到的点填为目标点
const readPickedPoint = async () => {
  const point = await DasPointsTool.getPointPosition()
  if (!isLLH(point)) {
    console.warn('请先在场景中拾取一个点')
    return
  }
  targetLLH.value = [...point]
}

// 以指定俯仰角飞到目标点上方观察，并按屏幕像素偏移
const flyToTarget = async () => {
  flyResult.value = null
  try {
    const reply = await requestUE(Camera.className, 'flyToTargetLLHWithOffsetScreen', {
      targetLLH: targetLLH.value, heightToTarget: heightToTarget.value, pitch: pitch.value,
      offsetScreen: offsetScreen.value, duration: duration.value, addHeightScale: addHeightScale.value,
    })
    flyResult.value = isUESuccess(reply)
  } catch (error) {
    flyResult.value = false
    console.error('相机飞行失败', error)
  }
}
</script>

<template>
  <div>
    <div class="title">目标点屏幕偏移飞行</div>
    <div class="split_line"></div>

    <div class="control-group">
      <el-button
        :type="isToolActive ? 'danger' : 'primary'"
        :loading="changingTool" @click="isToolActive ? stopTool() : startTool()"
        style="margin: 10px;">
        {{ isToolActive ? '停止点工具' : '启动点工具' }}
      </el-button>

      <el-button type="warning" @click="readPickedPoint" style="margin: 10px;">
        读取拾取点
      </el-button>

      <el-button type="success" @click="flyToTarget" style="margin: 10px;">
        飞行观察
      </el-button>
    </div>

    <div class="params-group">
      <el-form-item label="目标经度" class="ruihua">
        <el-input-number v-model="targetLLH[0]" :precision="8" :step="0.0001" style="width: 200px;" />
      </el-form-item>
      <el-form-item label="目标纬度" class="ruihua">
        <el-input-number v-model="targetLLH[1]" :precision="8" :step="0.0001" style="width: 200px;" />
      </el-form-item>
      <el-form-item label="目标高度(m)" class="ruihua">
        <el-input-number v-model="targetLLH[2]" :precision="2" :step="1" style="width: 200px;" />
      </el-form-item>
      <el-form-item label="相机高出目标(m)" class="ruihua">
        <el-input-number v-model="heightToTarget" :min="0" :step="10" :precision="2" style="width: 150px;" />
      </el-form-item>
      <el-form-item label="俯仰角(°，俯视为负)" class="ruihua">
        <el-input-number v-model="pitch" :min="-90" :max="90" :step="1" style="width: 150px;" />
      </el-form-item>
      <el-form-item label="屏幕偏移X(px，向右)" class="ruihua">
        <el-input-number v-model="offsetScreen[0]" :step="10" style="width: 150px;" />
      </el-form-item>
      <el-form-item label="屏幕偏移Y(px，向下)" class="ruihua">
        <el-input-number v-model="offsetScreen[1]" :step="10" style="width: 150px;" />
      </el-form-item>
      <el-form-item label="飞行时间(s)" class="ruihua">
        <el-input-number v-model="duration" :min="0" :step="1" style="width: 150px;" />
      </el-form-item>
      <el-form-item label="高度缩放 addHeightScale" class="ruihua">
        <el-input-number v-model="addHeightScale" :min="0" :step="0.1" :precision="1" style="width: 150px;" />
      </el-form-item>
    </div>

    <div class="status-panel" :class="{ 'active': isToolActive }">
      <p>当前状态: {{ isToolActive ? '工具已激活，可在场景中拾取点' : '工具未激活' }}</p>
      <p>偏航角沿用当前相机，视线不朝向目标点时飞行失败</p>
      <p v-if="flyResult !== null">飞行结果: {{ flyResult ? '成功' : '失败' }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title { color:#e1bb82; text-align:center; font-size:24px; letter-spacing:9.6px; margin-top:15px; }
.split_line { background-image:url('/src/assets/images/hl.png'); background-size:100% 100%; height:12px; width:180px; margin:15px auto 20px; }

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
