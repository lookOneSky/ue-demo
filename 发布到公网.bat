@echo off
setlocal
chcp 65001 >nul
set "PYTHONIOENCODING=utf-8"
where py.exe >nul 2>&1
if errorlevel 1 goto python
py -3 -B "%~dp0scripts\publish.py" %*
goto done
:python
python -B "%~dp0scripts\publish.py" %*
:done
set "PUBLISH_RESULT=%ERRORLEVEL%"
if not "%PUBLISH_RESULT%"=="0" if "%~1"=="" pause
exit /b %PUBLISH_RESULT%
