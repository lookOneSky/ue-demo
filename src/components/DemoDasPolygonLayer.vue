<script setup lang="ts">
import { onViewerSessionLeave } from '../utils/onViewerSessionLeave'
import { computed, ref } from 'vue'
import { DasPointEditTool } from './lib/Tool/DasPointEditTool.js'
import { DasPolygonLayer } from './lib/Layer/DasPolygonLayer.js'
import { buildProjectRelativePath, getProjectRootPath } from '../utils/projectPath'

const isToolActive = ref(false)
const layerVisible = ref(true)
const currentLayerId = ref('')
const currentLayer = ref<any>(null)
const textureStatus = ref('未设置图片')

const layerParams = ref({
  color: [1.0, 1.0, 1.0, 1.0],
  enableDepthTest: true,
  lightIntensity: 1.5,
  enableCustomMaterial: true,
  texturePath: buildProjectRelativePath('Image', 'Volume.png'),
  unitUV2World: 100,
  bandUVScale: 100,
  bandRotateAngle: 0,
  bandTextureStripWidthRatio: 0.1
})

const materialModeLabel = computed(() =>
  layerParams.value.enableCustomMaterial ? 'Band 材质模式' : '图片纹理模式'
)

const buildLayerConfig = () => {
  const config: Record<string, any> = {
    color: layerParams.value.color,
    enableDepthTest: layerParams.value.enableDepthTest,
    lightIntensity: layerParams.value.lightIntensity,
    enableCustomMaterial: layerParams.value.enableCustomMaterial
  }

  if (layerParams.value.enableCustomMaterial) {
    config.bandUVScale = layerParams.value.bandUVScale
    config.bandRotateAngle = layerParams.value.bandRotateAngle
    config.bandTextureStripWidthRatio = layerParams.value.bandTextureStripWidthRatio
  } else if (layerParams.value.texturePath) {
    config.texturePath = layerParams.value.texturePath
    config.unitUV2World = layerParams.value.unitUV2World
  } else {
    config.unitUV2World = layerParams.value.unitUV2World
  }

  return config
}

const createLayer = async () => {
  await DasPointEditTool.finishTool()
  isToolActive.value = false
  const result = await DasPolygonLayer.createInstance({ param: buildLayerConfig() })
  if (result) {
    currentLayer.value = result
    currentLayerId.value = result.id
    layerVisible.value = true
    textureStatus.value = layerParams.value.enableCustomMaterial
      ? '当前为 Band 材质模式'
      : (layerParams.value.texturePath
        ? `待应用图片: ${layerParams.value.texturePath}，当前 UV 世界长度: ${layerParams.value.unitUV2World}cm`
        : `图片纹理模式，等待输入图片路径，当前 UV 世界长度: ${layerParams.value.unitUV2World}cm`)
  }
}

const editLayer = async () => {
  if (!currentLayer.value) return
  if (await DasPointEditTool.editLayer(currentLayer.value)) {
    isToolActive.value = await DasPointEditTool.setToCurrent()
  }
}

const stopTool = async () => {
  await DasPointEditTool.finishTool()
  isToolActive.value = false
}

const locateLayer = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.flyToThis()
}

const toggleLayerVisibility = async () => {
  if (!currentLayer.value) return
  const visible = !layerVisible.value
  await currentLayer.value.setVisible(visible)
  layerVisible.value = visible
}

const deleteLayer = async () => {
  if (!currentLayer.value) return
  if (isToolActive.value) await stopTool()
  await currentLayer.value.removeInstance()
  currentLayerId.value = ''
  currentLayer.value = null
  layerVisible.value = true
  isToolActive.value = false
  textureStatus.value = '未设置图片'
}

const updateColor = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setColor(layerParams.value.color)
}

const updateDepthTest = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setDepthTest(layerParams.value.enableDepthTest)
}

const updateLightIntensity = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setLightIntensity(layerParams.value.lightIntensity)
}

const updateEnableCustomMaterial = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setEnableCustomMaterial(layerParams.value.enableCustomMaterial)
  textureStatus.value = layerParams.value.enableCustomMaterial
    ? '已切换到 Band 材质模式'
    : (layerParams.value.texturePath
      ? `已切换到图片纹理模式，当前图片路径: ${layerParams.value.texturePath}，UV 世界长度: ${layerParams.value.unitUV2World}cm`
      : `已切换到图片纹理模式，请输入图片路径，当前 UV 世界长度: ${layerParams.value.unitUV2World}cm`)
}

