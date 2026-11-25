<script setup lang="ts">
import { inject, ref, onBeforeUnmount, onMounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { DasLayerBase } from './lib/Layer/DasLayerBase.js'
import { DasGroupLayer } from './lib/Layer/DasGroupLayer.js'

// 图层列表
interface LayerInfo {
  index: number
  layer: DasLayerBase
  id: string
  name: string
  className: string
  visible: boolean
  highlight: boolean
  outline: boolean
  distanceVisible: boolean
  visibleConfig: { maxVisibleDistance: number; minVisibleDistance: number }
}

const layerList = ref<LayerInfo[]>([])
const isLoading = ref(false)
let active = true
onBeforeUnmount(() => { active = false })

// 可见距离设置
const visibleDistanceConfig = ref({
  distanceVisibleEnable: true,
  maxVisibleDistance: 50000,
  minVisibleDistance: 0
})

// 获取所有图层
const getAllLayers = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const pRoot = await DasGroupLayer.getRoot()
    if (!active) return
    const allLayers = await pRoot.getAllLayer()
    
    layerList.value = []
    
    if (allLayers && allLayers.length > 0) {
      for (let i = 0; i < allLayers.length; i++) {
        if (!active) return
        const layer = allLayers[i]
        try {
          const [id, name, className, visible, highlight, outline, distanceVisible, visibleConfig] = await Promise.all([
            layer.getID(), layer.getName(), layer.requestClassName(), layer.isVisible(), layer.isHightLight(),
            layer.isOutline(), layer.isDistanceVisibleEnable(), layer.getVisibleDistanceConfig(),
          ])
          layerList.value.push({ index: i, layer, id, name: name || `图层_${i}`, className, visible,
            highlight, outline, distanceVisible, visibleConfig })
        } catch (error) {
          console.error(`获取图层 ${i} 信息失败:`, error)
          layerList.value.push({
            index: i,
            layer: layer,
            id: `unknown_${i}`,
            name: `图层_${i}`,
            className: 'Unknown',
            visible: true,
            highlight: false,
            outline: false,
            distanceVisible: false,
            visibleConfig: { maxVisibleDistance: 50000, minVisibleDistance: 0 }
          })
        }
      }
    }
    
    console.log('获取到图层列表:', layerList.value)
  } catch (error) {
    console.error('获取图层列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 设置单个图层可见距离
const setLayerVisibleDistance = async (layerInfo: LayerInfo, config: typeof visibleDistanceConfig.value) => {
  try {
    await layerInfo.layer.setVisibleDistance(
      config.distanceVisibleEnable,
      config.maxVisibleDistance,
      config.minVisibleDistance
    )
    
    layerInfo.distanceVisible = config.distanceVisibleEnable
    layerInfo.visibleConfig = {
      maxVisibleDistance: config.maxVisibleDistance,
      minVisibleDistance: config.minVisibleDistance
    }
    
    console.log(`图层 ${layerInfo.name} 可见距离已设置:`, config)
  } catch (error) {
    console.error(`设置图层 ${layerInfo.name} 可见距离失败:`, error)
  }
}

// 批量设置所有图层可见距离
const setAllLayersVisibleDistance = async () => {
  if (!layerList.value.length) {
    console.warn('没有可用的图层')
    return
  }
  
  isLoading.value = true
  try {
    const config = visibleDistanceConfig.value
    const promises = layerList.value.map(layerInfo => 
      setLayerVisibleDistance(layerInfo, config)
    )
    
    await Promise.all(promises)
    console.log('批量设置可见距离完成')
  } catch (error) {
    console.error('批量设置可见距离失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 设置单个图层可见性
const toggleLayerVisible = async (layerInfo: LayerInfo) => {
  try {
    const newVisible = !layerInfo.visible
    await layerInfo.layer.setVisible(newVisible)
    layerInfo.visible = newVisible
    console.log(`图层 ${layerInfo.name} 可见性已设置为:`, newVisible)
  } catch (error) {
    console.error(`设置图层 ${layerInfo.name} 可见性失败:`, error)
  }
}

// 定位到图层
const flyToLayer = async (layerInfo: LayerInfo) => {
  try {
    await layerInfo.layer.flyToThis()
    console.log(`已定位到图层: ${layerInfo.name}`)
  } catch (error) {
    console.error(`定位图层 ${layerInfo.name} 失败:`, error)
  }
}

// 批量设置图层状态
const batchSetLayerState = async (property: 'visible' | 'highlight' | 'outline', value: boolean) => {
  if (!layerList.value.length) return
  
  isLoading.value = true
  try {
    const promises = layerList.value.map(async (layerInfo: LayerInfo) => {
      try {
        switch (property) {
          case 'visible':
            await layerInfo.layer.setVisible(value)
            layerInfo.visible = value
            break
          case 'highlight':
            await layerInfo.layer.setHightLight(value)
            layerInfo.highlight = value
            break
          case 'outline':
            await layerInfo.layer.setOutline(value)
            layerInfo.outline = value
            break
        }
      } catch (error) {
        console.error(`批量设置图层 ${layerInfo.name} 的 ${property} 失败:`, error)
      }
    })
    
    await Promise.all(promises)
    console.log(`批量设置 ${property} 为 ${value} 完成`)
  } catch (error) {
    console.error(`批量设置 ${property} 失败:`, error)
  } finally {
    isLoading.value = false
  }
}

const getShareData = inject<(key: string) => unknown>('getShareData')!
onMounted(() => {
  if (!getShareData('viewerReady')) return
  getAllLayers()
})
</script>

<template>
  <div>
    <div class="title">图层控制</div>
    <div class="split_line"></div>
    
    <!-- 操作控制面板 -->
    <div class="control-panel">
      <div class="panel-header">
        <h3>🎛️ 图层管理</h3>
        <el-button 
          type="primary" 
          :loading="isLoading"
          @click="getAllLayers">
          🔄 刷新图层列表
        </el-button>
      </div>
      
      <div class="layer-stats">
        <span class="stat-item">
          📊 总计: <strong>{{ layerList.length }}</strong> 个图层
        </span>
        <span class="stat-item">
          👁️ 可见: <strong>{{ layerList.filter(l => l.visible).length }}</strong>
        </span>
      </div>
    </div>
    
    <!-- 可见距离设置 -->
    <div class="distance-control">
      <div class="panel-header">
        <h3>📏 可见距离设置</h3>
      </div>
      <div class="distance-settings">
        <el-form-item label="启用距离控制" class="ruihua">
          <el-switch 
            v-model="visibleDistanceConfig.distanceVisibleEnable"
            active-text="开启" 
            inactive-text="关闭"
            active-color="#E1BB82">
          </el-switch>
        </el-form-item>
        
        <el-form-item label="最大可见距离" class="ruihua">
          <el-input-number 
            :min="visibleDistanceConfig.minVisibleDistance"
            v-model="visibleDistanceConfig.maxVisibleDistance" 
            style="width: 150px;">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="最小可见距离" class="ruihua">
          <el-input-number 
            v-model="visibleDistanceConfig.minVisibleDistance" 
            :min="0" 
            :max="visibleDistanceConfig.maxVisibleDistance"
            :step="100"
            style="width: 150px;">
          </el-input-number>
        </el-form-item>
        
        <el-button 
          type="primary" 
          :loading="isLoading"
          @click="setAllLayersVisibleDistance"
          style="margin-left: 15px;">
          📏 应用到所有图层
        </el-button>
      </div>
    </div>
    
    <!-- 批量操作 -->
    <div class="batch-control">
      <div class="panel-header">
        <h3>⚡ 批量操作</h3>
      </div>
      <div class="batch-buttons">
        <el-button 
          type="success" 
          :loading="isLoading"
          @click="batchSetLayerState('visible', true)">
          👁️ 全部显示
        </el-button>
        <el-button 
          type="warning" 
          :loading="isLoading"
          @click="batchSetLayerState('visible', false)">
          🙈 全部隐藏
        </el-button>
      </div>
    </div>
    
    <!-- 图层列表 -->
    <div class="layer-list" v-if="layerList.length > 0">
      <div class="panel-header">
        <h3>📋 图层列表</h3>
      </div>
      <div class="layer-items">
        <div 
          v-for="layerInfo in layerList" 
          :key="layerInfo.index" 
          class="layer-item">
          <div class="layer-info">
            <div class="layer-header">
              <span class="layer-name">{{ layerInfo.name }}</span>
              <span class="layer-class">{{ layerInfo.className }}</span>
            </div>
            <div class="layer-details">
              <span class="layer-id">ID: {{ layerInfo.id }}</span>
              <span class="distance-info" v-if="layerInfo.distanceVisible">
                📏 {{ layerInfo.visibleConfig.minVisibleDistance }} - {{ layerInfo.visibleConfig.maxVisibleDistance }}
              </span>
            </div>
          </div>
          
          <div class="layer-controls">
            <el-button 
              :type="layerInfo.visible ? 'success' : 'danger'" 
              size="small"
              @click="toggleLayerVisible(layerInfo)">
              {{ layerInfo.visible ? '👁️' : '🙈' }}
            </el-button>
            
            <el-button 
              type="primary" 
              size="small"
              @click="flyToLayer(layerInfo)">
              🎯
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="!isLoading" class="empty-state">
      <p>🔍 暂无图层数据</p>
      <p>请先加载场景数据或创建图层</p>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>正在加载图层数据...</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-panel, .distance-control, .batch-control, .layer-list {
  margin: 20px 0;
  padding: 16px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 8px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(225, 187, 130, 0.2);
  
  h3 {
    margin: 0;
    color: #e1bb82;
    font-size: 16px;
    font-weight: 600;
  }
}

.layer-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  
  .stat-item {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    
    strong {
      color: #e1bb82;
    }
  }
}

.distance-settings {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.batch-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.layer-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #e1bb82;
    border-radius: 3px;
  }
}

.layer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(225, 187, 130, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(225, 187, 130, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(225, 187, 130, 0.15);
    border-color: rgba(225, 187, 130, 0.3);
  }
}

.layer-info {
  flex: 1;
  min-width: 0;
  
  .layer-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
    
    .layer-name {
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
    }
    
    .layer-class {
      color: #e1bb82;
      font-size: 12px;
      background: rgba(225, 187, 130, 0.2);
      padding: 2px 6px;
      border-radius: 3px;
    }
  }
  
  .layer-details {
    display: flex;
    gap: 15px;
    
    .layer-id, .distance-info {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
    }
  }
}

.layer-controls {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.empty-state, .loading-state {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.6);
  
  p {
    margin: 8px 0;
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #e1bb82;
  
  .el-icon {
    font-size: 18px;
  }
}
</style>
