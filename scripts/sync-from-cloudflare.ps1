#!/usr/bin/env pwsh
# 🔄 Sync data from math-tutor-app (Cloudflare D1) to PostgreSQL

param(
    [switch]$DryRun,
    [switch]$Backup = $true,
    [string]$CloudflareDB = "math-tutor-db"
)

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🔄 Cloudflare D1 → PostgreSQL Sync" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check wrangler
if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Wrangler not installed!" -ForegroundColor Red
    Write-Host "Install: npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}

# Check Cloudflare auth
try {
    wrangler whoami 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw }
    Write-Host "✅ Connected to Cloudflare" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not authenticated to Cloudflare" -ForegroundColor Yellow
    wrangler login
}

# Create directories
$exportDir = "data-exports"
$backupDir = "backups"
New-Item -ItemType Directory -Force -Path $exportDir, $backupDir | Out-Null

# Export from Cloudflare
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$exportFile = "$exportDir/students_$timestamp.json"

Write-Host "`n📥 Exporting from Cloudflare D1..." -ForegroundColor Yellow
wrangler d1 execute $CloudflareDB --remote --command="SELECT * FROM students" --json > $exportFile

$data = Get-Content $exportFile | ConvertFrom-Json
$studentCount = if ($data.results) { $data.results.Count } else { $data.Count }

Write-Host "✅ Exported $studentCount students" -ForegroundColor Green

if ($DryRun) {
    Write-Host "`n🔍 DRY RUN - Not importing to PostgreSQL" -ForegroundColor Yellow
    Write-Host "Data saved to: $exportFile" -ForegroundColor Cyan
    exit 0
}

# Backup PostgreSQL
if ($Backup) {
    Write-Host "`n💾 Backing up PostgreSQL..." -ForegroundColor Yellow
    $backupFile = "$backupDir/postgres_$timestamp.sql"
    docker exec student_management_postgres pg_dump -U postgres student_management > $backupFile 2>&1
    Write-Host "✅ Backup created: $backupFile" -ForegroundColor Green
}

# Generate SQL
Write-Host "`n🔄 Generating SQL import..." -ForegroundColor Yellow
$sqlFile = "$exportDir/import_$timestamp.sql"

$sql = @"
-- Auto-generated import from Cloudflare D1
-- Timestamp: $timestamp

BEGIN;

-- Ensure grades exist
INSERT INTO grades (id, name, student_count)
VALUES
    (gen_random_uuid(), 'כיתה ז''', 0),
    (gen_random_uuid(), 'כיתה ח''', 0),
    (gen_random_uuid(), 'כיתה ט''', 0)
ON CONFLICT DO NOTHING;

-- Ensure default group exists
INSERT INTO groups (id, name, grade_id, student_count)
SELECT gen_random_uuid(), 'קבוצה ראשית', g.id, 0
FROM grades g
WHERE g.name = 'כיתה ז'''
LIMIT 1
ON CONFLICT DO NOTHING;

"@

# Convert students
$results = if ($data.results) { $data.results } else { $data }
foreach ($student in $results) {
    $fullName = $student.full_name -replace "'", "''"
    $firstName = if ($fullName -match '^\s*(\S+)') { $matches[1] } else { $fullName }
    $lastName = $fullName -replace "^$firstName\s*", ""
    
    $sql += @"

INSERT INTO students (id, first_name, last_name, student_id, grade_id, group_id, status)
SELECT
    gen_random_uuid(),
    '$firstName',
    '$lastName',
    'ST' || LPAD((RANDOM() * 99999)::INT::TEXT, 5, '0'),
    g.id,
    gr.id,
    'active'
FROM grades g, groups gr
WHERE g.name = 'כיתה ז''' AND gr.name = 'קבוצה ראשית'
ON CONFLICT (student_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

"@
}

$sql += "`nCOMMIT;"
$sql | Out-File -FilePath $sqlFile -Encoding UTF8

# Import to PostgreSQL
Write-Host "`n📥 Importing to PostgreSQL..." -ForegroundColor Yellow

# Check if PostgreSQL is running
$running = docker ps --filter "name=student_management_postgres" --format "{{.Names}}"
if (-not $running) {
    Write-Host "⚠️  PostgreSQL not running, starting..." -ForegroundColor Yellow
    Push-Location backend
    docker-compose up -d
    Pop-Location
    Start-Sleep -Seconds 10
}

# Execute SQL
Get-Content $sqlFile | docker exec -i student_management_postgres psql -U postgres -d student_management 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Import successful! $studentCount students imported" -ForegroundColor Green
} else {
    Write-Host "`n❌ Import failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ Sync Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
