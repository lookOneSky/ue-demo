import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ExcuteUEFun } from '../src/components/lib/ExcuteUEFun.js'
import { DasGroupLayer } from '../src/components/lib/Layer/DasGroupLayer.js'
import { DasLayerBase } from '../src/components/lib/Layer/DasLayerBase.js'

function openViewer(t, send) {
  const stream = new EventTarget()
  const listeners = new Map()
  const viewer = {
    stream,
    addResponseEventListener: (key, handler) => listeners.set(key, handler),
    sendMessage: message => send(message, reply),
  }
  function reply(message) {
    listeners.get('DasExcuteReturn')(JSON.stringify(message))
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
  const first = ExcuteUEFun.excuteUEFunction('Scene', 'getCurrentPawnType', {})
  const second = ExcuteUEFun.excuteUEFunction('Scene', 'getOrthoWidth', {})
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
  const query = () => ExcuteUEFun.excuteUEFunction('Camera', 'getCameraFlyInfoLLH', {})
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

test('layer queries decode nested objects and failed removal preserves the handle', async t => {
  const responses = {
    getRoot: { id: 'root' },
    getLayer: { layer: { id: 'child', class: 'DasPolylineLayer', layerID: 'line' } },
    getParent: { parent: { id: 'root', class: 'DasGroupLayer' } },
    removeInstance: { result: 'Fail' },
  }
  openViewer(t, (request, reply) => reply({ ...request, ...responses[request.function] }))
  const root = await DasGroupLayer.getRoot()
  const child = await root.getLayer(0)
  assert.ok(child instanceof DasLayerBase)
  assert.equal(child.layerID, 'line')
  assert.equal((await child.getParent()).id, root.id)
  await assert.rejects(child.removeInstance(), /removeInstance/)
  assert.equal(child.id, 'child')
})
