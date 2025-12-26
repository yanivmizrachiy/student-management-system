# סקריפט אוטומטי לדחיפת שינויים ל-GitHub
# הרצה: .\push-to-github.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔄 מסנכרן עם GitHub..." -ForegroundColor Cyan

# עבור לתיקיית הפרויקט
$projectPath = "C:\Users\yaniv\OneDrive\שולחן העבודה\Glide לניהול תלמידים_files"
Set-Location $projectPath

# בדוק אם יש שינויים
$status = git status --porcelain
if ($status) {
    Write-Host "✅ נמצאו שינויים - מוסיף לקומיט..." -ForegroundColor Yellow
    
    # הוסף את כל הקבצים החשובים
    git add *.html *.js *.md .gitignore 2>&1 | Out-Null
    
    # צור קומיט עם תאריך ושעה
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $commitMessage = "עדכון אוטומטי - $timestamp"
    git commit -m $commitMessage 2>&1 | Out-Null
    
    Write-Host "📤 דוחף ל-GitHub..." -ForegroundColor Yellow
    git push origin main 2>&1 | Out-Null
    
    Write-Host "✅ הכל מסונכרן ל-GitHub!" -ForegroundColor Green
    Write-Host "🔗 https://github.com/yanivmizrachiy/student-management-system" -ForegroundColor Cyan
} else {
    Write-Host "ℹ️ אין שינויים חדשים" -ForegroundColor Gray
}

Write-Host "`n✅ סיום" -ForegroundColor Green

