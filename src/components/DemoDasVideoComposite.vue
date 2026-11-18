<script setup lang="ts">
import { ref } from 'vue'
import { DasGroupLayer } from "./lib/Layer/DasGroupLayer.js"
import { DasVideoCompositeLayer } from "./lib/Layer/DasVideoCompositeLayer.js"
import { DasPointsTool } from "./lib/Tool/DasPointsTool.js"

// 图层状态
const layerVisible = ref(true)
const currentLayerId = ref<any>(null)
const isCapturing = ref(false)

// 工具状态
const isToolActive = ref(false)
const selectedPoint = ref<number[]>([])

// 视频合成参数
const videoParams = ref({
  // Transform 参数
  transform: {
    translation: [0, 0, 0],     // [x, y, z]
    rotation: [0, 0, 0, 1],     // 四元数 [x, y, z, w]
    scale3D: [1, 1, 1]          // [x, y, z]
  },
  // UI用的欧拉角（度）
  eulerRotation: {
    pitch: 0,
    yaw: 0, 
    roll: 0
  },
  // 视频参数
  videoUrl: 'https://gisearth-1301434080.cos.ap-nanjing.myqcloud.com/MapData/ExamplesData/file/video/pinjie.mp4',               // 视频URL
  // 相机参数
  fov: 90,                    // 视场角（度）
  nearClipPlane: 1,           // 近裁剪面距离
  farClipPlane: 10000,        // 远裁剪面距离
  aspectRatio: 1.77,          // 宽高比（16:9）
  frustumVisible: true        // 视椎体组件可见性
})

// 欧拉角转四元数（角度转弧度再转四元数）
const eulerToQuaternion = (pitch: number, yaw: number, roll: number) => {
  // 角度转弧度
  const pitchRad = pitch * Math.PI / 180
  const yawRad = yaw * Math.PI / 180
  const rollRad = roll * Math.PI / 180
  
  // 计算四元数
  const cy = Math.cos(yawRad * 0.5)
  const sy = Math.sin(yawRad * 0.5)
  const cp = Math.cos(pitchRad * 0.5)
  const sp = Math.sin(pitchRad * 0.5)
  const cr = Math.cos(rollRad * 0.5)
  const sr = Math.sin(rollRad * 0.5)
  
  const w = cr * cp * cy + sr * sp * sy
  const x = sr * cp * cy - cr * sp * sy
  const y = cr * sp * cy + sr * cp * sy
  const z = cr * cp * sy - sr * sp * cy
  
  return [x, y, z, w]
}

// 四元数转欧拉角（四元数转弧度再转角度）
const quaternionToEuler = (x: number, y: number, z: number, w: number) => {
  // 计算欧拉角（弧度）
  const sinr_cosp = 2 * (w * x + y * z)
  const cosr_cosp = 1 - 2 * (x * x + y * y)
  const roll = Math.atan2(sinr_cosp, cosr_cosp)
  
  const sinp = 2 * (w * y - z * x)
  const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp)
  
  const siny_cosp = 2 * (w * z + x * y)
  const cosy_cosp = 1 - 2 * (y * y + z * z)
  const yaw = Math.atan2(siny_cosp, cosy_cosp)
  
  // 弧度转角度
  return {
    pitch: pitch * 180 / Math.PI,
    yaw: yaw * 180 / Math.PI,
    roll: roll * 180 / Math.PI
  }
}

// 更新四元数（从欧拉角）
const updateQuaternionFromEuler = () => {
  const quat = eulerToQuaternion(
    videoParams.value.eulerRotation.pitch,
    videoParams.value.eulerRotation.yaw,
    videoParams.value.eulerRotation.roll
  )
  videoParams.value.transform.rotation = quat
}

// 启动点工具
const startPointTool = async () => {
  try {
    await DasPointsTool.setToCurrent()
    isToolActive.value = true
    console.log('点工具已启动')
  } catch (error) {
    console.error('启动点工具失败:', error)
  }
}

// 停止点工具
const stopPointTool = async () => {
  try {
    isToolActive.value = false
    DasPointsTool.finishTool()
    console.log('点工具已停止')
  } catch (error) {
    console.error('停止点工具失败:', error)
  }
}

// 获取当前点位
const getCurrentPoint = async () => {
  try {
    const point = await DasPointsTool.getPointPosition()
    selectedPoint.value = point
    // 自动设置到Transform的位置中
    if (point && point.length >= 3) {
      videoParams.value.transform.translation[0] = point[0]
      videoParams.value.transform.translation[1] = point[1]
      videoParams.value.transform.translation[2] = point[2]
    }
    console.log('获取当前点位:', point)
  } catch (error) {
    console.error('获取当前点位失败:', error)
  }
}

