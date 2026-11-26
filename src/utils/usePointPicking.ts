import { inject, onBeforeUnmount, ref } from 'vue'
import { DasPointsTool } from '../components/lib/Tool/DasPointsTool.js'
import { requestUE } from './demoRpc.js'

export function usePointPicking() {
  const getShareData = inject<(key: string) => unknown>('getShareData')!
  const isToolActive = ref(false)
  const changingTool = ref(false)
  let toolSession: unknown

  async function startTool() {
    const session = getShareData('viewerSession')
    if (!session || changingTool.value || isToolActive.value) return
    toolSession = session
    changingTool.value = true
    try {
      await requestUE(DasPointsTool.className, 'setToCurrent')
      isToolActive.value = toolSession === session && session === getShareData('viewerSession')
    } finally {
      changingTool.value = false
    }
  }

  async function stopTool() {
    if (!toolSession || changingTool.value) return
    changingTool.value = true
    try {
      await requestUE(DasPointsTool.className, 'finishTool')
      isToolActive.value = false
      toolSession = undefined
    } finally {
      changingTool.value = false
    }
  }

  onBeforeUnmount(() => {
    if (toolSession && toolSession === getShareData('viewerSession')) {
      if (!changingTool.value || !isToolActive.value) void requestUE(DasPointsTool.className, 'finishTool').catch(console.error)
    }
    toolSession = undefined
  })

  return { isToolActive, changingTool, startTool, stopTool }
}
