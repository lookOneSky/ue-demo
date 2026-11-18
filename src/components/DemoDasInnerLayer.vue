<script setup lang="ts">
import { ref, onMounted } from 'vue'
// @ts-ignore
import {DasInnerLayer} from './lib/Layer/DasInnerLayer.js'
// @ts-ignore
import {DasGroupLayer} from './lib/Layer/DasGroupLayer.js'

// 图层相关状态
const layerVisible = ref(true)
const currentLayerId = ref('')
const layers = ref<any[]>([])
const selectedLayer = ref<any>(null)

// TagName选项列表
const tagNameOptions = [
  { label: 'JinDinRoad1', value: 'JinDinRoad1' },
  { label: '72PeakRoot', value: '72PeakRoot' },
  { label: '东神道', value: 'dongshendaoRoot' },
]

// 创建参数
const createParams = ref({
  TagName: 'JinDinRoad1'
})

// 创建新的内部图层
const createInnerLayer = async () => {
  try {
    const param = {
      TagName: createParams.value.TagName
    }
    
    const layer = await DasInnerLayer.createInstance(param)
    if (layer) {
      await refreshLayerList()
      currentLayerId.value = layer.id
      selectedLayer.value = layer
      console.log('内部图层创建成功:', layer)
    }
  } catch (error) {
    console.error('创建内部图层失败:', error)
  }
}

// 删除图层
const deleteLayer = async () => {
  if (!selectedLayer.value) return
  
  try {
    // 这里应该调用删除接口，暂时从列表中移除
    layers.value = layers.value.filter(layer => layer.id !== selectedLayer.value.id)
    selectedLayer.value = null
    currentLayerId.value = ''
    console.log('图层删除成功')
  } catch (error) {
    console.error('删除图层失败:', error)
  }
}

// 切换图层可见性
const toggleLayerVisibility = async () => {
  if (!selectedLayer.value) return
  
  try {
    layerVisible.value = !layerVisible.value
    await selectedLayer.value.setVisible(layerVisible.value)
    console.log('图层可见性已更新:', layerVisible.value)
  } catch (error) {
    console.error('设置图层可见性失败:', error)
  }
}

// 飞行到图层
const flyToLayer = async () => {
  if (!selectedLayer.value) return
  
  try {
    await selectedLayer.value.flyToThis()
    console.log('已飞行到图层位置')
  } catch (error) {
    console.error('飞行到图层失败:', error)
  }
}

// 设置高亮
const toggleHighlight = async () => {
  if (!selectedLayer.value) return
  
  try {
    const currentHighlight = await selectedLayer.value.isHightLight()
    await selectedLayer.value.setHightLight(!currentHighlight)
    console.log('高亮状态已切换:', !currentHighlight)
  } catch (error) {
    console.error('设置高亮失败:', error)
  }
}

// 设置轮廓
const toggleOutline = async () => {
  if (!selectedLayer.value) return
  
  try {
    const currentOutline = await selectedLayer.value.isOutline()
    await selectedLayer.value.setOutline(!currentOutline)
    console.log('轮廓状态已切换:', !currentOutline)
  } catch (error) {
    console.error('设置轮廓失败:', error)
  }
}

// 刷新图层列表
const refreshLayerList = async () => {
//   try {
//     const allLayers = await DasGroupLayer.getAllInnerLayers()
//     layers.value = allLayers
//     console.log('图层列表已刷新:', allLayers)
//   } catch (error) {
//     console.error('获取图层列表失败:', error)
//   }
}

// 选择图层
const selectLayer = async (layer: any) => {
  selectedLayer.value = layer
  currentLayerId.value = layer.id
  
  // 获取图层当前可见性
  try {
    layerVisible.value = await layer.isVisible()
    console.log('已选择图层:', layer)
  } catch (error) {
    console.error('获取图层属性失败:', error)
  }
}

// 组件挂载时初始化
onMounted(() => {
  refreshLayerList()
})
</script>

