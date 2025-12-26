# 🔄 סטטוס סנכרון אוטומטי ל-GitHub

## ✅ מנגנון הסנכרון

### 1. **סנכרון אוטומטי ב-DataStore**
- כל קריאה ל-`DataStore.save()` מפעילה אוטומטית את `triggerGitSync()`
- נוצר marker ב-localStorage: `gitSyncMarker`
- נשלח event: `dataSaved`

### 2. **Background Watcher (auto-sync-watcher.js)**
- רץ ברקע כל 3 שניות
- בודק אם יש marker חדש
- מבצע: `git add`, `git commit`, `git push`

### 3. **קבצים שנשמרים אוטומטית:**
- `*.html` - כל קבצי HTML
- `*.js` - כל קבצי JavaScript
- `.md` - קבצי תיעוד
- `.gitignore`, `package.json`

### 4. **קבצים שמוחרגים:**
- `.sync-marker.json` - marker זמני
- `.last-sync.txt` - לוג סנכרון
- `node_modules/` - תלויות
- קבצי לוג וזמניים

## 🔍 בדיקת סטטוס

### בדיקה ידנית:
```bash
git status
git remote -v
```

### בדיקת סנכרון:
```bash
# בדוק אם יש שינויים שלא נדחפו
git log origin/main..HEAD

# בדוק את ה-remote
git remote show origin
```

## ⚙️ הפעלת סנכרון אוטומטי

### דרך Node.js:
```bash
npm start
# או
node auto-sync-watcher.js
```

### דרך PowerShell:
```powershell
.\auto-sync-watcher.ps1
```

## 📋 רשימת פעולות שמפעילות סנכרון:

1. ✅ שמירת תלמיד (עריכה, הוספה)
2. ✅ שמירת ציון
3. ✅ העלאת תמונה/קובץ
4. ✅ מחיקת קובץ
5. ✅ עדכון שם תלמיד
6. ✅ הוספת עמודת ציון
7. ✅ עדכון הערות
8. ✅ כל שינוי בנתונים

## 🎯 איך זה עובד:

1. משתמש מבצע פעולה (למשל: שינוי ציון)
2. `DataStore.save()` נקרא
3. `triggerGitSync()` יוצר marker
4. Background watcher מזהה את ה-marker
5. Watcher מבצע `git add`, `commit`, `push`
6. השינויים נדחפים ל-GitHub
7. GitHub Pages מתעדכן אוטומטית (תוך 1-2 דקות)

## ⚠️ הערות חשובות:

- הסנכרון עובד רק אם ה-watcher רץ ברקע
- צריך להיות מחובר ל-GitHub (git config)
- צריך הרשאות push ל-repository
- GitHub Pages מתעדכן אוטומטית אחרי push

---

**נוצר:** $(Get-Date -Format "yyyy-MM-dd HH:mm")
**סטטוס:** ✅ פעיל

