<script setup lang="ts">
import { ref } from 'vue'
import { DasPointEditTool } from './lib/Tool/DasPointEditTool.js'
import { DasFitEarthPolygonLayer } from './lib/Layer/DasFitEarthPolygonLayer.js'
import { DasGroupLayer } from './lib/Layer/DasGroupLayer.js'

// 示例点集：金顶铜象保护范围 [经度, 纬度, 高度]
const SAMPLE_POINTS = [
  [103.337151896034, 29.523159878842304, 3035.0542068477885],
  [103.337133519302, 29.523249009267268, 3027.2817611709343],
  [103.336830523414, 29.523207859386098, 3025.2534151063965],
  [103.336062567942, 29.523116162815267, 3025.038838386202],
  [103.33605785852603, 29.52314247293882, 3025.7403850584988],
  [103.335841338057, 29.523113047434673, 3026.0670185093627],
  [103.33585427540999, 29.523038048835204, 3026.042580606735],
  [103.335805009558, 29.52303155847437, 3025.76959132966],
  [103.335886327943, 29.522563322032095, 3026.096820832462],
  [103.33583079463, 29.522555620872005, 3026.0527133953815],
  [103.33585166409699, 29.522437032651364, 3026.0515213029203],
  [103.33572372635199, 29.522419877252283, 3026.0682106042545],
  [103.33573286167498, 29.52236740544707, 3026.066422468236],
  [103.335790923373, 29.5223749866364, 3026.0491371161775],
  [103.335828520853, 29.522150416894984, 3026.0854959500502],
  [103.33631523793902, 29.52221343731778, 3025.0722169888377],
  [103.336296819808, 29.5223125142829, 3025.3392457990335],
  [103.336744223496, 29.522374948911, 3029.6820402183425],
  [103.336675885448, 29.5227681092971, 3033.6523056025603],
  [103.336876587671, 29.5227970313398, 3033.5950851444477],
  [103.336867792442, 29.522851868313893, 3035.0953340557835],
  [103.33691399319699, 29.522855084828105, 3040.3256416363124],
  [103.336926554631, 29.5228189414616, 3040.277361870115],
  [103.33696287519201, 29.522828067572608, 3040.307164192596],
  [103.33696821049402, 29.522810729164235, 3040.4675006869707],
  [103.336984792293, 29.52281435140969, 3040.169477463247],
  [103.33705791143, 29.522600642099675, 3040.1390790984183],
  [103.33707973753302, 29.522590537779745, 3040.3208732600165],
  [103.337268066345, 29.522645031134687, 3040.0538444569947],
  [103.337253505655, 29.522695476728494, 3040.1581525799893],
  [103.337269031373, 29.522701915611012, 3040.2344465247597],
  [103.337254999363, 29.52273235830466, 3040.1760339738894],
  [103.337241723143, 29.522746384474384, 3040.1533842105764],
  [103.337226266792, 29.522803547749685, 3040.2946472184994],
  [103.337234112166, 29.52281962748411, 3040.252923965833],
  [103.337230006182, 29.52283640459296, 3040.0925874717404],
  [103.337216137004, 29.522848031434272, 3040.1903390891234],
  [103.337192361234, 29.52288711749078, 3040.1593446749316],
  [103.33719332161898, 29.5229058037594, 3036.98241710671],
  [103.337200710629, 29.5229384446142, 3036.759495734355],
  [103.337188434838, 29.522980348977793, 3036.6575717930186],
  [103.337192780894, 29.52300877534008, 3036.4882946051453],
  [103.33721719584798, 29.523028608766587, 3036.5353822733514],
  [103.337206814777, 29.523041897229085, 3036.5747213367385],
  [103.33718663961, 29.5230498394646, 3036.6212129594587],
  [103.337182761295, 29.523069708219086, 3036.5312099468365],
  [103.33716894405, 29.523067858511098, 3036.587834356846],
  [103.337151896034, 29.523159878842304, 3035.0542068477885]
]

// 工具状态
const isToolActive = ref(false)

