<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { DasCompass } from './lib/Scene/DasCompass.js'

// 指北针显示状态
const isCompassVisible = ref(false)
// 操作状态
const isLoading = ref(false)

// 显示指北针
const showCompass = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    const success = await DasCompass.ShowCompass()
    if (success) {
      isCompassVisible.value = true
      console.log('指北针已显示')
    } else {
      console.error('显示指北针失败')
    }
  } catch (error) {
    console.error('显示指北针时发生错误:', error)
  } finally {
    isLoading.value = false
  }
}

// 隐藏指北针
const hideCompass = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  try {
    const success = await DasCompass.HideCompass()
    if (success) {
      isCompassVisible.value = false
      console.log('指北针已隐藏')
    } else {
      console.error('隐藏指北针失败')
    }
  } catch (error) {
    console.error('隐藏指北针时发生错误:', error)
  } finally {
    isLoading.value = false
  }
}

// 切换指北针显示状态
const toggleCompass = async () => {
  if (isCompassVisible.value) {
    await hideCompass()
  } else {
    await showCompass()
  }
}
</script>

<template>
  <div>
    <div class="title">指北针控制</div>
    <div class="split_line"></div>
    
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="status-display">
        <div class="status-item">
          <span class="status-label">当前状态:</span>
          <span class="status-value" :class="{ 'visible': isCompassVisible, 'hidden': !isCompassVisible }">
            {{ isCompassVisible ? '🧭 已显示' : '❌ 已隐藏' }}
          </span>
        </div>
      </div>
      
      <div class="button-group">
        <el-button 
          type="primary" 
          :loading="isLoading"
          :disabled="isCompassVisible"
          @click="showCompass">
          🧭 显示指北针
        </el-button>
        
        <el-button 
          type="danger" 
          :loading="isLoading"
          :disabled="!isCompassVisible"
          @click="hideCompass">
          ❌ 隐藏指北针
        </el-button>
        
        <el-button 
          type="warning" 
          :loading="isLoading"
          @click="toggleCompass">
          🔄 切换显示
        </el-button>
      </div>
    </div>
    
    <!-- 功能说明 -->
    <div class="info-panel">
      <div class="panel-header">
        <h3>🧭 指北针功能说明</h3>
      </div>
      <div class="info-content">
        <ul>
          <li><strong>显示指北针：</strong>在场景中显示方向指示器</li>
          <li><strong>隐藏指北针：</strong>隐藏场景中的方向指示器</li>
          <li><strong>切换显示：</strong>根据当前状态自动切换显示/隐藏</li>
        </ul>
        
        <div class="usage-tips">
          <p><strong>使用提示：</strong></p>
          <p>• 指北针可以帮助用户在3D场景中确定方向</p>
          <p>• 适用于需要导航或定位功能的应用场景</p>
          <p>• 可以与相机控制功能配合使用</p>
        </div>
      </div>
    </div>
    
    <!-- 操作日志 -->
    <div class="log-panel" v-if="isLoading">
      <div class="loading-indicator">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>正在执行操作...</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.control-panel {
  margin: 20px 0;
  padding: 20px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 8px;
}

.status-display {
  margin-bottom: 20px;
  
  .status-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: rgba(225, 187, 130, 0.1);
    border-radius: 6px;
    
    .status-label {
      color: #e1bb82;
      font-weight: 600;
      font-size: 14px;
    }
    
    .status-value {
      font-size: 16px;
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 4px;
      
      &.visible {
        color: #67c23a;
        background: rgba(103, 194, 58, 0.1);
      }
      
      &.hidden {
        color: #f56c6c;
        background: rgba(245, 108, 108, 0.1);
      }
    }
  }
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  
  .el-button {
    min-width: 120px;
    font-weight: 500;
  }
}

.info-panel {
  margin: 20px 0;
  padding: 16px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 8px;
}

.panel-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(225, 187, 130, 0.2);
  
  h3 {
    margin: 0;
    color: #e1bb82;
    font-size: 16px;
    font-weight: 600;
  }
}

.info-content {
  ul {
    margin: 0 0 16px 0;
    padding-left: 20px;
    
    li {
      margin: 8px 0;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.5;
      
      strong {
        color: #e1bb82;
      }
    }
  }
  
  .usage-tips {
    padding: 12px;
    background: rgba(225, 187, 130, 0.1);
    border-radius: 6px;
    border-left: 3px solid #e1bb82;
    
    p {
      margin: 6px 0;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      line-height: 1.4;
      
      strong {
        color: #e1bb82;
      }
    }
  }
}

.log-panel {
  margin: 20px 0;
  padding: 16px;
  background: rgba(225, 187, 130, 0.08);
  border: 1px solid rgba(225, 187, 130, 0.3);
  border-radius: 8px;
  
  .loading-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #e1bb82;
    
    .el-icon {
      font-size: 16px;
    }
    
    span {
      font-size: 14px;
    }
  }
}

// Element Plus 按钮样式覆盖
:deep(.el-button.is-disabled) {
  opacity: 0.5;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #409eff, #67c23a);
  border: none;
  
  &:hover:not(.is-disabled) {
    background: linear-gradient(135deg, #66b1ff, #85ce61);
  }
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #f56c6c, #ff8a8a);
  border: none;
  
  &:hover:not(.is-disabled) {
    background: linear-gradient(135deg, #f78989, #ffb3b3);
  }
}

:deep(.el-button--warning) {
  background: linear-gradient(135deg, #e6a23c, #f7ba2a);
  border: none;
  
  &:hover:not(.is-disabled) {
    background: linear-gradient(135deg, #ebb563, #f9ca4d);
  }
}

</style> 