import { computed, inject, reactive, ref } from 'vue'

export function usePolylineDemo() {
  const get = inject<(key: string) => unknown>('getShareData')!
  const set = inject<(key: string, value: unknown) => void>('setShareData')!
  const ready = computed(() => Boolean(get('viewerReady')))
  const lastLayerId = computed({
    get: () => get('lastPolylineLayerId') as string | undefined,
    set: (id: string | undefined) => set('lastPolylineLayerId', id),
  })
  const selectExample = inject<(id: string) => void>('selectExample')!
  const status = ref('')
  type LayerStyle = ReturnType<typeof createLayerStyle>
  const savedDrafts = get('polylineLayerDrafts') as Map<string, LayerStyle> | undefined
  const drafts = savedDrafts ?? reactive(new Map<string, LayerStyle>())
  if (!savedDrafts) set('polylineLayerDrafts', drafts)

  async function run(operation: () => unknown) {
    if (!ready.value) return
    status.value = ''
    try {
      await operation()
    } catch (error) {
      status.value = error instanceof Error ? error.message : String(error)
    }
  }

  return { ready, lastLayerId, drafts, selectExample, status, run }
}

export function createStrokeStyle() {
  return {
    color: [1, 0, 0, 1], thickness: 3, enableDepthTest: true,
    enableSpline: false, interpolateCount: 10,
  }
}

export function createLayerStyle(source: Partial<ReturnType<typeof createStrokeStyle>> = {}) {
  const defaults = createStrokeStyle()
  return {
    color: [...(source.color ?? defaults.color)],
    thickness: source.thickness ?? defaults.thickness,
    enableDepthTest: source.enableDepthTest ?? defaults.enableDepthTest,
    enableSpline: source.enableSpline ?? defaults.enableSpline,
    interpolateCount: source.interpolateCount ?? defaults.interpolateCount,
    depthOffset: 0.1, enableHalo: false, haloWidth: 20, haloIntensity: 0.2, brightness: 1,
  }
}