<template>
  <div class="inner-layer-demo">
    <div class="demo-header">
      <h3>内部图层控制</h3>
      <div class="header-line"></div>
    </div>

    <div class="demo-content">
      <!-- 图层管理区域 -->
      <div class="control-section">
        <h4>📋 图层管理</h4>
        <div class="layer-management">
          <div class="create-section">
            <div class="form-group">
              <label>TagName</label>
              <el-select 
                v-model="createParams.TagName" 
                placeholder="请选择TagName"
                class="tag-select"
              >
                <el-option
                  v-for="option in tagNameOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </div>
            <el-button @click="createInnerLayer" type="primary" class="create-btn">
              创建内部图层
            </el-button>
          </div>

          <div class="action-row">
            <!-- <el-button @click="refreshLayerList" type="info" class="action-btn">
              刷新列表
            </el-button>
            <el-button @click="deleteLayer" type="danger" class="action-btn" :disabled="!selectedLayer">
              删除图层
            </el-button> -->
          </div>

          <div class="layer-list" v-if="layers.length > 0">
            <div class="list-header">图层列表 ({{ layers.length }})</div>
            <div 
              v-for="layer in layers" 
              :key="layer.id" 
              class="layer-item"
              :class="{ active: currentLayerId === layer.id }"
              @click="selectLayer(layer)"
            >
              <span class="layer-icon">🔲</span>
              <span class="layer-name">图层 {{ layer.id }}</span>
              <span class="layer-status" :class="{ visible: layerVisible }">
                {{ layerVisible ? '👁️' : '🙈' }}
              </span>
            </div>
          </div>
          <div v-else class="no-layers">
            暂无图层，请先创建
          </div>
        </div>
      </div>

      <!-- 基础控制区域 -->
      <div class="control-section" v-if="selectedLayer">
        <h4>⚙️ 基础控制</h4>
        <div class="control-grid">
          <div class="control-group">
            <div class="group-title">显示控制</div>
            <div class="control-row">
              <el-button @click="toggleLayerVisibility" :type="layerVisible ? 'success' : 'warning'" class="control-btn">
                {{ layerVisible ? '隐藏图层' : '显示图层' }}
              </el-button>
              <el-button @click="flyToLayer" type="info" class="control-btn">
                飞行到图层
              </el-button>
            </div>
          </div>

          <!-- <div class="control-group">
            <div class="group-title">视觉效果</div>
            <div class="control-row">
              <el-button @click="toggleHighlight" type="warning" class="control-btn">
                切换高亮
              </el-button>
              <el-button @click="toggleOutline" type="primary" class="control-btn">
                切换轮廓
              </el-button>
            </div>
          </div> -->
        </div>
      </div>

      <!-- 图层信息显示 -->
      <div class="control-section" v-if="selectedLayer">
        <h4>ℹ️ 图层信息</h4>
        <div class="info-display">
          <div class="info-row">
            <span class="info-label">图层ID：</span>
            <span class="info-value">{{ selectedLayer.id }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">类名：</span>
            <span class="info-value">{{ selectedLayer.className }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">TagName：</span>
            <span class="info-value">{{ createParams.TagName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">可见性：</span>
            <span class="info-value">{{ layerVisible ? '可见' : '隐藏' }}</span>
          </div>
        </div>
      </div>

      <!-- 可用TagName列表 -->
      <div class="control-section">
        <h4>🏷️ 可用TagName</h4>
        <div class="tag-list">
          <div 
            v-for="option in tagNameOptions" 
            :key="option.value"
            class="tag-item"
            :class="{ active: createParams.TagName === option.value }"
            @click="createParams.TagName = option.value"
          >
            <span class="tag-icon">🏷️</span>
            <span class="tag-name">{{ option.label }}</span>
            <span class="tag-desc">{{ option.value }}</span>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="control-section">
        <h4>📖 使用说明</h4>
        <div class="instructions">
          <div class="instruction-item">
            <span class="instruction-icon">1️⃣</span>
            <span class="instruction-text">从下拉列表中选择TagName来创建内部图层，TagName需要与UE中的Actor标签匹配</span>
          </div>
          <div class="instruction-item">
            <span class="instruction-icon">2️⃣</span>
            <span class="instruction-text">点击TagName卡片也可以快速选择对应的TagName</span>
          </div>
          <div class="instruction-item">
            <span class="instruction-icon">3️⃣</span>
            <span class="instruction-text">创建图层后可以使用基础控制功能来管理图层的显示状态</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.inner-layer-demo {
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

.layer-management {
  .create-section {
    display: flex;
    align-items: end;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;

    .form-group {
      display: flex;
      flex-direction: column;
      min-width: 200px;
      flex: 1;

      label {
        color: #E1BB82;
        font-family: "Source Han Sans CN";
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 6px;
      }
    }

    .create-btn {
      min-width: 140px;
      height: 36px;
    }
  }

  .action-row {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .action-btn {
    min-width: 120px;
    height: 32px;
    font-size: 13px;
  }
}

.tag-select {
  min-width: 200px;
}

.layer-list {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;

  .list-header {
    padding: 8px 12px;
    background: rgba(225, 187, 130, 0.1);
    color: #E1BB82;
    font-size: 12px;
    font-weight: 500;
    border-bottom: 1px solid rgba(225, 187, 130, 0.2);
  }

  .layer-item {
    padding: 8px 12px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(225, 187, 130, 0.1);

    &:hover {
      background: rgba(225, 187, 130, 0.1);
    }

    &.active {
      background: rgba(225, 187, 130, 0.2);
      border-left: 3px solid #E1BB82;
    }

    .layer-icon {
      margin-right: 8px;
      font-size: 14px;
    }

    .layer-name {
      flex: 1;
      color: #ffffff;
      font-size: 13px;
    }

    .layer-status {
      font-size: 16px;
      opacity: 0.6;

      &.visible {
        opacity: 1;
      }
    }
  }
}

.no-layers {
  padding: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.control-group {
  .group-title {
    color: #ffffff;
    font-family: "Source Han Sans CN";
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    padding-left: 8px;
    border-left: 3px solid rgba(225, 187, 130, 0.6);
  }

  .control-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .control-btn {
    flex: 1;
    min-width: 80px;
    height: 32px;
    font-size: 12px;
  }
}

.info-display {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 6px;
  padding: 12px;
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

.tag-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.tag-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    background: rgba(225, 187, 130, 0.1);
    border-color: rgba(225, 187, 130, 0.4);
    transform: translateY(-2px);
  }

  &.active {
    background: rgba(225, 187, 130, 0.2);
    border-color: #E1BB82;
    box-shadow: 0 0 0 2px rgba(225, 187, 130, 0.3);
  }

  .tag-icon {
    font-size: 20px;
    margin-bottom: 6px;
  }

  .tag-name {
    color: #E1BB82;
    font-family: "Source Han Sans CN";
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .tag-desc {
    color: rgba(255, 255, 255, 0.7);
    font-family: "Source Han Sans CN";
    font-size: 12px;
  }
}

.instructions {
  .instruction-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .instruction-icon {
    margin-right: 8px;
    font-size: 16px;
    flex-shrink: 0;
  }

  .instruction-text {
    color: rgba(255, 255, 255, 0.8);
    font-family: "Source Han Sans CN";
    font-size: 13px;
    line-height: 1.4;
  }
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

  &.el-button--success {
    background-color: rgba(64, 158, 255, 0.8);

    &:hover {
      background-color: rgba(64, 158, 255, 1);
      transform: translateY(-1px);
    }
  }

  &.el-button--warning {
    background-color: rgba(230, 162, 60, 0.8);

    &:hover {
      background-color: rgba(230, 162, 60, 1);
      transform: translateY(-1px);
    }
  }

  &.el-button--danger {
    background-color: rgba(245, 108, 108, 0.8);

    &:hover {
      background-color: rgba(245, 108, 108, 1);
      transform: translateY(-1px);
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

:deep(.el-select .el-select__wrapper) {
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

:deep(.el-select__selection) {
  color: #ffffff;
  font-family: "Source Han Sans CN";
}

:deep(.el-select__placeholder) {
  color: rgba(255, 255, 255, 0.4);
}

:deep(.el-input .el-input__wrapper) {
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

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
}
</style> 