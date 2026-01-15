# PowerShell Script to Start Student Management System
# Usage: .\start.ps1

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 מערכת ניהול תלמידים - הפעלה אוטומטית" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "🔍 בודק Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker Desktop לא רץ!" -ForegroundColor Red
    Write-Host "   אנא הפעל את Docker Desktop ונסה שוב." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   לחץ Enter לסגירה..."
    Read-Host
    exit 1
}
Write-Host "✅ Docker רץ" -ForegroundColor Green
Write-Host ""

# Start PostgreSQL
Write-Host "📦 מפעיל PostgreSQL..." -ForegroundColor Cyan
Set-Location backend
docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL רץ" -ForegroundColor Green
} else {
    Write-Host "❌ שגיאה בהפעלת PostgreSQL" -ForegroundColor Red
}
Write-Host ""

# Install dependencies if needed
Write-Host "📥 בודק תלויות..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "   מתקין תלויות Backend..." -ForegroundColor Yellow
    npm install
}
Set-Location ..

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "   מתקין תלויות Frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}
Write-Host "✅ תלויות מוכנות" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "🔧 מפעיל Backend Server..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run start:dev" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "✅ Backend Server מתחיל (פורט 3001)" -ForegroundColor Green
Write-Host ""

# Start Frontend
Write-Host "🎨 מפעיל Frontend Server..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "✅ Frontend Server מתחיל (פורט 8080)" -ForegroundColor Green
Write-Host ""

Write-Host "⏳ ממתין שהשרתים יעלו..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Open browser
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ השרתים רצים!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:8080" -ForegroundColor Green
Write-Host "🔧 Backend:  http://localhost:3001" -ForegroundColor Green
Write-Host "📚 API Docs: http://localhost:3001/api" -ForegroundColor Green
Write-Host ""
Write-Host "👤 פרטי התחברות:" -ForegroundColor Yellow
Write-Host "   Email: yaniv@example.com" -ForegroundColor Cyan
Write-Host "   Password: change-me" -ForegroundColor Cyan
Write-Host ""
Write-Host "פותח דפדפן..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:8080"

Write-Host ""
Write-Host "⚠️  אל תסגור את חלונות PowerShell - השרתים רצים שם!" -ForegroundColor Yellow
Write-Host ""
