@echo off
REM Batch Script - מפעיל את כל המערכת לתצוגה חיה
REM פותח שרת, דפדפן, ושומר שהכל רץ תמיד

chcp 65001 >nul
title תצוגה חיה - מערכת ניהול תלמידים

echo ============================================================
echo 🚀 הפעלת תצוגה חיה של האתר
echo ============================================================
echo.

cd /d "%~dp0"

REM הפעל את הסקריפט PowerShell
powershell.exe -ExecutionPolicy Bypass -File "start-live-view.ps1"

pause
