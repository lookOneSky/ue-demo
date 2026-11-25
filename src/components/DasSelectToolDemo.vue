<script setup lang="ts">
import { inject, ref, onBeforeUnmount } from 'vue'
import { DasSelectTool } from './lib/Tool/DasSelectTool.js'

// 工具状态
const getShareData = inject<(key: string) => unknown>('getShareData')!
const isToolActive = ref(false)
let toolSession: unknown
let starting = false

// 选择模式
const selectMode = ref('Layer')
const selectModeOptions = [
  { value: 'Layer', label: '图层选择' },
  { value: 'Actor', label: 'Actor选择' },
  { value: 'Component', label: 'Component选择' }
]

// 选择显示状态
const selectShowState = ref('Outline')
const selectShowStateOptions = [
  { value: 'None', label: '🚫 无显示' },
  { value: 'Outline', label: '📐 轮廓线' },
  { value: 'Highlight', label: '🌟 高亮' },
  { value: 'OutlineAndHighlight', label: '✨ 轮廓+高亮' }
]

// 轮廓线设置
const outlineSettings = ref({
  color: '#00FF00', // 绿色
  width: 3
})

// 高亮设置
const highlightSettings = ref({
  color: '#FFFF00' // 黄色
})

// 选中结果信息
const selectedInfo = ref({
  id: '',
  type: '',
  name: '',
  position: [] as number[],
  timestamp: '',
  message: ''
})

// 启动工具
const startTool = async () => {
  if (starting || isToolActive.value) return
  const session = getShareData('viewerSession')
  if (!session) return
  starting = true
  toolSession = session
  try {
    await DasSelectTool.setToCurrent()
    if (toolSession !== session) return
    await DasSelectTool.setSelectMode(selectMode.value)
    if (toolSession !== session) return
    await DasSelectTool.setSelectShowState(selectShowState.value)
    if (toolSession !== session) return
    isToolActive.value = true
    console.log('选择工具已启动，模式:', selectMode.value, '显示状态:', selectShowState.value)
    
    // 添加选择响应事件监听
    addSelectionEventListener()
  } catch (error) {
    console.error('启动选择工具失败:', error)
  } finally {
    starting = false
  }
}

// 结束工具
const stopTool = async () => {
  try {
    await DasSelectTool.finishTool()
    isToolActive.value = false
    toolSession = undefined
    console.log('选择工具已停止')
    
    // 移除选择响应事件监听
    removeSelectionEventListener()
  } catch (error) {
    console.error('停止选择工具失败:', error)
  }
}

// 更改选择模式
const changeSelectMode = async () => {
  if (isToolActive.value) {
    try {
      await DasSelectTool.setSelectMode(selectMode.value)
      console.log('选择模式已更改为:', selectMode.value)
    } catch (error) {
      console.error('更改选择模式失败:', error)
    }
  }
}

// 更改选择显示状态
const changeSelectShowState = async () => {
  if (isToolActive.value) {
    try {
      await DasSelectTool.setSelectShowState(selectShowState.value)
      console.log('选择显示状态已更改为:', selectShowState.value)
    } catch (error) {
      console.error('更改选择显示状态失败:', error)
    }
  }
}

// 获取当前显示状态
const getCurrentShowState = async () => {
  try {
    const currentState = await DasSelectTool.getSelectShowState()
    console.log('当前显示状态:', currentState)
    // 更新界面状态
    if (currentState) {
      selectShowState.value = currentState
    }
  } catch (error) {
    console.error('获取显示状态失败:', error)
  }
}

// 颜色转换函数
const hexToRGBA = (colorValue: string) => {
  // 如果是 RGBA 格式
  if (colorValue.startsWith('rgba(')) {
    const color1 = colorValue.replace('rgba(', '').replace(')', '').split(',')
    return {
      r: parseInt(color1[0]) * 1.0 / 255,
      g: parseInt(color1[1]) * 1.0 / 255,
      b: parseInt(color1[2]) * 1.0 / 255,
      a: parseFloat(color1[3])
    }
  }
  
  // 如果是十六进制格式
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(colorValue)
  if (result) {
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
      a: result[4] ? parseInt(result[4], 16) / 255 : 1.0
    }
  }
  
  result = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i.exec(colorValue)
  if (result) {
    return {
      r: parseInt(result[1] + result[1], 16) / 255,
      g: parseInt(result[2] + result[2], 16) / 255,
      b: parseInt(result[3] + result[3], 16) / 255,
      a: result[4] ? parseInt(result[4] + result[4], 16) / 255 : 1.0
    }
  }
  
  return { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }
}

