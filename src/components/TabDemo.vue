<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { Camera } from './lib/Scene/Camera.js'
import Scene from './lib/Scene/Scene.js'
import { LevelSequenceControl } from './lib/Scene/LevelSequenceControl.js'
import DemoCamera from './DemoCamera.vue'
import DemoDasFreeFlightCamera from './DemoDasFreeFlightCamera.vue'
import SceneDemo from './SceneDemo.vue'
import LevelSequence from './levelSequence.vue'
import WeatherDemo from './weatherDemo.vue'
import DasPointsToolDemo from './DasPointsToolDemo.vue'
import DasSelectToolDemo from './DasSelectToolDemo.vue'
import DemoDasToolSelectFitPolygon from './DemoDasToolSelectFitPolygon.vue'
import ScreenPosInformerDemo from './ScreenPosInformerDemo.vue'
import DemoDasWidgetBillboardLayer from './DemoDasWidgetBillboardLayer.vue'
import DemoDasUIBillboardLayer from './DemoDasUIBillboardLayer.vue'
import DemoDasPolylineLayer from './DemoDasPolylineLayer.vue'
import DemoDasInnerLayer from './DemoDasInnerLayer.vue'
import DemoDasGroupInnerLayer from './DemoDasGroupInnerLayer.vue'
import DemoCameraSetting from './DemoCameraSetting.vue'
import DemoCameraOperatorSetting from './DemoCameraOperatorSetting.vue'
import DemoCameraFlyToTarget from './DemoCameraFlyToTarget.vue'
import DemoDasCameraRoamingLayer from './DemoDasCameraRoamingLayer.vue'
import DemoDasCameraRoamingCircleLayer from './DemoDasCameraRoamingCircleLayer.vue'
import DemoDasVideoComposite from './DemoDasVideoComposite.vue'
import DemoDasCarLayer from './DemoDasCarLayer.vue'
import DemoDasSplineLayer from './DemoDasSplineLayer.vue'
import DemoDasDecalLayer from './DemoDasDecalLayer.vue'
import DemoDasCompass from './DemoDasCompass.vue'
import DemoLayerControl from './DemoLayerControl.vue'
import DemoDasGizmosTool from './DemoDasGizmosTool.vue'
import DemoDasLoadModelSubView from './DemoDasLoadModelSubView.vue'
import DemoDasScreenshot from './DemoDasScreenshot.vue'
import DemoDasScreenshotLegacy from './DemoDasScreenshotLegacy.vue'
import DemoShowModel from './DemoShowModel.vue'
import DemoDasInformerShape from './DemoDasInformerShape.vue'
import DemoDasLightLayer from './DemoDasLightLayer.vue'
import DemoDasToolSpotLight from './DemoDasToolSpotLight.vue'
import DemoDasMeasurementPoint from './DemoDasMeasurementPoint.vue'
import DemoDasMeasurementDistance from './DemoDasMeasurementDistance.vue'
import DemoDasMeasurementDistanceSurface from './DemoDasMeasurementDistanceSurface.vue'
import DemoDasMeasurementArea from './DemoDasMeasurementArea.vue'
import DemoDasMeasurementAngle from './DemoDasMeasurementAngle.vue'
import DemoDasSetOrigin from './DemoDasSetOrigin.vue'
import DemoWatchGuideLine from './DemoWatchGuideLine.vue'
import DemoDasThirdPersonCamera from './DemoDasThirdPersonCamera.vue'
import DemoDasPolygonLayer from './DemoDasPolygonLayer.vue'
import DemoDasFitLookPolygonLayer from './DemoDasFitLookPolygonLayer.vue'
import DemoDasFitEarthPolygonLayer from './DemoDasFitEarthPolygonLayer.vue'
import DemoDasFitEarthPolylineLayer from './DemoDasFitEarthPolylineLayer.vue'
import DemoDasToolRollerBlind from './DemoDasToolRollerBlind.vue'
import DemoDasInnerLayerRollerBlind from './DemoDasInnerLayerRollerBlind.vue'
import DemoDasSplineWalk from './DemoDasSplineWalk.vue'
import DemoDasCustomLayer from './DemoDasCustomLayer.vue'
import DemoDasElectron from './DemoDasElectron.vue'
import DemoDasHeight from './DemoDasHeight.vue'
import DemoDasClipPlanes from './DemoDasClipPlanes.vue'
import DemoCaveCameraLook from './DemoCaveCameraLook.vue'
import DemoDasKezierTileset from './DemoDasKezierTileset.vue'

