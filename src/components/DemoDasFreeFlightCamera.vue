<template>
  <div class="free-flight-demo">
    <div class="demo-header">
      <h3>第一人称操作器</h3>
      <div class="header-line"></div>
    </div>

    <div class="demo-content">
      <!-- 移动速度控制 -->
      <div class="control-section">
        <h4>🚀 移动速度</h4>
        <div class="speed-control">
          <div class="speed-display">
            <span class="current-speed">当前速度: {{ currentSpeed.toFixed(0) }}</span>
          </div>
          <div class="speed-input">
            <div class="input-group">
              <label>移动速度</label>
              <el-input-number
                v-model="moveSpeed"
                :step="10"
                @change="handleSpeedChange"
              />
            </div>
          </div>
          <div class="speed-buttons">
            <el-button @click="getMoveSpeed" type="info" size="small">
              🔄 获取速度
            </el-button>
            <el-button @click="setMoveSpeed" type="primary" size="small">
              ✅ 应用速度
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted } from 'vue'
import DasFreeFlightCamera from './lib/Scene/DasFreeFlightCamera.js'

const moveSpeed = ref(1200.0)
const currentSpeed = ref(1200.0)

// 设置移动速度
const setMoveSpeed = async () => {
  try {
    const result = await DasFreeFlightCamera.setMoveSpeed(moveSpeed.value)
    if (result) {
      currentSpeed.value = moveSpeed.value
      console.log('移动速度设置成功:', moveSpeed.value)
    }
  } catch (error) {
    console.error('设置移动速度失败:', error)
  }
}

// 获取移动速度
const getMoveSpeed = async () => {
  try {
    const speed = await DasFreeFlightCamera.getMoveSpeed()
    moveSpeed.value = speed
    currentSpeed.value = speed
    console.log('当前移动速度:', speed)
  } catch (error) {
    console.error('获取移动速度失败:', error)
  }
}

// 速度改变处理
const handleSpeedChange = () => {
  setMoveSpeed()
}

// 初始化获取当前速度
const getShareData = inject<(key: string) => unknown>('getShareData')
onMounted(() => {
  if (!getShareData?.('viewerReady')) return
  getMoveSpeed()
})
</script>

<style lang="scss" scoped>
.free-flight-demo {
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
    margin-bottom: 16px;
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

.speed-control {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.speed-display {
  text-align: center;
  
  .current-speed {
    color: #E1BB82;
    font-family: "Source Han Sans CN";
    font-size: 16px;
    font-weight: 600;
  }
}

.speed-input {
  margin: 8px 0;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    color: #E1BB82;
    font-family: "Source Han Sans CN";
    font-size: 13px;
    font-weight: 500;
  }
}

.speed-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

// Element Plus 样式覆盖
:deep(.el-button) {
  border-radius: 6px;
  font-family: "Source Han Sans CN";
  transition: all 0.3s ease;

  &.el-button--primary {
    background-color: rgba(225, 187, 130, 0.8);
    border-color: #E1BB82;

    &:hover {
      background-color: #E1BB82;
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

:deep(.el-input-number .el-input__wrapper) {
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

:deep(.el-input__inner) {
  color: #ffffff;
  font-family: "Source Han Sans CN";
}
</style> 