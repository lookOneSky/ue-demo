<script setup lang="ts">
import { ref, reactive } from 'vue'
import { DasSpline } from "./lib/Layer/DasSplineLayer.js"
import { DasPointEditTool } from "./lib/Tool/DasPointEditTool.js"
import { DasGroupLayer } from "./lib/Layer/DasGroupLayer.js"

// 当前样条线图层
const currentSplineLayer = ref<any>(null)
const isEditMode = ref(false)

// 预定义的样条线配置
const splineConfigs = [
  {
    name: '神道',
    meshName: 'Shendao',
    defaultWidth: 500,
    color: '#808080'
  }
]

// 样条线参数
const splineParams = reactive({
  selectedConfig: splineConfigs[0],
  lineWidth: 500,
  points: [] as Array<{x: number, y: number, z: number}>
})

// 创建样条线图层
const createSplineLayer = async () => {
  try {
    const params = {
      param: {
        meshName: splineParams.selectedConfig.meshName,
        lineWidth: splineParams.lineWidth,
        points: splineParams.points
      }
    }
    
    const splineLayer = await DasSpline.createInstance(params)
    currentSplineLayer.value = splineLayer
    
    console.log('样条线图层创建成功:', splineLayer)
    console.log('配置:', splineParams.selectedConfig.name)
  } catch (error) {
    console.error('创建样条线图层失败:', error)
  }
}

// 启动编辑工具
const startEditTool = async () => {
  try {
    if (!currentSplineLayer.value) {
      console.warn('请先创建样条线图层')
      return
    }
    
    // 设置编辑图层
    await DasPointEditTool.editLayer(currentSplineLayer.value)
    
    // 设置为当前工具
    await DasPointEditTool.setToCurrent()
    
    isEditMode.value = true
    console.log('点编辑工具已启动')
  } catch (error) {
    console.error('启动编辑工具失败:', error)
  }
}

// 停止编辑工具
const stopEditTool = async () => {
  try {
    // 这里可以添加停止编辑工具的逻辑
    isEditMode.value = false
    DasPointEditTool.finishTool()
    console.log('点编辑工具已停止')
  } catch (error) {
    console.error('停止编辑工具失败:', error)
  }
}

// 更新线宽
const updateLineWidth = async () => {
  try {
    if (!currentSplineLayer.value) return
    
    await currentSplineLayer.value.setLineWidth(splineParams.lineWidth)
    console.log('线宽已更新:', splineParams.lineWidth)
  } catch (error) {
    console.error('更新线宽失败:', error)
  }
}

// 更新网格名称
const updateMeshName = async () => {
  try {
    if (!currentSplineLayer.value) return
    
    await currentSplineLayer.value.setMeshName(splineParams.selectedConfig.meshName)
    console.log('网格名称已更新:', splineParams.selectedConfig.meshName)
  } catch (error) {
    console.error('更新网格名称失败:', error)
  }
}

// 配置改变时的处理
const onConfigChange = () => {
  splineParams.lineWidth = splineParams.selectedConfig.defaultWidth
  updateMeshName()
}

// 定位到样条线
const locateSpline = async () => {
  try {
    if (!currentSplineLayer.value) {
      console.warn('请先创建样条线图层')
      return
    }
    
    await currentSplineLayer.value.flyToThis()
    console.log('已定位到样条线')
  } catch (error) {
    console.error('定位样条线失败:', error)
  }
}

// 获取样条线数据
const getSplineData = async () => {
  try {
    if (!currentSplineLayer.value) {
      console.warn('请先创建样条线图层')
      return
    }
    
    const allData = await currentSplineLayer.value.getAll()
    console.log('样条线所有参数:', allData)
    
    const points = await currentSplineLayer.value.getPoints()
    console.log('当前点坐标:', points)
    
    const meshName = await currentSplineLayer.value.getMeshName()
    console.log('网格名称:', meshName)
    
    const lineWidth = await currentSplineLayer.value.getLineWidth()
    console.log('线宽:', lineWidth)
  } catch (error) {
    console.error('获取样条线数据失败:', error)
  }
}

// 清空所有
const clearAll = async () => {
  try {
    // 停止编辑模式
    if (isEditMode.value) {
      await stopEditTool()
    }
    
    // 删除所有图层
    const pRoot = await DasGroupLayer.getRoot()
    await pRoot.removeAllLayer()
    
    // 重置状态
    currentSplineLayer.value = null
    splineParams.points = []
    
    console.log('已清空所有内容')
  } catch (error) {
    console.error('清空失败:', error)
  }
}
</script>

