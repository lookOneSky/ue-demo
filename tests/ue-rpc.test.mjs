import assert from 'node:assert/strict'
import { test } from 'node:test'
import { requestUE, isUESuccess, onUEEvent } from '../src/utils/demoRpc.js'
import { DasGroupLayer } from '../src/components/lib/Layer/DasGroupLayer.js'
import { DasLayerBase } from '../src/components/lib/Layer/DasLayerBase.js'

function openViewer(t, send) {
  const stream = new EventTarget()
  const listeners = new Map()
  const viewer = {
    stream,
    addResponseEventListener: (key, handler) => listeners.set(key, handler),
    removeResponseEventListener: key => listeners.delete(key),
    sendMessage: message => send(message, reply),
  }
  function reply(message) {
    for (const listener of listeners.values()) listener(JSON.stringify(message))
  }
  const previous = globalThis.window
  globalThis.window = { viewer }
  t.after(() => {
    if (previous === undefined) delete globalThis.window
    else globalThis.window = previous
  })
  return { stream, reply }
}

test('concurrent requests receive only the matching class and command ID', async t => {
  const sent = []
  const { reply } = openViewer(t, message => { sent.push(message) })
  const first = requestUE('Scene', 'getCurrentPawnType')
  const second = requestUE('Scene', 'getOrthoWidth')
  reply({ ...sent[0], class: 'Camera', value: 'unrelated' })
  reply({ ...sent[1], value: 200 })
  reply({ ...sent[0], value: 'Pawn_Universal' })
  assert.equal((await first).value, 'Pawn_Universal')
  assert.equal((await second).value, 200)
})

test('an unsent call or a disconnected channel releases waiting callers', async t => {
  let online = false
  let last
  const { stream, reply } = openViewer(t, message => { last = message; return online })
  const query = () => requestUE('Camera', 'getCameraFlyInfoLLH')
  await assert.rejects(query(), /调用未发送/)
  online = true
  const pending = query()
  stream.dispatchEvent(new Event('dataChannelClose'))
  await assert.rejects(pending, /已断开/)
  reply(last)
  const retried = query()
  reply({ ...last, result: 'Success' })
  assert.equal((await retried).result, 'Success')
})

test('hot-reloaded demo modules can finish pending calls on the same viewer', async t => {
  const reloaded = await import('../src/utils/demoRpc.js?reload')
  const sent = []
  const { stream, reply } = openViewer(t, message => { sent.push(message); return true })
  const first = requestUE('Camera', 'getCameraFlyInfoLLH')
  const second = reloaded.requestUE('DasPointsTool', 'getAll')
  reply({ ...sent[1], value: 'point' })
  reply({ ...sent[0], value: 'camera' })
  // 结束测试会话，若有订阅被覆盖，遗留请求会立即拒绝。
  stream.dispatchEvent(new Event('dataChannelClose'))
  assert.deepEqual((await Promise.all([first, second])).map(r => r.value), ['camera', 'point'])
})

test('demo calls can use SDK layer handles and read nested UE replies', async t => {
  const responses = {
    getRoot: { id: 'root' },
    getAllLayer: { layers: [{ id: 'child', class: 'DasPolylineLayer' }] },
    getParent: { parent: { id: 'root', class: 'DasGroupLayer' } },
    removeInstance: { result: 'Fail' },
  }
  openViewer(t, (request, reply) => {
    queueMicrotask(() => reply({ ...request, ...responses[request.function] }))
    return true
  })
  const root = await DasGroupLayer.getRoot()
  const [child] = await root.getAllLayer()
  assert.ok(child instanceof DasLayerBase)
  const parent = await requestUE(child.getClassName(), 'getParent', { id: child.id })
  assert.equal(parent.parent.id, root.id)
  const removed = await child.removeInstance()
  assert.equal(isUESuccess(removed), false)
  await assert.rejects(requestUE(child.getClassName(), 'removeInstance', { id: child.id }), /removeInstance/)
  assert.equal(child.id, 'child')
})

test('accepts both UE success formats and gives explicit failure precedence', () => {
  for (const reply of [{ result: 'Success' }, { result: true }, { success: true }]) {
    assert.equal(isUESuccess(reply), true)
  }
  for (const reply of [null, {}, { result: 'Fail', success: true }, { result: true, success: false }]) {
    assert.equal(isUESuccess(reply), false)
  }
})

test('tool listeners accept both UE event formats and ignore command replies', t => {
  const { reply } = openViewer(t, () => true)
  const points = []
  const stop = onUEEvent('ToolMeasurementPoint', 'onMeasurementPointUpdate', p => points.push(p.height))
  const message = { class: 'ToolMeasurementPoint', function: 'onMeasurementPointUpdate', height: 1 }
  reply(message)
  reply({ ...message, commandID: 'rpc-confirmation' })
  reply({ ...message, class: 'OtherTool' })
  const event = { ...message, function: 'emitMessage', messageName: message.function }
  reply({ ...event, message: '{"height":2}' })
  reply({ ...event, message: { height: 3 } })
  reply({ ...event, message: 'not JSON' })
  stop()
  reply(message)
  assert.deepEqual(points, [1, 2, 3])
})
