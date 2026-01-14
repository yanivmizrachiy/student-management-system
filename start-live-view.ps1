# PowerShell Script - מפעיל את כל המערכת לתצוגה חיה
# פותח שרת, דפדפן, ושומר שהכל רץ תמיד

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 הפעלת תצוגה חיה של האתר" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$projectDir = $PSScriptRoot
$port = 8000

# פונקציה לבדיקה אם פורט תפוס
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
        return $connection
    } catch {
        return $false
    }
}

# פונקציה לעצירת תהליכים על פורט
function Stop-PortProcesses {
    param([int]$Port)
    try {
        $connections = netstat -ano | Select-String ":$Port.*LISTENING"
        foreach ($conn in $connections) {
            $pid = ($conn -split '\s+')[-1]
            if ($pid) {
                Write-Host "🛑 עוצר תהליך ישן (PID: $pid)..." -ForegroundColor Yellow
                taskkill /F /PID $pid 2>$null | Out-Null
            }
        }
        Start-Sleep -Seconds 2
    } catch {
        # התעלם משגיאות
    }
}

# פונקציה להפעלת השרת
function Start-Server {
    Write-Host "🔄 מפעיל שרת..." -ForegroundColor Yellow
    Set-Location $projectDir
    
    # עצור תהליכים ישנים
    Stop-PortProcesses -Port $port
    
    # הפעל את השרת
    $serverProcess = Start-Process python -ArgumentList "server.py" -PassThru -WindowStyle Minimized
    Start-Sleep -Seconds 3
    
    # בדוק אם השרת רץ
    if (Test-Port -Port $port) {
        Write-Host "✅ השרת רץ בהצלחה על פורט $port" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ השרת לא הצליח להתחיל" -ForegroundColor Red
        return $false
    }
}

# פונקציה לפתיחת דפדפן
function Open-Browser {
    $url = "http://localhost:$port/index.html"
    Write-Host "🌐 פותח דפדפן עם $url" -ForegroundColor Cyan
    Start-Process $url
}

# פונקציה להפעלת Keep-Alive
function Start-KeepAlive {
    Write-Host "🔄 מפעיל Keep-Alive (שומר שהשרת תמיד רץ)..." -ForegroundColor Yellow
    Set-Location $projectDir
    
    # בדוק אם psutil מותקן
    $hasPsutil = python -c "import psutil" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  מותקן psutil (נדרש ל-Keep-Alive)..." -ForegroundColor Yellow
        python -m pip install psutil --quiet
    }
    
    # הפעל את keep-server-alive.py
    Start-Process python -ArgumentList "keep-server-alive.py" -WindowStyle Minimized
}

# הפעלה ראשית
Write-Host "📁 תיקיית פרויקט: $projectDir" -ForegroundColor Gray
Write-Host ""

# 1. הפעל שרת
if (Start-Server) {
    # 2. פתח דפדפן
    Start-Sleep -Seconds 2
    Open-Browser
    
    # 3. הפעל Keep-Alive
    Start-Sleep -Seconds 1
    Start-KeepAlive
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "✅ הכל מוכן! האתר רץ וצריך להיפתח בדפדפן" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 טיפים:" -ForegroundColor Cyan
    Write-Host "   - השרת יתעדכן אוטומטית בכל שינוי בקבצים" -ForegroundColor Gray
    Write-Host "   - Keep-Alive שומר שהשרת תמיד רץ" -ForegroundColor Gray
    Write-Host "   - לעצירה: סגור את חלונות השרת" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ נכשל בהפעלת השרת. בדוק שהפורט $port פנוי." -ForegroundColor Red
    Write-Host ""
}

# החזר את התיקייה המקורית
Set-Location $projectDir