const activeTab = ref('camera-universal')

// ===== 菜单配置 =====
// 通过修改此JSON即可调整菜单结构和分类
const tabList = ref([
  {
    id: 'tool',
    name: '工具',
    icon: '🔧',
    isCategory: true,
    children: [
      { id: 'pointsTool', name: '点工具', icon: '📍', minSize: { width: 450, height: 500 } },
      { id: 'selectTool', name: '选择工具', icon: '🔍', minSize: { width: 450, height: 500 } },
      { id: 'selectFitPolygonTool', name: '立面多边形选择', icon: '🔷', minSize: { width: 450, height: 500 } },
      { id: 'gizmosTool', name: 'Gizmos变换工具', icon: '🎛️', minSize: { width: 550, height: 700 } },
      { id: 'rollerBlindTool', name: '卷帘对比工具', icon: '🪟', minSize: { width: 580, height: 620 } },
      { id: 'innerLayerRollerBlind', name: 'Inner图层卷帘对比', icon: '🪟', minSize: { width: 600, height: 700 } },
      { id: 'compass', name: '指北针控制', icon: '🧭', minSize: { width: 450, height: 500 } },
      { id: 'splineWalk', name: '样条行走', icon: '🚶', minSize: { width: 550, height: 650 } },
      { id: 'spotLightTool', name: '聚光灯工具', icon: '💡', minSize: { width: 500, height: 700 } },
      { id: 'measurementPoint', name: '点位测量', icon: '📌', minSize: { width: 450, height: 500 } },
      { id: 'measurementDistance', name: '距离测量', icon: '📐', minSize: { width: 450, height: 500 } },
      { id: 'measurementDistanceSurface', name: '表面距离测量', icon: '〰️', minSize: { width: 450, height: 500 } },
      { id: 'measurementArea', name: '面积测量', icon: '🗺️', minSize: { width: 450, height: 500 } },
      { id: 'measurementAngle', name: '角度测量', icon: '∠', minSize: { width: 450, height: 500 } },
      { id: 'caveCameraLook', name: '洞窟内相机定位', icon: '🕳️', minSize: { width: 480, height: 620 } },
    ]
  },
  {
    id: 'scene',
    name: '场景',
    icon: '🌍',
    isCategory: true,
    children: [
      {
        id: 'operator',
        name: '操作器',
        icon: '🕹️',
        isSubCategory: true,
        children: [
          { id: 'camera-universal', name: '通用操作器', icon: '🎮', minSize: { width: 550, height: 600 } },
          { id: 'camera-freeflight', name: '第一人称操作器', icon: '🚀', minSize: { width: 450, height: 500 } },
          { id: 'camera-setting', name: '操作器切换', icon: '⚙️', minSize: { width: 500, height: 600 } },
          { id: 'camera-operator-setting', name: '通用操作器设置', icon: '🛠️', minSize: { width: 500, height: 600 } },
          { id: 'camera-fly-to-target', name: '目标点屏幕偏移飞行', icon: '🎯', minSize: { width: 480, height: 680 } },
        ]
      },
      { id: 'sceneControl', name: '场景控制', icon: '🌐', minSize: { width: 500, height: 500 } },
      { id: 'levelSequence', name: '序列控制', icon: '🎬', minSize: { width: 450, height: 400 } },
      { id: 'weather', name: '天气设置', icon: '🌤️', minSize: { width: 500, height: 700 } },
      { id: 'screenshot', name: '3DTiles分块截图', icon: '📷', minSize: { width: 520, height: 720 } },
      { id: 'screenshotLegacy', name: '场景截图（原接口）', icon: '📸', minSize: { width: 450, height: 400 } },
      { id: 'showModel', name: '模型显示模式', icon: '🎨', minSize: { width: 500, height: 650 } },
      { id: 'informerShape', name: '区域感应Shape', icon: '🔔', minSize: { width: 480, height: 560 } },
      { id: 'setOrigin', name: '场景原点设置', icon: '📍', minSize: { width: 450, height: 350 } },
      { id: 'kezierTileset', name: '克孜尔场景加载', icon: '🏜️', minSize: { width: 520, height: 760 } },
      { id: 'watchGuideLine', name: '引导路线', icon: '🗺️', minSize: { width: 380, height: 280 } },
      { id: 'thirdPersonCamera', name: '人物换装', icon: '👗', minSize: { width: 480, height: 560 } },
      { id: 'heightQuery', name: '高度查询', icon: '📏', minSize: { width: 480, height: 520 } },
      { id: 'clipPlanes', name: '裁剪平面控制', icon: '✂️', minSize: { width: 520, height: 650 } },
    ]
  },
  {
    id: 'layer',
    name: '图层',
    icon: '📋',
    isCategory: true,
    children: [
      { id: 'billboardLayer', name: 'Billboard图层', icon: '📋', minSize: { width: 500, height: 600 } },
      { id: 'uiBillboardLayer', name: 'UI Billboard图层', icon: '🖼️', minSize: { width: 500, height: 600 } },
      { id: 'polylineLayer', name: '多段线图层', icon: '📏', minSize: { width: 500, height: 600 } },
      { id: 'innerLayer', name: '内部图层', icon: '🎛️', minSize: { width: 600, height: 800 } },
      { id: 'groupInnerLayer', name: '组内部图层', icon: '🗂️', minSize: { width: 600, height: 800 } },
      { id: 'cameraRoamingLayer', name: '相机漫游图层', icon: '🎥', minSize: { width: 550, height: 700 } },
      { id: 'cameraRoamingCircleLayer', name: '相机环绕图层', icon: '🔄', minSize: { width: 550, height: 700 } },
      { id: 'videoCompositeLayer', name: '视频合成图层', icon: '🎬', minSize: { width: 600, height: 800 } },
      { id: 'carLayer', name: '车辆图层', icon: '🚗', minSize: { width: 550, height: 650 } },
      { id: 'splineLayer', name: '样条线图层', icon: '🌀', minSize: { width: 550, height: 650 } },
      { id: 'decalLayer', name: '贴花图层', icon: '🖼️', minSize: { width: 550, height: 700 } },
      { id: 'layerControl', name: '图层控制', icon: '🎛️', minSize: { width: 600, height: 700 } },
      { id: 'loadModelSubView', name: '模型加载子视口图层', icon: '🏗️', minSize: { width: 600, height: 800 } },
      { id: 'lightLayer', name: '灯光图层', icon: '💡', minSize: { width: 500, height: 600 } },
      { id: 'customLayer', name: '自定义图层', icon: '🧱', minSize: { width: 520, height: 620 } },
      { id: 'polygonLayer', name: '多边形图层', icon: '🔶', minSize: { width: 520, height: 760 } },
      { id: 'fitLookPolygonLayer', name: '立面多边形图层', icon: '🔷', minSize: { width: 500, height: 650 } },
      { id: 'fitEarthPolygonLayer', name: '贴地多边形图层', icon: '🟩', minSize: { width: 520, height: 760 } },
      { id: 'fitEarthPolylineLayer', name: '贴地折线图层', icon: '➰', minSize: { width: 520, height: 800 } },
    ]
  },
  {
    id: 'app',
    name: '应用',
    icon: '📱',
    isCategory: true,
    children: [
      { id: 'closeElectronApp', name: '关闭Electron应用', icon: '❌', minSize: { width: 380, height: 200 } },
    ]
  },
])

