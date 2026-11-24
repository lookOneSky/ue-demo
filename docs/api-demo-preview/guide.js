(() => {
  const view = document.getElementById('guide-view');
  if (!view) return;

  const palette = [
    { name: '交互蓝', color: '#245CDB', use: '主操作、当前选项', variable: '--blue' },
    { name: '深海蓝', color: '#142C50', use: '深色区域、代码底色', variable: '--navy' },
    { name: '面板白', color: '#FFFFFF', use: '导航、表单面板', variable: null },
    { name: '雾蓝灰', color: '#F3F6FB', use: '工作区背景', variable: '--canvas' },
    { name: '边界灰', color: '#DCE4EF', use: '边框、分隔线', variable: '--line' },
  ];

  view.innerHTML = `
    <div class="guide-wrap">
      <header class="guide-heading">
        <h1>样式规范</h1>
        <p>用蓝色标识当前选项和主要操作，用留白区分导航、场景与参数。</p>
      </header>
      <section class="guide-card" aria-labelledby="guide-colors">
        <h2 id="guide-colors">界面配色</h2>
        <ul class="guide-palette">
          ${palette.map(({ name, color, use, variable }) => `
            <li>
              <span class="guide-swatch" style="--guide-chip: ${variable ? `var(${variable}, ${color})` : color}" aria-hidden="true"></span>
              <strong>${name}</strong>
              <code>${color}</code>
              <small>${use}</small>
            </li>
          `).join('')}
        </ul>
      </section>
      <div class="guide-pair">
        <section class="guide-card" aria-labelledby="guide-type">
          <h2 id="guide-type">文字层级</h2>
          <dl class="guide-specimens">
            <div><dt>页面标题</dt><dd class="guide-type-title">相机控制</dd></div>
            <div><dt>面板标题</dt><dd class="guide-type-panel">参数配置</dd></div>
            <div><dt>正文说明</dt><dd class="guide-type-body">设置相机点位与飞行时长。</dd></div>
            <div><dt>代码与数值</dt><dd class="guide-type-code">Camera.flyToCameraPositionByName</dd></div>
          </dl>
        </section>
        <section class="guide-card" aria-labelledby="guide-controls">
          <h2 id="guide-controls">控件样式</h2>
          <dl class="guide-specimens">
            <div>
              <dt>操作按钮</dt>
              <dd class="guide-samples">
                <span class="guide-button-primary">运行示例</span>
                <span class="guide-button-secondary">重置参数</span>
              </dd>
            </div>
            <div>
              <dt>参数输入</dt>
              <dd><span class="guide-input-sample"><span>5.0</span><span>秒</span></span></dd>
            </div>
            <div>
              <dt>当前导航</dt>
              <dd><span class="guide-nav-sample">通用操作器</span></dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  `;
})();