// 清除点位
const clearPoints = async () => {
  try {
    selectedPoint.value = []
    console.log('已清除点位')
  } catch (error) {
    console.error('清除点位失败:', error)
  }
}

// 创建视频合成图层
const createVideoCompositeLayer = async () => {
  try {
    const result = await DasVideoCompositeLayer.createInstance({
      param: {
        transform: videoParams.value.transform,
        videoUrl: videoParams.value.videoUrl,
        fov: videoParams.value.fov,
        nearClipPlane: videoParams.value.nearClipPlane,
        farClipPlane: videoParams.value.farClipPlane,
        aspectRatio: videoParams.value.aspectRatio,
        visible: videoParams.value.frustumVisible
      }
    })
    currentLayerId.value = result
    console.log('已创建视频合成图层:', result)
    await loadAllSettings()
  } catch (error) {
    console.error('创建视频合成图层失败:', error)
  }
}

// 检查图层是否已创建
const checkLayerExists = () => {
  if (!currentLayerId.value) {
    console.warn('请先创建视频合成图层')
    return false
  }
  return true
}

// 设置Actor的Transform
const setActorTransform = async () => {
  try {
    if (!checkLayerExists()) return
    
    // 先从欧拉角更新四元数
    updateQuaternionFromEuler()
    
    await currentLayerId.value.setActorTransform(videoParams.value.transform)
    console.log('已设置Actor Transform:', videoParams.value.transform)
  } catch (error) {
    console.error('设置Actor Transform失败:', error)
  }
}

// 获取Actor的Transform
const getActorTransform = async () => {
  try {
    if (!checkLayerExists()) return
    
    const transform = await currentLayerId.value.getActorTransform()
    videoParams.value.transform = transform
    
    // 同步更新欧拉角显示
    if (transform.rotation && transform.rotation.length >= 4) {
      const euler = quaternionToEuler(
        transform.rotation[0],
        transform.rotation[1], 
        transform.rotation[2],
        transform.rotation[3]
      )
      videoParams.value.eulerRotation = euler
    }
    
    console.log('已获取Actor Transform:', transform)
  } catch (error) {
    console.error('获取Actor Transform失败:', error)
  }
}

// 开始视频捕获
const startVideoCapture = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.startVideoCapture()
    isCapturing.value = true
    console.log('已开始视频捕获')
  } catch (error) {
    console.error('开始视频捕获失败:', error)
  }
}

// 停止视频捕获
const stopVideoCapture = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.stopVideoCapture()
    isCapturing.value = false
    console.log('已停止视频捕获')
  } catch (error) {
    console.error('停止视频捕获失败:', error)
  }
}

// 聚焦到此相机
const focusToThis = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.focusToThis()
    console.log('已聚焦到此相机')
  } catch (error) {
    console.error('聚焦到此相机失败:', error)
  }
}

// 设置视椎体组件可见性
const setFrustumComponentVisible = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.setFrustumComponentVisible(videoParams.value.frustumVisible)
    console.log('已设置视椎体组件可见性:', videoParams.value.frustumVisible)
  } catch (error) {
    console.error('设置视椎体组件可见性失败:', error)
  }
}

// 设置视频URL
const setVideoUrl = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.setVideoUrl(videoParams.value.videoUrl)
    console.log('已设置视频URL:', videoParams.value.videoUrl)
  } catch (error) {
    console.error('设置视频URL失败:', error)
  }
}

// 设置视场角
const setFOV = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.setFOV(videoParams.value.fov)
    console.log('已设置视场角:', videoParams.value.fov)
  } catch (error) {
    console.error('设置视场角失败:', error)
  }
}

// 设置近裁剪面
const setNearClipPlane = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.setNearClipPlane(videoParams.value.nearClipPlane)
    console.log('已设置近裁剪面:', videoParams.value.nearClipPlane)
  } catch (error) {
    console.error('设置近裁剪面失败:', error)
  }
}

// 设置远裁剪面
const setFarClipPlane = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.setFarClipPlane(videoParams.value.farClipPlane)
    console.log('已设置远裁剪面:', videoParams.value.farClipPlane)
  } catch (error) {
    console.error('设置远裁剪面失败:', error)
  }
}

