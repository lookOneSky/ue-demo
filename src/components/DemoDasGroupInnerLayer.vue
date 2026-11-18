<script setup lang="ts">
import { ref } from 'vue'
// @ts-ignore
import {DasGroupInnerLayer} from './lib/Layer/DasGroupInnerLayer.js'

// 组图层状态
const groupVisible = ref(true)
const childLayers = ref<any[]>([])
const groupLayer = ref<any>(null)

// TagName选项列表
const tagNameOptions = [
  { label: 'Model_Old', value: 'Model_Old' },
  { label: 'Model_Repaired', value: 'Model_Repaired' },
]

// 创建参数
const createParams = ref({
  TagName: 'Model_Old'
})

// 刷新子图层列表
const refreshChildLayers = async () => {
  if (!groupLayer.value) return
  try {
    childLayers.value = await groupLayer.value.getAllLayer()
  } catch (error) {
    console.error('获取子图层列表失败:', error)
  }
}

// 创建组内部图层
const createGroupInnerLayer = async () => {
  try {
    const param = {
      TagName: createParams.value.TagName
    }

    const group = await DasGroupInnerLayer.createInstance(param)
    if (group) {
      groupLayer.value = group
      groupVisible.value = await group.isVisible()
      await refreshChildLayers()
      console.log('组内部图层创建成功:', group)
    }
  } catch (error) {
    console.error('创建组内部图层失败:', error)
  }
}

// 切换组图层可见性
const toggleGroupVisibility = async () => {
  if (!groupLayer.value) return

  try {
    groupVisible.value = !groupVisible.value
    await groupLayer.value.setVisible(groupVisible.value)
    console.log('组图层可见性已更新:', groupVisible.value)
  } catch (error) {
    console.error('设置组图层可见性失败:', error)
  }
}

// 飞行到组图层
const flyToGroupLayer = async () => {
  if (!groupLayer.value) return

  try {
    await groupLayer.value.flyToThis()
    console.log('已飞行到组图层位置')
  } catch (error) {
    console.error('飞行到组图层失败:', error)
  }
}

// 清空组内所有子图层
const removeAllChildLayers = async () => {
  if (!groupLayer.value) return

  try {
    await groupLayer.value.removeAllLayer()
    await refreshChildLayers()
    console.log('已清空组内所有子图层')
  } catch (error) {
    console.error('清空子图层失败:', error)
  }
}
</script>

<template>
  <div class="group-inner-layer-demo">
    <div class="demo-header">
      <h3>组内部图层控制</h3>
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
            <el-button @click="createGroupInnerLayer" type="primary" class="create-btn">
              创建组内部图层
            </el-button>
          </div>

          <div class="layer-list" v-if="childLayers.length > 0">
            <div class="list-header">子图层列表 ({{ childLayers.length }})</div>
            <div
              v-for="(layer, index) in childLayers"
              :key="layer.id ?? index"
              class="layer-item"
            >
              <span class="layer-icon">🔲</span>
              <span class="layer-name">图层 {{ layer.id }}</span>
            </div>
          </div>
          <div v-else class="no-layers">
            暂无子图层，请先创建
          </div>
        </div>
      </div>

      <!-- 基础控制区域 -->
      <div class="control-section" v-if="groupLayer">
        <h4>⚙️ 基础控制</h4>
        <div class="control-grid">
          <div class="control-group">
            <div class="group-title">显示控制</div>
            <div class="control-row">
              <el-button @click="toggleGroupVisibility" :type="groupVisible ? 'success' : 'warning'" class="control-btn">
                {{ groupVisible ? '隐藏图层' : '显示图层' }}
              </el-button>
              <el-button @click="flyToGroupLayer" type="info" class="control-btn">
                飞行到图层
              </el-button>
            </div>
          </div>

          <div class="control-group">
            <div class="group-title">组操作</div>
            <div class="control-row">
              <el-button @click="removeAllChildLayers" type="danger" class="control-btn">
                清空子图层
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 图层信息显示 -->
      <div class="control-section" v-if="groupLayer">
        <h4>ℹ️ 图层信息</h4>
        <div class="info-display">
          <div class="info-row">
            <span class="info-label">图层ID：</span>
            <span class="info-value">{{ groupLayer.id }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">类名：</span>
            <span class="info-value">{{ groupLayer.className }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">TagName：</span>
            <span class="info-value">{{ createParams.TagName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">可见性：</span>
            <span class="info-value">{{ groupVisible ? '可见' : '隐藏' }}</span>
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
.group-inner-layer-demo {
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
    border-bottom: 1px solid rgba(225, 187, 130, 0.1);

    .layer-icon {
      margin-right: 8px;
      font-size: 14px;
    }

    .layer-name {
      flex: 1;
      color: #ffffff;
      font-size: 13px;
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
</style>
