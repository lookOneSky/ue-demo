import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { anchorFor, parseApiFile, renderItemMarkdown } from './api-docs.js';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function renderDetailsHtml(item) {
  let html = item.description ? `<div class="member-desc">${escapeHtml(item.description)}</div>` : '';
  if (item.type) html += `<div class="member-type">类型: ${escapeHtml(item.type)}</div>`;
  for (const [key, title] of [['params', '参数'], ['properties', '属性']]) {
    if (!item[key]?.length) continue;
    html += `<div class="member-params"><strong>${title}:</strong>`;
    for (const entry of item[key]) {
      html += `<div class="param"><span class="param-name">${escapeHtml(entry.name)}</span>` +
        `${entry.type ? ` <span class="param-type">${escapeHtml(entry.type)}</span>` : ''}` +
        `${entry.description ? ` - ${escapeHtml(entry.description)}` : ''}</div>`;
    }
    html += '</div>';
  }
  for (const result of item.returns || []) {
    html += `<div class="member-params"><strong>返回值:</strong> <span class="param-type">${escapeHtml(result.type)}</span>` +
      `${result.description ? ` - ${escapeHtml(result.description)}` : ''}</div>`;
  }
  for (const example of item.examples || []) {
    html += `<div class="member-params"><strong>示例:</strong><pre><code>${escapeHtml(example)}</code></pre></div>`;
  }
  return html;
}

const categories = [
  {
    name: 'Core',
    description: '核心模块',
    pattern: 'src/components/lib/*.js',
    exclude: ['test.js', 'guid.js']
  },
  {
    name: 'Scene',
    description: '场景管理',
    pattern: 'src/components/lib/Scene/*.js'
  },
  {
    name: 'Layer',
    description: '图层系统',
    pattern: 'src/components/lib/Layer/*.js'
  },
  {
    name: 'Layer.Tileset',
    description: '瓦片图层',
    pattern: 'src/components/lib/Layer/Tileset/*.js'
  },
  {
    name: 'Tool',
    description: '工具系统',
    pattern: 'src/components/lib/Tool/*.js'
  }
];

let docDataPromise;
function loadDocData() {
  docDataPromise ??= Promise.all(categories.map(async category => {
    const files = (await glob(category.pattern))
      .filter(file => !category.exclude?.includes(path.basename(file))).sort();
    console.log(`处理 ${category.name} (${files.length} 个文件)...`);
    const classes = (await Promise.all(files.map(parseApiFile))).flat();
    return { category, classes };
  }));
  return docDataPromise;
}