// 图层状态
const layerVisible = ref(true)
const currentLayerId = ref('')
const currentLayer = ref<any>(null)

// 图层参数
const layerParams = ref({
  name: '贴地多边形',
  color: [0.018, 0.16, 0.095, 1],   // 颜色 RGBA，范围0-1
  fitEarth: true,                   // 是否贴地
  fitEarthHeight: 20000.0,          // 贴地高度，单位米
  breathGlow: true,                 // 是否呼吸发光
  glowMin: 1.0,                     // 呼吸最暗强度，1为不发光
  glowMax: 50.0,                    // 呼吸最亮强度，大于1才有Bloom辉光
  breathSpeed: 0.5                  // 呼吸频率，单位Hz
})

// 组装图层全量参数（不含点位）
const buildLayerConfig = () => ({
  name: layerParams.value.name,
  color: layerParams.value.color,
  fitEarth: layerParams.value.fitEarth,
  fitEarthHeight: layerParams.value.fitEarthHeight,
  breathGlow: layerParams.value.breathGlow,
  glowMin: layerParams.value.glowMin,
  glowMax: layerParams.value.glowMax,
  breathSpeed: layerParams.value.breathSpeed
})

// 记录新建的图层
const setCurrentLayer = (layer: any) => {
  currentLayer.value = layer
  currentLayerId.value = layer.id
  layerVisible.value = true
}

// 启动工具（绘制新点）
const startTool = async () => {
  await DasPointEditTool.setToCurrent()
  isToolActive.value = true
}

// 停止工具
const stopTool = async () => {
  DasPointEditTool.finishTool()
  isToolActive.value = false
}

// 创建图层（点位取自工具）
const createLayer = async () => {
  DasPointEditTool.finishTool()
  isToolActive.value = false
  const result = await DasFitEarthPolygonLayer.createInstance({ param: buildLayerConfig() })
  if (result) {
    setCurrentLayer(result)
  }
}

// 用内置示例点集创建图层
const createSampleLayer = async () => {
  DasPointEditTool.finishTool()
  isToolActive.value = false
  const param = { ...buildLayerConfig(), points: SAMPLE_POINTS }
  const result = await DasFitEarthPolygonLayer.createInstance({ param: param })
  if (result) {
    setCurrentLayer(result)
    await result.flyToThis()
  }
}

// 编辑图层（把图层点位载回工具）
const editLayer = async () => {
  if (!currentLayer.value) return
  await DasPointEditTool.editLayer(currentLayer.value)
  isToolActive.value = true
}

// 复制当前图层（顶点与属性取自当前图层）
const copyLayer = async () => {
  if (!currentLayer.value) return
  const all = await currentLayer.value.getAll()
  await DasFitEarthPolygonLayer.createInstance({ param: all })
}

// 定位图层
const locateLayer = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.flyToThis()
}

// 显隐图层
const toggleLayerVisibility = async () => {
  const pRoot = await DasGroupLayer.getRoot()
  layerVisible.value = !layerVisible.value
  await pRoot.setVisible(layerVisible.value)
}

// 删除图层
const deleteLayer = async () => {
  const pRoot = await DasGroupLayer.getRoot()
  await pRoot.removeAllLayer()
  currentLayerId.value = ''
  currentLayer.value = null
}

// 读取图层属性并回填表单
const loadFromLayer = async () => {
  if (!currentLayer.value) return
  const all = await currentLayer.value.getAll()
  if (all.color) layerParams.value.color = all.color
  if (all.fitEarth !== undefined) layerParams.value.fitEarth = all.fitEarth
  if (all.fitEarthHeight !== undefined) layerParams.value.fitEarthHeight = all.fitEarthHeight
  if (all.breathGlow !== undefined) layerParams.value.breathGlow = all.breathGlow
  if (all.glowMin !== undefined) layerParams.value.glowMin = all.glowMin
  if (all.glowMax !== undefined) layerParams.value.glowMax = all.glowMax
  if (all.breathSpeed !== undefined) layerParams.value.breathSpeed = all.breathSpeed
}

