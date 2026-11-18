<script setup lang="ts">
import { ref } from 'vue'
import Scene from './lib/Scene/Scene.js'
import { Camera } from './lib/Scene/Camera.js'

// 定义关卡类型
interface Level {
  name: string
visible: boolean
  loaded: boolean
}

// Scene功能测试
// 关卡管理
const levels = ref<Level[]>([
  { name: 'WholeMoutain', visible: true, loaded: false },
  { name: 'YuXuGong', visible: true, loaded: false },
  { name: 'YuZhenGong', visible: true, loaded: false }
])

// 屏幕坐标转世界坐标
const screenCoords = ref({ x: 0, y: 0 })
const worldPosition = ref({ x: 0, y: 0, z: 0 })

// 获取高度功能
const heightCoords = ref({ longitude: 116.39, latitude: 39.91 })
const heightResult = ref({ height: 0, success: false })

// 操作器类型
const currentPawnType = ref('Unknown')
const pawnTypeOptions = [
  { value: 'Pawn_Universal', label: '🎮 通用操作器', description: '适用于一般场景浏览' },
  { value: 'Pawn_ThirdPerson', label: '🚶 第三人称操作器', description: '第三人称视角控制' },
  { value: 'Pawn_FreeFlight', label: '✈️ 自由飞行操作器', description: '自由飞行模式，适合快速浏览' }
]

// 加载关卡
const handleLoadLevel = async (level: Level) => {
  try {
    if(level.name == "WholeMoutain"){
      Camera.flyToCameraPositionByName("全山", 0)
    }
    if(level.name == "YuXuGong")
    {
      Camera.flyToCameraPositionByName("相机点位2", 0)
    }
    if(level.name == "YuZhenGong")
    {
      Camera.flyToCameraPositionByName("遇真宫", 0)
    }

    const result =  Scene.loadLevel(level.name, level.visible)
    console.log('加载关卡结果:', result)
    level.loaded = true
  } catch (error) {
    console.error('加载关卡失败:', error)
  }
}

// 卸载关卡
const handleUnloadLevel = async (level: Level) => {
  try {
    const result =  Scene.unloadLevel(level.name)
    console.log('卸载关卡结果:', result)
    level.loaded = false
  } catch (error) {
    console.error('卸载关卡失败:', error)
  }
}

// 顺序切换关卡
const handleLoadNextLevel = async (level: Level) => {
  try {
    const result = await Scene.loadNextLevel(level.name)
    console.log('顺序切换关卡结果:', result)
  } catch (error) {
    console.error('顺序切换关卡失败:', error)
  }
}

// 加载所有关卡
const handleLoadAllLevels = async () => {
  try {
    for (const level of levels.value) {
      if (!level.loaded) {
         handleLoadLevel(level)
      }
    }
  } catch (error) {
    console.error('加载所有关卡失败:', error)
  }
}

// 卸载所有关卡
const handleUnloadAllLevels = async () => {
  try {
    for (const level of levels.value) {
      if (level.loaded) {
         handleUnloadLevel(level)
      }
    }
  } catch (error) {
    console.error('卸载所有关卡失败:', error)
  }
}

// 屏幕坐标转世界坐标
const handleScreenToWorld = async () => {
  const result = await Scene.screenToWorld(screenCoords.value.x, screenCoords.value.y)
  console.log('屏幕坐标转世界坐标结果:', result)
  //json arr 转 obj
  worldPosition.value.x = result[0];
  worldPosition.value.y = result[1];
  worldPosition.value.z = result[2];
  console.log('世界坐标:', worldPosition.value)
}

// 切换操作器类型
const handleSwitchPawnType = async (pawnType: string) => {
  const result = await Scene.switchPawnType(pawnType)
  console.log('切换操作器类型结果:', result)
  if (result) {
    await handleGetCurrentPawnType()
  }
}

// 获取当前操作器类型
const handleGetCurrentPawnType = async () => {
  currentPawnType.value = await Scene.getCurrentPawnType()
  console.log('当前操作器类型:', currentPawnType.value)
}

// 获取指定经纬度的高度
const handleGetHeight = async () => {
  try {
    const result = await Scene.getHeightAtLongLat(heightCoords.value.longitude, heightCoords.value.latitude)
    console.log('获取高度结果:', result)
    heightResult.value = result
  } catch (error) {
    console.error('获取高度失败:', error)
  }
}

// 获取操作器类型的显示信息
const getPawnTypeInfo = (pawnType: string) => {
  const option = pawnTypeOptions.find(opt => opt.value === pawnType)
  return option ? option : { value: pawnType, label: `❓ ${pawnType}`, description: '未知操作器类型' }
}

// 初始化时获取当前操作器类型
handleGetCurrentPawnType()
</script>