async function generateDocs() {
  let fullMarkdown = `# API Documentation\n\n> 自动生成的 API 文档\n\n`;
  fullMarkdown += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  fullMarkdown += `## 目录结构\n\n`;

  // 添加目录索引
  for (const category of categories) {
    const anchor = category.name.toLowerCase().replace(/\./g, '');
    fullMarkdown += `- [${category.name}](#${anchor}) - ${category.description}\n`;
  }
  fullMarkdown += '\n---\n\n';

  // Markdown 和 HTML 共享一次解析结果，不再启动 npx 子进程。
  for (const { category, classes } of await loadDocData()) {
    if (classes.length === 0) continue;
    const itemAnchor = item => 'api-' + anchorFor(category.name) + '-' + anchorFor(item.name);
    fullMarkdown += `## ${category.name}\n\n> ${category.description}\n\n### 类和类型列表\n\n`;
    for (const item of classes) {
      const description = item.description.split('\n')[0];
      fullMarkdown += `- [${item.name}](#${itemAnchor(item)})${description ? ` - ${description}` : ''}\n`;
    }
    fullMarkdown += '\n' + classes.map(item =>
      `<a id="${itemAnchor(item)}"></a>\n\n` + renderItemMarkdown(item)
    ).join('\n') + '---\n\n';
  }

  // 写入文件
  await fs.mkdir('docs', { recursive: true });
  await fs.writeFile('docs/API.md', fullMarkdown, 'utf8');

  console.log('✅ 文档生成成功: docs/API.md');

  // 统计信息
  const stats = await fs.stat('docs/API.md');
  console.log(`📄 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
}

async function generateHtmlDocs() {
  console.log('生成 HTML 文档...');

  await fs.mkdir('docs/api-html', { recursive: true });

  const docData = await loadDocData();
  const documentedNames = new Set(docData.flatMap(({ classes }) => classes.map(item => item.name)));

  // 构建树形结构
  const treeData = buildTree(docData);

  function buildTree(data) {
    const tree = [];
    const pathMap = {};

    data.forEach(({ category, classes }) => {
      const parts = category.name.split('.');
      let currentLevel = tree;
      let currentPath = '';

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}.${part}` : part;

        if (!pathMap[currentPath]) {
          const isLeaf = index === parts.length - 1;
          const node = {
            name: part,
            fullName: currentPath,
            description: isLeaf ? category.description : '',
            children: [],
            classes: isLeaf ? classes : []
          };

          pathMap[currentPath] = node;
          currentLevel.push(node);
          currentLevel = node.children;
        } else {
          currentLevel = pathMap[currentPath].children;
          if (index === parts.length - 1) {
            pathMap[currentPath].classes = classes;
            pathMap[currentPath].description = category.description;
          }
        }
      });
    });

    return tree;
  }

  function renderTreeNode(node, level = 0) {
    const indent = level * 15;
    const hasChildren = node.children.length > 0;
    const hasClasses = node.classes.length > 0;
    const nodeId = node.fullName.toLowerCase().replace(/\./g, '-');

    let html = `      <div class="tree-node" style="padding-left: ${indent}px;">
        <div class="tree-node-header" onclick="toggleNode(this)">
          ${hasChildren || hasClasses ? '<span class="icon">▶</span>' : '<span class="icon-placeholder"></span>'}
          <span class="node-name">${node.name}${node.description ? `<span class="tree-node-desc">${node.description}</span>` : ''}</span>
        </div>
        <div class="tree-node-content">`;

    // 渲染子节点
    if (hasChildren) {
      node.children.forEach(child => {
        html += renderTreeNode(child, level + 1);
      });
    }

    // 渲染类列表
    if (hasClasses) {
      node.classes.forEach(cls => {
        html += `          <div class="tree-class" style="padding-left: ${(level + 1) * 15}px;" data-target="${escapeHtml(cls.name)}" onclick="scrollToClass(this.dataset.target, this)">${escapeHtml(cls.name)}</div>\n`;
      });
    }

    html += `        </div>
      </div>`;

    return html;
  }

  // 生成单页 HTML 文档
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; height: 100vh; }

    /* 左侧导航栏 */
    .sidebar { width: 300px; background: #f8f9fa; border-right: 1px solid #e1e4e8; overflow-y: auto; }
    .sidebar-header { padding: 20px; background: #24292e; color: white; }
    .sidebar-header h1 { margin: 0; font-size: 20px; }
    .sidebar-header .timestamp { font-size: 12px; color: #959da5; margin-top: 5px; }

    /* 树形结构 */
    .tree { padding: 10px 0; }
    .tree-node { margin-bottom: 2px; }
    .tree-node-header { padding: 6px 10px; cursor: pointer; font-weight: 600; color: #24292e; display: flex; align-items: center; }
    .tree-node-header:hover { background: #e1e4e8; }
    .tree-node-header .icon { margin-right: 5px; width: 14px; text-align: center; font-size: 12px; }
    .tree-node-header .icon-placeholder { margin-right: 5px; width: 14px; display: inline-block; }
    .tree-node-header .node-name { display: flex; align-items: center; }
    .tree-node-desc { font-size: 11px; color: #586069; font-weight: normal; margin-left: 8px; }
    .tree-node-content { display: none; }
    .tree-node-content.expanded { display: block; }
    .tree-class { padding: 5px 10px; cursor: pointer; color: #0366d6; font-size: 14px; }
    .tree-class:hover { background: #f1f8ff; }
    .tree-class.active { background: #0366d6; color: white; }

    /* 右侧内容区 */
    .content { flex: 1; overflow-y: auto; padding: 30px; }
    .class-section { margin-bottom: 50px; }
    .class-title { font-size: 28px; color: #24292e; margin-bottom: 10px; border-bottom: 2px solid #e1e4e8; padding-bottom: 10px; }
    .class-desc { color: #586069; margin-bottom: 20px; }
    .class-extends { background: #fff3cd; padding: 10px 15px; border-radius: 6px; margin-bottom: 10px; font-size: 14px; color: #856404; border-left: 4px solid #ffc107; }
    .class-extends code { background: #ffe69c; color: #856404; }
    .class-extends .parent-link { color: #0366d6; text-decoration: none; font-weight: 600; }
    .class-extends .parent-link:hover { text-decoration: underline; }
    .class-meta { background: #f6f8fa; padding: 10px 15px; border-radius: 6px; margin-bottom: 20px; font-size: 14px; color: #586069; }

    .members-section { margin-top: 30px; }
    .members-section h3 { font-size: 20px; color: #24292e; margin-bottom: 15px; }
    .member { margin-bottom: 25px; padding: 15px; border: 1px solid #e1e4e8; border-radius: 6px; }
    .member-name { font-family: "SFMono-Regular", Consolas, monospace; font-size: 16px; color: #6f42c1; font-weight: 600; }
    .member-type { color: #22863a; font-size: 14px; }
    .member-desc { color: #24292e; margin-top: 8px; }
    .member-desc, .param { white-space: pre-wrap; }
    .member-params { margin-top: 10px; }
    .param { margin: 5px 0; padding: 5px 10px; background: #f6f8fa; border-radius: 3px; font-size: 14px; }
    .param-name { color: #6f42c1; font-family: monospace; }
    .param-type { color: #22863a; }
    pre { overflow-x: auto; padding: 12px; background: #f6f8fa; border-radius: 6px; }
    pre code { padding: 0; }

    code { background: #f6f8fa; padding: 2px 6px; border-radius: 3px; font-family: "SFMono-Regular", Consolas, monospace; font-size: 14px; }
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1>API Documentation</h1>
      <div class="timestamp">${new Date().toLocaleString('zh-CN')}</div>
    </div>
    <div class="tree">
${treeData.map(node => renderTreeNode(node)).join('\n')}
    </div>
  </div>

  <div class="content">
${docData.map(({ classes }) => classes.map(cls => {
  const filePath = cls.context?.file || '';

  let membersHtml = '';

  // 渲染成员的通用函数
  function renderMembers(members, title) {
    if (!members || members.length === 0) return '';

    let html = '<div class="members-section"><h3>' + title + '</h3>';
    members.forEach(m => {
      const isFunction = m.kind === 'function';
      html += '<div class="member">' +
        '<div class="member-name">' + escapeHtml(m.name) + (isFunction ? '()' : '') + '</div>' +
        renderDetailsHtml(m) +
      '</div>';
    });
    html += '</div>';
    return html;
  }

  // 静态成员
  membersHtml += renderMembers(cls.members?.static, '静态成员');

  // 实例成员
  membersHtml += renderMembers(cls.members?.instance, '实例成员');

  // 继承关系
  let extendsHtml = '';
  if (cls.augments && cls.augments.length > 0) {
    const parentClass = cls.augments[0].name;
    const name = escapeHtml(parentClass);
    const parent = documentedNames.has(parentClass) ? `<a href="#${name}" class="parent-link">${name}</a>` : name;
    extendsHtml = `<div class="class-extends">继承: ${parent}</div>`;
  }

  return `    <div class="class-section" id="${escapeHtml(cls.name)}">
      <h2 class="class-title">${escapeHtml(cls.name)}</h2>
      ${renderDetailsHtml(cls)}
      ${extendsHtml}
      ${filePath ? `<div class="class-meta">文件: <code>${escapeHtml(filePath)}</code></div>` : ''}
      ${membersHtml}
    </div>`;
}).join('\n')).join('\n')}
  </div>

  <script>
    function toggleNode(header) {
      const icon = header.querySelector('.icon');
      if (!icon) return;

      const content = header.nextElementSibling;
      const isExpanded = content.classList.contains('expanded');

      if (isExpanded) {
        content.classList.remove('expanded');
        icon.textContent = '▶';
      } else {
        content.classList.add('expanded');
        icon.textContent = '▼';
      }
    }

    function scrollToClass(className, selected) {
      const element = document.getElementById(className);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 高亮选中的类
        document.querySelectorAll('.tree-class').forEach(el => el.classList.remove('active'));
        selected.classList.add('active');
      }
    }

    // 默认展开所有顶级节点
    document.querySelectorAll('.tree > .tree-node > .tree-node-header').forEach(header => {
      const icon = header.querySelector('.icon');
      if (icon) {
        toggleNode(header);
      }
    });
  </script>
</body>
</html>`;

  await fs.writeFile('docs/api-html/index.html', html, 'utf8');
  console.log('✅ HTML 文档生成成功: docs/api-html/index.html');
}

// 检查命令行参数
const args = process.argv.slice(2);
const task = args.includes('--all')
  ? generateDocs().then(() => generateHtmlDocs())
  : args.includes('--html') ? generateHtmlDocs() : generateDocs();
task.catch(error => {
  console.error('文档生成失败:', error.message);
  process.exitCode = 1;
});