// 设置宽高比
const setAspectRatio = async () => {
  try {
    if (!checkLayerExists()) return
    
    await currentLayerId.value.setAspectRatio(videoParams.value.aspectRatio)
    console.log('已设置宽高比:', videoParams.value.aspectRatio)
  } catch (error) {
    console.error('设置宽高比失败:', error)
  }
}

// 获取所有参数
const loadAllSettings = async () => {
  try {
    if (!checkLayerExists()) return
    
    const allParams = await currentLayerId.value.getAll()
    videoParams.value = {
      ...videoParams.value,
      transform: allParams.transform,
      videoUrl: allParams.videoUrl,
      fov: allParams.fov,
      nearClipPlane: allParams.nearClipPlane,
      farClipPlane: allParams.farClipPlane,
      aspectRatio: allParams.aspectRatio,
      frustumVisible: allParams.frustumVisible
    }
    
    // 同步更新欧拉角显示
    if (allParams.transform?.rotation && allParams.transform.rotation.length >= 4) {
      const euler = quaternionToEuler(
        allParams.transform.rotation[0],
        allParams.transform.rotation[1],
        allParams.transform.rotation[2],
        allParams.transform.rotation[3]
      )
      videoParams.value.eulerRotation = euler
    }
    
    console.log('已获取所有参数:', allParams)
  } catch (error) {
    console.error('获取所有参数失败:', error)
  }
}

// 更新所有参数
const updateAllSettings = async () => {
  try {
    if (!checkLayerExists()) return
    
    // 先从欧拉角更新四元数
    updateQuaternionFromEuler()
    
    const params = {
      transform: videoParams.value.transform,
      videoUrl: videoParams.value.videoUrl,
      fov: videoParams.value.fov,
      nearClipPlane: videoParams.value.nearClipPlane,
      farClipPlane: videoParams.value.farClipPlane,
      aspectRatio: videoParams.value.aspectRatio,
      visible: videoParams.value.frustumVisible
    }
    
    await currentLayerId.value.updateAll(params)
    console.log('已更新所有参数:', params)
  } catch (error) {
    console.error('更新所有参数失败:', error)
  }
}

// 定位图层
const locateLayer = async () => {
  try {
    if (!checkLayerExists()) return
    
    const pRoot = await DasGroupLayer.getRoot()
    const allLayers = await pRoot.getAllLayer()
    if (allLayers && allLayers.length > 0) {
      await allLayers[0].flyToThis()
    }
  } catch (error) {
    console.error('定位图层失败:', error)
  }
}

// 显隐图层
const toggleLayerVisibility = async () => {
  try {
    if (!checkLayerExists()) return
    
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
    if (!checkLayerExists()) return
    
    const pRoot = await DasGroupLayer.getRoot()
    await pRoot.removeAllLayer()
    currentLayerId.value = null
    isCapturing.value = false
  } catch (error) {
    console.error('删除图层失败:', error)
  }
}
</script>

