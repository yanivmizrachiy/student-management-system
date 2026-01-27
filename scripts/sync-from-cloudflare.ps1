# 🔄 Cloudflare D1 to PostgreSQL Sync Script
# Syncs student data from math-tutor-app (Cloudflare D1) to student-management-system (PostgreSQL)

param(
    [switch]$DryRun,
    [switch]$Backup,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🔄 Cloudflare D1 → PostgreSQL Sync" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configuration
$CLOUDFLARE_DB = "math-tutor-db"
$EXPORT_DIR = "data-exports"
$BACKUP_DIR = "backups"
$TIMESTAMP = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

# Create directories
New-Item -ItemType Directory -Force -Path $EXPORT_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null

# Check prerequisites
Write-Host "🔍 בדיקת דרישות מוקדמות..." -ForegroundColor Yellow

# Check wrangler
try {
    $wranglerVersion = wrangler --version 2>&1
    Write-Host "✅ Wrangler: $wranglerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Wrangler לא מותקן!" -ForegroundColor Red
    Write-Host "התקן: npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}

# Check Cloudflare auth
Write-Host "`n🔐 בדיקת התחברות ל-Cloudflare..." -ForegroundColor Yellow
try {
    wrangler whoami 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated"
    }
    Write-Host "✅ מחובר ל-Cloudflare" -ForegroundColor Green
} catch {
    Write-Host "⚠️  לא מחובר ל-Cloudflare!" -ForegroundColor Yellow
    Write-Host "מתחבר..." -ForegroundColor Cyan
    wrangler login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ההתחברות נכשלה!" -ForegroundColor Red
        exit 1
    }
}

# List available databases
Write-Host "`n📊 רשימת Databases זמינים:" -ForegroundColor Yellow
wrangler d1 list

# Export from Cloudflare D1
Write-Host "`n📥 מייצא נתונים מ-Cloudflare D1..." -ForegroundColor Yellow

$exportFile = "$EXPORT_DIR/students_$TIMESTAMP.json"

Write-Host "   📍 Database: $CLOUDFLARE_DB" -ForegroundColor Cyan
Write-Host "   📍 Export to: $exportFile" -ForegroundColor Cyan

# Export students
Write-Host "`n👨‍🎓 מייצא תלמידים..." -ForegroundColor Yellow
$studentsJson = wrangler d1 execute $CLOUDFLARE_DB --remote --command="SELECT * FROM students" --json 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  שגיאה בייצוא מ-Cloudflare D1" -ForegroundColor Yellow
    Write-Host "בודק אם ה-database קיים..." -ForegroundColor Cyan
    
    # Try to create if doesn't exist
    Write-Host "💡 נסה: cd math-tutor-app/worker && wrangler d1 list" -ForegroundColor Cyan
    exit 1
}

# Save to file
$studentsJson | Out-File -FilePath $exportFile -Encoding UTF8
Write-Host "✅ נתונים יוצאו: $exportFile" -ForegroundColor Green

# Parse and count
$data = $studentsJson | ConvertFrom-Json
$studentCount = 0
if ($data.results) {
    $studentCount = $data.results.Count
} elseif ($data -is [Array]) {
    $studentCount = $data.Count
}

Write-Host "📊 נמצאו $studentCount תלמידים" -ForegroundColor Cyan

if ($studentCount -eq 0) {
    Write-Host "⚠️  אין תלמידים לייבא!" -ForegroundColor Yellow
    Write-Host "💡 ודא שיש נתונים ב-Cloudflare D1 database" -ForegroundColor Cyan
    exit 0
}

if ($DryRun) {
    Write-Host "`n🔍 Dry Run Mode - לא מייבא לPostgreSQL" -ForegroundColor Yellow
    Write-Host "הנתונים נשמרו ב: $exportFile" -ForegroundColor Cyan
    exit 0
}

