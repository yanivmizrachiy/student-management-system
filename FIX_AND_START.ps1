# 🔧 סקריפט תיקון והפעלה מלא - גרסה מושלמת
# תיקון שגיאות והפעלת כל השרתים

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🚀 מערכת ניהול תלמידים חכמה" -ForegroundColor Yellow
Write-Host "   🔧 תיקון והפעלה אוטומטית" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# בדיקת תיקייה נוכחית
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ שגיאה: הרץ את הסקריפט מתיקיית הפרויקט הראשית!" -ForegroundColor Red
    exit 1
}

# עצירת תהליכי Node קיימים
Write-Host "🛑 עצירת תהליכי Node קיימים..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ הושלם" -ForegroundColor Green
Write-Host ""

# שלב 1: יצירת קבצי .env
Write-Host "📝 שלב 1: יצירת קבצי .env..." -ForegroundColor Yellow

# Backend .env
if (-not (Test-Path "backend/.env")) {
    Write-Host "⏳ יוצר backend/.env..." -ForegroundColor Cyan
    Copy-Item "backend/.env.example" "backend/.env" -ErrorAction SilentlyContinue
    if (Test-Path "backend/.env") {
        Write-Host "✅ backend/.env נוצר!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  לא נמצא .env.example, יוצר קובץ .env ידנית..." -ForegroundColor Yellow
        @"
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=student_management
JWT_SECRET=my-super-secret-jwt-key-$(Get-Random)
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
"@ | Out-File -FilePath "backend/.env" -Encoding utf8
        Write-Host "✅ backend/.env נוצר!" -ForegroundColor Green
    }
} else {
    Write-Host "✅ backend/.env כבר קיים" -ForegroundColor Green
}

# Frontend .env
if (-not (Test-Path "frontend/.env")) {
    Write-Host "⏳ יוצר frontend/.env..." -ForegroundColor Cyan
    @"
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
"@ | Out-File -FilePath "frontend/.env" -Encoding utf8
    Write-Host "✅ frontend/.env נוצר!" -ForegroundColor Green
} else {
    Write-Host "✅ frontend/.env כבר קיים" -ForegroundColor Green
}
Write-Host ""

# שלב 2: התקנת Backend dependencies
Write-Host "📦 שלב 2: התקנת תלויות Backend..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path "node_modules")) {
    Write-Host "⏳ מתקין תלויות Backend (זה יכול לקחת מספר דקות)..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ שגיאה בהתקנת Backend dependencies!" -ForegroundColor Red
        Write-Host "💡 נסה להריץ: cd backend && npm install --force" -ForegroundColor Yellow
        Set-Location ..
        exit 1
    }
    Write-Host "✅ Backend dependencies הותקנו!" -ForegroundColor Green
} else {
    Write-Host "✅ node_modules כבר קיים" -ForegroundColor Green
}
Set-Location ..
Write-Host ""

# שלב 3: התקנת Frontend dependencies
Write-Host "📦 שלב 3: התקנת תלויות Frontend..." -ForegroundColor Yellow
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "⏳ מתקין תלויות Frontend (זה יכול לקחת מספר דקות)..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ שגיאה בהתקנת Frontend dependencies!" -ForegroundColor Red
        Write-Host "💡 נסה להריץ: cd frontend && npm install --force" -ForegroundColor Yellow
        Set-Location ..
        exit 1
    }
    Write-Host "✅ Frontend dependencies הותקנו!" -ForegroundColor Green
} else {
    Write-Host "✅ node_modules כבר קיים" -ForegroundColor Green
}
Set-Location ..
Write-Host ""

# שלב 4: בדיקת Docker
Write-Host "🐳 שלב 4: בדיקת Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker Desktop רץ!" -ForegroundColor Green
        $dockerRunning = $true
    } else {
        throw "Docker not running"
    }
} catch {
    Write-Host "⚠️  Docker Desktop לא רץ!" -ForegroundColor Yellow
    Write-Host "💡 מנסה להפעיל Docker Desktop..." -ForegroundColor Cyan
    
    # ניסיון להפעיל Docker Desktop
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
        Write-Host "⏳ ממתין ש-Docker Desktop יעלה (30 שניות)..." -ForegroundColor Cyan
        Start-Sleep -Seconds 30
        
        # בדיקה מחדש
        try {
            docker info 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Docker Desktop עלה בהצלחה!" -ForegroundColor Green
                $dockerRunning = $true
            }
        } catch {
            Write-Host "⚠️  Docker Desktop לא זמין עדיין" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Docker Desktop לא מותקן!" -ForegroundColor Yellow
        Write-Host "💡 התקן Docker Desktop מ: https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
    }
}
Write-Host ""

