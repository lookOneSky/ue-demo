# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## 本地开发

新克隆需要访问原 GitLab 仓库，才能恢复项目定制的 UE 5.3 像素流送库。在项目根目录用 PowerShell 逐行执行以下命令。

```powershell
npm install --no-package-lock
git -c http.proxy= -c https.proxy= fetch --no-tags --depth=1 http://gitlab.internal.daspatial.com/das-wenbo/szwd/pages/ue-demo.git 4f43b1b6a4ae91934eb73091f4fc658986e487cc
$archive = (New-TemporaryFile).FullName
git archive --format=tar "--output=$archive" FETCH_HEAD -- node_modules/@epicgames-ps
tar -xf $archive
Remove-Item -LiteralPath $archive
npm run dev
```

重新安装 npm 依赖后，重新解压定制库。只打包 Web 前端可运行 `npx vite build`。

如需运行或重新打包 `Pack/SignallingWebServer`，先从同一提交恢复该目录下的 `app.cjs`。可在上述 `git archive` 命令的路径列表中加上 `Pack/SignallingWebServer/app.cjs`，然后解压到项目根目录。
