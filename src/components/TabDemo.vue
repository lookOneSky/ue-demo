<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onErrorCaptured, onMounted, provide, ref, type Component } from 'vue'
import { DemoRequestError } from '../utils/demoRpc.js'
import WorkbenchIcon from './WorkbenchIcon.vue'
import SceneViewport from './sence.vue'
import ApiDemoCatalog from './ApiDemoCatalog.vue'
import ApiExampleOutput from './ApiExampleOutput.vue'
import ApiStyleGuide from './ApiStyleGuide.vue'
import ApiReference from './ApiReference.vue'
import { demoCatalog, type CatalogNode } from './demoCatalog'

const panels = import.meta.glob<Component>(
  ['./Demo*.vue', './Das*Demo.vue', './ScreenPosInformerDemo.vue', './SceneDemo.vue', './levelSequence.vue', './weatherDemo.vue'],
  { eager: true, import: 'default' },
)

function indexPaths(nodes: CatalogNode[], parents: CatalogNode[] = []): [string, CatalogNode[]][] {
  return nodes.flatMap(node => {
    const path = [...parents, node]
    return node.children ? indexPaths(node.children, path) : [[node.id, path] as [string, CatalogNode[]]]
  })
}
const paths = new Map(indexPaths(demoCatalog))
const selected = ref('camera-universal')
const path = computed(() => paths.get(selected.value)!)
const entry = computed(() => path.value[path.value.length - 1]!)
const component = computed(() => panels['./' + entry.value.file + '.vue'])
const camera = computed(() => selected.value === 'camera-universal')
// These panels already gate their UE commands and offer local actions before connection.
const handlesOffline = computed(() => camera.value || [
  'polylineTool', 'polylineLayer', 'videoCompositeLayer', 'gizmosAxisColors', 'closeElectronApp',
].includes(selected.value))
const title = computed(() => entry.value.name)

const guide = ref(false)
const catalog = ref<InstanceType<typeof ApiDemoCatalog>>()
const reference = ref<InstanceType<typeof ApiReference>>()
const cameraPanel = ref<{ reset: () => void }>()
const catalogButton = ref<HTMLButtonElement>()
const parameterBody = ref<HTMLElement>()
const activePanelButton = ref<HTMLButtonElement>()
const activeSceneButton = ref<HTMLButtonElement>()
const main = ref<HTMLElement>()
const compact = window.matchMedia('(max-width: 900px)')
const catalogOpen = ref(!compact.matches)
const isCompact = ref(compact.matches)
const expanded = ref<'scene' | 'parameters' | null>(null)
const ready = ref(false)
const connection = ref('正在连接 UE')
const sessionNumber = ref(0)
const result = ref('')
const snippet = ref('')
const showResult = ref(false)
let lastCommand = ''

onErrorCaptured((error, component) => {
  if (!(error instanceof DemoRequestError)) return
  if (component?.$el?.isConnected) {
    result.value = error.message
    showResult.value = true
  }
  return false
})

function selectExample(id: string) {
  if (!paths.has(id)) return
  if (selected.value !== id) {
    lastCommand = ''
    result.value = ''
    snippet.value = ''
    showResult.value = false
    selected.value = id
    if (parameterBody.value) parameterBody.value.scrollTop = 0
  }
  showGuide(false)
  if (compact.matches) {
    catalogOpen.value = false
    nextTick(() => main.value?.focus({ preventScroll: true }))
  }
}
provide('selectExample', selectExample)

function showGuide(open: boolean) {
  guide.value = open
  if (compact.matches) catalogOpen.value = false
  document.title = (open ? '样式规范' : title.value) + ' · DAS API Demo'
  window.scrollTo(0, 0)
}
function toggleCatalog(open: boolean) {
  catalogOpen.value = open
  nextTick(() => open ? catalog.value?.focusSearch() : catalogButton.value?.focus())
}
function onResize() {
  isCompact.value = compact.matches
  catalogOpen.value = !compact.matches
}
function expand(which: 'scene' | 'parameters') {
  expanded.value = expanded.value === which ? null : which
  nextTick(() => (which === 'scene' ? activeSceneButton : activePanelButton).value?.focus())
}
function shortcut(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (expanded.value) expand(expanded.value)
    else if (compact.matches && catalogOpen.value) toggleCatalog(false)
  }
  const target = event.target as HTMLElement | null
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !expanded.value &&
      !target?.closest('input, select, textarea, [contenteditable=true], #player')) {
    event.preventDefault()
    toggleCatalog(true)
  }
}
function setConnection(connected: boolean, label: string) {
  if (connected && !ready.value) sessionNumber.value++
  ready.value = connected
  connection.value = label
  if (!connected && lastCommand) {
    lastCommand = ''
    result.value = 'UE 连接已断开，本次调用尚未收到返回。'
  }
}
function onCameraResult(value: string) {
  result.value = value
  showResult.value = Boolean(value)
}
function onCommand(message: { commandID: string; class: string; function: string; sent: boolean }) {
  if (camera.value) return
  lastCommand = message.sent ? message.commandID : ''
  result.value = message.class + '.' + message.function + (message.sent ? '　等待 UE 返回…' : '　当前视口未就绪，调用未发送。')
}
function onCommandError(error: { commandID: string; message: string }) {
  if (lastCommand !== error.commandID) return
  lastCommand = ''
  result.value = error.message
}
function onResponse(raw: string) {
  if (!lastCommand) return
  try {
    const data = JSON.parse(raw)
    if (data?.commandID !== lastCommand) return
    lastCommand = ''
    const display = JSON.stringify(data, null, 2)
    result.value = display.length > 12000 ? display.slice(0, 12000) + '\n…（仅显示前 12000 个字符）' : display
  } catch { /* Other stream events can contain plain text. */ }
}
onMounted(() => {
  compact.addEventListener('change', onResize)
  window.addEventListener('keydown', shortcut)
  document.title = title.value + ' · DAS API Demo'
})
onBeforeUnmount(() => {
  compact.removeEventListener('change', onResize)
  window.removeEventListener('keydown', shortcut)
})
</script>

