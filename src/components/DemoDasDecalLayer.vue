<script setup lang="ts">
import { requestUE } from '../utils/demoRpc.js'
import { onViewerSessionLeave } from '../utils/onViewerSessionLeave'
import { ref, reactive } from 'vue'
import { DasDecalLayer } from "./lib/Layer/DasDecalLayer.js"
import { DasPolylineTool } from "./lib/Tool/DasPolylineTool.js"
import { ElMessage } from 'element-plus'

// 当前贴花图层
const currentDecalLayer = ref<any>(null)
const createdLayers = new Set<DasDecalLayer>()

const isDrawMode = ref(false)
const uploadedImageBase64 = ref<string>('')
const imagePreview = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)

// 贴花参数
const decalParams = reactive({
  distance: 8000.0,
  point1: [] as Array<number>,
  point2: [] as Array<number>
})

// 启动绘制工具
const startDrawTool = async () => {
  try {
    // 清空之前的点
    await requestUE(DasPolylineTool.className, 'clearPoints')

    // 设置线条样式
    await DasPolylineTool.setLineColor([1, 0, 0, 1]) // 红色
    await DasPolylineTool.setLineThickness(2, true)
    await DasPolylineTool.setLineVisible(true)

    // 设置为当前工具
    await requestUE(DasPolylineTool.className, 'setToCurrent')

    isDrawMode.value = true
    ElMessage.success('绘制模式已启动，在场景中绘制矩形区域（需要2个点）')
    console.log('绘制工具已启动')
  } catch (error) {
    console.error('启动绘制工具失败:', error)
    ElMessage.error('启动绘制工具失败')
  }
}

// 停止绘制工具
const stopDrawTool = async () => {
  try {
    await requestUE(DasPolylineTool.className, 'finishTool')
    isDrawMode.value = false
    console.log('绘制工具已停止')
  } catch (error) {
    console.error('停止绘制工具失败:', error)
  }
}

// 从绘制的点创建贴花图层
const createFromDrawnPoints = async () => {
  try {
    // 检查是否有点
    const hasPoints = await DasPolylineTool.hasPoints()
    if (!hasPoints) {
      ElMessage.warning('请先在场景中绘制矩形区域（至少2个点）')
      return
    }

    // 获取绘制的点
    const points = await DasPolylineTool.getPointsLLH()
    console.log('获取到的点:', points)

    if (points.length < 2) {
      ElMessage.warning('需要至少2个点来定义矩形区域')
      return
    }

    // 使用前两个点作为对角点
    decalParams.point1 = points[0]
    decalParams.point2 = points[1]

    // 创建贴花图层
    const params: any = {
      param: {
        point1: decalParams.point1,
        point2: decalParams.point2,
        distance: decalParams.distance
      }
    }

    // 如果有上传的图片，使用Base64数据
    if (uploadedImageBase64.value) {
      params.param.base64Data = uploadedImageBase64.value
    }

    const decalLayer = await DasDecalLayer.createInstance(params)
    if (!decalLayer?.id) throw new Error('UE 未返回新建图层的 ID')
    createdLayers.add(decalLayer)
    currentDecalLayer.value = decalLayer

    // 停止绘制模式
    await stopDrawTool()

    ElMessage.success('贴花图层创建成功')
    console.log('贴花图层创建成功:', decalLayer)
    console.log('点1:', decalParams.point1)
    console.log('点2:', decalParams.point2)
  } catch (error) {
    console.error('创建贴花图层失败:', error)
    ElMessage.error('创建贴花图层失败')
  }
}

// 触发文件选择
const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

// 上传图片
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 读取文件并转换为Base64
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    // 移除data:image/...;base64,前缀，只保留Base64数据
    const base64Data = result.split(',')[1]
    uploadedImageBase64.value = base64Data
    imagePreview.value = result // 用于预览的完整data URL

    ElMessage.success(`图片已加载: ${file.name}`)
    console.log('图片Base64长度:', base64Data.length)
  }
  reader.onerror = () => {
    ElMessage.error('读取图片失败')
  }
  reader.readAsDataURL(file)
}

