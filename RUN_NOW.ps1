# Quick Start Script - מערכת ניהול תלמידים
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "🚀 מערכת ניהול תלמידים - הפעלה מהירה" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Check Node.js
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js לא מותקן!" -ForegroundColor Red
    Write-Host "   אנא התקן Node.js מ: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "לחץ Enter לסגירה"
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

# Check npm
$npmVersion = npm --version 2>&1
Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
Write-Host ""

# Install Frontend dependencies
Write-Host "📦 בודק תלויות Frontend..." -ForegroundColor Cyan
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "   מתקין תלויות..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ שגיאה בהתקנת תלויות Frontend" -ForegroundColor Red
        Read-Host "לחץ Enter לסגירה"
        exit 1
    }
    Set-Location ..
}
Write-Host "✅ תלויות Frontend מוכנות" -ForegroundColor Green
Write-Host ""

# Start Frontend in new window
Write-Host "🎨 מפעיל Frontend Server (פורט 8080)..." -ForegroundColor Cyan
$frontendProcess = Start-Process pwsh -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$PWD\frontend'; Write-Host '🎨 Frontend Server running on http://localhost:8080' -ForegroundColor Green; npm run dev"
) -WindowStyle Normal -PassThru

Write-Host "✅ Frontend Server מתחיל בחלון נפרד" -ForegroundColor Green
Write-Host ""

Write-Host "⏳ ממתין שהשרת יעלה..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Try to open browser
Write-Host "🌐 פותח דפדפן..." -ForegroundColor Cyan
Start-Process "http://localhost:8080" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Frontend Server רץ!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 האתר: http://localhost:8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  הערה: Backend לא רץ (צריך Docker Desktop)" -ForegroundColor Yellow
Write-Host "   כדי להפעיל Backend, פתח חלון PowerShell נוסף והרץ:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor White
Write-Host "   npm run start:dev" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  אל תסגור את חלון ה-PowerShell שבו רץ Frontend!" -ForegroundColor Yellow
Write-Host ""
Read-Host "לחץ Enter לסגירה"