// 侧边栏控制
const tabExpanded = ref(true)
const expandedCategories = ref(['tool', 'scene', 'layer', 'app', 'operator']) // 默认展开所有分类
const toggleTabExpansion = () => {
  tabExpanded.value = !tabExpanded.value
}

// 切换分类展开状态
const toggleCategory = (categoryId: string) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
}

// 侧边栏宽度（可拖拽调整）
const sidebarWidth = ref(240)
const SIDEBAR_MIN_WIDTH = 180
const SIDEBAR_MAX_WIDTH = 420
const isSidebarResizing = ref(false)

// 侧边栏拖拽缩放
const startSidebarResize = (e: MouseEvent) => {
  e.stopPropagation()
  isSidebarResizing.value = true
  const startX = e.clientX
  const startWidth = sidebarWidth.value

  const onMouseMove = (e: MouseEvent) => {
    const newWidth = Math.max(SIDEBAR_MIN_WIDTH, startWidth + (e.clientX - startX))
    const maxAllowed = Math.min(SIDEBAR_MAX_WIDTH, window.innerWidth * 0.5)
    sidebarWidth.value = Math.min(newWidth, maxAllowed)
  }

  const onMouseUp = () => {
    isSidebarResizing.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// 弹窗控制
const showModal = ref(false)
const modalPosition = ref({ x: 250, y: 50 })
const modalSize = ref({ width: 600, height: 700 })
const isResizing = ref(false)
const isDragging = ref(false)
const isMaximized = ref(false)
const isMinimized = ref(false)

// 保存窗口状态
const savedPosition = ref({ x: 250, y: 50 })
const savedSize = ref({ width: 600, height: 700 })

// 获取当前tab信息
const getCurrentTab = () => {
  for (const tab of tabList.value) {
    if (tab.isCategory && tab.children) {
      for (const child of tab.children) {
        if (child.isSubCategory && child.children) {
          const subChildTab = child.children.find(subChild => subChild.id === activeTab.value)
          if (subChildTab) return subChildTab
        } else if (child.id === activeTab.value) {
          return child
        }
      }
    } else if (tab.id === activeTab.value) {
      return tab
    }
  }
  return null
}

// 打开弹窗
const openModal = (tabId: string) => {
  activeTab.value = tabId
  showModal.value = true
  
  // 根据内容类型自动调整窗口大小
  const currentTab = getCurrentTab()
  if (currentTab && currentTab.minSize) {
    modalSize.value = { ...currentTab.minSize }
    savedSize.value = { ...currentTab.minSize }
  }
  
  // 确保弹窗位置合理
  nextTick(() => {
    adjustModalPosition()
  })
}

// 调整弹窗位置
const adjustModalPosition = () => {
  const maxX = window.innerWidth - modalSize.value.width - 20
  const maxY = window.innerHeight - modalSize.value.height - 20
  
  modalPosition.value.x = Math.max(0, Math.min(modalPosition.value.x, maxX))
  modalPosition.value.y = Math.max(0, Math.min(modalPosition.value.y, maxY))
}

// 监听窗口大小变化
watch(() => [modalSize.value.width, modalSize.value.height], () => {
  if (showModal.value) {
    adjustModalPosition()
  }
})

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  isMaximized.value = false
  isMinimized.value = false
}

// 最小化弹窗
const minimizeModal = () => {
  if (!isMinimized.value) {
    savedPosition.value = { ...modalPosition.value }
    savedSize.value = { ...modalSize.value }
    
    modalSize.value = { width: 200, height: 40 }
    modalPosition.value.y = window.innerHeight - 60
    isMinimized.value = true
  } else {
    modalPosition.value = { ...savedPosition.value }
    modalSize.value = { ...savedSize.value }
    isMinimized.value = false
    adjustModalPosition()
  }
}

// 最大化弹窗
const maximizeModal = () => {
  if (!isMaximized.value) {
    savedPosition.value = { ...modalPosition.value }
    savedSize.value = { ...modalSize.value }
    
    modalPosition.value = { x: 10, y: 10 }
    modalSize.value = { 
      width: window.innerWidth - 20, 
      height: window.innerHeight - 20 
    }
    isMaximized.value = true
  } else {
    modalPosition.value = { ...savedPosition.value }
    modalSize.value = { ...savedSize.value }
    isMaximized.value = false
    adjustModalPosition()
  }
}

// 拖拽功能
const startDrag = (e: MouseEvent) => {
  if ((e.target as HTMLElement).classList.contains('resize-handle') || isMaximized.value || isMinimized.value) return
  
  isDragging.value = true
  const startX = e.clientX - modalPosition.value.x
  const startY = e.clientY - modalPosition.value.y

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return
    modalPosition.value.x = Math.max(0, Math.min(window.innerWidth - modalSize.value.width, e.clientX - startX))
    modalPosition.value.y = Math.max(0, Math.min(window.innerHeight - modalSize.value.height, e.clientY - startY))
  }

  const onMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// 缩放功能
const startResize = (e: MouseEvent) => {
  if (isMaximized.value || isMinimized.value) return
  
  e.stopPropagation()
  isResizing.value = true
  const startX = e.clientX
  const startY = e.clientY
  const startWidth = modalSize.value.width
  const startHeight = modalSize.value.height

  // 获取当前tab的最小尺寸
  const currentTab = getCurrentTab()
  const minSize = currentTab?.minSize || { width: 400, height: 300 }

  const onMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return
    const newWidth = Math.max(minSize.width, startWidth + (e.clientX - startX))
    const newHeight = Math.max(minSize.height, startHeight + (e.clientY - startY))
    
    // 确保不超出屏幕
    modalSize.value.width = Math.min(newWidth, window.innerWidth - modalPosition.value.x - 20)
    modalSize.value.height = Math.min(newHeight, window.innerHeight - modalPosition.value.y - 20)
  }

  const onMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <div class="tab-demo-container">
    <!-- 侧边栏展开/收起按钮 -->
    <div
      class="tab-toggle"
      :class="{ collapsed: !tabExpanded }"
      :style="{ left: tabExpanded ? sidebarWidth + 'px' : '0' }"
      @click="toggleTabExpansion"
    >
      <span class="toggle-icon">{{ tabExpanded ? '◀' : '▶' }}</span>
    </div>

    <!-- 侧边栏 -->
    <div
      class="tab-sidebar"
      :class="{ collapsed: !tabExpanded, resizing: isSidebarResizing }"
      :style="{ width: sidebarWidth + 'px', marginLeft: tabExpanded ? '0' : '-' + sidebarWidth + 'px' }"
    >
      <div class="tab-header">功能演示</div>
      <div class="tab-list">
        <template v-for="tab in tabList" :key="tab.id">
          <!-- 分类菜单 -->
          <div v-if="tab.isCategory" class="tab-category">
            <div class="category-header" @click="toggleCategory(tab.id)">
              <div class="category-info">
                <div class="tab-icon">{{ tab.icon }}</div>
                <div class="tab-name">{{ tab.name }}</div>
              </div>
              <div class="category-arrow" :class="{ expanded: expandedCategories.includes(tab.id) }">
                ▼
              </div>
            </div>
            <div class="category-children" v-show="expandedCategories.includes(tab.id)">
              <template v-for="child in tab.children" :key="child.id">
                <!-- 二级子分类 -->
                <div v-if="child.isSubCategory" class="tab-subcategory">
                  <div class="subcategory-header child-item" @click="toggleCategory(child.id)">
                    <div class="category-info">
                      <div class="tab-icon">{{ child.icon }}</div>
                      <div class="tab-name">{{ child.name }}</div>
                    </div>
                    <div class="category-arrow" :class="{ expanded: expandedCategories.includes(child.id) }">
                      ▼
                    </div>
                  </div>
                  <div class="subcategory-children" v-show="expandedCategories.includes(child.id)">
                    <div
                      v-for="subChild in child.children"
                      :key="subChild.id"
                      class="tab-item child-item sub-item"
                      :class="{ active: activeTab === subChild.id }"
                      @click="openModal(subChild.id)"
                    >
                      <div class="tab-icon">{{ subChild.icon }}</div>
                      <div class="tab-name">{{ subChild.name }}</div>
                    </div>
                  </div>
                </div>
                <!-- 普通二级菜单项 -->
                <div
                  v-else
                  class="tab-item child-item"
                  :class="{ active: activeTab === child.id }"
                  @click="openModal(child.id)"
                >
                  <div class="tab-icon">{{ child.icon }}</div>
                  <div class="tab-name">{{ child.name }}</div>
                </div>
              </template>
            </div>
          </div>
          <!-- 普通菜单项 -->
          <div v-else class="tab-item" :class="{ active: activeTab === tab.id }" @click="openModal(tab.id)">
            <div class="tab-icon">{{ tab.icon }}</div>
            <div class="tab-name">{{ tab.name }}</div>
          </div>
        </template>
      </div>
      <div
        class="sidebar-resize-handle"
        v-show="tabExpanded"
        @mousedown="startSidebarResize"
      ></div>
    </div>

    <!-- 独立的弹窗 -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-window" 
           :class="{ 
             maximized: isMaximized, 
             minimized: isMinimized,
             dragging: isDragging,
             resizing: isResizing
           }"
           :style="{
             left: modalPosition.x + 'px',
             top: modalPosition.y + 'px',
             width: modalSize.width + 'px',
             height: modalSize.height + 'px'
           }">
        <!-- 弹窗标题栏 -->
        <div class="modal-header" @mousedown="startDrag">
          <div class="modal-title">
            <span class="title-icon">{{ getCurrentTab()?.icon || '⚙️' }}</span>
            {{ getCurrentTab()?.name || '功能演示' }}
          </div>
          <div class="modal-controls">
            <button class="modal-btn minimize" @click="minimizeModal" title="最小化">
              {{ isMinimized ? '+' : '−' }}
            </button>
            <button class="modal-btn maximize" @click="maximizeModal" title="最大化">
              {{ isMaximized ? '❐' : '□' }}
            </button>
            <button class="modal-btn close" @click="closeModal" title="关闭">×</button>
          </div>
        </div>

        <!-- 弹窗内容 -->
        <div class="modal-content" v-show="!isMinimized">
          <!-- 通用操作器 -->
          <div v-if="activeTab === 'camera-universal'" class="tab-panel">
            <DemoCamera />
          </div>

          <!-- 第一人称控制器 -->
          <div v-if="activeTab === 'camera-freeflight'" class="tab-panel">
            <DemoDasFreeFlightCamera />
          </div>

          <!-- 操作器切换 -->
          <div v-if="activeTab === 'camera-setting'" class="tab-panel">
            <DemoCameraSetting />
          </div>

          <!-- 通用操作器设置 -->
          <div v-if="activeTab === 'camera-operator-setting'" class="tab-panel">
            <DemoCameraOperatorSetting />
          </div>

          <!-- 目标点屏幕偏移飞行 -->
          <div v-if="activeTab === 'camera-fly-to-target'" class="tab-panel">
            <DemoCameraFlyToTarget />
          </div>

          <!-- 其他面板内容 -->
          <div v-if="activeTab === 'sceneControl'" class="tab-panel">
            <SceneDemo />
          </div>
          <div v-if="activeTab === 'heightQuery'" class="tab-panel">
            <DemoDasHeight />
          </div>
          <div v-if="activeTab === 'clipPlanes'" class="tab-panel">
            <DemoDasClipPlanes />
          </div>

          <div v-if="activeTab === 'levelSequence'" class="tab-panel">
            <LevelSequence />
          </div>
          
          <div v-if="activeTab === 'weather'" class="tab-panel">
            <WeatherDemo />
          </div>
          
          <div v-if="activeTab === 'pointsTool'" class="tab-panel">
            <DasPointsToolDemo />
          </div>

          <div v-if="activeTab === 'selectTool'" class="tab-panel">
            <DasSelectToolDemo />
          </div>

          <div v-if="activeTab === 'selectFitPolygonTool'" class="tab-panel">
            <DemoDasToolSelectFitPolygon />
          </div>

          <div v-if="activeTab === 'gizmosTool'" class="tab-panel">
            <DemoDasGizmosTool />
          </div>

          <div v-if="activeTab === 'rollerBlindTool'" class="tab-panel">
            <DemoDasToolRollerBlind />
          </div>

          <div v-if="activeTab === 'innerLayerRollerBlind'" class="tab-panel">
            <DemoDasInnerLayerRollerBlind />
          </div>

          <div v-if="activeTab === 'informerShape'" class="tab-panel">
            <DemoDasInformerShape />
          </div>
          
          <div v-if="activeTab === 'billboardLayer'" class="tab-panel">
            <DemoDasWidgetBillboardLayer />
          </div>

          <div v-if="activeTab === 'uiBillboardLayer'" class="tab-panel">
            <DemoDasUIBillboardLayer />
          </div>

          <div v-if="activeTab === 'polylineLayer'" class="tab-panel">
            <DemoDasPolylineLayer />
          </div>

          <div v-if="activeTab === 'cameraRoamingLayer'" class="tab-panel">
            <DemoDasCameraRoamingLayer />
          </div>

          <div v-if="activeTab === 'cameraRoamingCircleLayer'" class="tab-panel">
            <DemoDasCameraRoamingCircleLayer />
          </div>

          <div v-if="activeTab === 'videoCompositeLayer'" class="tab-panel">
            <DemoDasVideoComposite />
          </div>

          <div v-if="activeTab === 'carLayer'" class="tab-panel">
            <DemoDasCarLayer />
          </div>

          <div v-if="activeTab === 'splineLayer'" class="tab-panel">
            <DemoDasSplineLayer />
          </div>

          <div v-if="activeTab === 'decalLayer'" class="tab-panel">
            <DemoDasDecalLayer />
          </div>

          <div v-if="activeTab === 'compass'" class="tab-panel">
            <DemoDasCompass />
          </div>

          <div v-if="activeTab === 'splineWalk'" class="tab-panel">
            <DemoDasSplineWalk />
          </div>

          <div v-if="activeTab === 'layerControl'" class="tab-panel">
            <DemoLayerControl />
          </div>

          <div v-if="activeTab === 'innerLayer'" class="tab-panel">
            <DemoDasInnerLayer />
          </div>

          <div v-if="activeTab === 'groupInnerLayer'" class="tab-panel">
            <DemoDasGroupInnerLayer />
          </div>

          <div v-if="activeTab === 'loadModelSubView'" class="tab-panel">
            <DemoDasLoadModelSubView />
          </div>

          <div v-if="activeTab === 'screenshot'" class="tab-panel">
            <DemoDasScreenshot />
          </div>

          <div v-if="activeTab === 'screenshotLegacy'" class="tab-panel">
            <DemoDasScreenshotLegacy />
          </div>

          <div v-if="activeTab === 'showModel'" class="tab-panel">
            <DemoShowModel />
          </div>

          <div v-if="activeTab === 'lightLayer'" class="tab-panel">
            <DemoDasLightLayer />
          </div>
          <div v-if="activeTab === 'customLayer'" class="tab-panel">
            <DemoDasCustomLayer />
          </div>
          <div v-if="activeTab === 'polygonLayer'" class="tab-panel">
            <DemoDasPolygonLayer />
          </div>
          <div v-if="activeTab === 'spotLightTool'" class="tab-panel">
            <DemoDasToolSpotLight />
          </div>
          <div v-if="activeTab === 'measurementPoint'" class="tab-panel">
            <DemoDasMeasurementPoint />
          </div>
          <div v-if="activeTab === 'measurementDistance'" class="tab-panel">
            <DemoDasMeasurementDistance />
          </div>
          <div v-if="activeTab === 'measurementDistanceSurface'" class="tab-panel">
            <DemoDasMeasurementDistanceSurface />
          </div>
          <div v-if="activeTab === 'measurementArea'" class="tab-panel">
            <DemoDasMeasurementArea />
          </div>
          <div v-if="activeTab === 'measurementAngle'" class="tab-panel">
            <DemoDasMeasurementAngle />
          </div>
          <div v-if="activeTab === 'caveCameraLook'" class="tab-panel">
            <DemoCaveCameraLook />
          </div>
          <div v-if="activeTab === 'setOrigin'" class="tab-panel">
            <DemoDasSetOrigin />
          </div>
          <div v-if="activeTab === 'kezierTileset'" class="tab-panel">
            <DemoDasKezierTileset />
          </div>
          <div v-if="activeTab === 'watchGuideLine'" class="tab-panel">
            <DemoWatchGuideLine />
          </div>
          <div v-if="activeTab === 'thirdPersonCamera'" class="tab-panel">
            <DemoDasThirdPersonCamera />
          </div>
          <div v-if="activeTab === 'fitLookPolygonLayer'" class="tab-panel">
            <DemoDasFitLookPolygonLayer />
          </div>
          <div v-if="activeTab === 'fitEarthPolygonLayer'" class="tab-panel">
            <DemoDasFitEarthPolygonLayer />
          </div>
          <div v-if="activeTab === 'fitEarthPolylineLayer'" class="tab-panel">
            <DemoDasFitEarthPolylineLayer />
          </div>
          <div v-if="activeTab === 'closeElectronApp'" class="tab-panel">
            <DemoDasElectron />
          </div>
        </div>

        <!-- 缩放手柄 -->
        <div class="resize-handle" @mousedown="startResize" v-show="!isMaximized && !isMinimized"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-demo-container {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
}

