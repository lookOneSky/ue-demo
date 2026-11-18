import { mkdirSync, cpSync, writeFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('====================================');
console.log('创建 Nginx 部署包');
console.log('====================================');

const deployDir = join(rootDir, 'nginx-deploy');
const distDir = join(rootDir, 'dist');

// 清理旧的部署目录
if (existsSync(deployDir)) {
  console.log('清理旧的部署目录...');
  rmSync(deployDir, { recursive: true, force: true });
}

// 创建部署目录
console.log('创建部署目录...');
mkdirSync(deployDir, { recursive: true });

// 复制 dist 文件到 html 目录
console.log('复制静态文件...');
const htmlDir = join(deployDir, 'html');
cpSync(distDir, htmlDir, { recursive: true });

// 生成 nginx 配置文件
console.log('生成 nginx 配置文件...');
const nginxConfig = `server {
    listen       80;
    server_name  _;

    # 前端静态文件
    location / {
        root   html;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }

    # 图片视频资源代理
    location /staticRes/ {
        proxy_pass http://10.100.5.28:5174/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
`;

writeFileSync(join(deployDir, 'nginx.conf'), nginxConfig, 'utf-8');

// 生成部署说明
const readme = `# Nginx 部署说明

## 目录结构
- html/: 前端静态文件目录
- nginx.conf: nginx 配置文件示例

## 部署步骤

### 方式一：复制到 nginx 目录
1. 将 html 目录下的所有文件复制到 nginx 的 html 目录
2. 将 nginx.conf 中的配置添加到 nginx 的配置文件中（通常是 nginx.conf 或 conf.d/*.conf）
3. 重启 nginx 服务

### 方式二：使用独立配置
1. 将整个 nginx-deploy 目录复制到服务器
2. 修改 nginx.conf 中的路径为绝对路径
3. 在 nginx 主配置中 include 此配置文件
4. 重启 nginx 服务

## 配置说明

### 代理配置
如果需要修改资源代理地址，请编辑 nginx.conf 中的：
\`\`\`
location /staticRes/ {
    proxy_pass http://10.100.5.28:5174/;
}
\`\`\`

### 端口配置
默认监听 80 端口，如需修改请编辑：
\`\`\`
listen 80;
\`\`\`

### 域名配置
如需绑定域名，请修改：
\`\`\`
server_name _;
\`\`\`

## 测试
部署完成后，访问 http://your-server-ip 即可查看应用。

## 注意事项
1. 确保 nginx 有读取 html 目录的权限
2. 如使用代理，确保目标服务器可访问
3. 建议启用 HTTPS（需要配置 SSL 证书）
`;

writeFileSync(join(deployDir, 'README.md'), readme, 'utf-8');

console.log('====================================');
console.log('构建完成！');
console.log('部署文件位于: nginx-deploy 目录');
console.log('- html/: 静态文件目录');
console.log('- nginx.conf: nginx 配置文件');
console.log('- README.md: 部署说明');
console.log('====================================');
