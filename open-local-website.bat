@echo off
chcp 65001 >nul
echo פתיחת האתר מקומית עם הנתונים שלך...
echo.

cd /d "%~dp0"
start "" "%~dp0index.html"

echo.
echo ✅ האתר נפתח בדפדפן!
echo.
echo 💡 זה יפתח את האתר עם הנתונים המקומיים שלך
echo.
pause

