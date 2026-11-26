import createGuid from '../components/lib/guid.js'

const viewerRequests = new WeakMap()

export class DemoRequestError extends Error {}

function messageObject(raw) {
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw) } catch { return }
  }
  if (raw && typeof raw === 'object') return raw
}

/**
 * UE 事件可能直接使用事件名，也可能通过 emitMessage 携带 JSON 消息。
 * @param {string} className
 * @param {string} eventName
 * @param {(payload: Record<string, any>) => void} callback
 */
export function onUEEvent(className, eventName, callback) {
  const viewer = window.viewer
  const key = 'ApiDemoEvent-' + createGuid()
  viewer.addResponseEventListener(key, raw => {
    const event = messageObject(raw)
    if (event?.class !== className) return
    if (event.function === 'emitMessage' && event.messageName === eventName) {
      const payload = messageObject(event.message)
      if (payload) callback(payload)
    } else if (event.function === eventName && !event.commandID) {
      callback(event)
    }
  })
  return () => viewer.removeResponseEventListener(key)
}

function isFailure(reply) {
  return reply?.result === 'Fail' || reply?.result === false || reply?.success === false
}

export function isUESuccess(reply) {
  return !isFailure(reply) && (reply?.result === 'Success' || reply?.result === true || reply?.success === true)
}

function requestChannel(viewer) {
  const existing = viewerRequests.get(viewer)
  if (existing) return existing
  const pending = new Map()
  // 热更新时旧面板可能还在等待回包，各实例分别订阅以免互相覆盖。
  const listenerKey = 'ApiDemoRequests-' + createGuid()
  viewer.addResponseEventListener(listenerKey, raw => {
    const reply = messageObject(raw)
    const request = pending.get(reply?.commandID)
    if (!request || request.className !== reply.class) return
    if (isFailure(reply)) request.reject(new DemoRequestError(request.className + '.' + request.functionName + ' 执行失败'))
    else request.resolve(reply)
  })
  function disconnect() {
    for (const request of pending.values()) request.reject(new DemoRequestError('UE 连接已断开'))
  }
  const events = ['webRtcConnecting', 'dataChannelClose', 'webRtcDisconnected', 'webRtcFailed']
  for (const event of events) viewer.stream.addEventListener(event, disconnect)
  viewer.events?.addEventListener('dispose', disconnect)
  function release(commandID) {
    pending.delete(commandID)
    if (pending.size) return
    viewerRequests.delete(viewer)
    viewer.removeResponseEventListener(listenerKey)
    for (const event of events) viewer.stream.removeEventListener(event, disconnect)
    viewer.events?.removeEventListener('dispose', disconnect)
  }
  const channel = { pending, release }
  viewerRequests.set(viewer, channel)
  return channel
}

/**
 * 调用需要读取原始回包或传入扩展参数的 Demo 命令。
 * @param {string} className
 * @param {string} functionName
 * @param {object} [param]
 * @returns {Promise<Record<string, any>>}
 */
export async function requestUE(className, functionName, param = {}) {
  const viewer = window.viewer
  if (!viewer) throw new DemoRequestError('UE 视口尚未初始化')
  const channel = requestChannel(viewer)
  const commandID = createGuid()
  let timer
  try {
    return await new Promise((resolve, reject) => {
      channel.pending.set(commandID, { className, functionName, resolve, reject })
      timer = setTimeout(() => reject(new DemoRequestError('等待 UE 回包超时')), 60000)
      if (viewer.sendMessage({ class: className, function: functionName, commandID, param }) === false) {
        reject(new DemoRequestError('UE 数据通道未就绪，调用未发送'))
      }
    })
  } finally {
    clearTimeout(timer)
    channel.release(commandID)
  }
}
