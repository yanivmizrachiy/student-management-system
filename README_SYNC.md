# 🔄 Data Sync Guide - Cloudflare D1 to PostgreSQL

## Overview
This guide explains how to synchronize student data from your Cloudflare D1 database (math-tutor-app) to the PostgreSQL database used by the Student Management System.

## 📋 Prerequisites

1. **Wrangler CLI** installed:
   ```bash
   npm install -g wrangler
   ```

2. **Cloudflare authentication**:
   ```bash
   wrangler login
   ```

3. **Docker running** (for PostgreSQL):
   ```bash
   docker ps
   ```

4. **PostgreSQL database** running:
   ```bash
   cd backend
   docker-compose up -d
   ```

---

## 🚀 Quick Start

### Windows (PowerShell):
```powershell
# Dry run (preview only, no import)
.\scripts\sync-from-cloudflare.ps1 -DryRun

# Full sync with backup
.\scripts\sync-from-cloudflare.ps1 -Backup

# Sync without backup
.\scripts\sync-from-cloudflare.ps1 -Backup:$false

# Use custom database name
.\scripts\sync-from-cloudflare.ps1 -CloudflareDB "my-custom-db"
```

### Linux/Mac (Bash):
```bash
# Dry run (preview only, no import)
./scripts/sync-from-cloudflare.sh --dry-run

# Full sync with backup
./scripts/sync-from-cloudflare.sh

# Sync without backup
./scripts/sync-from-cloudflare.sh --no-backup

# Use custom database name
./scripts/sync-from-cloudflare.sh --db my-custom-db
```

### Using NPM Scripts:
```bash
# Dry run
npm run sync:dry

# Full sync
npm run sync
```

---

## 📝 What Does It Do?

1. **Connects to Cloudflare** - Authenticates with your Cloudflare account
2. **Exports Data** - Downloads all student records from D1
3. **Backs Up PostgreSQL** - Creates a backup before importing (optional)
4. **Transforms Data** - Converts Cloudflare schema to PostgreSQL schema
5. **Imports Data** - Inserts students into PostgreSQL database

---

## 📂 Files Created

All exports and backups are saved locally:

```
student-management-system/
├── data-exports/
│   ├── students_2024-01-15_14-30-00.json  # Raw export from Cloudflare
│   ├── import_2024-01-15_14-30-00.sql     # Generated SQL for import
│   └── .gitkeep                            # (ignored by git)
└── backups/
    └── postgres_2024-01-15_14-30-00.sql    # PostgreSQL backup
```

**Note:** `data-exports/*.json` are ignored by git (configured in `.gitignore`), but SQL backups are kept for safety.

---

## 🔄 Data Transformation

The script automatically handles schema differences:

| Cloudflare D1 Field | PostgreSQL Field | Transformation |
|---------------------|------------------|----------------|
| `full_name` | `first_name`, `last_name` | Split by first space |
| N/A | `student_id` | Auto-generated: `ST12345` |
| N/A | `grade_id` | Defaults to "כיתה ז'" |
| N/A | `group_id` | Defaults to "קבוצה ראשית" |
| N/A | `status` | Set to `active` |

---

## ⚙️ Configuration

### Default Settings:
- **Cloudflare DB Name:** `math-tutor-db`
- **Backup:** Enabled by default
- **PostgreSQL Container:** `student_management_postgres`
- **Default Grade:** כיתה ז' (Grade 7)
- **Default Group:** קבוצה ראשית (Main Group)

### Customization:

**Windows:**
```powershell
$env:CLOUDFLARE_DB = "my-custom-db"
.\scripts\sync-from-cloudflare.ps1
```

**Linux/Mac:**
```bash
export CLOUDFLARE_DB="my-custom-db"
./scripts/sync-from-cloudflare.sh
```

---

## 🛡️ Safety Features

### 1. Backup Before Import
- Creates full PostgreSQL dump before any changes
- Stored in `backups/` directory with timestamp
- Can be disabled with `-Backup:$false` (PowerShell) or `--no-backup` (Bash)

### 2. Dry Run Mode
- Preview export without importing
- Useful for testing connection and data
- No changes to database

### 3. Transaction Safety
- All SQL operations wrapped in `BEGIN`/`COMMIT`
- Rollback on error
- Atomic imports

### 4. Duplicate Prevention
- Uses `ON CONFLICT` clauses
- Updates existing records
- Won't create duplicates

---

## 🔍 Troubleshooting

### Issue: "Wrangler not installed"
**Solution:**
```bash
npm install -g wrangler
```

### Issue: "Not authenticated to Cloudflare"
**Solution:**
```bash
wrangler login
```
Follow the browser prompts to authenticate.

### Issue: "PostgreSQL not running"
**Solution:**
```bash
cd backend
docker-compose up -d
```
Wait 10-15 seconds for PostgreSQL to start.

### Issue: "Docker not found"
**Solution:**
1. Install Docker Desktop
2. Start Docker Desktop
3. Wait for it to be ready
4. Retry sync

### Issue: "Import failed"
**Solution:**
1. Check PostgreSQL logs:
   ```bash
   docker logs student_management_postgres
   ```
2. Verify database exists:
   ```bash
   docker exec -it student_management_postgres psql -U postgres -l
   ```
3. Restore from backup if needed:
   ```bash
   cat backups/postgres_TIMESTAMP.sql | docker exec -i student_management_postgres psql -U postgres -d student_management
   ```

---

## 🔄 Regular Sync Workflow

### Recommended Schedule:
- **Daily:** Sync new student data
- **Weekly:** Full backup + sync
- **Monthly:** Verify data integrity

### Automation (Optional):

**Windows Task Scheduler:**
```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "pwsh" -Argument "-File C:\path\to\scripts\sync-from-cloudflare.ps1 -Backup"
$trigger = New-ScheduledTaskTrigger -Daily -At "2:00AM"
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "StudentSync"
```

**Linux Cron:**
```bash
# Edit crontab
crontab -e

# Add daily sync at 2 AM
0 2 * * * cd /path/to/student-management-system && ./scripts/sync-from-cloudflare.sh
```

---

## 📊 Monitoring

### Check Last Sync:
```bash
# List recent exports
ls -lt data-exports/*.json | head -5

# Check last backup
ls -lt backups/*.sql | head -5
```

### Verify Import:
```bash
# Count students in PostgreSQL
docker exec student_management_postgres psql -U postgres -d student_management -c "SELECT COUNT(*) FROM students;"

# Check recent students
docker exec student_management_postgres psql -U postgres -d student_management -c "SELECT * FROM students ORDER BY created_at DESC LIMIT 10;"
```

---

## 🔒 Security Notes

1. **Credentials:** Never commit `.env` files or backups to git
2. **Backups:** Store securely, contain sensitive data
3. **Cloudflare Token:** Keep Wrangler auth tokens private
4. **Database Access:** Use strong passwords in production

---

## 📞 Support

If you encounter issues:
1. Check logs in `data-exports/` and `backups/`
2. Review error messages carefully
3. Restore from backup if needed
4. Contact system administrator

---

**Last Updated:** 2024-01-27  
**Maintained by:** Yaniv Raz
