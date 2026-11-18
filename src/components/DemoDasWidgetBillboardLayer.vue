<script setup lang="ts">
import { ref } from 'vue'
import { DasGroupLayer } from "./lib/Layer/DasGroupLayer.js"
import { DasWidgetBillboardLayer } from "./lib/Layer/DasWidgetBillboardLayer.js"
import { DasPointsTool } from "./lib/Tool/DasPointsTool.js"

// 工具状态
const isToolActive = ref(false)

// 图层相关状态
const layerVisible = ref(true)
const currentLayerId = ref('')
const currentLayer = ref<any>(null)

// 工具参数
// url: 'file:///F:/VideoData/html/html/resourceCount.html',
const billboardParams = ref({
  url: 'file:///F:/VideoData/html/html/mountainInfo.html',
  width: 100,
  height: 100,
  autoScale: true,
  blendMode: 'Transparent',
  htmlContent: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>景点标牌</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: "Microsoft YaHei", "SimHei", sans-serif;
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
            padding: 20px;
            width: 400px;
            height: 300px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            border-radius: 10px;
            border: 2px solid #E1BB82;
        }
        
        .header {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #E1BB82;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        
        .title {
            font-size: 24px;
            color: #E1BB82;
            font-weight: bold;
            text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
            flex-grow: 1;
            text-align: center;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            object-fit: contain;
            margin-right: 10px;
        }
        
        .content {
            flex-grow: 1;
            display: flex;
            overflow: hidden;
        }
        
        .info {
            flex: 1;
            padding-right: 15px;
        }
        
        .info-row {
            margin-bottom: 10px;
            display: flex;
        }
        
        .info-label {
            color: #E1BB82;
            width: 70px;
            flex-shrink: 0;
        }
        
        .info-value {
            flex-grow: 1;
        }
        
        .image-container {
            width: 150px;
            height: 150px;
            flex-shrink: 0;
            border: 1px solid #E1BB82;
            border-radius: 5px;
            overflow: hidden;
        }
        
        .feature-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .footer {
            margin-top: 15px;
            border-top: 1px solid #E1BB82;
            padding-top: 10px;
            font-size: 12px;
            text-align: center;
            color: #E1BB82;
        }
    </style>
</head>
<body>
    <div class="header">
        <!-- 直接嵌入SVG logo -->
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 100 100" class="logo">
          <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#E1BB82;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#A67C00;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- 背景圆 -->
          <circle cx="50" cy="50" r="45" fill="url(#gold-gradient)" stroke="#E1BB82" stroke-width="2" />
          
          <!-- 中心图案 - 简化的太极符号 -->
          <path d="M50,20 
                  A15,15 0 0,1 65,35 
                  A15,15 0 0,1 50,50 
                  A15,15 0 0,0 35,65 
                  A15,15 0 0,0 50,80 
                  A30,30 0 0,1 20,50 
                  A30,30 0 0,1 50,20" 
                fill="#FFFFFF" />
          <path d="M50,20 
                  A30,30 0 0,1 80,50 
                  A30,30 0 0,1 50,80 
                  A15,15 0 0,1 65,65 
                  A15,15 0 0,1 50,50 
                  A15,15 0 0,0 35,35 
                  A15,15 0 0,0 50,20" 
                fill="#333333" />
          
          <!-- 小圆点 -->
          <circle cx="50" cy="35" r="4" fill="#333333" />
          <circle cx="50" cy="65" r="4" fill="#FFFFFF" />
          
          <!-- 外环 -->
          <circle cx="50" cy="50" r="45" fill="none" stroke="#E1BB82" stroke-width="2" />
        </svg>
        <div class="title">太和宫景区</div>
    </div>
    
    <div class="content">
        <div class="info">
            <div class="info-row">
                <div class="info-label">地理位置:</div>
                <div class="info-value">湖北省十堰市武当山</div>
            </div>
            <div class="info-row">
                <div class="info-label">海拔高度:</div>
                <div class="info-value">1,612米</div>
            </div>
            <div class="info-row">
                <div class="info-label">建筑年代:</div>
                <div class="info-value">明朝永乐十年（1412年）</div>
            </div>
            <div class="info-row">
                <div class="info-label">文化遗产:</div>
                <div class="info-value">世界文化遗产、国家5A级景区</div>
            </div>
            <div class="info-row">
                <div class="info-label">简介:</div>
                <div class="info-value">太和宫是武当山的主体建筑，金殿建在岩石之上，四周绝崖千仞，蔚为壮观。</div>
            </div>
        </div>
        
        <div class="image-container">
            <!-- 直接嵌入SVG图片 -->
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 300 200" class="feature-image">
              <defs>
                <linearGradient id="sky-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#1a3c6e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#87ceeb;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="mountain-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#3a5e3a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#2d4d2d;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="roof-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#e9c27a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#bf9b30;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="wall-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#aa0000;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#880000;stop-opacity:1" />
                </linearGradient>
              </defs>
              
              <!-- 背景天空 -->
              <rect x="0" y="0" width="300" height="200" fill="url(#sky-gradient)" />
              
              <!-- 远山 -->
              <path d="M0,140 L20,120 L40,135 L60,110 L80,125 L100,95 L120,105 L140,90 L160,100 L180,80 L200,105 L220,85 L240,110 L260,90 L280,120 L300,100 L300,200 L0,200 Z" fill="url(#mountain-gradient)" />
              
              <!-- 近山 -->
              <path d="M0,170 L30,150 L60,160 L90,140 L120,155 L150,135 L180,150 L210,130 L240,155 L270,140 L300,160 L300,200 L0,200 Z" fill="#2a3f2a" />
              
              <!-- 太和宫主体建筑 -->
              <g transform="translate(90, 70)">
                <!-- 屋顶 -->
                <path d="M60,0 L120,30 L0,30 Z" fill="url(#roof-gradient)" stroke="#000" stroke-width="0.5" />
                
                <!-- 二层屋顶 -->
                <path d="M30,30 L90,30 L100,40 L20,40 Z" fill="url(#roof-gradient)" stroke="#000" stroke-width="0.5" />
                
                <!-- 墙壁 -->
                <rect x="25" y="40" width="70" height="30" fill="url(#wall-gradient)" stroke="#000" stroke-width="0.5" />
                
                <!-- 门 -->
                <rect x="50" y="50" width="20" height="20" fill="#4a1c1c" stroke="#000" stroke-width="0.5" />
                
                <!-- 支柱 -->
                <rect x="30" y="40" width="5" height="30" fill="#8b4513" />
                <rect x="85" y="40" width="5" height="30" fill="#8b4513" />
                
                <!-- 台基 -->
                <rect x="15" y="70" width="90" height="10" fill="#a08679" stroke="#000" stroke-width="0.5" />
                
                <!-- 台阶 -->
                <path d="M35,80 L85,80 L90,90 L30,90 Z" fill="#a08679" stroke="#000" stroke-width="0.5" />
              </g>
              
              <!-- 装饰云朵 -->
              <g fill="#ffffff" opacity="0.7">
                <ellipse cx="50" cy="40" rx="20" ry="10" />
                <ellipse cx="40" cy="35" rx="15" ry="8" />
                <ellipse cx="60" cy="35" rx="15" ry="8" />
                
                <ellipse cx="220" cy="30" rx="25" ry="12" />
                <ellipse cx="210" cy="25" rx="18" ry="9" />
                <ellipse cx="230" cy="25" rx="18" ry="9" />
              </g>
            </svg>
        </div>
    </div>
    
    <div class="footer">
        © 2023 武当山风景区管理委员会 - 敬请保护文化遗产
    </div>
</body>
</html>`
})

// 屏幕偏移参数
const screenOffsetParams = ref({
  offsetX: 0,
  offsetY: 0
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
    // 假设有停止工具的方法，修改为使用其他方式停止工具
    DasPointsTool.finishTool() 
    isToolActive.value = false
    console.log('点工具已停止')
  } catch (error) {
    console.error('停止点工具失败:', error)
  }
}

// 创建Billboard图层
const createBillboardLayer = async () => {
  try {
    // 获取点位信息
    const pointInfo = await DasPointsTool.getAll()
    
    // 创建Billboard图层
    const param = {
      param: {
        url: billboardParams.value.url,
        width: billboardParams.value.width,
        height: billboardParams.value.height,
        blendMode: billboardParams.value.blendMode,
        offsetX: screenOffsetParams.value.offsetX,
        offsetY: screenOffsetParams.value.offsetY,
        posLLH: pointInfo.posLLH
      }
    }

    const result = await DasWidgetBillboardLayer.createInstance(param)
    currentLayer.value = result
    currentLayerId.value = result ? result.id : ''
    if (result) {
      await result.setScreenOffset(screenOffsetParams.value.offsetX, screenOffsetParams.value.offsetY)
      await result.setBillboardSize(billboardParams.value.width, billboardParams.value.height)
    }
    console.log('已创建Billboard图层:', result)
  } catch (error) {
    console.error('创建Billboard图层失败:', error)
  }
}

// 创建使用HTML内容的Billboard图层
const createBillboardWithHTML = async () => {
  try {
    // 创建Billboard图层并使用HTML内容
    // 获取点位信息
    const pointInfo = await DasPointsTool.getAll()

    const param = {
      param: {
        fileData: billboardParams.value.htmlContent,
        width: billboardParams.value.width,
        height: billboardParams.value.height,
        blendMode: billboardParams.value.blendMode,
        offsetX: screenOffsetParams.value.offsetX,
        offsetY: screenOffsetParams.value.offsetY,
        posLLH: pointInfo.posLLH
      }
    }

    const result = await DasWidgetBillboardLayer.createInstance(param)
    currentLayer.value = result
    currentLayerId.value = result ? result.id : ''
    if (result) {
      await result.setScreenOffset(screenOffsetParams.value.offsetX, screenOffsetParams.value.offsetY)
      await result.setBillboardSize(billboardParams.value.width, billboardParams.value.height)
    }
    console.log('已创建HTML内容Billboard图层:', result)
  } catch (error) {
    console.error('创建HTML内容Billboard图层失败:', error)
  }
}

// 设置屏幕偏移
const setScreenOffset = async () => {
  try {
    if (!currentLayer.value) {
      console.warn('请先创建图层')
      return
    }
    await currentLayer.value.setScreenOffset(screenOffsetParams.value.offsetX, screenOffsetParams.value.offsetY)
    console.log('屏幕偏移已更新:', screenOffsetParams.value.offsetX, screenOffsetParams.value.offsetY)
  } catch (error) {
    console.error('设置屏幕偏移失败:', error)
  }
}

// 获取屏幕偏移
const getScreenOffset = async () => {
  try {
    if (!currentLayer.value) {
      console.warn('请先创建图层')
      return
    }
    const offset = await currentLayer.value.getScreenOffset()
    if (offset && offset.length >= 2) {
      screenOffsetParams.value.offsetX = offset[0]
      screenOffsetParams.value.offsetY = offset[1]
    }
    console.log('获取屏幕偏移:', offset)
  } catch (error) {
    console.error('获取屏幕偏移失败:', error)
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
  layerVisible.value = !layerVisible.value;
  pRoot.setVisible(layerVisible.value);
}

// 删除图层
const deleteLayer = async () => {
  let pRoot = await DasGroupLayer.getRoot();
  pRoot.removeAllLayer();
  currentLayer.value = null
  currentLayerId.value = '';
}

// 更新自动缩放
const updateAutoScale = async () => {
  try {
    // 获取根图层下的所有图层
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    // 找到目标Billboard图层
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasWidgetBillboardLayer') {

        let billboard = new DasWidgetBillboardLayer;
        billboard.id = layer.id;
        billboard.setAutoScale(billboardParams.value.autoScale)
        console.log('Billboard自动缩放已更新:', billboardParams.value.autoScale)
        break
      }
    }
  } catch (error) {
    console.error('更新自动缩放失败:', error)
  }
}

// 更新Billboard尺寸
const updateBillboardSize = async () => {
  try {
    // 获取根图层下的所有图层
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()

    // 找到目标Billboard图层
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasWidgetBillboardLayer') {
        let billboard = new DasWidgetBillboardLayer;
        billboard.id = layer.id;
        billboard.setBillboardSize(billboardParams.value.width, billboardParams.value.height)
        console.log('Billboard尺寸已更新:', billboardParams.value.width, billboardParams.value.height)
        break
      }
    }
  } catch (error) {
    console.error('更新Billboard尺寸失败:', error)
  }
}

// 更新深度偏移系数
const updateDepthOffsetRate = async () => {
  try {
    // 获取根图层下的所有图层
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    // 找到目标Billboard图层
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasWidgetBillboardLayer') {
        let billboard = new DasWidgetBillboardLayer;
        billboard.id = layer.id;
        billboard.setDepthOffsetRate(billboardParams.value.depthOffsetRate)
        console.log('Billboard深度偏移系数已更新:', billboardParams.value.depthOffsetRate)
        break
      }
    }
  } catch (error) {
    console.error('更新深度偏移系数失败:', error)
  }
}

// 更新混合模式
const updateBlendMode = async () => {
  try {
    // 获取根图层下的所有图层
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    // 找到目标Billboard图层
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasWidgetBillboardLayer') {
        let billboard = new DasWidgetBillboardLayer;
        billboard.id = layer.id;
        billboard.setBlendMode(billboardParams.value.blendMode)
        console.log('Billboard混合模式已更新:', billboardParams.value.blendMode)
        break
      }
    }
  } catch (error) {
    console.error('更新混合模式失败:', error)
  }
}
</script>

<template>
  <div>
    <div class="title">Billboard图层控制</div>
    <div class="split_line"></div>

    <!-- 工具状态控制 -->
    <div class="control-group">
      <el-button 
        :type="isToolActive ? 'danger' : 'primary'" 
        @click="isToolActive ? stopTool() : startTool()"
        style="margin: 10px;">
        {{ isToolActive ? '停止工具' : '启动工具' }}
      </el-button>
      
      <el-button type="success" @click="createBillboardLayer" style="margin: 10px;">
        创建URL Billboard
      </el-button>
      
      <el-button type="success" @click="createBillboardWithHTML" style="margin: 10px;">
        创建HTML Billboard
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

    <!-- 屏幕偏移控制组 -->
    <div class="screen-offset-control-group">
      <div class="section-title">屏幕偏移设置</div>
      
      <el-form-item label="X轴偏移" class="ruihua">
        <el-input-number 
          v-model="screenOffsetParams.offsetX" 
          :min="-1000" 
          :max="1000" 
          style="width: 120px;">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="Y轴偏移" class="ruihua">
        <el-input-number 
          v-model="screenOffsetParams.offsetY" 
          :min="-1000" 
          :max="1000" 
          style="width: 120px;">
        </el-input-number>
      </el-form-item>
      
      <el-button type="primary" @click="setScreenOffset" style="margin: 10px;">
        设置屏幕偏移
      </el-button>
      
      <el-button type="info" @click="getScreenOffset" style="margin: 10px;">
        获取屏幕偏移
      </el-button>
    </div>

    <!-- Billboard参数设置 -->
    <div class="params-group">
      <el-form-item label="网页URL" class="ruihua">
        <el-input v-model="billboardParams.url" style="width: 300px;"></el-input>
      </el-form-item>
      
      <el-form-item label="HTML内容" class="ruihua">
        <el-input 
          v-model="billboardParams.htmlContent" 
          type="textarea" 
          :rows="3" 
          style="width: 300px;">
        </el-input>
      </el-form-item>
      
      <el-form-item label="宽度" class="ruihua">
        <el-input-number v-model="billboardParams.width" :min="100" :max="2000" style="width: 120px;" @change="updateBillboardSize"></el-input-number>
      </el-form-item>

      <el-form-item label="高度" class="ruihua">
        <el-input-number v-model="billboardParams.height" :min="100" :max="2000" style="width: 120px;" @change="updateBillboardSize"></el-input-number>
      </el-form-item>
      
      <el-form-item label="自动缩放" class="ruihua">
        <el-switch 
          v-model="billboardParams.autoScale"
          active-text="开启" 
          inactive-text="关闭"
          style="margin-left: 15px;"
          active-color="#E1BB82"
          @change="updateAutoScale">
        </el-switch>
      </el-form-item>
      
      <el-form-item label="深度偏移系数" class="ruihua">
        <el-input-number 
          v-model="billboardParams.depthOffsetRate" 
          :min="0" 
          :max="10" 
          :step="0.1" 
          style="width: 120px;"
          @change="updateDepthOffsetRate">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="混合模式" class="ruihua">
        <el-select 
          v-model="billboardParams.blendMode" 
          style="width: 120px;"
          @change="updateBlendMode">
          <el-option label="不透明" value="Opaque"></el-option>
          <el-option label="遮罩" value="Masked"></el-option>
          <el-option label="透明" value="Transparent"></el-option>
        </el-select>
      </el-form-item>
    </div>

    <!-- 工具状态提示 -->
    <div class="status-panel" :class="{ 'active': isToolActive }">
      <p>当前状态: {{ isToolActive ? '工具已激活' : '工具未激活' }}</p>
      <p v-if="isToolActive">您可以在场景中点击添加Billboard</p>
      <p v-if="currentLayerId">当前图层ID: {{ currentLayerId }}</p>
      <p v-if="currentLayer">屏幕偏移: X={{ screenOffsetParams.offsetX }}, Y={{ screenOffsetParams.offsetY }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .params-group, .layer-control-group, .screen-offset-control-group {
  margin: 15px 0;
}

.screen-offset-control-group {
  padding: 15px;
  border: 1px solid rgba(225, 187, 130, 0.3);
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
}

.section-title {
  font-size: 16px;
  color: #e1bb82;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(225, 187, 130, 0.3);
  padding-bottom: 5px;
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