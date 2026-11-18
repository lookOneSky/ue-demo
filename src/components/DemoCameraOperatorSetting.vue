<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Camera } from './lib/Scene/Camera.js'

// 边界检查
const disableBoundCheck = ref(false)

// Pawn启用
const pawnEnable = ref(true)

// 鼠标滚轮缩放速度
const mouseWheelSpeed = ref(1.0)

// 强制近距离平移模式
const forceUseNearTranslationMode = ref(false)

// 水平圆形限制范围
const boundCenterLLH = ref([0, 0, 0]) // 圆心[经度,纬度,高度]
const boundRadius = ref(0) // 半径（米），<=0关闭限制
const boundCanIntersect = ref(true) // 越界时是否滑到圆边界（false直接拒绝移动）

// 切换边界检查
const handleChangeDisableBoundCheck = async (val: boolean) => {
  await Camera.setDisableBoundCheck(val)
  await handleRefreshDisableBoundCheck()
}
const handleRefreshDisableBoundCheck = async () => {
  disableBoundCheck.value = await Camera.isDisableBoundCheck()
}

// 切换Pawn启用
const handleChangePawnEnable = async (val: boolean) => {
  await Camera.setPawnEnable(val)
  await handleRefreshPawnEnable()
}
const handleRefreshPawnEnable = async () => {
  pawnEnable.value = await Camera.getPawnEnable()
}

// 设置鼠标滚轮缩放速度
const handleSetMouseWheelSpeed = async () => {
  await Camera.setMouseWheelSpeed(mouseWheelSpeed.value)
  await handleRefreshMouseWheelSpeed()
}
const handleRefreshMouseWheelSpeed = async () => {
  mouseWheelSpeed.value = await Camera.getMouseWheelSpeed()
}

// 切换强制近距离平移模式
const handleChangeForceUseNearTranslationMode = async (val: boolean) => {
  await Camera.setForceUseNearTranslationMode(val)
  await handleRefreshForceUseNearTranslationMode()
}
const handleRefreshForceUseNearTranslationMode = async () => {
  forceUseNearTranslationMode.value = await Camera.isForceUseNearTranslationMode()
}

// 取当前相机位置作为圆心
const handleUseCameraAsBoundCenter = async () => {
  const info = await Camera.getCameraFlyInfoLLH()
  if (info.locationLLH) boundCenterLLH.value = [...info.locationLLH]
}
// 设置水平圆形限制范围
const handleSetBoundingSphere = async () => {
  await Camera.setBoundingSphere(boundCenterLLH.value, boundRadius.value, boundCanIntersect.value)
  await handleRefreshBoundingSphere()
}
// 关闭水平圆形限制
const handleClearBoundingSphere = async () => {
  await Camera.clearBoundingSphere()
  await handleRefreshBoundingSphere()
}
// 获取水平圆形限制范围
const handleRefreshBoundingSphere = async () => {
  const bound = await Camera.getBoundingSphere()
  if (!bound.centerLLH) return
  boundCenterLLH.value = [...bound.centerLLH]
  boundRadius.value = bound.radius
  boundCanIntersect.value = bound.canIntersect
}

// 初始化时拉取当前状态
onMounted(() => {
  handleRefreshDisableBoundCheck()
  handleRefreshPawnEnable()
  handleRefreshMouseWheelSpeed()
  handleRefreshForceUseNearTranslationMode()
  handleRefreshBoundingSphere()
})
</script>

