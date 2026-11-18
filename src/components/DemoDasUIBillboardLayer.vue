<script setup lang="ts">
import { ref } from 'vue'
import { DasPointsTool } from "./lib/Tool/DasPointsTool.js"
import { DasUIBillboardLayer } from "./lib/Layer/DasUIBillboardLayer.js"
import { DasGroupLayer } from "./lib/Layer/DasGroupLayer.js"

// 工具状态
const isToolActive = ref(false)

// 图层相关状态
const layerVisible = ref(true)
const currentLayerId = ref('')
const layerVisibilityStatus = ref('未知')

// 工具参数
const billboardParams = ref({
  url: 'file:///F:/CodeAll/ue-demo/src/components/billboardInteractive.html',
  width: 400,
  height: 300,
  offsetX: 0,
  offsetY: 0,
  onlyWhenVisible: true,
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
    // 使用适当的方法停止工具
    DasPointsTool.finishTool()
    isToolActive.value = false
    console.log('点工具已停止')
  } catch (error) {
    console.error('停止点工具失败:', error)
  }
}

// 创建UI Billboard图层
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
        x: billboardParams.value.offsetX,
        y: billboardParams.value.offsetY,
        posLLH: pointInfo.posLLH,
        onlyWhenVisible: billboardParams.value.onlyWhenVisible
      }
    }
    
    const result = await DasUIBillboardLayer.createInstance(param)
    DasUIBillboardLayer.clearWebConsoleMessageListener();
    result.addWebConsoleMessageListener(function(pBillboardLayer, json){
      console.log('json:', json)
      pBillboardLayer.setVisible(false);
    })

    currentLayerId.value = result ? result.id : ''
    console.log('已创建UI Billboard图层:', result)
  } catch (error) {
    console.error('创建UI Billboard图层失败:', error)
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
        x: billboardParams.value.offsetX,
        y: billboardParams.value.offsetY,
        posLLH: pointInfo.posLLH,
        onlyWhenVisible: billboardParams.value.onlyWhenVisible
      }
    }
    
    const result = await DasUIBillboardLayer.createInstance(param)
    currentLayerId.value = result ? result.id : ''
    console.log('已创建HTML内容UI Billboard图层:', result)
  } catch (error) {
    console.error('创建HTML内容UI Billboard图层失败:', error)
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
  try {
    // 获取根图层下的所有图层
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    // 找到目标Billboard图层
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasUIBillboardLayer') {
        layerVisible.value = !layerVisible.value
        await layer.setVisible(layerVisible.value)
        console.log('UI Billboard可见性已更新:', layerVisible.value)
        break
      }
    }
  } catch (error) {
    console.error('切换图层可见性失败:', error)
  }
}

// 删除图层
const deleteLayer = async () => {
  let pRoot = await DasGroupLayer.getRoot();
  pRoot.removeAllLayer();
  currentLayerId.value = '';
}

// 更新只在点位可见时显示
const updateOnlyWhenVisible = async () => {
  try {
    // 获取根图层下的所有图层
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    // 找到目标Billboard图层
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasUIBillboardLayer') {
        await layer.setOnlyVisibleWhenPointVisible(billboardParams.value.onlyWhenVisible)
        console.log('只在点位可见时显示已更新:', billboardParams.value.onlyWhenVisible)
        break
      }
    }
  } catch (error) {
    console.error('更新只在点位可见时显示失败:', error)
  }
}

// 更新屏幕偏移
const updateScreenOffset = async () => {
  try {
    // 获取根图层下的所有图层
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    // 找到目标Billboard图层
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasUIBillboardLayer') {
        await layer.setScreenOffset(billboardParams.value.offsetX, billboardParams.value.offsetY)
        console.log('UI Billboard屏幕偏移已更新:', billboardParams.value.offsetX, billboardParams.value.offsetY)
        break
      }
    }
  } catch (error) {
    console.error('更新屏幕偏移失败:', error)
  }
}

