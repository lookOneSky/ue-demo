<script setup lang="ts">
import { ref } from 'vue'
import { DasPointsTool } from "./lib/Tool/DasPointsTool.js"
import { DasPointsLayer } from "./lib/Layer/DasPointsLayer.js"
import { DasGroupLayer } from "./lib/Layer/DasGroupLayer.js"

// 工具状态
const isToolActive = ref(false)

// 图层相关状态
const layerVisible = ref(true)
const currentLayerId = ref('')
const currentLayer = ref<any>(null)

// 工具参数
const toolParams = ref({
  texturePath: 'F:/WDS图片/texture.png',
  pointSize: [50, 50] as [number, number],
  enableDepthTest: true
})

// AutoScale参数
const autoScaleParams = ref({
  autoScale: true
})

// 启动工具
const startTool = async () => {
  try {
    DasPointsTool.setToCurrent()
    isToolActive.value = true
    console.log('点工具已启动')
  } catch (error) {
    console.error('启动点工具失败:', error)
  }
}

// 结束工具
const stopTool = () => {
  try {
    // 假设有停止工具的方法，如果没有可以考虑切换到默认工具
    DasPointsTool.finishTool() 
    isToolActive.value = false
    console.log('点工具已停止')
  } catch (error) {
    console.error('停止点工具失败:', error)
  }
}

// 更新工具参数
const updateToolParams = async () => {
  try {
    const params = {
      texturePath: toolParams.value.texturePath,
      pointSize: toolParams.value.pointSize,
      enableDepthTest: toolParams.value.enableDepthTest
    }
    await DasPointsTool.updateAll(params)
    console.log('工具参数已更新:', params)
  } catch (error) {
    console.error('更新工具参数失败:', error)
  }
}

// 设置深度测试
const setDepthTest = async (value: boolean) => {
  try {
    toolParams.value.enableDepthTest = value
    await DasPointsTool.setDepthTest(value)
    console.log('深度测试设置已更新:', value)
  } catch (error) {
    console.error('设置深度测试失败:', error)
  }
}

// 获取工具参数并创建图层
const createLayerFromTool = async () => {
  try {
    //alert("getall begin")
    const info = await DasPointsTool.getAll()
    //alert("getall return")
    info.isSpread = true;
    //info.points[0] = [111.0035735671499, 32.40221921600622, 1462.6277383377078]
    const result = await DasPointsLayer.createInstance({"param": info})
    currentLayer.value = result
    currentLayerId.value = result?.id || ''
    console.log('已从工具创建图层:', result)
  } catch (error) {
    console.error('创建图层失败:', error)
  }
}

// 设置图层AutoScale
const setLayerAutoScale = async (value: boolean) => {
  try {
    if (!currentLayer.value) {
      console.warn('请先创建图层')
      return
    }
    await currentLayer.value.setAutoScale(value)
    autoScaleParams.value.autoScale = value
    console.log('图层AutoScale设置已更新:', value)
  } catch (error) {
    console.error('设置图层AutoScale失败:', error)
  }
}

// 获取图层AutoScale状态
const getLayerAutoScale = async () => {
  try {
    if (!currentLayer.value) {
      console.warn('请先创建图层')
      return
    }
    const autoScale = await currentLayer.value.isAutoScale()
    autoScaleParams.value.autoScale = autoScale
    console.log('图层AutoScale状态:', autoScale)
  } catch (error) {
    console.error('获取图层AutoScale状态失败:', error)
  }
}

// 定位图层
const locateLayer = async () => {
let pRoot = await DasGroupLayer.getRoot();
  let allLayers = await pRoot.getAllLayer();
  if(allLayers && allLayers.length > 0)
  {
    let classNameGet = await allLayers[0].requestClassName();
    allLayers[0].flyToThis();
  }
}

// 显隐图层
const toggleLayerVisibility = async () => {
  let pRoot = await DasGroupLayer.getRoot();
  pRoot.setVisible(layerVisible.value);
}