.tab-toggle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 60px;
  background: rgba(33, 32, 29, 0.9);
  border-radius: 0 4px 4px 0;
  border: 0.5px solid #E1BB82;
  border-left: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #E1BB82;
  z-index: 15;
  transition: left 0.3s ease;
}

.tab-sidebar {
  height: 100vh;
  background: rgba(33, 32, 29, 0.9);
  backdrop-filter: blur(4px);
  border-right: 0.5px solid #E1BB82;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease, width 0.1s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 11;

  &.resizing {
    transition: none;
    user-select: none;
  }
}

.sidebar-resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  cursor: ew-resize;
  z-index: 12;
  background: transparent;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(225, 187, 130, 0.3);
  }
}

.tab-sidebar.resizing .sidebar-resize-handle {
  background: rgba(225, 187, 130, 0.3);
}

.tab-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E1BB82;
  font-size: 18px;
  font-family: "Source Han Serif CN";
  border-bottom: 0.5px solid #E1BB82;
  font-weight: bold;
}

.tab-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #E1BB82;
    border-radius: 5px;
  }
}

.tab-category {
  .category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 15px;
    cursor: pointer;
    color: #E1BB82;
    transition: all 0.3s ease;
    border-left: 3px solid transparent;

    &:hover {
      background: rgba(225, 187, 130, 0.1);
      border-left-color: rgba(225, 187, 130, 0.5);
    }

    .category-info {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
    }

    .tab-name {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.4px;
    }

    .category-arrow {
      font-size: 12px;
      transition: transform 0.3s ease;

      &.expanded {
        transform: rotate(180deg);
      }
    }
  }

  .category-children {
    background: rgba(0, 0, 0, 0.2);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 14px;
      top: 0;
      bottom: 0;
      width: 1px;
      background: rgba(225, 187, 130, 0.15);
    }
  }
}

