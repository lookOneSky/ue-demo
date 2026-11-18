# 推流服务器登录自启动

信令服务器由 `PixelStreamingSignallingUser` 计划任务在当前 Windows 用户登录时启动。浏览器连接后，信令服务器仍按 `MultiIProgress` 配置启动 UE；`-RenderOffScreen` 保持无窗口推流。用户未登录时不会启动。

## 安装

将整个 `SignallingWebServer` 目录一起部署，至少包含 `dist/SignallingWebServer.exe`、`dist/config.json` 和本目录的脚本。登录用于推流的 Windows 账户，双击 `install-user-autostart.bat`。它会检查程序、旧服务和端口，注册仅在该用户登录时运行的任务，并立即启动。已经装过的机器在更新脚本后也双击它，会先停止旧任务再覆盖安装。

如果机器上仍装有旧的 `PixelStreamingSignallingServer` Windows 服务，先以管理员身份停止并删除该服务；安装脚本不会在两个启动方式间抢占 8888、6543 端口。

## 日常操作

- 查看状态：在本目录运行 `powershell.exe -NoProfile -ExecutionPolicy Bypass -File user-task.ps1 status`。
- 开始、结束、重启：分别双击 `start-user-autostart.bat`、`stop-user-autostart.bat`、`restart-user-autostart.bat`。
- 查看实时日志：双击 `view-user-log.bat`；重启任务后重新打开窗口以跟踪新日志。日志位于 `logs/SignallingUser-*.out.log` 和对应的 `.err.log`，每次启动保留最近 10 次。
- 更新程序或 `dist/config.json`：先结束任务，替换文件后再开始任务。
- 取消自启动并停止当前信令服务器及其 UE 子进程：双击 `uninstall-user-autostart.bat`。日志保留。

计划任务通过 `conhost.exe --headless` 无窗口运行 `dist/SignallingWebServer.exe --configFile "dist/config.json"`，工作目录为 `SignallingWebServer`；信令服务器和它拉起的 UE 进程优先级为“高”。它设置了异常退出重启和防重复实例；不要改成 SYSTEM 账户或“不管用户是否登录都运行”。

`dist/config.json` 由根目录的 `config.json` 在执行 `build-exe.ps1` 时复制生成，重新打包会覆盖手动修改的部署配置。
