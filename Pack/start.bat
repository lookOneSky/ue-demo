@echo off
echo === 运行 SubApp1 ===
cd /d "%~dp0SignallingWebServer"
start cmd /k node "app.cjs"

cd /d "%~dp0DasWDS/win-unpacked/"
DasWDS.exe

pause
