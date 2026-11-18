<script setup lang="ts">
import { ref } from 'vue'
import { DasPolylineTool } from "./lib/Tool/DasPolylineTool.js"
import { DasPolylineLayer } from "./lib/Layer/DasPolylineLayer.js"
import { DasGroupLayer } from "./lib/Layer/DasGroupLayer.js"

// 工具状态
const isToolActive = ref(false)

// 图层相关状态
const layerVisible = ref(true)
const currentLayerId = ref('')

// 多段线参数
const polylineParams = ref({
  color: [1, 0, 0, 1], // 红色
  thickness: 3.0,
  screenSpace: true,
  enableDepthTest: true,
  depthOffset: 0.1,
  enableHalo: false,
  haloWidth: 20,
  haloIntensity: 0.2,
  brightness: 1.0,
  enableSpline: false,
  interpolateCount: 10,
  lineVisible: true
})

// 启动工具
const startTool = async () => {
  try {
    await DasPolylineTool.setToCurrent()
    isToolActive.value = true
    console.log('多段线工具已启动')
  } catch (error) {
    console.error('启动多段线工具失败:', error)
  }
}

// 结束工具
const stopTool = async () => {
  try {
    // 如果有工具停止方法，可以在这里调用
    isToolActive.value = false
    DasPolylineTool.finishTool()
    console.log('多段线工具已停止')
  } catch (error) {
    console.error('停止多段线工具失败:', error)
  }
}

// 创建多段线图层
const createPolylineLayer = async () => {
  try {
    // 检查工具是否有点位
    const hasPoints = await DasPolylineTool.hasPoints()
    if (!hasPoints) {
      console.warn('没有可用的点位，请先使用工具添加点位')
      return
    }

    // 获取所有工具属性
    const toolData = await DasPolylineTool.getAll()
    console.log('工具数据:', toolData)
    
    // 创建多段线图层参数
    //const param = {
    //  param: {
    //    points: toolData.points || toolData.pointsLLH || [], // 兼容不同的点位数据格式
    //    color: polylineParams.value.color,
    //    thickness: polylineParams.value.thickness,
    //    enableDepthTest: polylineParams.value.enableDepthTest,
    //    depthOffset: polylineParams.value.depthOffset,
    //    halo: {
    //      enableHalo: polylineParams.value.enableHalo,
    //      haloWidth: polylineParams.value.haloWidth,
    //      haloIntensity: polylineParams.value.haloIntensity
    //    },
    //    spline: {
    //      enableSpline: polylineParams.value.enableSpline,
    //      interpolateCount: polylineParams.value.interpolateCount
    //    }
    //  }
    //}
    
    const result = await DasPolylineLayer.createInstance({"param":toolData})
    currentLayerId.value = result ? result.id : ''
    console.log('已创建多段线图层:', result)
  } catch (error) {
    console.error('创建多段线图层失败:', error)
  }
}

// 获取工具数据用于调试
const getToolData = async () => {
  try {
    const toolData = await DasPolylineTool.getAll()
    console.log('当前工具数据:', toolData)
    
    const hasPoints = await DasPolylineTool.hasPoints()
    console.log('是否有点位:', hasPoints)
    
    const lineColor = await DasPolylineTool.getLineColor()
    console.log('当前线条颜色:', lineColor)
    
    const lineThickness = await DasPolylineTool.getLineThickness()
    console.log('当前线条粗细:', lineThickness)
  } catch (error) {
    console.error('获取工具数据失败:', error)
  }
}

// 定位图层
const locateLayer = async () => {
  try {
    const pRoot = await DasGroupLayer.getRoot()
    const allLayers = await pRoot.getAllLayer()
    if (allLayers && allLayers.length > 0) {
      const classNameGet = await allLayers[0].requestClassName()
      await allLayers[0].flyToThis()
    }
  } catch (error) {
    console.error('定位图层失败:', error)
  }
}

// 显隐图层
const toggleLayerVisibility = async () => {
  try {
    const pRoot = await DasGroupLayer.getRoot()
    layerVisible.value = !layerVisible.value
    await pRoot.setVisible(layerVisible.value)
  } catch (error) {
    console.error('切换图层可见性失败:', error)
  }
}

