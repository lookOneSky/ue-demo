<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ScreenPosInformer } from './lib/Scene/ScreenPosInformer.js'
import type { ScreenPosition, PointInfo } from './lib/Scene/ScreenPosInformer'
import { DasPointsLayer } from './lib/Layer/DasPointsLayer.js';

// 定义类型
interface RegisteredPoint {
  id: string;
  position: number[];
  screenPos: number[];
  isVisible: boolean;
}

// 状态管理
const isActive = ref(false)
const registeredPoints = ref<RegisteredPoint[]>([])
const popupVisible = ref(false)
const popupStyle = ref({
  left: '0px',
  top: '0px',
  position: 'fixed' as const,
  zIndex: 9999
})
const popupContent = ref({
  id: '',
  position: [0, 0, 0],
  screenPos: [0, 0]
})

// 点位参数
const pointParams = ref({
  longitude: 111.0222729132209,
  latitude: 32.426901590203755,
  height: 790.6391397648027
})

// 动画参数
const animationParams = ref({
  moveDelay: 300,       // 延迟移动时间（毫秒）
  smoothDuration: 500,  // 平滑移动持续时间（毫秒）
  smoothEnabled: true,  // 是否启用平滑移动
  delayEnabled: true    // 是否启用延迟移动
})

// 记录上一次位置信息
let lastScreenPos = [0, 0]
let moveTimeout: ReturnType<typeof setTimeout> | null = null
let animationFrame: number | null = null

// 启动演示
const startDemo = async () => {
  isActive.value = true

  function trackVideoFrame(video, callback) {
    let lastFrameTime = 0;  // 上一次的视频 currentTime，表示上一次显示的帧时间

    function loop() {
      // 确保 video 已经开始播放并且有内容可读
      if (video.readyState >= 2 && video.currentTime !== lastFrameTime) {
        lastFrameTime = video.currentTime;  // 记录这帧时间
        callback(video);  // 回调你自己的处理逻辑（如更新 UI）
      }

      // 等下一帧浏览器绘制时继续循环
      requestAnimationFrame(loop);
    }

    // 启动帧检测循环
    requestAnimationFrame(loop);
  }

  trackVideoFrame(document.querySelector('#streamingVideo'), (video) => {
    console.log('显示了新的视频帧：', video.currentTime.toFixed(3));
  });


}

// 结束演示
const stopDemo = async () => {
  await clearAllPoints()
  isActive.value = false
  popupVisible.value = false

  // 清除可能存在的定时器和动画帧
  if (moveTimeout) {
    clearTimeout(moveTimeout)
    moveTimeout = null
  }

  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

// 注册一个点位
const registerPoint = async () => {
  try {
    const pointId = await ScreenPosInformer.RegisterPoint(
      pointParams.value.longitude,
      pointParams.value.latitude,
      pointParams.value.height
    )

    if (pointId) {
      const newPoint: RegisteredPoint = {
        id: pointId,
        position: [
          pointParams.value.longitude,
          pointParams.value.latitude,
          pointParams.value.height
        ],
        screenPos: [0, 0],
        isVisible: false
      }

      registeredPoints.value.push(newPoint)

      const param: Record<string, any> = {};
      let points = [pointParams.value.longitude, pointParams.value.latitude, pointParams.value.height];
      let allPoints = [];
      allPoints.push(points);
      param['points'] = allPoints;
      let pointInfo = {};
      param['pointSize'] = [20, 20];
      const wholeParam: Record<string, any> = {};
      wholeParam['param'] = param;
      //DasPointsLayer.createInstance(wholeParam);

      // 为这个点位添加屏幕位置变化监听
      ScreenPosInformer.addScreenPositionsChangedListener(
        pointId,
        (pointInfo: PointInfo) => {
          // 更新点的屏幕位置信息
          const index = registeredPoints.value.findIndex(p => p.id === pointInfo.pointId)
          if (index !== -1) {
            registeredPoints.value[index].screenPos = pointInfo.screenPos;
            registeredPoints.value[index].isVisible = pointInfo.isVisible

            // 如果这是当前选中的点，更新弹窗位置
            if (popupContent.value.id === pointInfo.pointId && pointInfo.isVisible) {
              updatePopupPosition(pointInfo.screenPos)
            }
          }
        }
      )

      console.log('点位注册成功:', pointId)
    }
  } catch (error) {
    console.error('点位注册失败:', error)
  }
}

// 移除单个点位
const removePoint = async (pointId: string) => {
  try {
    const success = await ScreenPosInformer.RemovePoint(pointId)
    if (success) {
      registeredPoints.value = registeredPoints.value.filter(p => p.id !== pointId)

      // 如果移除的是当前弹窗显示的点，关闭弹窗
      if (popupContent.value.id === pointId) {
        popupVisible.value = false
      }

      console.log('点位移除成功:', pointId)
    }
  } catch (error) {
    console.error('点位移除失败:', error)
  }
}

// 清除所有点位
const clearAllPoints = async () => {
  try {
    const success = await ScreenPosInformer.ClearAllPoints()
    if (success) {
      registeredPoints.value = []
      popupVisible.value = false
      console.log('所有点位已清除')
    }
  } catch (error) {
    console.error('清除点位失败:', error)
  }
}

// 显示点位弹窗
const showPointPopup = (point: RegisteredPoint) => {
  popupContent.value = {
    id: point.id,
    position: point.position,
    screenPos: [...point.screenPos]
  }

  updatePopupPosition(point.screenPos)
  popupVisible.value = true
}

// 更新弹窗位置
const updatePopupPosition = (screenPos: number[]) => {
  if (screenPos && screenPos.length >= 2) {
    // 记录新的屏幕位置
    const newScreenPos = [...screenPos]

    // 如果取消所有动画，则立即更新
    if (!animationParams.value.smoothEnabled && !animationParams.value.delayEnabled) {
      applyPopupPosition(newScreenPos)
      return
    }

    // 清除可能存在的定时器
    if (moveTimeout) {
      clearTimeout(moveTimeout)
      moveTimeout = null
    }

    // 清除可能存在的动画帧
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }

    // 如果启用了延迟移动
    if (animationParams.value.delayEnabled) {
      moveTimeout = setTimeout(() => {
        // 如果启用了平滑移动
        if (animationParams.value.smoothEnabled) {
          smoothMovePopup(lastScreenPos, newScreenPos, animationParams.value.smoothDuration)
        } else {
          applyPopupPosition(newScreenPos)
        }
      }, animationParams.value.moveDelay)
    }
    // 如果只启用了平滑移动，不延迟
    else if (animationParams.value.smoothEnabled) {
      smoothMovePopup(lastScreenPos, newScreenPos, animationParams.value.smoothDuration)
    }
  }
}

