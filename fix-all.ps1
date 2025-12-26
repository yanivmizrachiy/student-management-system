# תיקון הכל - favicon, קיצור דרך, ומידע על נתונים

$ErrorActionPreference = "Continue"

Write-Host "🔧 מתקן הכל..." -ForegroundColor Cyan
Write-Host ""

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$websiteUrl = "https://yanivmizrachiy.github.io/student-management-system/"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "מערכת ניהול תלמידים.url"

# 1. יצירת favicon פשוט (אם אין)
Write-Host "1️⃣ יוצר favicon..." -ForegroundColor Yellow
$faviconPath = Join-Path $projectPath "favicon.ico"
if (-not (Test-Path $faviconPath)) {
    # יצירת תמונה פשוטה דרך .NET
    try {
        Add-Type -AssemblyName System.Drawing
        $bitmap = New-Object System.Drawing.Bitmap(32, 32)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.Clear([System.Drawing.Color]::FromArgb(15, 12, 41))
        $font = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Bold)
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $graphics.DrawString("נ", $font, $brush, 8, 4)
        $bitmap.Save($faviconPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $graphics.Dispose()
        $bitmap.Dispose()
        Rename-Item $faviconPath "favicon.png" -Force -ErrorAction SilentlyContinue
        Copy-Item "favicon.png" "favicon.ico" -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ favicon נוצר" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  לא הצלחתי ליצור favicon - אשתמש באייקון ברירת מחדל" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✅ favicon כבר קיים" -ForegroundColor Green
}

# 2. עדכון קיצור דרך
Write-Host "2️⃣ מעדכן קיצור דרך..." -ForegroundColor Yellow
$iconFile = if (Test-Path $faviconPath) { $faviconPath } else { "C:\Windows\System32\imageres.dll" }

$urlContent = @"
[InternetShortcut]
URL=$websiteUrl
IconIndex=0
IconFile=$iconFile
"@

$urlContent | Out-File -FilePath $shortcutPath -Encoding ASCII -Force
Write-Host "   ✅ קיצור דרך עודכן" -ForegroundColor Green
Write-Host "   📁 $shortcutPath" -ForegroundColor Cyan

# 3. מידע על נתונים
Write-Host ""
Write-Host "3️⃣ מידע חשוב על נתונים:" -ForegroundColor Yellow
Write-Host "   ⚠️  הנתונים נשמרים ב-localStorage של הדפדפן" -ForegroundColor Yellow
Write-Host "   ⚠️  כשפותחים דרך GitHub Pages, זה דפדפן חדש עם localStorage ריק" -ForegroundColor Yellow
Write-Host "   💡 פתרון: השתמש ב-init_data.html כדי לייבא את הנתונים מחדש" -ForegroundColor Cyan
Write-Host "   💡 או: פתח את index.html מקומית (file://) כדי לראות את הנתונים המקומיים" -ForegroundColor Cyan

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ הכל תוקן!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 כתובת האתר:" -ForegroundColor Yellow
Write-Host "   $websiteUrl" -ForegroundColor White
Write-Host ""
Write-Host "📁 קיצור דרך:" -ForegroundColor Yellow
Write-Host "   $shortcutPath" -ForegroundColor White
Write-Host ""
Write-Host "💡 לחץ כפול על הקיצור דרך כדי לפתוח!" -ForegroundColor Gray
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan

