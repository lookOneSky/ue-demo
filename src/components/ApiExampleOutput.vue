<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import { loadDemoSource } from './demoSources'

const props = defineProps<{
  file: string
  snippet: string
  result: string
  showResult: boolean
}>()
const emit = defineEmits<{ 'update:showResult': [value: boolean] }>()
const id = useId()

const source = ref('')
const firstLine = ref(1)
const loadState = ref<'loading' | 'ready' | 'unavailable'>('loading')
const fullScript = ref(false)
const codeTab = ref<HTMLButtonElement>()
const resultTab = ref<HTMLButtonElement>()
const scroller = ref<HTMLElement>()
const copyLabel = ref('复制代码')
let feedbackTimer: number | undefined

watch(() => [props.file, Boolean(props.snippet)] as const, async ([file, generated], _, onCleanup) => {
  let current = true
  onCleanup(() => { current = false })
  fullScript.value = false
  source.value = ''
  firstLine.value = 1
  loadState.value = 'loading'
  if (generated) return

  try {
    const raw = (await loadDemoSource(file)).replace(/\r\n?/g, '\n')
    const script = /<script\b[^>]*>([\s\S]*?)<\/script\s*>/i.exec(raw)
    if (!script || !script[1].trim()) throw new Error()
    if (!current) return
    const content = script[1].trim()
    firstLine.value = raw.slice(0, raw.indexOf(content, script.index)).split('\n').length
    source.value = content
    loadState.value = 'ready'
  } catch {
    if (current) loadState.value = 'unavailable'
  }
}, { immediate: true })

// Extract a complete, top-level operation from the source. If its structure
// is unfamiliar, showing the original script is always valid.
const operation = computed(() => {
  const lines = source.value.split('\n')
  const startPattern = /^(?:const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{|(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*\{)\s*$/
  const watchPattern = /^watch\(.*=>\s*\{\s*$/
  const sdkCall = /\b(?:Das\w+|Camera|Weather|Scene|LevelSequenceControl|tool|\w+Layer\.value)\.\w+\s*\(/
  for (let start = 0; start < lines.length; start++) {
    const watcher = watchPattern.test(lines[start])
    if (!watcher && !startPattern.test(lines[start])) continue
    let end = start + 1
    const closingLine = watcher ? /^}\);?\s*$/ : /^};?\s*$/
    while (end < lines.length && !closingLine.test(lines[end])) end++
    if (end === lines.length) continue
    const block = lines.slice(start, end + 1)
    if (block.some(line => !line.trimStart().startsWith('//') && sdkCall.test(line))) {
      return { text: block.join('\n'), line: firstLine.value + start }
    }
    start = end
  }
  return null
})

const displayedCode = computed(() => props.snippet || (!fullScript.value && operation.value?.text) || source.value)
const displayedLine = computed(() => props.snippet ? 1 : (!fullScript.value && operation.value?.line) || firstLine.value)
const codeLines = computed(() => displayedCode.value.split('\n').map(line => {
  const pattern = /(\/\/.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|return|await|async|function|new|if|else|try|catch|finally|import|from|export|throw|for|of|in|true|false|null|undefined)\b)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*(?=\s*\())/g
  const tokens: { text: string, kind: string }[] = []
  let from = 0
  for (const match of line.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > from) tokens.push({ text: line.slice(from, index), kind: '' })
    const kind = ['comment', 'string', 'keyword', 'number', 'function'][match.slice(1).findIndex(Boolean)]
    tokens.push({ text: match[0], kind })
    from = index + match[0].length
  }
  tokens.push({ text: line.slice(from), kind: '' })
  return tokens
}))

function resetFeedback() {
  window.clearTimeout(feedbackTimer)
  copyLabel.value = '复制代码'
}
watch([displayedCode, () => props.showResult], () => {
  resetFeedback()
  scroller.value?.scrollTo(0, 0)
})
onBeforeUnmount(resetFeedback)

async function copyCode() {
  const text = displayedCode.value
  if (!text) return
  resetFeedback()
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const previous = document.activeElement
      const field = document.createElement('textarea')
      field.value = text
      field.style.cssText = 'position:fixed;left:-9999px;top:0'
      document.body.append(field)
      try {
        field.select()
        if (!document.execCommand('copy')) throw new Error()
      } finally {
        field.remove()
        if (previous instanceof HTMLElement) previous.focus({ preventScroll: true })
      }
    }
    if (text === displayedCode.value) copyLabel.value = '已复制'
  } catch {
    if (text === displayedCode.value) copyLabel.value = '复制失败'
  }
  feedbackTimer = window.setTimeout(resetFeedback, 2000)
}

function moveTab(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const result = event.key === 'Home' ? false : event.key === 'End' ? true : !props.showResult
  emit('update:showResult', result)
  const tab = result ? resultTab : codeTab
  tab.value?.focus()
}
</script>