<template>
  <div class="scene-demo-panel">
    <div class="title">场景控制</div>
    <div class="split_line"></div>

    <!-- 关卡管理 -->
    <div class="sub-title">关卡管理</div>
    
    <div style="display: flex; margin-left: 15px;">
      <el-button @click="handleLoadAllLevels" style="margin: 10px;" type="primary">加载所有关卡</el-button>
      <el-button @click="handleUnloadAllLevels" style="margin: 10px;" type="danger">卸载所有关卡</el-button>
    </div>

    <!-- 关卡列表 -->
    <div class="level-list">
      <div v-for="(level, index) in levels" :key="index" class="level-item">
        <div class="level-info">
          <span class="level-name">{{ level.name.split('/').pop() }}</span>
          <span class="level-status" :class="{ 'loaded': level.loaded }">{{ level.loaded ? '已加载' : '未加载' }}</span>
        </div>
        <div class="level-controls">
          <el-switch 
            v-model="level.visible" 
            active-text="可见" 
            inactive-text="不可见"
            active-color="#E1BB82">
          </el-switch>
          <el-button
            type="warning"
            size="small"
            @click="handleLoadNextLevel(level)">
            顺序切换
          </el-button>
          <el-button 
            :type="level.loaded ? 'danger' : 'primary'" 
            size="small"
            @click="level.loaded ? handleUnloadLevel(level) : handleLoadLevel(level)">
            {{ level.loaded ? '卸载' : '加载' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 屏幕坐标转世界坐标 -->
    <div class="sub-title">屏幕坐标转世界坐标</div>

    <el-form-item label="屏幕X坐标" class="ruihua">
      <el-input-number v-model="screenCoords.x" :step="1" style="width: 100px;"></el-input-number>
    </el-form-item>
    <el-form-item label="屏幕Y坐标" class="ruihua">
      <el-input-number v-model="screenCoords.y" :step="1" style="width: 100px;"></el-input-number>
    </el-form-item>
    
    <div style="margin-left: 15px;">
      <el-button @click="handleScreenToWorld" style="margin: 10px;" type="success">获取世界坐标</el-button>
    </div>

    <div class="result-panel" style="margin: 10px; padding: 10px; background: rgba(225, 187, 130, 0.1); border-radius: 5px;">
      <p style="color: #e1bb82;">世界坐标：{{ worldPosition.x?.toFixed(4) || 0 }}, {{ worldPosition.y?.toFixed(4) || 0 }}, {{ worldPosition.z?.toFixed(4) || 0 }}</p>
    </div>

    <!-- 获取高度功能 -->
    <div class="sub-title">获取指定经纬度高度</div>

    <el-form-item label="经度" class="ruihua">
      <el-input-number v-model="heightCoords.longitude" :step="0.01" :precision="6" style="width: 150px;"></el-input-number>
    </el-form-item>
    <el-form-item label="纬度" class="ruihua">
      <el-input-number v-model="heightCoords.latitude" :step="0.01" :precision="6" style="width: 150px;"></el-input-number>
    </el-form-item>
    
    <div style="margin-left: 15px;">
      <el-button @click="handleGetHeight" style="margin: 10px;" type="warning">获取高度</el-button>
    </div>

    <div class="result-panel" style="margin: 10px; padding: 10px; background: rgba(225, 187, 130, 0.1); border-radius: 5px;">
      <p style="color: #e1bb82;">
        获取结果：{{ heightResult.success ? '成功' : '失败' }}
      </p>
      <p v-if="heightResult.success" style="color: #e1bb82;">
        高度：{{ heightResult.height?.toFixed(4) || 0 }} 米
      </p>
      <p v-else style="color: #f56c6c;">
        无法获取该位置的高度信息
      </p>
    </div>

    <!-- 操作器类型管理 -->
    <div class="sub-title">操作器类型</div>

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
</template>

<style lang="scss" scoped>
.scene-demo-panel {
  width: 100%;
}

.title {
  align-self: stretch;
  color: #e1bb82;
  text-align: center;
  font-family: "Source Han Serif CN";
  font-size: 24px;
  font-style: normal;
  line-height: normal;
  letter-spacing: 9.6px;
  margin-top: 15px;
}

.sub-title {
  color: #e1bb82;
  font-family: "Source Han Serif CN";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 10px;
  margin-left: 15px;
  padding-left: 10px;
  border-left: 3px solid #e1bb82;
}

.split_line {
  background-image: url('/src/assets/images/hl.png');
  background-size: 100% 100%;
  height: 12px;
  width: 180px;
  margin: auto;
  margin-top: 15px;
  margin-bottom: 20px;
}

.level-list {
  margin: 10px 15px;
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #E1BB82;
    border-radius: 5px;
  }
  
  .level-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 5px;
    background: rgba(225, 187, 130, 0.1);
    border-radius: 5px;
    
    &:hover {
      background: rgba(225, 187, 130, 0.2);
    }
    
    .level-info {
      display: flex;
      flex-direction: column;
      
      .level-name {
        color: #e1bb82;
        font-weight: bold;
        font-size: 14px;
      }
      
      .level-status {
        font-size: 12px;
        color: rgba(225, 187, 130, 0.7);
        
        &.loaded {
          color: #67c23a;
        }
      }
    }
    
    .level-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
}

.result-panel {
  max-height: 200px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #E1BB82;
    border-radius: 5px;
  }
}

.pawn-type-info {
  margin-top: 20px;
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

.pawn-type-selection {
  margin-top: 20px;
}

.selection-title {
  font-size: 16px;
  font-weight: bold;
  color: #e1bb82;
  margin-bottom: 10px;
}

.pawn-options {
  display: flex;
  gap: 10px;
}

.pawn-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(225, 187, 130, 0.1);
  border-radius: 5px;
  cursor: pointer;
  
  &:hover {
    background: rgba(225, 187, 130, 0.2);
  }
  
  &.active {
    background: rgba(225, 187, 130, 0.2);
  }
}

.option-icon {
  font-size: 24px;
  color: #e1bb82;
}

.option-content {
  text-align: center;
}

.option-name {
  font-size: 14px;
  font-weight: bold;
  color: #e1bb82;
}

.option-desc {
  font-size: 12px;
  color: rgba(225, 187, 130, 0.7);
}
</style> 
