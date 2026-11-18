<script setup lang="ts">
import { ref } from 'vue'
import { Camera } from './lib/Scene/Camera.js'

// Camera功能测试
const cameraPositionName = ref('相机点位1')
const flyDuration = ref(5.0) // 飞行时间
const forbidAddHeight = ref(false) // 飞行时是否禁止添加高度
const cameraLocationLLH = ref([0, 0, 0])
const cameraRotationLLH = ref({ pitch: 0, yaw: 0, roll: 0 })
const cameraLongLatFly = ref({
  longitude: 0,
  latitude: 0,
  rotationYaw: 0,
  rotationPitch: -30,
  duration: 5.0,
  addHeightScale: 1.0,
  extraViewHeight: 0.0
})
const cameraLongLatFlyResult = ref<null | {
  success: boolean
  params: {
    longitude: number
    latitude: number
    rotationYaw: number
    rotationPitch: number
    duration: number
    addHeightScale: number
    extraViewHeight: number
  }
}>(null)
const cameraInfo = ref({
  locationLLH: [0, 0, 0],
  rotationLLH: { pitch: 0, yaw: 0, roll: 0 }
})

// 通过名称飞行到指定点位
const handleFlyToPositionByName = async () => {
  const result = await Camera.flyToCameraPositionByName(cameraPositionName.value, flyDuration.value)
  console.log('飞行到点位结果:', result, '飞行时间:', flyDuration.value)
}

// 获取当前相机信息
const handleGetCameraInfo = async () => {
  cameraInfo.value = await Camera.getCameraFlyInfoLLH()
  console.log('相机信息:', cameraInfo.value)
  cameraLocationLLH.value = cameraInfo.value.locationLLH
  cameraRotationLLH.value = cameraInfo.value.rotationLLH
}

// 飞行到指定经纬度和欧拉角
const handleFlyToLocationLLH = async () => {
  Camera.forbitAddHeightOnFly(forbidAddHeight.value)
  const result = await Camera.flyToLocationLLH(cameraLocationLLH.value, cameraRotationLLH.value, flyDuration.value, true)
  console.log('飞行到指定位置结果:', result, '飞行时间:', flyDuration.value, '禁止添加高度:', forbidAddHeight.value)
}

// 通过经纬度飞行到指定位置
const handleFlyToLocationLongLat = async () => {
  await Camera.forbitAddHeightOnFly(forbidAddHeight.value)

  const params = { ...cameraLongLatFly.value }
  const result = await Camera.flyToLocationLongLat(
    params.longitude,
    params.latitude,
    params.rotationYaw,
    params.rotationPitch,
    params.duration,
    params.addHeightScale,
    params.extraViewHeight
  )

  cameraLongLatFlyResult.value = {
    success: result,
    params
  }
  console.log('经纬度飞行结果:', result, params, '禁止添加高度:', forbidAddHeight.value)
}
</script>

