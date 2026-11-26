import { Flags, MessageDirection, OptionParameters } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.3'
import Viewer from '../components/lib/Viewer.js'
import { DemoRequestError } from './demoRpc.js'

// 这些 SDK 类只在第一次使用时注册回调。工作台重新挂载时需把订阅接到新的流。
const singletonKeys = new Set(['DasExcuteReturn', 'DasElectron', 'Scene', 'ScreenShotTileset',
  'DasInformerShape', 'CustomMessage', 'ScreenPosInformer', 'DasUIBillboardLayer'])
const singletonListeners = new Map()

export class DemoViewer extends Viewer {
  channelOpen = false
  events = new EventTarget()
  pending = new Map()

  constructor(options) {
    super(options)
    for (const name of ['XREyeViews', 'XRButtonTouchReleased']) {
      if (!this.stream.toStreamerHandlers.has(name)) this.stream.registerMessageHandler(name, MessageDirection.ToStreamer)
    }
    for (const [key, callback] of singletonListeners) this.addResponseEventListener(key, callback)
    this.stream.addEventListener('dataChannelOpen', () => { this.channelOpen = true })
    // 首帧前可能没有 codecId。保留协商出的有效选项，避免 5.3 SDK 用空统计值设置编码。
    let codecSelected = false
    this.stream.addEventListener('webRtcConnecting', () => { codecSelected = false })
    this.stream.addEventListener('statsReceived', ({ data }) => {
      if (codecSelected) return
      const stats = data.aggregatedStats
      if (stats.codecs.get(stats.inboundVideoStats.codecId)) return
      const config = this.stream.config
      const setting = config.getSettingOption(OptionParameters.PreferredCodec)
      const codec = setting.options.includes(setting.selected) ? setting.selected : setting.options[0]
      if (codec) {
        config.setOptionSettingValue(OptionParameters.PreferredCodec, codec)
        codecSelected = true
      }
    })
    for (const event of ['webRtcConnecting', 'dataChannelClose', 'webRtcDisconnected', 'webRtcFailed']) {
      this.stream.addEventListener(event, () => this.closeRequests())
    }
    super.addResponseEventListener('ApiDemoCommandStatus', raw => {
      let reply
      try { reply = JSON.parse(raw) } catch { return }
      const command = this.pending.get(reply?.commandID)
      if (command && command.className === reply.class) {
        clearTimeout(command.timer)
        this.pending.delete(reply.commandID)
      }
    })
  }

  setKeyboardInput(enabled) {
    const config = this.stream.config
    if (config.isFlagEnabled(Flags.KeyboardInput) !== enabled) config.setFlagEnabled(Flags.KeyboardInput, enabled)
  }

  addResponseEventListener(key, callback) {
    if (singletonKeys.has(key)) singletonListeners.set(key, callback)
    super.addResponseEventListener(key, raw => {
      // SDK 的类监听器会直接解析 JSON，数据通道也可能携带普通文本。
      if (!key.startsWith('ApiDemo')) {
        try { if (!JSON.parse(raw)) return } catch { return }
      }
      callback(raw)
    })
  }

  removeResponseEventListener(key) {
    singletonListeners.delete(key)
    super.removeResponseEventListener(key)
  }

  sendMessage(message) {
    const { commandID } = message
    const sent = this.channelOpen && this.stream.emitUIInteraction(message) !== false
    if (!commandID) return sent
    this.events.dispatchEvent(new CustomEvent('ueCommand', { detail: { ...message, sent } }))
    if (!sent) throw new DemoRequestError('UE 数据通道未就绪，调用未发送')
    const timer = setTimeout(() => this.commandError(commandID, '等待 UE 回包超时'), 60000)
    this.pending.set(commandID, { timer, className: message.class })
    return true
  }

  commandError(commandID, message) {
    const command = this.pending.get(commandID)
    if (!command) return
    clearTimeout(command.timer)
    this.pending.delete(commandID)
    window.gmapClass?.get(command.className)?.delete(commandID)
    this.events.dispatchEvent(new CustomEvent('ueCommandError', { detail: { commandID, message } }))
  }

  closeRequests() {
    this.channelOpen = false
    for (const id of this.pending.keys()) this.commandError(id, 'UE 连接已断开')
  }

  dispose() {
    this.closeRequests()
    this.events.dispatchEvent(new Event('dispose'))
    super.dispose()
  }
}
