@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0user-task.ps1" restart
set "CODE=%errorlevel%"
echo.
pause
exit /b %CODE%
