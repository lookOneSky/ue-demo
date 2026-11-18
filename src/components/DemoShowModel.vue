<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ShowModel } from './lib/Scene/ShowModel.js'

// 模式状态
const isWhiteModelEnabled = ref(false)
const isWireframeEnabled = ref(false)
const isTwoSideEnabled = ref(false)
const isUnlightEnabled = ref(false)
const isGenerateNormalEnabled = ref(false)
const isPostProcessEnabled = ref(false)

// 法线反转值（0-1）
const normalInverse = ref(0)

// 颜色状态（用户友好的 0-255 范围）
const displayColor = ref({
  r: 255,
  g: 255,
  b: 255,
  a: 100
})

// 加载状态
const isLoadingWhiteModel = ref(false)
const isLoadingWireframe = ref(false)
const isLoadingTwoSide = ref(false)
const isLoadingUnlight = ref(false)
const isLoadingGenerateNormal = ref(false)
const isLoadingPostProcess = ref(false)
const isLoadingNormalInverse = ref(false)
const isLoadingColor = ref(false)

// 颜色范围转换工具（255→1）
const convertToUEColor = () => {
  return {
    r: displayColor.value.r / 255,
    g: displayColor.value.g / 255,
    b: displayColor.value.b / 255,
    a: displayColor.value.a / 100
  }
}