// 更新贴花纹理（使用Base64）
const updateDecalTexture = async () => {
  try {
    if (!currentDecalLayer.value) {
      ElMessage.warning('请先创建贴花图层')
      return
    }

    if (!uploadedImageBase64.value) {
      ElMessage.warning('请先上传图片')
      return
    }

    await currentDecalLayer.value.setTextureFromBase64(uploadedImageBase64.value)
    ElMessage.success('贴花纹理已更新')
    console.log('贴花纹理已更新')
  } catch (error) {
    console.error('更新贴花纹理失败:', error)
    ElMessage.error('更新贴花纹理失败')
  }
}

// 更新投影距离
const updateDistance = async () => {
  try {
    if (!currentDecalLayer.value) return

    await currentDecalLayer.value.setProjectionDistance(decalParams.distance)
    ElMessage.success(`投影距离已更新: ${decalParams.distance}米`)
    console.log('投影距离已更新:', decalParams.distance)
  } catch (error) {
    console.error('更新投影距离失败:', error)
    ElMessage.error('更新投影距离失败')
  }
}

// 定位到贴花
const locateDecal = async () => {
  try {
    if (!currentDecalLayer.value) {
      ElMessage.warning('请先创建贴花图层')
      return
    }

    await currentDecalLayer.value.flyToThis()
    ElMessage.success('已定位到贴花')
    console.log('已定位到贴花')
  } catch (error) {
    console.error('定位贴花失败:', error)
    ElMessage.error('定位贴花失败')
  }
}

// 获取贴花数据
const getDecalData = async () => {
  try {
    if (!currentDecalLayer.value) {
      ElMessage.warning('请先创建贴花图层')
      return
    }

    const allData = await currentDecalLayer.value.getAll()
    console.log('贴花所有参数:', allData)

    const points = await currentDecalLayer.value.getCornerPointsLLH()
    console.log('对角点坐标:', points)

    const distance = await currentDecalLayer.value.getProjectionDistance()
    console.log('投影距离:', distance)

    ElMessage.info('数据已输出到控制台')
  } catch (error) {
    console.error('获取贴花数据失败:', error)
    ElMessage.error('获取贴花数据失败')
  }
}

// 清空所有
const clearAll = async () => {
  try {
    // 停止绘制模式
    if (isDrawMode.value) {
      await stopDrawTool()
    }

    for (const layer of [...createdLayers].reverse()) {
      await requestUE(layer.className, 'removeInstance', { id: layer.id })
      createdLayers.delete(layer)
    }

    // 清空工具点
    await requestUE(DasPolylineTool.className, 'clearPoints')

    // 重置状态
    currentDecalLayer.value = null
    decalParams.point1 = []
    decalParams.point2 = []
    uploadedImageBase64.value = ''
    imagePreview.value = ''

    ElMessage.success('已清空所有内容')
    console.log('已清空所有内容')
  } catch (error) {
    console.error('清空失败:', error)
    ElMessage.error('清空失败')
  }
}
onViewerSessionLeave(() => {
  if (isDrawMode.value) return requestUE(DasPolylineTool.className, 'finishTool')
})
</script>

