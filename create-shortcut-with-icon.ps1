# יצירת קיצור דרך משופר עם אייקון מותאם

$ErrorActionPreference = "Stop"

$websiteUrl = "https://yanivmizrachiy.github.io/student-management-system/"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "מערכת ניהול תלמידים.url"
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$iconPath = Join-Path $projectPath "favicon.ico"

Write-Host "🔗 יוצר קיצור דרך משופר..." -ForegroundColor Cyan

# בדוק אם יש favicon
if (Test-Path $iconPath) {
    $iconFile = $iconPath
    Write-Host "✅ נמצא favicon.ico" -ForegroundColor Green
} else {
    # השתמש באייקון ברירת מחדל
    $iconFile = "C:\Windows\System32\imageres.dll"
    Write-Host "⚠️  אין favicon.ico - משתמש באייקון ברירת מחדל" -ForegroundColor Yellow
}

# צור קובץ .url עם אייקון
$urlContent = @"
[InternetShortcut]
URL=$websiteUrl
IconIndex=0
IconFile=$iconFile
"@

$urlContent | Out-File -FilePath $shortcutPath -Encoding ASCII -Force

Write-Host "✅ קיצור דרך נוצר בהצלחה!" -ForegroundColor Green
Write-Host "📁 מיקום: $shortcutPath" -ForegroundColor Yellow
Write-Host "🔗 URL: $websiteUrl" -ForegroundColor Cyan
Write-Host "🎨 אייקון: $iconFile" -ForegroundColor Magenta

# נסה לפתוח את הקישור כדי לבדוק
Write-Host "`n🧪 פותח את הקישור..." -ForegroundColor Yellow
Start-Process $websiteUrl