// 设置轮廓线颜色
const setOutlineColor = async () => {
  try {
    const color = hexToRGBA(outlineSettings.value.color)
    // 调试输出，查看颜色格式
    console.log('原始轮廓线颜色值:', outlineSettings.value.color)
    console.log('转换后轮廓线颜色对象:', color)
    await DasSelectTool.setOutLineColor(color)
    console.log('轮廓线颜色已设置完成')
  } catch (error) {
    console.error('设置轮廓线颜色失败:', error)
  }
}

// 设置轮廓线宽度
const setOutlineWidth = async () => {
  try {
    await DasSelectTool.setOutLineWidth(outlineSettings.value.width)
    console.log('轮廓线宽度已设置:', outlineSettings.value.width)
  } catch (error) {
    console.error('设置轮廓线宽度失败:', error)
  }
}

// 设置高亮颜色
const setHighlightColor = async () => {
  try {
    const color = hexToRGBA(highlightSettings.value.color)
    // 调试输出，查看颜色格式
    console.log('原始高亮颜色值:', highlightSettings.value.color)
    console.log('转换后高亮颜色对象:', color)
    await DasSelectTool.setHightLightColor(color)
    console.log('高亮颜色已设置完成')
  } catch (error) {
    console.error('设置高亮颜色失败:', error)
  }
}

// 清空选择
const clearSelection = async () => {
  await DasSelectTool.clearSelect()
  selectedInfo.value.message = ''
}

// 添加选择响应事件监听
const addSelectionEventListener = () => {
  DasSelectTool.addCallBack(
    (json: { function: string; message: string }) => {
      if (json.function !== 'emitMessage' || typeof json.message !== 'string') return
      const strMessage = json.message
      
      // 只更新消息内容，不解析json
      selectedInfo.value = {
        id: '',
        type: '',
        name: '',
        position: [],
        timestamp: new Date().toLocaleTimeString(),
        message: strMessage
      }
    }
  )
}

// 移除选择响应事件监听
const removeSelectionEventListener = () => {
  DasSelectTool.removeCallBack()
}

onBeforeUnmount(() => {
  if (toolSession && toolSession === getShareData('viewerSession')) {
    if (isToolActive.value) removeSelectionEventListener()
    void DasSelectTool.finishTool().catch(console.error)
  }
  toolSession = undefined
})
</script>