// 平滑移动弹窗
const smoothMovePopup = (startPos: number[], endPos: number[], duration: number) => {
  const startTime = Date.now()
  const startX = startPos[0]
  const startY = startPos[1]
  const deltaX = endPos[0] - startX
  const deltaY = endPos[1] - startY

  // 动画函数
  const animate = () => {
    const currentTime = Date.now()
    const elapsed = currentTime - startTime

    if (elapsed < duration) {
      // 计算当前位置（使用缓动函数使动画更加平滑）
      const progress = easeOutCubic(elapsed / duration)
      const currentX = startX + deltaX * progress
      const currentY = startY + deltaY * progress

      // 应用新位置
      applyPopupPosition([currentX, currentY])

      // 继续动画
      animationFrame = requestAnimationFrame(animate)
    } else {
      // 动画结束，应用最终位置
      applyPopupPosition(endPos)
      animationFrame = null
    }
  }

  // 开始动画
  animate()
}

// 缓动函数 - 三次方缓出
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

// 应用弹窗位置（实际更新DOM）
const applyPopupPosition = (screenPos: number[]) => {
  popupStyle.value = {
    left: `${screenPos[0]}px`,
    top: `${screenPos[1]}px`,
    position: 'fixed' as const,
    zIndex: 9999
  }
  popupContent.value.screenPos[0] = screenPos[0]
  popupContent.value.screenPos[1] = screenPos[1]

  // 更新上一次位置
  lastScreenPos = [...screenPos]
}

// 关闭弹窗
const closePopup = () => {
  popupVisible.value = false
}

// 组件卸载时清理资源
onUnmounted(async () => {
  await clearAllPoints()
})
</script>

