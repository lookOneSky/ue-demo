<template>
  <div class="camera-setting-demo">
    <div class="demo-header">
      <h3>操作器切换</h3>
      <div class="header-line"></div>
    </div>

    <div class="demo-content">
      <!-- 操作器类型管理 -->
      <div class="control-section">
        <h4>🎮 操作器类型</h4>
        <div class="pawn-type-info">
          <div class="current-pawn">
            <div class="pawn-display">
              <span class="pawn-icon">{{ getPawnTypeInfo(currentPawnType).label.split(' ')[0] }}</span>
              <div class="pawn-details">
                <div class="pawn-name">{{ getPawnTypeInfo(currentPawnType).label }}</div>
                <div class="pawn-desc">{{ getPawnTypeInfo(currentPawnType).description }}</div>
              </div>
            </div>
            <el-button @click="handleGetCurrentPawnType" type="info" size="small">🔄 刷新</el-button>
          </div>
        </div>

        <div class="pawn-type-selection">
          <div class="selection-title">选择操作器类型：</div>
          <div class="pawn-options">
            <div 
              v-for="option in pawnTypeOptions" 
              :key="option.value"
              class="pawn-option"
              :class="{ active: currentPawnType === option.value }"
              @click="handleSwitchPawnType(option.value)"
            >
              <div class="option-icon">{{ option.label.split(' ')[0] }}</div>
              <div class="option-content">
                <div class="option-name">{{ option.label.substring(option.label.indexOf(' ') + 1) }}</div>
                <div class="option-desc">{{ option.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 投影模式切换 -->
      <div class="control-section">
        <h4>📷 投影模式</h4>
        <div class="pawn-type-info">
          <div class="current-pawn">
            <div class="pawn-display">
              <span class="pawn-icon">{{ isPerspective ? '🔭' : '📐' }}</span>
              <div class="pawn-details">
                <div class="pawn-name">{{ isPerspective ? '透视投影' : '正射投影' }}</div>
                <div class="pawn-desc">{{ isPerspective ? '近大远小，模拟人眼视觉' : '无透视变形，平行投影' }}</div>
                <div class="projection-info">当前正交宽度：{{ orthoWidth }}</div>
              </div>
            </div>
            <el-button @click="handleGetProjection" type="info" size="small">🔄 刷新</el-button>
          </div>
        </div>

        <div class="pawn-type-selection">
          <div class="selection-title">选择投影模式：</div>
          <div class="pawn-options">
            <div
              class="pawn-option"
              :class="{ active: isPerspective }"
              @click="handleSwitchProjection(true)"
            >
              <div class="option-icon">🔭</div>
              <div class="option-content">
                <div class="option-name">透视投影</div>
                <div class="option-desc">近大远小，模拟人眼视觉</div>
              </div>
            </div>
            <div
              class="pawn-option"
              :class="{ active: !isPerspective }"
              @click="handleSwitchProjection(false)"
            >
              <div class="option-icon">📐</div>
              <div class="option-content">
                <div class="option-name">正射投影</div>
                <div class="option-desc">无透视变形，平行投影</div>
              </div>
            </div>
          </div>
        </div>

        <div class="pawn-type-selection">
          <div class="selection-title">正交宽度(cm，仅正射投影生效)：</div>
          <div class="ortho-width-row">
            <el-input-number v-model="orthoWidth" :min="1" :step="10000" :precision="0" :disabled="isPerspective" style="width: 200px;" />
            <el-button @click="handleSetOrthoWidth" type="primary" size="small" :disabled="isPerspective">设置</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Scene from './lib/Scene/Scene.js'

// 投影模式
const isPerspective = ref(true)
const orthoWidth = ref(0)

// 操作器类型
const currentPawnType = ref('Unknown')
const pawnTypeOptions = [
  { value: 'Pawn_Universal', label: '🎮 通用操作器', description: '适用于一般场景浏览' },
  { value: 'Pawn_ThirdPerson', label: '🚶 第三人称操作器', description: '第三人称视角控制' },
  { value: 'Pawn_FreeFlight', label: '✈️ 第一人称操作器', description: '第一人称视角，自由飞行模式' }
]

// 切换操作器类型
const handleSwitchPawnType = async (pawnType: string) => {
  await Scene.switchPawnType(pawnType)
  await handleGetCurrentPawnType()
}

// 获取当前操作器类型
const handleGetCurrentPawnType = async () => {
  currentPawnType.value = await Scene.getCurrentPawnType()
  console.log('当前操作器类型:', currentPawnType.value)
}

// 切换投影模式
const handleSwitchProjection = async (bPerspective: boolean) => {
  await Scene.setPerspectiveProjection(bPerspective)
  await handleGetProjection()
}

// 获取当前投影模式
const handleGetProjection = async () => {
  isPerspective.value = await Scene.getPerspectiveProjection()
  orthoWidth.value = await Scene.getOrthoWidth()
}

// 设置正交宽度（仅正射投影生效）
const handleSetOrthoWidth = async () => {
  await Scene.setOrthoWidth(orthoWidth.value)
  await handleGetProjection()
}

// 获取操作器类型的显示信息
const getPawnTypeInfo = (pawnType: string) => {
  const option = pawnTypeOptions.find(opt => opt.value === pawnType)
  return option ? option : { value: pawnType, label: `❓ ${pawnType}`, description: '未知操作器类型' }
}

// 初始化时获取当前操作器类型
onMounted(() => {
  handleGetCurrentPawnType()
  handleGetProjection()
})
</script>

<style lang="scss" scoped>
.camera-setting-demo {
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

.pawn-type-info {
  margin-bottom: 20px;
}

.current-pawn {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pawn-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pawn-icon {
  font-size: 24px;
  color: #e1bb82;
}

.pawn-details {
  display: flex;
  flex-direction: column;
}

.pawn-name {
  font-size: 16px;
  font-weight: bold;
  color: #e1bb82;
}

.pawn-desc {
  font-size: 12px;
  color: rgba(225, 187, 130, 0.7);
}

.projection-info {
  font-size: 12px;
  color: #e1bb82;
  margin-top: 4px;
}

.pawn-type-selection {
  margin-top: 20px;
}

.ortho-width-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selection-title {
  font-size: 14px;
  font-weight: bold;
  color: #e1bb82;
  margin-bottom: 10px;
}

.pawn-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pawn-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(225, 187, 130, 0.1);
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
  min-width: 120px;
  
  &:hover {
    background: rgba(225, 187, 130, 0.2);
  }
  
  &.active {
    background: rgba(225, 187, 130, 0.3);
    border: 1px solid #E1BB82;
  }
}

.option-icon {
  font-size: 20px;
  color: #e1bb82;
  margin-bottom: 5px;
}

.option-content {
  text-align: center;
}

.option-name {
  font-size: 12px;
  font-weight: bold;
  color: #e1bb82;
  margin-bottom: 2px;
}

.option-desc {
  font-size: 10px;
  color: rgba(225, 187, 130, 0.7);
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