<template>
  <div>
    <div class="title">选择工具控制</div>
    <div class="split_line"></div>
    
    <!-- 工具状态控制 -->
    <div class="control-group">
      <el-button 
        :type="isToolActive ? 'danger' : 'primary'" 
        @click="isToolActive ? stopTool() : startTool()"
        style="margin: 10px;">
        {{ isToolActive ? '停止选择' : '启动选择' }}
      </el-button>
      
      <el-button 
        type="warning" 
        @click="clearSelection" 
        :disabled="!isToolActive" 
        style="margin: 10px;">
        清空选择
      </el-button>
    </div>
    
    <!-- 选择模式设置 -->
    <div class="mode-group">
      <el-form-item label="选择模式" class="ruihua">
        <el-select 
          v-model="selectMode" 
          style="width: 150px; margin-left: 15px;"
          @change="changeSelectMode">
          <el-option 
            v-for="option in selectModeOptions" 
            :key="option.value" 
            :value="option.value" 
            :label="option.label">
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="显示状态" class="ruihua">
        <el-select 
          v-model="selectShowState" 
          style="width: 180px; margin-left: 15px;"
          @change="changeSelectShowState">
          <el-option 
            v-for="option in selectShowStateOptions" 
            :key="option.value" 
            :value="option.value" 
            :label="option.label">
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-button 
        type="info" 
        @click="getCurrentShowState" 
        :disabled="!isToolActive" 
        style="margin: 10px;">
        获取当前状态
      </el-button>
    </div>
    
    <!-- 轮廓线设置 -->
    <div class="outline-settings" v-if="isToolActive && (selectShowState === 'Outline' || selectShowState === 'OutlineAndHighlight')">
      <div class="panel-header">
        <h3>📐 轮廓线设置</h3>
      </div>
      <div class="settings-content">
        <el-form-item label="轮廓线颜色" class="ruihua">
          <div style="display: flex; align-items: center;">
            <el-color-picker 
              v-model="outlineSettings.color"
              show-alpha
              size="large"
              @change="setOutlineColor">
            </el-color-picker>
            <span style="margin-left: 10px; color: #ffffff; font-size: 12px;">{{ outlineSettings.color }}</span>
          </div>
        </el-form-item>
        
        <el-form-item label="轮廓线宽度" class="ruihua">
          <el-input-number 
            v-model="outlineSettings.width" 
            :min="1" 
            :max="10" 
            :step="1"
            style="width: 120px;"
            @change="setOutlineWidth">
          </el-input-number>
          <span style="margin-left: 10px; color: #ffffff; font-size: 12px;">像素</span>
        </el-form-item>
      </div>
    </div>
    
    <!-- 高亮设置 -->
    <div class="highlight-settings" v-if="isToolActive && (selectShowState === 'Highlight' || selectShowState === 'OutlineAndHighlight')">
      <div class="panel-header">
        <h3>🌟 高亮设置</h3>
      </div>
      <div class="settings-content">
        <el-form-item label="高亮颜色" class="ruihua">
          <div style="display: flex; align-items: center;">
            <el-color-picker 
              v-model="highlightSettings.color"
              show-alpha
              size="large"
              @change="setHighlightColor">
            </el-color-picker>
            <span style="margin-left: 10px; color: #ffffff; font-size: 12px;">{{ highlightSettings.color }}</span>
          </div>
        </el-form-item>
      </div>
    </div>
    
    <!-- 当前选中信息 -->
    <div class="selection-info">
      <div class="panel-header">
        <h3>当前选中</h3>
      </div>
      <div class="info-content" :class="{ 'has-selection': selectedInfo.message }">
        <template v-if="selectedInfo.message">
          <p><span class="info-label">消息:</span> {{ selectedInfo.message }}</p>
          <p><span class="info-label">时间:</span> {{ selectedInfo.timestamp }}</p>
        </template>
        <p v-else class="no-selection">无选中对象</p>
      </div>
    </div>
    
    <!-- 工具状态提示 -->
    <div class="status-panel" :class="{ 'active': isToolActive }">
      <p>当前状态: {{ isToolActive ? '工具已激活' : '工具未激活' }}</p>
      <p v-if="isToolActive">当前模式: {{ selectMode }}</p>
      <p v-if="isToolActive">显示状态: {{ selectShowState }}</p>
      <p v-if="isToolActive">请在场景中点击选择对象</p>
      
      <!-- 显示状态说明 -->
      <div v-if="isToolActive" class="state-description">
        <p><strong>显示状态说明:</strong></p>
        <ul>
          <li>🚫 无显示 - 选中对象无视觉反馈</li>
          <li>📐 轮廓线 - 显示选中对象的轮廓线</li>
          <li>🌟 高亮 - 高亮显示选中对象</li>
          <li>✨ 轮廓+高亮 - 同时显示轮廓线和高亮效果</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-group, .mode-group {
  margin: 15px 0;
}

.outline-settings, .highlight-settings {
  margin: 15px 0;
  padding: 10px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
}

.settings-content {
  padding: 10px 0;
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
  
  .state-description {
    margin-top: 10px;
    padding: 8px;
    background: rgba(225, 187, 130, 0.1);
    border-radius: 4px;
    border-left: 3px solid #e1bb82;
    
    p {
      margin: 5px 0;
      color: #e1bb82;
    }
    
    ul {
      margin: 8px 0;
      padding-left: 20px;
      
      li {
        margin: 4px 0;
        color: rgba(225, 187, 130, 0.9);
        font-size: 13px;
        line-height: 1.4;
      }
    }
  }
}

.selection-info {
  margin: 15px 0;
  padding: 10px;
  border-radius: 5px;
  background: rgba(225, 187, 130, 0.05);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(225, 187, 130, 0.2);
  
  h3 {
    margin: 0;
    color: #e1bb82;
    font-size: 16px;
    font-weight: normal;
  }
}

.info-content {
  min-height: 60px;
  
  p {
    margin: 5px 0;
    color: #e1bb82;
  }
  
  .info-label {
    font-weight: bold;
    color: #e1bb82;
    margin-right: 5px;
  }
  
  .no-selection {
    color: rgba(225, 187, 130, 0.5);
    font-style: italic;
  }
  
  &.has-selection {
    background: rgba(225, 187, 130, 0.1);
    padding: 8px;
    border-radius: 4px;
  }
}
</style>
