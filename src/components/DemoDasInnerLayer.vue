<script setup lang="ts">
import { ref } from 'vue'
import {DasInnerLayer} from './lib/Layer/DasInnerLayer.js'

// 图层相关状态
const layerVisible = ref(true)
const currentLayerId = ref('')
const layers = ref<{ layer: DasInnerLayer; tagName: string; visible: boolean }[]>([])
const selectedLayer = ref<DasInnerLayer | null>(null)
const selectedTagName = ref('')

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
      if (!layers.value.some(item => item.layer.id === layer.id)) {
        layers.value.push({ layer, tagName: param.TagName, visible: true })
      }
      await selectLayer(layer, param.TagName)
      console.log('内部图层创建成功:', layer)
    }
  } catch (error) {
    console.error('创建内部图层失败:', error)
  }
}

// 切换图层可见性
const toggleLayerVisibility = async () => {
  if (!selectedLayer.value) return
  
  try {
    const layer = selectedLayer.value
    const visible = !layerVisible.value
    await layer.setVisible(visible)
    const entry = layers.value.find(item => item.layer.id === layer.id)
    if (entry) entry.visible = visible
    if (selectedLayer.value?.id === layer.id) layerVisible.value = visible
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

// 选择图层
const selectLayer = async (layer: DasInnerLayer, tagName: string) => {
  selectedTagName.value = tagName
  selectedLayer.value = layer
  currentLayerId.value = layer.id
  
  // 获取图层当前可见性
  try {
    const visible = await layer.isVisible()
    const entry = layers.value.find(item => item.layer.id === layer.id)
    if (entry) entry.visible = visible
    if (selectedLayer.value?.id === layer.id) layerVisible.value = visible
    console.log('已选择图层:', layer)
  } catch (error) {
    console.error('获取图层属性失败:', error)
  }
}

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


          <div class="layer-list" v-if="layers.length > 0">
            <div class="list-header">图层列表 ({{ layers.length }})</div>
            <div 
              v-for="entry in layers"
              :key="entry.layer.id"
              class="layer-item"
              :class="{ active: currentLayerId === entry.layer.id }"
              @click="selectLayer(entry.layer, entry.tagName)"
            >
              <span class="layer-icon">🔲</span>
              <span class="layer-name">{{ entry.tagName }} · {{ entry.layer.id }}</span>
              <span class="layer-status" :class="{ visible: entry.visible }">
                {{ entry.visible ? '👁️' : '🙈' }}
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
            <span class="info-value">{{ selectedTagName }}</span>
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
