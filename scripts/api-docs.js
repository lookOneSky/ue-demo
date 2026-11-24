import fs from 'node:fs/promises';
import ts from 'typescript';

// TypeScript identifies declarations without executing the library or following imports.
// Parse the original JSDoc text so nested @param/@property names and examples stay intact.
function parseComment(comment) {
  const lines = comment.slice(3, -2).split(/\r?\n/).map(line => line.replace(/^\s*\* ?/, ''));
  const description = [];
  const tags = [];
  let current;
  for (const line of lines) {
    const match = line.match(/^\s*@([\w]+)(?:\s+(.*))?$/);
    if (match) {
      current = { name: match[1], lines: [match[2] || ''] };
      tags.push(current);
    } else if (current) {
      current.lines.push(line);
    } else {
      description.push(line);
    }
  }
  return {
    description: description.join('\n').trim(),
    tags: tags.map(tag => ({ name: tag.name, value: tag.lines.join('\n').trim() }))
  };
}

function readTypedValue(value, named = false) {
  let remaining = value.trim();
  let type = '';
  if (remaining.startsWith('{')) {
    let depth = 0;
    for (let index = 0; index < remaining.length; index++) {
      if (remaining[index] === '{') depth++;
      if (remaining[index] === '}' && --depth === 0) {
        type = remaining.slice(1, index);
        remaining = remaining.slice(index + 1).trim();
        break;
      }
    }
  }
  let name = '';
  if (named) {
    let end = remaining.search(/\s/);
    if (end === -1) end = remaining.length;
    if (remaining.startsWith('[')) {
      let depth = 0;
      for (let index = 0; index < remaining.length; index++) {
        if (remaining[index] === '[') depth++;
        if (remaining[index] === ']' && --depth === 0) {
          end = index + 1;
          break;
        }
      }
    }
    name = remaining.slice(0, end);
    remaining = remaining.slice(end).trim();
  }
  return { name, type, description: remaining.replace(/^-\s*/, '') };
}

function readDocs(node, source) {
  return (ts.getLeadingCommentRanges(source.text, node.pos) || [])
    .map(range => source.text.slice(range.pos, range.end))
    .filter(comment => comment.startsWith('/**'))
    .map(parseComment);
}

function describe(docs) {
  const tags = docs.flatMap(doc => doc.tags);
  return {
    description: [...docs.map(doc => doc.description), ...tags.filter(tag => tag.name === 'description').map(tag => tag.value)]
      .filter(Boolean).join('\n\n'),
    params: tags.filter(tag => ['param', 'arg', 'argument'].includes(tag.name)).map(tag => readTypedValue(tag.value, true)),
    returns: tags.filter(tag => ['return', 'returns'].includes(tag.name)).map(tag => readTypedValue(tag.value)),
    properties: tags.filter(tag => ['property', 'prop'].includes(tag.name)).map(tag => readTypedValue(tag.value, true)),
    examples: tags.filter(tag => tag.name === 'example').map(tag => tag.value),
    type: tags.find(tag => tag.name === 'type') ? readTypedValue(tags.find(tag => tag.name === 'type').value).type : ''
  };
}

function isHidden(node, docs) {
  return (node.name && ts.isPrivateIdentifier(node.name)) ||
    docs.some(doc => doc.tags.some(tag => ['private', 'ignore'].includes(tag.name)));
}

function readMember(node, source) {
  const docs = readDocs(node, source);
  if (isHidden(node, docs)) return null;
  const callable = ts.isMethodDeclaration(node) || ts.isConstructorDeclaration(node) ||
    (ts.isPropertyDeclaration(node) && node.initializer &&
      (ts.isFunctionExpression(node.initializer) || ts.isArrowFunction(node.initializer)));
  if (!node.name && !ts.isConstructorDeclaration(node)) return null;
  // Undocumented data fields are implementation details; methods remain discoverable.
  if (!callable && docs.length === 0) return null;
  const details = describe(docs);
  const signature = callable ? (node.parameters || node.initializer?.parameters || []) : [];
  if (details.params.length === 0) {
    details.params = signature.map(param => ({
      name: param.name.getText(source) + (param.initializer ? `=${param.initializer.getText(source)}` : ''),
      type: param.type?.getText(source) || '',
      description: ''
    }));
  }
  return {
    name: ts.isConstructorDeclaration(node) ? 'constructor' : node.name.getText(source),
    kind: callable ? 'function' : 'property',
    scope: node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.StaticKeyword) ? 'static' : 'instance',
    ...details
  };
}

