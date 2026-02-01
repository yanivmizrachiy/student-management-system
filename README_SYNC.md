# 🔄 מדריך סנכרון נתונים מ-Cloudflare D1

## סקירה כללית

מערכת הסנכרון מאפשרת לך לייבא **מאות תלמידים** מ-**math-tutor-app** (Cloudflare D1) ל-**student-management-system** (PostgreSQL) בקלות.

---

## 🚀 שימוש מהיר

### הפעלה עם סנכרון (מומלץ):
```powershell
.\FIX_AND_START.ps1 -Sync
```

זה יעשה **הכל**:
1. ✅ יתחבר ל-Cloudflare
2. ✅ ייצא תלמידים מ-D1
3. ✅ יצור גיבוי אוטומטי
4. ✅ יייבא ל-PostgreSQL
5. ✅ יפעיל את המערכת

### בדיקה לפני ייבוא (Dry Run):
```powershell
.\FIX_AND_START.ps1 -Sync -DryRun
```

רק בודק מה יקרה, **לא משנה כלום**.

### סנכרון בלבד (ללא הפעלה):
```powershell
.\scripts\sync-from-cloudflare.ps1 -Backup
```

**Linux/Mac:**
```bash
./scripts/sync-from-cloudflare.sh --backup
```

---

## 📋 דרישות מוקדמות

1. **Wrangler CLI מותקן:**
   ```bash
   npm install -g wrangler
   ```

2. **חשבון Cloudflare מחובר:**
   ```bash
   wrangler login
   ```

3. **Database math-tutor-db קיים:**
   - ודא שיש לך את ה-database ב-Cloudflare
   - בדוק עם: `wrangler d1 list`

---

## 🔒 בטיחות

### גיבוי אוטומטי
כל סנכרון יוצר גיבוי של PostgreSQL:
```
backups/postgres_backup_2026-01-27_14-30-00.sql
```

### שחזור מגיבוי
```powershell
Get-Content backups/postgres_backup_XXX.sql | docker exec -i student_management_postgres psql -U postgres student_management
```

**Linux/Mac:**
```bash
cat backups/postgres_backup_XXX.sql | docker exec -i student_management_postgres psql -U postgres student_management
```

### Dry Run Mode
בדוק מה יקרה **בלי לשנות כלום**:
```powershell
.\scripts\sync-from-cloudflare.ps1 -DryRun
```

**Linux/Mac:**
```bash
./scripts/sync-from-cloudflare.sh --dry-run
```

---

## 📁 קבצים שנוצרים

```
student-management-system/
├── data-exports/
│   ├── students_2026-01-27_14-30-00.json ← נתונים מ-Cloudflare
│   └── import_2026-01-27_14-30-00.sql   ← SQL לייבוא
├── backups/
│   └── postgres_backup_2026-01-27_14-30-00.sql ← גיבוי
```

---

## 🔄 תהליך הסנכרון

```
Cloudflare D1 (math-tutor-app)
         ↓
    [Export JSON]
         ↓
  [Transform Data]
         ↓
 [Generate SQL]
         ↓
[Backup PostgreSQL] ← גיבוי!
         ↓
[Import to PostgreSQL]
         ↓
      ✅ Done!
```

---

## ❓ פתרון בעיות

### ❌ "Wrangler לא מותקן"
```bash
npm install -g wrangler
```

### ❌ "לא מחובר ל-Cloudflare"
```bash
wrangler login
```

### ❌ "Database לא נמצא"
ודא שה-database קיים:
```bash
wrangler d1 list
```

אם לא קיים, צור אותו:
```bash
cd math-tutor-app/worker
wrangler d1 create math-tutor-db
```

### ❌ "PostgreSQL לא רץ"
הסקריפט יפעיל אותו אוטומטית.
אם לא עובד:
```bash
cd backend
docker-compose up -d
```

---

## 🎯 שאלות נפוצות

**Q: הנתונים הקיימים יימחקו?**  
A: לא! הסקריפט עושה `ON CONFLICT DO UPDATE` - רק מעדכן או מוסיף.

**Q: אפשר להריץ כמה פעמים?**  
A: כן! הסקריפט idempotent - אפשר להריץ שוב ושוב.

**Q: מה קורה אם יש שגיאה?**  
A: הכל ב-transaction - אם נכשל, לא משנה כלום.

**Q: איך מוודאים שהכל עבד?**  
A: פתח את האפליקציה ב-http://localhost:8080 ותראה את כל התלמידים!

---

## 🔧 שימוש מתקדם

### סנכרון ללא גיבוי (לא מומלץ):
```powershell
.\scripts\sync-from-cloudflare.ps1
```

### ייצוא בלבד (לא מייבא):
```powershell
.\scripts\sync-from-cloudflare.ps1 -DryRun
```

**Linux/Mac:**
```bash
./scripts/sync-from-cloudflare.sh --dry-run
```

### גיבוי ידני:
```powershell
docker exec student_management_postgres pg_dump -U postgres student_management > my_backup.sql
```

---

## 🌍 תמיכה בפלטפורמות

- ✅ **Windows** - סקריפט PowerShell (sync-from-cloudflare.ps1)
- ✅ **Linux** - סקריפט Bash (sync-from-cloudflare.sh)
- ✅ **macOS** - סקריפט Bash (sync-from-cloudflare.sh)

---

**נוצר אוטומטית על ידי Copilot** 🤖
