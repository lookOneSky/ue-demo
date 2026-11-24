# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

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

如需运行或重新打包 `Pack/SignallingWebServer`，仍需从原 GitLab 提交恢复 `app.cjs`：

```powershell
git -c http.proxy= -c https.proxy= fetch --no-tags --depth=1 http://gitlab.internal.daspatial.com/das-wenbo/szwd/pages/ue-demo.git 4f43b1b6a4ae91934eb73091f4fc658986e487cc
$archive = (New-TemporaryFile).FullName
git archive --format=tar "--output=$archive" FETCH_HEAD -- Pack/SignallingWebServer/app.cjs
tar -xf $archive
Remove-Item -LiteralPath $archive
```