// 删除图层
const deleteLayer = async () => {
  try {
    const pRoot = await DasGroupLayer.getRoot()
    await pRoot.removeAllLayer()
    currentLayerId.value = ''
  } catch (error) {
    console.error('删除图层失败:', error)
  }
}

// 更新线条颜色
const updateLineColor = async () => {
  try {
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasPolylineLayer') {
        let layerPolyline = new DasPolylineLayer()
        layerPolyline.id = layer.id
        await layerPolyline.setColor(polylineParams.value.color)
        console.log('线条颜色已更新:', polylineParams.value.color)
        break
      }
    }
  } catch (error) {
    console.error('更新线条颜色失败:', error)
  }
}

// 更新工具线条颜色
const updateToolLineColor = async () => {
  try {
    await DasPolylineTool.setLineColor(polylineParams.value.color)
    console.log('工具线条颜色已更新:', polylineParams.value.color)
  } catch (error) {
    console.error('更新工具线条颜色失败:', error)
  }
}

// 更新线条粗细
const updateLineThickness = async () => {
  try {
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasPolylineLayer') {
        let layerPolyline = new DasPolylineLayer()
        layerPolyline.id = layer.id
        layerPolyline.setThickness(polylineParams.value.thickness, polylineParams.value.screenSpace)
        console.log('线条粗细已更新:', polylineParams.value.thickness)
        break
      }
    }
  } catch (error) {
    console.error('更新线条粗细失败:', error)
  }
}

// 更新工具线条粗细
const updateToolLineThickness = async () => {
  try {
    await DasPolylineTool.setLineThickness(polylineParams.value.thickness, polylineParams.value.screenSpace)
    console.log('工具线条粗细已更新:', polylineParams.value.thickness)
  } catch (error) {
    console.error('更新工具线条粗细失败:', error)
  }
}

// 更新深度测试
const updateDepthTest = async () => {
  try {
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasPolylineLayer') {
        let layerPolyline = new DasPolylineLayer()
        layerPolyline.id = layer.id
        layerPolyline.setDepthTest(polylineParams.value.enableDepthTest)
        console.log('深度测试已更新:', polylineParams.value.enableDepthTest)
        break
      }
    }
  } catch (error) {
    console.error('更新深度测试失败:', error)
  }
}

// 更新工具深度测试
const updateToolDepthTest = async () => {
  try {
    await DasPolylineTool.setDepthTest(polylineParams.value.enableDepthTest)
    console.log('工具深度测试已更新:', polylineParams.value.enableDepthTest)
  } catch (error) {
    console.error('更新工具深度测试失败:', error)
  }
}

// 更新工具线条可见性
const updateToolLineVisible = async () => {
  try {
    await DasPolylineTool.setLineVisible(polylineParams.value.lineVisible)
    console.log('工具线条可见性已更新:', polylineParams.value.lineVisible)
  } catch (error) {
    console.error('更新工具线条可见性失败:', error)
  }
}

// 更新工具样条插值
const updateToolSplineInterpolation = async () => {
  try {
    await DasPolylineTool.setSplinePoint({
      enableSpline: polylineParams.value.enableSpline,
      interpolateCount: polylineParams.value.interpolateCount
    })
    console.log('工具样条插值已更新')
  } catch (error) {
    console.error('更新工具样条插值失败:', error)
  }
}

// 批量更新工具所有属性
const updateAllToolProperties = async () => {
  try {
    await DasPolylineTool.updateAll({
      color: polylineParams.value.color,
      thickness: polylineParams.value.thickness,
      screenSpace: polylineParams.value.screenSpace,
      enableDepthTest: polylineParams.value.enableDepthTest,
      visible: polylineParams.value.lineVisible,
      enableSpline: polylineParams.value.enableSpline,
      interpolateCount: polylineParams.value.interpolateCount
    })
    console.log('工具所有属性已批量更新')
  } catch (error) {
    console.error('批量更新工具属性失败:', error)
  }
}

