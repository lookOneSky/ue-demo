<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { DasClipPlanes } from './lib/Scene/DasClipPlanes.js'
import { DasClipPlaneTool } from './lib/Tool/DasClipPlaneTool.js'

const tool = new DasClipPlaneTool()
const isToolActive = ref(false)
const exportMsg = ref('')
const clipEnable = ref(false)
const planeList = ref<any[]>([])
const loading = ref(false)

const syncPlanes = async () => {
  const planes = planeList.value.map(p => ({ normal: [p.nx, p.ny, p.nz], distance: p.distance }))
  await DasClipPlanes.SetClipPlanes(planes)
}

// 激活裁剪平面取点工具
const startTool = async () => {
  try {
    await tool.setToCurrent(() => { isToolActive.value = true })
  } catch (error) {
    console.error('激活取点工具失败:', error)
  }
}

// 停止裁剪平面取点工具
const stopTool = async () => {
  try {
    await tool.finishTool(() => { isToolActive.value = false })
  } catch (error) {
    console.error('停止取点工具失败:', error)
  }
}

// 清空已取的裁剪点和方向点
const clearToolPoints = async () => {
  try {
    await tool.clearPoints()
  } catch (error) {
    console.error('清空取点失败:', error)
  }
}

// 导出裁剪平面到 项目根目录/ClipPlanes/时间戳.json
const exportPlane = async () => {
  try {
    await tool.exportClipPlaneToJson((res: any) => {
      exportMsg.value = res?.result === 'Success' ? '导出成功' : '导出失败（不足2个点）'
    })
  } catch (error) {
    console.error('导出裁剪平面失败:', error)
  }
}

const removePlane = async (index: number) => {
  try {
    planeList.value.splice(index, 1)
    await syncPlanes()
  } catch (error) {
    console.error('删除裁剪平面失败:', error)
  }
}

const clearPlanes = async () => {
  try {
    await DasClipPlanes.ClearClipPlanes()
    planeList.value = []
  } catch (error) {
    console.error('清空裁剪平面失败:', error)
  }
}

const refreshPlanes = async () => {
  loading.value = true
  try {
    await DasClipPlanes.GetClipPlanes((result: any) => {
      const planes = result?.planes || []
      planeList.value = planes.map((p: any) => ({
        nx: p.normal?.[0] ?? 0,
        ny: p.normal?.[1] ?? 0,
        nz: p.normal?.[2] ?? 0,
        distance: p.distance ?? 0
      }))
      loading.value = false
    })
  } catch (error) {
    console.error('获取裁剪平面失败:', error)
    loading.value = false
  }
}

const toggleClipEnable = async () => {
  try {
    await DasClipPlanes.SetClipEnable(clipEnable.value)
  } catch (error) {
    console.error('设置裁剪开关失败:', error)
  }
}

const queryClipEnable = async () => {
  try {
    await DasClipPlanes.IsClipEnable((result: any) => {
      clipEnable.value = !!result?.bEnable
    })
  } catch (error) {
    console.error('查询裁剪开关失败:', error)
  }
}

// 卸载时停止取点工具（切换 Tab 时组件会被 v-if 卸载）
onBeforeUnmount(() => {
  if (isToolActive.value) tool.finishTool()
})
</script>

<template>
  <div>
    <div class="title">裁剪平面控制</div>
    <div class="split_line"></div>

    <div class="control-group">
      <el-switch
        v-model="clipEnable"
        active-text="开启裁剪"
        inactive-text="关闭裁剪"
        active-color="#E1BB82"
        @change="toggleClipEnable">
      </el-switch>
      <el-button type="info" @click="queryClipEnable" style="margin: 10px;">查询开关状态</el-button>
    </div>

    <div class="control-group">
      <el-button
        :type="isToolActive ? 'danger' : 'primary'"
        @click="isToolActive ? stopTool() : startTool()"
        style="margin: 10px;">
        {{ isToolActive ? '停止取点工具' : '激活取点工具' }}
      </el-button>
      <el-button type="info" @click="clearToolPoints" style="margin: 10px;">清空取点</el-button>
      <el-button type="success" @click="exportPlane" style="margin: 10px;">导出JSON</el-button>
    </div>

    <div class="control-group">
      <el-button type="warning" @click="clearPlanes" style="margin: 10px;">清空所有平面</el-button>
      <el-button :loading="loading" @click="refreshPlanes" style="margin: 10px;">刷新列表</el-button>
    </div>

    <div v-if="planeList.length > 0" class="points-panel">
      <p>裁剪平面列表：</p>
      <div v-for="(p, i) in planeList" :key="i" class="point-item">
        <span>{{ i + 1 }}. 法线：({{ p.nx }}, {{ p.ny }}, {{ p.nz }})　距离：{{ p.distance }}</span>
        <el-button type="danger" text size="small" @click="removePlane(i)">删除</el-button>
      </div>
    </div>

    <div class="status-panel" :class="{ active: clipEnable }">
      <p>裁剪开关：{{ clipEnable ? '已开启' : '已关闭' }}</p>
      <p>平面数量：{{ planeList.length }}</p>
      <p>取点工具：{{ isToolActive ? '已激活（左键第1点裁剪点，第2点方向点，第3次重取）' : '未激活' }}</p>
      <p v-if="exportMsg">导出结果：{{ exportMsg }}</p>
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
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
