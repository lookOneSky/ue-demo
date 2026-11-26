<script setup lang="ts">
import { requestUE } from '../utils/demoRpc.js'
import { onViewerSessionLeave } from '../utils/onViewerSessionLeave'
import { ref } from 'vue'
import { DasPointEditTool } from './lib/Tool/DasPointEditTool.js'
import { DasFitLookPolygonLayer } from './lib/Layer/DasFitLookPolygonLayer.js'

// 工具状态
const isToolActive = ref(false)

// 图层状态
const layerVisible = ref(true)
const currentLayerId = ref('')
const currentLayer = ref<any>(null)

// 图层参数
const layerParams = ref({
  color: [1.0, 1.0, 1.0, 1.0],
  fitLook: false,
  lookHeight: 2.0,
  backDistanceOnFitLook: 2.0,   // 立面后撤距离，单位米
  useCameraCalNormal: true,     // 相机校准面法线朝向
  texturePath: 'D:\\data\\texture\\Volume.png',
  unitUV2World: 100.0
})

// 组装图层全量参数
const buildLayerConfig = () => ({
  color: layerParams.value.color,
  fitLook: layerParams.value.fitLook,
  lookHeight: layerParams.value.lookHeight,
  backDistanceOnFitLook: layerParams.value.backDistanceOnFitLook,
  useCameraCalNormal: layerParams.value.useCameraCalNormal,
  texturePath: layerParams.value.texturePath,
  unitUV2World: layerParams.value.unitUV2World
})

// 启动工具（绘制新点）
const startTool = async () => {
  await requestUE(DasPointEditTool.className, 'setToCurrent')
  isToolActive.value = true
}

// 停止工具
const stopTool = async () => {
  await requestUE(DasPointEditTool.className, 'finishTool')
  isToolActive.value = false
}

// 创建图层
const createLayer = async () => {
  const points = await DasPointEditTool.getPointsLLH()
  if (isToolActive.value) await stopTool()
  const param = { ...buildLayerConfig(), points }
  const result = await DasFitLookPolygonLayer.createInstance({ param })
  if (result?.id) {
    currentLayer.value = result
    currentLayerId.value = result.id
    layerVisible.value = true
  }
}

// 编辑图层（把图层点位载回工具）
const editLayer = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setUseCameraCalNormal(layerParams.value.useCameraCalNormal)
  await requestUE(DasPointEditTool.className, 'editLayer', { layer: currentLayer.value.writeObjectInfo() })
  await requestUE(DasPointEditTool.className, 'setToCurrent')
  isToolActive.value = true
}

// 复制当前图层（顶点与属性取自当前图层）
const copyLayer = async () => {
  if (!currentLayer.value) return
  const all = await currentLayer.value.getAll()
  await DasFitLookPolygonLayer.createInstance({ param: all })
}

// 定位图层
const locateLayer = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.flyToThis()
}

// 显隐图层
const toggleLayerVisibility = async () => {
  if (!currentLayer.value) return
  const visible = !layerVisible.value
  await requestUE(currentLayer.value.className, 'setVisible', { id: currentLayer.value.id, visible })
  layerVisible.value = visible
}

// 删除图层
const deleteLayer = async () => {
  if (!currentLayer.value) return
  if (isToolActive.value) await stopTool()
  await requestUE(currentLayer.value.className, 'removeInstance', { id: currentLayer.value.id })
  currentLayerId.value = ''
  currentLayer.value = null
}

// 更新颜色
const updateColor = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setColor(layerParams.value.color)
}

// 更新立面贴附
const updateFitLook = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setFitLook(layerParams.value.fitLook)
}

// 更新立面厚度
const updateLookHeight = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setLookHeight(layerParams.value.lookHeight)
}

// 更新立面后撤距离
const updateBackDistance = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setBackDistanceOnFitLook(layerParams.value.backDistanceOnFitLook)
}

// 更新相机校准法线
const updateUseCameraCalNormal = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setUseCameraCalNormal(layerParams.value.useCameraCalNormal)
}

// 更新纹理
const updateTexture = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setTexture(layerParams.value.texturePath)
}

// 更新UV世界长度
const updateUnitUV2World = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setUnitUV2World(layerParams.value.unitUV2World)
}

// 批量更新图层属性
const updateAll = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.updateAll(buildLayerConfig())
}
onViewerSessionLeave(() => {
  if (isToolActive.value) return requestUE(DasPointEditTool.className, 'finishTool')
})
</script>

