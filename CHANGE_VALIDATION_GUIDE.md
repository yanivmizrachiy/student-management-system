# מנגנון בדיקת שינויים - Change Validation Guide

## מטרה
למנוע שבירת פונקציונליות קיימת כאשר מבצעים תיקונים או שינויים בקוד.

## איך זה עובד

### 1. לפני כל שינוי חשוב
לפני ביצוע שינוי בקובץ, יש להריץ:
```bash
python pre-change-validator.py before layer.html
```

זה ייצור:
- ✅ Snapshot של הקובץ הנוכחי
- ✅ בדיקת מבנה בסיסי
- ✅ בדיקת תלויות
- ✅ רשימת אזהרות

### 2. אחרי השינוי
אחרי ביצוע השינוי, יש להריץ:
```bash
python pre-change-validator.py after layer.html <snapshot_file>
```

זה יבדוק:
- ✅ שהמבנה עדיין תקין
- ✅ שהתלויות עדיין קיימות
- ✅ השוואה עם המצב הקודם

### 3. Checklist לפני כל שינוי

#### לפני שינוי ב-layer.html:
- [ ] בדיקה שהפונקציה `getLayerFromURL()` עדיין קיימת
- [ ] בדיקה ש-`renderPage()` נקראת
- [ ] בדיקה ש-`DataStore.load(true)` נקרא
- [ ] בדיקה ש-`groupsGrid` אלמנט קיים
- [ ] בדיקה ש-`layerTitle` אלמנט קיים
- [ ] בדיקה שכל ה-scripts נטענים: `data.js`, `shared-utils.js`, `auto-load-data.js`, `live-reload.js`
- [ ] בדיקה שכל הקישורים ל-group.html נכונים
- [ ] בדיקה שאין קישורים כפולים או מיותרים

#### לפני שינוי ב-index.html:
- [ ] בדיקה ש-`updateCounts()` פונקציה קיימת
- [ ] בדיקה ש-`count7`, `count8`, `count9` אלמנטים קיימים
- [ ] בדיקה ש-`DataStore.load(true)` נקרא
- [ ] בדיקה שהמונים מתעדכנים
- [ ] בדיקה שכל ה-scripts נטענים

#### לפני שינוי ב-data.js:
- [ ] בדיקה שכל הפונקציות הקריטיות עדיין קיימות:
  - `load()`, `save()`, `getLayerCount()`, `getGroupCount()`, `getGroupsByLayer()`, `getTeacher()`, `getLayerName()`, `getLayerColor()`
- [ ] בדיקה שהפורמט של localStorage לא השתנה
- [ ] בדיקה שהתאימות לאחור נשמרת

#### לפני שינוי ב-shared-utils.js:
- [ ] בדיקה שכל הפונקציות עדיין קיימות:
  - `escapeHtml()`, `getURLParameter()`, `formatClassName()`, `renderBreadcrumbs()`
- [ ] בדיקה ש-`window.SharedUtils` עדיין מוגדר

### 4. בדיקות אוטומטיות

#### בדיקה בודדת:
```bash
python pre-change-validator.py before <file_path>
```

#### בדיקה אחרי שינוי:
```bash
python pre-change-validator.py after <file_path> <snapshot_file>
```

### 5. כללי זהירות

1. **תמיד לבדוק לפני ואחרי שינוי גדול**
2. **לא למחוק פונקציות בלי לבדוק איפה הן בשימוש**
3. **לא לשנות שמות משתנים/פונקציות בלי לבדוק את כל הקבצים**
4. **לא לשנות את המבנה של localStorage בלי תאימות לאחור**
5. **תמיד לשמור את ה-snapshots במקרה שצריך לחזור**

### 6. דוגמה לעבודה נכונה

```bash
# 1. לפני השינוי - יצירת snapshot
python pre-change-validator.py before layer.html

# 2. מבצעים את השינוי בקובץ

# 3. אחרי השינוי - בדיקה
python pre-change-validator.py after layer.html .change-snapshots/layer_20241201_120000_abc12345.snapshot

# 4. אם הכל תקין - ממשיכים
# אם יש בעיות - בודקים מה השתנה ומוודאים שלא שברנו כלום
```

### 7. בדיקות ידניות נוספות

אחרי כל שינוי, יש לבדוק ידנית:
- ✅ שהדף נטען בלי שגיאות בקונסול
- ✅ שהפונקציונליות הבסיסית עובדת
- ✅ שהעיצוב לא השתנה (אלא אם כן זה היה המטרה)
- ✅ שאין שגיאות JavaScript

### 8. חזרה לשינוי קודם

אם צריך לחזור לגרסה קודמת:
```bash
# מצא את ה-snapshot הרלוונטי
ls .change-snapshots/

# שחזר את הקובץ
python -c "
import json
with open('.change-snapshots/<snapshot_file>', 'r', encoding='utf-8') as f:
    snapshot = json.load(f)
with open('<file_path>', 'w', encoding='utf-8') as f:
    f.write(snapshot['content'])
"
```

## סיכום

**תמיד לזכור:**
1. ✅ בדיקה לפני שינוי
2. ✅ בדיקה אחרי שינוי
3. ✅ בדיקה ידנית בדפדפן
4. ✅ שמירת snapshots
5. ✅ בדיקת תלויות

**אל תשכח:** שינוי קטן יכול לשבור פונקציונליות חשובה!

