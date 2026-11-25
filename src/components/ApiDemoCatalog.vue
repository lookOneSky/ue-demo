<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CatalogNode } from './demoCatalog'

interface CatalogRow {
  item: CatalogNode
  parents: CatalogNode[]
  group: boolean
}

const props = defineProps<{ items: CatalogNode[]; activeId: string }>()
const emit = defineEmits<{ select: [id: string]; close: [] }>()
const searchInput = ref<HTMLInputElement>()
const query = ref('')
const keyword = computed(() => query.value.trim().toLowerCase())
const expanded = ref(new Set<string>())
const foldedMatches = ref(new Set<string>())

const icons: Record<string, string> = {
  camera: 'M3 7h4l2-3h6l2 3h4v13H3z M15.5 13a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z',
  spatial: 'm3 15 12-12 6 6L9 21z M12 6l3 3 M9 9l2 2 M6 12l3 3',
  scene: 'M3 17l5.8-10 4.3 7 2.8-4.5L21 18H3z M15.6 5.8h.01',
  tool: 'M14.5 5a5 5 0 0 0-6.3 6.3l-5 5a2 2 0 0 0 2.8 2.8l5-5a5 5 0 0 0 6.4-6.3l-3.1 3-2.6-2.6z',
  layer: 'm12 3 9 5-9 5-9-5z M3 12l9 5 9-5 M3 16l9 5 9-5',
  app: 'M3 4h7v7H3z M14 4h7v7h-7z M3 15h7v6H3z M14 15h7v6h-7z',
  folder: 'M3 6h6l2 2h10v11H3z',
}

const rows = computed(() => {
  const result: CatalogRow[] = []
  function visit(items: CatalogNode[], parents: CatalogNode[]) {
    for (const item of items) {
      result.push({ item, parents, group: Boolean(item.children) })
      if (item.children) visit(item.children, [...parents, item])
    }
  }
  visit(props.items, [])
  return result
})
const leaves = computed(() => rows.value.filter(row => !row.group))
const activeRow = computed(() => leaves.value.find(row => row.item.id === props.activeId))
watch(keyword, () => foldedMatches.value.clear())

const matches = computed(() => {
  if (!keyword.value) return leaves.value
  const terms = keyword.value.split(/\s+/)
  return leaves.value.filter(({ parents, item }) => {
    const path = [...parents, item].map(node => node.name + ' ' + node.id).join(' ')
    const text = (path + ' ' + (item.owner || '')).toLowerCase()
    return terms.every(term => text.includes(term))
  })
})

watch(activeRow, row => {
  if (!row) return
  if (keyword.value && !matches.value.includes(row)) query.value = ''
  for (const parent of row.parents) {
    expanded.value.add(parent.id)
    foldedMatches.value.delete(parent.id)
  }
}, { immediate: true })

function isOpen(id: string) {
  return keyword.value ? !foldedMatches.value.has(id) : expanded.value.has(id)
}

const visibleRows = computed(() => {
  const ids = new Set<string>()
  if (keyword.value) {
    for (const row of matches.value) {
      ids.add(row.item.id)
      row.parents.forEach(parent => ids.add(parent.id))
    }
  }
  return rows.value.filter(row =>
    (!keyword.value || ids.has(row.item.id)) && row.parents.every(parent => isOpen(parent.id))
  )
})

function activate(row: CatalogRow) {
  const { id } = row.item
  if (!row.group) {
    emit('select', id)
    return
  }
  const toggles = keyword.value ? foldedMatches.value : expanded.value
  if (toggles.has(id)) toggles.delete(id)
  else toggles.add(id)
}

function focusSearch() {
  searchInput.value?.focus()
}
defineExpose({ focusSearch })
</script>

