<script setup lang="ts">
import { ref } from 'vue'
import { DasSpline } from "./lib/Layer/DasSplineLayer.js"
import { DasGroupLayer } from "./lib/Layer/DasGroupLayer.js"
import { DasPointEditTool } from "./lib/Tool/DasPointEditTool.js"
import { DasSplineWalk } from "./lib/Tool/DasSplineWalk.js"

const currentSplineLayer = ref<any>(null)
const isEditMode = ref(false)
const isSplineBound = ref(false)
const isMoving = ref(false)
const walkSpeed = ref(100)
const actionMessage = ref('请先创建样条线')

const createSplineLayer = async () => {
  try {
    if (isMoving.value) {
      await stopMove()
    }

    if (isEditMode.value) {
      await stopEditTool()
    }

    const splineLayer = await DasSpline.createInstance({
      param: {
        lineWidth: 50,
        points: []
      }
    })

    currentSplineLayer.value = splineLayer
    isSplineBound.value = false
    actionMessage.value = '样条线图层已创建，可进入编辑'
    console.log('样条行走 Demo 创建样条线成功:', splineLayer)
  } catch (error) {
    console.error('创建样条线图层失败:', error)
    actionMessage.value = '创建样条线失败'
  }
}

const startEditTool = async () => {
  try {
    if (!currentSplineLayer.value) {
      console.warn('请先创建样条线图层')
      actionMessage.value = '请先创建样条线'
      return
    }

    if (isMoving.value) {
      await stopMove()
    }

    await DasPointEditTool.editLayer(currentSplineLayer.value)
    await DasPointEditTool.setToCurrent()

    isEditMode.value = true
    isSplineBound.value = false
    actionMessage.value = '点编辑工具已启动，请在场景中编辑样条点位'
    console.log('样条行走 Demo 点编辑工具已启动')
  } catch (error) {
    console.error('启动编辑工具失败:', error)
    actionMessage.value = '启动编辑工具失败'
  }
}

const stopEditTool = async () => {
  try {
    await DasPointEditTool.finishTool()
    isEditMode.value = false
    actionMessage.value = '点编辑工具已停止'
    console.log('样条行走 Demo 点编辑工具已停止')
  } catch (error) {
    console.error('停止编辑工具失败:', error)
    actionMessage.value = '停止编辑工具失败'
  }
}

const bindSpline = async () => {
  try {
    if (!currentSplineLayer.value) {
      console.warn('请先创建样条线图层')
      actionMessage.value = '请先创建样条线'
      return false
    }

    if (isMoving.value) {
      await stopMove()
    }

    await DasSplineWalk.setSplineActorByLayer(currentSplineLayer.value)
    isSplineBound.value = true
    actionMessage.value = '当前样条线已绑定到 DasSplineWalk'
    console.log('样条行走 Demo 样条绑定成功:', currentSplineLayer.value.id)
    return true
  } catch (error) {
    console.error('绑定样条线失败:', error)
    actionMessage.value = '绑定样条线失败'
    return false
  }
}

const updateSpeed = async () => {
  try {
    await DasSplineWalk.setSpeed(walkSpeed.value)
    actionMessage.value = `移动速度已更新为 ${walkSpeed.value}`
    console.log('样条行走 Demo 速度已更新:', walkSpeed.value)
  } catch (error) {
    console.error('更新移动速度失败:', error)
    actionMessage.value = '更新移动速度失败'
  }
}

const startMove = async () => {
  try {
    if (!currentSplineLayer.value) {
      console.warn('请先创建样条线图层')
      actionMessage.value = '请先创建样条线'
      return
    }

    if (isEditMode.value) {
      await stopEditTool()
    }

    if (!isSplineBound.value) {
      const bindResult = await bindSpline()
      if (!bindResult) {
        return
      }
    }

    await DasSplineWalk.setSpeed(walkSpeed.value)
    await DasSplineWalk.setEnableAutoMove(true)
    isMoving.value = true
    actionMessage.value = '样条自动移动已开始'
    console.log('样条行走 Demo 已开始自动移动')
  } catch (error) {
    console.error('开始自动移动失败:', error)
    actionMessage.value = '开始自动移动失败'
  }
}

const stopMove = async () => {
  try {
    await DasSplineWalk.setEnableAutoMove(false)
    isMoving.value = false
    actionMessage.value = '样条自动移动已停止'
    console.log('样条行走 Demo 已停止自动移动')
  } catch (error) {
    console.error('停止自动移动失败:', error)
    actionMessage.value = '停止自动移动失败'
  }
}

const locateSpline = async () => {
  try {
    if (!currentSplineLayer.value) {
      console.warn('请先创建样条线图层')
      actionMessage.value = '请先创建样条线'
      return
    }

    await currentSplineLayer.value.flyToThis()
    actionMessage.value = '已定位到当前样条线'
  } catch (error) {
    console.error('定位样条线失败:', error)
    actionMessage.value = '定位样条线失败'
  }
}