<template>
  <div>
    <div class="title">屏幕位置信息器</div>
    <div class="split_line"></div>

    <!-- 控制按钮 -->
    <div class="control-group">
      <el-button :type="isActive ? 'danger' : 'primary'" @click="isActive ? stopDemo() : startDemo()"
        style="margin: 10px;">
        {{ isActive ? '结束演示' : '开始演示' }}
      </el-button>

      <el-button type="warning" @click="clearAllPoints" :disabled="!isActive || registeredPoints.length === 0"
        style="margin: 10px;">
        清除所有点位
      </el-button>
    </div>

    <!-- 点位参数设置 -->
    <div class="params-group" v-if="isActive">
      <el-form-item label="经度" class="ruihua">
        <el-input-number v-model="pointParams.longitude" :step="0.1" style="width: 120px;"></el-input-number>
      </el-form-item>

      <el-form-item label="纬度" class="ruihua">
        <el-input-number v-model="pointParams.latitude" :step="0.1" style="width: 120px;"></el-input-number>
      </el-form-item>

      <el-form-item label="高度" class="ruihua">
        <el-input-number v-model="pointParams.height" :step="1" style="width: 120px;"></el-input-number>
      </el-form-item>

      <el-button type="success" @click="registerPoint" style="margin: 15px;">
        注册点位
      </el-button>
    </div>

    <!-- 动画参数设置 -->
    <div class="animation-params" v-if="isActive">
      <div class="params-header">弹窗动画设置</div>

      <el-form-item label="启用平滑移动" class="ruihua">
        <el-switch v-model="animationParams.smoothEnabled" active-color="#E1BB82">
        </el-switch>
      </el-form-item>

      <el-form-item label="平滑移动时间(ms)" class="ruihua" :disabled="!animationParams.smoothEnabled">
        <el-input-number v-model="animationParams.smoothDuration" :min="100" :max="2000" :step="100"
          :disabled="!animationParams.smoothEnabled" style="width: 120px;">
        </el-input-number>
      </el-form-item>

      <el-form-item label="启用延迟移动" class="ruihua">
        <el-switch v-model="animationParams.delayEnabled" active-color="#E1BB82">
        </el-switch>
      </el-form-item>

      <el-form-item label="延迟时间(ms)" class="ruihua" :disabled="!animationParams.delayEnabled">
        <el-input-number v-model="animationParams.moveDelay" :min="0" :max="1000" :step="50"
          :disabled="!animationParams.delayEnabled" style="width: 120px;">
        </el-input-number>
      </el-form-item>
    </div>

    <!-- 已注册点位列表 -->
    <div class="points-list" v-if="isActive && registeredPoints.length > 0">
      <div class="points-header">
        <span>已注册点位</span>
      </div>
      <div class="points-container">
        <div v-for="point in registeredPoints" :key="point.id" class="point-item"
          :class="{ 'visible': point.isVisible }" @click="point.isVisible && showPointPopup(point)">
          <div class="point-info">
            <div>ID: {{ point.id.substring(0, 8) }}...</div>
            <div>经度: {{ point.position[0].toFixed(2) }}</div>
            <div>纬度: {{ point.position[1].toFixed(2) }}</div>
            <div>高度: {{ point.position[2].toFixed(2) }}</div>
            <div>状态: {{ point.isVisible ? '可见' : '不可见' }}</div>
          </div>
          <el-button type="danger" size="small" @click.stop="removePoint(point.id)" style="margin-left: auto;">
            删除
          </el-button>
        </div>
      </div>
    </div>
  </div>

  <!-- 点位弹窗 - 移到根级别以便在整个视口中显示 -->
  <teleport to="body">
    <div v-if="popupVisible" class="point-popup" :style="popupStyle">
      <div class="popup-header">
        <span>点位信息</span>
        <span class="popup-close" @click="closePopup">×</span>
      </div>
      <div class="popup-content">
        <div>ID: {{ popupContent.id.substring(0, 8) }}...</div>
        <div>经度: {{ popupContent.position[0].toFixed(4) }}</div>
        <div>纬度: {{ popupContent.position[1].toFixed(4) }}</div>
        <div>高度: {{ popupContent.position[2].toFixed(2) }}</div>
        <div>屏幕X: {{ popupContent.screenPos[0].toFixed(0) }}</div>
        <div>屏幕Y: {{ popupContent.screenPos[1].toFixed(0) }}</div>
      </div>
    </div>
  </teleport>
</template>

<style lang="scss" scoped>
.control-group,
.params-group {
  margin: 15px 0;
}

.points-list {
  margin: 15px;
  border-radius: 5px;
  border: 1px solid rgba(225, 187, 130, 0.3);
  background: rgba(33, 32, 29, 0.6);
}

.points-header {
  padding: 10px 15px;
  background: rgba(225, 187, 130, 0.1);
  color: #e1bb82;
  font-weight: bold;
  border-bottom: 1px solid rgba(225, 187, 130, 0.3);
}

.points-container {
  max-height: 200px;
  overflow-y: auto;
  padding: 5px;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #E1BB82;
    border-radius: 5px;
  }
}

.point-item {
  display: flex;
  align-items: center;
  margin: 5px 0;
  padding: 10px;
  border-radius: 3px;
  background: rgba(225, 187, 130, 0.05);
  color: #aaa;
  cursor: not-allowed;

  &.visible {
    background: rgba(225, 187, 130, 0.1);
    color: #fff;
    cursor: pointer;

    &:hover {
      background: rgba(225, 187, 130, 0.2);
    }
  }
}

.point-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
}

.point-popup {
  width: 200px;
  border-radius: 5px;
  background: rgba(33, 32, 29, 0.9);
  border: 1px solid #E1BB82;
  color: #fff;
  transform: translate(-50%, -100%);
  margin-top: -10px;
  pointer-events: auto;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid #E1BB82;
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(225, 187, 130, 0.3);
  background: rgba(225, 187, 130, 0.1);
  color: #e1bb82;
  font-weight: bold;
}

.popup-close {
  cursor: pointer;
  font-size: 16px;

  &:hover {
    color: #fff;
  }
}

.popup-content {
  padding: 10px;
  font-size: 12px;

  >div {
    margin-bottom: 5px;
  }
}

.animation-params {
  margin: 15px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid rgba(225, 187, 130, 0.3);
  background: rgba(33, 32, 29, 0.6);
}

.params-header {
  margin-bottom: 10px;
  padding-bottom: 8px;
  color: #e1bb82;
  font-weight: bold;
  border-bottom: 1px solid rgba(225, 187, 130, 0.3);
}
</style>