const updateTexture = async () => {
  if (!currentLayer.value) return
  if (layerParams.value.enableCustomMaterial) {
    textureStatus.value = '请先关闭自定义材质，再应用图片'
    return
  }
  if (!layerParams.value.texturePath.trim()) {
    textureStatus.value = '图片路径为空，请先输入 texturePath'
    return
  }
  await currentLayer.value.setTexture(layerParams.value.texturePath)
  textureStatus.value = `已应用图片: ${layerParams.value.texturePath}，UV 世界长度: ${layerParams.value.unitUV2World}cm`
}

const updateUnitUV2World = async () => {
  if (!currentLayer.value) return
  if (layerParams.value.enableCustomMaterial) {
    textureStatus.value = '请先关闭自定义材质，再设置 UV 单位对应世界长度'
    return
  }
  await currentLayer.value.setUnitUV2World(layerParams.value.unitUV2World)
  textureStatus.value = `已设置 UV 世界长度: ${layerParams.value.unitUV2World}cm`
}

const updateBandMaterial = async () => {
  if (!currentLayer.value || !layerParams.value.enableCustomMaterial) return
  await currentLayer.value.UpdateBandMaterial({
    bandUVScale: layerParams.value.bandUVScale,
    bandRotateAngle: layerParams.value.bandRotateAngle,
    bandTextureStripWidthRatio: layerParams.value.bandTextureStripWidthRatio
  })
}

const updateAll = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.updateAll(buildLayerConfig())
}
onViewerSessionLeave(() => {
  if (isToolActive.value) return DasPointEditTool.finishTool()
})
</script>

