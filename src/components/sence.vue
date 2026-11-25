<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref } from 'vue'
import Viewer from './lib/Viewer.js'
import DasElectron from './lib/Scene/DasElectron.js'

declare global {
  interface Window { viewer: any }
}

const emit = defineEmits<{
  status: [ready: boolean, label: string]
  command: [message: { commandID: string; class: string; function: string; sent: boolean }]
  response: [message: string]
  commandError: [error: { commandID: string; message: string }]
}>()
const setShareData = inject<(key: string, value: unknown) => void>('setShareData')
const addHandler = inject<(handler: (message: { action: string; data: unknown }) => void) => () => void>('addHandler')
const player = ref<HTMLElement>()
const hasVideo = ref(false)
let viewer: InstanceType<typeof Viewer>
let observer: ResizeObserver | undefined
let unsubscribe: (() => void) | undefined
let frame = 0
const listeners = new AbortController()
let connected = false

function setStatus(ready: boolean, label: string) {
  if (connected !== ready) {
    connected = ready
    setShareData?.('viewerSession', ready ? {} : null)
  }
  setShareData?.('viewerReady', ready)
  emit('status', ready, label)
}

function updateKeyboard(event: Event) {
  viewer.setKeyboardInput(event.target instanceof Node && Boolean(player.value?.contains(event.target)))
}

// The bundled SDK recalculates its pointer coordinates on a window resize.
function resizePlayer() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    window.dispatchEvent(new Event('resize'))
  })
}

onMounted(() => {
  const signalServer = import.meta.env.VITE_SIGNAL_SERVER_URL?.trim() || 'ws://127.0.0.1:6543'
  viewer = new Viewer({ InputControllers: [], useUrlParams: false, hideDefaultUI: true, signalServer })
  window.viewer = viewer
  player.value!.appendChild(viewer.rootElement)
  DasElectron.initListener()
  viewer.setKeyboardInput(false)
  const stream = viewer.stream
  let channelOpen = false
  function reportReady() {
    if (channelOpen) {
      const video = player.value?.querySelector('video')
      const canSend = Boolean(video && video.readyState > 0)
      setStatus(canSend, canSend ? 'UE 视口已连接' : '正在准备视频')
    }
  }
  stream.addEventListener('webRtcConnecting', () => { channelOpen = false; setStatus(false, '正在连接 UE') })
  stream.addEventListener('dataChannelOpen', () => { channelOpen = true; reportReady() })
  stream.addEventListener('dataChannelClose', () => { channelOpen = false; setStatus(false, '数据通道已关闭') })
  stream.addEventListener('webRtcFailed', () => { channelOpen = false; hasVideo.value = false; setStatus(false, '连接失败') })
  stream.addEventListener('webRtcDisconnected', () => { channelOpen = false; hasVideo.value = false; setStatus(false, 'UE 已断开') })
  stream.addEventListener('videoInitialized', reportReady)
  stream.addEventListener('playStream', () => { hasVideo.value = true; reportReady() })
  player.value!.addEventListener('loadedmetadata', reportReady, { capture: true, signal: listeners.signal })
  player.value!.addEventListener('playing', event => {
    if (event.target instanceof HTMLVideoElement) { hasVideo.value = true; reportReady() }
  }, { capture: true, signal: listeners.signal })
  viewer.addEventListener('ueCommand', event => emit('command', (event as CustomEvent).detail))
  viewer.addEventListener('ueCommandError', event => emit('commandError', (event as CustomEvent).detail))
  viewer.addResponseEventListener('ApiDemoWorkbench', (raw: string) => emit('response', raw))
  unsubscribe = addHandler?.(({ action, data }) => viewer.sendMessage({
    EventName: action, Params: typeof data === 'object' ? JSON.stringify(data) : data
  }))
  observer = new ResizeObserver(resizePlayer)
  observer.observe(player.value!)
  window.addEventListener('scroll', event => {
    if (event.target === document || (event.target instanceof Element && event.target.contains(player.value!))) resizePlayer()
  }, { capture: true, passive: true, signal: listeners.signal })
  for (const name of ['pointerdown', 'focusin']) {
    document.addEventListener(name, updateKeyboard, { capture: true, signal: listeners.signal })
  }
})

onBeforeUnmount(() => {
  setStatus(false, 'UE 已断开')
  listeners.abort()
  observer?.disconnect()
  unsubscribe?.()
  cancelAnimationFrame(frame)
  viewer?.removeResponseEventListener('ApiDemoWorkbench')
  viewer?.dispose()
  if (window.viewer === viewer) {
    window.viewer = undefined
  }
})
</script>

<template>
  <div id="player" ref="player" class="stream-host" :class="{ 'has-video': hasVideo }" aria-label="UE 实时场景">
    <div v-if="!hasVideo" class="cover-credit">连接封面 · 武当山</div>
  </div>
</template>

<style scoped>
.stream-host { position: relative; isolation: isolate; background: #213956 url('../assets/images/dongji.png') center 53% / cover no-repeat; width: 100%; height: 100%; overflow: hidden; }
.cover-credit { position: absolute; z-index: 2; left: 14px; bottom: 12px; pointer-events: none; border-radius: 4px; background: #102641bd; padding: 4px 8px; color: white; font-size: 11px; }
.stream-host :deep(#playerUI) { position: absolute; inset: 0; }
.stream-host:not(.has-video) :deep(#videoElementParent) { background: transparent; }
.stream-host:not(.has-video) :deep(video) { opacity: 0; }
.stream-host :deep(:is(#playOverlay, #infoOverlay, #disconnectOverlay, #connectOverlay, #errorOverlay, #afkOverlay)) {
  background: linear-gradient(180deg, #10264a1c, #0c1c3b66); padding: 16px; color: white;
  font: 600 14px/1.6 Inter, "Microsoft YaHei UI", sans-serif; text-transform: none; text-shadow: 0 1px 5px #132e52;
}
.stream-host :deep(#playOverlay.clickableState)::after { content: '▷　播放实时场景'; background: #174bb6; color: white; padding: 8px 16px; border-radius: 5px; }
.stream-host :deep(#playButton) { display: none; }
</style>
