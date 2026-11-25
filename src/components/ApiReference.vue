<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { loadDemoSource } from './demoSources'

const props = defineProps<{ owner: string; file: string }>()
const sdk = import.meta.glob<string>(['./lib/{Layer,Scene,Tool}/**/*.js', './lib/DasClassBase.js'], { query: '?raw', import: 'default' })
const id = useId()
const dialog = ref<HTMLDialogElement>()
const visible = ref(false)
const modules = ref<{ name: string, path: string }[]>([])
const selected = ref('')
const source = ref('')
const status = ref('')
const filter = ref('')

async function open() {
  if (visible.value) return
  visible.value = true
  await nextTick()
  dialog.value?.showModal()
}
defineExpose({ open })

watch(() => [visible.value, props.file] as const, async ([show, file], _, onCleanup) => {
  let live = true
  onCleanup(() => { live = false })
  modules.value = []
  selected.value = ''
  status.value = ''
  if (!show) return
  status.value = '正在读取接口…'
  try {
    const vueFile = await loadDemoSource(file)
    if (!live) return
    const script = vueFile.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i)?.[1] || ''
    const imports = /^\s*import\s+([^'";]+?)\s+from\s*['"](\.\/lib\/[^'"]+)['"]/gm
    const referenced: typeof modules.value = []
    for (const match of script.matchAll(imports)) {
      const path = match[2].endsWith('.js') ? match[2] : match[2] + '.js'
      const clause = match[1].trim()
      if (!sdk[path] || clause.startsWith('type ')) continue
      const symbols = clause.startsWith('* as ')
        ? [path.slice(path.lastIndexOf('/') + 1, -3)]
        : clause.replace(/[{}]/g, '').split(',').map(name => name.trim())
      for (const symbol of symbols) {
        if (!symbol || symbol.startsWith('type ')) continue
        const name = symbol.split(/\s+as\s+/)[0]
        if (!referenced.some(item => item.name === name && item.path === path)) referenced.push({ name, path })
      }
    }
    modules.value = referenced
    const owners = props.owner.split(/\s*·\s*/)
    selected.value = owners.find(name => referenced.some(item => item.name === name)) || referenced[0]?.name || ''
    if (!selected.value) status.value = '此示例未直接引用 SDK 模块。'
  } catch {
    if (live) status.value = '暂时无法读取示例源码。'
  }
})

const currentModule = computed(() => modules.value.find(item => item.name === selected.value))
watch(currentModule, async (item, _, onCleanup) => {
  let live = true
  onCleanup(() => { live = false })
  source.value = ''
  filter.value = ''
  if (!item) return
  status.value = '正在读取接口…'
  try {
    const text = await sdk[item.path]()
    if (live) { source.value = text.replace(/\r\n?/g, '\n'); status.value = '' }
  } catch {
    if (live) status.value = '暂时无法读取 SDK 源码。'
  }
})