// 更新深度偏移
const updateDepthOffset = async () => {
  try {
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasPolylineLayer') {
        let layerPolyline = new DasPolylineLayer()
        layerPolyline.id = layer.id
        layerPolyline.setDepthOffset(polylineParams.value.depthOffset)
        console.log('深度偏移已更新:', polylineParams.value.depthOffset)
        break
      }
    }
  } catch (error) {
    console.error('更新深度测试失败:', error)
  }
}

// 更新光晕效果
const updateHaloEffect = async () => {
  try {
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasPolylineLayer') {
        let layerPolyline = new DasPolylineLayer()
        layerPolyline.id = layer.id
        
        // 设置光晕效果
        await layerPolyline.setHalo({
          enableHalo: polylineParams.value.enableHalo,
          haloWidth: polylineParams.value.haloWidth,
          haloIntensity: polylineParams.value.haloIntensity
        })
        
        // 如果启用光晕，同时设置亮度为50
        if (polylineParams.value.enableHalo) {
          await layerPolyline.setBrightness(50)
          console.log('光晕效果已更新，亮度设置为50')
        } else {
          console.log('光晕效果已更新')
        }
        break
      }
    }
  } catch (error) {
    console.error('更新光晕效果失败:', error)
  }
}

// 更新亮度
const updateBrightness = async () => {
  try {
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasPolylineLayer') {
        let layerPolyline = new DasPolylineLayer()
        layerPolyline.id = layer.id
        await layerPolyline.setBrightness(polylineParams.value.brightness)
        console.log('亮度已更新:', polylineParams.value.brightness)
        break
      }
    }
  } catch (error) {
    console.error('更新亮度失败:', error)
  }
}

// 更新样条插值
const updateSplineInterpolation = async () => {
  try {
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasPolylineLayer') {
        let layerPolyline = new DasPolylineLayer()
        layerPolyline.id = layer.id
        layerPolyline.setSplinePoint({
          enableSpline: polylineParams.value.enableSpline,
          interpolateCount: polylineParams.value.interpolateCount
        })
        console.log('样条插值已更新')
        break
      }
    }
  } catch (error) {
    console.error('更新样条插值失败:', error)
  }
}

// 批量更新所有属性
const updateAllProperties = async () => {
  try {
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasPolylineLayer') {
        let layerPolyline = new DasPolylineLayer()
        layerPolyline.id = layer.id
        await layerPolyline.updateAll({
          color: polylineParams.value.color,
          thickness: polylineParams.value.thickness,
          enableDepthTest: polylineParams.value.enableDepthTest,
          depthOffset: polylineParams.value.depthOffset,
          enableHalo: polylineParams.value.enableHalo,
          haloWidth: polylineParams.value.haloWidth,
          haloIntensity: polylineParams.value.haloIntensity,
          brightness: polylineParams.value.brightness,
          enableSpline: polylineParams.value.enableSpline,
          interpolateCount: polylineParams.value.interpolateCount
        })
        console.log('所有属性已批量更新')
        break
      }
    }
  } catch (error) {
    console.error('批量更新属性失败:', error)
  }
}
</script>

