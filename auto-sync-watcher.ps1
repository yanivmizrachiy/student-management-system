# מנגנון סנכרון אוטומטי ל-GitHub (PowerShell)
# רץ ברקע ומסנכרן כל שינוי אוטומטית

$ErrorActionPreference = "Continue"
$projectPath = "C:\Users\yaniv\OneDrive\שולחן העבודה\Glide לניהול תלמידים_files"
$syncMarker = Join-Path $projectPath ".sync-marker.json"
$lastSyncFile = Join-Path $projectPath ".last-sync.txt"
$gitBatchDelay = 5000  # 5 שניות - ממתין לאיסוף שינויים מרובים

$lastSyncVersion = $null
$syncTimer = $null

# טען את הגרסה האחרונה שסונכרנה
function Load-LastSync {
    if (Test-Path $lastSyncFile) {
        $content = Get-Content $lastSyncFile -Raw
        $script:lastSyncVersion = if ($content) { [int]$content.Trim() } else { $null }
    } else {
        $script:lastSyncVersion = $null
    }
}

# שמור את הגרסה האחרונה שסונכרנה
function Save-LastSync {
    param([int]$version)
    try {
        Set-Content -Path $lastSyncFile -Value $version.ToString()
        $script:lastSyncVersion = $version
    } catch {
        Write-Host "שגיאה בשמירת last sync: $_" -ForegroundColor Red
    }
}

# בדוק אם יש שינויים חדשים
function Check-ForChanges {
    if (-not (Test-Path $syncMarker)) {
        return $null
    }
    
    try {
        $content = Get-Content $syncMarker -Raw | ConvertFrom-Json
        
        # בדוק אם זה שינוי חדש
        if ($lastSyncVersion -and $content.version -le $lastSyncVersion) {
            return $null
        }
        
        return $content
    } catch {
        return $null
    }
}

# בצע commit ו-push ל-GitHub
function Sync-ToGitHub {
    param($syncData)
    
    try {
        Write-Host "`n🔄 [$(Get-Date -Format 'HH:mm:ss')] מסנכרן ל-GitHub..." -ForegroundColor Cyan
        
        Set-Location $projectPath
        
        # בדוק סטטוס
        $status = git status --porcelain 2>&1
        if ($LASTEXITCODE -ne 0 -or -not $status) {
            Write-Host "⚠️  אין שינויים ב-Git" -ForegroundColor Yellow
            Save-LastSync $syncData.version
            return
        }
        
        if (-not $status.Trim()) {
            Write-Host "ℹ️  אין שינויים חדשים" -ForegroundColor Gray
            Save-LastSync $syncData.version
            return
        }
        
        # הוסף את כל הקבצים החשובים
        Write-Host "📦 מוסיף קבצים..." -ForegroundColor Yellow
        git add *.html *.js *.md .gitignore 2>&1 | Out-Null
        
        # צור commit
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $commitMessage = "עדכון אוטומטי - $timestamp"
        Write-Host "💾 יוצר commit..." -ForegroundColor Yellow
        git commit -m $commitMessage 2>&1 | Out-Null
        
        # דחוף ל-GitHub
        Write-Host "📤 דוחף ל-GitHub..." -ForegroundColor Yellow
        git push origin main 2>&1 | Out-Null
        
        # שמור את הגרסה שסונכרנה
        Save-LastSync $syncData.version
        
        Write-Host "✅ סנכרון הושלם בהצלחה!" -ForegroundColor Green
        Write-Host "🔗 https://github.com/yanivmizrachiy/student-management-system`n" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ שגיאה בסנכרון: $_" -ForegroundColor Red
    }
}

# פונקציה ראשית - בודקת ומסנכרנת
function Process-Sync {
    $syncData = Check-ForChanges
    
    if ($syncData) {
        # יש שינוי - אבל ממתין קצת לאיסוף שינויים מרובים
        if ($syncTimer) {
            $syncTimer.Stop()
            $syncTimer.Dispose()
        }
        
        $script:syncTimer = [System.Timers.Timer]::new($gitBatchDelay)
        $script:syncTimer.AutoReset = $false
        $script:syncTimer.Add_Elapsed({
            Sync-ToGitHub $syncData
            $script:syncTimer = $null
        })
        $script:syncTimer.Start()
    }
}

# התחל
Write-Host "🚀 מנגנון סנכרון אוטומטי ל-GitHub הופעל" -ForegroundColor Green
Write-Host "📁 תיקייה: $projectPath" -ForegroundColor Cyan
Write-Host "⏱️  בודק שינויים כל 3 שניות...`n" -ForegroundColor Yellow

Load-LastSync

# בדוק שינויים כל 3 שניות
$timer = [System.Timers.Timer]::new(3000)
$timer.AutoReset = $true
$timer.Add_Elapsed({ Process-Sync })
$timer.Start()

# בדיקה ראשונית מיידית
Process-Sync

# טיפול בסגירה נקייה
$Host.UI.RawUI.WindowTitle = "GitHub Auto-Sync - Student Management"
Write-Host "להפסקה לחץ Ctrl+C`n" -ForegroundColor Gray

try {
    # המשך לרוץ עד Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`n🛑 עוצר מנגנון סנכרון..." -ForegroundColor Yellow
    if ($syncTimer) {
        $syncTimer.Stop()
        $syncTimer.Dispose()
        $syncData = Check-ForChanges
        if ($syncData) {
            Sync-ToGitHub $syncData
        }
    }
    $timer.Stop()
    $timer.Dispose()
}

