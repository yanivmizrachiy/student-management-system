# יצירת אייקון כחול בולט ל-favicon.ico
# סקריפט זה יוצר אייקון כחול בולט עם סמל תלמיד

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🎨 יצירת אייקון כחול בולט" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# בדוק אם ImageMagick מותקן (אופציונלי)
$hasImageMagick = $false
try {
    $magick = Get-Command magick -ErrorAction SilentlyContinue
    if ($magick) {
        $hasImageMagick = $true
        Write-Host "✅ נמצא ImageMagick - נשתמש בו" -ForegroundColor Green
    }
} catch {
    Write-Host "ℹ️  ImageMagick לא מותקן - נשתמש ב-PowerShell" -ForegroundColor Yellow
}

# צור תמונה PNG כחולה בולטת
Write-Host "`n📐 יוצר תמונה כחולה בולטת..." -ForegroundColor White

# אם יש ImageMagick, השתמש בו
if ($hasImageMagick) {
    # צור תמונה כחולה עם גרדיאנט
    $gradient = "gradient:#1976D2-#42A5F5"
    magick -size 256x256 $gradient `
        -fill white -font Arial-Bold -pointsize 120 -gravity center -annotate +0+0 "ת" `
        -fill "#0D47A1" -stroke "#0D47A1" -strokewidth 8 -draw "rectangle 4,4 251,251" `
        favicon-blue.png
    
    # המר ל-ICO
    magick favicon-blue.png -resize 256x256 favicon.ico
    
    Write-Host "✅ אייקון כחול בולט נוצר בהצלחה!" -ForegroundColor Green
} else {
    # שימוש ב-PowerShell עם .NET
    Write-Host "📝 יוצר אייקון באמצעות PowerShell..." -ForegroundColor White
    
    # צור bitmap
    $bitmap = New-Object System.Drawing.Bitmap(256, 256)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # רקע כחול עם גרדיאנט
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new(256, 256),
        [System.Drawing.Color]::FromArgb(25, 118, 210),  # #1976D2
        [System.Drawing.Color]::FromArgb(66, 165, 245)   # #42A5F5
    )
    $graphics.FillRectangle($brush, 0, 0, 256, 256)
    
    # עיגול כחול בולט במרכז
    $circleBrush = New-Object System.Drawing.Drawing2D.RadialGradientBrush(
        [System.Drawing.Rectangle]::new(50, 50, 156, 156),
        [System.Drawing.Color]::FromArgb(100, 181, 246),  # #64B5F6
        [System.Drawing.Color]::FromArgb(21, 101, 192)     # #1565C0
    )
    $graphics.FillEllipse($circleBrush, 50, 50, 156, 156)
    
    # הוסף הברקה
    $highlightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(150, 255, 255, 255))
    $graphics.FillEllipse($highlightBrush, 60, 60, 80, 80)
    
    # סמל תלמיד (אות ת')
    $font = New-Object System.Drawing.Font("Arial", 120, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    # צל לטקסט
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(128, 0, 0, 0))
    $graphics.DrawString("ת", $font, $shadowBrush, [System.Drawing.Rectangle]::new(133, 133, 256, 256), $format)
    $graphics.DrawString("ת", $font, $textBrush, [System.Drawing.Rectangle]::new(128, 128, 256, 256), $format)
    
    # מסגרת כחולה כהה
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(13, 71, 161), 8)  # #0D47A1
    $graphics.DrawRectangle($pen, 4, 4, 248, 248)
    
    # שמור כ-PNG
    $bitmap.Save("favicon-blue.png", [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "✅ תמונה PNG נוצרה: favicon-blue.png" -ForegroundColor Green
    
    # המר ל-ICO (פשוט העתק את ה-PNG כ-ICO - רוב הדפדפנים יקבלו את זה)
    Copy-Item "favicon-blue.png" "favicon.ico" -Force
    Write-Host "✅ אייקון ICO נוצר: favicon.ico" -ForegroundColor Green
    
    # נקה
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $circleBrush.Dispose()
    $textBrush.Dispose()
    $shadowBrush.Dispose()
    $pen.Dispose()
    $font.Dispose()
}

Write-Host "`n✅ האייקון הכחול הבולט מוכן!" -ForegroundColor Green
Write-Host "📁 קבצים שנוצרו:" -ForegroundColor Cyan
Write-Host "   - favicon.ico (אייקון ראשי)" -ForegroundColor White
Write-Host "   - favicon-blue.png (תמונה מקורית)" -ForegroundColor White
Write-Host "`n========================================" -ForegroundColor Cyan