// 更新颜色
const updateColor = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setColor(layerParams.value.color)
}

// 更新是否贴地
const updateFitEarth = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setFitEarth(layerParams.value.fitEarth)
}

// 更新贴地高度
const updateFitEarthHeight = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setFitEarthHeight(layerParams.value.fitEarthHeight)
}

// 更新呼吸发光
const updateBreathGlow = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.setBreathGlow(
    layerParams.value.breathGlow,
    layerParams.value.glowMin,
    layerParams.value.glowMax,
    layerParams.value.breathSpeed
  )
}

// 批量更新图层属性
const updateAll = async () => {
  if (!currentLayer.value) return
  await currentLayer.value.updateAll(buildLayerConfig())
}
</script>

<template>
  <div>
    <div class="title">贴地多边形图层控制</div>
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

      <el-button type="success" plain @click="createSampleLayer" style="margin: 10px;">
        示例数据创建
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

      <el-button type="info" plain @click="loadFromLayer" :disabled="!currentLayer" style="margin: 10px;">
        读取属性
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

      <el-form-item label="图层名称" class="ruihua">
        <el-input v-model="layerParams.name" style="width: 220px;" placeholder="创建时生效" />
      </el-form-item>

      <el-form-item label="颜色 RGBA" class="ruihua">
        <div style="display: flex; align-items: center;">
          <el-input-number v-model="layerParams.color[0]" :min="0" :max="1" :step="0.1" style="width: 80px; margin-right: 4px;" :controls="false" placeholder="R" />
          <el-input-number v-model="layerParams.color[1]" :min="0" :max="1" :step="0.1" style="width: 80px; margin-right: 4px;" :controls="false" placeholder="G" />
          <el-input-number v-model="layerParams.color[2]" :min="0" :max="1" :step="0.1" style="width: 80px; margin-right: 4px;" :controls="false" placeholder="B" />
          <el-input-number v-model="layerParams.color[3]" :min="0" :max="1" :step="0.1" style="width: 80px; margin-right: 8px;" :controls="false" placeholder="A" />
          <el-button size="small" @click="updateColor" :disabled="!currentLayer">应用</el-button>
        </div>
      </el-form-item>

      <el-form-item label="是否贴地" class="ruihua">
        <el-switch
          v-model="layerParams.fitEarth"
          active-text="开启"
          inactive-text="关闭"
          active-color="#E1BB82"
          style="margin-left: 15px;"
          @change="updateFitEarth" />
      </el-form-item>

      <el-form-item label="贴地高度(m)" class="ruihua">
        <el-input-number
          v-model="layerParams.fitEarthHeight"
          :min="1"
          :max="100000"
          :step="1000"
          style="width: 150px;"
          @change="updateFitEarthHeight" />
      </el-form-item>

      <el-form-item label="呼吸发光" class="ruihua">
        <el-switch
          v-model="layerParams.breathGlow"
          active-text="开启"
          inactive-text="关闭"
          active-color="#E1BB82"
          style="margin-left: 15px;"
          @change="updateBreathGlow" />
      </el-form-item>

      <el-form-item label="最暗强度" class="ruihua" v-if="layerParams.breathGlow">
        <el-input-number
          v-model="layerParams.glowMin"
          :min="1"
          :max="100"
          :step="0.5"
          style="width: 150px;"
          @change="updateBreathGlow" />
      </el-form-item>

      <el-form-item label="最亮强度" class="ruihua" v-if="layerParams.breathGlow">
        <el-input-number
          v-model="layerParams.glowMax"
          :min="1"
          :max="100"
          :step="1"
          style="width: 150px;"
          @change="updateBreathGlow" />
      </el-form-item>

      <el-form-item label="呼吸频率(Hz)" class="ruihua" v-if="layerParams.breathGlow">
        <el-input-number
          v-model="layerParams.breathSpeed"
          :min="0.1"
          :max="10"
          :step="0.1"
          style="width: 150px;"
          @change="updateBreathGlow" />
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