<template>
  <section class="example-output" aria-label="示例代码与运行结果">
    <div class="output-toolbar">
      <div class="output-tabs" role="tablist" aria-label="查看内容" @keydown="moveTab">
        <button :id="id + '-code'" ref="codeTab" type="button" role="tab"
          :aria-controls="id + '-code-panel'" :aria-selected="!showResult" :tabindex="showResult ? -1 : 0"
          @click="emit('update:showResult', false)">调用示例</button>
        <button :id="id + '-result'" ref="resultTab" type="button" role="tab"
          :aria-controls="id + '-result-panel'" :aria-selected="showResult" :tabindex="showResult ? 0 : -1"
          @click="emit('update:showResult', true)">运行结果</button>
      </div>
      <button v-if="!showResult" class="copy" type="button" :disabled="!displayedCode" @click="copyCode">
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
          <rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10 3.5V3a.5.5 0 0 0-.5-.5h-6a1 1 0 0 0-1 1v6a.5.5 0 0 0 .5.5h.5"/>
        </svg><span aria-live="polite">{{ copyLabel }}</span>
      </button>
    </div>
    <div v-show="!showResult" :id="id + '-code-panel'" role="tabpanel" :aria-labelledby="id + '-code'" class="code-panel">
      <div class="code-caption">
        <span class="file-name"><span class="file-mark" aria-hidden="true">&lt;/&gt;</span>{{ file }}.vue<span v-if="snippet">· 当前参数</span></span>
        <button v-if="!snippet && operation" class="source-toggle" type="button" :aria-pressed="fullScript"
          @click="fullScript = !fullScript">{{ fullScript ? '只看调用' : '查看完整脚本' }}</button>
        <span v-else class="language">{{ snippet ? 'JavaScript' : 'Vue' }}</span>
      </div>
      <div v-if="displayedCode" ref="scroller" class="code-scroll" tabindex="0" aria-label="示例代码">
        <pre><code><span v-for="(tokens, i) in codeLines" :key="i" class="code-line"><span class="line-number" aria-hidden="true">{{ displayedLine + i }}</span><span class="line-text"><span v-for="(token, j) in tokens" :key="j" :class="token.kind">{{ token.text }}</span></span></span></code></pre>
      </div>
      <p v-else class="source-status" role="status">{{ loadState === 'loading' ? '正在读取示例代码…' : '此示例的源代码暂不可用。' }}</p>
    </div>
    <div v-show="showResult" :id="id + '-result-panel'" role="tabpanel" :aria-labelledby="id + '-result'" class="result-panel" tabindex="0">
      <pre v-if="result" aria-live="polite">{{ result }}</pre>
      <p v-else class="empty-result">暂无运行结果</p>
    </div>
  </section>
</template>

<style scoped>
.example-output { min-width: 0; color: #233a55; border: 1px solid #dbe5ed; border-radius: 12px; background: white; overflow: hidden; text-align: left; font-family: inherit; }
.output-toolbar, .code-caption, .output-tabs, .file-name, .copy { display: flex; align-items: center; }
.output-toolbar, .code-caption { justify-content: space-between; gap: 10px; }
.output-toolbar { padding: 0 16px; min-height: 46px; border-bottom: 1px solid #dbe5ed; flex-wrap: wrap; }
.output-tabs { gap: 18px; }
.example-output button { font: inherit; font-size: 12px; cursor: pointer; border: 0; border-radius: 0; background: transparent; letter-spacing: 0; line-height: 1.4; }
.output-tabs button { position: relative; padding: 14px 0; color: #586d82; font-weight: 550; }
.output-tabs button[aria-selected="true"] { color: #155cb7; font-weight: 650; }
.output-tabs button[aria-selected="true"]::after { content: ""; position: absolute; inline-size: 100%; height: 2px; left: 0; bottom: 0; background: #2369c9; }
.example-output .copy { gap: 5px; color: #496079; padding: 4px 6px; border-radius: 5px; }
.copy svg { width: 14px; height: 14px; }
.copy:hover:not(:disabled) { background: #edf4fc; color: #155cb7; }
.copy:disabled { cursor: default; opacity: .55; }
.example-output :is(button, [tabindex]):focus-visible { outline: 2px solid #5797e3; outline-offset: -2px; }
.code-panel { overflow: hidden; background: var(--navy); color: #e1eaf5; }
.code-caption { min-height: 34px; padding: 7px 16px 0; color: #caddf1; font-size: 11px; }
.file-name { min-width: 0; gap: 7px; overflow-wrap: anywhere; }
.file-mark { color: #85b9ea; font-family: Consolas, monospace; font-weight: 600; }
.example-output .source-toggle { padding: 3px 4px; color: #a6d2ff; flex: none; }
.source-toggle:hover { text-decoration: underline; }
.language { color: #a7bcd0; font-size: 11px; }
.code-scroll { max-height: 245px; overflow: auto; padding: 10px 0; scrollbar-color: #607c96 #142a42; }
.code-scroll pre, .result-panel pre { margin: 0; font: 12px/1.78 "Cascadia Code", Consolas, "Microsoft YaHei UI", monospace; text-align: left; }
.code-scroll code { font: inherit; }
.code-line { display: flex; min-height: 1.78em; width: max-content; min-width: 100%; }
.line-number { flex: none; width: 3.5em; padding-right: 1em; color: #91a8be; text-align: right; user-select: none; }
.line-text { padding-right: 14px; }
.keyword { color: #b7aeff; }
.string { color: #9edfc7; }
.function { color: #94cbff; }
.number { color: #ffcc95; }
.comment { color: #a0b4c8; }
.source-status, .empty-result { margin: 0; padding: 17px; font-size: 13px; }
.result-panel { max-height: 290px; overflow: auto; color: #203d5c; }
.result-panel pre { padding: 15px 18px; white-space: pre-wrap; overflow-wrap: anywhere; }
.empty-result { color: #5b7086; }
@media (max-width: 550px) {
  .output-toolbar { padding-inline: 10px; }
  .output-tabs { gap: 12px; }
}
</style>
