# סקריפט הפעלה מיידי - מערכת ניהול תלמידים
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 מפעיל מערכת ניהול תלמידים - מיידית!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# בדיקת Node.js
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js לא מותקן!" -ForegroundColor Red
    Read-Host "לחץ Enter לסגירה"
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

# התקנת תלויות Frontend
Write-Host ""
Write-Host "📦 בודק תלויות Frontend..." -ForegroundColor Cyan
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "   מתקין תלויות Frontend..." -ForegroundColor Yellow
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

# התקנת תלויות Backend
Write-Host ""
Write-Host "📦 בודק תלויות Backend..." -ForegroundColor Cyan
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "   מתקין תלויות Backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ שגיאה בהתקנת תלויות Backend" -ForegroundColor Red
        Read-Host "לחץ Enter לסגירה"
        exit 1
    }
    Set-Location ..
}
Write-Host "✅ תלויות Backend מוכנות" -ForegroundColor Green

# הפעלת PostgreSQL (Docker)
Write-Host ""
Write-Host "🐳 מפעיל PostgreSQL..." -ForegroundColor Cyan
Set-Location backend
docker-compose up -d 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL רץ" -ForegroundColor Green
} else {
    Write-Host "⚠️  Docker Compose לא הצליח - ודא ש-Docker Desktop רץ" -ForegroundColor Yellow
}
Set-Location ..
Start-Sleep -Seconds 3

# הפעלת Backend
Write-Host ""
Write-Host "🔧 מפעיל Backend Server..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$PWD\backend'; Write-Host '🔧 Backend Server running on http://localhost:3001' -ForegroundColor Green; npm run start:dev"
) -WindowStyle Normal
Start-Sleep -Seconds 3

# הפעלת Frontend
Write-Host ""
Write-Host "🎨 מפעיל Frontend Server..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$PWD\frontend'; Write-Host '🎨 Frontend Server running on http://localhost:8080' -ForegroundColor Green; npm run dev"
) -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "⏳ ממתין שהשרתים יעלו (15 שניות)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# פתיחת דפדפן
Write-Host ""
Write-Host "🌐 פותח דפדפן..." -ForegroundColor Cyan
Start-Process "http://localhost:8080" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ השרתים רצים!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:8080" -ForegroundColor Yellow
Write-Host "🔧 Backend:  http://localhost:3001" -ForegroundColor Yellow
Write-Host "📚 API Docs: http://localhost:3001/api" -ForegroundColor Yellow
Write-Host ""
Write-Host "👤 פרטי התחברות:" -ForegroundColor Cyan
Write-Host "   Email: yaniv@example.com" -ForegroundColor White
Write-Host "   Password: change-me" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  אל תסגור את חלונות PowerShell - השרתים רצים שם!" -ForegroundColor Yellow
Write-Host ""
