# 🔄 מדריך סנכרון מ-math-tutor-app

## 🔗 קישור למאגר math-tutor-app

**📦 הורד את math-tutor-app מכאן:**  
👉 [https://github.com/yanivmizrachiy/math-tutor-app](https://github.com/yanivmizrachiy/math-tutor-app)

```bash
# שכפל את המאגר
git clone https://github.com/yanivmizrachiy/math-tutor-app.git
cd math-tutor-app
```

## מה זה?

אם יש לך את הפרויקט **math-tutor-app** עם נתונים ב-Cloudflare D1, אתה יכול לייבא אותם ל-**student-management-system** באופן אוטומטי!

## דרישות מוקדמות

1. ✅ **math-tutor-app** שכפול מ-GitHub או קיים במחשב
2. ✅ **Wrangler CLI** מותקן (`npm install -g wrangler`)
3. ✅ מחובר ל-Cloudflare (`wrangler login`)
4. ✅ **student-management-system** מוכן (PostgreSQL רץ)

## אופציות סנכרון

### 1️⃣ סנכרון אוטומטי מלא (מומלץ!)

```powershell
.\FIX_AND_START.ps1 --sync
```

זה עושה **הכל**:
- מסנכרן נתונים מ-Cloudflare
- מתקין תלויות
- מפעיל PostgreSQL
- מפעיל Backend + Frontend
- פותח דפדפן

### 2️⃣ סנכרון ידני

```powershell
.\scripts\sync-from-cloudflare.ps1
```

**אופציות:**
```powershell
# Dry run (בדיקה בלבד)
.\scripts\sync-from-cloudflare.ps1 -DryRun

# ללא גיבוי
.\scripts\sync-from-cloudflare.ps1 -SkipBackup

# נתיב מותאם
.\scripts\sync-from-cloudflare.ps1 -MathTutorPath "C:\Projects\math-tutor-app"
```

### 3️⃣ Linux/Mac

```bash
./scripts/sync-from-cloudflare.sh ../math-tutor-app
```

## מה קורה בתהליך?

```
🔍 1. בודק Wrangler CLI
🔍 2. מתחבר ל-Cloudflare
📥 3. מייצא נתונים (students, lessons, payments, receipts, settings)
💾 4. יוצר גיבוי של המסד הנוכחי
🔄 5. ממיר נתונים לפורמט PostgreSQL
✅ 6. מכניס למסד הנתונים
```

## מבנה הנתונים המיוצאים

```
data-exports/
├── students.json      # כל התלמידים
├── lessons.json       # כל השיעורים
├── payments.json      # כל התשלומים
├── receipts.json      # כל הקבלות
└── settings.json      # הגדרות

backups/
└── backup_2026-01-27_15-30-00.sql  # גיבוי אוטומטי

backend/migrations/
└── 20260127_153000_import_from_math_tutor.sql  # SQL migration
```

## המרת נתונים

הסקריפט ממיר אוטומטית:

| math-tutor-app | → | student-management-system |
|----------------|---|---------------------------|
| `students.full_name` | → | `students.first_name` + `students.last_name` |
| `students.phone` | → | מיובא אך לא מוכנס כרגע (דורש סכמה מורחבת) |
| `students.notes` | → | מיובא אך לא מוכנס כרגע (דורש סכמה מורחבת) |

**הערה:** הגרסה הנוכחית מייבאת רק תלמידים. ייבוא של שיעורים, תשלומים וקבלות יתווסף בגרסאות עתידיות.

## פתרון בעיות

### ❌ "Wrangler לא מותקן"
```bash
npm install -g wrangler
```

### ❌ "לא מחובר ל-Cloudflare"
```bash
wrangler login
```

### ❌ "math-tutor-db לא נמצא"
הנתונים אולי רק מקומיים. הסקריפט ינסה מצב `--local` אוטומטית.

### ❌ "PostgreSQL לא רץ"
```powershell
cd backend
docker-compose up -d
```

### ❌ "שגיאה בהכנסת נתונים"
1. בדוק את הלוגים
2. הרץ `npm run check` לבדיקת המערכת
3. בדוק את ה-migration script ב-`backend/migrations/`

## גיבוי והחזרה

### לשחזר גיבוי:
```bash
docker exec -i student_management_postgres psql -U postgres -d student_management < backups/backup_TIMESTAMP.sql
```

### לנקות ולהתחיל מחדש:
```powershell
# מחיקת כל הנתונים
docker exec student_management_postgres psql -U postgres -d student_management -c "TRUNCATE students, grades, groups CASCADE;"

# סנכרון מחדש
.\scripts\sync-from-cloudflare.ps1
```

## טיפים

💡 **תמיד הרץ Dry Run קודם!**
```powershell
.\scripts\sync-from-cloudflare.ps1 -DryRun
```

💡 **גיבויים אוטומטיים נשמרים ב-`backups/`**

💡 **הסקריפט בטוח - משתמש ב-transactions ויוצר גיבויים אוטומטיים**

💡 **הנתונים המקוריים ב-Cloudflare לא נוגעים!**

💡 **הגרסה הנוכחית מייבאת תלמידים בלבד - ייבוא נתונים נוספים יתווסף בעתיד**

## תמיכה

אם יש בעיה:
1. הרץ עם `-DryRun` כדי לראות מה יקרה
2. בדוק את הלוגים בקונסול
3. בדוק את ה-`data-exports/` לוודא שהנתונים יוצאו
4. בדוק את ה-migration script

**Managed by Yaniv Raz**
