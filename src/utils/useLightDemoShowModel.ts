import { inject, onBeforeUnmount, onMounted } from 'vue'
import { ShowModel } from './showModelSettings'
import { Weather } from '../components/lib/Scene/Weather.js'
import { requestUE } from './demoRpc.js'

// 两个灯光面板共用 UE 的显示模式。先还原上一个面板，再读取新面板的初始状态。
let pending = Promise.resolve()
function enqueue(operation: () => Promise<void>) {
  pending = pending.then(operation).catch(error => console.error('设置灯光 Demo 显示状态失败', error))
}

export function useLightDemoShowModel() {
  const get = inject<(key: string) => unknown>('getShareData')!
  let session: unknown
  let restoreUnlight = false
  let restoreNormals = false
  let disposed = false
  const sameSession = () => Boolean(session && session === get('viewerSession'))

  onMounted(() => {
    session = get('viewerSession')
    if (!session) return
    enqueue(async () => {
      if (disposed || !sameSession()) return
      const [unlight, normals] = await Promise.all([ShowModel.IsUnlightEnable(), ShowModel.IsGenerateNormal()])
      if (disposed || !sameSession()) return
      if (unlight.bEnable === true) {
        restoreUnlight = true
        await ShowModel.SetUnlightEnable(false)
      }
      if (!disposed && sameSession() && normals.bEnable === false) {
        restoreNormals = true
        await ShowModel.SetGenerateNormal(true)
      }
    })
  })

  onBeforeUnmount(() => {
    disposed = true
    if (!sameSession()) return
    enqueue(async () => {
      if (!sameSession()) return
      await Promise.all([
        requestUE(Weather.className, 'SetTimeOfDay', { timeOfDay: '12:00' }),
        restoreUnlight && ShowModel.SetUnlightEnable(true),
        restoreNormals && ShowModel.SetGenerateNormal(false),
      ])
    })
  })
}