<template>
  <div>
    <div class="title">视频合成图层控制</div>
    <div class="split_line"></div>

    <!-- 点工具控制 -->
    <div class="tool-control-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">点工具控制</h4>
      
      <div style="margin: 15px 0; display: flex; flex-wrap: wrap;">
        <el-button 
          :type="isToolActive ? 'danger' : 'primary'" 
          @click="isToolActive ? stopPointTool() : startPointTool()"
          style="margin: 5px;">
          {{ isToolActive ? '停止点工具' : '启动点工具' }}
        </el-button>
        
        <el-button 
          type="primary" 
          @click="getCurrentPoint"
          :disabled="!isToolActive"
          style="margin: 5px;">
          获取当前点位
        </el-button>
        
        <el-button 
          type="danger" 
          @click="clearPoints"
          :disabled="!isToolActive || selectedPoint.length === 0"
          style="margin: 5px;">
          清除点位
        </el-button>
      </div>
      
      <div v-if="selectedPoint.length > 0" class="point-info">
        <p>当前选中点位: [{{ selectedPoint.join(', ') }}]</p>
      </div>
    </div>

    <!-- 图层操作控制 -->
    <div class="layer-control-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">图层控制</h4>
      
      <div style="margin: 15px 0; display: flex; flex-wrap: wrap;">
        <el-button 
          type="primary" 
          @click="createVideoCompositeLayer" 
          style="margin: 5px;">
          创建视频合成图层
        </el-button>
        
        <el-button 
          type="primary" 
          @click="locateLayer" 
          style="margin: 5px;"
          :disabled="!currentLayerId">
          定位图层
        </el-button>
        
        <el-button 
          :type="layerVisible ? 'warning' : 'success'" 
          @click="toggleLayerVisibility"
          style="margin: 5px;"
          :disabled="!currentLayerId">
          {{ layerVisible ? '隐藏图层' : '显示图层' }}
        </el-button>
        
        <el-button 
          type="danger" 
          @click="deleteLayer"
          style="margin: 5px;"
          :disabled="!currentLayerId">
          删除图层
        </el-button>
      </div>
    </div>

    <!-- 视频捕获控制 -->
    <div class="capture-control-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">视频捕获控制</h4>
      
      <div style="margin: 15px 0; display: flex; flex-wrap: wrap;">
        <el-button 
          :type="isCapturing ? 'danger' : 'success'" 
          @click="isCapturing ? stopVideoCapture() : startVideoCapture()"
          :disabled="!currentLayerId"
          style="margin: 5px;">
          {{ isCapturing ? '停止视频捕获' : '开始视频捕获' }}
        </el-button>
        
        <el-button 
          type="primary" 
          @click="focusToThis"
          :disabled="!currentLayerId"
          style="margin: 5px;">
          聚焦到此相机
        </el-button>
      </div>
    </div>

    <!-- 视频设置 -->
    <div class="video-settings-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">视频设置</h4>
      
      <el-form-item label="视频URL" class="ruihua">
        <el-input 
          v-model="videoParams.videoUrl" 
          placeholder="请输入视频URL"
          style="width: 300px;">
        </el-input>
        <el-button 
          type="primary" 
          size="small" 
          @click="setVideoUrl" 
          style="margin-left: 10px;"
          :disabled="!currentLayerId">
          应用
        </el-button>
      </el-form-item>
    </div>

    <!-- Transform参数设置 -->
    <div class="transform-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">Transform设置</h4>
      
      <!-- 位置设置 -->
      <div class="param-section">
        <h5 style="color: #E1BB82; margin: 10px 0;">位置 (Translation)</h5>
        <el-form-item label="X" class="ruihua">
          <el-input-number 
            v-model="videoParams.transform.translation[0]" 
            :precision="6"
            :step="0.1" 
            style="width: 120px;">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="Y" class="ruihua">
          <el-input-number 
            v-model="videoParams.transform.translation[1]" 
            :precision="6"
            :step="0.1" 
            style="width: 120px;">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="Z" class="ruihua">
          <el-input-number 
            v-model="videoParams.transform.translation[2]" 
            :precision="6"
            :step="0.1" 
            style="width: 120px;">
          </el-input-number>
        </el-form-item>
      </div>
      
      <!-- 旋转设置 -->
      <div class="param-section">
        <h5 style="color: #E1BB82; margin: 10px 0;">旋转 (欧拉角)</h5>
        <el-form-item label="Pitch" class="ruihua">
          <el-input-number 
            v-model="videoParams.eulerRotation.pitch" 
            :min="-180" 
            :max="180" 
            :step="1" 
            style="width: 120px;">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="Yaw" class="ruihua">
          <el-input-number 
            v-model="videoParams.eulerRotation.yaw" 
            :min="-180" 
            :max="180" 
            :step="1" 
            style="width: 120px;">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="Roll" class="ruihua">
          <el-input-number 
            v-model="videoParams.eulerRotation.roll" 
            :min="-180" 
            :max="180" 
            :step="1" 
            style="width: 120px;">
          </el-input-number>
        </el-form-item>
      </div>
      
      <!-- 缩放设置 -->
      <div class="param-section">
        <h5 style="color: #E1BB82; margin: 10px 0;">缩放 (Scale3D)</h5>
        <el-form-item label="X" class="ruihua">
          <el-input-number 
            v-model="videoParams.transform.scale3D[0]" 
            :min="0.1" 
            :max="10" 
            :step="0.1" 
            style="width: 120px;">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="Y" class="ruihua">
          <el-input-number 
            v-model="videoParams.transform.scale3D[1]" 
            :min="0.1" 
            :max="10" 
            :step="0.1" 
            style="width: 120px;">
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="Z" class="ruihua">
          <el-input-number 
            v-model="videoParams.transform.scale3D[2]" 
            :min="0.1" 
            :max="10" 
            :step="0.1" 
            style="width: 120px;">
          </el-input-number>
        </el-form-item>
      </div>
      
      <div style="margin: 15px 0; display: flex; flex-wrap: wrap;">
        <el-button 
          type="primary" 
          @click="setActorTransform" 
          style="margin: 5px;"
          :disabled="!currentLayerId">
          应用Transform
        </el-button>
        
        <el-button 
          type="success" 
          @click="getActorTransform" 
          style="margin: 5px;"
          :disabled="!currentLayerId">
          获取Transform
        </el-button>
      </div>
    </div>

    <!-- 相机参数设置 -->
    <div class="camera-params-group">
      <h4 style="color: #E1BB82; margin: 10px 0; font-size: 16px; border-bottom: 1px solid #E1BB82; padding-bottom: 5px;">相机参数设置</h4>
      
      <el-form-item label="视场角(度)" class="ruihua">
        <el-input-number 
          v-model="videoParams.fov" 
          :min="1" 
          :max="179" 
          :step="1" 
          style="width: 120px;">
        </el-input-number>
        <el-button 
          type="primary" 
          size="small" 
          @click="setFOV" 
          style="margin-left: 10px;"
          :disabled="!currentLayerId">
          应用
        </el-button>
      </el-form-item>
      
      <el-form-item label="近裁剪面" class="ruihua">
        <el-input-number 
          v-model="videoParams.nearClipPlane" 
          :min="0.1" 
          :max="1000" 
          :step="0.1" 
          style="width: 120px;">
        </el-input-number>
        <el-button 
          type="primary" 
          size="small" 
          @click="setNearClipPlane" 
          style="margin-left: 10px;"
          :disabled="!currentLayerId">
          应用
        </el-button>
      </el-form-item>
      
      <el-form-item label="远裁剪面" class="ruihua">
        <el-input-number 
          v-model="videoParams.farClipPlane" 
          :min="10" 
          :max="100000" 
          :step="10" 
          style="width: 120px;">
        </el-input-number>
        <el-button 
          type="primary" 
          size="small" 
          @click="setFarClipPlane" 
          style="margin-left: 10px;"
          :disabled="!currentLayerId">
          应用
        </el-button>
      </el-form-item>
      
      <el-form-item label="宽高比" class="ruihua">
        <el-input-number 
          v-model="videoParams.aspectRatio" 
          :min="0.1" 
          :max="10" 
          :step="0.01" 
          :precision="2"
          style="width: 120px;">
        </el-input-number>
        <el-button 
          type="primary" 
          size="small" 
          @click="setAspectRatio" 
          style="margin-left: 10px;"
          :disabled="!currentLayerId">
          应用
        </el-button>
      </el-form-item>
      
      <el-form-item label="视椎体可见性" class="ruihua">
        <el-switch 
          v-model="videoParams.frustumVisible"
          active-text="可见" 
          inactive-text="隐藏"
          style="margin-left: 15px;"
          active-color="#E1BB82"
          @change="setFrustumComponentVisible">
        </el-switch>
      </el-form-item>
      
      <el-button 
        type="primary" 
        @click="updateAllSettings" 
        style="margin: 15px;"
        :disabled="!currentLayerId">
        更新所有参数
      </el-button>
      
      <el-button 
        type="success" 
        @click="loadAllSettings" 
        style="margin: 15px;"
        :disabled="!currentLayerId">
        获取所有参数
      </el-button>
    </div>

    <!-- 状态提示 -->
    <div class="status-panel" :class="{ 'active': isCapturing }">
      <p v-if="currentLayerId">当前图层ID: {{ currentLayerId.id }}</p>
      <p v-else>未创建图层</p>
      <p v-if="isToolActive">点工具已激活</p>
      <p>视频捕获状态: {{ isCapturing ? '正在捕获' : '未捕获' }}</p>
      <p>视频URL: {{ videoParams.videoUrl || '未设置' }}</p>
      <p>视椎体可见性: {{ videoParams.frustumVisible ? '可见' : '隐藏' }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tool-control-group, .layer-control-group, .capture-control-group, .video-settings-group, .transform-group, .camera-params-group {
  margin: 15px 0;
}

.point-info {
  margin: 10px 0;
  padding: 10px;
  background: rgba(225, 187, 130, 0.1);
  border-radius: 4px;
  color: #e1bb82;
}

.param-section {
  margin: 10px 0;
  padding: 10px;
  background: rgba(225, 187, 130, 0.05);
  border-radius: 4px;
  
  h5 {
    font-size: 14px;
    font-weight: 600;
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

:deep(.el-input-number) {
  .el-input__inner {
    text-align: center;
    font-size: 12px;
  }
}
</style> 