<template>
  <div class="api-workbench" :class="{ 'with-catalog': catalogOpen, 'has-expanded': expanded }">
    <a class="skip-link" href="#workbench-main">跳到工作区</a>
    <header class="studio-bar" :inert="!!expanded">
      <button v-show="!catalogOpen || isCompact" ref="catalogButton" class="studio-tool catalog-trigger" type="button"
        aria-label="切换示例目录" :aria-expanded="catalogOpen" aria-controls="workbench-catalog" @click="toggleCatalog(!catalogOpen)"><WorkbenchIcon name="menu" /></button>
      <div class="studio-brand"><img src="/das-api.svg" alt=""><strong>DAS</strong><i></i><span>API Demo</span></div>
      <nav class="studio-links" aria-label="工作区视图">
        <button type="button" :aria-current="!guide ? 'page' : undefined" @click="showGuide(false)"><WorkbenchIcon name="grid" />示例工作台</button>
        <button type="button" :aria-current="guide ? 'page' : undefined" @click="showGuide(true)"><WorkbenchIcon name="palette" />样式规范</button>
      </nav>
      <span class="header-status" :class="{ online: ready }" role="status"><i></i>{{ connection }}</span>
      <button v-if="!guide" class="reference-trigger" type="button" aria-label="接口参考" @click="reference?.open()"><WorkbenchIcon name="book" /><span>接口参考</span></button>
    </header>
    <div class="studio-layout">
      <button v-if="isCompact && catalogOpen" class="drawer-backdrop" aria-label="关闭目录" @click="toggleCatalog(false)"></button>
      <aside v-show="catalogOpen" id="workbench-catalog" class="studio-catalog" :inert="!!expanded">
        <ApiDemoCatalog ref="catalog" :items="demoCatalog" :active-id="guide ? '' : selected" @select="selectExample" @close="toggleCatalog(false)" />
      </aside>
      <main id="workbench-main" ref="main" class="studio-main" tabindex="-1" :inert="isCompact && catalogOpen">
        <ApiStyleGuide v-if="guide" />
        <div v-show="!guide">
          <div class="workspace-intro" :inert="!!expanded">
            <nav class="studio-crumb" aria-label="当前位置"><WorkbenchIcon name="grid" /><span>示例工作台</span><template v-for="item in path" :key="item.id"><WorkbenchIcon name="chevron" /><span>{{ item.name }}</span></template></nav>
            <div class="studio-title"><h1>{{ title }}</h1><code v-if="entry.owner">{{ entry.owner }}</code></div>
            <p v-if="entry.description">{{ entry.description }}</p>
          </div>
          <div class="studio-workarea">
            <section class="studio-card scene-card" :class="{ enlarged: expanded === 'scene' }" :inert="expanded === 'parameters'" aria-label="场景视口">
              <header class="studio-card-head">
                <h2><WorkbenchIcon name="cube" />场景视口</h2>
                <button ref="activeSceneButton" type="button" class="studio-tool" :aria-expanded="expanded === 'scene'" @click="expand('scene')">
                  <WorkbenchIcon name="expand" />{{ expanded === 'scene' ? '还原视口' : '放大视口' }}
                </button>
              </header>
              <div class="scene-surface"><SceneViewport @status="setConnection" @command="onCommand" @response="onResponse" @command-error="onCommandError" /></div>
              <footer class="scene-foot"><span><span class="signal-dot" :class="{ online: ready }"></span>{{ connection }}</span><span>Pixel Streaming · UE 5.3</span></footer>
            </section>
            <section class="studio-card parameters-card" :class="{ enlarged: expanded === 'parameters' }" :inert="expanded === 'scene'" aria-label="参数配置">
              <header class="studio-card-head">
                <h2><WorkbenchIcon name="sliders" />参数配置</h2>
                <div class="studio-actions">
                  <button v-if="camera" type="button" class="studio-tool" @click="cameraPanel?.reset()"><WorkbenchIcon name="reset" />重置</button>
                  <button ref="activePanelButton" type="button" class="studio-tool square" :aria-expanded="expanded === 'parameters'"
                    :aria-label="expanded === 'parameters' ? '还原参数面板' : '放大参数面板'" :title="expanded === 'parameters' ? '还原参数面板' : '放大参数面板'" @click="expand('parameters')">
                    <WorkbenchIcon :name="expanded === 'parameters' ? 'restore' : 'expand'" />
                  </button>
                </div>
              </header>
              <p v-if="!ready && !handlesOffline" class="panel-connection-note">连接 UE 场景后即可操作参数。</p>
              <div ref="parameterBody" class="demo-panel-content" :class="{ 'legacy-panel': !camera }" :inert="!handlesOffline && !ready">
                <component v-if="camera" :is="component" ref="cameraPanel" :ready="ready" @snippet="snippet = $event" @result="onCameraResult" />
                <component v-else :is="component" :key="handlesOffline ? selected : selected + sessionNumber" />
              </div>
            </section>
          </div>
          <div :inert="!!expanded" class="studio-output">
            <ApiExampleOutput v-model:show-result="showResult" :file="entry.file!" :snippet="snippet" :result="result" />
          </div>
        </div>
      </main>
    </div>
    <ApiReference ref="reference" :owner="entry.owner || ''" :file="entry.file!" />
  </div>
</template>