.tab-subcategory {
  .subcategory-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px 10px 25px;
    cursor: pointer;
    color: #E1BB82;
    transition: all 0.3s ease;
    border-left: 3px solid transparent;

    &:hover {
      background: rgba(225, 187, 130, 0.08);
      border-left-color: rgba(225, 187, 130, 0.35);
    }

    .category-info {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
    }

    .tab-icon {
      width: 20px;
      height: 20px;
      margin-right: 10px;
      font-size: 12px;
      background: rgba(225, 187, 130, 0.12);
    }

    .tab-name {
      font-size: 14px;
      font-weight: 600;
    }

    .category-arrow {
      font-size: 10px;
      transition: transform 0.3s ease;

      &.expanded {
        transform: rotate(180deg);
      }
    }
  }

  .subcategory-children {
    background: rgba(0, 0, 0, 0.15);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 26px;
      top: 0;
      bottom: 0;
      width: 1px;
      background: rgba(225, 187, 130, 0.12);
    }
  }
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;

  &:hover {
    background: rgba(225, 187, 130, 0.1);
    border-left-color: rgba(225, 187, 130, 0.5);
  }

  &.active {
    background: rgba(225, 187, 130, 0.2);
    border-left-color: #E1BB82;
    color: #E1BB82;
  }

  // 二级：分类下的普通叶子项
  &.child-item {
    padding-left: 25px;

    .tab-icon {
      width: 20px;
      height: 20px;
      margin-right: 10px;
      font-size: 12px;
      background: rgba(225, 187, 130, 0.12);
    }

    .tab-name {
      font-size: 14px;
      font-weight: 500;
    }
  }

  // 三级：子分类下的叶子项，层级最深，字号最小
  &.child-item.sub-item {
    padding-left: 35px;

    .tab-icon {
      width: 16px;
      height: 16px;
      margin-right: 8px;
      font-size: 10px;
      background: rgba(225, 187, 130, 0.08);
    }

    .tab-name {
      font-size: 12px;
      font-weight: 400;
      opacity: 0.85;
    }
  }
}

