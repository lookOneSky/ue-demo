(() => {
  const byId = id => document.getElementById(id);
  const examples = window.demoExamples;
  const paths = {
    menu: 'M3 6h18 M3 12h18 M3 18h18',
    layout: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    swatches: 'M4 3h6v15a3 3 0 0 1-6 0z M11 9l4-4 4 4-8 8 M13 15h8v6H7 M7 17v1',
    book: 'M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2z M12 6v15',
    panel: 'M3 4h18v16H3z M9 4v16',
    search: 'M16 16l5 5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    chevron: 'm9 6 6 6-6 6',
    scene: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M2 12h20 M12 2c-6 5-6 15 0 20 6-5 6-15 0-20z',
    tool: 'M14 4a6 6 0 0 0-7 8L3 17a2 2 0 0 0 4 4l5-6a6 6 0 0 0 8-8l-4 4-3-3 4-4z',
    layers: 'm12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5',
    app: 'M3 4h18v16H3z M3 9h18 M6 6.5h.01 M9 6.5h.01',
    monitor: 'M3 4h18v13H3z M12 17v4 M8 21h8',
    cube: 'm12 2 9 5v10l-9 5-9-5V7z M3 7l9 5 9-5 M12 12v10',
    expand: 'M8 3H3v5 M16 3h5v5 M3 16v5h5 M16 21h5v-5',
    close: 'm5 5 14 14 M19 5 5 19',
    sliders: 'M3 6h5 M12 6h9 M3 12h11 M18 12h3 M3 18h2 M9 18h12 M8 3v6 M14 9v6 M6 15v6',
    reset: 'M3 4v6h6 M4 10a8 8 0 1 1 1 8',
    pin: 'M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z M15 10a3 3 0 1 1-6 0 3 3 0 1 1 6 0z',
    plus: 'M12 4v16 M4 12h16', minus: 'M4 12h16',
    focus: 'M8 3H3v5 M16 3h5v5 M3 16v5h5 M16 21h5v-5 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
    image: 'M3 4h18v16H3z M3 16l6-6 5 5 3-3 4 4 M16 8h.01',
    play: 'M6 3.5 20 12 6 20.5z',
    code: 'm7 7-5 5 5 5 M17 7l5 5-5 5 M14 4l-4 16',
    terminal: 'm4 6 6 6-6 6 M13 18h7',
    copy: 'M8 8h12v13H8z M16 8V3H3v14h5',
    check: 'm4 12 5 5L20 6'
  };
  function icon(name) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', paths[name]);
    svg.append(path);
    return svg;
  }
  document.querySelectorAll('[data-icon]').forEach(el => el.append(icon(el.dataset.icon)));
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  const groupIcons = { '场景': 'scene', '工具': 'tool', '图层': 'layers', '应用': 'app' };
  const sourceFiles = {
    Camera: 'Scene/Camera', Scene: 'Scene/Scene', Weather: 'Scene/Weather',
    DasElectron: 'Scene/DasElectron', DasToolMeasurementDistance: 'Tool/DasToolMeasurementDistance',
    DasPolylineLayer: 'Layer/DasPolylineLayer'
  };
  const closedGroups = new Set();
  let selected = examples[0];
  let method = selected.methods[0];
  let latestResult = null;
  let currentCode = '';
  let zoom = 1;
  let messageTimer;
  function notify(message) {
    clearTimeout(messageTimer);
    byId('notice').textContent = message;
    messageTimer = setTimeout(() => { byId('notice').textContent = ''; }, 2300);
  }
  function openCatalog(open, focusTrigger = false) {
    byId('catalog').classList.toggle('is-open', open);
    document.querySelector('.scrim').hidden = !open;
    const trigger = document.querySelector('.nav-trigger');
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? '关闭示例目录' : '打开示例目录');
    if (open) byId('search').focus();
    else if (focusTrigger) trigger.focus();
  }
  function showView(guide) {
    byId('studio-view').hidden = guide;
    byId('guide-view').hidden = !guide;
    byId('guide-link').removeAttribute('aria-current');
    byId('studio-link').removeAttribute('aria-current');
    byId(guide ? 'guide-link' : 'studio-link').setAttribute('aria-current', 'page');
    byId('show-reference').hidden = guide;
    document.title = (guide ? '样式规范' : selected.title) + ' · DAS API Demo';
    openCatalog(false);
    renderNav();
    window.scrollTo(0, 0);
  }
  function renderNav() {
    const nav = byId('example-nav');
    const query = byId('search').value.trim().toLowerCase();
    nav.replaceChildren();
    for (const [group, glyph] of Object.entries(groupIcons)) {
      const matches = examples.filter(example => example.group === group && [
        group, example.nav, example.title, example.owner,
        ...example.methods.flatMap(item => [item.label, item.method])
      ].join(' ').toLowerCase().includes(query));
      if (!matches.length) continue;
      const wrapper = node('div', 'nav-group');
      const children = node('div', 'nav-children');
      const toggle = node('button', 'group-toggle');
      const arrow = node('span', 'group-arrow');
      arrow.append(icon('chevron'));
      toggle.append(icon(glyph), group, arrow);
      children.id = 'nav-children-' + glyph;
      toggle.setAttribute('aria-controls', children.id);
      const expanded = Boolean(query) || !closedGroups.has(group);
      toggle.setAttribute('aria-expanded', String(expanded));
      children.hidden = !expanded;
      toggle.addEventListener('click', () => {
        children.hidden = !children.hidden;
        toggle.setAttribute('aria-expanded', String(!children.hidden));
        if (children.hidden) closedGroups.add(group);
        else closedGroups.delete(group);
      });
      for (const example of matches) {
        const leaf = node('button', 'nav-leaf', example.nav);
        if (selected === example && !byId('studio-view').hidden) leaf.setAttribute('aria-current', 'page');
        leaf.addEventListener('click', () => {
          selectExample(example);
          showView(false);
          byId('workspace').focus({ preventScroll: true });
        });
        children.append(leaf);
      }
      wrapper.append(toggle, children);
      nav.append(wrapper);
    }
    if (!nav.childElementCount) nav.append(node('p', 'search-empty', '没有匹配的示例或接口。'));
  }
  function selectExample(example) {
    selected = example;
    byId('example-heading').textContent = example.title;
    byId('example-description').textContent = example.description;
    byId('api-owner').textContent = example.owner;
    byId('crumb-group').textContent = example.group;
    byId('crumb-leaf').textContent = example.nav;
    const select = byId('method');
    select.replaceChildren(...example.methods.map(item => new Option(item.label, item.method)));
    selectMethod();
  }
  function inputField(field) {
    const wrapper = node('div', 'field');
    const label = node('label', 'field-label', field.label);
    const input = field.type === 'select' ? node('select') : node('input');
    input.id = 'field-' + field.key;
    label.htmlFor = input.id;
    input.name = field.key;
    input.required = true;
    if (field.type === 'select') {
      input.append(...field.options.map(value => new Option(value, value)));
    } else {
      input.type = field.type;
      for (const property of ['min', 'max', 'step']) {
        if (field[property] !== undefined) input[property] = String(field[property]);
      }
    }
    input.value = String(field.value);
    input.addEventListener('input', syncCode);
    wrapper.append(label);
    if (field.type !== 'number' || !field.unit) {
      wrapper.append(input);
      return wrapper;
    }
    const numberBox = node('div', 'range-input-wrapper');
    numberBox.append(input, node('span', 'field-unit', field.unit));
    if (field.key !== 'duration') {
      wrapper.append(numberBox);
      return wrapper;
    }
    const range = node('input');
    range.type = 'range';
    range.setAttribute('aria-label', '调节飞行时间（秒）');
    for (const property of ['min', 'max', 'step', 'value']) range[property] = input[property];
    function paintRange() {
      const fraction = (Number(range.value) - field.min) / (field.max - field.min);
      range.style.setProperty('--fill', (fraction * 100) + '%');
    }
    paintRange();
    range.addEventListener('input', () => {
      input.value = range.value;
      paintRange();
      syncCode();
    });
    input.addEventListener('input', () => {
      if (input.validity.valid) {
        range.value = input.value;
        paintRange();
      }
    });
    const row = node('div', 'range-row');
    row.append(range, numberBox);
    wrapper.append(row);
    return wrapper;
  }
  function values() {
    return Object.fromEntries(method.fields.map(field => [field.key, byId('field-' + field.key).value]));
  }
  function selectMethod() {
    method = selected.methods.find(item => item.method === byId('method').value);
    latestResult = null;
    const fields = byId('method-fields');
    fields.replaceChildren(...method.fields.map(inputField));
    if (!method.fields.length) fields.append(node('p', 'field-note', '此方法无需输入参数。' + method.description));
    byId('file-name').textContent = selected.owner + '.js';
    byId('scene-pin').hidden = !method.fields.some(field => field.key === 'positionName');
    syncCode();
    showOutput(false);
    setZoom(1);
  }
  // Match complete strings before tokens so values containing quotes or markup stay plain text.
  const tokenPattern = /("(?:\\.|[^"\\])*"|\/\/.*$|\b(?:const|await|new|true|undefined)\b|\b\d+(?:\.\d+)?\b|[a-zA-Z_$][\w$]*(?=\())/g;
  function highlight(line, target) {
    let last = 0;
    for (const match of line.matchAll(tokenPattern)) {
      const token = match[0];
      target.append(line.slice(last, match.index));
      let kind = 'method';
      if (token.startsWith('//')) kind = 'comment';
      else if (token.startsWith('"')) kind = 'string';
      else if (/^\d/.test(token)) kind = 'number';
      else if (['const', 'await', 'new', 'true', 'undefined'].includes(token)) kind = 'keyword';
      target.append(node('span', 'token-' + kind, token));
      last = match.index + token.length;
    }
    target.append(line.slice(last));
  }
  function syncCode() {
    const params = values();
    currentCode = method.code(params);
    const lines = currentCode.split('\n').map((line, index) => {
      const row = node('span', 'code-line');
      const number = node('span', 'line-number', String(index + 1));
      number.setAttribute('aria-hidden', 'true');
      row.append(number);
      highlight(line, row);
      return row;
    });
    byId('code-lines').replaceChildren(...lines);
    byId('pin-text').textContent = params.positionName || '目标点位';
  }
  function showOutput(result) {
    const codeTab = byId('code-tab');
    const resultTab = byId('result-tab');
    codeTab.setAttribute('aria-selected', String(!result));
    resultTab.setAttribute('aria-selected', String(result));
    codeTab.tabIndex = result ? -1 : 0;
    resultTab.tabIndex = result ? 0 : -1;
    byId('code-panel').hidden = result;
    byId('result-panel').hidden = !result;
    byId('copy').hidden = result;
    if (!result) return;
    const panel = byId('result-panel');
    if (!latestResult) {
      panel.replaceChildren(node('strong', '', '等待运行'), node('p', '', '运行示例后，可在这里查看模拟结果。'));
      return;
    }
    const [summary, ...output] = latestResult.split('\n');
    const title = node('strong');
    title.append(icon('check'), summary);
    panel.replaceChildren(title, node('pre', '', output.join('\n')));
  }
  function setZoom(value) {
    zoom = Math.max(1, Math.min(2, value));
    byId('scene-photo').style.transform = 'scale(' + zoom + ')';
    byId('zoom-value').textContent = Math.round(zoom * 100) + '%';
    byId('zoom-in').disabled = zoom >= 2;
    byId('zoom-out').disabled = zoom <= 1;
  }
  function expandScene(open) {
    byId('viewport').classList.toggle('is-expanded', open);
    document.body.classList.toggle('expanded', open);
    byId('expand-scene').setAttribute('aria-expanded', String(open));
    byId('expand-scene').querySelector('span').textContent = open ? '还原视口' : '放大视口';
    // Keep keyboard navigation inside the enlarged view.
    for (const selector of ['.masthead', '.sidebar', '.breadcrumb', '.settings', '.console']) {
      document.querySelector(selector).inert = open;
    }
  }
  function showReference() {
    const body = byId('reference-body');
    const list = node('dl');
    method.fields.forEach(field => {
      const row = node('div');
      row.append(node('dt', '', field.key), node('dd', '', field.label + (field.unit ? '（' + field.unit + '）' : '')));
      list.append(row);
    });
    const source = node('a', '', '查看 SDK 源码 ↗');
    source.href = '../../src/components/lib/' + sourceFiles[selected.owner] + '.js';
    source.target = '_blank';
    source.rel = 'noopener';
    body.replaceChildren(node('h3', '', selected.owner + '.' + method.method), node('p', '', method.description), list, source);
    byId('reference').showModal();
  }
  byId('params').addEventListener('submit', event => {
    event.preventDefault();
    latestResult = method.result(values());
    showOutput(true);
    notify('示例已运行，已生成模拟结果');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !byId('scene-pin').hidden) {
      byId('scene-pin').animate([{ opacity: .25 }, { opacity: 1 }], { duration: 550 });
    }
    byId('result-panel').scrollIntoView({ block: 'nearest' });
  });
  byId('reset-form').addEventListener('click', () => { selectMethod(); notify('已恢复当前方法的默认参数'); });
  byId('method').addEventListener('change', selectMethod);
  byId('code-tab').addEventListener('click', () => showOutput(false));
  byId('result-tab').addEventListener('click', () => showOutput(true));
  document.querySelector('.console-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const result = event.key === 'End' || (event.key !== 'Home' && byId('result-panel').hidden);
    showOutput(result);
    byId(result ? 'result-tab' : 'code-tab').focus();
  });
  byId('copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      notify('调用代码已复制');
    } catch {
      const textarea = node('textarea');
      textarea.value = currentCode;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.append(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      byId('copy').focus();
      notify(copied ? '调用代码已复制' : '可在代码区选择并复制代码');
    }
  });
  byId('zoom-in').onclick = () => setZoom(zoom + .25);
  byId('zoom-out').onclick = () => setZoom(zoom - .25);
  byId('zoom-reset').onclick = () => setZoom(1);
  byId('expand-scene').onclick = () => expandScene(!byId('viewport').classList.contains('is-expanded'));
  byId('guide-link').onclick = () => showView(true);
  byId('studio-link').onclick = () => showView(false);
  byId('show-reference').onclick = showReference;
  byId('close-reference').onclick = () => byId('reference').close();
  byId('reference').addEventListener('click', event => {
    if (event.target === byId('reference')) {
      const box = byId('reference').getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) byId('reference').close();
    }
  });
  byId('search').oninput = renderNav;
  document.querySelector('.scrim').onclick = () => openCatalog(false, true);
  const compactNav = matchMedia('(max-width: 900px)');
  const trigger = document.querySelector('.nav-trigger');
  byId('hide-catalog').onclick = () => {
    if (!compactNav.matches) document.body.classList.add('catalog-hidden');
    openCatalog(false, true);
  };
  trigger.onclick = () => {
    if (compactNav.matches) openCatalog(!byId('catalog').classList.contains('is-open'), true);
    else {
      document.body.classList.remove('catalog-hidden');
      byId('search').focus();
    }
  };
  compactNav.addEventListener('change', () => {
    document.body.classList.remove('catalog-hidden');
    openCatalog(false);
  });
  document.addEventListener('keydown', event => {
    if (byId('reference').open) return;
    if (byId('viewport').classList.contains('is-expanded')) {
      if (event.key === 'Escape') expandScene(false);
      return;
    }
    if (event.key === 'Escape' && byId('catalog').classList.contains('is-open')) openCatalog(false, true);
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest('input, select, textarea')) {
      event.preventDefault();
      if (compactNav.matches) openCatalog(true);
      else document.body.classList.remove('catalog-hidden');
      byId('search').focus();
    }
  });
  selectExample(selected);
  showView(false);
})();
