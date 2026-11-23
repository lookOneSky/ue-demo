import { onBeforeUnmount, onMounted } from 'vue'
import { ShowModel } from '../components/lib/Scene/ShowModel.js'

/**
 * 灯光 Demo 进入时关闭 Unlight 并开启平滑法线，退出时恢复进入前的状态
 */
export function useLightDemoShowModel() {
  let savedUnlight: boolean | null = null
  let savedGenerateNormal: boolean | null = null
  let hasApplied = false
  let isDisposed = false

  onMounted(async () => {
    try {
      const unlightRes: any = await ShowModel.IsUnlightEnable()
      if (isDisposed) return
      savedUnlight = !!unlightRes?.bEnable

      const generateNormalRes: any = await ShowModel.IsGenerateNormal()
      if (isDisposed) return
      savedGenerateNormal = !!generateNormalRes?.bEnable

      hasApplied = true
      await ShowModel.SetUnlightEnable(false)
      await ShowModel.SetGenerateNormal(true)
    } catch (error) {
      console.error('设置灯光 Demo 显示模式状态失败:', error)
    }
  })

  onBeforeUnmount(() => {
    isDisposed = true
    if (!hasApplied) return

    if (savedUnlight !== null) {
      ShowModel.SetUnlightEnable(savedUnlight)
    }
    if (savedGenerateNormal !== null) {
      ShowModel.SetGenerateNormal(savedGenerateNormal)
    }
  })
}
