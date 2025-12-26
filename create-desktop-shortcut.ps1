# סקריפט ליצירת קיצור דרך בשולחן העבודה עם אייקון

$ErrorActionPreference = "Stop"

# URL של האתר ב-GitHub Pages
$websiteUrl = "https://yanivmizrachiy.github.io/student-management-system/"

# נתיב לשולחן העבודה
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "מערכת ניהול תלמידים.url"

Write-Host "🔗 יוצר קיצור דרך בשולחן העבודה..." -ForegroundColor Cyan

# צור קובץ .url (Internet Shortcut)
$urlContent = @"
[InternetShortcut]
URL=$websiteUrl
IconIndex=0
"@

# נסה להוסיף אייקון מותאם אישית
$iconPath = Join-Path $PSScriptRoot "favicon.ico"
if (-not (Test-Path $iconPath)) {
    # אם אין favicon, נשתמש באייקון ברירת מחדל של Chrome/Edge
    $iconPath = "C:\Windows\System32\SHELL32.dll"
}

# כתוב את קובץ ה-.url
$urlContent | Out-File -FilePath $shortcutPath -Encoding ASCII -Force

Write-Host "✅ קיצור דרך נוצר בהצלחה!" -ForegroundColor Green
Write-Host "📁 מיקום: $shortcutPath" -ForegroundColor Yellow
Write-Host "🔗 URL: $websiteUrl" -ForegroundColor Cyan

# נסה לפתוח את הקיצור דרך כדי לבדוק
Write-Host "`n🧪 בודק את הקישור..." -ForegroundColor Yellow
Start-Process $websiteUrl

Write-Host "`n✅ הושלם!" -ForegroundColor Green