# שלב 5: הפעלת PostgreSQL
Write-Host "🗄️  שלב 5: הפעלת PostgreSQL..." -ForegroundColor Yellow
Set-Location backend

if ($dockerRunning) {
    try {
        # עצירת container ישן אם קיים
        docker stop student_management_postgres 2>&1 | Out-Null
        docker rm student_management_postgres 2>&1 | Out-Null
        
        Write-Host "⏳ מפעיל PostgreSQL container..." -ForegroundColor Cyan
        docker-compose up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "⏳ ממתין ש-PostgreSQL יהיה מוכן (10 שניות)..." -ForegroundColor Cyan
            Start-Sleep -Seconds 10
            Write-Host "✅ PostgreSQL רץ!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  בעיה בהפעלת PostgreSQL" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  לא ניתן להפעיל PostgreSQL" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  PostgreSQL לא הופעל (Docker לא זמין)" -ForegroundColor Yellow
    Write-Host "💡 אחרי שDocker יעלה, הרץ: cd backend && docker-compose up -d" -ForegroundColor Cyan
}

Set-Location ..
Write-Host ""

# שלב 6: הפעלת Backend
Write-Host "🚀 שלב 6: הפעלת Backend Server..." -ForegroundColor Yellow
$backendScript = @"
cd '$PWD\backend'
Write-Host ''
Write-Host '═══════════════════════════════════════════' -ForegroundColor Cyan
Write-Host '   🚀 Backend Server' -ForegroundColor Yellow
Write-Host '═══════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''
Write-Host '📡 Server: http://localhost:3001' -ForegroundColor Green
Write-Host '📚 Swagger Docs: http://localhost:3001/api' -ForegroundColor Green
Write-Host ''
npm run start:dev
"@
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $backendScript -WindowStyle Normal
Write-Host "✅ חלון Backend נפתח!" -ForegroundColor Green
Write-Host "⏳ ממתין שהשרת יעלה (10 שניות)..." -ForegroundColor Cyan
Start-Sleep -Seconds 10
Write-Host ""

# שלב 7: הפעלת Frontend
Write-Host "🎨 שלב 7: הפעלת Frontend Server..." -ForegroundColor Yellow
$frontendScript = @"
cd '$PWD\frontend'
Write-Host ''
Write-Host '═══════════════════════════════════════════' -ForegroundColor Cyan
Write-Host '   🎨 Frontend Server' -ForegroundColor Yellow
Write-Host '═══════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''
Write-Host '🌐 Application: http://localhost:8080' -ForegroundColor Green
Write-Host ''
npm run dev
"@
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $frontendScript -WindowStyle Normal
Write-Host "✅ חלון Frontend נפתח!" -ForegroundColor Green
Write-Host "⏳ ממתין שהאפליקציה תעלה (10 שניות)..." -ForegroundColor Cyan
Start-Sleep -Seconds 10
Write-Host ""

# סיום
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ המערכת הופעלה בהצלחה!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 פותח דפדפן..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📍 כתובות חשובות:" -ForegroundColor Cyan
Write-Host "   🎯 אפליקציה:    " -NoNewline; Write-Host "http://localhost:8080" -ForegroundColor Green
Write-Host "   📡 Backend API:  " -NoNewline; Write-Host "http://localhost:3001" -ForegroundColor Green
Write-Host "   📚 API Docs:     " -NoNewline; Write-Host "http://localhost:3001/api" -ForegroundColor Green
Write-Host ""
Write-Host "💡 טיפים:" -ForegroundColor Cyan
Write-Host "   • אם יש שגיאה, בדוק את החלונות של Backend ו-Frontend" -ForegroundColor White
Write-Host "   • לעצירה: Ctrl+C בכל חלון" -ForegroundColor White
Write-Host "   • לבדיקת PostgreSQL: docker ps" -ForegroundColor White
Write-Host ""

Start-Sleep -Seconds 3
Start-Process "http://localhost:8080"