// 计算颜色预览样式
const previewStyle = computed(() => {
  const { r, g, b, a } = displayColor.value
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${a / 100})`
  }
})

// 切换白膜模式
const toggleWhiteModel = async (newState: boolean) => {
  if (isLoadingWhiteModel.value) return

  isLoadingWhiteModel.value = true
  try {
    await ShowModel.SetWhiteModelEnable(newState)
    isWhiteModelEnabled.value = newState
    console.log('白膜模式已', newState ? '启用' : '禁用')
  } catch (error) {
    console.error('切换白膜模式失败:', error)
  } finally {
    isLoadingWhiteModel.value = false
  }
}

// 切换线框模式
const toggleWireframe = async (newState: boolean) => {
  if (isLoadingWireframe.value) return

  isLoadingWireframe.value = true
  try {
    await ShowModel.SetWireframeEnable(newState)
    isWireframeEnabled.value = newState
    console.log('线框模式已', newState ? '启用' : '禁用')
  } catch (error) {
    console.error('切换线框模式失败:', error)
  } finally {
    isLoadingWireframe.value = false
  }
}

// 切换双面材质模式
const toggleTwoSide = async (newState: boolean) => {
  if (isLoadingTwoSide.value) return

  isLoadingTwoSide.value = true
  try {
    await ShowModel.SetTwoSideEnable(newState)
    isTwoSideEnabled.value = newState
    console.log('双面材质已', newState ? '启用' : '禁用')
  } catch (error) {
    console.error('切换双面材质失败:', error)
  } finally {
    isLoadingTwoSide.value = false
  }
}

// 切换Unlight材质模式
const toggleUnlight = async (newState: boolean) => {
  if (isLoadingUnlight.value) return

  isLoadingUnlight.value = true
  try {
    await ShowModel.SetUnlightEnable(newState)
    isUnlightEnabled.value = newState
    console.log('Unlight材质已', newState ? '启用' : '禁用')
  } catch (error) {
    console.error('切换Unlight材质失败:', error)
  } finally {
    isLoadingUnlight.value = false
  }
}

// 切换平滑法线
const toggleGenerateNormal = async (newState: boolean) => {
  if (isLoadingGenerateNormal.value) return

  isLoadingGenerateNormal.value = true
  try {
    await ShowModel.SetGenerateNormal(newState)
    isGenerateNormalEnabled.value = newState
    console.log('平滑法线已', newState ? '启用' : '禁用')
  } catch (error) {
    console.error('切换平滑法线失败:', error)
  } finally {
    isLoadingGenerateNormal.value = false
  }
}

// 切换后处理
const togglePostProcess = async (newState: boolean) => {
  if (isLoadingPostProcess.value) return

  isLoadingPostProcess.value = true
  try {
    await ShowModel.SetPostProcessEnable(newState)
    isPostProcessEnabled.value = newState
    console.log('后处理已', newState ? '启用' : '禁用')
  } catch (error) {
    console.error('切换后处理失败:', error)
  } finally {
    isLoadingPostProcess.value = false
  }
}

// 设置法线反转
const applyNormalInverse = async (value: number) => {
  if (isLoadingNormalInverse.value) return

  isLoadingNormalInverse.value = true
  try {
    await ShowModel.SetNormalInverse(value)
    console.log('法线反转已设置:', value)
  } catch (error) {
    console.error('设置法线反转失败:', error)
  } finally {
    isLoadingNormalInverse.value = false
  }
}

// 应用纯色
const applyPureColor = async () => {
  if (isLoadingColor.value) return

  isLoadingColor.value = true
  try {
    const ueColor = convertToUEColor()
    await ShowModel.SetPureColor(ueColor)
    console.log('纯色已应用:', ueColor)
  } catch (error) {
    console.error('应用纯色失败:', error)
  } finally {
    isLoadingColor.value = false
  }
}

// 颜色预设
const colorPresets = [
  { name: '白色', r: 255, g: 255, b: 255, a: 100 },
  { name: '灰色', r: 128, g: 128, b: 128, a: 100 },
  { name: '黑色', r: 0, g: 0, b: 0, a: 100 },
  { name: '红色', r: 255, g: 0, b: 0, a: 100 },
  { name: '绿色', r: 0, g: 255, b: 0, a: 100 },
  { name: '蓝色', r: 0, g: 0, b: 255, a: 100 }
]

// 应用预设颜色
const applyPreset = async (preset: typeof colorPresets[0]) => {
  displayColor.value = { ...preset }
  await applyPureColor()
}

// 初始化时从 UE 同步当前显示模式状态
onMounted(async () => {
  const white: any = await ShowModel.IsWhiteModelEnable()
  isWhiteModelEnabled.value = !!white?.bEnable

  const wireframe: any = await ShowModel.IsWireframeEnable()
  isWireframeEnabled.value = !!wireframe?.bEnable

  const twoSide: any = await ShowModel.IsTwoSideEnable()
  isTwoSideEnabled.value = !!twoSide?.bEnable

  const unlight: any = await ShowModel.IsUnlightEnable()
  isUnlightEnabled.value = !!unlight?.bEnable

  const generateNormal: any = await ShowModel.IsGenerateNormal()
  isGenerateNormalEnabled.value = !!generateNormal?.bEnable

  const postProcess: any = await ShowModel.IsPostProcessEnable()
  isPostProcessEnabled.value = !!postProcess?.bEnable

  const res: any = await ShowModel.GetNormalInverse()
  normalInverse.value = res?.normalInverse ?? 0
})
</script>

<template>
  <div>
    <div class="title">模型显示模式</div>
    <div class="split_line"></div>

    <!-- 模式控制区域 -->
    <div class="control-panel">
      <div class="panel-header">
        <h3>🎨 显示模式控制</h3>
      </div>

      <div class="mode-controls">
        <div class="mode-item">
          <div class="mode-label">
            <span>白膜模式</span>
            <span class="status-badge" :class="{ 'enabled': isWhiteModelEnabled }">
              {{ isWhiteModelEnabled ? '✓ 已启用' : '✗ 已禁用' }}
            </span>
          </div>
          <el-switch
            :model-value="isWhiteModelEnabled"
            :loading="isLoadingWhiteModel"
            @change="toggleWhiteModel"
          />
        </div>

        <div class="mode-item">
          <div class="mode-label">
            <span>线框模式</span>
            <span class="status-badge" :class="{ 'enabled': isWireframeEnabled }">
              {{ isWireframeEnabled ? '✓ 已启用' : '✗ 已禁用' }}
            </span>
          </div>
          <el-switch
            :model-value="isWireframeEnabled"
            :loading="isLoadingWireframe"
            @change="toggleWireframe"
          />
        </div>

        <div class="mode-item">
          <div class="mode-label">
            <span>双面材质</span>
            <span class="status-badge" :class="{ 'enabled': isTwoSideEnabled }">
              {{ isTwoSideEnabled ? '✓ 已启用' : '✗ 已禁用' }}
            </span>
          </div>
          <el-switch
            :model-value="isTwoSideEnabled"
            :loading="isLoadingTwoSide"
            @change="toggleTwoSide"
          />
        </div>

        <div class="mode-item">
          <div class="mode-label">
            <span>Unlight材质</span>
            <span class="status-badge" :class="{ 'enabled': isUnlightEnabled }">
              {{ isUnlightEnabled ? '✓ 已启用' : '✗ 已禁用' }}
            </span>
          </div>
          <el-switch
            :model-value="isUnlightEnabled"
            :loading="isLoadingUnlight"
            @change="toggleUnlight"
          />
        </div>

        <div class="mode-item">
          <div class="mode-label">
            <span>平滑法线</span>
            <span class="status-badge" :class="{ 'enabled': isGenerateNormalEnabled }">
              {{ isGenerateNormalEnabled ? '✓ 已启用' : '✗ 已禁用' }}
            </span>
          </div>
          <el-switch
            :model-value="isGenerateNormalEnabled"
            :loading="isLoadingGenerateNormal"
            @change="toggleGenerateNormal"
          />
        </div>

        <div class="mode-item">
          <div class="mode-label">
            <span>后处理</span>
            <span class="status-badge" :class="{ 'enabled': isPostProcessEnabled }">
              {{ isPostProcessEnabled ? '✓ 已启用' : '✗ 已禁用' }}
            </span>
          </div>
          <el-switch
            :model-value="isPostProcessEnabled"
            :loading="isLoadingPostProcess"
            @change="togglePostProcess"
          />
        </div>

        <div class="mode-item">
          <div class="mode-label">
            <span>法线反转</span>
            <span class="status-badge" :class="{ 'enabled': normalInverse > 0 }">
              {{ normalInverse.toFixed(2) }}
            </span>
          </div>
          <el-slider
            v-model="normalInverse"
            :min="0"
            :max="1"
            :step="0.01"
            class="inverse-slider"
            @change="applyNormalInverse"
          />
        </div>
      </div>
    </div>

    <!-- 颜色选择器区域 -->
    <div class="control-panel">
      <div class="panel-header">
        <h3>🎨 纯色设置</h3>
      </div>

      <div class="color-controls">
        <div class="color-preview" :style="previewStyle">
          <span class="preview-label">预览</span>
        </div>

        <div class="sliders">
          <div class="slider-item red">
            <label>R: {{ displayColor.r }}</label>
            <el-slider v-model="displayColor.r" :min="0" :max="255" />
          </div>

          <div class="slider-item green">
            <label>G: {{ displayColor.g }}</label>
            <el-slider v-model="displayColor.g" :min="0" :max="255" />
          </div>

          <div class="slider-item blue">
            <label>B: {{ displayColor.b }}</label>
            <el-slider v-model="displayColor.b" :min="0" :max="255" />
          </div>

          <div class="slider-item alpha">
            <label>A: {{ displayColor.a }}%</label>
            <el-slider v-model="displayColor.a" :min="0" :max="100" />
          </div>
        </div>

        <el-button
          type="primary"
          :loading="isLoadingColor"
          @click="applyPureColor"
          class="apply-button"
        >
          🎨 应用颜色
        </el-button>

        <div class="preset-buttons">
          <el-button
            v-for="preset in colorPresets"
            :key="preset.name"
            size="small"
            :loading="isLoadingColor"
            @click="applyPreset(preset)"
          >
            {{ preset.name }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 功能说明区域 -->
    <div class="info-panel">
      <div class="panel-header">
        <h3>📖 功能说明</h3>
      </div>
      <div class="info-content">
        <ul>
          <li><strong>白膜模式：</strong>将场景模型显示为纯白色，用于查看模型结构</li>
          <li><strong>线框模式：</strong>以线框方式显示模型，用于查看模型拓扑</li>
          <li><strong>双面材质：</strong>模型背面同样渲染，用于查看单面片模型的内部</li>
          <li><strong>Unlight材质：</strong>模型不受光照影响，直接显示自身颜色</li>
          <li><strong>平滑法线：</strong>为 3DTiles 模型生成平滑法线，改善光照渐变效果</li>
          <li><strong>后处理：</strong>关闭后等同控制台 showflag.PostProcessing 0</li>
          <li><strong>法线反转：</strong>0-1 调节模型法线反转程度，用于修正法线朝向错误的模型</li>
          <li><strong>纯色设置：</strong>自定义模型显示颜色（RGBA）</li>
        </ul>

        <div class="usage-tips">
          <p><strong>使用提示：</strong></p>
          <p>• 白膜和线框模式可以同时启用</p>
          <p>• 颜色范围：RGB 0-255，Alpha 0-100%</p>
          <p>• 颜色会自动转换为 UE 的 0-1 范围</p>
          <p>• 使用预设按钮快速应用常用颜色</p>
        </div>
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

.panel-header {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(225, 187, 130, 0.2);

  h3 {
    margin: 0;
    color: #e1bb82;
    font-size: 16px;
    font-weight: 600;
  }
}

.mode-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .mode-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: rgba(225, 187, 130, 0.1);
    border-radius: 6px;

    .mode-label {
      display: flex;
      flex-direction: column;
      gap: 4px;

      > span:first-child {
        color: #e1bb82;
        font-weight: 600;
        font-size: 14px;
      }

      .status-badge {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 4px;
        color: #f56c6c;
        background: rgba(245, 108, 108, 0.1);

        &.enabled {
          color: #67c23a;
          background: rgba(103, 194, 58, 0.1);
        }
      }
    }

    .inverse-slider {
      width: 180px;
    }
  }
}

.color-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .color-preview {
    width: 60px;
    height: 60px;
    border: 2px solid rgba(225, 187, 130, 0.3);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image:
      linear-gradient(45deg, #ccc 25%, transparent 25%),
      linear-gradient(-45deg, #ccc 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #ccc 75%),
      linear-gradient(-45deg, transparent 75%, #ccc 75%);
    background-size: 10px 10px;
    background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
    margin: 0 auto;

    .preview-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.5);
      text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
      font-weight: 600;
    }
  }

  .sliders {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .slider-item {
      label {
        display: block;
        margin-bottom: 4px;
        font-size: 14px;
        font-weight: 500;
      }

      &.red label { color: #f56c6c; }
      &.green label { color: #67c23a; }
      &.blue label { color: #409eff; }
      &.alpha label { color: #909399; }
    }
  }

  .apply-button {
    width: 100%;
    font-weight: 600;
  }

  .preset-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }
}

.info-panel {
  margin: 20px 0;
  padding: 16px;
  background: rgba(225, 187, 130, 0.05);
  border: 1px solid rgba(225, 187, 130, 0.2);
  border-radius: 8px;
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

:deep(.el-switch) {
  --el-switch-on-color: #67c23a;
  --el-switch-off-color: #dcdfe6;
}

:deep(.el-slider__bar) {
  .red & { background-color: #f56c6c; }
  .green & { background-color: #67c23a; }
  .blue & { background-color: #409eff; }
  .alpha & { background-color: #909399; }
}

:deep(.el-slider__button) {
  .red & { border-color: #f56c6c; }
  .green & { border-color: #67c23a; }
  .blue & { border-color: #409eff; }
  .alpha & { border-color: #909399; }
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #409eff, #67c23a);
  border: none;

  &:hover:not(.is-disabled) {
    background: linear-gradient(135deg, #66b1ff, #85ce61);
  }
}
</style>