const clearAll = async () => {
  try {
    if (isMoving.value) {
      await stopMove()
    }

    if (isEditMode.value) {
      await stopEditTool()
    }

    const pRoot = await DasGroupLayer.getRoot()
    await pRoot.removeAllLayer()

    currentSplineLayer.value = null
    isSplineBound.value = false
    isMoving.value = false
    isEditMode.value = false
    walkSpeed.value = 100
    actionMessage.value = '已清空当前 Demo 创建内容'
    console.log('样条行走 Demo 已清空')
  } catch (error) {
    console.error('清空失败:', error)
    actionMessage.value = '清空失败'
  }
}
</script>

<template>
  <div>
    <div class="title">样条行走控制</div>
    <div class="split_line"></div>

    <div class="control-group">
      <h4 class="section-title">创建流程</h4>

      <div class="step-section">
        <span class="step-label">1. 创建样条线:</span>
        <el-button type="success" size="small" @click="createSplineLayer">
          创建图层
        </el-button>
        <span v-if="currentSplineLayer" class="step-status">✓ 已创建</span>
      </div>

      <div class="step-section">
        <span class="step-label">2. 编辑当前样条:</span>
        <el-button
          :type="isEditMode ? 'danger' : 'primary'"
          :disabled="!currentSplineLayer"
          size="small"
          @click="isEditMode ? stopEditTool() : startEditTool()"
        >
          {{ isEditMode ? '停止编辑' : '开始编辑' }}
        </el-button>
        <span v-if="isEditMode" class="step-hint">点击场景编辑样条点位</span>
      </div>

      <div class="step-section">
        <span class="step-label">3. 绑定到行走器:</span>
        <el-button
          type="warning"
          :disabled="!currentSplineLayer"
          size="small"
          @click="bindSpline"
        >
          绑定样条
        </el-button>
        <span v-if="isSplineBound" class="step-status">✓ 已绑定</span>
      </div>

      <div class="step-section">
        <span class="step-label">4. 开始移动:</span>
        <el-button
          :type="isMoving ? 'danger' : 'primary'"
          :disabled="!currentSplineLayer"
          size="small"
          @click="isMoving ? stopMove() : startMove()"
        >
          {{ isMoving ? '停止移动' : '开始移动' }}
        </el-button>
        <span v-if="isMoving" class="step-hint">当前正在沿样条自动移动</span>
      </div>
    </div>

    <div class="params-group">
      <h4 class="section-title">移动参数</h4>

      <el-form-item label="移动速度" class="ruihua">
        <el-input-number
          v-model="walkSpeed"
          :min="1"
          :step="10"
          style="width: 220px;"
          @change="updateSpeed"
        />
      </el-form-item>
    </div>

    <div class="operation-control">
      <h4 class="section-title">操作控制</h4>

      <el-button
        type="primary"
        :disabled="!currentSplineLayer"
        style="margin: 10px;"
        @click="locateSpline"
      >
        定位样条线
      </el-button>

      <el-button
        type="danger"
        style="margin: 10px;"
        @click="clearAll"
      >
        清空全部
      </el-button>
    </div>

    <div class="status-panel">
      <p>样条状态: {{ currentSplineLayer ? '已创建' : '未创建' }}</p>
      <p>编辑状态: {{ isEditMode ? '编辑中' : '未编辑' }}</p>
      <p>绑定状态: {{ isSplineBound ? '已绑定' : '未绑定' }}</p>
      <p>移动状态: {{ isMoving ? '移动中' : '未移动' }}</p>
      <p>当前速度: {{ walkSpeed }}</p>
      <p>操作提示: {{ actionMessage }}</p>
    </div>

    <div class="help-panel">
      <h4 class="section-title">使用说明</h4>
      <ol>
        <li>点击“创建图层”生成样条线图层</li>
        <li>点击“开始编辑”在场景中修改样条点位</li>
        <li>点击“绑定样条”将当前样条设置给 DasSplineWalk</li>
        <li>设置速度后点击“开始移动”沿样条自动行走</li>
        <li>结束后可停止移动、继续编辑或直接清空全部</li>
      </ol>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .params-group, .operation-control {
  margin: 15px 0;
  padding: 15px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
}

.section-title {
  color: #E1BB82;
  margin: 0 0 15px 0;
  font-size: 16px;
  border-bottom: 1px solid #E1BB82;
  padding-bottom: 5px;
}

.step-section {
  margin: 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.step-label {
  color: #E1BB82;
  min-width: 120px;
  font-weight: 500;
}

.step-status {
  color: #67c23a;
  font-size: 13px;
}

.step-hint {
  color: #909399;
  font-size: 13px;
}

.status-panel, .help-panel {
  margin: 15px 0;
  padding: 15px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  color: #E1BB82;
}

.help-panel ol {
  margin: 0;
  padding-left: 18px;
}
</style>
