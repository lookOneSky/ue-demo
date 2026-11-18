@echo off
setlocal
chcp 65001 >nul

set "SCRIPT_DIR=%~dp0"

python -c "import sys; print('PYTHON3_OK' if sys.version_info.major == 3 else '')" 2>nul | findstr /x "PYTHON3_OK" >nul
if errorlevel 1 goto try_py_launcher

python "%SCRIPT_DIR%disable_dasassetlibrary_git_proxy.py"
goto finish

:try_py_launcher
py -3 -c "import sys; print('PYTHON3_OK' if sys.version_info.major == 3 else '')" 2>nul | findstr /x "PYTHON3_OK" >nul
if errorlevel 1 goto python_not_found

py -3 "%SCRIPT_DIR%disable_dasassetlibrary_git_proxy.py"
goto finish

:python_not_found
echo 未找到可用的 Python 3，无法执行代理配置脚本。
set "EXIT_CODE=1"
goto end

:finish
set "EXIT_CODE=%ERRORLEVEL%"

:end
echo.
if not "%EXIT_CODE%"=="0" echo 执行失败，退出代码：%EXIT_CODE%
pause
exit /b %EXIT_CODE%