// 删除图层
const deleteLayer = async () => {
  let pRoot = await DasGroupLayer.getRoot();
  pRoot.removeAllLayer();
  currentLayer.value = null
  currentLayerId.value = ''
}
</script>

<template>
  <div>
    <div class="title">点工具控制</div>
    <div class="split_line"></div>

    <!-- 工具状态控制 -->
    <div class="control-group">
      <el-button 
        :type="isToolActive ? 'danger' : 'primary'" 
        @click="isToolActive ? stopTool() : startTool()"
        style="margin: 10px;">
        {{ isToolActive ? '停止工具' : '启动工具' }}
      </el-button>
      
      <el-button type="success" @click="createLayerFromTool" style="margin: 10px;">
        创建图层
      </el-button>
    </div>
    
    <!-- 图层操作控制 -->
    <div class="layer-control-group">
      <el-button 
        type="primary" 
        @click="locateLayer" 
        style="margin: 10px;">
        定位图层
      </el-button>
      
      <el-button 
        :type="layerVisible ? 'warning' : 'success'" 
        @click="toggleLayerVisibility" 
        :disabled="!currentLayerId"
        style="margin: 10px;">
        {{ layerVisible ? '隐藏图层' : '显示图层' }}
      </el-button>
      
      <el-button 
        type="danger" 
        @click="deleteLayer" 
        :disabled="!currentLayerId"
        style="margin: 10px;">
        删除图层
      </el-button>
    </div>

    <!-- AutoScale控制组 -->
    <div class="autoscale-control-group" v-if="currentLayer">
      <el-form-item label="AutoScale设置" class="ruihua">
        <el-switch 
          v-model="autoScaleParams.autoScale"
          active-text="开启" 
          inactive-text="关闭"
          style="margin-left: 15px;"
          active-color="#E1BB82"
          @change="setLayerAutoScale">
        </el-switch>
      </el-form-item>
      
      <el-button type="info" @click="getLayerAutoScale" style="margin: 10px;">
        获取AutoScale状态
      </el-button>
    </div>

    <!-- 工具参数设置 -->
    <div class="params-group">
      <el-form-item label="纹理路径" class="ruihua">
        <el-input v-model="toolParams.texturePath" style="width: 200px;"></el-input>
      </el-form-item>
      
      <el-form-item label="点大小-宽" class="ruihua">
        <el-input-number v-model="toolParams.pointSize[0]" :min="1" :max="500" style="width: 120px;"></el-input-number>
      </el-form-item>
      
      <el-form-item label="点大小-高" class="ruihua">
        <el-input-number v-model="toolParams.pointSize[1]" :min="1" :max="500" style="width: 120px;"></el-input-number>
      </el-form-item>
      
      <!-- 添加深度测试控制 -->
      <el-form-item label="深度测试" class="ruihua">
        <el-switch 
          v-model="toolParams.enableDepthTest"
          active-text="开启" 
          inactive-text="关闭"
          style="margin-left: 15px;"
          active-color="#E1BB82"
          @change="setDepthTest">
        </el-switch>
      </el-form-item>
      
      <el-button type="primary" @click="updateToolParams" style="margin: 15px;">
        更新参数
      </el-button>
    </div>

    <!-- 工具状态提示 -->
    <div class="status-panel" :class="{ 'active': isToolActive }">
      <p>当前状态: {{ isToolActive ? '工具已激活' : '工具未激活' }}</p>
      <p v-if="isToolActive">您可以在场景中点击添加标记点</p>
      <p>深度测试: {{ toolParams.enableDepthTest ? '开启' : '关闭' }}</p>
      <p v-if="currentLayerId">当前图层ID: {{ currentLayerId }}</p>
      <p v-if="currentLayer">AutoScale状态: {{ autoScaleParams.autoScale ? '开启' : '关闭' }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .params-group, .layer-control-group, .autoscale-control-group {
  margin: 15px 0;
}

.autoscale-control-group {
  padding: 15px;
  border: 1px solid rgba(225, 187, 130, 0.3);
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
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