# Backup existing PostgreSQL data
if ($Backup) {
    Write-Host "`n💾 יצירת גיבוי של PostgreSQL..." -ForegroundColor Yellow
    $backupFile = "$BACKUP_DIR/postgres_backup_$TIMESTAMP.sql"
    
    docker exec student_management_postgres pg_dump -U postgres student_management > $backupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ גיבוי נוצר: $backupFile" -ForegroundColor Green
    } else {
        Write-Host "⚠️  לא ניתן ליצור גיבוי (ה-database אולי לא רץ)" -ForegroundColor Yellow
    }
}

# Transform and import to PostgreSQL
Write-Host "`n🔄 ממיר נתונים לפורמט PostgreSQL..." -ForegroundColor Yellow

# Create SQL import script
$sqlFile = "$EXPORT_DIR/import_$TIMESTAMP.sql"
$sql = @"
-- Auto-generated import script
-- Timestamp: $TIMESTAMP
-- Source: Cloudflare D1 ($CLOUDFLARE_DB)
-- Target: PostgreSQL (student_management)

BEGIN;

-- Create grades if not exist
INSERT INTO grades (id, name, student_count) 
VALUES 
    (gen_random_uuid(), 'כיתה ז''', 0),
    (gen_random_uuid(), 'כיתה ח''', 0),
    (gen_random_uuid(), 'כיתה ט''', 0)
ON CONFLICT DO NOTHING;

-- Create default group if not exist
INSERT INTO groups (id, name, grade_id, student_count) 
SELECT gen_random_uuid(), 'קבוצה ראשית', g.id, 0
FROM grades g
WHERE g.name = 'כיתה ז'''
ON CONFLICT DO NOTHING;

"@

# Parse students and create INSERT statements
$results = if ($data.results) { $data.results } else { $data }
foreach ($student in $results) {
    $firstName = $student.first_name -replace "'", "''"
    $lastName = $student.last_name -replace "'", "''"
    $studentId = if ($student.student_id) { $student.student_id } else { "S$(Get-Random -Maximum 999999)" }
    
    $sql += @"

INSERT INTO students (id, first_name, last_name, student_id, grade_id, group_id, status)
SELECT 
    gen_random_uuid(),
    '$firstName',
    '$lastName',
    '$studentId',
    g.id,
    gr.id,
    'active'
FROM grades g
CROSS JOIN groups gr
WHERE g.name = 'כיתה ז''' AND gr.name = 'קבוצה ראשית'
ON CONFLICT (student_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

"@
}

$sql += "`nCOMMIT;"

$sql | Out-File -FilePath $sqlFile -Encoding UTF8
Write-Host "✅ SQL נוצר: $sqlFile" -ForegroundColor Green

# Import to PostgreSQL
Write-Host "`n📥 מייבא ל-PostgreSQL..." -ForegroundColor Yellow

# Check if PostgreSQL is running
$containerRunning = docker ps --filter "name=student_management_postgres" --format "{{.Names}}" 2>&1

if (-not $containerRunning -or $containerRunning -notmatch "student_management_postgres") {
    Write-Host "⚠️  PostgreSQL container לא רץ!" -ForegroundColor Yellow
    Write-Host "מפעיל PostgreSQL..." -ForegroundColor Cyan
    
    cd backend
    docker-compose up -d
    cd ..
    
    Write-Host "⏳ ממתין ש-PostgreSQL יהיה מוכן..." -ForegroundColor Cyan
    Start-Sleep -Seconds 10
}

# Execute SQL
Get-Content $sqlFile | docker exec -i student_management_postgres psql -U postgres -d student_management

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ ייבוא הושלם בהצלחה!" -ForegroundColor Green
    Write-Host "📊 $studentCount תלמידים יובאו" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ שגיאה בייבוא!" -ForegroundColor Red
    Write-Host "💡 בדוק את ה-logs למעלה" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ סנכרון הושלם!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`nקבצים שנוצרו:" -ForegroundColor Cyan
Write-Host "  📄 $exportFile" -ForegroundColor White
Write-Host "  📄 $sqlFile" -ForegroundColor White
if ($Backup) {
    Write-Host "  💾 $backupFile" -ForegroundColor White
}
Write-Host ""
