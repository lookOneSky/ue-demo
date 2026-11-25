import { inject, onBeforeUnmount } from 'vue'

export function onViewerSessionLeave(cleanup: () => void | Promise<unknown>) {
  const getShareData = inject<(key: string) => unknown>('getShareData')
  const session = getShareData?.('viewerSession')
  onBeforeUnmount(() => {
    if (session && getShareData?.('viewerSession') === session) {
      return cleanup()
    }
  })
}
