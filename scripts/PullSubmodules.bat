@echo off
setlocal
set "REPO_ROOT=%~dp0.."

echo Synchronizing submodule URLs...
git -C "%REPO_ROOT%" submodule sync --recursive
if errorlevel 1 exit /b %errorlevel%

echo Fetching submodules at the commits recorded by the repository...
git -C "%REPO_ROOT%" submodule update --init --recursive
if errorlevel 1 exit /b %errorlevel%

echo Submodule status:
git -C "%REPO_ROOT%" submodule status --recursive
exit /b %errorlevel%