<template>
  <div class="camera-demo">
    <div class="demo-header">
      <h3>相机控制</h3>
      <div class="header-line"></div>
    </div>

    <div class="demo-content">
      <!-- 点位控制区域 -->
      <div class="control-section">
        <h4>点位控制</h4>
        <div class="form-row">
          <div class="form-group">
            <label>点位名称</label>
            <el-input 
              v-model="cameraPositionName" 
              placeholder="请输入点位名称"
              class="input-field"
            ></el-input>
          </div>
          <div class="form-group">
            <label>飞行时间 (秒)</label>
            <el-input-number 
              v-model="flyDuration" 
              :min="0.1" 
              :max="60" 
              :step="0.5"
              :precision="1"
              class="number-input"
              style="width: 120px;"
            ></el-input-number>
          </div>
          <el-button @click="handleFlyToPositionByName" type="primary" class="action-btn">
            飞行到点位
          </el-button>
        </div>
      </div>

      <!-- 坐标控制区域 -->
      <div class="control-section">
        <h4>坐标控制</h4>
        <div class="coordinate-container">
          <div class="coordinate-group">
            <div class="coordinate-title">位置坐标</div>
            <div class="coordinate-row">
              <div class="form-group">
                <label>经度</label>
                <el-input-number 
                  v-model="cameraLocationLLH[0]" 
                  :step="0.1" 
                  :precision="6"
                  class="number-input"
                ></el-input-number>
              </div>
              <div class="form-group">
                <label>纬度</label>
                <el-input-number 
                  v-model="cameraLocationLLH[1]" 
                  :step="0.1" 
                  :precision="6"
                  class="number-input"
                ></el-input-number>
              </div>
              <div class="form-group">
                <label>高度</label>
                <el-input-number 
                  v-model="cameraLocationLLH[2]" 
                  :step="0.1" 
                  :precision="2"
                  class="number-input"
                ></el-input-number>
              </div>
            </div>
          </div>

          <div class="coordinate-group">
            <div class="coordinate-title">旋转角度</div>
            <div class="coordinate-row">
              <div class="form-group">
                <label>Pitch</label>
                <el-input-number 
                  v-model="cameraRotationLLH.pitch" 
                  :step="1" 
                  :min="-90" 
                  :max="90"
                  class="number-input"
                ></el-input-number>
              </div>
              <div class="form-group">
                <label>Yaw</label>
                <el-input-number 
                  v-model="cameraRotationLLH.yaw" 
                  :step="1" 
                  :min="-360" 
                  :max="360"
                  class="number-input"
                ></el-input-number>
              </div>
              <div class="form-group">
                <label>Roll</label>
                <el-input-number 
                  v-model="cameraRotationLLH.roll" 
                  :step="1" 
                  :min="-180" 
                  :max="180"
                  class="number-input"
                ></el-input-number>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="control-section">
        <h4>经纬度飞行 Demo</h4>
        <div class="coordinate-container">
          <div class="coordinate-group">
            <div class="coordinate-title">目标位置</div>
            <div class="coordinate-row">
              <div class="form-group">
                <label>经度</label>
                <el-input-number
                  v-model="cameraLongLatFly.longitude"
                  :step="0.1"
                  :precision="6"
                  class="number-input"
                ></el-input-number>
              </div>
              <div class="form-group">
                <label>纬度</label>
                <el-input-number
                  v-model="cameraLongLatFly.latitude"
                  :step="0.1"
                  :precision="6"
                  class="number-input"
                ></el-input-number>
              </div>
              <div class="form-group">
                <label>Yaw</label>
                <el-input-number
                  v-model="cameraLongLatFly.rotationYaw"
                  :step="1"
                  :min="-360"
                  :max="360"
                  class="number-input"
                ></el-input-number>
              </div>
              <div class="form-group">
                <label>Pitch</label>
                <el-input-number
                  v-model="cameraLongLatFly.rotationPitch"
                  :step="1"
                  :min="-90"
                  :max="90"
                  class="number-input"
                ></el-input-number>
              </div>
            </div>
          </div>

          <div class="coordinate-group">
            <div class="coordinate-title">飞行参数</div>
            <div class="coordinate-row">
              <div class="form-group">
                <label>飞行时间 (秒)</label>
                <el-input-number
                  v-model="cameraLongLatFly.duration"
                  :min="0.1"
                  :max="60"
                  :step="0.5"
                  :precision="1"
                  class="number-input"
                ></el-input-number>
              </div>
              <div class="form-group">
                <label>高度缩放 addHeightScale</label>
                <el-input-number
                  v-model="cameraLongLatFly.addHeightScale"
                  :min="0"
                  :step="0.1"
                  :precision="1"
                  class="number-input"
                ></el-input-number>
              </div>
              <div class="form-group">
                <label>增加高度(米)</label>
                <el-input-number
                  v-model="cameraLongLatFly.extraViewHeight"
                  :step="1"
                  :precision="1"
                  class="number-input"
                ></el-input-number>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <el-button @click="handleFlyToLocationLongLat" type="primary" class="action-btn">
            <span>按经纬度飞行</span>
          </el-button>
        </div>

        <div v-if="cameraLongLatFlyResult" class="info-display result-display">
          <div class="info-row">
            <span class="info-label">执行结果：</span>
            <span class="info-value" :class="{ 'result-fail': !cameraLongLatFlyResult.success }">
              {{ cameraLongLatFlyResult.success ? '成功' : '失败' }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">提交参数：</span>
            <span class="info-value">
              {{ cameraLongLatFlyResult.params.longitude }},
              {{ cameraLongLatFlyResult.params.latitude }},
              Yaw {{ cameraLongLatFlyResult.params.rotationYaw }}°,
              Pitch {{ cameraLongLatFlyResult.params.rotationPitch }}°,
              {{ cameraLongLatFlyResult.params.duration }}s,
              addHeightScale {{ cameraLongLatFlyResult.params.addHeightScale }},
              增加高度 {{ cameraLongLatFlyResult.params.extraViewHeight }}m
            </span>
          </div>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="control-section">
        <h4>飞行控制</h4>
        <div class="form-row">
          <div class="form-group">
            <label>飞行时间 (秒)</label>
            <el-input-number
              v-model="flyDuration"
              :min="0.1"
              :max="60"
              :step="0.5"
              :precision="1"
              class="number-input"
              style="width: 120px;"
            ></el-input-number>
          </div>
          <div class="form-group">
            <label>禁止添加高度</label>
            <el-switch
              v-model="forbidAddHeight"
              active-color="#E1BB82"
              inactive-color="rgba(255, 255, 255, 0.2)"
            ></el-switch>
          </div>
        </div>
        <div class="action-buttons">
          <el-button @click="handleFlyToLocationLLH" type="success" class="action-btn">
            <span>飞行到指定位置 ({{ flyDuration }}s)</span>
          </el-button>
          <el-button @click="handleGetCameraInfo" type="warning" class="action-btn">
            <span>获取相机信息</span>
          </el-button>
        </div>
      </div>

      <!-- 当前信息显示区域 -->
      <div class="control-section">
        <h4>当前相机信息</h4>
        <div class="info-display">
          <div class="info-row">
            <span class="info-label">位置坐标：</span>
            <span class="info-value">{{ cameraInfo.locationLLH.join(', ') }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">旋转角度：</span>
            <span class="info-value">
              Pitch: {{ cameraInfo.rotationLLH?.pitch || 0 }}°, 
              Yaw: {{ cameraInfo.rotationLLH?.yaw || 0 }}°, 
              Roll: {{ cameraInfo.rotationLLH?.roll || 0 }}°
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.camera-demo {
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

.input-field {
  min-width: 180px;
  flex: 1;
}

.coordinate-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coordinate-group {
  .coordinate-title {
    color: #ffffff;
    font-family: "Source Han Sans CN";
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    padding-left: 8px;
    border-left: 3px solid rgba(225, 187, 130, 0.6);
  }
}

.coordinate-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.number-input {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  min-width: 140px;
  height: 36px;
  font-family: "Source Han Sans CN";
  font-weight: 500;

  span {
    font-size: 14px;
  }
}

.info-display {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 6px;
  padding: 12px;
}

.result-display {
  margin-top: 12px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  line-height: 1.5;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  color: #E1BB82;
  font-family: "Source Han Sans CN";
  font-size: 13px;
  font-weight: 500;
  min-width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #ffffff;
  font-family: "Source Han Sans CN";
  font-size: 13px;
  word-break: break-all;
  flex: 1;
}

.result-fail {
  color: #f56c6c;
}

// Element Plus 样式覆盖
:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(225, 187, 130, 0.3);
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(225, 187, 130, 0.6);
  }

  &.is-focus {
    border-color: #E1BB82;
    box-shadow: 0 0 0 2px rgba(225, 187, 130, 0.2);
  }
}

:deep(.el-input__inner) {
  color: #ffffff;
  font-family: "Source Han Sans CN";

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
}

:deep(.el-input-number) {
  width: 100%;

  .el-input__wrapper {
    background-color: rgba(255, 255, 255, 0.08);
  }
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

  &.el-button--success {
    background-color: rgba(64, 158, 255, 0.8);
    border-color: rgba(64, 158, 255, 1);

    &:hover {
      background-color: rgba(64, 158, 255, 1);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }
  }

  &.el-button--warning {
    background-color: rgba(230, 162, 60, 0.8);
    border-color: rgba(230, 162, 60, 1);

    &:hover {
      background-color: rgba(230, 162, 60, 1);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
    }
  }
}
</style> 
