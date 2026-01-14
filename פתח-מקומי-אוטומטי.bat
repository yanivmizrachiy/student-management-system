@echo off
chcp 65001 >nul
title פתיחת האתר המקומי

echo ============================================================
echo 🌐 בודק אם השרת רץ...
echo ============================================================
echo.

cd /d "%~dp0"

REM בדוק אם השרת רץ
netstat -ano | findstr :8000 >nul
if %errorlevel% neq 0 (
    echo ⚠️ השרת לא רץ - מפעיל שרת...
    start /min python server.py
    timeout /t 3 /nobreak >nul
)

echo ✅ פותח את האתר בדפדפן...
start http://localhost:8000/index.html

echo.
echo ✅ האתר נפתח!
echo.
echo 💡 הקישור: http://localhost:8000/index.html
echo.
timeout /t 2 >nul
