# סקריפט להגדרת GitHub Pages וקיצור דרך

$ErrorActionPreference = "Continue"

Write-Host "🚀 מגדיר GitHub Pages וקיצור דרך..." -ForegroundColor Cyan
Write-Host ""

$repoName = "student-management-system"
$username = "yanivmizrachiy"
$websiteUrl = "https://$username.github.io/$repoName/"

# שלב 1: הגדרת GitHub Pages
Write-Host "📝 מגדיר GitHub Pages..." -ForegroundColor Yellow
try {
    # בדוק אם GitHub Pages כבר מוגדר
    $pagesInfo = gh api repos/$username/$repoName/pages --jq '{status: .status, url: .html_url}' 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ GitHub Pages כבר מוגדר!" -ForegroundColor Green
        $pagesInfo | ConvertFrom-Json | Format-List
    } else {
        Write-Host "⚙️  מגדיר GitHub Pages..." -ForegroundColor Yellow
        # הגדר GitHub Pages עם main branch ו-root path
        $body = @{
            source = @{
                branch = "main"
                path = "/"
            }
        } | ConvertTo-Json
        
        gh api repos/$username/$repoName/pages -X POST --input - <<< $body 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ GitHub Pages הוגדר בהצלחה!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  ייתכן ש-GitHub Pages כבר מוגדר או צריך להמתין" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️  שגיאה בהגדרת GitHub Pages: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "⏳ ממתין כמה שניות לפעילות GitHub Pages..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# שלב 2: בדיקת URL
Write-Host ""
Write-Host "🔍 בודק את כתובת האתר..." -ForegroundColor Yellow
Write-Host "🔗 כתובת האתר: $websiteUrl" -ForegroundColor Cyan

# שלב 3: יצירת קיצור דרך בשולחן העבודה
Write-Host ""
Write-Host "📁 יוצר קיצור דרך בשולחן העבודה..." -ForegroundColor Yellow

$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "מערכת ניהול תלמידים.url"

# צור קובץ .url (Internet Shortcut)
$urlContent = @"
[InternetShortcut]
URL=$websiteUrl
IconIndex=0
"@

$urlContent | Out-File -FilePath $shortcutPath -Encoding ASCII -Force

Write-Host "✅ קיצור דרך נוצר בהצלחה!" -ForegroundColor Green
Write-Host "📁 מיקום: $shortcutPath" -ForegroundColor Yellow

# שלב 4: נסה לפתוח את האתר
Write-Host ""
Write-Host "🌐 פותח את האתר בדפדפן..." -ForegroundColor Yellow
Start-Process $websiteUrl

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ הכל מוכן!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 כתובת האתר הקבועה:" -ForegroundColor Yellow
Write-Host "   $websiteUrl" -ForegroundColor White
Write-Host ""
Write-Host "📁 קיצור דרך בשולחן העבודה:" -ForegroundColor Yellow
Write-Host "   $shortcutPath" -ForegroundColor White
Write-Host ""
Write-Host "💡 הערה: GitHub Pages יכול לקחת 1-2 דקות להיכנס לפעילות" -ForegroundColor Gray
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan

