# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## 本地开发

项目定制的 UE 5.3 像素流送库已单独保存在 `node_modules/@epicgames-ps` 并纳入 Git，项目运行以这份依赖快照为准。新克隆后，在项目根目录用 PowerShell 逐行执行以下命令。

```powershell
npm install --no-package-lock
git restore --source=HEAD --worktree -- node_modules/@epicgames-ps
npm run dev
```

重新安装 npm 依赖后，重新执行上述 `git restore` 命令恢复定制库；若有本地修改，先提交或备份。只打包 Web 前端可运行 `npx vite build`。

如需运行或重新打包 `Pack/SignallingWebServer`，仍需从原 GitLab 提交恢复 `app.cjs`：

```powershell
git -c http.proxy= -c https.proxy= fetch --no-tags --depth=1 http://gitlab.internal.daspatial.com/das-wenbo/szwd/pages/ue-demo.git 4f43b1b6a4ae91934eb73091f4fc658986e487cc
$archive = (New-TemporaryFile).FullName
git archive --format=tar "--output=$archive" FETCH_HEAD -- Pack/SignallingWebServer/app.cjs
tar -xf $archive
Remove-Item -LiteralPath $archive
```