<template>
  <div>
    <div class="title">多边形图层控制</div>
    <div class="split_line"></div>

    <div class="control-group">
      <el-button type="success" @click="createLayer" style="margin: 10px;">
        创建图层
      </el-button>

      <el-button type="warning" @click="editLayer" :disabled="!currentLayer" style="margin: 10px;">
        编辑图层
      </el-button>

      <el-button type="danger" @click="stopTool" :disabled="!isToolActive" style="margin: 10px;">
        停止工具
      </el-button>
    </div>

    <div class="layer-control-group">
      <el-button type="primary" @click="locateLayer" :disabled="!currentLayer" style="margin: 10px;">
        定位图层
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

    <div class="params-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 14px; border-bottom: 1px solid rgba(225,187,130,0.4); padding-bottom: 5px;">图层属性</h4>

      <el-form-item label="颜色 RGBA" class="ruihua">
        <div class="rgba-row">
          <el-input-number v-model="layerParams.color[0]" :min="0" :max="1" :step="0.1" style="width: 80px; margin-right: 4px;" :controls="false" placeholder="R" />
          <el-input-number v-model="layerParams.color[1]" :min="0" :max="1" :step="0.1" style="width: 80px; margin-right: 4px;" :controls="false" placeholder="G" />
          <el-input-number v-model="layerParams.color[2]" :min="0" :max="1" :step="0.1" style="width: 80px; margin-right: 4px;" :controls="false" placeholder="B" />
          <el-input-number v-model="layerParams.color[3]" :min="0" :max="1" :step="0.1" style="width: 80px; margin-right: 8px;" :controls="false" placeholder="A" />
          <el-button size="small" @click="updateColor" :disabled="!currentLayer">应用</el-button>
        </div>
      </el-form-item>

      <el-form-item label="深度测试" class="ruihua">
        <el-switch
          v-model="layerParams.enableDepthTest"
          active-text="开启"
          inactive-text="关闭"
          active-color="#E1BB82"
          style="margin-left: 15px;"
          :disabled="!currentLayer"
          @change="updateDepthTest" />
      </el-form-item>

      <el-form-item label="光照强度" class="ruihua">
        <el-input-number
          v-model="layerParams.lightIntensity"
          :min="0"
          :max="100"
          :step="0.1"
          style="width: 150px;"
          :disabled="!currentLayer"
          @change="updateLightIntensity" />
      </el-form-item>

      <div class="material-section">
        <h4 class="section-title">材质 / 图片演示</h4>
        <p class="section-hint">图片纹理流程：1. 关闭自定义材质 2. 输入图片纹理路径 3. 设置 UV单位对应世界长度 4. 点击“应用图片”</p>
        <p class="section-hint">项目根目录已在运行时保存：{{ getProjectRootPath() }}</p>
        <p class="section-hint">说明：100cm 对应 UV 0~1。数值越大，纹理越密；数值越小，纹理越大。</p>

        <el-form-item label="当前模式" class="ruihua">
          <span class="mode-badge" :class="{ image: !layerParams.enableCustomMaterial }">{{ materialModeLabel }}</span>
        </el-form-item>

        <el-form-item label="自定义材质" class="ruihua">
          <el-switch
            v-model="layerParams.enableCustomMaterial"
            active-text="开启"
            inactive-text="关闭"
            active-color="#E1BB82"
            style="margin-left: 15px;"
            :disabled="!currentLayer"
            @change="updateEnableCustomMaterial" />
        </el-form-item>

        <el-form-item label="图片纹理路径" class="ruihua">
          <div class="image-row">
            <el-input
              v-model="layerParams.texturePath"
              placeholder="关闭自定义材质后，输入 texturePath"
              style="width: 320px;"
              :disabled="!currentLayer" />
            <el-button size="small" @click="updateTexture" :disabled="!currentLayer" style="margin-left: 8px;">
              应用图片
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="UV单位对应世界长度(cm)" class="ruihua">
          <div class="image-row">
            <el-input-number
              v-model="layerParams.unitUV2World"
              :min="1"
              :max="100000"
              :step="10"
              style="width: 180px;"
              :disabled="!currentLayer"
              @change="updateUnitUV2World" />
            <el-button size="small" @click="updateUnitUV2World" :disabled="!currentLayer" style="margin-left: 8px;">
              应用 UV 长度
            </el-button>
          </div>
        </el-form-item>

        <p v-if="layerParams.enableCustomMaterial" class="image-tip">当前是 Band 材质模式。要演示图片贴图，请先关闭自定义材质。</p>
        <p v-else class="image-tip success">当前是图片纹理模式，可直接输入 texturePath、设置 UV 世界长度并应用图片。</p>
        <p class="texture-status">{{ textureStatus }}</p>
      </div>

      <template v-if="layerParams.enableCustomMaterial">
        <div class="material-section">
          <h4 class="section-title">Band 材质参数</h4>
        <el-form-item label="Band UV Scale" class="ruihua">
          <el-input-number
            v-model="layerParams.bandUVScale"
            :min="1"
            :max="10000"
            :step="1"
            style="width: 150px;"
            :disabled="!currentLayer"
            @change="updateBandMaterial" />
        </el-form-item>

        <el-form-item label="Band Rotate" class="ruihua">
          <el-input-number
            v-model="layerParams.bandRotateAngle"
            :min="-6.2832"
            :max="6.2832"
            :step="0.1"
            style="width: 150px;"
            :disabled="!currentLayer"
            @change="updateBandMaterial" />
        </el-form-item>

        <el-form-item label="Band Strip Ratio" class="ruihua">
          <div class="text-row">
            <el-input-number
              v-model="layerParams.bandTextureStripWidthRatio"
              :min="0"
              :max="1"
              :step="0.01"
              style="width: 150px;"
              :disabled="!currentLayer"
              @change="updateBandMaterial" />
            <el-button size="small" @click="updateBandMaterial" :disabled="!currentLayer" style="margin-left: 8px;">
              应用
            </el-button>
          </div>
        </el-form-item>
        </div>
      </template>

      <div style="margin: 10px 0 0 15px;">
        <el-button type="primary" @click="updateAll" :disabled="!currentLayer">批量更新图层</el-button>
      </div>
    </div>

    <div class="status-panel" :class="{ active: isToolActive }">
      <p>工具状态: {{ isToolActive ? '已激活，当前正在编辑多边形点位' : '未激活' }}</p>
      <p>材质模式: {{ materialModeLabel }}</p>
      <p>图片路径: {{ layerParams.texturePath || '未填写' }}</p>
      <p>UV 世界长度: {{ layerParams.unitUV2World }}cm</p>
      <p>图片状态: {{ textureStatus }}</p>
      <p v-if="currentLayerId">图层 ID: {{ currentLayerId }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .layer-control-group, .params-group {
  margin: 15px 0;
}

.rgba-row, .text-row, .image-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.material-section {
  margin: 16px 0;
  padding: 12px 15px;
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 6px;
  background: rgba(225, 187, 130, 0.05);
}

.section-title {
  margin: 0 0 8px 0;
  color: #e1bb82;
  font-size: 14px;
}

.section-hint, .image-tip, .texture-status {
  margin: 6px 0 10px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  line-height: 1.5;
}

.image-tip.success {
  color: #b7e4a1;
}

.texture-status {
  color: #e1bb82;
}

.mode-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(225, 187, 130, 0.18);
  color: #e1bb82;
  font-size: 12px;

  &.image {
    background: rgba(103, 194, 58, 0.18);
    color: #b7e4a1;
  }
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
