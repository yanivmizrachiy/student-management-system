# יוצר קיצור דרך משופר בשולחן העבודה עם אייקון מותאם

$ErrorActionPreference = "Stop"

# URL של האתר
$websiteUrl = "https://yanivmizrachiy.github.io/student-management-system/"

# נתיבים
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "מערכת ניהול תלמידים.url"
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "🔗 יוצר קיצור דרך משופר בשולחן העבודה..." -ForegroundColor Cyan

# צור קובץ .url
$urlContent = @"
[InternetShortcut]
URL=$websiteUrl
IconIndex=0
IconFile=C:\Windows\System32\imageres.dll
"@

$urlContent | Out-File -FilePath $shortcutPath -Encoding ASCII -Force

Write-Host "✅ קיצור דרך נוצר בהצלחה!" -ForegroundColor Green
Write-Host "📁 מיקום: $shortcutPath" -ForegroundColor Yellow
Write-Host "🔗 URL: $websiteUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 לחץ כפול על הקיצור דרך כדי לפתוח את האתר!" -ForegroundColor Gray

