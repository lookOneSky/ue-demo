import { inject } from 'vue'

export function useMessageSender() {
  return inject<(message: { action: string; data: unknown }) => void>('onMessage')!
}
