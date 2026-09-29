@echo off
title Al-Tayer Admin Dashboard
cd /d "%~dp0"

set "PY=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
if not exist "%PY%" set "PY=py"
if not exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
  where py >nul 2>&1 || where python >nul 2>&1 || goto :nofile
)

echo.
echo  Starting Al-Tayer Admin Dashboard...
echo  A browser tab will open automatically.
echo  Keep this window open while you use the dashboard.
echo.

if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
  "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" "%~dp0serve.py"
) else if exist "C:\Windows\py.exe" (
  C:\Windows\py.exe -3 "%~dp0serve.py"
) else (
  python "%~dp0serve.py"
)
goto :eof

:nofile
echo Python not found. Opening index.html directly...
start "" "%~dp0index.html"
pause
