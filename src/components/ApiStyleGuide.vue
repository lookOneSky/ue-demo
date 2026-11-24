<script setup lang="ts">
const palette = [
  { name: '交互蓝', hex: '#245CDB', use: '主操作、当前选项' },
  { name: '深海蓝', hex: '#142C50', use: '标题、代码底色' },
  { name: '面板白', hex: '#FFFFFF', use: '目录、参数面板' },
  { name: '雾蓝灰', hex: '#F3F6FB', use: '工作区背景' },
  { name: '边界灰', hex: '#DCE4EF', use: '边框、分隔线' },
]
</script>

<template>
  <section class="guide-wrap" aria-labelledby="style-heading">
    <header class="guide-heading"><h1 id="style-heading">样式规范</h1><p>蓝色标识当前选项和主要操作，白色面板区分场景、参数与代码。</p></header>
    <section class="guide-card"><h2>界面配色</h2><ul class="guide-palette">
      <li v-for="color in palette" :key="color.hex">
        <span class="guide-swatch" :style="{ '--guide-chip': color.hex }"></span><strong>{{ color.name }}</strong><code>{{ color.hex }}</code><small>{{ color.use }}</small>
      </li>
    </ul></section>
    <div class="guide-pair">
      <section class="guide-card"><h2>文字层级</h2><dl class="guide-specimens">
        <div><dt>页面标题</dt><dd class="guide-type-title">相机控制</dd></div>
        <div><dt>面板标题</dt><dd class="guide-type-panel">参数配置</dd></div>
        <div><dt>正文说明</dt><dd class="guide-type-body">设置相机点位与飞行时长。</dd></div>
        <div><dt>代码与数值</dt><dd class="guide-type-code">Camera.flyToCameraPositionByName</dd></div>
      </dl></section>
      <section class="guide-card"><h2>控件样式</h2><dl class="guide-specimens">
        <div><dt>操作按钮</dt><dd class="guide-samples"><span class="guide-button-primary">运行示例</span><span class="guide-button-secondary">重置</span></dd></div>
        <div><dt>参数输入</dt><dd><span class="guide-input-sample"><span>5.0</span><span>秒</span></span></dd></div>
        <div><dt>当前导航</dt><dd><span class="guide-nav-sample">通用操作器</span></dd></div>
      </dl></section>
    </div>
  </section>
</template>

<style scoped src="../../docs/api-demo-preview/guide.css"></style>