// 执行JavaScript代码
const executeJavaScript = async () => {
  try {
    // 获取根图层下的所有图层
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    // 找到目标Billboard图层
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasUIBillboardLayer') {
        // 执行一段JavaScript修改按钮样式
        const script = `document.querySelector('.debug-btn').textContent = '查看详细信息'`

        let pBillboardLayer = new DasUIBillboardLayer();
        pBillboardLayer.id = layer.id;
        await pBillboardLayer.excuteJavaScript(script)
        console.log('JavaScript代码已执行')
        break
      }
    }
  } catch (error) {
    console.error('执行JavaScript代码失败:', error)
  }
}

// 获取图层可见性状态
const getLayerVisibility = async () => {
  try {
    // 获取根图层下的所有图层
    const rootLayer = await DasGroupLayer.getRoot()
    const allLayers = await rootLayer.getAllLayer()
    
    // 找到目标Billboard图层
    for (const layer of allLayers) {
      const className = await layer.requestClassName()
      if (className === 'DasUIBillboardLayer') {
        const isVisible = await layer.isVisible()
        layerVisibilityStatus.value = isVisible ? '显示' : '隐藏'
        console.log('图层当前可见性状态:', isVisible ? '显示' : '隐藏')
        break
      }
    }
  } catch (error) {
    console.error('获取图层可见性状态失败:', error)
    layerVisibilityStatus.value = '获取失败'
  }
}
</script>

<template>
  <div>
    <div class="title">UI Billboard图层控制</div>
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
        创建URL UI Billboard
      </el-button>
      
      <el-button type="success" @click="createBillboardWithHTML" style="margin: 10px;">
        创建HTML UI Billboard
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
        type="info" 
        @click="getLayerVisibility"
        style="margin: 10px;">
        获取可见性状态
      </el-button>
      
      <el-button 
        type="danger" 
        @click="deleteLayer"
        style="margin: 10px;">
        删除图层
      </el-button>
      
      <el-button 
        type="primary" 
        @click="executeJavaScript"
        style="margin: 10px;">
        执行JS代码
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
        <el-input-number v-model="billboardParams.width" :min="100" :max="2000" style="width: 120px;"></el-input-number>
      </el-form-item>
      
      <el-form-item label="高度" class="ruihua">
        <el-input-number v-model="billboardParams.height" :min="100" :max="2000" style="width: 120px;"></el-input-number>
      </el-form-item>
      
      <el-form-item label="X偏移" class="ruihua">
        <el-input-number 
          v-model="billboardParams.offsetX" 
          :min="-500" 
          :max="500" 
          style="width: 120px;"
          @change="updateScreenOffset">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="Y偏移" class="ruihua">
        <el-input-number 
          v-model="billboardParams.offsetY" 
          :min="-500" 
          :max="500" 
          style="width: 120px;"
          @change="updateScreenOffset">
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="只在点位可见时显示" class="ruihua">
        <el-switch 
          v-model="billboardParams.onlyWhenVisible"
          active-text="开启" 
          inactive-text="关闭"
          style="margin-left: 15px;"
          active-color="#E1BB82"
          @change="updateOnlyWhenVisible">
        </el-switch>
      </el-form-item>
    </div>

    <!-- 工具状态提示 -->
    <div class="status-panel" :class="{ 'active': isToolActive }">
      <p>当前状态: {{ isToolActive ? '工具已激活' : '工具未激活' }}</p>
      <p v-if="isToolActive">您可以在场景中点击添加UI Billboard</p>
      <p v-if="currentLayerId">当前图层ID: {{ currentLayerId }}</p>
      <p v-if="layerVisibilityStatus !== '未知'">图层可见性状态: 
        <span :style="{ color: layerVisibilityStatus === '显示' ? '#67C23A' : '#F56C6C' }">
          {{ layerVisibilityStatus }}
        </span>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .params-group, .layer-control-group {
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