<script setup lang="ts">
import { onViewerSessionLeave } from '../utils/onViewerSessionLeave'
import { ref, onBeforeUnmount } from 'vue'
import { DasPointsTool } from "./lib/Tool/DasPointsTool.js"
import { DasInformerShape } from "./lib/Scene/DasInformerShape.js"

const LISTENER_ID = "DemoDasInformerShape"

const isToolActive = ref(false)
const shapeCount = ref(0)
const showShape = ref(false)
const eventLogs = ref<{ time: string; type: string; shapeName: string; shapeID: string }[]>([])

// 启动/停止点工具
const toggleTool = async () => {
  if (isToolActive.value) {
    await DasPointsTool.finishTool()
    isToolActive.value = false
  } else {
    await DasPointsTool.setToCurrent()
    isToolActive.value = true
  }
}

// 注册 Shape（取当前点工具的单个点位）
const registerShapes = async () => {
  const pos = await DasPointsTool.getPointPosition()
  if (!Array.isArray(pos) || pos.length < 3) {
    console.warn('[DemoDasInformerShape] 未获取到点位')
    return
  }

  const shapes = [{
    shapeType: 'Cylinder',
    shapeName: `Shape_${shapeCount.value + 1}`,
    posLLH: pos,
    dRadius: 0.5,
    dHeightAdd: 0.2,
    dHeightReduce: 0.2,
  }]

  const ids = await DasInformerShape.RegisterShapes(shapes)
  shapeCount.value += ids.length
  console.log('[DemoDasInformerShape] 已注册 Shape IDs:', ids)

  // 停止工具
  await DasPointsTool.finishTool()
  isToolActive.value = false

  // 添加进入/离开监听（set 会覆盖同 listenerID，只保留一份）
  DasInformerShape.addShapeInsideChangedListener(LISTENER_ID, (shapeID: string, shapeName: string) => {
    const time = new Date().toLocaleTimeString()
    console.log(`[DemoDasInformerShape] 进入 shapeName=${shapeName} shapeID=${shapeID}`)
    eventLogs.value.unshift({ time, type: '进入', shapeName, shapeID })
  })

  DasInformerShape.addShapeOutsideChangedListener(LISTENER_ID, (shapeID: string, shapeName: string) => {
    const time = new Date().toLocaleTimeString()
    console.log(`[DemoDasInformerShape] 离开 shapeName=${shapeName} shapeID=${shapeID}`)
    eventLogs.value.unshift({ time, type: '离开', shapeName, shapeID })
  })
}

const onShowShapeChange = (val: boolean) => {
  DasInformerShape.ShowShape(val)
}

// 清空所有 Shape
const clearShapes = async () => {
  await DasInformerShape.ClearAllShapes()
  DasInformerShape.removeShapeInsideChangedListener(LISTENER_ID)
  DasInformerShape.removeShapeOutsideChangedListener(LISTENER_ID)
  shapeCount.value = 0
  eventLogs.value = []
  console.log('[DemoDasInformerShape] 已清空所有 Shape')
}

onBeforeUnmount(() => {
  DasInformerShape.removeShapeInsideChangedListener(LISTENER_ID)
  DasInformerShape.removeShapeOutsideChangedListener(LISTENER_ID)
})
onViewerSessionLeave(() => {
  if (isToolActive.value) return DasPointsTool.finishTool()
})
</script>

<template>
  <div>
    <div class="title">区域感应 Shape 演示</div>
    <div class="split_line"></div>

    <div class="control-group">
      <el-button
        :type="isToolActive ? 'danger' : 'primary'"
        @click="toggleTool"
        style="margin: 10px;">
        {{ isToolActive ? '停止工具' : '启动点工具' }}
      </el-button>

      <el-button
        type="success"
        @click="registerShapes"
        style="margin: 10px;">
        注册 Shape
      </el-button>

      <el-button
        type="warning"
        @click="clearShapes"
        style="margin: 10px;">
        清空 Shape
      </el-button>
    </div>

    <div class="status-panel" :class="{ active: isToolActive }">
      <p>当前状态: {{ isToolActive ? '工具已激活，点击场景添加点位' : '工具未激活' }}</p>
      <p>已注册 Shape 数量: {{ shapeCount }}</p>
    </div>

    <el-form-item label="显示调试形状" class="ruihua">
      <el-switch
        v-model="showShape"
        active-text="显示"
        inactive-text="隐藏"
        style="margin-left: 15px;"
        active-color="#E1BB82"
        @change="onShowShapeChange">
      </el-switch>
    </el-form-item>

    <div class="log-header">事件日志</div>
    <el-scrollbar class="log-scrollbar">
      <div v-if="eventLogs.length === 0" class="log-empty">暂无事件</div>
      <div
        v-for="(log, index) in eventLogs"
        :key="index"
        class="log-item"
        :class="log.type === '进入' ? 'log-inside' : 'log-outside'">
        <span class="log-time">{{ log.time }}</span>
        <span class="log-type">{{ log.type }}</span>
        <span class="log-name">{{ log.shapeName }}</span>
        <span class="log-id">ID: {{ log.shapeID }}</span>
      </div>
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
.control-group {
  margin: 15px 0;
}

.status-panel {
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.1);
  color: #e1bb82;

  &.active {
    background: rgba(225, 187, 130, 0.2);
  }

  p {
    margin: 4px 0;
  }
}

.log-header {
  color: #e1bb82;
  font-size: 13px;
  margin: 10px 10px 4px;
}

.log-scrollbar {
  height: 220px;
  margin: 0 10px;
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 4px;
  padding: 4px;
}

.log-empty {
  color: rgba(225, 187, 130, 0.4);
  font-size: 12px;
  text-align: center;
  padding: 20px 0;
}

.log-item {
  display: flex;
  gap: 8px;
  font-size: 12px;
  padding: 3px 6px;
  border-radius: 3px;
  margin-bottom: 2px;

  &.log-inside {
    color: #67c23a;
    background: rgba(103, 194, 58, 0.08);
  }

  &.log-outside {
    color: #e6a23c;
    background: rgba(230, 162, 60, 0.08);
  }
}

.log-time {
  opacity: 0.6;
  flex-shrink: 0;
}

.log-type {
  font-weight: bold;
  flex-shrink: 0;
  width: 28px;
}

.log-name {
  flex: 1;
}

.log-id {
  opacity: 0.5;
  font-size: 11px;
}
</style>