<template>
  <div class="camera-operator-setting-demo">
    <div class="demo-header">
      <h3>通用操作器设置</h3>
      <div class="header-line"></div>
    </div>

    <div class="demo-content">
      <!-- 边界检查 -->
      <div class="control-section">
        <h4>边界检查</h4>
        <div class="form-row">
          <div class="form-group">
            <label>禁用边界检查</label>
            <el-switch
              v-model="disableBoundCheck"
              active-color="#E1BB82"
              inactive-color="rgba(255, 255, 255, 0.2)"
              @change="handleChangeDisableBoundCheck"
            ></el-switch>
          </div>
          <el-button @click="handleRefreshDisableBoundCheck" type="info" class="action-btn">
            刷新
          </el-button>
        </div>
      </div>

      <!-- 水平圆形限制范围 -->
      <div class="control-section">
        <h4>水平圆形限制范围（禁用边界检查时不生效）</h4>
        <div class="form-row">
          <div class="form-group">
            <label>圆心经度</label>
            <el-input-number v-model="boundCenterLLH[0]" :precision="8" :step="0.0001" style="width: 180px;"></el-input-number>
          </div>
          <div class="form-group">
            <label>圆心纬度</label>
            <el-input-number v-model="boundCenterLLH[1]" :precision="8" :step="0.0001" style="width: 180px;"></el-input-number>
          </div>
          <div class="form-group">
            <label>圆心高度(m)</label>
            <el-input-number v-model="boundCenterLLH[2]" :precision="2" :step="1" style="width: 140px;"></el-input-number>
          </div>
          <el-button @click="handleUseCameraAsBoundCenter" type="info" class="action-btn">取当前相机位置</el-button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>半径(m，≤0关闭)</label>
            <el-input-number v-model="boundRadius" :step="100" :precision="2" style="width: 140px;"></el-input-number>
          </div>
          <div class="form-group">
            <label>越界滑到边界</label>
            <el-switch v-model="boundCanIntersect" active-color="#E1BB82" inactive-color="rgba(255, 255, 255, 0.2)"></el-switch>
          </div>
          <el-button @click="handleSetBoundingSphere" type="primary" class="action-btn">设置</el-button>
          <el-button @click="handleClearBoundingSphere" type="info" class="action-btn">清除</el-button>
          <el-button @click="handleRefreshBoundingSphere" type="info" class="action-btn">刷新</el-button>
        </div>
      </div>

      <!-- Pawn启用 -->
      <div class="control-section">
        <h4>Pawn启用</h4>
        <div class="form-row">
          <div class="form-group">
            <label>Pawn是否启用</label>
            <el-switch
              v-model="pawnEnable"
              active-color="#E1BB82"
              inactive-color="rgba(255, 255, 255, 0.2)"
              @change="handleChangePawnEnable"
            ></el-switch>
          </div>
          <el-button @click="handleRefreshPawnEnable" type="info" class="action-btn">
            刷新
          </el-button>
        </div>
      </div>

      <!-- 鼠标滚轮缩放速度 -->
      <div class="control-section">
        <h4>鼠标滚轮缩放速度</h4>
        <div class="form-row">
          <div class="form-group">
            <label>速度倍率</label>
            <el-input-number
              v-model="mouseWheelSpeed"
              :min="0.1"
              :step="0.1"
              :precision="2"
              class="number-input"
              style="width: 120px;"
            ></el-input-number>
          </div>
          <el-button @click="handleSetMouseWheelSpeed" type="primary" class="action-btn">
            设置
          </el-button>
          <el-button @click="handleRefreshMouseWheelSpeed" type="info" class="action-btn">
            刷新
          </el-button>
        </div>
      </div>

      <!-- 强制近距离平移模式 -->
      <div class="control-section">
        <h4>强制近距离平移模式</h4>
        <div class="form-row">
          <div class="form-group">
            <label>是否强制开启</label>
            <el-switch
              v-model="forceUseNearTranslationMode"
              active-color="#E1BB82"
              inactive-color="rgba(255, 255, 255, 0.2)"
              @change="handleChangeForceUseNearTranslationMode"
            ></el-switch>
          </div>
          <el-button @click="handleRefreshForceUseNearTranslationMode" type="info" class="action-btn">
            刷新
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.camera-operator-setting-demo {
  width: 100%;
  height: 100%;
  padding: 0;
}

.demo-header {
  margin-bottom: 24px;
  text-align: center;

  h3 {
    color: #E1BB82;
    font-family: "Source Han Serif CN";
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 12px;
  }
}

.header-line {
  height: 2px;
  width: 120px;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, #E1BB82, transparent);
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.control-section {
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 8px;
  padding: 16px;

  h4 {
    color: #E1BB82;
    font-family: "Source Han Sans CN";
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    display: flex;
    align-items: center;

    &::before {
      content: '';
      width: 4px;
      height: 16px;
      background: #E1BB82;
      margin-right: 8px;
      border-radius: 2px;
    }
  }
}

.form-row {
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
}

.form-row + .form-row {
  margin-top: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 0;

  label {
    color: #E1BB82;
    font-family: "Source Han Sans CN";
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 6px;
    white-space: nowrap;
  }
}

.number-input {
  width: 100%;
}

.action-btn {
  min-width: 90px;
  height: 36px;
  font-family: "Source Han Sans CN";
  font-weight: 500;
}

// Element Plus 样式覆盖
:deep(.el-input-number) {
  width: 100%;

  .el-input__wrapper {
    background-color: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(225, 187, 130, 0.3);

    &:hover {
      border-color: rgba(225, 187, 130, 0.6);
    }

    &.is-focus {
      border-color: #E1BB82;
      box-shadow: 0 0 0 2px rgba(225, 187, 130, 0.2);
    }
  }
}

:deep(.el-input__inner) {
  color: #ffffff;
  font-family: "Source Han Sans CN";
}

:deep(.el-button) {
  border-radius: 6px;
  font-family: "Source Han Sans CN";
  transition: all 0.3s ease;

  &.el-button--primary {
    background-color: rgba(225, 187, 130, 0.8);
    border-color: #E1BB82;
    color: #ffffff;

    &:hover {
      background-color: #E1BB82;
      border-color: #E1BB82;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(225, 187, 130, 0.3);
    }
  }

  &.el-button--info {
    background-color: rgba(144, 147, 153, 0.8);

    &:hover {
      background-color: rgba(144, 147, 153, 1);
      transform: translateY(-1px);
    }
  }
}
</style>
