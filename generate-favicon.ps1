# יצירת favicon פשוט באמצעות .NET

Add-Type -AssemblyName System.Drawing

# צור תמונה 32x32
$bitmap = New-Object System.Drawing.Bitmap(32, 32)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# רקע כהה עם גרדיאנט
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.Point]::new(0, 0),
    [System.Drawing.Point]::new(32, 32),
    [System.Drawing.Color]::FromArgb(15, 12, 41),
    [System.Drawing.Color]::FromArgb(36, 36, 62)
)
$graphics.FillRectangle($brush, 0, 0, 32, 32)

# ציור אות עברית (נ' - ניהול)
$font = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$graphics.DrawString("נ", $font, $textBrush, 8, 4)

# שמור כ-ICO
$iconPath = Join-Path $PSScriptRoot "favicon.ico"
$bitmap.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Icon)

$graphics.Dispose()
$bitmap.Dispose()
$brush.Dispose()
$textBrush.Dispose()
$font.Dispose()

Write-Host "✅ Favicon נוצר: $iconPath" -ForegroundColor Green