<template>
  <div>
    <div class="title">样条线图层控制</div>
    <div class="split_line"></div>

    <!-- 创建流程控制 -->
    <div class="control-group">
      <h4 class="section-title">创建流程</h4>
      
      <!-- 第一步：选择配置并创建 -->
      <div class="step-section">
        <span class="step-label">1. 创建样条线:</span>
        <el-button 
          type="success" 
          @click="createSplineLayer" 
          size="small">
          创建图层
        </el-button>
        <span class="step-status" v-if="currentSplineLayer">✓ 已创建</span>
      </div>
      
      <!-- 第二步：启动编辑工具 -->
      <div class="step-section">
        <span class="step-label">2. 编辑点位:</span>
        <el-button 
          :type="isEditMode ? 'danger' : 'primary'" 
          @click="isEditMode ? stopEditTool() : startEditTool()"
          :disabled="!currentSplineLayer"
          size="small">
          {{ isEditMode ? '停止编辑' : '开始编辑' }}
        </el-button>
        <span class="step-hint" v-if="isEditMode">点击场景编辑样条线点位</span>
      </div>
    </div>

    <!-- 样条线参数设置 -->
    <div class="params-group">
      <h4 class="section-title">样条线参数</h4>
      
      <el-form-item label="样条线类型" class="ruihua">
        <el-select 
          v-model="splineParams.selectedConfig" 
          @change="onConfigChange"
          placeholder="选择样条线类型"
          style="width: 200px;">
          <el-option
            v-for="config in splineConfigs"
            :key="config.name"
            :label="config.name"
            :value="config"
            :style="{ color: config.color }">
            <span :style="{ color: config.color }">{{ config.name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="线宽度(cm)" class="ruihua">
        <el-input-number 
          v-model="splineParams.lineWidth" 
          placeholder="输入线宽度"
          :step="10"
          style="width: 200px;"
          @change="updateLineWidth">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="网格名称" class="ruihua">
        <el-input 
          :value="splineParams.selectedConfig.meshName"
          readonly
          style="width: 300px;">
        </el-input>
      </el-form-item>
    </div>

    <!-- 操作控制 -->
    <div class="operation-control">
      <h4 class="section-title">操作控制</h4>
      
      <el-button 
        type="primary" 
        @click="locateSpline"
        :disabled="!currentSplineLayer"
        style="margin: 10px;">
        定位样条线
      </el-button>
      
      <el-button 
        type="info" 
        @click="getSplineData"
        :disabled="!currentSplineLayer"
        style="margin: 10px;">
        调试数据
      </el-button>
      
      <el-button 
        type="danger" 
        @click="clearAll"
        style="margin: 10px;">
        清空所有
      </el-button>
    </div>

    <!-- 状态提示 -->
    <div class="status-panel">
      <p>样条线状态: {{ currentSplineLayer ? '已创建' : '未创建' }}</p>
      <p>编辑模式: {{ isEditMode ? '编辑中' : '未开始' }}</p>
      <p>当前配置: {{ splineParams.selectedConfig.name }}</p>
      <p>线宽设置: {{ splineParams.lineWidth }}cm</p>
    </div>

    <!-- 使用说明 -->
    <div class="help-panel">
      <h4 class="section-title">使用说明</h4>
      <ol>
        <li>选择样条线类型并设置参数</li>
        <li>点击"创建图层"按钮创建样条线图层</li>
        <li>点击"开始编辑"启动点编辑工具</li>
        <li>在场景中点击添加或编辑样条线点位</li>
        <li>调整线宽度参数实时更新样条线外观</li>
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
}

.step-label {
  color: #E1BB82;
  width: 120px;
  font-size: 14px;
}

.step-hint {
  color: #999;
  font-size: 12px;
  margin-left: 10px;
}

.step-status {
  color: #67C23A;
  font-size: 14px;
  margin-left: 10px;
}

.status-panel, .help-panel {
  padding: 15px;
  margin: 15px 0;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.1);
  color: #e1bb82;
  
  p {
    margin: 5px 0;
    font-size: 14px;
  }
  
  ol {
    margin: 10px 0;
    padding-left: 20px;
    
    li {
      margin: 5px 0;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}

:deep(.el-form-item) {
  margin-bottom: 15px;
}

:deep(.el-select .el-input__inner) {
  color: #E1BB82;
}
</style> 