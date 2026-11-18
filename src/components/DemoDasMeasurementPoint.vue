<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { DasToolMeasurementPoint } from './lib/Tool/DasToolMeasurementPoint.js'

const tool = new DasToolMeasurementPoint()
const isToolActive = ref(false)
const currentPoint = ref<any>(null)
const pointsList = ref<any[]>([])

onMounted(() => {
  tool.addCallBack((obj: any) => {
    currentPoint.value = obj
  })
})

onBeforeUnmount(() => {
  tool.removeCallBack()
})

const startTool = async () => {
  await tool.setToCurrent(() => {
    isToolActive.value = true
  })
}

const stopTool = async () => {
  await tool.finishTool(() => {
    isToolActive.value = false
  })
}

const getPoints = async () => {
  await tool.getPointsLLH((result: any) => {
    pointsList.value = result?.measurementPointsLLH || []
  })
}

const clearPoints = async () => {
  await tool.clearAllPoints(() => {
    pointsList.value = []
    currentPoint.value = null
  })
}
</script>

<template>
  <div>
    <div class="title">点位测量</div>
    <div class="split_line"></div>

    <div class="control-group">
      <el-button
        :type="isToolActive ? 'danger' : 'primary'"
        @click="isToolActive ? stopTool() : startTool()"
        style="margin: 10px;">
        {{ isToolActive ? '停止工具' : '激活工具' }}
      </el-button>
      <el-button type="info" @click="getPoints" style="margin: 10px;">获取点列表</el-button>
      <el-button type="warning" @click="clearPoints" style="margin: 10px;">清空点</el-button>
    </div>

    <div class="status-panel" :class="{ active: isToolActive }">
      <p>状态：{{ isToolActive ? '已激活（左键拾取点）' : '未激活' }}</p>
      <template v-if="currentPoint && currentPoint.longitude !== 0">
        <p>当前点：</p>
        <p>经度：{{ currentPoint.longitude }}</p>
        <p>纬度：{{ currentPoint.latitude }}</p>
        <p>高度：{{ currentPoint.height }}</p>
      </template>
    </div>

    <div v-if="pointsList.length > 0" class="points-panel">
      <p>已拾取点（{{ pointsList.length }}）：</p>
      <div v-for="(pt, i) in pointsList" :key="i" class="point-item">
        <span>{{ i + 1 }}. 经：{{ pt.longitude.toFixed(6) }}  纬：{{ pt.latitude.toFixed(6) }}  高：{{ pt.height.toFixed(2) }}</span>
      </div>
    </div>
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
}

.points-panel {
  padding: 10px;
  margin: 10px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
  color: #e1bb82;
  max-height: 200px;
  overflow-y: auto;

  .point-item {
    font-size: 12px;
    margin: 4px 0;
  }
}
</style>
