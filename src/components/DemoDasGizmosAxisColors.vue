<script setup lang="ts">
import { computed, inject, reactive, watch } from 'vue'
import { DasGizmosOperateTool } from './lib/Tool/DasGizmosOperateTool.js'

const getShareData = inject<(key: string) => unknown>('getShareData')
const ready = computed(() => Boolean(getShareData?.('viewerReady')))
const axes = reactive([
  { id: DasGizmosOperateTool.AxisType.X, label: 'X 轴', color: 'rgba(255, 0, 0, 1)' },
  { id: DasGizmosOperateTool.AxisType.Y, label: 'Y 轴', color: 'rgba(0, 255, 0, 1)' },
  { id: DasGizmosOperateTool.AxisType.Z, label: 'Z 轴', color: 'rgba(0, 0, 255, 1)' },
])

async function setAxisColor(axis: number, color: string | null) {
  if (!color) return
  const [red, green, blue, alpha = 1] = (color.match(/[\d.]+/g) || []).map(Number)
  if (!await DasGizmosOperateTool.setAxisColor(axis, [red / 255, green / 255, blue / 255, alpha])) {
    await loadAxisColors()
  }
}

async function loadAxisColors() {
  await Promise.all(axes.map(async axis => {
    const previous = axis.color
    const [red, green, blue, alpha = 1] = await DasGizmosOperateTool.getAxisColor(axis.id)
    if (axis.color !== previous) return
    axis.color = `rgba(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)}, ${alpha})`
  }))
}

watch(ready, connected => {
  if (connected) void loadAxisColors().catch(console.error)
}, { immediate: true })
</script>

<template>
  <section class="control-section">
    <h4>坐标轴颜色</h4>
    <p>配色应用于 Gizmos 工具。可在车辆变换示例中拖动坐标轴查看效果。</p>
    <el-form label-position="left" label-width="4em" :disabled="!ready">
      <el-form-item v-for="axis in axes" :key="axis.id" :label="axis.label">
        <el-color-picker v-model="axis.color" show-alpha :clearable="false" color-format="rgb" @change="setAxisColor(axis.id, $event)" />
      </el-form-item>
    </el-form>
    <el-button :disabled="!ready" @click="loadAxisColors">读取当前颜色</el-button>
  </section>
</template>
