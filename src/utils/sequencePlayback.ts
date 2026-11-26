import { LevelSequenceControl as SequenceSDK } from '../components/lib/Scene/LevelSequenceControl.js'
import { requestUE } from './demoRpc.js'

export const LevelSequenceControl = {
  setSequence(sequencePath: string) {
    return requestUE(SequenceSDK.className, 'setSequence', {
      sequencePath, canInterrupt: true, playRate: 1, isReversePlay: false, autoPlay: true,
    })
  },
  playSequence: (resetToStart = true) => requestUE(SequenceSDK.className, 'playSequence', { resetToStart }),
  pauseSequence: () => requestUE(SequenceSDK.className, 'pauseSequence'),
  resumeSequence: () => requestUE(SequenceSDK.className, 'resumeSequence'),
  stopSequence: () => requestUE(SequenceSDK.className, 'stopSequence'),
  async getStatus() {
    const status = await SequenceSDK.getStatus()
    return {
      state: 'state' in status && typeof status.state === 'string' ? status.state : 'unknown',
      currentTime: 'currentTime' in status && typeof status.currentTime === 'number' ? status.currentTime : 0,
      duration: 'duration' in status && typeof status.duration === 'number' ? status.duration : 0,
    }
  },
}