<template>
  <div>
    <div class="title">立面多边形图层控制</div>
    <div class="split_line"></div>

    <!-- 工具控制 -->
    <div class="control-group">
      <el-button
        :type="isToolActive ? 'danger' : 'primary'"
        @click="isToolActive ? stopTool() : startTool()"
        style="margin: 10px;">
        {{ isToolActive ? '停止工具' : '启动工具' }}
      </el-button>

      <el-button type="success" @click="createLayer" style="margin: 10px;">
        创建图层
      </el-button>

      <el-button type="warning" @click="editLayer" :disabled="!currentLayer" style="margin: 10px;">
        编辑图层
      </el-button>
    </div>

    <!-- 图层操作 -->
    <div class="layer-control-group">
      <el-button type="primary" @click="locateLayer" :disabled="!currentLayer" style="margin: 10px;">
        定位图层
      </el-button>

      <el-button type="info" @click="copyLayer" :disabled="!currentLayer" style="margin: 10px;">
        复制图层
      </el-button>

      <el-button
        :type="layerVisible ? 'warning' : 'success'"
        @click="toggleLayerVisibility"
        :disabled="!currentLayer"
        style="margin: 10px;">
        {{ layerVisible ? '隐藏图层' : '显示图层' }}
      </el-button>

      <el-button type="danger" @click="deleteLayer" :disabled="!currentLayer" style="margin: 10px;">
        删除图层
      </el-button>
    </div>

    <!-- 图层属性 -->
    <div class="params-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 14px; border-bottom: 1px solid rgba(225,187,130,0.4); padding-bottom: 5px;">图层属性</h4>

      <el-form-item label="颜色 RGBA" class="ruihua">
        <div style="display: flex; align-items: center;">
          <el-input-number v-model="layerParams.color[0]" :min="0" :max="1" :step="0.1" style="width: 80px; margin-right: 4px;" :controls="false" placeholder="R" />
          <el-input-number v-model="layerParams.color[1]" :min="0" :max="1" :step="0.1" style="width: 80px; margin-right: 4px;" :controls="false" placeholder="G" />
          <el-input-number v-model="layerParams.color[2]" :min="0" :max="1" :step="0.1" style="width: 80px; margin-right: 4px;" :controls="false" placeholder="B" />
          <el-input-number v-model="layerParams.color[3]" :min="0" :max="1" :step="0.1" style="width: 80px; margin-right: 8px;" :controls="false" placeholder="A" />
          <el-button size="small" @click="updateColor">应用</el-button>
        </div>
      </el-form-item>

      <el-form-item label="立面贴附" class="ruihua">
        <el-switch
          v-model="layerParams.fitLook"
          active-text="开启"
          inactive-text="关闭"
          active-color="#E1BB82"
          style="margin-left: 15px;"
          @change="updateFitLook" />
      </el-form-item>

      <el-form-item label="立面厚度(m)" class="ruihua">
        <el-input-number
          v-model="layerParams.lookHeight"
          :min="1"
          :max="100000"
          :step="1000"
          style="width: 150px;"
          @change="updateLookHeight" />
      </el-form-item>

      <el-form-item label="后撤距离(m)" class="ruihua">
        <el-input-number
          v-model="layerParams.backDistanceOnFitLook"
          :min="0"
          :max="100"
          :step="0.5"
          style="width: 150px;"
          @change="updateBackDistance" />
      </el-form-item>

      <el-form-item label="相机校准法线" class="ruihua">
        <el-switch
          v-model="layerParams.useCameraCalNormal"
          active-text="开启"
          inactive-text="关闭"
          active-color="#E1BB82"
          style="margin-left: 15px;"
          @change="updateUseCameraCalNormal" />
      </el-form-item>

      <el-form-item label="纹理路径" class="ruihua">
        <div style="display: flex; align-items: center;">
          <el-input v-model="layerParams.texturePath" style="width: 220px; margin-right: 8px;" placeholder="本地路径或 http(s)://URL" />
          <el-button size="small" @click="updateTexture" :disabled="!currentLayer">应用</el-button>
        </div>
      </el-form-item>

      <el-form-item label="UV世界长度(cm)" class="ruihua">
        <el-input-number
          v-model="layerParams.unitUV2World"
          :min="1"
          :max="100000"
          :step="100"
          style="width: 150px;"
          @change="updateUnitUV2World" />
      </el-form-item>

      <div style="margin: 10px 0 0 15px;">
        <el-button type="primary" @click="updateAll" :disabled="!currentLayer">批量更新图层</el-button>
      </div>
    </div>

    <!-- 状态提示 -->
    <div class="status-panel" :class="{ active: isToolActive }">
      <p>工具状态: {{ isToolActive ? '已激活，在场景中点击绘制点' : '未激活' }}</p>
      <p v-if="currentLayerId">图层 ID: {{ currentLayerId }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .layer-control-group, .params-group {
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
</style>
