@echo off
chcp 65001 >nul
echo 🚀 מפעיל מנגנון סנכרון אוטומטי ל-GitHub...
echo.

cd /d "%~dp0"

REM נסה להריץ עם Node.js (אם מותקן)
where node >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo ✅ נמצא Node.js - משתמש ב-JavaScript watcher
    node auto-sync-watcher.js
    goto :end
)

REM אחרת, השתמש ב-PowerShell
echo ✅ משתמש ב-PowerShell watcher
powershell -ExecutionPolicy Bypass -File "%~dp0auto-sync-watcher.ps1"

:end
pause

