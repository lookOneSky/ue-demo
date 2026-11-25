const sources = import.meta.glob<string>(
  ['./Demo*.vue', './Das*Demo.vue', './SceneDemo.vue', './ScreenPosInformerDemo.vue', './levelSequence.vue', './weatherDemo.vue'],
  { query: '?raw', import: 'default' }
)

export function loadDemoSource(file: string) {
  const load = sources['./' + file + '.vue']
  if (!load) throw new Error('找不到示例源码：' + file)
  return load()
}