<template>
  <div>
    <div class="title">多段线图层控制</div>
    <div class="split_line"></div>

    <!-- 工具状态控制 -->
    <div class="control-group">
      <el-button 
        :type="isToolActive ? 'danger' : 'primary'" 
        @click="isToolActive ? stopTool() : startTool()"
        style="margin: 10px;">
        {{ isToolActive ? '停止工具' : '启动工具' }}
      </el-button>
      
      <el-button type="success" @click="createPolylineLayer" style="margin: 10px;">
        创建多段线图层
      </el-button>
      
      <el-button type="info" @click="getToolData" style="margin: 10px;">
        调试工具数据
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
        style="margin: 10px;">
        {{ layerVisible ? '隐藏图层' : '显示图层' }}
      </el-button>
      
      <el-button 
        type="danger" 
        @click="deleteLayer"
        style="margin: 10px;">
        删除图层
      </el-button>
    </div>

    <!-- 多段线参数设置 -->
    <div class="params-group">
      <!-- 工具属性控制 -->
      <div class="tool-params-section">
        <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">工具属性控制</h4>
        
        <el-form-item label="工具线条颜色" class="ruihua">
          <div style="display: flex; align-items: center; margin-left: 0px;">
            <el-input-number 
              v-model="polylineParams.color[0]" 
              :min="0" :max="1" :step="0.1" 
              style="width: 85px; margin-right: 5px; min-width: 85px;" 
              placeholder="R"
              :controls="false">
            </el-input-number>
            <el-input-number 
              v-model="polylineParams.color[1]" 
              :min="0" :max="1" :step="0.1" 
              style="width: 85px; margin-right: 5px; min-width: 85px;" 
              placeholder="G"
              :controls="false">
            </el-input-number>
            <el-input-number 
              v-model="polylineParams.color[2]" 
              :min="0" :max="1" :step="0.1" 
              style="width: 85px; margin-right: 5px; min-width: 85px;" 
              placeholder="B"
              :controls="false">
            </el-input-number>
            <el-input-number 
              v-model="polylineParams.color[3]" 
              :min="0" :max="1" :step="0.1" 
              style="width: 85px; min-width: 85px;" 
              placeholder="A"
              :controls="false">
            </el-input-number>
            <el-button @click="updateToolLineColor" style="margin-left: 10px;" size="small">应用工具</el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="工具线条粗细" class="ruihua">
          <el-input-number 
            v-model="polylineParams.thickness" 
            :min="0.1" :max="20" :step="0.1" 
            style="width: 120px;"
            @change="updateToolLineThickness">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="工具线条可见性" class="ruihua">
          <el-switch 
            v-model="polylineParams.lineVisible"
            active-text="可见" 
            inactive-text="隐藏"
            style="margin-left: 15px;"
            active-color="#E1BB82"
            @change="updateToolLineVisible">
          </el-switch>
        </el-form-item>
        
        <el-form-item label="工具深度测试" class="ruihua">
          <el-switch 
            v-model="polylineParams.enableDepthTest"
            active-text="开启" 
            inactive-text="关闭"
            style="margin-left: 15px;"
            active-color="#E1BB82"
            @change="updateToolDepthTest">
          </el-switch>
        </el-form-item>
        
        <el-form-item label="工具样条插值" class="ruihua">
          <el-switch 
            v-model="polylineParams.enableSpline"
            active-text="开启" 
            inactive-text="关闭"
            style="margin-left: 15px;"
            active-color="#E1BB82"
            @change="updateToolSplineInterpolation">
          </el-switch>
        </el-form-item>
        
        <el-form-item label="工具插值数量" class="ruihua" v-if="polylineParams.enableSpline">
          <el-input-number 
            v-model="polylineParams.interpolateCount" 
            :min="5" :max="50" :step="1" 
            style="width: 120px;"
            @change="updateToolSplineInterpolation">
          </el-input-number>
        </el-form-item>
        
        <div style="margin: 15px 0;">
          <el-button 
            type="primary" 
            @click="updateAllToolProperties"
            style="margin-left: 15px;">
            批量更新工具属性
          </el-button>
        </div>
      </div>
      
      <!-- 图层属性控制 -->
      <div class="layer-params-section">
        <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">图层属性控制</h4>
        
        <el-form-item label="图层线条颜色" class="ruihua">
          <div style="display: flex; align-items: center; margin-left: 0px;">
            <el-input-number 
              v-model="polylineParams.color[0]" 
              :min="0" :max="1" :step="0.1" 
              style="width: 85px; margin-right: 5px; min-width: 85px;" 
              placeholder="R"
              :controls="false">
            </el-input-number>
            <el-input-number 
              v-model="polylineParams.color[1]" 
              :min="0" :max="1" :step="0.1" 
              style="width: 85px; margin-right: 5px; min-width: 85px;" 
              placeholder="G"
              :controls="false">
            </el-input-number>
            <el-input-number 
              v-model="polylineParams.color[2]" 
              :min="0" :max="1" :step="0.1" 
              style="width: 85px; margin-right: 5px; min-width: 85px;" 
              placeholder="B"
              :controls="false">
            </el-input-number>
            <el-input-number 
              v-model="polylineParams.color[3]" 
              :min="0" :max="1" :step="0.1" 
              style="width: 85px; min-width: 85px;" 
              placeholder="A"
              :controls="false">
            </el-input-number>
            <el-button @click="updateLineColor" style="margin-left: 10px;" size="small">应用图层</el-button>
          </div>
        </el-form-item>
      
        <el-form-item label="图层线条粗细" class="ruihua">
          <el-input-number 
            v-model="polylineParams.thickness" 
            :min="0.1" :max="20" :step="0.1" 
            style="width: 120px;"
            @change="updateLineThickness">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="图层深度测试" class="ruihua">
          <el-switch 
            v-model="polylineParams.enableDepthTest"
            active-text="开启" 
            inactive-text="关闭"
            style="margin-left: 15px;"
            active-color="#E1BB82"
            @change="updateDepthTest">
          </el-switch>
        </el-form-item>
        
        <el-form-item label="图层深度偏移" class="ruihua">
          <el-input-number 
            v-model="polylineParams.depthOffset" 
            :min="0" :max="1" :step="0.01" 
            style="width: 120px;"
            @change="updateDepthOffset">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="图层光晕效果" class="ruihua">
          <el-switch 
            v-model="polylineParams.enableHalo"
            active-text="开启" 
            inactive-text="关闭"
            style="margin-left: 15px;"
            active-color="#E1BB82"
            @change="updateHaloEffect">
          </el-switch>
        </el-form-item>
        
        <el-form-item label="光晕宽度" class="ruihua" v-if="polylineParams.enableHalo">
          <el-input-number 
            v-model="polylineParams.haloWidth" 
            :min="1" :max="20" :step="0.5" 
            style="width: 120px;"
            @change="updateHaloEffect">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="光晕强度" class="ruihua" v-if="polylineParams.enableHalo">
          <el-input-number 
            v-model="polylineParams.haloIntensity" 
            :min="0" :max="2" :step="0.1" 
            style="width: 120px;"
            @change="updateHaloEffect">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="线条亮度" class="ruihua">
          <el-input-number 
            v-model="polylineParams.brightness" 
            :min="0.1" :max="100" :step="0.5" 
            style="width: 120px;"
            @change="updateBrightness">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="图层样条插值" class="ruihua">
          <el-switch 
            v-model="polylineParams.enableSpline"
            active-text="开启" 
            inactive-text="关闭"
            style="margin-left: 15px;"
            active-color="#E1BB82"
            @change="updateSplineInterpolation">
          </el-switch>
        </el-form-item>
        
        <el-form-item label="插值数量" class="ruihua" v-if="polylineParams.enableSpline">
          <el-input-number 
            v-model="polylineParams.interpolateCount" 
            :min="5" :max="50" :step="1" 
            style="width: 120px;"
            @change="updateSplineInterpolation">
          </el-input-number>
        </el-form-item>
        
        <div style="margin: 15px 0;">
          <el-button 
            type="primary" 
            @click="updateAllProperties"
            style="margin-left: 15px;">
            批量更新图层属性
          </el-button>
        </div>
      </div>
    </div>

    <!-- 工具状态提示 -->
    <div class="status-panel" :class="{ 'active': isToolActive }">
      <p>当前状态: {{ isToolActive ? '工具已激活' : '工具未激活' }}</p>
      <p v-if="isToolActive">您可以在场景中点击添加多段线节点</p>
      <p v-if="currentLayerId">当前图层ID: {{ currentLayerId }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .params-group, .layer-control-group, .batch-control-group {
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

.tool-params-section, .layer-params-section {
  margin: 15px 0;
  padding: 10px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
}

:deep(.el-input-number) {
  .el-input__inner {
    text-align: center;
    font-size: 12px;
  }
}

:deep(.el-input-number--small) {
  width: 85px !important;
  min-width: 85px !important;
}

:deep(.params-group .el-form-item) {
  margin-bottom: 12px;
}

:deep(.el-input-number .el-input__inner) {
  padding-left: 8px !important;
  padding-right: 8px !important;
}
</style> 