.tab-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  border-radius: 4px;
  background: rgba(225, 187, 130, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.tab-name {
  font-family: "Source Han Sans CN";
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  pointer-events: none;
}

.modal-window {
  position: absolute;
  background: rgba(33, 32, 29, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid #E1BB82;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  min-width: 300px;
  min-height: 200px;
  max-width: 95vw;
  max-height: 95vh;
  pointer-events: all;
  transition: all 0.3s ease;

  &.maximized {
    border-radius: 0;
  }

  &.minimized {
    border-radius: 4px;
  }

  &.dragging {
    user-select: none;
    transition: none;
  }

  &.resizing {
    user-select: none;
    transition: none;
  }
}

.modal-header {
  height: 40px;
  background: rgba(225, 187, 130, 0.1);
  border-bottom: 1px solid #E1BB82;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  cursor: move;
  border-radius: 8px 8px 0 0;

  .modal-window.maximized & {
    border-radius: 0;
  }

  .modal-window.minimized & {
    border-radius: 4px;
    border-bottom: none;
  }
}

.modal-title {
  color: #E1BB82;
  font-family: "Source Han Serif CN";
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;

  .title-icon {
    font-size: 18px;
  }
}

.modal-controls {
  display: flex;
  gap: 5px;
}

.modal-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s ease;

  &.minimize {
    background: rgba(255, 193, 7, 0.8);
    color: #fff;
    &:hover { 
      background: rgba(255, 193, 7, 1); 
      transform: scale(1.1);
    }
  }

  &.maximize {
    background: rgba(40, 167, 69, 0.8);
    color: #fff;
    &:hover { 
      background: rgba(40, 167, 69, 1); 
      transform: scale(1.1);
    }
  }

  &.close {
    background: rgba(220, 53, 69, 0.8);
    color: #fff;
    &:hover { 
      background: rgba(220, 53, 69, 1); 
      transform: scale(1.1);
    }
  }
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #E1BB82;
    border-radius: 3px;
  }
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 15px;
  height: 15px;
  cursor: se-resize;
  background: linear-gradient(-45deg, transparent 30%, #E1BB82 30%, #E1BB82 40%, transparent 40%, transparent 60%, #E1BB82 60%, #E1BB82 70%, transparent 70%);
  border-radius: 0 0 8px 0;
}

.tab-panel {
  width: 100%;
  height: 100%;
}
</style>
