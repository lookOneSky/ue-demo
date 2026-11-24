# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## APIDemo 界面设计

运行 `npm run dev` 后，打开终端显示的本地地址即可进入示例工作台。实时视口默认连接 `ws://127.0.0.1:6543`，可通过 Vite 环境变量 `VITE_SIGNAL_SERVER_URL` 指向其他信令服务。示例目录、代码和接口参考均可在连接前浏览。

[蓝白色工作台设计记录与预览](docs/api-demo-preview/README.md)

## 从本机临时发布 APIDemo

双击根目录的 [发布到公网.bat](发布到公网.bat)。脚本构建当前工作台，在本机回环地址启动预览，并使用 Cloudflare Quick Tunnel。看到“公网地址”后，复制整条 HTTPS 链接给访问者。保持电脑和发布窗口运行。按 Ctrl+C 可撤下网站，下次启动会获得新地址。[Quick Tunnels 说明](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/)

新地址首次打开若遇到连接错误，可保持窗口开启，稍后刷新同一链接。

同一入口支持本机预览、查询当前地址和停止发布。

```powershell
.\发布到公网.bat --local-only
.\发布到公网.bat status
.\发布到公网.bat stop
```

首次使用请先按下节安装前端依赖，并准备 Python 3.10+。脚本优先复用 `I:/CodeAll/QuickTunnel/cloudflared.exe`，也支持 PATH 中的 `cloudflared`。隧道的 HTTP 请求默认使用本机代理 `http://127.0.0.1:10808`，运行日志位于 `.publish`。

浏览示例目录和接口文档只需打开网页。实时视口的信令经同一地址的 `/pixel-streaming` 转发到本机 `127.0.0.1:6543`。已有 `VITE_SIGNAL_SERVER_URL` 配置时优先使用该地址，公网 HTTPS 页面应使用 `wss://`。实时画面还需运行 UE 实例，并为访问者提供可连通的 WebRTC 媒体路径，必要时配置 TURN。

## 本地开发

环境要求：Node.js 22.12+、npm 11.16+。在项目根目录执行一次安装即可准备好 Web 前端，包括项目定制的 UE 5.3 像素流送库：

```powershell
npm install
npm run dev
```

定制库保存在 `vendor/@epicgames-ps`，通过本地 npm 依赖自动安装，不再需要手工恢复 `node_modules`。`package-lock.json` 固定依赖版本；`package.json` 的 `allowScripts` 已登记构建依赖需要的安装脚本。更新这些依赖后应重新审核对应版本的脚本。

仅开发和打包 Web 前端不需要初始化子模块。需要编辑像素流送上游源码、运行信令服务或相关打包流程时，再执行原有脚本，递归拉取主仓库锁定版本的子模块：

```powershell
.\scripts\PullSubmodules.bat
```

`npm run build` 会先执行严格 TypeScript 检查，再打包。项目现有类型错误仍需另行整理；只打包 Web 前端可运行 `npx vite build`。`npm run docs`、`npm run docs:html` 和 `npm run docs:all` 使用 TypeScript 解析项目的 JS/JSDoc，生成 Markdown 或 HTML 文档。

`Pack/SignallingWebServer/app.cjs` 已随仓库提交，克隆后可直接用于运行或重新打包信令服务。