// SDK files define one class apiece. Preserve the signature and its preceding
// documentation verbatim, including class fields assigned to async functions.
const methods = computed(() => {
  const text = source.value
  const declarations = /^ {4}((?:(?:static|async|get|set)\s+)*([\w$]+)(?:\s*=\s*(?:async\s+)?function)?\s*\([^)]*\))\s*\{/gm
  return Array.from(text.matchAll(declarations)).filter(match => match[2] !== 'constructor').map(match => {
    const before = text.slice(0, match.index).trimEnd()
    let doc = ''
    if (before.endsWith('*/')) {
      const start = before.lastIndexOf('/*')
      if (start >= 0) doc = before.slice(start + 2, -2).replace(/^\s*\*+\s?/gm, '').trim()
    } else {
      doc = before.match(/(?:^|\n)((?:[ \t]*\/\/[^\n]*(?:\n|$))+)$/)?.[1] || ''
      doc = doc.replace(/^\s*\/{2,3}\s?/gm, '').trim()
    }
    const [summary, ...details] = doc.split('\n')
    return { name: match[2], signature: match[1], summary, details: details.join('\n') }
  })
})
const visibleMethods = computed(() => methods.value.filter(method => method.name.toLowerCase().includes(filter.value.trim().toLowerCase())))
const baseClass = computed(() => source.value.match(/^class\s+[\w$]+\s+extends\s+([\w$]+)/m)?.[1])
const parentModule = computed(() => {
  const name = baseClass.value
  const current = currentModule.value
  if (!name || !current) return
  const imports = /^\s*import\s+([^'";]+?)\s+from\s*['"](\.[^'"]+)['"]/gm
  for (const [, names, relative] of source.value.matchAll(imports)) {
    if (!names.replace(/[{}]/g, '').split(',').some(symbol => symbol.trim().split(/\s+as\s+/).pop() === name)) continue
    const path = '.' + new URL(relative, 'file:///' + current.path.slice(2)).pathname
    if (sdk[path]) return { name, path }
  }
})

function showParent() {
  const parent = parentModule.value
  if (!parent) return
  if (!modules.value.some(item => item.name === parent.name)) modules.value.push(parent)
  selected.value = parent.name
}
</script>

<template>
  <dialog ref="dialog" class="reference" :aria-labelledby="id" @close="visible = false"
    @click="($event.target === dialog) && dialog?.close()">
    <section v-if="visible" class="reference-sheet">
      <header>
        <h2 :id="id">接口参考</h2>
        <form method="dialog"><button class="close" type="submit" aria-label="关闭接口参考" autofocus>×</button></form>
      </header>
      <div class="tools">
        <label v-if="modules.length > 1">SDK 类
          <select v-model="selected"><option v-for="item in modules" :key="item.name" :value="item.name">{{ item.name }}</option></select>
        </label>
        <span v-else-if="selected" class="single-class">{{ selected }}</span>
        <label v-if="methods.length" class="search">查找方法<input v-model="filter" type="search" placeholder="输入方法名" /></label>
      </div>
      <div :key="file + selected" class="reference-body">
        <p v-if="status" role="status">{{ status }}</p>
        <template v-else-if="source && currentModule">
          <p class="source-path">{{ currentModule.path.slice(2) }}<span v-if="baseClass"> · 继承
            <button v-if="parentModule" type="button" class="parent-class" @click="showParent">{{ baseClass }}</button>
            <template v-else>{{ baseClass }}</template>
          </span></p>
          <p class="count">本文件定义的方法 · {{ methods.length }}</p>
          <div v-for="method in visibleMethods" :key="method.signature" class="method">
            <code>{{ method.signature }}</code>
            <details v-if="method.details"><summary>{{ method.summary }}</summary><pre>{{ method.details }}</pre></details>
            <p v-else-if="method.summary">{{ method.summary }}</p>
          </div>
          <p v-if="filter && !visibleMethods.length">没有匹配的方法。</p>
          <details class="raw"><summary>查看本文件源码</summary><pre tabindex="0">{{ source }}</pre></details>
        </template>
      </div>
    </section>
  </dialog>
</template>

<style scoped>
.reference { --accent: var(--blue, #175cb9); color-scheme: light; width: min(690px, calc(100% - 24px)); max-width: none; max-height: calc(100dvh - 32px); margin: auto; padding: 0; border: 1px solid var(--line); border-radius: 14px; background: white; color: var(--ink); box-shadow: 0 20px 65px #17344a35; text-align: start; font: 14px/1.5 Inter, "Segoe UI", "Microsoft YaHei UI", sans-serif; }
.reference::backdrop { background: #16314c63; }
.reference-sheet { display: flex; flex-direction: column; max-height: calc(100dvh - 36px); }
.reference header, .tools { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 18px; }
.reference header { border-bottom: 1px solid var(--line); }
.reference h2, .reference form, .reference p { margin: 0; }
.reference h2 { color: var(--ink); font-size: 18px; font-weight: 650; font-family: inherit; }
.reference .close { color: #496480; background: #f2f6fa; border: 0; border-radius: 6px; width: 30px; height: 30px; padding: 0; font: 22px/1 sans-serif; cursor: pointer; }
.tools { flex-wrap: wrap; align-items: flex-end; justify-content: flex-start; background: #f5f9fd; border-bottom: 1px solid var(--line); }
.tools:empty { display: none; }
.tools label { display: grid; min-width: 0; flex: 1 1 160px; gap: 3px; font-size: 12px; color: #435972; }
.tools input, .tools select { box-sizing: border-box; min-width: 0; width: 100%; min-height: 32px; border: 1px solid #afc1d2; border-radius: 5px; background: white; color: var(--ink); padding: 4px 8px; font: inherit; font-size: 13px; }
.single-class { align-self: center; color: var(--accent); font-weight: 600; overflow-wrap: anywhere; }
.reference-body { overflow: auto; min-height: 70px; padding: 14px 18px 20px; overflow-wrap: anywhere; }
.source-path, .count { color: var(--muted); font-size: 12px; }
.parent-class { padding: 0; border: 0; background: none; color: var(--accent); font: inherit; text-decoration: underline; cursor: pointer; }
.reference .count { margin-block: 6px; }
.method { padding: 9px 0; border-bottom: 1px solid var(--line); line-height: 1.55; }
.method code { display: block; color: #174b92; font: 600 13px/1.5 var(--mono); }
.reference summary { cursor: pointer; margin-block: 4px; font-size: 13px; }
.reference pre { padding: 9px 12px; border-radius: 6px; margin: 4px 0; background: #f2f6fa; white-space: pre-wrap; font: 12px/1.65 Consolas, "Microsoft YaHei UI", monospace; }
.raw { margin-top: 12px; color: var(--accent); }
.raw pre { max-height: 240px; overflow: auto; background: #152d45; color: #e4edf6; }
.reference :focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
</style>
