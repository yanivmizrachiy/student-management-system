# 🔧 סקריפט תיקון והפעלה מלא
# תיקון שגיאות והפעלת כל השרתים

param(
    [switch]$Sync,
    [switch]$DryRun
)

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🔧 תיקון שגיאות והפעלה" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# עצירת תהליכי Node קיימים
Write-Host "🛑 עצירת תהליכי Node קיימים..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ הושלם" -ForegroundColor Green
Write-Host ""

# שלב 1: התקנת Backend dependencies
Write-Host "📦 שלב 1: התקנת תלויות Backend..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path "node_modules")) {
    Write-Host "⏳ מתקין תלויות Backend..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ שגיאה בהתקנת Backend dependencies!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Write-Host "✅ Backend dependencies הותקנו!" -ForegroundColor Green
} else {
    Write-Host "✅ node_modules כבר קיים" -ForegroundColor Green
}
Set-Location ..
Write-Host ""

# שלב 2: התקנת Frontend dependencies
Write-Host "📦 שלב 2: התקנת תלויות Frontend..." -ForegroundColor Yellow
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "⏳ מתקין תלויות Frontend..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ שגיאה בהתקנת Frontend dependencies!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Write-Host "✅ Frontend dependencies הותקנו!" -ForegroundColor Green
} else {
    Write-Host "✅ node_modules כבר קיים" -ForegroundColor Green
}
Set-Location ..
Write-Host ""

# שלב 2.5: סנכרון נתונים (אם נדרש)
if ($Sync) {
    Write-Host "🔄 שלב 2.5: סנכרון נתונים מ-Cloudflare..." -ForegroundColor Yellow
    
    $syncArgs = @()
    if ($DryRun) {
        $syncArgs += "-DryRun"
    }
    $syncArgs += "-Backup"
    
    $syncScript = Join-Path $PSScriptRoot "scripts\sync-from-cloudflare.ps1"
    
    if (Test-Path $syncScript) {
        & $syncScript @syncArgs
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  הסנכרון נכשל, אבל ממשיך..." -ForegroundColor Yellow
        } else {
            Write-Host "✅ סנכרון הושלם!" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  סקריפט הסנכרון לא נמצא ב-scripts/sync-from-cloudflare.ps1" -ForegroundColor Yellow
    }
    Write-Host ""
}

# שלב 3: בדיקת Docker
Write-Host "🐳 שלב 3: בדיקת Docker Desktop..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker Desktop רץ!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Docker Desktop לא רץ!" -ForegroundColor Yellow
        Write-Host "💡 הפעל את Docker Desktop ידנית והמתן שהוא מוכן" -ForegroundColor Cyan
        Write-Host "   ואז הרץ: cd backend && docker-compose up -d" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️  Docker Desktop לא זמין!" -ForegroundColor Yellow
    Write-Host "💡 הפעל את Docker Desktop ידנית" -ForegroundColor Cyan
}
Write-Host ""

# שלב 4: הפעלת PostgreSQL (אם Docker רץ)
Write-Host "🗄️  שלב 4: הפעלת PostgreSQL..." -ForegroundColor Yellow
Set-Location backend
try {
    $containers = docker ps -a --filter "name=student_management_postgres" --format "{{.Names}}" 2>&1
    if ($containers -match "student_management_postgres") {
        Write-Host "⏳ מפעיל PostgreSQL container..." -ForegroundColor Cyan
        docker-compose up -d 2>&1 | Out-Null
        Start-Sleep -Seconds 3
        Write-Host "✅ PostgreSQL רץ!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PostgreSQL container לא נמצא" -ForegroundColor Yellow
        Write-Host "💡 אם Docker רץ, הרץ: docker-compose up -d" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  לא ניתן להפעיל PostgreSQL (Docker לא זמין?)" -ForegroundColor Yellow
}
Set-Location ..
Write-Host ""

# שלב 5: הפעלת Backend
Write-Host "🚀 שלב 5: הפעלת Backend Server..." -ForegroundColor Yellow
$backendScript = @"
cd '$PWD\backend'
Write-Host '🚀 Backend Server מתחיל...' -ForegroundColor Cyan
npm run start:dev
"@
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $backendScript -WindowStyle Normal
Write-Host "✅ חלון Backend נפתח!" -ForegroundColor Green
Start-Sleep -Seconds 5
Write-Host ""

# שלב 6: הפעלת Frontend
Write-Host "🎨 שלב 6: הפעלת Frontend Server..." -ForegroundColor Yellow
$frontendScript = @"
cd '$PWD\frontend'
Write-Host '🎨 Frontend Server מתחיל...' -ForegroundColor Cyan
npm run dev
"@
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $frontendScript -WindowStyle Normal
Write-Host "✅ חלון Frontend נפתח!" -ForegroundColor Green
Start-Sleep -Seconds 5
Write-Host ""

# שלב 7: פתיחת דפדפן
Write-Host "🌐 שלב 7: פתיחת דפדפן..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ הסקריפט הושלם!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 קישור לעמוד הכניסה: " -NoNewline
Write-Host "http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "⏱ המתין 10-15 שניות שהשרתים יעלו" -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 3
Start-Process "http://localhost:8080"