<template>
  <div>
    <div class="title">贴花图层控制</div>
    <div class="split_line"></div>

    <!-- 创建流程控制 -->
    <div class="control-group">
      <h4 class="section-title">创建流程</h4>

      <!-- 第一步：上传图片 -->
      <div class="step-section">
        <span class="step-label">1. 上传图片:</span>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          style="display: none;">
        <el-button type="primary" size="small" @click="triggerFileSelect">
          选择图片
        </el-button>
        <span class="step-status" v-if="uploadedImageBase64">✓ 已上传</span>
      </div>

      <!-- 图片预览 -->
      <div v-if="imagePreview" class="image-preview">
        <img :src="imagePreview" alt="预览图" />
      </div>

      <!-- 第二步：绘制区域 -->
      <div class="step-section">
        <span class="step-label">2. 绘制区域:</span>
        <el-button
          :type="isDrawMode ? 'danger' : 'success'"
          @click="isDrawMode ? stopDrawTool() : startDrawTool()"
          size="small">
          {{ isDrawMode ? '停止绘制' : '开始绘制' }}
        </el-button>
        <span class="step-hint" v-if="isDrawMode">在场景中点击2个点定义矩形区域</span>
      </div>

      <!-- 第三步：创建贴花 -->
      <div class="step-section">
        <span class="step-label">3. 创建贴花:</span>
        <el-button
          type="success"
          @click="createFromDrawnPoints"
          :disabled="!isDrawMode"
          size="small">
          创建图层
        </el-button>
        <span class="step-status" v-if="currentDecalLayer">✓ 已创建</span>
      </div>
    </div>

    <!-- 贴花参数设置 -->
    <div class="params-group">
      <h4 class="section-title">贴花参数</h4>

      <el-form-item label="投影距离(米)" class="ruihua">
        <el-input-number
          v-model="decalParams.distance"
          :step="100"
          :min="100"
          :max="50000"
          style="width: 200px;"
          @change="updateDistance">
        </el-input-number>
      </el-form-item>

      <el-form-item label="点1坐标" class="ruihua" v-if="decalParams.point1.length > 0">
        <el-input
          :value="`[${decalParams.point1.map(v => v.toFixed(6)).join(', ')}]`"
          readonly
          style="width: 400px;">
        </el-input>
      </el-form-item>

      <el-form-item label="点2坐标" class="ruihua" v-if="decalParams.point2.length > 0">
        <el-input
          :value="`[${decalParams.point2.map(v => v.toFixed(6)).join(', ')}]`"
          readonly
          style="width: 400px;">
        </el-input>
      </el-form-item>
    </div>

    <!-- 操作控制 -->
    <div class="operation-control">
      <h4 class="section-title">操作控制</h4>

      <el-button
        type="primary"
        @click="updateDecalTexture"
        :disabled="!currentDecalLayer || !uploadedImageBase64"
        style="margin: 10px;">
        更新贴花纹理
      </el-button>

      <el-button
        type="primary"
        @click="locateDecal"
        :disabled="!currentDecalLayer"
        style="margin: 10px;">
        定位贴花
      </el-button>

      <el-button
        type="info"
        @click="getDecalData"
        :disabled="!currentDecalLayer"
        style="margin: 10px;">
        调试数据
      </el-button>

      <el-button
        type="danger"
        @click="clearAll"
        style="margin: 10px;">
        清空本示例
      </el-button>
    </div>

    <!-- 状态提示 -->
    <div class="status-panel">
      <p>图片状态: {{ uploadedImageBase64 ? '已上传' : '未上传' }}</p>
      <p>贴花状态: {{ currentDecalLayer ? '已创建' : '未创建' }}</p>
      <p>绘制模式: {{ isDrawMode ? '绘制中' : '未开始' }}</p>
      <p>投影距离: {{ decalParams.distance }}米</p>
    </div>

    <!-- 使用说明 -->
    <div class="help-panel">
      <h4 class="section-title">使用说明</h4>
      <ol>
        <li>点击"选择图片"上传需要投影的图片（支持jpg、png等格式）</li>
        <li>点击"开始绘制"启动绘制工具</li>
        <li>在场景中点击2个点定义贴花的矩形区域（对角点）</li>
        <li>点击"创建图层"生成贴花图层</li>
        <li>可以调整投影距离参数</li>
        <li>可以重新上传图片并点击"更新贴花纹理"来更换贴花内容</li>
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

.image-preview {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid rgba(225, 187, 130, 0.3);
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.2);
  text-align: center;

  img {
    max-width: 300px;
    max-height: 300px;
    object-fit: contain;
    border-radius: 5px;
  }
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
</style>
