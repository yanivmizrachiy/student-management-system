#!/usr/bin/env pwsh
# 🔄 סקריפט סנכרון חכם מ-Cloudflare D1

param(
    [switch]$DryRun,
    [switch]$SkipBackup,
    [string]$MathTutorPath = "../math-tutor-app"
)

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🔄 סנכרון נתונים מ-math-tutor-app" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# בדיקת קיום math-tutor-app
if (-not (Test-Path $MathTutorPath)) {
    Write-Host "❌ לא נמצא: $MathTutorPath" -ForegroundColor Red
    Write-Host "💡 הורד את math-tutor-app מ-GitHub או ציין נתיב:" -ForegroundColor Yellow
    Write-Host "   .\sync-from-cloudflare.ps1 -MathTutorPath 'C:\path\to\math-tutor-app'" -ForegroundColor White
    exit 1
}

Write-Host "✅ נמצא: $MathTutorPath" -ForegroundColor Green
Write-Host ""

# שלב 1: בדיקת wrangler
Write-Host "🔍 שלב 1: בדיקת Wrangler CLI..." -ForegroundColor Yellow
try {
    $wranglerVersion = wrangler --version 2>&1
    Write-Host "✅ Wrangler מותקן: $wranglerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Wrangler לא מותקן!" -ForegroundColor Red
    Write-Host "💡 התקן: npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# שלב 2: בדיקת חיבור ל-Cloudflare
Write-Host "🔍 שלב 2: בדיקת חיבור ל-Cloudflare..." -ForegroundColor Yellow
Push-Location $MathTutorPath/worker
try {
    $whoami = wrangler whoami 2>&1
    Write-Host "✅ מחובר ל-Cloudflare" -ForegroundColor Green
    Write-Host $whoami -ForegroundColor Gray
} catch {
    Write-Host "❌ לא מחובר ל-Cloudflare!" -ForegroundColor Red
    Write-Host "💡 התחבר: wrangler login" -ForegroundColor Yellow
    Pop-Location
    exit 1
}
Write-Host ""

# שלב 3: רשימת databases
Write-Host "🔍 שלב 3: חיפוש math-tutor-db..." -ForegroundColor Yellow
$databases = wrangler d1 list --json | ConvertFrom-Json
$mathTutorDB = $databases | Where-Object { $_.name -eq "math-tutor-db" }

if (-not $mathTutorDB) {
    Write-Host "⚠️  math-tutor-db לא נמצא בענן!" -ForegroundColor Yellow
    Write-Host "💡 אולי הנתונים רק מקומיים? מנסה מצב local..." -ForegroundColor Cyan
    $useLocal = $true
} else {
    Write-Host "✅ נמצא: math-tutor-db (ID: $($mathTutorDB.uuid))" -ForegroundColor Green
    $useLocal = $false
}
Write-Host ""

# שלב 4: יצוא נתונים
$exportDir = "../../data-exports"
if (-not (Test-Path $exportDir)) {
    New-Item -ItemType Directory -Path $exportDir | Out-Null
}

Write-Host "📥 שלב 4: ייצוא נתונים..." -ForegroundColor Yellow

$tables = @("students", "lessons", "payments", "receipts", "settings")
$exportedData = @{}

foreach ($table in $tables) {
    Write-Host "  ⏳ מייצא $table..." -ForegroundColor Cyan
    
    try {
        if ($useLocal) {
            # ייצוא מקומי
            $data = wrangler d1 execute math-tutor-db --local --command="SELECT * FROM $table" --json 2>&1
        } else {
            # ייצוא מהענן
            $data = wrangler d1 execute math-tutor-db --remote --command="SELECT * FROM $table" --json 2>&1
        }
        
        $jsonFile = "$exportDir/$table.json"
        $data | Out-File -FilePath $jsonFile -Encoding utf8
        
        # ספירת רשומות
        try {
            $parsed = $data | ConvertFrom-Json
            $count = $parsed.Count
            Write-Host "  ✅ $table`: $count רשומות" -ForegroundColor Green
            $exportedData[$table] = $parsed
        } catch {
            Write-Host "  ⚠️  $table`: לא ניתן לספור (אולי ריק)" -ForegroundColor Yellow
            $exportedData[$table] = @()
        }
    } catch {
        Write-Host "  ❌ שגיאה בייצוא $table" -ForegroundColor Red
        $exportedData[$table] = @()
    }
}

Pop-Location
Write-Host ""

# שלב 5: גיבוי מסד הנתונים הנוכחי
if (-not $SkipBackup) {
    Write-Host "💾 שלב 5: גיבוי מסד נתונים נוכחי..." -ForegroundColor Yellow
    
    $backupDir = "backups"
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupFile = "$backupDir/backup_$timestamp.sql"
    
    try {
        docker exec student_management_postgres pg_dump -U postgres student_management > $backupFile
        Write-Host "✅ גיבוי נוצר: $backupFile" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  לא ניתן ליצור גיבוי (PostgreSQL לא רץ?)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# שלב 6: המרה והכנסה למסד הנתונים
Write-Host "🔄 שלב 6: המרה והכנסת נתונים..." -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "🔍 מצב Dry Run - מציג את מה שהיה קורה:" -ForegroundColor Cyan
    Write-Host ""
    
    $totalStudents = $exportedData["students"].Count
    $totalLessons = $exportedData["lessons"].Count
    $totalPayments = $exportedData["payments"].Count
    
    Write-Host "📊 סיכום נתונים שיובאו:" -ForegroundColor Yellow
    Write-Host "  👨‍🎓 תלמידים: $totalStudents" -ForegroundColor White
    Write-Host "  📚 שיעורים: $totalLessons" -ForegroundColor White
    Write-Host "  💰 תשלומים: $totalPayments" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 להרצה אמיתית הסר את -DryRun" -ForegroundColor Yellow
} else {
    Write-Host "⏳ יוצר סקריפט SQL להמרה..." -ForegroundColor Cyan
    
    # וידוא קיום תיקיית migrations
    $migrationsDir = "backend/migrations"
    if (-not (Test-Path $migrationsDir)) {
        New-Item -ItemType Directory -Path $migrationsDir | Out-Null
        Write-Host "✅ תיקיית migrations נוצרה" -ForegroundColor Green
    }
    
    # יצירת SQL migration script
    $migrationScript = @"
-- Auto-generated migration from math-tutor-app
-- Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

BEGIN;

-- הוספת כיתות (אם לא קיימות)
INSERT INTO grades (id, name, student_count, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'כיתה ז''', 0, NOW(), NOW()),
    (gen_random_uuid(), 'כיתה ח''', 0, NOW(), NOW()),
    (gen_random_uuid(), 'כיתה ט''', 0, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- הוספת קבוצת ברירת מחדל לכל כיתה
INSERT INTO groups (id, name, grade_id, teacher_id, student_count, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'קבוצה כללית',
    g.id,
    NULL,
    0,
    NOW(),
    NOW()
FROM grades g
WHERE NOT EXISTS (
    SELECT 1 FROM groups WHERE grade_id = g.id
);

"@

    # המרת תלמידים - רק אם יש נתונים
    if ($exportedData["students"] -and $exportedData["students"].Count -gt 0) {
        foreach ($student in $exportedData["students"]) {
            # Sanitize data - escape single quotes and remove potentially dangerous characters
            $fullName = ($student.full_name -replace "'", "''") -replace "[;\\]", ""
            $fullName = $fullName.Trim()
            
            if ([string]::IsNullOrWhiteSpace($fullName)) {
                Write-Host "  ⚠️  מדלג על תלמיד ללא שם" -ForegroundColor Yellow
                continue
            }
            
            # Parse first name and last name
            $nameParts = $fullName -split '\s+', 2
            $firstName = $nameParts[0] -replace "'", "''"
            $lastName = if ($nameParts.Length -gt 1) { $nameParts[1] -replace "'", "''" } else { "" }
            
            $phone = if ($student.phone) { 
                $cleanPhone = ($student.phone -replace "'", "''") -replace "[^0-9\-\+\(\)\s]", ""
                "'$cleanPhone'" 
            } else { 
                "NULL" 
            }
            $notes = if ($student.notes) { 
                $cleanNotes = ($student.notes -replace "'", "''") -replace "[;\\]", ""
                "'$cleanNotes'" 
            } else { 
                "NULL" 
            }
            
            $migrationScript += @"

-- תלמיד: $fullName
DO `$`$
DECLARE
    v_grade_id uuid;
    v_group_id uuid;
BEGIN
    -- קבלת כיתה וקבוצה ראשונות זמינות
    SELECT id INTO v_grade_id FROM grades LIMIT 1;
    SELECT id INTO v_group_id FROM groups LIMIT 1;
    
    -- הכנסת תלמיד
    IF v_grade_id IS NOT NULL AND v_group_id IS NOT NULL THEN
        INSERT INTO students (id, first_name, last_name, grade_id, group_id, status, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            '$firstName',
            '$lastName',
            v_grade_id,
            v_group_id,
            'active',
            NOW(),
            NOW()
        );
    END IF;
END `$`$;

"@
        }
    } else {
        Write-Host "  ⚠️  לא נמצאו תלמידים לייבוא" -ForegroundColor Yellow
    }
    
    $migrationScript += "`nCOMMIT;"
    
    $migrationFile = "backend/migrations/$(Get-Date -Format "yyyyMMdd_HHmmss")_import_from_math_tutor.sql"
    $migrationScript | Out-File -FilePath $migrationFile -Encoding utf8
    
    Write-Host "✅ סקריפט SQL נוצר: $migrationFile" -ForegroundColor Green
    Write-Host ""
    
    # בדיקת קיום container
    Write-Host "⏳ בדיקת PostgreSQL container..." -ForegroundColor Cyan
    try {
        $containerCheck = docker ps --filter "name=student_management_postgres" --format "{{.Names}}" 2>&1
        if (-not ($containerCheck -match "student_management_postgres")) {
            Write-Host "❌ PostgreSQL container לא רץ!" -ForegroundColor Red
            Write-Host "💡 הפעל את PostgreSQL: cd backend && docker-compose up -d" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "✅ PostgreSQL container רץ" -ForegroundColor Green
    } catch {
        Write-Host "❌ שגיאה בבדיקת Docker" -ForegroundColor Red
        Write-Host "💡 ודא ש-Docker Desktop רץ" -ForegroundColor Yellow
        exit 1
    }
    
    # הרצת הסקריפט
    Write-Host "⏳ מריץ סקריפט SQL..." -ForegroundColor Cyan
    try {
        # שמירת הסקריפט כקובץ זמני
        $tempFile = [System.IO.Path]::GetTempFileName()
        Copy-Item $migrationFile $tempFile -Force
        
        # הרצה עם טיפול בשגיאות
        $result = docker exec -i student_management_postgres psql -U postgres -d student_management -f /dev/stdin < $tempFile 2>&1
        $exitCode = $LASTEXITCODE
        
        # ניקוי
        Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
        
        if ($exitCode -eq 0) {
            Write-Host "✅ נתונים הוכנסו בהצלחה!" -ForegroundColor Green
        } else {
            Write-Host "❌ שגיאה בהרצת SQL" -ForegroundColor Red
            Write-Host "פלט שגיאה:" -ForegroundColor Yellow
            Write-Host $result -ForegroundColor Gray
            Write-Host ""
            Write-Host "💡 בדוק את הקובץ: $migrationFile" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ שגיאה בהרצת SQL" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Gray
        Write-Host "💡 ודא ש-PostgreSQL רץ: docker-compose up -d" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ סנכרון הושלם!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 סיכום:" -ForegroundColor Yellow
Write-Host "  📂 נתוני export: data-exports/" -ForegroundColor White
Write-Host "  💾 גיבויים: backups/" -ForegroundColor White
Write-Host "  🔄 מיגרציות: backend/migrations/" -ForegroundColor White
Write-Host ""
Write-Host "🚀 להפעלת המערכת:" -ForegroundColor Cyan
Write-Host "  .\FIX_AND_START.ps1" -ForegroundColor White