export async function parseApiFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const source = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (source.parseDiagnostics.length) {
    const diagnostic = source.parseDiagnostics[0];
    throw new Error(`${filePath}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
  }
  const items = [];
  for (const node of source.statements) {
    const docs = readDocs(node, source);
    for (const doc of docs) {
      const typedef = doc.tags.find(tag => tag.name === 'typedef');
      if (typedef) {
        const definition = readTypedValue(typedef.value, true);
        items.push({
          name: definition.name,
          kind: 'typedef',
          context: { file: filePath.replace(/\\/g, '/') },
          ...describe([doc]),
          type: definition.type,
          members: { static: [], instance: [] },
          augments: []
        });
      }
    }
    if (isHidden(node, docs)) continue;
    if (ts.isClassDeclaration(node)) {
      const members = node.members.map(member => readMember(member, source)).filter(Boolean);
      items.push({
        name: node.name?.text || 'default',
        kind: 'class',
        context: { file: filePath.replace(/\\/g, '/') },
        ...describe(docs.filter(doc => !doc.tags.some(tag => tag.name === 'typedef'))),
        members: {
          static: members.filter(member => member.scope === 'static'),
          instance: members.filter(member => member.scope === 'instance')
        },
        augments: (node.heritageClauses || []).filter(clause => clause.token === ts.SyntaxKind.ExtendsKeyword)
          .flatMap(clause => clause.types.map(type => ({ name: type.expression.getText(source) })))
      });
    } else if (ts.isFunctionDeclaration(node) && node.name) {
      items.push({
        name: node.name.text,
        kind: 'function',
        context: { file: filePath.replace(/\\/g, '/') },
        ...describe(docs),
        members: { static: [], instance: [] },
        augments: []
      });
    }
  }
  return items;
}

export function anchorFor(name) {
  return name.toLowerCase().replace(/[^\p{L}\p{N}_-]/gu, '');
}

function renderDetailsMarkdown(item) {
  let markdown = item.description ? `${item.description}\n\n` : '';
  if (item.type) markdown += `类型: \`${item.type}\`\n\n`;
  for (const [key, title] of [['params', '参数'], ['properties', '属性']]) {
    if (item[key]?.length) {
      markdown += `**${title}**\n\n`;
      for (const entry of item[key]) {
        markdown += `- \`${entry.name}\`${entry.type ? ` (\`${entry.type}\`)` : ''}${entry.description ? ` — ${entry.description.replace(/\n/g, '\n  ')}` : ''}\n`;
      }
      markdown += '\n';
    }
  }
  for (const result of item.returns || []) {
    markdown += `**返回值:** ${result.type ? `\`${result.type}\` ` : ''}${result.description}\n\n`;
  }
  for (const example of item.examples || []) {
    markdown += `**示例**\n\n\`\`\`javascript\n${example}\n\`\`\`\n\n`;
  }
  return markdown;
}

export function renderItemMarkdown(item) {
  let markdown = `### ${item.name}\n\n> 文件: \`${item.context.file}\`\n\n`;
  if (item.augments.length) markdown += `继承: ${item.augments.map(parent => `\`${parent.name}\``).join(', ')}\n\n`;
  markdown += renderDetailsMarkdown(item);
  for (const [scope, title] of [['static', '静态成员'], ['instance', '实例成员']]) {
    if (item.members[scope].length === 0) continue;
    markdown += `#### ${title}\n\n`;
    for (const member of item.members[scope]) {
      markdown += `##### ${member.name}${member.kind === 'function' ? '()' : ''}\n\n${renderDetailsMarkdown(member)}`;
    }
  }
  return markdown;
}