<template>
  <div class="catalog">
    <header class="catalog-heading">
      <h2>示例目录</h2>
      <button type="button" class="catalog-close" aria-label="收起示例目录" title="收起示例目录" @click="emit('close')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></svg>
      </button>
    </header>
    <div class="catalog-search">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>
      <input ref="searchInput" v-model="query" type="search" placeholder="搜索示例、分类或 SDK 类" aria-label="搜索示例名称、ID、分类或 SDK 类名" />
    </div>
    <nav class="catalog-list" aria-label="按类别选择示例">
      <div
        v-for="row in visibleRows"
        :key="row.item.id"
        class="catalog-entry"
        :class="{ 'catalog-top': !row.parents.length, 'catalog-nested': row.parents.length }"
        :style="{ '--level': row.parents.length }"
      >
        <button
          type="button"
          class="catalog-row"
          :class="{ 'catalog-group': row.group }"
          :aria-expanded="row.group ? isOpen(row.item.id) : undefined"
          :aria-current="!row.group && activeId === row.item.id ? 'page' : undefined"
          :title="row.item.name"
          @click="activate(row)"
        >
          <svg v-if="row.group && !row.parents.length" class="catalog-symbol" viewBox="0 0 24 24" aria-hidden="true">
            <path :d="icons[row.item.id] || icons.folder" />
          </svg>
          <span>{{ row.item.name }}</span>
          <svg v-if="row.group" class="catalog-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
        </button>
      </div>
      <p v-if="!visibleRows.length" class="catalog-empty">没有匹配的示例。</p>
    </nav>
    <footer class="catalog-footer" aria-live="polite">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h6l2 2h8v12H4z M8 11h8 M8 15h5" /></svg>
      <span v-if="keyword">找到 <b>{{ matches.length }}</b> 个示例</span>
      <span v-else>共 <b>{{ leaves.length }}</b> 个示例</span>
    </footer>
  </div>
</template>

<style scoped>
.catalog {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  text-align: left;
  color: #172e4c;
  background: #fff;
  border-right: 1px solid #dce4ef;
  color-scheme: light;
}
.catalog, .catalog * { box-sizing: border-box; }
.catalog svg {
  display: block;
  flex: none;
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.65;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.catalog button {
  margin: 0;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: 6px;
  font-family: inherit;
  cursor: pointer;
}
.catalog button:focus-visible { outline: 2px solid #245cdb; outline-offset: 1px; }
.catalog-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 21px 17px 13px 21px;
}
.catalog-heading h2 { margin: 0; font-size: 17px; line-height: 1.5; font-weight: 680; }
.catalog .catalog-close { display: grid; place-items: center; width: 32px; height: 32px; padding: 0; color: #647b98; }
.catalog .catalog-close:hover, .catalog-row:hover { background: #f3f6fb; }
.catalog-search {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  height: 36px;
  margin: 0 17px 15px;
  padding: 0 9px;
  background: #f8fafd;
  color: #647b98;
  border: 1px solid #dce4ef;
  border-radius: 6px;
}
.catalog-search:focus-within { border-color: #245cdb; box-shadow: 0 0 0 2px #e5edff; }
.catalog-search svg { width: 15px; height: 15px; }
.catalog-search input { width: 100%; min-width: 0; border: 0; outline: none; background: transparent; color: #172e4c; font: inherit; font-size: 13px; }
.catalog-search input::placeholder { color: #667b94; }
.catalog-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 0 13px 20px;
  scrollbar-width: thin;
  scrollbar-color: #c5d1df transparent;
}
.catalog-entry { position: relative; margin-left: calc(var(--level) * 16px); }
.catalog-top:not(:first-child) { margin-top: 8px; }
.catalog-nested { padding-left: 10px; border-left: 1px solid #dce4ef; }
.catalog .catalog-row {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 34px;
  padding: 6px 9px;
  color: #526780;
  font-size: 13px;
  line-height: 1.5;
  font-weight: 400;
  text-align: left;
}
.catalog-row span { overflow-wrap: anywhere; }
.catalog .catalog-group { min-height: 38px; color: #2c4566; font-weight: 650; }
.catalog-top .catalog-group { font-size: 14px; }
.catalog-row .catalog-symbol { color: #4e74a5; }
.catalog-row .catalog-arrow { margin-left: auto; width: 13px; height: 13px; color: #70839c; }
.catalog-row[aria-expanded="true"] .catalog-arrow { transform: rotate(90deg); }
.catalog .catalog-row[aria-current="page"] { font-weight: 650; color: #2059cd; background: #eaf1ff; }
.catalog-nested .catalog-row[aria-current="page"]::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 50%;
  width: 3px;
  height: 17px;
  border-radius: 2px;
  background: #245cdb;
  transform: translateY(-50%);
}
.catalog-empty { margin: 12px 8px; color: #566a84; font-size: 13px; }
.catalog-footer {
  display: flex;
  flex: none;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  color: #566a84;
  background: #fbfcff;
  border-top: 1px solid #dce4ef;
  font-size: 12px;
}
.catalog-footer svg { color: #4e74a5; }
.catalog-footer b { color: #2c4566; font-weight: 650; font-variant-numeric: tabular-nums; }
@media (max-width: 900px) {
  .catalog .catalog-row, .catalog .catalog-close { min-height: 42px; }
  .catalog-footer { padding-bottom: max(16px, env(safe-area-inset-bottom)); }
}
</style>
